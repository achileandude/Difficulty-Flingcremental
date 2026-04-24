function getPPS() {
  let p = EN(game.baseLvl);
  // x1.35 compounding boost
  p = p.mul(EN(1.35).pow(game.boostLvl));

  // First Spike = x2 boost
  if (game.spike >= 1) p = p.mul(2);

  return p;
}

function getCost(id) {
  if (id === "base") {
    if (game.baseLvl.gte(10)) return "Maxed";
    if (game.baseLvl.eq(0)) return "Free";
    return EN(2).mul(EN(1.15).pow(game.baseLvl));
  }
  if (id === "boost") {
    if (game.boostLvl.gte(15)) return "Maxed";
    // Compounding x1.75 without rounding
    return EN(150).mul(EN(1.75).pow(game.boostLvl));
  }
  return EN(0);
}

function buy(id) {
  let cost = getCost(id);
  if (typeof cost === "string") return;

  if (game.studs.gte(cost)) {
    game.studs = game.studs.sub(cost);
    if (id === "base") game.baseLvl = game.baseLvl.add(1);
    if (id === "boost") game.boostLvl = game.boostLvl.add(1);
    // updateUI() is called by the main loop
  }
}
