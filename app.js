const $ = id => document.getElementById(id);
const KEY = 'luckylab_state_v1';
let state;
try { state = JSON.parse(localStorage.getItem(KEY) || '{"users":{},"user":null,"balance":0,"bets":[]}'); }
catch { state = {users:{}, user:null, balance:0, bets:[]}; }
let authMode = 'signup';
let selected = 'Dice';
const HOUSE_EDGE = 0.01;

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
}
function currentUser() { return state.user ? state.users[state.user] : null; }
function fmt(n) { return Number(n || 0).toFixed(6); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function masked(n) { return n.length < 3 ? n[0] + '***' : n.slice(0, Math.ceil(n.length/2)) + '***'; }

function rows(bets, mine) {
  return bets.slice().reverse().slice(0,50).map(b => `<tr>
    <td class="player">${mine ? esc(b.username) : masked(b.username)}</td>
    <td>${esc(b.game)}</td><td>${fmt(b.amount)}</td><td>${esc(b.result)}</td>
    <td class="${b.profit >= 0 ? 'positive' : 'negative'}">${b.profit >= 0 ? '+' : ''}${fmt(b.profit)}</td>
  </tr>`).join('');
}
function render() {
  const bal = fmt(state.balance);
  $('balance').textContent = bal;
  $('heroBalance').textContent = bal + ' TRX';
  $('authBtn').textContent = state.user ? 'Logout' : 'Login';
  $('myBets').innerHTML = state.user
    ? (state.bets.some(b => b.username === state.user) ? rows(state.bets.filter(b => b.username === state.user), true) : '<tr><td colspan="5">No bets yet</td></tr>')
    : '<tr><td colspan="5">Log in to view your bets</td></tr>';
  $('allBets').innerHTML = state.bets.length ? rows(state.bets, false) : '<tr><td colspan="5">No bets yet</td></tr>';
  updateDiceValues();
}
function note(message) { $('walletNote').textContent = message; }

$('authBtn').onclick = () => {
  if (state.user) { state.user = null; save(); }
  else { $('authMessage').textContent = ''; $('authDialog').showModal(); }
};
$('closeAuth').onclick = () => $('authDialog').close();
$('toggleAuth').onclick = () => {
  authMode = authMode === 'signup' ? 'login' : 'signup';
  $('authTitle').textContent = authMode === 'signup' ? 'Create account' : 'Login';
  $('authSubmit').textContent = authMode === 'signup' ? 'Sign up' : 'Login';
  $('toggleAuth').textContent = authMode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign up';
};
$('authSubmit').onclick = () => {
  const n = $('username').value.trim(), p = $('password').value;
  if (n.length < 3 || p.length < 6) { $('authMessage').textContent = 'Username must be 3+ characters and password 6+.'; return; }
  if (authMode === 'signup') {
    if (state.users[n]) { $('authMessage').textContent = 'Username already exists.'; return; }
    state.users[n] = {password:p, balance:0}; state.balance = 0;
  } else {
    if (!state.users[n] || state.users[n].password !== p) { $('authMessage').textContent = 'Incorrect username or password.'; return; }
    state.balance = Number(state.users[n].balance || 0);
  }
  state.user = n; state.users[n].balance = state.balance; $('authDialog').close(); save();
};

// Explicitly demo-only credit controls; these do not send or receive blockchain funds.
$('deposit').onclick = () => {
  const a = Number($('depositAmount').value);
  if (!state.user) return note('Please log in first.');
  if (!(a > 0) || !Number.isFinite(a)) return note('Enter a valid demo amount.');
  state.balance += a; state.users[state.user].balance = state.balance;
  note('Demo credits added locally. No Testnet TRX was transferred.'); save();
};
$('withdraw').onclick = () => {
  const a = Number($('withdrawAmount').value);
  if (!state.user) return note('Please log in first.');
  if (!(a > 0) || a > state.balance) return note('Enter a valid amount within your demo balance.');
  state.balance -= a; state.users[state.user].balance = state.balance;
  note('Demo balance reduced locally. No blockchain withdrawal was made.'); save();
};

function updateDiceValues() {
  const target = Math.min(99.99, Math.max(1, Number($('rollTarget').value) || 51.5));
  const chance = Math.max(0.01, 100 - target);
  const multiplier = (100 - HOUSE_EDGE) / chance;
  const bet = Math.max(0, Number($('betAmount').value) || 0);
  $('rollTarget').value = target.toFixed(2);
  $('targetSlider').value = Math.min(99, target);
  $('sliderValue').textContent = target.toFixed(2);
  $('winChance').value = chance.toFixed(2) + '%';
  $('multiplier').value = multiplier.toFixed(4) + 'x';
  $('profitOnWin').value = fmt(bet * (multiplier - 1)) + ' TRX';
}
$('rollTarget').addEventListener('input', updateDiceValues);
$('targetSlider').addEventListener('input', () => { $('rollTarget').value = Number($('targetSlider').value).toFixed(2); updateDiceValues(); });
$('betAmount').addEventListener('input', updateDiceValues);
$('doubleBet').onclick = () => { $('betAmount').value = fmt(Number($('betAmount').value || 0) * 2); updateDiceValues(); };
$('halfBet').onclick = () => { $('betAmount').value = fmt(Number($('betAmount').value || 0) / 2); updateDiceValues(); };
$('mode').onchange = () => $('autoControls').classList.toggle('hidden', $('mode').value !== 'auto');

function rollOnce() {
  if (!state.user) return {error:'Please log in first.'};
  const amount = Number($('betAmount').value);
  if (!(amount > 0) || !Number.isFinite(amount)) return {error:'Enter a valid bet amount.'};
  if (amount > state.balance) return {error:'Your demo balance is too low for this bet.'};
  const target = Number($('rollTarget').value);
  if (!(target >= 1 && target < 100)) return {error:'Set a threshold between 1 and 99.99.'};
  const roll = Math.random() * 100;
  const won = roll > target;
  const chance = 100 - target;
  const multiplier = (100 - HOUSE_EDGE) / chance;
  const profit = won ? amount * (multiplier - 1) : -amount;
  state.balance = Math.max(0, state.balance + profit);
  state.users[state.user].balance = state.balance;
  const result = `Roll ${roll.toFixed(2)} — ${won ? 'WIN' : 'LOSS'}`;
  state.bets.push({username:state.user, game:'Dice', amount, result, profit, time:Date.now()});
  return {roll, won, profit, amount, multiplier};
}
function playDice() {
  const auto = $('mode').value === 'auto';
  const rounds = auto ? Math.min(500, Math.max(1, Number($('autoRounds').value) || 1)) : 1;
  let completed = 0, wins = 0, net = 0, last = null;
  for (let i = 0; i < rounds; i++) {
    last = rollOnce();
    if (last.error) break;
    completed++; if (last.won) wins++; net += last.profit;
  }
  if (last?.error) { $('gameResult').textContent = last.error; return; }
  if (!last) return;
  $('diceNumber').textContent = last.roll.toFixed(2);
  $('diceNumber').classList.toggle('win', last.won);
  $('diceNumber').classList.toggle('loss', !last.won);
  $('gameResult').textContent = auto
    ? `${completed} rolls completed · ${wins} wins · ${completed-wins} losses · Net ${net >= 0 ? '+' : ''}${fmt(net)} TRX`
    : `${last.won ? 'You won!' : 'You lost.'} ${last.won ? 'Profit' : 'Loss'}: ${fmt(Math.abs(last.profit))} TRX`;
  save();
}
$('play').onclick = playDice;

document.querySelectorAll('.game').forEach(g => g.onclick = () => {
  selected = g.dataset.game;
  $('gameTitle').textContent = selected;
  if (selected === 'Dice') {
    $('gameResult').textContent = 'Set your bet and roll the dice.';
    $('play').textContent = 'ROLL DICE';
  } else {
    $('gameResult').textContent = `${selected} is a visual demo placeholder. The fully working game in this build is Dice.`;
    $('play').textContent = 'DICE GAME ONLY';
  }
});
$('menu').onclick = () => $('nav').classList.toggle('hidden');
render();
