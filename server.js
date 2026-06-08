const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// --- تعديل هام: ضع رابط قاعدة بياناتك هنا مكان الرابط الطويل ---
const MONGO_URI = 'mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/myGameDB?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح!'))
    .catch(err => console.error('فشل الاتصال بقاعدة البيانات:', err));

// تعريف شكل البيانات (Schema)
const PlayerSchema = new mongoose.Schema({
    username: String,
    score: Number
});
const Player = mongoose.model('Player', PlayerSchema);

// مسار لحفظ النتيجة
app.post('/save-score', async (req, res) => {
    const { username, score } = req.body;
    const newPlayer = new Player({ username, score });
    await newPlayer.save();
    res.json({ message: 'تم حفظ النتيجة!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل على البورت ${PORT}`));
