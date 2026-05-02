/**
 * main.js
 * Purpose: Manages the game loop, UI updates, and tab navigation.
 */

// --- 1. TAB MANAGEMENT ---

/**
 * Switches the visible tab and updates the active button styling.
 * @param {string} tab - The ID suffix of the tab to show (main, skyboxes, darkness).
 */
window.switchTab = function (tab) {
  const tabs = ["main", "skyboxes", "darkness"];

  tabs.forEach((t) => {
    const tabEl = document.getElementById(`tab-${t}`);
    const btnEl = document.getElementById(`btn-tab-${t}`);

    if (tabEl) {
      tabEl.style.display = t === tab ? "flex" : "none";
    }
    if (btnEl) {
      btnEl.classList.toggle("active", t === tab);
    }
  });
};

/**
 * main.js
 * Handles UI visibility and Spike-specific styling.
 */

function updateUI() {
  if (typeof game === "undefined") return;

  // Standard Displays
  safeSetText("stud-display", format(game.studs));
  safeSetText("pps-display", format(getPPS()));

  // --- TAB VISIBILITY ---
  // Hide Skyboxes tab until Flingers is maxed out (Level 3)
  const btnSky = document.getElementById("btn-tab-skyboxes");
  if (btnSky) {
    game.flingersLvl.gte(3)
      ? btnSky.classList.remove("hidden")
      : btnSky.classList.add("hidden");
  }

  // Hide Darkness tab until Blackbox is bought (Skybox >= 1)
  const btnDark = document.getElementById("btn-tab-darkness");
  if (btnDark) {
    if (game.skybox >= 1) {
      btnDark.classList.remove("hidden");
    } else {
      btnDark.classList.add("hidden");
    }
  }

  updateUpgradeCards();
  updateDarknessUI();
  updateSpikeUI(); // Run the spike visual update
}

function updateSpikeUI() {
  const spikeArea = document.getElementById("spike-area");
  const nameEl = document.getElementById("spike-name");
  const fillEl = document.getElementById("ms-fill");

  if (!spikeArea || !fillEl) return;

  spikeArea.style.display = "block";

  // Update Name and Colors based on Spike Level
  if (game.spike === 0) {
    nameEl.innerText = "Current Goal: The First Difficulty";
    fillEl.classList.add("fill-spike-1");
    fillEl.classList.remove("fill-spike-2");
  } else if (game.spike === 1) {
    nameEl.innerText = "Current Goal: The Lower Gap";
    fillEl.classList.remove("fill-spike-1");
    fillEl.classList.add("fill-spike-2");
  } else {
    nameEl.innerText = "MAX DIFFICULTY REACHED";
    fillEl.classList.remove("fill-spike-1", "fill-spike-2");
  }

  // Progress Calculation
  let req = getSpikeRequirement();
  if (req.gt(0) && req !== Infinity) {
    let percent = game.studs.div(req).mul(100).toNumber();
    fillEl.style.width = Math.min(percent, 100) + "%";
  } else {
    fillEl.style.width = "100%";
  }
}

/**
 * Specifically handles the main realm upgrade cards.
 */
function updateUpgradeCards() {
  // Base Upgrade (Always visible)
  let capBase = game.spike >= 2 ? 15 : 10;
  safeSetText("lvl-base", `${game.baseLvl}/${capBase}`);

  // Check if the cost is 0, and if so, render "FREE" instead of a number
  let baseCost = getCost("base");
  if (baseCost === "MAXED") {
    safeSetText("cost-base", "MAXED");
  } else if (baseCost.eq(0)) {
    safeSetText("cost-base", "FREE");
  } else {
    safeSetText("cost-base", format(baseCost));
  }
  // Boost Upgrade (Visible after first Spike)
  const boostCard = document.getElementById("upg-boost");
  if (boostCard) {
    let capBoost = (game.spike >= 2 ? 20 : 15) + (game.skybox >= 1 ? 5 : 0);
    if (game.spike >= 1) {
      boostCard.classList.remove("hidden");
      safeSetText("lvl-boost", `${game.boostLvl}/${capBoost}`);
      safeSetText("cost-boost", format(getCost("boost")));
    } else {
      boostCard.classList.add("hidden");
    }
  }

  // Acceleration (Visible at Boost Level 5)
  const accCard = document.getElementById("upg-acc");
  if (accCard) {
    if (game.boostLvl.gte(5)) {
      accCard.classList.remove("hidden");
      safeSetText("cost-acc", format(getCost("acc")));
      if (game.accBought) accCard.classList.add("disabled");
    } else {
      accCard.classList.add("hidden");
    }
  }

  // Flingers (Visible at Spike 2)
  const flingCard = document.getElementById("upg-flingers");
  if (flingCard) {
    if (game.spike >= 2) {
      flingCard.classList.remove("hidden");
      safeSetText("lvl-flingers", `${game.flingersLvl}/3`);
      safeSetText("cost-flingers", format(getCost("flingers")));
      if (game.flingersLvl.gte(3)) flingCard.classList.add("disabled");
    } else {
      flingCard.classList.add("hidden");
    }
  }
}

/**
 * Handles all Darkness-specific UI elements.
 */
function updateDarknessUI() {
  safeSetText("dark-display", format(game.darkStuds));
  safeSetText("dark-pps-display", format(getDarkGain()));

  // Darkness Multiplier Formula
  let darkBoost = game.darkStuds.max(1).log10().add(1).pow(1.5);
  safeSetText("dark-boost-display", format(darkBoost));

  safeSetText("lvl-dark1", `${game.darkUpg1}/3`);
  safeSetText("cost-dark1", format(getCost("dark1")));

  safeSetText("lvl-dark2", `${game.darkUpg2}/10`);
  safeSetText("cost-dark2", format(getCost("dark2")));

  safeSetText("cost-dark3", format(getCost("dark3")));
}

/**
 * Helper to update text content without crashing if the ID is missing.
 */
function safeSetText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.innerText = txt;
}

/**
 * Checks if the player has reached the spike requirement and advances the spike level.
 */
window.checkSpike = function () {
  let req = getSpikeRequirement();
  if (req !== Infinity && game.studs.gte(req)) {
    game.spike++;
  }
};

// --- 3. THE ENGINE ---

function startGameLoop() {
  if (!game.lastTick) game.lastTick = Date.now();

  setInterval(() => {
    const now = Date.now();
    let diff = (now - game.lastTick) / 1000;

    // Prevent massive gains from clock changes or browser sleep
    if (diff < 0) diff = 0;
    if (diff > 3600) diff = 3600;

    // Update Resources
    game.studs = game.studs.add(getPPS().mul(diff));
    if (game.skybox >= 1) {
      game.darkStuds = game.darkStuds.add(getDarkGain().mul(diff));
    }

    game.lastTick = now;
    checkSpike();
    updateUI();
  }, 5); // Runs at 20 ticks per second
}

// --- 4. INITIALIZATION ---

window.onload = () => {
  load(); // Load save from data.js
  startGameLoop();
  console.log("Game Initialized Successfully.");
};

// Auto-save every 10 seconds
setInterval(save, 10000);
