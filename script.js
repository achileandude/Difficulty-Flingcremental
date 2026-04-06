const EN = ExpantaNum;

let studs = new EN(0);
let level = 0;
let sps = new EN(0);

const studDisplay = document.getElementById('stud-count');
const spsDisplay = document.getElementById('sps-count');
const levelDisplay = document.getElementById('current-level');
const costDisplay = document.getElementById('cost-display');
const upgradeBtn = document.getElementById('upgrade-btn');

function getCost(lvl) {
    if (lvl === 0) return new EN(0);
    // Cost: 2, 4, 6, 8... (2 * lvl)
    return new EN(2).times(lvl);
}

upgradeBtn.addEventListener('click', () => {
    let cost = getCost(level);
    if (studs.gte(cost) && level < 10) {
        studs = studs.minus(cost);
        level++;
        
        // Level 1: 1 sps | Level 2+: Add 1 more sps
        if (level === 1) sps = new EN(1);
        else sps = sps.plus(1);

        updateUI();
    }
});

function updateUI() {
    studDisplay.innerText = studs.floor().toString();
    spsDisplay.innerText = sps.toString();
    levelDisplay.innerText = level;
    
    if (level >= 10) {
        upgradeBtn.disabled = true;
        costDisplay.innerText = "MAX";
    } else {
        let nextCost = getCost(level);
        costDisplay.innerText = nextCost.eq(0) ? "Free" : nextCost.toString() + " Studs";
    }
}

// Game Loop
setInterval(() => {
    if (sps.gt(0)) {
        studs = studs.plus(sps);
        updateUI();
    }
}, 1000);
