const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// الرابط الخاص بقاعدة البيانات (يفضل وضعه في Railway كـ Variable)
const MONGO_URI = process.env.MONGO_URI || 'ضع_رابطك_هنا_في_الـ_Variables';

mongoose.connect(MONGO_URI)
    .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح!'))
    .catch(err => console.error('فشل الاتصال:', err));

// تعريف شكل البيانات
const scoreSchema = new mongoose.Schema({
    username: String,
    score: Number
});
const Score = mongoose.model('Score', scoreSchema);

// مسار حفظ النتيجة
app.post('/save-score', async (req, res) => {
    try {
        const { username, score } = req.body;
        const newScore = new Score({ username, score });
        await newScore.save();
        res.status(201).send({ message: 'تم حفظ النتيجة بنجاح!' });
    } catch (error) {
        res.status(500).send({ message: 'خطأ في حفظ البيانات' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل على البورت ${PORT}`));
