import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! لێرە زانیارییە ڕاستەقینەکانی فایەربەیسەکەت دابنێ !!!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// فەنکشن بۆ ناسینەوەی لینک
function formatText(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" style="color: #1a73e8; text-decoration: underline;">${url}</a>`);
}

// کرداری کۆپی و پاشەکەوت
window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;
    if (text.trim() === "") return;

    // دروستکردنی کات و ڕێکەوت
    const now = new Date();
    const dateTime = now.toLocaleString('en-GB', { 
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
    });

    navigator.clipboard.writeText(text).then(() => {
        push(notesRef, { content: text, time: dateTime });
        input.value = "";
    });
};

// سڕینەوە لە سێرڤەر
window.deleteNote = function(key) {
    if(confirm("ئایا دڵنیای لە سڕینەوە؟")) {
        remove(ref(db, `notes/${key}`));
    }
};

// نیشاندان و Sync
onChildAdded(notesRef, (snapshot) => {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    const data = snapshot.val();
    li.id = snapshot.key;
    
    li.innerHTML = `
        <div class="note-header">
            <span class="timestamp">${data.time || ''}</span>
        </div>
        <div class="text-content">${formatText(data.content)}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${data.content.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${snapshot.key}')">سڕینەوە</button>
        </div>`;
    list.prepend(li);
});

onChildRemoved(notesRef, (snapshot) => {
    document.getElementById(snapshot.key)?.remove();
});

window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("کۆپی کرایەوە");
};

// Dark Mode Logic
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
});
