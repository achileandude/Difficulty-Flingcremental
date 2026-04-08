// 1. GAME STATE
// We store all the player's data in a single object so it's easy to save and load later.
let gameData = {
    studs: 0,
    
    // Difficulty Feature Stats
    difficultyChartUnlocked: false,
    difficultyLevel: 0,
    
    // Upgrades
    upgrades: {
        multiplication: {
            level: 0,
            cost: 50, // You can adjust this starting cost
            unlocked: false
        },
        compoundingMultiplication: {
            level: 0,
            cost: 250, // You can adjust this starting cost
            unlocked: false
        }
    }
};

// 2. CORE FUNCTIONS

// Function to calculate how many studs you get per action/tick
function calculateStudGain() {
    let baseGain = 1; 
    
    // Add the "Multiplication" upgrade (+1 to multiplier per level)
    let addedMultiplier = gameData.upgrades.multiplication.level * 1;
    let linearTotal = baseGain + addedMultiplier;
    
    // Apply the "(Compounding) Multiplication" upgrade (x2 per level, compounding)
    // We use Math.pow(2, level) which means 2 to the power of the upgrade level.
    let compoundingMultiplier = Math.pow(2, gameData.upgrades.compoundingMultiplication.level);
    
    // Calculate final gain
    let finalGain = linearTotal * compoundingMultiplier;
    return finalGain;
}

// Function to actually gain the studs
function earnStuds() {
    let amountToGain = calculateStudGain();
    gameData.studs += amountToGain;
    console.log(`Earned ${amountToGain} studs! Total: ${gameData.studs}`);
}

// 3. FEATURE UNLOCKS & PROGRESSION

// Function to unlock the initial difficulty chart (Costs 100 studs)
function unlockDifficultyChart() {
    if (!gameData.difficultyChartUnlocked && gameData.studs >= 100) {
        gameData.studs -= 100;
        gameData.difficultyChartUnlocked = true;
        
        // Unlocking the feature unlocks the two upgrades
        gameData.upgrades.multiplication.unlocked = true;
        gameData.upgrades.compoundingMultiplication.unlocked = true;
        
        console.log("Difficulty Chart Unlocked! New upgrades are now available.");
    } else {
        console.log("Not enough studs or already unlocked.");
    }
}

// Function to increase the difficulty (First level costs 10,000 studs)
function increaseDifficulty() {
    // We can set dynamic costs based on the current difficulty level.
    // For level 0 -> 1, the cost is 10,000.
    let cost = 10000; 
    
    if (gameData.difficultyLevel > 0) {
        // Example of how future levels could scale (e.g., 50,000, then 250,000)
        cost = 10000 * Math.pow(5, gameData.difficultyLevel); 
    }

    if (gameData.difficultyChartUnlocked && gameData.studs >= cost) {
        gameData.studs -= cost;
        gameData.difficultyLevel++;
        console.log(`Difficulty increased to Level ${gameData.difficultyLevel}!`);
        
        // Here you can add more code to unlock NEW boosts or upgrades 
        // based on the new difficulty level.
    } else {
        console.log(`Need ${cost} studs to increase difficulty.`);
    }
}

// 4. PURCHASING UPGRADES

// Function to buy the basic Multiplication upgrade
function buyMultiplicationUpgrade() {
    let upgrade = gameData.upgrades.multiplication;
    
    if (upgrade.unlocked && gameData.studs >= upgrade.cost) {
        gameData.studs -= upgrade.cost;
        upgrade.level++;
        
        // Increase the cost for the next purchase (e.g., cost increases by 1.5x)
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
        console.log(`Bought Multiplication! Level is now ${upgrade.level}.`);
    }
}

// Function to buy the Compounding upgrade
function buyCompoundingUpgrade() {
    let upgrade = gameData.upgrades.compoundingMultiplication;
    
    if (upgrade.unlocked && gameData.studs >= upgrade.cost) {
        gameData.studs -= upgrade.cost;
        upgrade.level++;
        
        // Compounding upgrades usually have steeper cost scaling (e.g., cost increases by 3x)
        upgrade.cost = Math.floor(upgrade.cost * 3);
        console.log(`Bought Compounding Multiplication! Level is now ${upgrade.level}.`);
    }
}
