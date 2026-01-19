const timeline = document.getElementById("timeline");
const buttons = document.querySelectorAll(".mood-btn");

// Load saved moods from localStorage
let moods = JSON.parse(localStorage.getItem("moods")) || [];

// Function to render timeline
function renderTimeline() {
  timeline.innerHTML = "";
  moods.forEach(mood => {
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.backgroundColor = mood.color;
    timeline.appendChild(block);
  });
}

// Save a mood
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.getAttribute("data-color");
    moods.push({ color });
    localStorage.setItem("moods", JSON.stringify(moods));
    renderTimeline();
  });
});

// Initial render
renderTimeline();
