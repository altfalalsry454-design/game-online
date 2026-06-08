const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// التعديل هنا: شلنا الـ ../ عشان السيرفر يقرأ فولدر public مباشرة
app.use(express.static(path.join(__dirname, 'public')));

// 🔌 الربط بقاعدة البيانات (بياخد الرابط من Variables في Railway)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 متصل بنجاح بقاعدة بيانات MongoDB أونلاين!"))
  .catch(err => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// 📊 الجداول
const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 }
});
const Player = mongoose.model('Player', PlayerSchema);

const SystemSchema = new mongoose.Schema({
    key: { type: String, default: "main_system" },
    currentStory: { type: String },
    hint: { type: String },
    contactText: { type: String },
    contactUrl: { type: String }
});
const System = mongoose.model('System', SystemSchema);

// --- كل الـ API Routes الخاصة بك هنا ---
// (ضع هنا باقي أكواد الـ app.get والـ app.post الخاصة باللعبة)

// التعديل الأهم هنا: إجبار السيرفر على عرض ملف الـ HTML إذا لم يجد مساراً آخر
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
