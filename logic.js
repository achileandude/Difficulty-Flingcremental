/**
 * logic.js
 * Handles mathematical calculations, costs, and purchasing.
 */

/**
 * Calculates total Studs gained per second (PPS).
 */
window.getPPS = function () {
  if (game.baseLvl.eq(0)) return EN(0);

  // 1. Base Production: 1 + level
  let pps = game.baseLvl.add(1);

  // 2. Boost Upgrade: x1.4 compounding
  if (game.boostLvl.gt(0)) {
    pps = pps.mul(EN(1.4).pow(game.boostLvl));
  }

  // 3. Acceleration: PPS boosts itself
  if (game.accBought) {
    let accBoost = game.studs.add(10).log10();
    if (game.darkUpg3Bought) {
      accBoost = accBoost.pow(1.75);
    }
    pps = pps.mul(accBoost);
  }

  // 4. Dark1: x5 compounding boost to Fling speed
  if (game.skybox >= 1 && game.darkUpg1.gt(0)) {
    pps = pps.mul(EN(5).pow(game.darkUpg1));
  }

  // 5. Flingers: x10 compounding
  if (game.flingersLvl.gt(0)) {
    pps = pps.mul(EN(10).pow(game.flingersLvl));
  }

  // 5. Darkness Boost: Based on Dark Studs
  if (game.skybox >= 1) {
    pps = pps.mul(100);
    let darkBoost = game.darkStuds.max(1).log10().add(1).pow(1.5);
    pps = pps.mul(darkBoost);
  }

  if (game.spike >= 1) {
    pps = pps.mul(2.5);
  }

  if (game.spike >= 2) {
    pps = pps.mul(5);
  }
  return pps;
};

/**
 * Calculates Darkness production.
 */
window.getDarkGain = function () {
  if (game.skybox < 1) return EN(0);
  let gain = EN(game.skybox).mul(EN(2.5).pow(game.darkUpg1));
  if (game.darkUpg2.gt(0)) {
    gain = gain.mul(EN(1.75).pow(game.darkUpg2));
  }
  if (game.darkUpg3Bought) gain = gain.mul(2);
  return gain;
};

/**
 * Returns the cost of an upgrade based on its ID.
 */
window.getCost = function (id) {
  switch (id) {
    case "base":
      let capBase = game.spike >= 2 ? 15 : 10;
      if (game.baseLvl.gte(capBase)) return "MAXED";

      // First level is completely free
      if (game.baseLvl.eq(0)) return EN(0);

      // Scales at x1.2 starting from a base cost of 2
      return EN(2)
        .mul(EN(1.2).pow(game.baseLvl.sub(1)))
        .ceil();

    case "boost":
      let capBoost = (game.spike >= 2 ? 20 : 15) + (game.skybox >= 1 ? 5 : 0);
      if (game.boostLvl.gte(capBoost)) return "MAXED";
      return EN(150).mul(EN(1.5).pow(game.boostLvl)).floor();

    case "acc":
      return game.accBought ? "BOUGHT" : EN(1250);

    case "flingers":
      if (game.flingersLvl.gte(3)) return "MAXED";
      return EN(1000000).mul(EN(15).pow(game.flingersLvl));

    case "dark1":
      if (game.darkUpg1.gte(3)) return "MAXED";
      return EN(15).mul(EN(3).pow(game.darkUpg1));

    case "dark2":
      if (game.darkUpg2.gte(10)) return "MAXED";
      return EN(100).mul(EN(2.5).pow(game.darkUpg2));

    case "dark3":
      return game.darkUpg3Bought ? "BOUGHT" : EN(1250);

    default:
      return EN(0);
  }
};

/**
 * Handles the logic for purchasing an upgrade.
 */
window.buy = function (id) {
  let cost = getCost(id);
  if (typeof cost === "string") return; // Prevents buying "MAXED" or "BOUGHT"

  let currency = id.startsWith("dark") ? "darkStuds" : "studs";

  // Proceed if we have enough currency OR if the cost is exactly 0
  if (game[currency].gte(cost) || cost.eq(0)) {
    game[currency] = game[currency].sub(cost);

    // Apply the upgrade effect
    if (id === "base") game.baseLvl = game.baseLvl.add(1);
    if (id === "boost") game.boostLvl = game.boostLvl.add(1);
    if (id === "acc") game.accBought = true;
    if (id === "flingers") game.flingersLvl = game.flingersLvl.add(1);
    if (id === "dark1") game.darkUpg1 = game.darkUpg1.add(1);
    if (id === "dark2") game.darkUpg2 = game.darkUpg2.add(1);
    if (id === "dark3") game.darkUpg3Bought = true;

    updateUI(); // Immediately update the visuals
  }
};

/**
 * logic.js
 * Thresholds updated to 100 and 100,000.
 */
window.getSpikeRequirement = function () {
  // Spike 1: The First Difficulty
  if (game.spike === 0) return EN(100);

  // Spike 2: The Lower Gap
  if (game.spike === 1) return EN(100000);

  return EN(Infinity);
};

/**
 * Specialized logic for the Skybox (Prestige).
 */
window.buySkybox = function () {
  let cost = EN("1e10"); // 10 Billion
  if (game.studs.gte(cost)) {
    game.skybox++;

    // Reset Main Realm
    game.studs = EN(0);
    game.baseLvl = EN(0);
    game.boostLvl = EN(0);
    game.accBought = false;
    game.flingersLvl = EN(0);
    game.spike = 0;

    switchTab("main");
    updateUI();
    save();
  }
};
