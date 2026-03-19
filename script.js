import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! ئاگاداری: لێرە زانیارییە ڕاستەقینەکانی فایەربەیسەکەی خۆت دابنێ !!!
const firebaseConfig = {
  apiKey: "لێرە_کلیلەکە_دابنێ",
  authDomain: "my-clipboard-app.firebaseapp.com",
  databaseURL: "https://my-clipboard-app-default-rtdb.firebaseio.com",
  projectId: "my-clipboard-app",
  storageBucket: "my-clipboard-app.appspot.com",
  messagingSenderId: "لێرە_ژمارەکە_دابنێ",
  appId: "لێرە_ئایدی_ئەپەکە_دابنێ"
};

// دەستپێکردن
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, 'notes');

// کرداری کۆپی و پاشەکەوت بۆ سێرڤەر
window.saveAndCopy = function() {
    const input = document.getElementById('textInput');
    const text = input.value;

    if (text.trim() === "") {
        alert("تکایە دەقێک بنووسە");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        push(notesRef, {
            content: text,
            time: Date.now()
        });
        input.value = "";
    });
};

// سڕینەوەی تێبینی لە سێرڤەر
window.deleteNote = function(key) {
    if(confirm("ئایا دڵنیای لە سڕینەوە؟")) {
        const itemRef = ref(db, `notes/${key}`);
        remove(itemRef);
    }
};

// کاتێک تێبینییەکی نوێ دێت (یان لە کاتی کردنەوەی پەڕە)
onChildAdded(notesRef, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    addToList(data.content, key);
});

// کاتێک لە هەر ئامێرێک شتێک دەسڕێتەوە، لێرەش لایببات
onChildRemoved(notesRef, (snapshot) => {
    const key = snapshot.key;
    const element = document.getElementById(key);
    if (element) element.remove();
});

function addToList(text, key) {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    li.id = key; 
    
    li.innerHTML = `
        <div class="text-content">${text}</div>
        <div class="actions">
            <button class="copy-item-btn" onclick="copyAgain('${text.replace(/'/g, "\\'")}')">کۆپی</button>
            <button class="delete-btn" onclick="deleteNote('${key}')">سڕینەوە</button>
        </div>
    `;
    
    list.prepend(li);
}

window.copyAgain = function(text) {
    navigator.clipboard.writeText(text);
    alert("کۆپی کرایەوە");
};
