const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل الملفات الثابتة (الـ Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// 🔌 الربط بقاعدة البيانات (استبدل السطر اللي تحت بالرابط بتاعك من MongoDB Atlas)
const MONGO_URI = process.env.MONGO_URI || "رابط_قاعدة_بياناتك_هنا";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 متصل بنجاح بقاعدة بيانات MongoDB أونلاين!"))
  .catch(err => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// 📊 تصميم جدول اللاعبين في قاعدة البيانات (Schema)
const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 }
});
const Player = mongoose.model('Player', PlayerSchema);

// 🔒 تصميم جدول نظام الموقع (القصة الحالية، التلميح، الباسورد، رابط التواصل)
const SystemSchema = new mongoose.Schema({
    key: { type: String, default: "main_system" },
    currentStory: { type: String, default: "هنا تظهر قصة اليوم الحالية..." },
    currentHint: { type: String, default: "التلميح الافتراضي" },
    currentPassword: { type: String, default: "مصر" },
    currentAuthor: { type: String, default: "الأدمن" },
    isSolvedToday: { type: Boolean, default: false },
    contactText: { type: String, default: "" },
    contactUrl: { type: String, default: "" },
    suggestedStories: { type: Array, default: [] }
});
const System = mongoose.model('System', SystemSchema);

// بادئ النظام الافتراضي لو مش موجود
async function initSystem() {
    let sys = await System.findOne({ key: "main_system" });
    if (!sys) {
        await System.create({ key: "main_system" });
    }
}
initSystem();

// --- 🌐 روابط الـ API (التي سيتكلم معها الـ Frontend) ---

// 1. فحص حالة اسم المستخدم (هل هو موجود؟)
app.post('/api/check-user', async (req, res) => {
    const { name } = req.body;
    const player = await Player.findOne({ name });
    res.json({ exists: !!player });
});

// 2. تسجيل دخول أو إنشاء حساب جديد بالباسورد
app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    let player = await Player.findOne({ name });
    
    if (player) {
        if (player.password === password) {
            return res.json({ success: true, player });
        } else {
            return res.json({ success: false, message: "wrong_password" });
        }
    } else {
        player = await Player.create({ name, password, points: 0 });
        return res.json({ success: true, player });
    }
});

// 3. جلب بيانات اللغز والنظام الحالي والتوب 100
app.get('/api/system-data', async (req, res) => {
    const sys = await System.findOne({ key: "main_system" });
    const players = await Player.find().sort({ points: -1 }).limit(100);
    res.json({ system: sys, leaderboard: players });
});

// 4. التحقق من حل اللغز وزيادة النقاط
app.post('/api/submit-answer', async (req, res) => {
    const { name, answer } = req.body;
    const sys = await System.findOne({ key: "main_system" });
    
    if (answer === sys.currentPassword) {
        if (!sys.isSolvedToday) {
            sys.isSolvedToday = true;
            await sys.save();
            
            const player = await Player.findOneAndUpdate({ name }, { $inc: { points: 10 } }, { new: true });
            return res.json({ status: "success", player });
        } else {
            return res.json({ status: "too_late" });
        }
    } else {
        return res.json({ status: "wrong" });
    }
});

// 5. إرسال قصة مقترحة من الفائز
app.post('/api/suggest-story', async (req, res) => {
    const { name, story, password } = req.body;
    const sys = await System.findOne({ key: "main_system" });
    sys.suggestedStories.push({ id: "story_" + Date.now(), sender: name, story, password });
    await sys.save();
    res.json({ success: true });
});

// 6. تحديث التحدي بواسطة الأدمن
app.post('/api/admin/publish', async (req, res) => {
    const { adminUser, adminPass, author, story, password, hint } = req.body;
    if (adminUser === "Zero" && adminPass === "15935700") {
        await System.findOneAndUpdate({ key: "main_system" }, {
            currentAuthor: author,
            currentStory: story,
            currentPassword: password,
            currentHint: hint,
            isSolvedToday: false
        });
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// 7. تحديث رابط التواصل بواسطة الأدمن
app.post('/api/admin/contact', async (req, res) => {
    const { adminUser, adminPass, text, url } = req.body;
    if (adminUser === "Zero" && adminPass === "15935700") {
        await System.findOneAndUpdate({ key: "main_system" }, { contactText: text, contactUrl: url });
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// 8. تعديل النقاط يدويًا أو حذف لاعب (الأدمن)
app.post('/api/admin/manage-player', async (req, res) => {
    const { adminUser, adminPass, targetName, action, amount } = req.body;
    if (adminUser === "Zero" && adminPass === "15935700") {
        if (action === "modify") {
            await Player.findOneAndUpdate({ name: targetName }, { $inc: { points: amount } });
        } else if (action === "delete") {
            await Player.findOneAndDelete({ name: targetName });
        }
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// 9. حذف قصة مقترحة من صندوق الوارد (الأدمن)
app.post('/api/admin/delete-suggested', async (req, res) => {
    const { adminUser, adminPass, storyId } = req.body;
    if (adminUser === "Zero" && adminPass === "15935700") {
        const sys = await System.findOne({ key: "main_system" });
        sys.suggestedStories = sys.suggestedStories.filter(s => s.id !== storyId);
        await sys.save();
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// تشغيل السرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 السرفر شغال أونلاين على بورت ${PORT}`));