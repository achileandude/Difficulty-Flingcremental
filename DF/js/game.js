let game = {
  studs: EN(0),
  totalStuds: EN(0),
  baseplates: EN(0),
  spike: 0,

  // Stud Upgrades
  baseLvl: EN(0),
  multLvl: EN(0),
  compLvl: EN(0),
  weakLvl: EN(0),
  accBought: false,
  velBought: false,

  // Baseplate Upgrades
  bpUpg1: false,
  bpUpg2: false,
  bpUpg3: false,
  bpUpg4: false,
  bpUpg5: false,

  // Trials
  activeTrial: null,
  trialCompletions: [false, false, false],

  // The Upgrade Tree: [S1, BP1, S2, BP2, S3, BP3, S4, BP4, S5, BP5]
  // Even indexes are Booleans (One-time), Odd are ExpantaNum (Leveling)
  tree: [false, EN(0), false, EN(0), false, EN(0), false, EN(0), false, EN(0)],

  notation: "Mixed Scientific",
  playTime: 0,
  lastTick: Date.now(),
};
