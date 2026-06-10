const firebaseConfig = {
    apiKey: "AIzaSyDCYnbAcV0HtrSyRUorBQmXQuBJO7m1C4A",
    authDomain: "zerobaba-7733e.firebaseapp.com",
    databaseURL: "https://zerobaba-7733e-default-rtdb.firebaseio.com/",
    projectId: "zerobaba-7733e",
    storageBucket: "zerobaba-7733e.firebasestorage.app",
    messagingSenderId: "20311065718",
    appId: "1:20311065718:web:5e50f0ad492d57f2518b57"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentRoomId = null;
let isIAmOwner = false;
let myPlayerKey = null;
let myUsername = "لاعب_" + Math.floor(Math.random() * 999);

function createRoomAction() {
    const name = document.getElementById('newRoomName').value || "روم جديدة";
    const roomRef = db.ref('rooms').push();
    currentRoomId = roomRef.key;
    
    roomRef.set({ name: name, owner: myUsername, status: "waiting" }).then(() => {
        const pRef = db.ref(`rooms/${currentRoomId}/players`).push();
        myPlayerKey = pRef.key;
        pRef.set({ name: myUsername, role: "Owner" });
        enterRoom(currentRoomId, true);
    });
}

function enterRoom(roomId, isOwner) {
    currentRoomId = roomId;
    isIAmOwner = isOwner;
    document.getElementById('lobbyScreen').classList.remove('active-screen');
    document.getElementById('roomScreen').classList.add('active-screen');
    if(isOwner) document.getElementById('ownerControls').style.display = "block";
}

function startGameAction() {
    db.ref(`rooms/${currentRoomId}/status`).set("playing");
}

function leaveRoomAction() {
    if(isIAmOwner) db.ref(`rooms/${currentRoomId}`).remove();
    else db.ref(`rooms/${currentRoomId}/players/${myPlayerKey}`).remove();
    location.reload();
}