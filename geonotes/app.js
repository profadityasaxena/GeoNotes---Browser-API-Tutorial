const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");

// Unified function to get current position with fallback
function getCurrentPositionSafe(callback) {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported. Using fallback.");
    callback({ coords: { latitude: 43.65107, longitude: -79.347015 } }); // Toronto
    return;
  }

  navigator.geolocation.getCurrentPosition(
    callback,
    (error) => {
      console.warn("Geolocation error:", error.message);
      // Fallback: Toronto coordinates
      callback({ coords: { latitude: 43.65107, longitude: -79.347015 } });
    }
  );
}

// Save Note on button click
saveButton.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const content = noteInput.value.trim();

  if (!title || !content) {
    alert("Please enter both a title and a note.");
    return;
  }

  getCurrentPositionSafe((position) => {
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

    // Notification logic
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

    // Reset the form
    titleInput.value = "";
    noteInput.value = "";
    alert(`✅ Note saved successfully at:\nLatitude: ${latitude}\nLongitude: ${longitude}`);
  });
});