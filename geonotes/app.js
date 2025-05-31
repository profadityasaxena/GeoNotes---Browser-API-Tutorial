import { dbPromise } from './db.js';

const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");
const notesSection = document.getElementById("notesList");
let editingKey = null;

let draggedNoteId = null;

saveButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = noteInput.value.trim();

    if (!title || !content) return showToast("Please enter both a title and a note.");
    if (!navigator.geolocation) return showToast("Geolocation is not supported by your browser.");

    navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
            const note = {
                title,
                content,
                location: { latitude: coords.latitude, longitude: coords.longitude },
                timestamp: new Date().toISOString(),
            };

            const noteKey = editingKey || `note-${Date.now()}`;
            const db = await dbPromise;
            await db.put('notes', { ...note, id: noteKey });

            notifyUser(title);
            resetForm();
            showToast(`✅ Note saved at:\nLat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}`);
            loadNotes();
        },
        (error) => handleGeoError(error)
    );
});

function notifyUser(title) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
        new Notification("📌 Note Saved", { body: title });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") new Notification("📌 Note Saved", { body: title });
        });
    }
}

function resetForm() {
    titleInput.value = "";
    noteInput.value = "";
    editingKey = null;
    saveButton.textContent = "Save Note";
}

function handleGeoError(error) {
    const messages = {
        1: "❌ Location access denied by the user.",
        2: "❌ Location information is unavailable.",
        3: "⏳ Request to get user location timed out."
    };
    showToast(messages[error.code] || "⚠️ An unknown error occurred while fetching location.");
}

async function loadNotes() {
    const db = await dbPromise;
    const notes = await db.getAll('notes');
    notesSection.innerHTML = notes.length ? "" : "<p>No notes saved yet.</p>";
    notes.forEach(note => renderNoteCard(note));
}

function renderNoteCard(note) {
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.setAttribute("draggable", "true");
    noteCard.setAttribute("data-id", note.id);
    noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <small>📍 Lat: ${note.location.latitude.toFixed(5)}, Lng: ${note.location.longitude.toFixed(5)}</small><br/>
        <small>🕒 ${new Date(note.timestamp).toLocaleString()}</small>
        <div class="note-card-buttons">
            <button onclick="copyNoteContent('${note.title}', \`${note.content}\`)">Copy</button>
            <button onclick="editNote('${note.id}')">Edit</button>
            <button onclick="deleteNote('${note.id}')">Delete</button>
        </div>
    `;

    noteCard.addEventListener("dragstart", () => {
        draggedNoteId = note.id;
        noteCard.classList.add("dragging");
    });

    noteCard.addEventListener("dragover", (e) => {
        e.preventDefault();
        noteCard.classList.add("dragover");
    });

    noteCard.addEventListener("dragleave", () => {
        noteCard.classList.remove("dragover");
    });

    noteCard.addEventListener("drop", async () => {
        noteCard.classList.remove("dragover");
        if (draggedNoteId && draggedNoteId !== note.id) {
            const db = await dbPromise;
            const allNotes = await db.getAll('notes');
            const draggedIndex = allNotes.findIndex(n => n.id === draggedNoteId);
            const targetIndex = allNotes.findIndex(n => n.id === note.id);
            const reordered = [...allNotes];
            const [draggedNote] = reordered.splice(draggedIndex, 1);
            reordered.splice(targetIndex, 0, draggedNote);
            const tx = db.transaction('notes', 'readwrite');
            await tx.store.clear();
            for (let n of reordered) await tx.store.put(n);
            await tx.done;
            loadNotes();
        }
        draggedNoteId = null;
    });

    noteCard.addEventListener("dragend", () => {
        noteCard.classList.remove("dragging");
        draggedNoteId = null;
    });

    notesSection.appendChild(noteCard);
}

window.editNote = async function (id) {
    const db = await dbPromise;
    const note = await db.get('notes', id);
    if (!note) return;
    editingKey = note.id;
    document.getElementById("editTitle").value = note.title;
    document.getElementById("editNote").value = note.content;
    const modal = document.getElementById("editModal");
    modal.classList.add("show");
};

window.deleteNote = async function (id) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    const db = await dbPromise;
    await db.delete('notes', id);
    showToast("🗑️ Note deleted.");
    loadNotes();
};

window.copyNoteContent = function (title, content) {
    navigator.clipboard.writeText(`📌 ${title}\n\n${content}`)
        .then(() => showToast("📝 Note copied to clipboard!"))
        .catch(() => showToast("❌ Failed to copy note."));
};

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

const startVoiceBtn = document.getElementById("startVoice");

if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    startVoiceBtn.addEventListener("click", () => {
        recognition.start();
        showToast("🎙️ Listening... Speak your note.");
    });

    recognition.onresult = ({ results }) => {
        noteInput.value = results[0][0].transcript;
        showToast("✅ Voice captured!");
    };

    recognition.onerror = ({ error }) => {
        console.error("Speech recognition error:", error);
        showToast(`❌ Voice error: ${error}`);
    };
} else {
    startVoiceBtn.disabled = true;
    startVoiceBtn.textContent = "🎤 Not Supported";
    showToast("⚠️ Speech Recognition not supported on this browser.");
}

window.addEventListener("load", () => {
    loadNotes();
    initBatteryStatus();
});

document.getElementById("editForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const updatedTitle = document.getElementById("editTitle").value.trim();
    const updatedNote = document.getElementById("editNote").value.trim();
    if (!updatedTitle || !updatedNote) return showToast("Title and content cannot be empty.");
    const db = await dbPromise;
    const existing = await db.get('notes', editingKey);
    await db.put('notes', { ...existing, title: updatedTitle, content: updatedNote, timestamp: new Date().toISOString() });
    document.getElementById("editModal").classList.remove("show");
    editingKey = null;
    loadNotes();
});

document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editModal").classList.remove("show");
    editingKey = null;
});

function initBatteryStatus() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(battery => {
        const levelEl = document.getElementById('batteryLevel');
        const chargingEl = document.getElementById('chargingStatus');
        function updateBatteryInfo() {
            levelEl.textContent = Math.round(battery.level * 100);
            chargingEl.textContent = battery.charging ? "Charging ⚡" : "Discharging";
            if (battery.level <= 0.2 && !battery.charging) {
                showToast("⚠️ Low Battery! Consider saving your work.");
            }
        }
        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
    });
}