const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");

saveButton.addEventListener("click", () => {
  // Check if browser supports Geolocation
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Create the note object
      const note = {
        title: titleInput.value.trim(),
        content: noteInput.value.trim(),
        location: { latitude, longitude },
        timestamp: new Date().toISOString()
      };

      // Store in localStorage
      const noteKey = `note-${Date.now()}`;
      localStorage.setItem(noteKey, JSON.stringify(note));

      // Notify the user
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("📌 Note Saved", { body: note.title });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification("📌 Note Saved", { body: note.title });
            }
          });
        }
      }

      // Reset form
      titleInput.value = "";
      noteInput.value = "";
      alert("Note saved successfully with location.");
    },
    (error) => {
      alert("Error getting location: " + error.message);
    }
  );
});