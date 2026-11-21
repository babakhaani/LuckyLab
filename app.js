/* LuckyLab testnet starter. Games below are LOCAL DEMOS, not on-chain wagers. */
const CONFIG = {
  networkName: "Nile testnet",
  contractAddress: "", // Set only after a reviewed contract is deployed to Nile.
  startingDemoCredits: 1000,
  minesCount: 3,
  crashPointMax: 8
};
const state = {
  game: "dice", credits: CONFIG.startingDemoCredits, address: "",
  balance: null, history: [], dicePick: 50, mines: [], revealed: [],
  mineOver: false, crashPoint: 1, crashRunning: false, crashTimer: null
};
const $ = (id) => document.getElementById(id);
const game = $("game");
const money = n => Number(n).toFixed(2);
const shortAddress = a => a ? a.slice(0,7)+"…"+a.slice(-6) : "Not connected";

async function connectWallet() {
  try {
    if (!window.tronLink && !window.tronWeb) {
      alert("TronLink wallet not found. Install/enable the official TronLink browser extension or open this site in a supported TronLink browser.");
      return;
    }
    if (window.tronLink?.request) await window.tronLink.request({method:"tron_requestAccounts"});
    const tw = window.tronWeb;
    if (!tw?.defaultAddress?.base58) throw new Error("Wallet account not available. Unlock TronLink and approve the connection.");
    const host = String(tw.fullNode?.host || "");
    if (!/nile/i.test(host)) {
      $("wallet-note").textContent = "Wallet connected, but the selected network does not look like Nile testnet. Switch TronLink to Nile Testnet before using testnet features.";
      $("network").textContent = "WRONG NETWORK";
    } else {
      $("network").textContent = "NILE TESTNET";
      $("wallet-note").textContent = "Wallet connected to Nile. Deposits and withdrawals remain locked until the reviewed contract is deployed and configured.";
    }
    state.address = tw.defaultAddress.base58;
    $("address").textContent = shortAddress(state.address);
    $("connect").textContent = "Wallet connected";
    try {
      const sun = await tw.trx.getBalance(state.address);
      state.balance = sun / 1e6;
      $("balance").textContent = `${money(state.balance)} test TRX balance`;
    } catch { $("balance").textContent = "Connected · balance unavailable"; }
  } catch (e) {
    alert(e.message || "Could not connect wallet.");
  }
}
$("connect").addEventListener("click", connectWallet);

function addHistory(name, detail, result) {
  state.history.unshift({name,detail,result,time:new Date().toLocaleTimeString()});
  state.history = state.history.slice(0,25);
}
function shell(title, tag, desc, content) {
  game.innerHTML = `<section class="game-card"><div class="game-head"><div><div class="eyebrow">${tag}</div><h2>${title}</h2></div><span class="pill">DEMO CREDITS · ${state.credits}</span></div><p class="muted">${desc}</p>${content}<div class="game-foot"><span>Practice credits: <b>${state.credits}</b></span><span>Not TRX · no cash value</span></div></section>`;
}
function renderDice() {
  shell("Dice", "GAME 01", "Choose a win chance, set a demo stake and roll. Payouts are simulated locally.", `
    <div class="dice-stage"><div class="die" id="die">⚄</div></div>
    <div class="control-row"><label>Win chance <b id="chance-label">50%</b><input id="chance" type="range" min="10" max="90" value="${state.dicePick}"></label><label>Demo stake<input id="stake" type="number" min="1" max="${state.credits}" value="10"></label></div>
    <div class="payout">Potential demo return <strong id="potential">19.60 credits</strong></div>
    <button class="cta" id="roll">ROLL DICE</button><p class="message" id="dice-result">Ready when you are.</p>`);
  $("chance").addEventListener("input",e=>{state.dicePick=+e.target.value;$("chance-label").textContent=state.dicePick+"%";$("potential").textContent=money(+ $("stake").value * (0.98/(state.dicePick/100)))+" credits";});
  $("stake").addEventListener("input",()=>{$("potential").textContent=money(+$("stake").value*(0.98/(state.dicePick/100)))+" credits";});
  $("roll").addEventListener("click",()=>{
    const stake=+$("stake").value, chance=state.dicePick;
    if(!Number.isFinite(stake)||stake<1||stake>state.credits){$("dice-result").textContent="Enter a valid stake within your demo credits.";return;}
    state.credits-=stake;
    const roll=Math.random()*100, win=roll<chance, ret=win?stake*0.98/(chance/100):0;
    state.credits+=ret; $("die").textContent=["⚀","⚁","⚂","⚃","⚄","⚅"][Math.floor(Math.random()*6)];
    $("dice-result").textContent=win?`WIN · ${money(ret)} demo credits returned`:`LOSE · rolled ${roll.toFixed(2)} (needed under ${chance})`;
    addHistory("Dice",`Stake ${stake} · chance ${chance}%`,win?"WIN":"LOSE");renderDice();
  });
}
function newMines() {
  state.mines=Array(25).fill(false);let count=0;
  while(count<CONFIG.minesCount){const i=Math.floor(Math.random()*25);if(!state.mines[i]){state.mines[i]=true;count++;}}
  state.revealed=[];state.mineOver=false;
}
function renderMines() {
  if(!state.mines.length||state.mineOver)newMines();
  shell("Mines", "GAME 02", "Open safe tiles and avoid hidden mines. This round is simulated in your browser.", `
    <div class="mines-grid">${Array.from({length:25},(_,i)=>`<button class="tile" data-tile="${i}" ${state.revealed.includes(i)||state.mineOver?"disabled":""}>${state.revealed.includes(i)?"💎":"?"}</button>`).join("")}</div>
    <div class="control-row"><label>Demo stake<input id="mine-stake" type="number" min="1" value="10" max="${state.credits}"></label><div class="muted">Mines: ${CONFIG.minesCount} / 25</div></div>
    <button class="cta" id="cashout" ${state.revealed.length===0||state.mineOver?"disabled":""}>COLLECT DEMO WIN</button>
    <button class="outline full" id="new-round">NEW ROUND</button><p class="message" id="mine-result">${state.revealed.length?`${state.revealed.length} safe tile(s) opened.`:"Choose a tile to start."}</p>`);
  game.querySelectorAll("[data-tile]").forEach(b=>b.addEventListener("click",()=>{
    const i=+b.dataset.tile;if(state.revealed.length===0){const s=+$("mine-stake").value;if(s<1||s>state.credits){$("mine-result").textContent="Enter a valid demo stake.";return;}state.mineStake=s;state.credits-=s;}
    state.revealed.push(i);
    if(state.mines[i]){state.mineOver=true;addHistory("Mines",`${state.revealed.length} tiles · stake ${state.mineStake}`,"MINE");renderMines();$("mine-result").textContent="BOOM · demo stake lost. Start a new round.";}
    else {renderMines();$("mine-result").textContent=`Safe tile! ${state.revealed.length} opened. Collect or continue.`;}
  }));
  $("cashout").addEventListener("click",()=>{const multiplier=1+state.revealed.length*.22;const ret=state.mineStake*multiplier;state.credits+=ret;state.mineOver=true;addHistory("Mines",`${state.revealed.length} safe · stake ${state.mineStake}`,`COLLECT ${money(ret)}`);renderMines();$("mine-result").textContent=`Collected ${money(ret)} demo credits.`;});
  $("new-round").addEventListener("click",()=>{newMines();renderMines();});
}
function renderCrash() {
  shell("Crash", "GAME 03", "Start a demo round, then collect before the multiplier crashes. Simulated locally.", `
    <div class="crash-stage"><div class="rocket">🚀</div><strong id="multiplier">1.00×</strong><span id="crash-state">Waiting for round</span></div>
    <div class="control-row"><label>Demo stake<input id="crash-stake" type="number" min="1" value="10" max="${state.credits}"></label><div class="muted">Demo credits only</div></div>
    <div class="two"><button class="cta" id="start-crash" ${state.crashRunning?"disabled":""}>START ROUND</button><button class="outline" id="collect" disabled>COLLECT</button></div><p class="message" id="crash-result">Ready for takeoff.</p>`);
  $("start-crash").addEventListener("click",()=>{
    const stake=+$("crash-stake").value;if(stake<1||stake>state.credits){$("crash-result").textContent="Enter a valid demo stake.";return;}
    state.credits-=stake;state.crashStake=stake;state.crashPoint=1+Math.random()* (CONFIG.crashPointMax-1);state.crashRunning=true;
    $("start-crash").disabled=true;$("collect").disabled=false;$("crash-state").textContent="IN FLIGHT";
    const started=Date.now();
    state.crashTimer=setInterval(()=>{
      const m=1+Math.pow((Date.now()-started)/1800,1.45);
      $("multiplier").textContent=m.toFixed(2)+"×";
      if(m>=state.crashPoint){clearInterval(state.crashTimer);state.crashRunning=false;$("collect").disabled=true;$("crash-state").textContent="CRASHED";$("crash-result").textContent=`Crashed at ${state.crashPoint.toFixed(2)}× · demo stake lost.`;addHistory("Crash",`Stake ${stake}`,`CRASH ${state.crashPoint.toFixed(2)}×`);renderCrash();}
    },80);
    $("collect").onclick=()=>{if(!state.crashRunning)return;clearInterval(state.crashTimer);state.crashRunning=false;const m=Math.min(state.crashPoint,1+Math.pow((Date.now()-started)/1800,1.45));const ret=stake*m;state.credits+=ret;addHistory("Crash",`Stake ${stake}`,`COLLECT ${m.toFixed(2)}×`);renderCrash();$("crash-result").textContent=`Collected ${money(ret)} demo credits at ${m.toFixed(2)}×.`;};
  });
}
function renderHistory(){
  game.innerHTML=`<section class="game-card"><div class="eyebrow">RECENT ROUNDS</div><h2>Activity</h2><p class="muted">Only this browser session's demo rounds are shown.</p>${state.history.length?`<div class="history">${state.history.map(h=>`<div class="history-row"><div><b>${h.name}</b><small>${h.detail} · ${h.time}</small></div><strong>${h.result}</strong></div>`).join("")}</div>`:`<div class="empty">No rounds yet. Play Dice, Mines or Crash to see activity here.</div>`}</section>`;
}
function render(){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.game===state.game));if(state.game==="dice")renderDice();else if(state.game==="mines")renderMines();else if(state.game==="crash")renderCrash();else renderHistory();}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{state.game=b.dataset.game;render();}));
$("deposit").addEventListener("click",()=>openWalletModal("Deposit"));
$("withdraw").addEventListener("click",()=>openWalletModal("Withdraw"));
function openWalletModal(action){$("modal-title").textContent=action;$("modal-copy").textContent="This action is intentionally unavailable until a reviewed game contract is deployed to Nile Testnet and its address is configured in app.js. No transfers are being accepted."; $("wallet-modal").hidden=false;}
$("close-modal").addEventListener("click",()=>$("wallet-modal").hidden=true);
$("wallet-modal").addEventListener("click",e=>{if(e.target===$("wallet-modal"))$("wallet-modal").hidden=true;});
if(!CONFIG.contractAddress){$("deposit").disabled=true;$("withdraw").disabled=true;}
render();