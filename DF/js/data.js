const EN = (n) => new ExpantaNum(n);

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
