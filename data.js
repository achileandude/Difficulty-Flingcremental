const EN = (n) => new ExpantaNum(n);

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
  // S/BP pairs: One-time upgrade, then leveling version
  tree: [false, false, EN(0), EN(0), false, false, EN(0), EN(0), false, false],

  notation: "Mixed Scientific",
  playTime: 0,
  lastTick: Date.now(),
};

const SPIKES = [
  {
    name: "The First Difficulty",
    req: EN(100),
    desc: "x3 Stud gain | Unlock 2 Stud upgrades",
  },
  {
    name: "The Lower Gap",
    req: EN(1e4),
    desc: "x10 Stud gain | Unlock 2 Stud upgrades",
  },
  {
    name: "Negativity",
    req: EN(3.333e19),
    desc: "x15 Stud gain | Unlock the first reset: Baseplates.",
  },
  {
    name: "Unimpossible",
    req: EN(1e261),
    desc: "x1M and ^1.025 Stud gain | Unlock the Upgrade Tree.",
  },
];

const TRIAL_GOALS = [EN(1e50), EN(1e75), EN(1e100)];
