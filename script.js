// Initialize variables with ExpantaNum
let studs = new ExpantaNum(0);
let upg1Level = new ExpantaNum(0); // Level of the first upgrade
const maxLevel = 10;

function getUpg1Cost() {
    if (upg1Level.eq(0)) return new ExpantaNum(0); // Level 1 is free
    // Example cost: 10 * level (Level 2 costs 10, Level 3 costs 20, etc.)
    return upg1Level.mul(10); 
}

function buyUpgrade1() {
    let cost = getUpg1Cost();
    
    if (studs.gte(cost) && upg1Level.lt(maxLevel)) {
        studs = studs.sub(cost);
        upg1Level = upg1Level.add(1);
        updateDisplay();
    }
}

// THE LOOP: Generation starts ONLY if level > 0
setInterval(function() {
    if (upg1Level.gt(0)) {
        // Total SPS = upgrade level (Level 1 = 1 sps, Level 2 = 2 sps...)
        let studsPerSecond = upg1Level; 
        studs = studs.add(studsPerSecond);
        updateDisplay();
    }
}, 1000);

function updateDisplay() {
    document.getElementById('stud-count').innerText = "Studs: " + studs.toString();
    
    // Update Upgrade Button Text
    let cost = getUpg1Cost();
    let displayCost = upg1Level.eq(0) ? "FREE" : cost.toString() + " Studs";
    
    if (upg1Level.gte(maxLevel)) {
        document.getElementById('upg1-btn').innerText = "Upgrade 1: MAXED";
    } else {
        document.getElementById('upg1-btn').innerText = 
            "Upgrade 1 (Lvl " + upg1Level.toString() + "): " + displayCost;
    }
}
