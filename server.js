const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// التعديل هنا: شلنا الـ ../ عشان السيرفر يلاقي فولدر public بتاعك
app.use(express.static(path.join(__dirname, 'public')));

// الربط بقاعدة البيانات (لا تضع الرابط هنا، تأكد أنه موجود في Railway Variables)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 متصل بنجاح بقاعدة بيانات MongoDB أونلاين!"))
  .catch(err => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// تعريف الـ Models (لا تغير هذه الأسطر)
const Player = mongoose.model('Player', new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 }
}));

const System = mongoose.model('System', new mongoose.Schema({
    key: { type: String, default: "main_system" },
    currentStory: String,
    hint: String,
    contactText: String,
    contactUrl: String
}));

// إجبار السيرفر على توجيه أي طلب للـ index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
