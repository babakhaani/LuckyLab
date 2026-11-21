/* LuckyLab prototype. No real wagers or fund transfers are performed. */
const $ = (id) => document.getElementById(id);
const state = {
  game: "dice", historyMode: "my", points: 1000, user: null,
  wallet: null, balance: null, bets: []
};
const sampleFeed = [
  {name:"Nova•••",game:"Dice",amount:25,result:"Win",demo:true},
  {name:"Player•••",game:"Mines",amount:10,result:"Cashout",demo:true},
  {name:"Lucky•••",game:"Crash",amount:40,result:"Bust",demo:true},
  {name:"Guest•••",game:"Plinko",amount:15,result:"Win",demo:true}
];
const games = {
  dice:{title:"Dice",desc:"Pick a number and roll the dice. Results are simulated locally.",button:"Roll dice"},
  mines:{title:"Mines",desc:"Choose a tile. This local demo uses a simple random safe/mine outcome.",button:"Reveal tile"},
  crash:{title:"Crash",desc:"Watch a simulated multiplier round. No real wagers or payouts.",button:"Start round"},
  plinko:{title:"Plinko",desc:"Drop a virtual ball into a randomly selected demo slot.",button:"Drop ball"}
};
function shortAddress(a){return a ? a.slice(0,6)+"…"+a.slice(-6) : ""}
function setMessage(el,msg){el.textContent=msg}
function renderAccount(){
  $("playerName").textContent=state.user?.name || "Guest player";
  $("playerEmail").textContent=state.user?.email || "Sign in to create a local player profile";
  $("points").textContent=state.points.toLocaleString();
  $("myBetCount").textContent=state.bets.length;
  $("logoutBtn").hidden=!state.user;
  $("authBtn").textContent=state.user ? "Account" : "Sign up / Login";
}
function renderWallet(){
  $("walletStatus").textContent=state.wallet ? "Connected" : "Not connected";
  $("walletHint").textContent=state.wallet ? "TronLink wallet detected" : "Connect TronLink on Nile testnet";
  $("walletAddress").textContent=state.wallet || "Wallet address will appear here";
  $("copyAddress").disabled=!state.wallet;
  $("trxBalance").innerHTML=state.balance===null ? "— <small>TRX</small>" : `${state.balance.toFixed(4)} <small>TRX</small>`;
  $("connectBtn").textContent=state.wallet ? "Wallet connected" : "Connect TronLink";
}
function getTronWeb(){
  return window.tronWeb || window.tronLink?.tronWeb || null;
}
async function connectWallet(){
  try{
    if(window.tronLink?.request){
      const response=await window.tronLink.request({method:"tron_requestAccounts"});
      if(response?.code && response.code!==200) throw new Error(response.message || "Wallet request was not approved.");
    }
    let tw=getTronWeb();
    if(!tw || !tw.ready){
      await new Promise(r=>setTimeout(r,900));
      tw=getTronWeb();
    }
    if(!tw || !tw.ready || !tw.defaultAddress?.base58){
      throw new Error("TronLink provider was not detected. Open this site inside TronLink's DApp browser and approve the connection.");
    }
    state.wallet=tw.defaultAddress.base58;
    renderWallet();
    await refreshBalance();
  }catch(e){alert(e.message || "Wallet connection failed.");}
}
async function refreshBalance(){
  try{
    const tw=getTronWeb();
    if(!tw || !state.wallet) throw new Error("Connect TronLink first.");
    const sun=await tw.trx.getBalance(state.wallet);
    state.balance=Number(sun)/1_000_000;
    renderWallet();
  }catch(e){$("walletHint").textContent=e.message || "Could not read balance.";}
}
function currentNetwork(){
  const tw=getTronWeb();
  const host=tw?.fullNode?.host || "";
  return host;
}
function setGame(game){
  state.game=game;
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.game===game));
  $("gameName").textContent=games[game].title;
  $("gameDescription").textContent=games[game].desc;
  $("playBtn").textContent=games[game].button;
  $("gameStage").innerHTML=game==="dice"
    ? '<div class="dice-face" id="diceFace">🎲</div><div class="muted" id="gameResult">Ready when you are.</div>'
    : `<div class="dice-face">${({mines:"💣",crash:"🚀",plinko:"🟣"})[game]}</div><div class="muted" id="gameResult">Ready when you are.</div>`;
  $("controlsExtra")?.remove();
}
function addBet(game,amount,result,won){
  const entry={game,amount,result,won,time:new Date().toLocaleTimeString(),demo:true};
  state.bets.unshift(entry);
  if(won){state.points+=amount;}else{state.points=Math.max(0,state.points-amount);}
  renderAccount();renderHistory();
}
function play(){
  const amount=Math.max(1,Math.min(1000,Number($("betAmount").value)||1));
  if(amount>state.points){alert("Not enough practice points. Sign in or reset the practice points.");return;}
  let result,won=false,visual="";
  if(state.game==="dice"){
    const n=1+Math.floor(Math.random()*6),pick=Number($("dicePick").value);
    result=`Rolled ${n} · ${n===pick?"Win":"Try again"}`;won=n===pick;visual=["⚀","⚁","⚂","⚃","⚄","⚅"][n-1];
  }else if(state.game==="mines"){
    const safe=Math.random()>.28;result=safe?"Safe tile · Practice win":"Mine hit · Practice loss";won=safe;visual=safe?"💎":"💥";
  }else if(state.game==="crash"){
    const multiplier=(1+Math.random()*4).toFixed(2);const survived=Math.random()>.35;result=`${multiplier}x · ${survived?"Practice cashout":"Crashed"}`;won=survived;visual=survived?"🚀":"💥";
  }else{
    const slot=Math.floor(Math.random()*7)-3;result=`Slot ${slot} · ${slot>0?"Practice win":"Practice result"}`;won=slot>0;visual="🟣";
  }
  $("gameStage").innerHTML=`<div class="dice-face">${visual}</div><div id="gameResult">${result}</div>`;
  addBet(games[state.game].title,amount,result,won);
}
function renderHistory(){
  const rows=state.historyMode==="my"
    ? state.bets.map(b=>({name:state.user?.name||"You",game:b.game,amount:b.amount,result:b.result,time:b.time}))
    : [...state.bets.map(b=>({name:state.user?.name||"You",game:b.game,amount:b.amount,result:b.result,time:b.time})),...sampleFeed];
  $("historyList").innerHTML=rows.length ? rows.map(r=>`<div class="history-item"><div><b>${escapeHtml(r.name)}</b><small>${escapeHtml(r.game)} · ${escapeHtml(r.time||"Sample")}</small></div><div><b>${Number(r.amount).toLocaleString()} pts</b><small>${escapeHtml(r.result)} · SAMPLE</small></div></div>`).join("") : '<p class="muted">No personal demo bets yet. Play a game to add one.</p>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
let authMode="signup";
function openAuth(){ $("authDialog").showModal(); $("authMessage").textContent=""; }
function switchAuth(){
  authMode=authMode==="signup"?"login":"signup";
  $("authTitle").textContent=authMode==="signup"?"Create your profile":"Welcome back";
  $("submitAuth").textContent=authMode==="signup"?"Create profile":"Log in";
  $("switchAuth").textContent=authMode==="signup"?"I already have an account":"Create a new player profile";
  $("displayName").parentElement.hidden=authMode==="login";
}
function authSubmit(e){
  e.preventDefault();
  const email=$("email").value.trim().toLowerCase(),password=$("password").value;
  const key="luckylab_demo_users";
  const users=JSON.parse(localStorage.getItem(key)||"{}");
  if(authMode==="signup"){
    if(users[email]){setMessage($("authMessage"),"An account already exists in this browser.");return;}
    users[email]={name:$("displayName").value.trim()||"Lucky player",password};
    localStorage.setItem(key,JSON.stringify(users));
  }else if(!users[email]||users[email].password!==password){
    setMessage($("authMessage"),"Email or password is incorrect for this browser demo.");return;
  }
  state.user={email,name:users[email].name};
  $("authDialog").close();renderAccount();renderHistory();
}
function logout(){state.user=null;state.bets=[];state.points=1000;renderAccount();renderHistory();}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setGame(b.dataset.game)));
document.querySelectorAll(".history-tabs button").forEach(b=>b.addEventListener("click",()=>{state.historyMode=b.dataset.history;document.querySelectorAll(".history-tabs button").forEach(x=>x.classList.toggle("active",x===b));renderHistory();}));
$("connectBtn").addEventListener("click",connectWallet);
$("refreshBalance").addEventListener("click",refreshBalance);
$("copyAddress").addEventListener("click",async()=>{if(state.wallet){await navigator.clipboard.writeText(state.wallet);$("copyAddress").textContent="Copied";}});
const openAddTrx = () => {$("fundsTitle").textContent="Add TRX";$("fundsDialog").showModal();};
$("depositBtn").addEventListener("click",openAddTrx);
$("addTrxTop").addEventListener("click",openAddTrx);
$("withdrawBtn").addEventListener("click",()=>{$("fundsTitle").textContent="Withdraw";$("fundsDialog").showModal();});
$("playBtn").addEventListener("click",play);
$("authBtn").addEventListener("click",openAuth);
$("switchAuth").addEventListener("click",switchAuth);
$("authForm").addEventListener("submit",authSubmit);
$("logoutBtn").addEventListener("click",logout);
window.addEventListener("load",()=>{
  renderAccount();renderWallet();renderHistory();
  const tw=getTronWeb();
  if(tw?.ready&&tw.defaultAddress?.base58){state.wallet=tw.defaultAddress.base58;renderWallet();refreshBalance();}
});
window.addEventListener("message",e=>{
  if(e.data?.message?.action==="accountsChanged"||e.data?.message?.action==="setAccount"){
    const tw=getTronWeb();state.wallet=tw?.defaultAddress?.base58||null;state.balance=null;renderWallet();if(state.wallet)refreshBalance();
  }
});
