import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// زانیارییەکانی فایەربەیسەکەی تۆ
const firebaseConfig = {
  apiKey: "AIzaSyC...", // لێرە کلیلی API خۆت دابنێ (لەناو ڕێکخستنی فایەربەیس هەیە)
  authDomain: "my-clipboard-app.firebaseapp.com",
  databaseURL: "https://my-clipboard-app-default-rtdb.firebaseio.com",
  projectId: "my-clipboard-app",
  storageBucket: "my-clipboard-app.appspot.com",
  messagingSenderId: "777...", // ژمارەی خۆت لێرە دابنێ
  appId: "1:777..." // ئایدی ئەپەکەت لێرە دابنێ
};

// دەستپێکردنی فایەربەیس
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// فەنکشن بۆ ئەوەی لینکەکان بە یەک کلیک بکرێنەوە
function formatText(text) {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" style="color: #1a73e8; text-decoration: underline;">${url}</a>`;
    });
}

// پاشەکەوتکردن و کۆپی کردن
window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;
    
    if (text.trim() === "") return;

    // دروستکردنی کات و ڕێکەوت
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('en-GB');
    const fullDateTime = timeStr + " - " + dateStr;

    // کۆپی کردن بۆ ناو کیبۆرد
    navigator.clipboard.writeText(text).then(() => {
        // ناردن بۆ فایەربەیس
        push(notesRef, { 
            content: text, 
            time: fullDateTime 
        });
        input.value = ""; // پاککردنەوەی شوێنی نووسینەکە
    }).catch(err => {
        console.error("کێشە لە کۆپی کردن هەبوو: ", err);
    });
};

// سڕینەوەی نۆتێک
window.deleteNote = function(key) {
    if(confirm("ئایا دڵنیای لە سڕینەوەی ئەم نۆتە؟")) {
        remove(ref(db, `notes/${key}`));
    }
};

// نیشاندانی نۆتەکان کاتێک زیاد دەبن یان لاپەڕە Refresh دەبێتەوە
onChildAdded(notesRef, (snapshot) => {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    const data = snapshot.val();
    li.id = snapshot.key;
    
    li.innerHTML = `
        <div class="note-header">
            <span class="timestamp">${data.time || 'پێشتر'}</span>
        </div>
        <div class="text-content">${formatText(data.content)}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${data.content.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${snapshot.key}')">سڕینەوە</button>
        </div>`;
    list.prepend(li); // نوێترین نۆت دەخاتە سەرەوە
});

// سڕینەوەی نۆتەکە لەسەر شاشە کاتێک لە داتابەیس دەسڕێتەوە
onChildRemoved(notesRef, (snapshot) => {
    const el = document.getElementById(snapshot.key);
    if(el) el.remove();
});

// دووبارە کۆپی کردنەوە
window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("کۆپی کرایەوە بۆ کیبۆردەکەت");
};

// سیستەمی ڕەنگی تاریک و ڕوون (Dark Mode)
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
