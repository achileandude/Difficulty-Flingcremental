// 1. Initialize game variables
let gameData = {
    studs: new ExpantaNum(0),
    upg1Level: new ExpantaNum(0),
    maxLevel: 10
};

// 2. Click Function
function clickStud() {
    gameData.studs = gameData.studs.add(1);
    updateDisplay();
}

// 3. Upgrade Logic
function getUpg1Cost() {
    if (gameData.upg1Level.eq(0)) return new ExpantaNum(0); // Level 1 is free
    // Level 2 costs 10, Level 3 costs 20, etc.
    return gameData.upg1Level.mul(10); 
}

function buyUpgrade1() {
    let cost = getUpg1Cost();
    // Check if player has enough studs AND is below Max Level (10)
    if (gameData.studs.gte(cost) && gameData.upg1Level.lt(gameData.maxLevel)) {
        gameData.studs = gameData.studs.sub(cost);
        gameData.upg1Level = gameData.upg1Level.add(1);
        updateDisplay();
        saveGame();
    }
}

// 4. Game Loop (Runs every 1 second)
setInterval(function() {
    if (gameData.upg1Level.gt(0)) {
        // Generates 1 Stud per second at Level 1, 2 at Level 2, etc.
        let sps = gameData.upg1Level; 
        gameData.studs = gameData.studs.add(sps);
        updateDisplay();
    }
}, 1000);

// 5. Save and Load System
function saveGame() {
    // We must convert ExpantaNum objects to strings to save them in localStorage
    let save = {
        studs: gameData.studs.toString(),
        upg1Level: gameData.upg1Level.toString()
    };
    localStorage.setItem("studClickerSave", JSON.stringify(save));
}

function loadGame() {
    let savedData = JSON.parse(localStorage.getItem("studClickerSave"));
    if (savedData) {
        // Convert strings back into ExpantaNum objects on load
        if (savedData.studs) gameData.studs = new ExpantaNum(savedData.studs);
        if (savedData.upg1Level) gameData.upg1Level = new ExpantaNum(savedData.upg1Level);
    }
    updateDisplay();
}

// 6. UI Update Function
function updateDisplay() {
    document.getElementById('stud-count').innerText = "Studs: " + gameData.studs.toString();
    
    let cost = getUpg1Cost();
    let btn = document.getElementById('upg1-btn');
    
    if (gameData.upg1Level.gte(gameData.maxLevel)) {
        btn.innerText = "Upgrade 1: MAXED";
    } else {
        let costText = gameData.upg1Level.eq(0) ? "FREE" : cost.toString() + " Studs";
        btn.innerText = "Upgrade 1 (Lvl " + gameData.upg1Level.toString() + "): " + costText;
    }
}

// Run loadGame when the page first opens
loadGame();
// Optional: Auto-save every 15 seconds
setInterval(saveGame, 15000);
