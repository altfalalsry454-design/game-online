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

    // مراقبة حالة الروم
    db.ref(`rooms/${roomId}`).on('value', (snap) => {
        if(snap.val().status === "playing") {
            document.getElementById('gameRoom').classList.remove('active-screen');
            document.getElementById('gamePlay').classList.add('active-screen');
            document.getElementById('myRole').innerText = "تم توزيع الأدوار! دورك هو: " + (snap.val().roles?.[playerName] || "مراقب");
        }
    });
}

function startGame() {
    const roles = ["الحرامي", "البنك", "العسكري"];
    let gameRoles = {};
    gameRoles[playerName] = roles[Math.floor(Math.random() * roles.length)];
    
    db.ref(`rooms/${roomId}`).update({ 
        status: "playing",
        roles: gameRoles 
    });
}
