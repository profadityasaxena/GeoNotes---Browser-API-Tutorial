// animations.js
// ✨ Full GSAP Animation Timeline for GeoNotes Preloader & App UI

window.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const appMain = document.getElementById("appMain");
  const preloaderTitle = document.querySelector(".preloader-title");
  const techListItems = document.querySelectorAll(".tech-stack li");
  const edgeWarning = document.querySelector(".edge-warning");

  if (!preloader || !appMain || !preloaderTitle || techListItems.length === 0 || !edgeWarning) {
    console.warn("⚠️ Required elements missing. Skipping preloader animation.");
    appMain.style.display = "block";
    return;
  }

  // STEP 1: Prepare visibility
  preloader.style.display = "flex";
  preloader.style.opacity = "1";
  appMain.style.display = "none";

  // STEP 2: Build Master Timeline
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" }
  });

  // Show Title (centered)
  tl.fromTo(preloaderTitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 });

  // Hold Title in center for 2 seconds
  tl.to(preloaderTitle, { duration: 2 });

  // Move Title Up
  tl.to(preloaderTitle, { y: -120, duration: 1, ease: "power2.inOut" });

  // Reveal .tech-stack container
  tl.set(".tech-stack", { opacity: 1 });

  // Show tech list items staggered
  tl.to(techListItems, {
    opacity: 1,
    y: 0,
    stagger: 0.5,
    duration: 0.4,
    ease: "power2.out"
  }, "<+0.2");

  // Show Edge Warning after stack
  tl.fromTo(edgeWarning, {
    opacity: 0,
    y: 10
  }, {
    opacity: 1,
    y: 0,
    duration: 1
  }, `+=0.4`);

  // Wait, then Fade Preloader Out
  tl.to(preloader, {
    opacity: 0,
    duration: 2,
    ease: "power2.inOut",
    onComplete: () => {
      preloader.style.display = "none";
      appMain.style.display = "block";
      animateMainUI();
    }
  }, "+=1.2");
});

// Animate App UI
function animateMainUI() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("main", { opacity: 0, y: 30, duration: 1 });
  tl.from("#formTitle", { opacity: 0, y: -20, duration: 0.8 }, "-=0.6");
  tl.from("#noteForm input, #noteForm textarea, #noteForm button", {
    opacity: 0,
    y: 20,
    stagger: 0.2,
    duration: 0.5
  }, "-=0.4");
  tl.from("#notesHeader", { opacity: 0, y: 10, duration: 0.5 }, "-=0.4");
  tl.from(".note-card", {
    opacity: 0,
    y: 20,
    duration: 1.2,
    stagger: 0.15
  }, "-=0.3");
}