const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");

// Save note on click
saveButton.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const content = noteInput.value.trim();

  if (!title || !content) {
    alert("Please enter both a title and a note.");
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
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

      // Save to localStorage
      const noteKey = `note-${Date.now()}`;
      localStorage.setItem(noteKey, JSON.stringify(note));

      // Trigger browser notification
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

      // Clear inputs and confirm
      titleInput.value = "";
      noteInput.value = "";
      alert(`✅ Note saved at:\nLatitude: ${latitude.toFixed(5)}\nLongitude: ${longitude.toFixed(5)}`);

      // Refresh notes
      loadNotes();
    },
    (error) => {
      console.error("Geolocation error:", error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("❌ Location access denied by the user.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("❌ Location information is unavailable.");
          break;
        case error.TIMEOUT:
          alert("⏳ Request to get user location timed out.");
          break;
        default:
          alert("⚠️ An unknown error occurred while fetching location.");
      }
    }
  );
});

// Display saved notes
function loadNotes() {
  const notesSection = document.getElementById("notesList");
  notesSection.innerHTML = ""; // Clear previous

  const keys = Object.keys(localStorage).filter(k => k.startsWith("note-")).sort();

  if (keys.length === 0) {
    notesSection.innerHTML = "<p>No notes saved yet.</p>";
    return;
  }

  keys.forEach(key => {
    const note = JSON.parse(localStorage.getItem(key));
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <small>📍 Lat: ${note.location.latitude.toFixed(5)}, Lng: ${note.location.longitude.toFixed(5)}</small><br/>
      <small>🕒 ${new Date(note.timestamp).toLocaleString()}</small>
    `;
    notesSection.appendChild(noteCard);
  });
}

// Initial load
window.addEventListener("load", loadNotes);