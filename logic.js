// js/logic.js

window.getPPS = function () {
  let p = EN(game.baseLvl);
  // x1.35 compounding boost from Upgrade 2
  p = p.mul(EN(1.35).pow(game.boostLvl));
  // First Spike boost
  if (game.spike >= 1) p = p.mul(2);
  return p;
};

window.getCost = function (id) {
  if (id === "base") {
    if (game.baseLvl.gte(10)) return "Maxed";
    if (game.baseLvl.eq(0)) return "Free";
    return EN(2).mul(EN(1.25).pow(game.baseLvl));
  }
  if (id === "boost") {
    if (game.boostLvl.gte(15)) return "Maxed";
    return EN(150).mul(EN(1.5).pow(game.boostLvl));
  }
  return EN(0);
};

window.buy = function (id) {
  console.log("Function buy() called for:", id); // If you don't see this, the click isn't firing

  let cost = getCost(id);
  if (cost === "Maxed") return;

  let price = cost === "Free" ? EN(0) : cost;

  if (game.studs.gte(price)) {
    game.studs = game.studs.sub(price);
    if (id === "base") game.baseLvl = game.baseLvl.add(1);
    if (id === "boost") game.boostLvl = game.boostLvl.add(1);

    console.log(
      "Bought! New level:",
      id === "base" ? game.baseLvl.toString() : game.boostLvl.toString(),
    );
    updateUI();
  } else {
    console.warn("Cannot afford! Need " + price.toString());
  }
};
