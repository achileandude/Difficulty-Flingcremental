window.getCost = function(id) {
    if (id === 'base') {
        let cap = (game.spike >= 2) ? 15 : 10;
        if (game.baseLvl.gte(cap)) return "MAXED";
        
        if (game.baseLvl.eq(0)) return "FREE";
        if (game.baseLvl.gte(10)) return EN(1000).mul(EN(5).pow(game.baseLvl.sub(10)));
        // Post-level 1: base 2, scales x1.2
        return EN(2).mul(EN(1.2).pow(game.baseLvl.sub(1)));
    }

    if (id === 'boost') {
        let cap = (game.spike >= 2) ? 20 : 15;
        if (game.skybox >= 1) cap += 5; // Blackbox adds +5 Cap
        if (game.boostLvl.gte(cap)) return "MAXED";
        
        if (game.boostLvl.gte(15)) {
            let baseAt15 = EN(150).mul(EN(1.45).pow(15));
            return baseAt15.mul(EN(1.75).pow(game.boostLvl.sub(15))); // Harsh scaling 1.75
        }
        return EN(150).mul(EN(1.45).pow(game.boostLvl)); // Normal scaling 1.45
    }
    
    if (id === 'flingers') {
        if (game.flingersLvl.gte(3)) return "MAXED";
        return EN(100000).mul(EN(20).pow(game.flingersLvl));
    }
    
    if (id === 'acc') return game.accBought ? "BOUGHT" : EN(1250);

    if (id === 'dark1') {
        // Starts at 15, scales x3
        return EN(15).mul(EN(3).pow(game.darkUpg1)); 
    }
    return EN(0);
};

window.getPPS = function() {
    let p = EN(game.baseLvl);
    p = p.mul(EN(1.35).pow(game.boostLvl));
    p = p.mul(EN(10).pow(game.flingersLvl));
    
    if (game.spike >= 1) p = p.mul(2);
    if (game.spike >= 2) p = p.mul(4); 
    
    if (game.accBought) p = p.mul(game.studs.add(10).log10());

    // SKYBOX BOOSTS
    if (game.skybox >= 1) {
        p = p.mul(100); // Blackbox Flat Multiplier
        
        // Darkness Synergy: (log(Darkness Studs) + 1)^1.5
        let darkLog = game.darkStuds.max(1).log10().add(1);
        p = p.mul(darkLog.pow(1.5));

        // Dark Upgrade Boost (x5 per level)
        p = p.mul(EN(5).pow(game.darkUpg1));
    }
    
    return p;
};

// --- PRESTIGE RESET ---
window.buySkybox = function() {
    if (game.studs.gte(10000000000) && game.skybox === 0) { // 10 Billion
        game.skybox = 1; // Unlocks Blackbox
        
        // RESET EVERYTHING
        game.studs = EN(0);
        game.baseLvl = EN(0);
        game.boostLvl = EN(0);
        game.flingersLvl = EN(0);
        game.accBought = false;
        game.spike = 0;
        
        updateUI();
    }
};

window.buy = function(id) {
    let cost = getCost(id);
    if (cost === "MAXED" || cost === "BOUGHT") return;
    let price = (cost === "FREE") ? EN(0) : cost;

    // Check which currency to use
    if (id === 'dark1') {
        if (game.darkStuds.gte(price)) {
            game.darkStuds = game.darkStuds.sub(price);
            game.darkUpg1 = game.darkUpg1.add(1);
            updateUI();
        }
    } else {
        if (game.studs.gte(price)) {
            game.studs = game.studs.sub(price);
            if (id === 'base') game.baseLvl = game.baseLvl.add(1);
            if (id === 'boost') game.boostLvl = game.boostLvl.add(1);
            if (id === 'flingers') game.flingersLvl = game.flingersLvl.add(1);
            if (id === 'acc') game.accBought = true;
            updateUI();
        }
    }
};
