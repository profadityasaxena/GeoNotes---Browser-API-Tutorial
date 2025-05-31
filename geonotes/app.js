// ------------------------------
// Element References
// ------------------------------
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");
let editingKey = null;

// ------------------------------
// Save or Update Note (with Geolocation)
// ------------------------------
saveButton.addEventListener("click", () => {
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
    (position) => {
      const { latitude, longitude } = position.coords;

      const note = {
        title,
        content,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      };

      const noteKey = editingKey || `note-${Date.now()}`;
      localStorage.setItem(noteKey, JSON.stringify(note));

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

      // Reset state
      titleInput.value = "";
      noteInput.value = "";
      editingKey = null;
      saveButton.textContent = "Save Note";

      showToast(`✅ Note saved at:\nLatitude: ${latitude.toFixed(5)}\nLongitude: ${longitude.toFixed(5)}`);
      loadNotes();
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
// Load & Render Notes (with Drag Support)
// ------------------------------
function loadNotes() {
  const notesSection = document.getElementById("notesList");
  notesSection.innerHTML = "";

  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith("note-"))
    .sort();

  if (keys.length === 0) {
    notesSection.innerHTML = "<p>No notes saved yet.</p>";
    return;
  }

  keys.forEach((key) => {
    const note = JSON.parse(localStorage.getItem(key));
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.setAttribute("draggable", "true");
    noteCard.dataset.key = key;

    noteCard.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <small>📍 Lat: ${note.location.latitude.toFixed(5)}, Lng: ${note.location.longitude.toFixed(5)}</small><br/>
      <small>🕒 ${new Date(note.timestamp).toLocaleString()}</small>
      <div class="note-card-buttons">
        <button onclick="copyNoteContent(\`${note.title.replace(/`/g, "\\`")}\`, \`${note.content.replace(/`/g, "\\`")}\`)">Copy</button>
        <button onclick="editNote('${key}')">Edit</button>
        <button onclick="deleteNote('${key}')">Delete</button>
      </div>
    `;

    // Drag-and-Drop Events
    noteCard.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", key);
      noteCard.classList.add("dragging");
    });

    noteCard.addEventListener("dragover", (e) => e.preventDefault());

    noteCard.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedKey = e.dataTransfer.getData("text/plain");
      const targetKey = noteCard.dataset.key;

      if (draggedKey && draggedKey !== targetKey) {
        reorderNotes(draggedKey, targetKey);
        loadNotes();
      }
    });

    noteCard.addEventListener("dragend", () => {
      noteCard.classList.remove("dragging");
    });

    notesSection.appendChild(noteCard);
  });
}

// ------------------------------
// Reorder Notes in localStorage
// ------------------------------
function reorderNotes(draggedKey, targetKey) {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("note-")).sort();
  const draggedIndex = keys.indexOf(draggedKey);
  const targetIndex = keys.indexOf(targetKey);

  if (draggedIndex === -1 || targetIndex === -1) return;

  const reordered = [...keys];
  const [removed] = reordered.splice(draggedIndex, 1);
  reordered.splice(targetIndex, 0, removed);

  const updated = {};
  reordered.forEach((k, i) => {
    updated[`note-${i}-${Date.now()}`] = localStorage.getItem(k);
  });

  keys.forEach(k => localStorage.removeItem(k));
  Object.entries(updated).forEach(([k, v]) => localStorage.setItem(k, v));
}

// ------------------------------
// Edit Note
// ------------------------------
function editNote(key) {
  const note = JSON.parse(localStorage.getItem(key));
  titleInput.value = note.title;
  noteInput.value = note.content;
  editingKey = key;
  saveButton.textContent = "Update Note";
  showToast("✏️ Edit mode enabled");
}

// ------------------------------
// Delete Note
// ------------------------------
function deleteNote(noteKey) {
  if (confirm("Are you sure you want to delete this note?")) {
    localStorage.removeItem(noteKey);
    loadNotes();
  }
}

// ------------------------------
// Copy to Clipboard
// ------------------------------
function copyNoteContent(title, content) {
  const combined = `📌 ${title}\n\n${content}`;
  navigator.clipboard.writeText(combined)
    .then(() => showToast("📝 Note copied to clipboard!"))
    .catch(() => showToast("❌ Failed to copy note."));
}

// ------------------------------
// Show Toast Notification
// ------------------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ------------------------------
// Speech Recognition Setup
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

  recognition.onend = function() {
    console.log("Speech recognition ended.");
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