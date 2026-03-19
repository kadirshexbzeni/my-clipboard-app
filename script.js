// لێرەوە دەست پێ دەکات: کاتێک پەڕەکە دەکرێتەوە تێبینییە کۆنەکان باردەکات
document.addEventListener('DOMContentLoaded', getLocalNotes);

function saveAndCopy() {
    const input = document.getElementById('textInput');
    const text = input.value;

    if (text.trim() === "") {
        alert("تکایە شتێک بنووسە!");
        return;
    }

    // کۆپی کردن بۆ ناو کلیپبۆرد
    navigator.clipboard.writeText(text).then(() => {
        addToList(text);
        saveLocalNotes(text); // پاشەکەوتکردن لە ناو میمۆری وێبگەڕ
        input.value = ""; 
        alert("کۆپی کرا و پاشەکەوت بوو!");
    });
}

function addToList(text) {
    const list = document.getElementById('copyList');
    const li = document.createElement('li');
    
    li.innerHTML = `
        <span>${text.substring(0, 30)}${text.length > 30 ? '...' : ''}</span>
        <button class="copy-item-btn" onclick="copyAgain('${text.replace(/'/g, "\\'")}')">کۆپی</button>
    `;
    
    list.prepend(li);
}

function copyAgain(text) {
    navigator.clipboard.writeText(text);
    alert("دووبارە کۆپی کرایەوە!");
}

// فەرمانەکانی پاشەکەوتکردن لە LocalStorage
function saveLocalNotes(note) {
    let notes;
    if (localStorage.getItem('notes') === null) {
        notes = [];
    } else {
        notes = JSON.parse(localStorage.getItem('notes'));
    }
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function getLocalNotes() {
    let notes;
    if (localStorage.getItem('notes') === null) {
        notes = [];
    } else {
        notes = JSON.parse(localStorage.getItem('notes'));
    }
    notes.forEach(function(note) {
        addToList(note);
    });
}
