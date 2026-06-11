const firebaseConfig = {
    apiKey: "AIzaSyDCYnbAcV0HtrSyRUorBQmXQuBJO7m1C4A",
    databaseURL: "https://zerobaba-7733e-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomId = null;
let myName = "لاعب_" + Math.floor(Math.random() * 999);

function createRoom() {
    roomId = db.ref('rooms').push().key;
    db.ref(`rooms/${roomId}`).set({ name: document.getElementById('roomName').value, status: "waiting" });
    
    document.getElementById('lobby').classList.remove('active-screen');
    document.getElementById('gameRoom').classList.add('active-screen');
    document.getElementById('startBtn').style.display = "block";

    // المراقب الذكي: أي تغيير في حالة الروم هيحدث الشاشة فوراً
    db.ref(`rooms/${roomId}`).on('value', (snap) => {
        const data = snap.val();
        if(data.status === "playing") {
            document.getElementById('gameRoom').classList.remove('active-screen');
            document.getElementById('gamePlay').classList.add('active-screen');
            document.getElementById('myRole').innerText = "دورك هو: " + (data.players ? data.players[myName] : "جارٍ التحديد...");
        }
    });
}

function startGame() {
    const roles = ["الحرامي", "البنك", "العسكري"];
    let updates = { status: "playing", players: {} };
    updates.players[myName] = roles[Math.floor(Math.random() * roles.length)];
    
    // تحديث السيرفر بالكامل
    db.ref(`rooms/${roomId}`).update(updates);
}
