// js/main.js

function updateUI() {
  // Check if game object exists to prevent early-load crashes
  if (typeof game === "undefined") return;

  document.getElementById("stud-display").innerText = format(game.studs);
  document.getElementById("pps-display").innerText = format(getPPS());

  // Spike Visibility
  if (game.studs.gte(100) || game.spike > 0) {
    const spikeArea = document.getElementById("spike-area");
    if (spikeArea) spikeArea.style.display = "block";
  }

  // Spike Logic
  if (game.spike < SPIKES.length) {
    let s = SPIKES[game.spike];
    document.getElementById("spike-name").innerText = "Next: " + s.name;
    let perc = game.studs.div(s.req).mul(100).toNumber();
    document.getElementById("ms-fill").style.width = Math.min(100, perc) + "%";

    if (game.studs.gte(s.req)) {
      game.spike++;
    }
  }

  // Upgrade 1
  let c1 = getCost("base");
  document.getElementById("lvl-base").innerText =
    game.baseLvl.toString() + "/10";
  document.getElementById("cost-base").innerText =
    typeof c1 === "string" ? c1 : format(c1);

  // Upgrade 2 (Boost)
  if (game.spike >= 1) {
    const boostCard = document.getElementById("upg-boost");
    if (boostCard) {
      boostCard.style.display = "block";
      let c2 = getCost("boost");
      document.getElementById("lvl-boost").innerText =
        game.boostLvl.toString() + "/15";
      document.getElementById("cost-boost").innerText =
        typeof c2 === "string" ? c2 : format(c2);
    }
  }
}

// THE HEARTBEAT
function startGameLoop() {
  // Ensure lastTick is valid
  if (!game.lastTick) game.lastTick = Date.now();

  setInterval(() => {
    let now = Date.now();
    // Calculate time passed in seconds
    let diff = (now - game.lastTick) / 1000;

    // If diff is broken (NaN or negative), reset it to 0
    if (isNaN(diff) || diff < 0) diff = 0;

    // Apply gain
    let gained = getPPS().mul(diff);
    game.studs = game.studs.add(gained);

    game.lastTick = now;
    updateUI();
  }, 50);

  console.log("Game Heartbeat: ACTIVE");
}

// Start only when everything is loaded
window.onload = startGameLoop;
