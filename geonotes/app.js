// ------------------------------
// IndexedDB Wrapper
// ------------------------------
import { dbPromise } from './db.js';

// ------------------------------
// Element References
// ------------------------------
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");
const notesSection = document.getElementById("notesList");
let editingKey = null;

// ------------------------------
// Save or Update Note (with Geolocation)
// ------------------------------
saveButton.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const content = noteInput.value.trim();

  if (!title || !content) {
    showToast("Please enter both a title and a note.");
    return;
  }

  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      const note = {
        title,
        content,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      };

      const noteKey = editingKey || `note-${Date.now()}`;

      try {
        const db = await dbPromise;
        await db.put('notes', { ...note, id: noteKey });
        console.log("✅ Note saved to IndexedDB:", note);

        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("📌 Note Saved", { body: title });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((perm) => {
              if (perm === "granted") {
                new Notification("📌 Note Saved", { body: title });
              }
            });
          }
        }

        // Reset form
        titleInput.value = "";
        noteInput.value = "";
        editingKey = null;
        saveButton.textContent = "Save Note";

        showToast(`✅ Note saved at:\nLat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
        loadNotes();
      } catch (err) {
        console.error("Error saving note to IndexedDB", err);
        showToast("❌ Failed to save note.");
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showToast("❌ Location access denied by the user.");
          break;
        case error.POSITION_UNAVAILABLE:
          showToast("❌ Location information is unavailable.");
          break;
        case error.TIMEOUT:
          showToast("⏳ Request to get user location timed out.");
          break;
        default:
          showToast("⚠️ An unknown error occurred while fetching location.");
      }
    }
  );
});

// ------------------------------
// Load & Render Notes from IndexedDB
// ------------------------------
async function loadNotes() {
  const db = await dbPromise;
  const notes = await db.getAll('notes');

  notesSection.innerHTML = notes.length === 0
    ? "<p>No notes saved yet.</p>"
    : "";

  notes
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach(note => {
      const noteCard = document.createElement("div");
      noteCard.className = "note-card";
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
      notesSection.appendChild(noteCard);
    });
}

// ------------------------------
// Edit Note
// ------------------------------
async function editNote(id) {
  const db = await dbPromise;
  const note = await db.get('notes', id);

  if (note) {
    titleInput.value = note.title;
    noteInput.value = note.content;
    editingKey = note.id;
    saveButton.textContent = "Update Note";
    showToast("✏️ Edit mode enabled");
  }
}
window.editNote = editNote;

// ------------------------------
// Delete Note
// ------------------------------
async function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    const db = await dbPromise;
    await db.delete('notes', id);
    showToast("🗑️ Note deleted.");
    loadNotes();
  }
}
window.deleteNote = deleteNote;

// ------------------------------
// Copy to Clipboard
// ------------------------------
function copyNoteContent(title, content) {
  const combined = `📌 ${title}\n\n${content}`;
  navigator.clipboard.writeText(combined)
    .then(() => showToast("📝 Note copied to clipboard!"))
    .catch(() => showToast("❌ Failed to copy note."));
}
window.copyNoteContent = copyNoteContent;

// ------------------------------
// Show Toast Notification
// ------------------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ------------------------------
// Voice Recognition
// ------------------------------
const startVoiceBtn = document.getElementById("startVoice");

if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  startVoiceBtn.addEventListener("click", () => {
    recognition.start();
    showToast("🎙️ Listening... Speak your note.");
  });

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    noteInput.value = transcript;
    showToast("✅ Voice captured!");
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    showToast(`❌ Voice error: ${event.error}`);
  };
} else {
  startVoiceBtn.disabled = true;
  startVoiceBtn.textContent = "🎤 Not Supported";
  showToast("⚠️ Speech Recognition not supported on this browser.");
}

// ------------------------------
// Load Notes on Page Load
// ------------------------------
window.addEventListener("load", loadNotes);

// ------------------------------
// Debug Hook: Read Notes
// ------------------------------
window.testReadNotes = async function () {
  const db = await dbPromise;
  const notes = await db.getAll('notes');
  console.log("📂 All notes in IndexedDB:", notes);
};