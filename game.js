<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>لعبة الحرامي والبنك - نسخة كاملة</title>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>
    <style>
        body { background: #0d1117; color: white; font-family: sans-serif; text-align: center; padding: 20px; }
        .screen { display: none; } 
        .active-screen { display: block; }
        .btn { padding: 15px; margin: 10px; cursor: pointer; border-radius: 8px; border: none; font-weight: bold; width: 220px; font-size: 16px; }
        .btn-green { background: #238636; color: white; }
        .btn-blue { background: #1f6feb; color: white; }
        .btn-red { background: #da3637; color: white; }
        input { padding: 12px; border-radius: 6px; border: 1px solid #30363d; background: #161b22; color: white; width: 200px; text-align: center; font-size: 16px; }
        .player-tag { background: #21262d; padding: 8px; margin: 5px; display: inline-block; border-radius: 6px; border: 1px solid #30363d; }
    </style>
</head>
<body>

    <div id="lobby" class="screen active-screen">
        <h1>لعبة الحرامي والبنك</h1>
        <input type="text" id="playerName" placeholder="اكتب اسمك هنا..." required><br><br>
        <input type="text" id="roomName" placeholder="اسم الروم المراد إنشاؤه أو دخوله..."><br>
        <button class="btn btn-green" onclick="joinOrCreateRoom()">دخول / إنشاء الروم</button>
    </div>
    
    <div id="gameRoom" class="screen">
        <h2 id="roomTitle"></h2>
        <div id="playerList" style="margin: 20px 0;"></div>
        <div id="statusText" style="color: #8b949e; margin-bottom: 20px;">في انتظار المالك لبدء اللعبة...</div>
        
        <div id="adminControls" style="display:none;">
            <button id="startBtn" class="btn btn-blue" onclick="startGame()">بدء توزيع الأدوار</button>
            <button class="btn btn-red" onclick="resetGame()">إعادة تعيين الروم</button>
        </div>
    </div>

    <div id="gamePlay" class="screen">
        <h2>دورك السري هو:</h2>
        <h1 id="myRole" style="color: #f1c40f; font-size: 50px; text-shadow: 0 0 10px rgba(241,196,15,0.5);"></h1>
        <br><br>
        <div id="adminResetOnly" style="display:none;">
            <button class="btn btn-red" onclick="resetGame()">جولة جديدة (للأدمن)</button>
        </div>
    </div>

    <script>
        // --- إعدادات الفايربيز (ضع روابط مشروعك هنا) ---
        const firebaseConfig = {
            databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/" // ضع رابط الـ Database الخاص بك هنا
        };
        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();

        // متغيرات اللاعب الحالية
        let currentRoom = "";
        let myName = "";

        // دالة الدخول أو إنشاء الروم
        function joinOrCreateRoom() {
            myName = document.getElementById('playerName').value.trim();
            currentRoom = document.getElementById('roomName').value.trim();

            if (!myName || !currentRoom) {
                alert("من فضلك اكتب اسمك واسم الروم أولاً!");
                return;
            }

            // فحص هل الروم موجود؟
            db.ref('rooms/' + currentRoom).once('value', (snapshot) => {
                if (!snapshot.exists()) {
                    // إذا كان الروم غير موجود، ننشئه ونعتبر هذا اللاعب هو الـ Host (الأدمن)
                    db.ref('rooms/' + currentRoom).set({
                        host: myName,
                        status: "waiting"
                    });
                }
                
                // إضافة اللاعب إلى قائمة اللاعبين في الروم
                db.ref('rooms/' + currentRoom + '/players/' + myName).set({
                    name: myName,
                    role: "لم يحدد بعد"
                });

                // الانتقال لشاشة الروم وتشغيل الرادار
                switchScreen('gameRoom');
                document.getElementById('roomTitle').innerText = "غرفة: " + currentRoom;
                listenToRoom();
            });
        }

        // الرادار (Listener) لمراقبة التحديثات في السيرفر فوراً
        function listenToRoom() {
            db.ref('rooms/' + currentRoom).on('value', (snapshot) => {
                const data = snapshot.val();
                if (!data) return;

                // 1. فحص هل أنا الأدمن؟ إظهار أزرار التحكم
                if (data.host === myName) {
                    document.getElementById('adminControls').style.display = "block";
                    document.getElementById('adminResetOnly').style.display = "block";
                } else {
                    document.getElementById('adminControls').style.display = "none";
                    document.getElementById('adminResetOnly').style.display = "none";
                }

                // 2. تحديث قائمة اللاعبين على الشاشة
                const playerListDiv = document.getElementById('playerList');
                playerListDiv.innerHTML = "<h3>اللاعبين المتواجدين الآن:</h3>";
                if (data.players) {
                    Object.keys(data.players).forEach((pName) => {
                        let isHost = (pName === data.host) ? " 👑 (المالك)" : "";
                        playerListDiv.innerHTML += `<span class="player-tag">${pName}${isHost}</span>`;
                    });
                }

                // 3. مراقبة حالة اللعبة (هل بدأت؟)
                if (data.status === "playing") {
                    switchScreen('gamePlay');
                    if (data.players && data.players[myName]) {
                        document.getElementById('myRole').innerText = data.players[myName].role;
                    }
                } else if (data.status === "waiting") {
                    switchScreen('gameRoom');
                }
            });
        }

        // دالة بدء اللعبة وتوزيع الأدوار (تشتغل عند الأدمن فقط)
        function startGame() {
            db.ref('rooms/' + currentRoom + '/players').once('value', (snapshot) => {
                const players = snapshot.val();
                if (!players) return;

                const playerNames = Object.keys(players);
                if (playerNames.length < 3) {
                    alert("يجب أن يكون هناك 3 لاعبين على الأقل لبدء اللعبة!");
                    return;
                }

                // الأدوار المتوفرة
                let roles = ["حرامي", "بنك", "عسكري"];
                
                // خلط الأدوار عشوائياً
                playerNames.sort(() => Math.random() - 0.5);

                // توزيع الأدوار في السيرفر
                playerNames.forEach((name, index) => {
                    let finalRole = roles[index] || "مواطن صالع"; // إذا زاد العدد عن 3
                    db.ref(`rooms/${currentRoom}/players/${name}`).update({
                        role: finalRole
                    });
                });

                // تغيير الحالة إلى playing ليدخل الجميع شاشة اللعب فوراً
                db.ref('rooms/' + currentRoom).update({
                    status: "playing"
                });
            });
        }

        // دالة إعادة تعيين الروم (Reset) لجولة جديدة
        function resetGame() {
            db.ref('rooms/' + currentRoom).update({
                status: "waiting"
            }).then(() => {
                // إعادة تصفير الأدوار القديمة
                db.ref('rooms/' + currentRoom + '/players').once('value', (snapshot) => {
                    const players = snapshot.val();
                    if(players) {
                        Object.keys(players).forEach((name) => {
                            db.ref(`rooms/${currentRoom}/players/${name}`).update({ role: "لم يحدد بعد" });
                        });
                    }
                });
            });
        }

        // دالة التنقل بين الشاشات
        function switchScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
            document.getElementById(screenId).classList.add('active-screen');
        }
    </script>
</body>
</html>
