const firebaseConfig = {
    apiKey: "AIzaSyDCYnbAcV0HtrSyRUorBQmXQuBJO7m1C4A",
    databaseURL: "https://zerobaba-7733e-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomId = null;
let playerName = "لاعب_" + Math.floor(Math.random() * 999);

function createRoom() {
    const name = document.getElementById('roomName').value;
    const ref = db.ref('rooms').push();
    roomId = ref.key;
    ref.set({ name: name, status: "waiting", host: playerName });
    
    document.getElementById('lobby').classList.remove('active-screen');
    document.getElementById('gameRoom').classList.add('active-screen');
    document.getElementById('roomTitle').innerText = name;
    document.getElementById('startBtn').style.display = "block";
}

function startGame() {
    // 1. نظام توزيع الأدوار العشوائي
    const roles = ["الحرامي", "البنك", "العسكري"];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    // 2. تحديث الحالة في الفايربيز للجميع
    db.ref(`rooms/${roomId}`).update({ status: "playing" });
    document.getElementById('roleBox').innerText = "دورك هو: " + randomRole;
    
    // 3. التايمر
    let time = 60;
    let timer = setInterval(() => {
        time--;
        document.getElementById('timer').innerText = "الوقت المتبقي: " + time;
        if(time <= 0) { clearInterval(timer); alert("انتهت الجولة!"); }
    }, 1000);
}
