function getPPS() {
  let p = EN(game.baseLvl);

  // --- DIFFICULTY SPIKES ---
  if (game.activeTrial !== 1) {
    // Trial 1 disables Spike boosts
    if (game.spike >= 1) p = p.mul(5);
    if (game.spike >= 2) p = p.mul(25);
    if (game.spike >= 3) p = p.mul(125);
    if (game.spike >= 4) p = p.mul(1e6).pow(1.05); // Unimpossible
  }

  // --- STUD UPGRADES ---
  let mBase =
    1.5 +
    (game.trialCompletions[1] ? 0.25 : 0) +
    (game.tree[3].gt(0) ? 0.125 : 0);
  p = p.mul(EN(mBase).pow(game.multLvl));

  let cBase =
    (game.bpUpg1 ? 3.5 : 3.0) +
    (game.trialCompletions[1] ? 0.25 : 0) +
    (game.tree[3].gt(0) ? 0.125 : 0);
  p = p.mul(EN(cBase).pow(game.compLvl));

  let wBase = game.bpUpg4 ? 1.5 : 1.325;
  p = p.mul(EN(wBase).pow(game.weakLvl));

  if (game.bpUpg2) p = p.mul(1000);

  if (game.accBought) {
    let exp = 0.25;
    if (game.bpUpg2) exp += 0.05;
    if (game.bpUpg5) exp += 0.2;
    let boost = game.velBought
      ? game.studs.add(1).pow(exp)
      : game.studs.add(10).log10();
    p = p.mul(boost.max(1));
  }

  // --- BASEPLATE UPGRADES & TRIALS ---
  if (game.bpUpg4) p = p.mul(1e15).pow(1.125);
  if (game.trialCompletions[0]) p = p.pow(1.075);
  if (game.trialCompletions[2]) p = p.mul(1e8);

  // --- UPGRADE TREE BOOSTS ---
  if (game.activeTrial !== 4) {
    // Trial 4 disables tree upgrades
    if (game.tree[0]) p = p.mul(1e25); // S1
    if (game.tree[2].gt(0))
      p = p.mul(game.studs.add(10).log10().pow(game.tree[2])); // S2: Recursive
    if (game.tree[4]) p = p.pow(1.25); // S3: ^1.25
    if (game.tree[6]) p = p.mul(1e50); // S4
    if (game.tree[7]) p = p.pow(1.4); // BP4: ^1.4
    if (game.tree[9]) p = p.mul(1e125); // BP5: x1e125
  }

  // --- TRIAL DEBUFFS ---
  if (game.activeTrial === 3) p = p.sqrt(); // Trial 3: sqrt
  if (game.activeTrial === 4) p = p.pow(1.25); // Trial 4: ^1.2 reward
  if (game.activeTrial === 5) {
    // Trial 5: All 3 effects + ^1.25 boost
    p = p.sqrt(); // Trial 3 effect: sqrt
    if (game.spike >= 1) p = p.mul(1); // Trial 1 effect already handled above
    // Trial 2 effect: baseplate upgrades disabled (handled in resetBaseplate)
    p = p.pow(1.25); // Trial 5 bonus
  }

  return p;
}

function getCost(id) {
  switch (id) {
    case "base":
      if (game.baseLvl.gte(15)) return "Maxed";
      if (game.baseLvl.eq(0)) return EN(0); // First base upgrade is free
      return EN(3).mul(EN(1.15).pow(game.baseLvl)).ceil();
    case "mult":
      let mCap =
        30 + (game.bpUpg1 ? 70 : 0) + (game.trialCompletions[1] ? 25 : 0);
      return game.multLvl.gte(mCap)
        ? "Maxed"
        : EN(150).mul(EN(1.4).pow(game.multLvl)).ceil();
    case "comp":
      let cCap = game.bpUpg1 ? 25 : 15;
      return game.compLvl.gte(cCap)
        ? "Maxed"
        : EN(2500).mul(EN(3.5).pow(game.compLvl)).ceil();
    case "acc":
      return game.accBought ? "Bought" : EN(1e14);
    case "vel":
      return game.velBought ? "Bought" : EN(1e16);
    case "weak":
      let wCap = 50 + (game.bpUpg4 ? 25 : 0);
      return game.weakLvl.gte(wCap)
        ? "Maxed"
        : EN(1e45).mul(EN(1.7).pow(game.weakLvl)).ceil();
    default:
      return EN(0);
  }
}

function buy(id) {
  let cost = getCost(id);
  if (typeof cost === "string") return;
  if (game.studs.gte(cost)) {
    game.studs = game.studs.sub(cost);
    if (id === "acc" || id === "vel") game[id + "Bought"] = true;
    else game[id + "Lvl"] = game[id + "Lvl"].add(1);
    updateUI();
  }
}

function getBaseplateGain() {
  if (game.studs.lt(5e20)) return EN(0);
  let gain = game.studs.div(5e20).pow(0.2);
  if (game.bpUpg4) gain = gain.mul(game.studs.pow(0.15));

  // Tree effects
  if (game.tree[1]) gain = gain.mul(1e9); // BP1: x1e9
  if (game.tree[3].gt(0)) gain = gain.mul(EN(4).pow(game.tree[3])); // BP3: x4 compounding
  if (game.tree[4]) gain = gain.pow(1.125); // S3: ^1.125
  if (game.tree[9]) gain = gain.pow(1.175); // BP5: ^1.175

  // Trial 5 bonus
  if (game.activeTrial === 5) gain = gain.pow(1.25);

  return gain.floor().max(1);
}

function buyTree(index) {
  const costs = [
    { c: EN("1e200"), cur: "studs", type: "once" }, // S1
    { c: EN("1e35"), cur: "baseplates", type: "once" }, // BP1
    { c: EN("1e250"), cur: "studs", type: "level" }, // S2
    { c: EN("1e45"), cur: "baseplates", type: "level" }, // BP2
    { c: EN("1e350"), cur: "studs", type: "once" }, // S3
    { c: EN("1e70"), cur: "baseplates", type: "level" }, // BP3
    { c: EN("1e475"), cur: "studs", type: "once" }, // S4
    { c: EN("1e95"), cur: "baseplates", type: "once" }, // BP4
    { c: EN("1e600"), cur: "studs", type: "once" }, // S5
    { c: EN("1e120"), cur: "baseplates", type: "once" }, // BP5
  ];
  let item = costs[index];
  if (!item) return;
  if (game[item.cur].gte(item.c)) {
    if (item.type === "once" && !game.tree[index]) {
      game[item.cur] = game[item.cur].sub(item.c);
      game.tree[index] = true;
    } else if (item.type === "level") {
      game[item.cur] = game[item.cur].sub(item.c);
      game.tree[index] = game.tree[index].add(1);
    }
    updateUI();
  }
}
