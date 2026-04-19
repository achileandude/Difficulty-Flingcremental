/**
 * main.js - Handles the game loop, UI updates, and persistence
 */

function updateStatsTab() {
  const totalEl = document.getElementById("stats-total");
  const timeEl = document.getElementById("stats-time");
  const trialsEl = document.getElementById("stats-trials");
  if (totalEl) totalEl.innerText = format(game.totalStuds);
  if (timeEl) timeEl.innerText = Math.floor(game.playTime) + "s";
  if (trialsEl)
    trialsEl.innerText = game.trialCompletions.filter(Boolean).length;
}

function updateUI() {
  // Top Stats
  document.getElementById("stud-display").innerText = format(game.studs);
  document.getElementById("pps-display").innerText =
    "+" + format(getPPS()) + "/s";
  document.getElementById("bp-count").innerText = format(game.baseplates);

  // Tab Unlocks
  if (game.baseLvl.gte(15))
    document.getElementById("tab-btn-spikes").classList.remove("hidden");
  if (game.spike >= 3)
    document.getElementById("tab-btn-baseplates").classList.remove("hidden");
  if (game.spike >= 3)
    document.getElementById("tab-btn-trials").classList.remove("hidden");
  if (game.spike >= 4)
    document.getElementById("tab-btn-tree").classList.remove("hidden");

  // Spike Progress
  let next = SPIKES[game.spike];
  if (next) {
    document.getElementById("ms-container").classList.remove("hidden");
    document.getElementById("ms-fill").style.width =
      Math.min(100, game.studs.div(next.req).mul(100).toNumber()) + "%";
    document.getElementById("ms-desc").innerText =
      `Next: ${next.name} (${format(next.req)})`;
    if (game.studs.gte(next.req)) {
      game.spike++;
      updateMilestones();
    }
  }

  // Tier Display
  const t = document.getElementById("tier-name");
  t.innerText =
    game.spike === 0
      ? "UNRANKED"
      : SPIKES[Math.min(game.spike - 1, SPIKES.length - 1)].name;
  t.className = `tier-display tier-${Math.min(game.spike, 2)}`;

  // Unlock upgrades based on spikes
  if (game.spike >= 1)
    ["mult", "comp"].forEach((i) =>
      document.getElementById("upg-" + i)?.classList.remove("hidden"),
    );
  if (game.spike >= 2)
    ["acc", "vel"].forEach((i) =>
      document.getElementById("upg-" + i)?.classList.remove("hidden"),
    );
  if (game.bpUpg3)
    document.getElementById("upg-weak")?.classList.remove("hidden");

  // Upgrade Cards
  ["base", "mult", "comp", "acc", "vel", "weak"].forEach((id) => {
    let card = document.getElementById(`upg-${id}`);
    if (card && !card.classList.contains("hidden")) {
      let cost = getCost(id);
      document.getElementById(`cost-${id}`).innerText =
        typeof cost === "string" ? cost : "Cost: " + format(cost);
      let lvl = document.getElementById(`lvl-${id}`);
      if (id === "acc" || id === "vel") {
        lvl.innerText = game[id + "Bought"] ? "1/1" : "0/1";
      } else {
        let m = 50; // Default for weak
        if (id === "base") m = 15;
        else if (id === "mult")
          m = 30 + (game.bpUpg1 ? 70 : 0) + (game.trialCompletions[1] ? 25 : 0);
        else if (id === "comp") m = game.bpUpg1 ? 25 : 15;
        else if (id === "weak") m = 50 + (game.bpUpg4 ? 25 : 0);
        lvl.innerText = game[id + "Lvl"].toNumber() + "/" + m;
      }
      let canAfford = typeof cost !== "string" && game.studs.gte(cost);
      card.classList.toggle(
        "disabled",
        !canAfford || cost === "Maxed" || cost === "Bought",
      );
    }
  });

  // Baseplate Reset Button
  let btn = document.getElementById("bp-reset-btn");
  if (btn) {
    btn.classList.toggle("ready", game.studs.gte(5e20));
    document.getElementById("bp-gain").innerText = format(getBaseplateGain());
  }

  // BP Upgrade Cards
  [1, 2, 3, 4, 5].forEach((i) => {
    let costs = [0, 1, 3, 100, 5e8, 1e18];
    let card = document.getElementById("bp-upg-" + i);
    if (card) {
      card.classList.toggle(
        "disabled",
        game.baseplates.lt(EN(costs[i])) || game["bpUpg" + i],
      );
      document.getElementById("bp-lvl-" + i).innerText = game["bpUpg" + i]
        ? "1/1"
        : "0/1";
    }
  });

  // Trial Text
  const trialText = document.getElementById("active-trial-text");
  if (trialText) {
    if (game.activeTrial) {
      trialText.innerText = "CURRENTLY IN TRIAL " + game.activeTrial;
      trialText.classList.remove("hidden");
    } else {
      trialText.classList.add("hidden");
    }
  }

  updateStatsTab();
}

function updateMilestones() {
  let h = "";
  for (let i = 0; i <= Math.min(game.spike, SPIKES.length - 1); i++) {
    let s = SPIKES[i];
    let unlocked = game.spike > i;
    h += `<div class="milestone-entry" style="border-color: ${unlocked ? (i >= 2 ? "#a0f" : "#0f0") : "#444"}">
    <b style="color:${unlocked ? "#fff" : "#666"}">${s.name}</b><br>
    <small>${s.desc}</small><br>
    <small style="color:var(--accent)">Req: ${format(s.req)} Studs</small>
    </div>`;
  }
  let el = document.getElementById("spike-list");
  if (el) el.innerHTML = h;
}

function enterTrial(n) {
  if (game.activeTrial !== null) return;
  if (confirm("Enter Trial " + n + "? (Forced Reset)")) {
    game.activeTrial = n;
    resetBaseplate(true);
  }
}

function abandonTrial() {
  if (
    confirm(
      "Abandoning the trial will reset your progress without a reward. Proceed?",
    )
  ) {
    game.activeTrial = null;
    resetBaseplate(true);
  }
}

function resetBaseplate(forced = false) {
  if (game.activeTrial !== null && !forced) {
    alert(
      "You cannot Fling while in a Trial! Complete the goal or Abandon it.",
    );
    return;
  }

  let gain = getBaseplateGain();

  if (
    !forced &&
    !confirm(
      "Fling for " +
        format(gain) +
        " Baseplates? This resets your Studs and Upgrades!",
    )
  )
    return;

  game.baseplates = game.baseplates.add(gain);

  // RESET LOGIC
  game.studs = EN(0);
  game.spike = 0;
  game.baseLvl = EN(0);
  game.multLvl = EN(0);
  game.compLvl = EN(0);
  game.weakLvl = EN(0);
  game.accBought = false;
  game.velBought = false;

  showTab("upgrades");
  updateUI();
}

function buyBP(n) {
  let costs = [0, 1, 3, 100, 5e8, 1e18];
  if (game.baseplates.gte(EN(costs[n])) && !game["bpUpg" + n]) {
    game.baseplates = game.baseplates.sub(EN(costs[n]));
    game["bpUpg" + n] = true;
    updateUI();
  }
}

function save() {
  localStorage.setItem("flingcrementalSave", JSON.stringify(game));
}

function load() {
  let s = localStorage.getItem("flingcrementalSave");
  if (!s) return;
  let d = JSON.parse(s);

  // Safety conversion for ExpantaNum
  Object.keys(d).forEach((key) => {
    if (game[key] instanceof ExpantaNum) game[key] = EN(d[key]);
    else game[key] = d[key];
  });

  // Fix Tree Array Specifically (with safety check)
  // Indices 0,1,4,5,8,9... are Booleans (one-time upgrades)
  // Indices 2,3,6,7... are ExpantaNum (leveling upgrades)
  if (d.tree && Array.isArray(d.tree)) {
    game.tree = d.tree.map((v, i) => {
      const isLevelingIndex = i % 4 >= 2; // Indices 2,3,6,7,10,11...
      return isLevelingIndex ? EN(v || 0) : v;
    });
  }

  updateUI();
  updateMilestones();
}

function hardReset() {
  if (confirm("WIPE EVERYTHING?")) {
    localStorage.clear();
    location.reload();
  }
}

function setNotation(n) {
  game.notation = n;
  updateUI();
}

// Global ShowTab
function showTab(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById("tab-" + id).classList.remove("hidden");
}

function gameLoop() {
  load();
  setInterval(() => {
    let now = Date.now();
    let diff = (now - game.lastTick) / 1000;
    let gained = getPPS().mul(diff);
    game.studs = game.studs.add(gained);
    game.totalStuds = game.totalStuds.add(gained);
    game.playTime += diff;
    game.lastTick = now;

    // Trial 4: Cap at 1e100
    if (game.activeTrial === 4) {
      if (game.studs.gt(EN(1e100))) {
        game.studs = EN(1e100);
      }
    }

    // Check for trial completion
    if (game.activeTrial) {
      if (game.studs.gte(TRIAL_GOALS[game.activeTrial - 1])) {
        game.trialCompletions[game.activeTrial - 1] = true;
        let t = game.activeTrial;
        game.activeTrial = null;
        alert("Trial " + t + " Complete!");
        resetBaseplate(true);
      }
    }

    updateUI();
  }, 50);

  // Auto-save every 10 seconds
  setInterval(save, 10000);
}

gameLoop();
