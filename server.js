const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // مهم جداً لاستقبال البيانات

// تم تعديل المسار هنا ليصبح صحيحاً (public مباشرة)
app.use(express.static(path.join(__dirname, 'public')));

// الربط بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ متصل بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال:", err));

// تعريف الجداول
const Player = mongoose.model('Player', new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 }
}));

// API للتسجيل (تأكد أن الفرونت إيند يرسل البيانات لهذا المسار)
app.post('/api/register', async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
