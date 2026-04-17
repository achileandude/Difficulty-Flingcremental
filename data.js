const EN = (n) => new ExpantaNum(n);

let game = {
studs: EN(0),
totalStuds: EN(0),
baseplates: EN(0),
spike: 0,
baseLvl: EN(0),
multLvl: EN(0),
compLvl: EN(0),
weakLvl: EN(0),
accBought: false,
velBought: false,
bpUpg1: false,
bpUpg2: false,
bpUpg3: false,
bpUpg4: false,
bpUpg5: false,
playTime: 0,
activeTrial: null,
trialCompletions: [false, false, false],
tree: [false, false, false, false],
lastTick: Date.now(),
};

const SPIKES = [
{ name: "The First Difficulty", req: EN(100), desc: "x3 Stud gain | Unlock 2 Stud upgrades" },
{ name: "The Lower Gap", req: EN(1e4), desc: "x10 Stud gain | Unlock 2 Stud upgrades" },
{ name: "Negativity", req: EN(3.333e19), desc: "x15 Stud gain | Unlock Baseplates." },
{ name: "Unimpossible", req: EN("1e261"), desc: "x1M and ^1.025 Stud gain | Unlock the Tree." },
];
