const EN = (n) => new ExpantaNum(n);

let game = {
    studs: EN(0),
    baseLvl: EN(0),
    boostLvl: EN(0),
    flingersLvl: EN(0),
    accBought: false,
    spike: 0,
    // NEW: Prestige & Darkness
    skybox: 0,
    darkStuds: EN(0),
    darkUpg1: EN(0), 
    lastTick: Date.now()
};

const SPIKES = [
    { 
        name: "The First Difficulty", 
        req: EN(100), 
        boost: 2,
        extraReq: () => game.baseLvl.gte(10),
        reqText: "Requires: It ALL begins here Lv 10"
    },
    { 
        name: "The Lower Gap", 
        req: EN(100000), 
        boost: 4,
        extraReq: () => game.baseLvl.gte(10) && game.boostLvl.gte(15) && game.accBought,
        reqText: "Requires: Base Lv 10, Boost Lv 15, Acceleration"
    }
];

function save() {
    localStorage.setItem("studFlingSave", JSON.stringify(game));
    console.log("Game Saved");
}

function load() {
    let data = JSON.parse(localStorage.getItem("studFlingSave"));
    if (data) {
        game.studs = EN(data.studs || 0);
        game.baseLvl = EN(data.baseLvl || 0);
        game.boostLvl = EN(data.boostLvl || 0);
        game.flingersLvl = EN(data.flingersLvl || 0);
        game.accBought = data.accBought || false;
        game.spike = data.spike || 0;
        game.skybox = data.skybox || 0;
        game.darkStuds = EN(data.darkStuds || 0);
        game.darkUpg1 = EN(data.darkUpg1 || 0);
        game.lastTick = Date.now();
    }
}

function hardReset() {
    if (confirm("Are you sure? This deletes EVERYTHING.")) {
        localStorage.removeItem("studFlingSave");
        location.reload();
    }
}
