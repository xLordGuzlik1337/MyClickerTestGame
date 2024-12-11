import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, set, update, onValue, increment } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

// Ваши настройки Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAa6Qefgy6KMBOFPojltX7pz5rfToS7RiU",
    authDomain: "clickertestgithub.firebaseapp.com",
    databaseURL: "https://clickertestgithub-default-rtdb.firebaseio.com",
    projectId: "clickertestgithub",
    storageBucket: "clickertestgithub.firebasestorage.app",
    messagingSenderId: "691386513930",
    appId: "1:691386513930:web:5cac86dc91cf3edeba3df3"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Функция для регистрации пользователя
function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("usernameInput").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Сохраняем ник пользователя в базе данных
      set(ref(db, 'users/' + user.uid), {
        username: username,
        clicks: 0
      });

      // Отправляем письмо с подтверждением
      sendEmailVerification(user)
        .then(() => {
          alert("Письмо с подтверждением отправлено на вашу почту!");
        })
        .catch((error) => {
          console.error("Ошибка при отправке письма с подтверждением: ", error);
        });

      alert("Вы успешно зарегистрированы!");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Ошибка: " + errorMessage);
    });
}

// Функция для входа пользователя
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Вы успешно вошли!");
      
      // Устанавливаем имя пользователя в интерфейсе
      document.getElementById("username").textContent = user.email;

      // Получаем количество кликов из базы данных
      const userRef = ref(db, 'users/' + user.uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        document.getElementById("myClicks").textContent = data.clicks || 0;
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Ошибка: " + errorMessage);
    });
}

// Функция для обработки кликов
function handleClick() {
  const user = auth.currentUser;

  if (user) {
    const userRef = ref(db, 'users/' + user.uid);
    
    // Увеличиваем количество кликов в базе данных
    update(userRef, { clicks: increment(1) });

    // Обновляем количество кликов в интерфейсе
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      document.getElementById("myClicks").textContent = data.clicks || 0;
    });
  }
}

// Обновляем рейтинг пользователей
const leaderboard = document.getElementById("leaderboard");
onValue(ref(db, "users"), (snapshot) => {
  const users = snapshot.val();
  const sortedUsers = Object.values(users || {}).sort((a, b) => b.clicks - a.clicks);
  
  leaderboard.innerHTML = "";
  sortedUsers.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${user.username}</td><td>${user.clicks}</td>`;
    leaderboard.appendChild(row);
  });
});

// Привязка функций к кнопкам
document.getElementById("registerButton").addEventListener("click", registerUser);
document.getElementById("loginButton").addEventListener("click", loginUser);
document.getElementById("clickButton").addEventListener("click", handleClick);
