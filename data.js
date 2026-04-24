const EN = (n) => new ExpantaNum(n);

let game = {
  studs: EN(0),
  baseLvl: EN(0),
  boostLvl: EN(0),
  spike: 0,
  lastTick: Date.now(),
};

const SPIKES = [{ name: "The First Difficulty", req: EN(100), boost: 2 }];
