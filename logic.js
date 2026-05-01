
window.getCost = function(id) {
    if (id === 'base') {
        let cap = (game.spike >= 2) ? 15 : 10;
        if (game.baseLvl.gte(cap)) return "MAXED";
        if (game.baseLvl.eq(0)) return "FREE";
        if (game.baseLvl.gte(10)) return EN(1000).mul(EN(5).pow(game.baseLvl.sub(10)));
        return EN(2).mul(EN(1.2).pow(game.baseLvl.sub(1)));
    }
    if (id === 'boost') {
        let cap = (game.spike >= 2) ? 20 : 15;
        if (game.skybox >= 1) cap += 5;
        if (game.boostLvl.gte(cap)) return "MAXED";
        
        if (game.boostLvl.gte(15)) {
            let baseAt15 = EN(150).mul(EN(1.45).pow(15));
            return baseAt15.mul(EN(1.75).pow(game.boostLvl.sub(15)));
        }
        return EN(150).mul(EN(1.45).pow(game.boostLvl));
    }
    if (id === 'flingers') {
        if (game.flingersLvl.gte(3)) return "MAXED";
        return EN(100000).mul(EN(20).pow(game.flingersLvl));
    }
    if (id === 'acc') return game.accBought ? "BOUGHT" : EN(1250);

    // Darkness Upgrades
    if (id === 'dark1') {
        if (game.darkUpg1.gte(3)) return "MAXED"; // Capped at 3
        return EN(15).mul(EN(3).pow(game.darkUpg1)); 
    }
    if (id === 'dark2') {
        if (game.darkUpg2.gte(10)) return "MAXED"; // Capped at 10
        return EN(100).mul(EN(2.5).pow(game.darkUpg2)); 
    }
    if (id === 'dark3') {
        return game.darkUpg3 ? "BOUGHT" : EN(1250); // One-time
    }
    return EN(0);
};

window.getPPS = function() {
    let p = EN(game.baseLvl);
    p = p.mul(EN(1.35).pow(game.boostLvl));
    p = p.mul(EN(10).pow(game.flingersLvl));
    
    if (game.spike >= 1) p = p.mul(2);
    if (game.spike >= 2) p = p.mul(4); 
    
    if (game.accBought) {
        let accBoost = game.studs.add(10).log10();
        if (game.darkUpg3) accBoost = accBoost.pow(1.75); // VELOCITY EFFECT
        p = p.mul(accBoost);
    }

    if (game.skybox >= 1) {
        p = p.mul(100); 
        let darkLog = game.darkStuds.max(1).log10().add(1);
        p = p.mul(darkLog.pow(1.5));
        p = p.mul(EN(5).pow(game.darkUpg1));
    }
    
    return p;
};

window.getDarkGain = function() {
    if (game.skybox < 1) return EN(0);
    let gain = EN(1);
    gain = gain.mul(EN(2.5).pow(game.darkUpg1));
    gain = gain.mul(EN(1.75).pow(game.darkUpg2)); // DARKER EFFECT
    return gain;
};

window.buySkybox = function() {
    if (game.studs.gte(10000000000) && game.skybox === 0) {
        game.skybox = 1;
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

    if (id.startsWith('dark')) {
        if (game.darkStuds.gte(price)) {
            game.darkStuds = game.darkStuds.sub(price);
            if (id === 'dark1') game.darkUpg1 = game.darkUpg1.add(1);
            if (id === 'dark2') game.darkUpg2 = game.darkUpg2.add(1);
            if (id === 'dark3') game.darkUpg3 = true;
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
