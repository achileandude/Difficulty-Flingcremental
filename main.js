/**
 * main.js - Handles the game loop, UI updates, and persistence
 */

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

  // Upgrade Cards
  ["base", "mult", "comp", "acc", "vel", "weak"].forEach((id) => {
    let card = document.getElementById(`upg-${id}`);
    if (card && !card.classList.contains("hidden")) {
      let cost = getCost(id);
      document.getElementById(`cost-${id}`).innerText =
        typeof cost === "string" ? cost : "Cost: " + format(cost);
      let canAfford = typeof cost !== "string" && game.studs.gte(cost);
      card.classList.toggle("disabled", !canAfford);
    }
  });

  // Trial Text
  const trialText = document.getElementById("active-trial-text");
  if (game.activeTrial) {
    trialText.innerText = "IN TRIAL " + game.activeTrial;
    trialText.classList.remove("hidden");
  } else {
    trialText.classList.add("hidden");
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

  // Fix Tree Array Specifically
  game.tree = d.tree.map((v, i) => (i % 2 === 1 ? EN(v) : v));

  updateUI();
  updateMilestones();
}

function hardReset() {
  if (confirm("WIPE EVERYTHING?")) {
    localStorage.clear();
    location.reload();
  }
}

// Global ShowTab
function showTab(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById("tab-" + id).classList.remove("hidden");
}

// Initial Run
load();
setInterval(() => {
  let now = Date.now();
  let diff = (now - game.lastTick) / 1000;
  let gained = getPPS().mul(diff);
  game.studs = game.studs.add(gained);
  game.totalStuds = game.totalStuds.add(gained);
  game.playTime += diff;
  game.lastTick = now;

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
