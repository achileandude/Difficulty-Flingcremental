window.switchTab = function(tab) {
    document.getElementById('tab-main').style.display = (tab === 'main') ? 'flex' : 'none';
    document.getElementById('tab-darkness').style.display = (tab === 'darkness') ? 'flex' : 'none';
    document.getElementById('btn-tab-main').classList.toggle('active', tab === 'main');
    document.getElementById('btn-tab-darkness').classList.toggle('active', tab === 'darkness');
};

function updateUI() {
    if (typeof game === "undefined") return;

    // 1. STATS
    document.getElementById("stud-display").innerText = format(game.studs);
    document.getElementById("pps-display").innerText = format(getPPS());

    // 2. SPIKES (Logarithmic Formula!)
    const spikeArea = document.getElementById("spike-area");
    if (spikeArea) {
        if (game.studs.gte(100) || game.spike > 0) spikeArea.style.display = "block";

        if (game.spike < SPIKES.length) {
            let s = SPIKES[game.spike];
            let canProgress = s.extraReq ? s.extraReq() : true;
            
            let nameEl = document.getElementById("spike-name");
            nameEl.className = "spike-header outlined-text";
            if (game.spike === 1) nameEl.classList.add("spike-lower-gap");

            if (canProgress) {
                nameEl.innerText = "Next: " + s.name;
                
                // LOGARITHMIC PROGRESS BAR MATH
                let logStuds = game.studs.max(1).log10().toNumber();
                let logReq = s.req.log10().toNumber();
                let perc = Math.max(0, Math.min(100, (logStuds / logReq) * 100));
                
                document.getElementById("ms-fill").style.width = perc + "%";
                if (game.studs.gte(s.req)) game.spike++;
            } else {
                nameEl.innerText = "Locked (" + s.reqText + ")";
                document.getElementById("ms-fill").style.width = "0%";
            }
        } else {
            document.getElementById("spike-name").innerText = SPIKES[game.spike-1].name + " (BEATEN)";
            document.getElementById("ms-fill").style.width = "100%";
        }
    }

    // 3. CAPS
    let capBase = game.spike >= 2 ? 15 : 10;
    let capBoost = game.spike >= 2 ? 20 : 15;
    if (game.skybox >= 1) capBoost += 5; // Blackbox Boost

    let c1 = getCost('base');
    document.getElementById("lvl-base").innerText = game.baseLvl.toString() + "/" + capBase;
    document.getElementById("cost-base").innerText = (typeof c1 === "string") ? c1 : format(c1);

    const boostCard = document.getElementById("upg-boost");
    if (boostCard) {
        if (game.spike >= 1) {
            boostCard.classList.remove("hidden");
            let c2 = getCost('boost');
            document.getElementById("lvl-boost").innerText = game.boostLvl.toString() + "/" + capBoost;
            document.getElementById("cost-boost").innerText = (typeof c2 === "string") ? c2 : format(c2);
        } else { boostCard.classList.add("hidden"); }
    }

    const accCard = document.getElementById("upg-acc");
    if (accCard) {
        if (game.boostLvl.gte(5)) {
            accCard.classList.remove("hidden");
            let cAcc = getCost('acc');
            document.getElementById("cost-acc").innerText = (typeof cAcc === "string") ? cAcc : format(cAcc);
            if (game.accBought) accCard.classList.add("disabled");
        } else { accCard.classList.add("hidden"); }
    }

    const flingersCard = document.getElementById("upg-flingers");
    if (flingersCard) {
        if (game.spike >= 2) {
            flingersCard.classList.remove("hidden");
            let c3 = getCost('flingers');
            document.getElementById("lvl-flingers").innerText = game.flingersLvl.toString() + "/3";
            document.getElementById("cost-flingers").innerText = (typeof c3 === "string") ? c3 : format(c3);
            if (c3 === "MAXED") flingersCard.classList.add("disabled");
        } else { flingersCard.classList.add("hidden"); }
    }

    // 4. SKYBOX UI
    const skyboxCard = document.getElementById("upg-skybox");
    if (skyboxCard) {
        // Appears when Flingers is Maxed!
        if (game.flingersLvl.gte(3) && game.skybox === 0) {
            skyboxCard.classList.remove("hidden");
        } else { skyboxCard.classList.add("hidden"); }
    }

    // 5. DARKNESS UI
    if (game.skybox >= 1) {
        document.getElementById("btn-tab-darkness").classList.remove("hidden");
        document.getElementById("dark-display").innerText = format(game.darkStuds);
        
        let darkPPS = EN(1).mul(EN(2.5).pow(game.darkUpg1));
        document.getElementById("dark-pps-display").innerText = format(darkPPS);
        
        let darkBoost = game.darkStuds.max(1).log10().add(1).pow(1.5);
        document.getElementById("dark-boost-display").innerText = format(darkBoost);

        let cd1 = getCost('dark1');
        document.getElementById("lvl-dark1").innerText = game.darkUpg1.toString();
        document.getElementById("cost-dark1").innerText = format(cd1);
    }
}

function startGameLoop() {
    if (!game.lastTick) game.lastTick = Date.now();
    setInterval(() => {
        let now = Date.now();
        let diff = (now - game.lastTick) / 1000;
        if (isNaN(diff) || diff < 0) diff = 0;

        // Generate Studs
        game.studs = game.studs.add(getPPS().mul(diff));
        
        // Generate Darkness
        if (game.skybox >= 1) {
            let darkGain = EN(1).mul(EN(2.5).pow(game.darkUpg1)).mul(diff);
            game.darkStuds = game.darkStuds.add(darkGain);
        }

        game.lastTick = now;
        updateUI();
    }, 10);
}

setInterval(save, 10000);
window.onload = () => { load(); startGameLoop(); };
