import { MARKETS, HARDWARE, HARDWARE_REFERENCE, VERIFIED_ON } from './catalog.mjs';
import { calculate, defaultScenario, parseMoney, printMoney, encodeScenario, decodeScenario } from './engine.mjs';

const $ = (id) => document.getElementById(id);
const moneyInput = (cents) => cents === null ? '' : (cents / 100).toFixed(2);
const symbol = (market) => ({ US: '$', FR: '€', GB: '£' })[market];
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[c]);
const params = new URLSearchParams(window.location.search);
let state = decodeScenario(params.get('s')) ?? defaultScenario();
let receipt;

const descriptions = {
  own: 'You already own a PS5 or Xbox Series X|S. Count the game and only the extras you choose.',
  buy: 'Enter your real console quote. A future resale estimate will appear separately from the upfront bill.',
  cloud: 'Xbox One cloud streaming is confirmed for launch in supported markets. Purchased playtime is an additional cost.',
};

function compatibleHardware() {
  return Object.entries(HARDWARE).filter(([id]) => state.route === 'cloud'
    ? id.startsWith('xbox-') : id !== 'xbox-one');
}

function renderForm() {
  $('market').value = state.market;
  for (const [ed, cents] of Object.entries(MARKETS[state.market].prices)) {
    $(`${ed}-price`).textContent = printMoney(cents, state.market);
  }
  for (const b of document.querySelectorAll('[data-edition]')) {
    const active = b.dataset.edition === state.edition;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  }
  for (const b of document.querySelectorAll('[data-route]')) {
    const active = b.dataset.route === state.route;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  }
  $('route-description').textContent = descriptions[state.route];
  $('buy-fields').hidden = state.route !== 'buy';
  $('cloud-fields').hidden = state.route !== 'cloud';
  $('platform-label').textContent = state.route === 'cloud' ? 'Your Xbox device' : state.route === 'buy' ? 'Console to purchase' : 'Your console';
  const valid = compatibleHardware();
  if (!valid.some(([id]) => id === state.platform)) state.platform = valid[0][0];
  $('edition-source').href = HARDWARE[state.platform].ecosystem === 'xbox' ?
    MARKETS[state.market].xboxSource[state.edition] : MARKETS[state.market].source[state.edition];
  $('platform').replaceChildren(...valid.map(([id, record]) => {
    const option = document.createElement('option');
    option.value = id; option.textContent = record.label;
    return option;
  }));
  $('platform').value = state.platform;
  $('tax-field').hidden = state.market !== 'US';
  for (const el of document.querySelectorAll('[data-symbol]')) el.textContent = symbol(state.market);
  $('hardware').value = moneyInput(state.hardwareCents);
  $('resale').value = moneyInput(state.resaleCents);
  $('extras').value = moneyInput(state.extraCents);
  $('cloud-pack').value = moneyInput(state.cloudPackCents);
  $('cloud-hours').value = state.cloudHoursPerPack ?? '';
  $('planned-hours').value = state.plannedHours;
  $('tax').value = state.taxBasisPoints === null ? '' : (state.taxBasisPoints / 100).toFixed(2);
  $('reference-quote').hidden = !(state.market === 'US' && state.platform === 'xbox-series-s' && state.route === 'buy');
}

function lineElement(line) {
  const container = document.createElement('div'); container.className = 'line-item';
  const left = document.createElement('div');
  const name = document.createElement('div'); name.textContent = line.label;
  const tag = document.createElement('div'); tag.className = `evidence-tag ${line.evidence}`;
  const label = line.evidence === 'verified' ? '✓ VERIFIED · SOURCE' : line.evidence === 'entered' ? '↗ YOUR INPUT' : '● UNKNOWN';
  if (line.source) {
    const a = document.createElement('a'); a.textContent = label; a.href = line.source;
    a.target = '_blank'; a.rel = 'noopener noreferrer'; tag.append(a);
  } else { tag.textContent = label; }
  left.append(name,tag);
  const value = document.createElement('strong');
  value.textContent = line.cents === null ? '—' : printMoney(line.cents, state.market);
  container.append(left,value);
  return container;
}

function renderReceipt() {
  receipt = calculate(state);
  $('receipt-headline').innerHTML = state.route === 'cloud' ? 'Your planned<br>cloud bill.' : 'Your cost<br>of entry.';
  $('line-items').replaceChildren(...receipt.lines.map(lineElement));
  $('subtotal').textContent = printMoney(receipt.subtotal, state.market);
  const total = $('main-total'); total.replaceChildren();
  const headline = document.createTextNode(printMoney(receipt.checkout ?? receipt.subtotal, state.market));
  total.append(headline);
  const suffix = document.createElement('span');
  if (receipt.fullyPriced) {
    suffix.textContent = 'total under selected assumptions';
    $('total-context').textContent = state.route === 'cloud' ?
      'Projected game and cloud-play expenditure for the chosen hours, not necessarily paid at once.' :
      'Game, included choices and applicable modelled tax.';
  } else {
    suffix.textContent = '+ unresolved costs';
    $('total-context').textContent = 'Known amount only. Your complete bill is not yet established.';
  }
  total.append(suffix);
  $('net-block').hidden = receipt.futureNetIfResold === null;
  if (receipt.futureNetIfResold !== null) $('net-value').textContent = printMoney(receipt.futureNetIfResold, state.market);
  $('receipt-status').classList.toggle('complete', receipt.fullyPriced);
  $('receipt-status-text').textContent = receipt.fullyPriced ?
    'All selected line items have values. Personal estimates are not verified prices.' :
    `Still unknown: ${receipt.unknown.join(' · ')}.`;
}

function renderComparison() {
  const baseline = MARKETS[state.market].prices[state.edition];
  const buy = baseline + (state.market === 'US' ? HARDWARE_REFERENCE.cents : 0);
  $('compare-own').textContent = printMoney(baseline, state.market) + (state.market === 'US' ? '+' : '');
  $('compare-buy').textContent = state.market === 'US' ? printMoney(buy, state.market) + '+' : 'QUOTE NEEDED';
  $('compare-buy-note').textContent = state.market === 'US' ? 'US Xbox Series S starting-price example, before tax' : 'Enter a local console price; no amount has been assumed';
  $('compare-cloud').textContent = printMoney(baseline, state.market) + '+';
}

function refresh() {
  renderForm(); renderReceipt(); renderComparison();
  const current = new URL(window.location.href);
  current.searchParams.set('s', encodeScenario(state));
  try { window.history.replaceState(null, '', current); }
  catch { /* Local-file previews may deny URL history updates. */ }
}

function changeMoney(input, prop) {
  const raw = input.value.trim();
  const value = parseMoney(raw);
  if (raw !== '' && value === null) {
    $('action-feedback').textContent = 'Invalid amount rejected; the previous valid value was retained.';
    input.value = moneyInput(state[prop]);
    return;
  }
  input.removeAttribute('aria-invalid');
  $('action-feedback').textContent = '';
  state[prop] = value;
  if (prop === 'hardwareCents') state.hardwareQuote = 'personal';
  renderReceipt();
  syncUrl();
}

function syncUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('s', encodeScenario(state));
  try { window.history.replaceState(null, '', url); }
  catch { /* Keep the calculator usable in standalone local previews. */ }
}

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    state.route = button.dataset.preset;
    state.platform = state.route === 'cloud' ? 'xbox-one' : state.route === 'buy' ? 'xbox-series-s' : 'ps5-digital';
    state.hardwareCents = state.route === 'buy' && state.market === 'US' ? HARDWARE_REFERENCE.cents : null;
    state.hardwareQuote = state.route === 'buy' && state.market === 'US' ? HARDWARE_REFERENCE.id : 'personal';
    state.resaleCents = null; state.extraCents = 0;
    refresh(); document.getElementById('calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

$('market').addEventListener('change', (event) => {
  state.market = event.target.value;
  state.hardwareCents = null;
  state.hardwareQuote = 'personal';
  state.resaleCents = null;
  state.extraCents = 0;
  state.cloudPackCents = null;
  state.taxBasisPoints = null;
  $('action-feedback').textContent = 'Currency changed; custom monetary inputs were cleared to prevent false conversion.';
  refresh();
});
for (const button of document.querySelectorAll('[data-edition]')) {
  button.addEventListener('click', () => { state.edition = button.dataset.edition; refresh(); });
}
for (const button of document.querySelectorAll('[data-route]')) {
  button.addEventListener('click', () => {
    state.route = button.dataset.route;
    if (state.route === 'cloud') state.platform = 'xbox-one';
    else if (state.route === 'buy') state.platform = 'xbox-series-s';
    else state.platform = 'ps5-digital';
    state.hardwareCents = null; state.hardwareQuote = 'personal'; state.resaleCents = null;
    refresh();
  });
}
$('platform').addEventListener('change', (event) => {
  state.platform = event.target.value;
  state.hardwareCents = null; state.hardwareQuote = 'personal'; state.resaleCents = null;
  refresh();
});
for (const [id, prop] of [['hardware','hardwareCents'],['resale','resaleCents'],['extras','extraCents'],['cloud-pack','cloudPackCents']]) {
  $(id).addEventListener('change', (e) => changeMoney(e.target, prop));
}
$('reference-quote').addEventListener('click', () => {
  state.hardwareCents = HARDWARE_REFERENCE.cents;
  state.hardwareQuote = HARDWARE_REFERENCE.id;
  refresh();
});
$('tax').addEventListener('change', (e) => {
  const amount = parseMoney(e.target.value);
  if (e.target.value.trim() && (amount === null || amount > 10000)) {
    $('action-feedback').textContent = 'Invalid tax rate rejected; the previous valid rate was retained.';
    e.target.value = state.taxBasisPoints === null ? '' : (state.taxBasisPoints / 100).toFixed(2);
    return;
  }
  e.target.removeAttribute('aria-invalid');
  state.taxBasisPoints = amount;
  renderReceipt(); syncUrl();
});
for (const [id, prop] of [['cloud-hours','cloudHoursPerPack'],['planned-hours','plannedHours']]) {
  $(id).addEventListener('change', e => {
    const value = e.target.value.trim() === '' ? null : Number(e.target.value);
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 10000)) {
      $('action-feedback').textContent = 'Invalid number of hours rejected; the previous valid value was retained.';
      e.target.value = state[prop] ?? '';
      return;
    }
    if (prop === 'plannedHours' && value === null) {
      $('action-feedback').textContent = 'Planned play time must be at least one hour.';
      e.target.value = state.plannedHours; return;
    }
    e.target.removeAttribute('aria-invalid'); state[prop] = value;
    renderReceipt(); syncUrl();
  });
}

$('share-btn').addEventListener('click', async () => {
  syncUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    $('action-feedback').textContent = 'Receipt link copied. It includes your settings, never your identity.';
  } catch {
    $('action-feedback').textContent = 'Clipboard access unavailable. Copy the address-bar URL to share.';
  }
});

function makeSvgReceipt() {
  const text = (x,y,str,size = 22,fill='#e8f0e0',weight='400') =>
    `<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" fill="${fill}" font-weight="${weight}">${escapeXml(str)}</text>`;
  const lines = receipt.lines.map((line,i)=> {
    const y = 405 + i * 42;
    return text(80,y,`${line.label} [${line.evidence.toUpperCase()}]`,17) +
      text(830,y,line.cents === null ? 'UNKNOWN' : printMoney(line.cents, state.market),18,'#e0fa8a','700');
  }).join('');
  const height = Math.max(760, 540 + receipt.lines.length * 42);
  const total = receipt.checkout ?? receipt.subtotal;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}" viewBox="0 0 1000 ${height}">
<rect width="1000" height="${height}" fill="#1b2923"/><rect x="60" y="50" width="880" height="${height-100}" fill="none" stroke="#738a70" stroke-width="2"/>
${text(80,111,'VI  /  COST TRUTH',24,'#dcfa72','800')}${text(80,168,'THE GAME PRICE IS ONLY THE START',18,'#b5c7b3','700')}
${text(80,245,printMoney(total,state.market),84,'#dcfa72','800')}
${text(80,286,receipt.fullyPriced?'MODELLED TOTAL':'KNOWN COST · OTHER COSTS UNRESOLVED',19,'#dce7d9','700')}
${text(80,350,`${MARKETS[state.market].label.toUpperCase()}  /  ${state.route.toUpperCase()}  /  ${state.edition.toUpperCase()}`,18,'#a8bea4')}
${lines}${text(80,height-158,`KNOWN SUBTOTAL   ${printMoney(receipt.subtotal,state.market)}`,21,'#e4f3df','700')}
${text(80,height-117,'OFFICIAL GAME PRICES CHECKED 18 NOV 2026 · ALL OTHER QUOTES ARE PERSONAL INPUTS',12,'#b8c9b5')}
${text(80,height-91,'INDEPENDENT PROJECT · NOT AFFILIATED WITH ROCKSTAR, TAKE-TWO, SONY OR MICROSOFT',11,'#b8c9b5')}
</svg>`;
}
$('export-btn').addEventListener('click', () => {
  try {
    const blob = new Blob([makeSvgReceipt()], {type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `gta-vi-cost-truth-${state.market.toLowerCase()}.svg`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('action-feedback').textContent = 'Receipt image saved as an editable SVG file.';
  } catch { $('action-feedback').textContent = 'Unable to export receipt in this browser.'; }
});

refresh();
