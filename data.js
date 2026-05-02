/**
 * data.js
 * Manages the game state, saving, and loading.
 */

// Shorthand for ExpantaNum
const EN = (n) => new ExpantaNum(n);

// The initial state of the game
const INITIAL_GAME = {
  // Resources
  studs: EN(0),
  darkStuds: EN(0),

  // Main Upgrades
  baseLvl: EN(0),
  boostLvl: EN(0),
  accBought: false,
  flingersLvl: EN(0),

  // Progression
  spike: 0, // 0: None, 1: First Spike, 2: Second Spike, 3: Third Spike (Negativity)
  skybox: 0, // Prestige count

  // Darkness Upgrades
  darkUpg1: EN(0),
  darkUpg2: EN(0),
  darkUpg3Bought: false,

  // Synergy Upgrade (Spike 3)
  synergyBought: false,

  // Timing
  lastTick: Date.now(),
};

// The active game object
let game = { ...INITIAL_GAME };

/**
 * Saves the game to localStorage.
 * Converts ExpantaNum objects to strings for JSON compatibility.
 */
window.save = function () {
  localStorage.setItem("FlingcrementalSave", JSON.stringify(game));
  console.log("Game Saved!");
};

/**
 * Loads the game from localStorage.
 * Re-instantiates ExpantaNum objects from strings.
 */
window.load = function () {
  let savePath = localStorage.getItem("FlingcrementalSave");
  if (!savePath) return;

  let loadedData = JSON.parse(savePath);

  // Helper to merge and convert back to EN
  for (let key in loadedData) {
    if (
      typeof loadedData[key] === "string" &&
      !isNaN(parseFloat(loadedData[key]))
    ) {
      // If it looks like a number string, turn it into an EN object
      game[key] = EN(loadedData[key]);
    } else {
      game[key] = loadedData[key];
    }
  }

  // Ensure nested EN objects are handled (like upgrade levels)
  game.studs = EN(game.studs);
  game.darkStuds = EN(game.darkStuds);
  game.baseLvl = EN(game.baseLvl);
  game.boostLvl = EN(game.boostLvl);
  game.flingersLvl = EN(game.flingersLvl);
  game.darkUpg1 = EN(game.darkUpg1);
  game.darkUpg2 = EN(game.darkUpg2);

  console.log("Game Loaded!");
};

/**
 * Completely resets the game data.
 */
window.hardReset = function () {
  if (confirm("Are you sure? ALL your progress will be wiped.")) {
    localStorage.removeItem("FlingcrementalSave");
    location.reload();
  }
};
