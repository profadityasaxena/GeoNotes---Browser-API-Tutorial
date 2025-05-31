const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const saveButton = document.getElementById("saveNote");

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

      // Show browser notification if permission is granted
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

      // Reset form and show confirmation
      titleInput.value = "";
      noteInput.value = "";
      alert(`✅ Note saved at:\nLatitude: ${latitude}\nLongitude: ${longitude}`);
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