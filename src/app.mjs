import { MARKETS, HARDWARE, HARDWARE_REFERENCES, CLOUD_PACKS, VERIFIED_ON } from './catalog.mjs';
import { calculate, decodeScenario, defaultScenario, encodeScenario, parseMoney, printMoney } from './engine.mjs';

const $ = (id) => document.getElementById(id);
const moneyText = (value) => printMoney(value,state.market);
const currency = () => MARKETS[state.market];
const routes = {
  own: 'You own a supported console. The game and the extras you choose are the cost of entry.',
  buy: 'Add a first-party console quotation or enter your actual new, used, or refurbished price.',
  cloud: 'GTA VI is confirmed for Xbox console cloud streaming. Other devices must be checked for eligibility.',
};
const barColors = {game:'#ff9b84',hardware:'#a6efce',cloud:'#b9b6ff',extras:'#fee18a',tax:'#a4aab6'};
let state = decodeScenario(new URLSearchParams(location.search).get('s')) ?? defaultScenario();
let receipt = null;

function option(value,label) {
  const el=document.createElement('option');el.value=value;el.textContent=label;return el;
}
function formatInput(amount) {
  if(amount===null)return '';
  return (amount/(10**currency().decimals)).toFixed(currency().decimals);
}
function symbol() {
  return new Intl.NumberFormat(currency().locale,{style:'currency',currency:currency().currency})
    .formatToParts(0).find(part=>part.type==='currency')?.value || currency().currency;
}
function devicesForRoute() {
  return Object.entries(HARDWARE).filter(([,device])=>state.route==='cloud' ? device.ecosystem==='xbox' : !device.cloudOnly);
}
function gameCatalog() {
  return currency().game[HARDWARE[state.platform].ecosystem];
}
function setMessage(message='') { $('validation-note').textContent=message; }
function sourceLink(el,url) {
  if(url){el.href=url;el.hidden=false;}else{el.removeAttribute('href');el.hidden=true;}
}
function writeStateToUrl() {
  try {
    const u=new URL(location.href);u.searchParams.set('s',encodeScenario(state));
    history.replaceState(null,'',u);
  } catch { /* Static, local and sandbox previews remain fully functional. */ }
}
function renderForm() {
  $('market').value=state.market;
  $('market-compare').value=state.market;
  const devices=devicesForRoute();
  if(!devices.some(([id])=>id===state.platform))state.platform=devices[0][0];
  $('platform').replaceChildren(...devices.map(([id,d])=>option(id,d.label)));
  $('platform').value=state.platform;
  for(const button of document.querySelectorAll('[data-edition]'))button.setAttribute('aria-pressed',String(button.dataset.edition===state.edition));
  for(const button of document.querySelectorAll('[data-route]'))button.setAttribute('aria-pressed',String(button.dataset.route===state.route));
  const catalog=gameCatalog();
  $('standard-price').textContent=catalog ? moneyText(catalog.prices.standard) : 'Local quote';
  $('ultimate-price').textContent=catalog ? moneyText(catalog.prices.ultimate) : 'Local quote';
  sourceLink($('edition-source'),catalog?.source[state.edition]);
  $('game-quote-group').hidden=Boolean(catalog);
  $('game-price').value=formatInput(state.gameCents);
  $('route-description').textContent=routes[state.route];
  $('buy-fields').hidden=state.route!=='buy';
  $('cloud-fields').hidden=state.route!=='cloud';
  $('hardware').value=formatInput(state.hardwareCents);
  $('resale').value=formatInput(state.resaleCents);
  $('extras').value=formatInput(state.extraCents);
  $('tax-field').hidden=currency().taxIncluded;
  $('tax').value=state.taxBasisPoints===null?'':(state.taxBasisPoints/100).toFixed(2);
  for(const el of document.querySelectorAll('.currency-symbol'))el.textContent=symbol();
  const reference=HARDWARE_REFERENCES[`${state.market}:${state.platform}`];
  $('hardware-source-hint').hidden=!(reference && state.route==='buy');
  if(reference){$('reference-quote').textContent=`Use ${moneyText(reference.amount)} · ${reference.label}`;sourceLink($('hardware-source-link'),reference.source);}
  $('cloud-pricing').value=state.cloudPricingMode;
  $('cloud-custom-fields').hidden=state.cloudPricingMode!=='custom';
  $('cloud-pack').value=formatInput(state.cloudPackCents);
  $('cloud-hours').value=state.cloudHoursPerPack??'';
  $('planned-hours').value=state.plannedHours;
  $('hours-slider').value=Math.min(200,state.plannedHours);
  $('hours-output').textContent=`${state.plannedHours.toLocaleString()} hours`;
  for(const button of document.querySelectorAll('[data-hours]'))button.setAttribute('aria-pressed',String(Number(button.dataset.hours)===state.plannedHours));
  const packs=CLOUD_PACKS[state.market];
  const pricing=$('cloud-pricing');
  const officialOption=pricing.querySelector('option[value=official]');
  officialOption.textContent=packs?'Official prepaid packs · best combination':'Official prepaid packs · local tariff missing';
  if(state.route==='cloud'){
    const note=$('cloud-pack-note');
    if(state.cloudPricingMode==='official' && receipt?.cloudPlan){
      const selection=receipt.cloudPlan.selection.map(p=>`${p.quantity} × ${p.hours}h`).join(' + ');
      note.textContent=`Optimal store pack mix: ${selection}. Covers ${receipt.cloudPlan.coveredHours}h, with ${receipt.cloudPlan.unusedHours}h left over. Check eligibility and availability in your account.`;
    } else if(state.cloudPricingMode==='ad') {
      note.textContent='Microsoft lists ad-supported access with session and monthly limits. The model deliberately leaves your full playtime coverage unresolved.';
    } else if(state.cloudPricingMode==='official') {
      note.textContent='First-party cloud-playtime tariffs have not been verified for this country. Select a custom plan to enter your quoted rate.';
    } else {
      note.textContent='Custom plans are personal estimates. Enter a price and pack size from your provider.';
    }
  }
}

function lineNode(line) {
  const wrap=document.createElement('div');wrap.className='line-item';
  const left=document.createElement('div');
  const label=document.createElement('div');label.className='line-main';label.textContent=line.label;
  const evidence=document.createElement('div');evidence.className=`evidence-tag ${line.evidence}`;
  const titles={ verified:'✓ OFFICIAL LISTING', entered:'↗ YOUR QUOTE', unknown:'● NOT PRICED', conditional:'◇ ACCESS RESTRICTED' };
  if(line.source){const link=document.createElement('a');link.href=line.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent=titles[line.evidence]+' ↗';evidence.append(link);}
  else evidence.textContent=titles[line.evidence];
  left.append(label,evidence);
  const value=document.createElement('strong');value.className='line-money';value.textContent=moneyText(line.amount);
  wrap.append(left,value);return wrap;
}
function renderBreakdown() {
  const known=receipt.lines.filter(line=>line.amount>0 && barColors[line.category]);
  const totals=Object.fromEntries(Object.keys(barColors).map(k=>[k,known.filter(l=>l.category===k).reduce((sum,l)=>sum+l.amount,0)]));
  const total=Object.values(totals).reduce((a,b)=>a+b,0);
  const chart=$('stacked-bar');chart.replaceChildren();
  const legend=$('bar-legend');legend.replaceChildren();
  for(const [category,amount] of Object.entries(totals)){
    if(!amount)continue;
    const item=document.createElement('span');item.style.width=`${amount/total*100}%`;item.style.background=barColors[category];chart.append(item);
    const label=document.createElement('span');const mark=document.createElement('i');mark.style.background=barColors[category];
    label.append(mark,document.createTextNode(`${category.toUpperCase()} ${Math.round(amount/total*100)}%`));legend.append(label);
  }
  chart.setAttribute('aria-label',total ? Object.entries(totals).filter(([,v])=>v).map(([k,v])=>`${k}: ${moneyText(v)}`).join('; ') : 'No known priced items');
  $('breakdown-label').textContent=receipt.fullyPriced?'MODELLED TOTAL':'KNOWN AMOUNTS ONLY';
}
function renderReceipt() {
  receipt=calculate(state);
  const fully=receipt.fullyPriced;
  const label=state.route==='cloud'?'THE COST OF YOUR STREAMING PLAN':state.route==='buy'?'YOUR GAME + HARDWARE':'THE COST OF ENTRY';
  $('result-kicker').textContent=label;
  $('main-total').textContent=moneyText(fully?receipt.checkout:receipt.subtotal);
  $('mobile-total').textContent=moneyText(fully?receipt.checkout:receipt.subtotal)+(fully?'':'+');
  const hasUnknownGame=receipt.lines.some(l=>l.id==='game' && l.amount===null);
  if(hasUnknownGame && receipt.subtotal===0){$('main-total').textContent='Not priced';$('mobile-total').textContent='Not priced';}
  $('total-context').textContent=fully ? (state.route==='cloud'?'Projected total for your chosen number of hours. Cloud access may be purchased at different times.':'Modeled total under the selected assumptions.') : `Known amount only. ${receipt.unknown.length} unresolved ${receipt.unknown.length===1?'item':'items'} prevent a final price.`;
  $('line-items').replaceChildren(...receipt.lines.map(lineNode));
  $('subtotal').textContent=moneyText(receipt.subtotal);
  $('receipt-status').classList.toggle('complete',fully);
  $('receipt-status').querySelector('.status-icon').textContent=fully?'✓':'!';
  $('receipt-status-text').textContent=fully?'All modelled items have values. Your estimates and eligibility still need confirmation.':`Still unknown: ${receipt.unknown.join(' · ')}.`;
  $('net-block').hidden=receipt.futureNetIfResold===null;
  if(receipt.futureNetIfResold!==null)$('net-value').textContent=moneyText(receipt.futureNetIfResold);
  $('checked-date').textContent='NOV 19, 2026';
  renderBreakdown();
}
function makeComparison(route) {
  const scenario={...defaultScenario(),market:state.market,edition:state.edition,route};
  if(route==='buy'){
    scenario.platform='xbox-series-s';
    const ref=HARDWARE_REFERENCES[`${state.market}:${scenario.platform}`];
    if(ref){scenario.hardwareCents=ref.amount;scenario.hardwareQuote=ref.id;}
  }
  if(route==='cloud')scenario.platform='xbox-one';
  return calculate(scenario);
}
function renderComparison() {
  const node=$('route-comparison');node.replaceChildren();
  const items=[
    {id:'own',name:'Already equipped',desc:'Supported console already owned',num:'01 / OWN IT',cta:'Use my console'},
    {id:'buy',name:'Buying new hardware',desc:'Xbox Series S first-party quote if available',num:'02 / BUY IT',cta:'Add a console',featured:true},
    {id:'cloud',name:'Xbox cloud streaming',desc:'40 planned hours + the game',num:'03 / STREAM IT',cta:'Build a cloud plan'},
  ];
  for(const item of items) {
    const r=makeComparison(item.id);
    const lackingHardware=item.id==='buy' && r.unknown.some(x=>/console price/i.test(x));
    const display=lackingHardware?'Needs quote':r.subtotal>0?moneyText(r.subtotal):'Needs quote';
    const tax=r.unknown.includes('Local sales tax') && !lackingHardware;
    const caveat=r.unknown.length?`+ ${r.unknown.join(' · ')}`:item.id==='cloud'?'Estimated cost for 40 hours':'Published game and hardware prices';
    const card=document.createElement('button');card.type='button';card.className='comparison-card'+(item.featured?' featured':'');card.dataset.preset=item.id;
    const t=document.createElement('span');t.className='comparison-no';t.textContent=item.num;
    const h=document.createElement('h3');h.textContent=item.name;
    const sub=document.createElement('span');sub.className='comparison-sub';sub.textContent=item.desc;
    const amount=document.createElement('strong');amount.className='comparison-amount';amount.textContent=display+(tax?'+':'');
    const note=document.createElement('span');note.className='comparison-caveat';note.textContent=caveat;
    const chart=document.createElement('div');chart.className='mini-bar';
    const known=r.lines.filter(l=>l.amount>0);
    const sum=known.reduce((acc,l)=>acc+l.amount,0);
    for(const line of known){const b=document.createElement('span');b.style.width=`${line.amount/sum*100}%`;b.style.background=barColors[line.category]??'#888';chart.append(b);}
    const cta=document.createElement('span');cta.className='comparison-cta';cta.append(document.createTextNode(item.cta));
    const arrow=document.createElement('span');arrow.textContent='↗';cta.append(arrow);
    card.append(t,h,sub,amount,note,chart,cta);
    card.addEventListener('click',()=>applyPreset(item.id));node.append(card);
  }
  $('comparison-note').textContent=`${currency().name} · local ${currency().currency} · ${state.edition==='standard'?'Standard':'Ultimate'} edition`;
}
function renderTable() {
  const node=$('price-tbody');node.replaceChildren();
  for(const [code,m] of Object.entries(MARKETS)){
    const tr=document.createElement('tr');
    const name=document.createElement('td');const iso=document.createElement('span');iso.className='market-code';iso.textContent=code;
    name.append(iso,document.createTextNode(m.name));tr.append(name);
    for(const edition of ['standard','ultimate']){
      const td=document.createElement('td');td.textContent=printMoney(m.game.xbox.prices[edition],code);tr.append(td);
    }
    const cloud=document.createElement('td');
    if(CLOUD_PACKS[code])cloud.textContent=printMoney(CLOUD_PACKS[code][2].amount,code);
    else{cloud.textContent='Not verified';cloud.className='price-muted';}tr.append(cloud);
    const linkCell=document.createElement('td');const link=document.createElement('a');link.href=m.game.xbox.source.standard;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Xbox Store ↗';linkCell.append(link);tr.append(linkCell);
    node.append(tr);
  }
}
function refresh() {
  renderReceipt();renderForm();renderComparison();writeStateToUrl();
}
function resetPriceQuotes() {
  state.hardwareCents=null;state.hardwareQuote='personal';state.resaleCents=null;state.gameCents=null;
}
function applyPreset(route) {
  state.route=route;
  state.platform=route==='cloud'?'xbox-one':route==='buy'?'xbox-series-s':'ps5-digital';
  state.cloudPricingMode='official';resetPriceQuotes();
  const ref=route==='buy'?HARDWARE_REFERENCES[`${state.market}:${state.platform}`]:null;
  if(ref){state.hardwareCents=ref.amount;state.hardwareQuote=ref.id;}
  setMessage();refresh();$('calculator').scrollIntoView({behavior:'smooth',block:'start'});
}
function updateMoneyField(field,key) {
  const raw=field.value.trim();
  const value=parseMoney(raw,state.market);
  if(raw!=='' && value===null){setMessage(`Invalid price in ${key.replace(/Cents$/,'')}. Previous amount retained.`);field.value=formatInput(state[key]);return;}
  state[key]=value;if(key==='hardwareCents')state.hardwareQuote='personal';
  setMessage();refresh();
}
function updateTax(field) {
  const raw=field.value.trim().replace(',','.');
  if(raw && !/^\d{1,3}(?:\.\d{1,2})?$/.test(raw)){setMessage('Enter a tax rate from 0 to 100 with up to 2 decimals.');return;}
  const basis=raw===''?null:Math.round(Number(raw)*100);
  if(basis!==null && basis>10000){setMessage('A tax rate above 100% is outside the model.');return;}
  state.taxBasisPoints=basis;setMessage();refresh();
}
function bindInputs() {
  $('scenario-form').addEventListener('submit',event=>event.preventDefault());
  for(const id of ['market','market-compare'])$(id).addEventListener('change',event=>{
    state.market=event.target.value;
    resetPriceQuotes();state.extraCents=0;state.taxBasisPoints=null;state.cloudPackCents=null;
    setMessage('Changing currency cleared all personal monetary inputs to prevent false conversions.');refresh();
  });
  $('platform').addEventListener('change',event=>{state.platform=event.target.value;resetPriceQuotes();setMessage();refresh();});
  for(const btn of document.querySelectorAll('[data-edition]'))btn.addEventListener('click',()=>{state.edition=btn.dataset.edition;state.gameCents=null;setMessage();refresh();});
  for(const btn of document.querySelectorAll('[data-route]'))btn.addEventListener('click',()=>{state.route=btn.dataset.route;state.platform=state.route==='cloud'?'xbox-one':state.route==='buy'?'xbox-series-s':'ps5-digital';resetPriceQuotes();setMessage();refresh();});
  for(const [id,key] of [['game-price','gameCents'],['hardware','hardwareCents'],['resale','resaleCents'],['extras','extraCents'],['cloud-pack','cloudPackCents']])$(id).addEventListener('change',event=>updateMoneyField(event.target,key));
  $('tax').addEventListener('change',event=>updateTax(event.target));
  $('reference-quote').addEventListener('click',()=>{
    const ref=HARDWARE_REFERENCES[`${state.market}:${state.platform}`];
    if(!ref)return;state.hardwareCents=ref.amount;state.hardwareQuote=ref.id;setMessage();refresh();
  });
  $('cloud-pricing').addEventListener('change',event=>{state.cloudPricingMode=event.target.value;setMessage();refresh();});
  const updateHours=val=>{
    const n=Number(val);
    if(!Number.isSafeInteger(n)||n<1||n>10000){setMessage('Playtime must be between 1 and 10,000 whole hours.');return;}
    state.plannedHours=n;setMessage();refresh();
  };
  $('hours-slider').addEventListener('input',event=>updateHours(event.target.value));
  $('planned-hours').addEventListener('change',event=>updateHours(event.target.value));
  for(const btn of document.querySelectorAll('[data-hours]'))btn.addEventListener('click',()=>updateHours(btn.dataset.hours));
  $('cloud-hours').addEventListener('change',event=>{
    const raw=event.target.value.trim();const n=raw===''?null:Number(raw);
    if(n!==null&&(!Number.isSafeInteger(n)||n<1||n>10000)){setMessage('Custom pack size must be between 1 and 10,000 whole hours.');return;}
    state.cloudHoursPerPack=n;setMessage();refresh();
  });
  $('share-btn').addEventListener('click',shareResult);
  $('export-btn').addEventListener('click',exportImage);
}
async function shareResult() {
  writeStateToUrl();
  const url=location.href;
  try {
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(url);
    else {
      const temporary=document.createElement('textarea');temporary.value=url;temporary.style.position='fixed';temporary.style.top='-10000px';
      document.body.append(temporary);temporary.select();if(!document.execCommand('copy'))throw new Error('Clipboard not supported');temporary.remove();
    }
    $('action-feedback').textContent='Receipt link copied. It includes only your choices, no personal identity.';
  } catch {
    $('action-feedback').textContent='Clipboard unavailable. Copy your browser address to share the receipt.';
  }
}

/** Produce a custom 1200×630 PNG using Canvas, without external assets or services. */
async function exportImage() {
  try {
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    const gradient=ctx.createLinearGradient(0,0,1200,630);gradient.addColorStop(0,'#171922');gradient.addColorStop(1,'#313244');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,630);
    ctx.strokeStyle='#ffffff1e';for(let x=0;x<1200;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,630);ctx.stroke();}
    for(let y=0;y<630;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1200,y);ctx.stroke();}
    const sun=ctx.createRadialGradient(990,80,20,930,195,330);sun.addColorStop(0,'#ffcd9d');sun.addColorStop(.6,'#fa7d78');sun.addColorStop(1,'#9f477766');
    ctx.fillStyle=sun;ctx.beginPath();ctx.arc(1010,215,250,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#d8ff7c';ctx.fillRect(70,65,72,65);
    ctx.fillStyle='#171922';ctx.font='bold 40px Arial';ctx.fillText('VI.',85,112);
    ctx.fillStyle='#ffffff';ctx.font='bold 30px Arial';ctx.fillText('COST TRUTH',165,106);
    ctx.fillStyle='#ffc1a9';ctx.font='bold 20px Arial';ctx.fillText('THE REAL PRICE OF PLAYING GTA VI',70,195);
    const known=receipt.subtotal>0?printMoney(receipt.fullyPriced?receipt.checkout:receipt.subtotal,state.market):'NOT PRICED';
    ctx.fillStyle='#d8ff7c';ctx.font=`900 ${known.length>16?89:128}px Arial`;ctx.fillText(known,64,362,1080);
    ctx.fillStyle='#ffffff';ctx.font='bold 31px Arial';ctx.fillText(`${state.route==='own'?'OWN A CONSOLE':state.route==='buy'?'BUY A CONSOLE':'CLOUD PLAY'}  /  ${MARKETS[state.market].name.toUpperCase()}`,70,421);
    ctx.fillStyle='#c2bec9';ctx.font='24px Arial';
    ctx.fillText(receipt.fullyPriced?'MODELED TOTAL · ASSUMPTIONS APPLY':'KNOWN AMOUNT ONLY · UNRESOLVED COSTS EXIST',70,463);
    ctx.strokeStyle='#ffffff6b';ctx.beginPath();ctx.moveTo(70,515);ctx.lineTo(1130,515);ctx.stroke();
    ctx.fillStyle='#dcd8e0';ctx.font='bold 18px Arial';ctx.fillText('VERIFIED PRICES. NO HIDDEN GUESSES.',70,565);
    ctx.font='18px Arial';ctx.fillText('fraware.github.io/gta-vi-cost-truth',746,565);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('PNG export unsupported');
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`gta-vi-cost-truth-${state.market.toLowerCase()}.png`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    $('action-feedback').textContent='Share image saved as PNG. It contains your current result, without personal information.';
  } catch {
    $('action-feedback').textContent='Unable to save PNG in this browser. Try the shareable receipt link instead.';
  }
}

function start() {
  for(const [code,m] of Object.entries(MARKETS)){
    $('market').append(option(code,`${m.name} · ${m.currency}`));
    $('market-compare').append(option(code,`${m.name} · ${m.currency}`));
  }
  bindInputs();renderTable();refresh();
}
start();
