const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const state = {
  mode:'classic', rounds:5, duration:60, round:1, room:'B7K2Q', host:'Hüseyin',
  players:[
    {name:'Hüseyin',score:0,host:true},{name:'Mert',score:0},{name:'Ece',score:0},{name:'Berk',score:0}
  ],
  categoriesClassic:['İSİM','ŞEHİR','HAYVAN','YEMEK','MARKA','EŞYA'],
  categoriesFriends:['GRUPTA KİM?','EN ÇOK BUNU KİM YAPAR?','KİMİN SÖZÜ?','KİM EN GEÇ KALIR?','KİM DAHA ÇOK YER?','KİM DAHA ÇOK UYUR?'],
  letters:['A','B','C','D','E','F','G','H','K','M','P','R','S','T','Y'],
  currentLetter:'K', jokerUsed:false, timer:null, timeLeft:60, answers:{}, reviewIndex:0, reviewItems:[]
};

function show(id){$$('.screen').forEach(s=>s.classList.remove('active'));$('#screen-'+id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:5},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}
function initial(name){return (name||'?').trim().charAt(0).toUpperCase()}
function currentCategories(){return state.mode==='classic'?state.categoriesClassic:state.categoriesFriends}

let sound=true;
let audioCtx=null;
function ensureAudio(){
  if(!sound)return null;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  if(!audioCtx)audioCtx=new AC();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function tone(freq=440,dur=.08,type='sine',vol=.055,delay=0){
  const ctx=ensureAudio(); if(!ctx)return;
  const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+dur+.02);
}
function sfx(name){
  if(!sound)return;
  if(name==='tap'){tone(520,.045,'triangle',.025)}
  if(name==='count'){tone(440,.09,'square',.035)}
  if(name==='go'){tone(660,.08,'triangle',.045);tone(880,.16,'triangle',.04,.09)}
  if(name==='tick'){tone(180,.035,'square',.035)}
  if(name==='panic'){tone(260,.055,'square',.04);tone(340,.045,'square',.025,.045)}
  if(name==='bitti'){tone(95,.28,'sawtooth',.085);tone(150,.22,'square',.05,.035);tone(520,.12,'triangle',.035,.16)}
  if(name==='reveal'){tone(620,.05,'triangle',.025);tone(760,.07,'triangle',.02,.045)}
  if(name==='yes'){tone(520,.06,'sine',.035);tone(720,.12,'sine',.04,.055)}
  if(name==='no'){tone(190,.08,'sawtooth',.045);tone(140,.12,'sawtooth',.035,.07)}
  if(name==='score'){tone(440,.06,'triangle',.03);tone(590,.07,'triangle',.03,.07);tone(740,.13,'triangle',.035,.14)}
  if(name==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.04,i*.1))}
}
function impact(){const el=$('#impactOverlay');document.body.classList.add('impact');el.classList.remove('active');void el.offsetWidth;el.classList.add('active');setTimeout(()=>{el.classList.remove('active');document.body.classList.remove('impact')},760)}
function setPanic(on){document.body.classList.toggle('panic',!!on)}

document.addEventListener('pointerdown',e=>{if(e.target.closest('button'))sfx('tap')});

$$('.mode-card').forEach(btn=>btn.addEventListener('click',()=>{ $$('.mode-card').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.mode=btn.dataset.mode;$('#modePill').textContent=state.mode==='classic'?'KLASİK':'ARKADAŞ';toast(state.mode==='classic'?'Klasik mod seçildi':'Arkadaş modu seçildi 😈')}));

$('#createRoomBtn').onclick=()=>show('create');
$('#joinRoomBtn').onclick=()=>show('join');
$$('[data-back]').forEach(b=>b.onclick=()=>show(b.dataset.back));
$('#homeBtn').onclick=()=>show('home');

function segmented(root,attr,key){$(root).addEventListener('click',e=>{if(!e.target.dataset[attr])return;$(root).querySelectorAll('button').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');state[key]=+e.target.dataset[attr]})}
segmented('#roundSelector','rounds','rounds');
segmented('#timeSelector','time','duration');

$('#createConfirmBtn').onclick=()=>{
  state.host=$('#hostName').value.trim()||'Oyuncu';
  state.players=[{name:state.host,score:0,host:true},{name:'Mert',score:0},{name:'Ece',score:0},{name:'Berk',score:0}];
  state.room=randomCode();state.round=1;renderLobby();show('lobby');
};
$('#joinConfirmBtn').onclick=()=>{
  const name=$('#joinName').value.trim()||'Misafir'; const code=$('#roomInput').value.trim().toUpperCase();
  if(code.length<4){toast('Geçerli bir oda kodu gir');return}
  state.room=code;state.host='Mert';state.players=[{name:'Mert',score:0,host:true},{name,score:0},{name:'Ece',score:0},{name:'Berk',score:0}];renderLobby();show('lobby');
};

function renderLobby(){
  $('#roomCode').textContent=state.room;$('#lobbyRounds').textContent=state.rounds;$('#lobbyTime').textContent=state.duration;$('#playerCount').textContent=`${state.players.length}/8`;
  $('#playersList').innerHTML=state.players.map(p=>`<div class="player"><div class="player-main"><div class="avatar">${initial(p.name)}</div><div><strong>${p.name}</strong>${p.host?'<span class="host">KURUCU</span>':''}</div></div><span class="online-dot"></span></div>`).join('')
}
$('#roomCode').onclick=async()=>{try{await navigator.clipboard.writeText(state.room);toast('Oda kodu kopyalandı')}catch{toast('Kod: '+state.room)}};
$('#addDemoPlayerBtn').onclick=()=>{if(state.players.length>=8){toast('Oda dolu');return}const names=['Seda','Can','Duru','Ozan','İrem','Kaan'];const n=names.find(x=>!state.players.some(p=>p.name===x))||('Oyuncu '+(state.players.length+1));state.players.push({name:n,score:0});renderLobby()};

$('#startGameBtn').onclick=()=>startCountdown();
function startCountdown(){
  state.currentLetter=state.letters[Math.floor(Math.random()*state.letters.length)];
  $('#letterOrb').textContent=state.currentLetter;$('#gameLetter').textContent=state.currentLetter;$('#roundNow').textContent=state.round;$('#roundTotal').textContent=state.rounds;
  show('countdown');setPanic(false);let n=3;$('#countdownNumber').textContent=n;$('#countdownText').textContent='Harf geliyor…';sfx('count');
  const id=setInterval(()=>{n--;if(n>0){$('#countdownNumber').textContent=n;sfx('count')}else{clearInterval(id);$('#countdownNumber').textContent='GO!';$('#countdownText').textContent=`${state.currentLetter} ile başlayan cevaplar!`;sfx('go');setTimeout(startRound,650)}},700)
}

function startRound(){
  state.timeLeft=state.duration;state.jokerUsed=false;state.answers={};$('#jokerBtn').disabled=false;renderAnswers();show('game');updateTimerUI();clearInterval(state.timer);state.timer=setInterval(()=>{state.timeLeft--;updateTimerUI();if(state.timeLeft<=10&&state.timeLeft>0){setPanic(true);sfx(state.timeLeft<=5?'panic':'tick')}if(state.timeLeft<=0){clearInterval(state.timer);setPanic(false);beginReview()}},1000)
}
function renderAnswers(){
  $('#answerList').innerHTML=currentCategories().map((c,i)=>`<div class="answer-item"><label>${c}<span>${i+1}</span></label><input data-cat="${c}" maxlength="28" autocomplete="off" placeholder="${state.currentLetter} ile..." /></div>`).join('');
  $$('#answerList input').forEach(inp=>inp.addEventListener('input',e=>{state.answers[e.target.dataset.cat]=e.target.value.trim();e.target.closest('.answer-item').classList.toggle('filled',!!e.target.value.trim());updateFilled()}));updateFilled()
}
function updateFilled(){const n=Object.values(state.answers).filter(Boolean).length;$('#filledCount').textContent=`${n}/${currentCategories().length} dolu`}
function updateTimerUI(){$('#timer').textContent=state.timeLeft;$('#timeBar').value=Math.max(0,state.timeLeft/state.duration*100);$('#timer').classList.toggle('danger',state.timeLeft<=10)}
$('#jokerBtn').onclick=()=>{if(state.jokerUsed)return;state.jokerUsed=true;state.timeLeft+=10;$('#jokerBtn').disabled=true;toast('+10 saniye! 🃏');updateTimerUI()};
$('#bittiBtn').onclick=()=>{clearInterval(state.timer);sfx('bitti');impact();setPanic(true);$('#stopperName').textContent=state.host;setTimeout(()=>show('lock'),260);let n=10;$('#lockTimer').textContent=n;sfx('tick');const id=setInterval(()=>{n--;$('#lockTimer').textContent=n;if(n>0)sfx(n<=5?'panic':'tick');if(n<=0){clearInterval(id);setPanic(false);beginReview()}},1000)};

function beginReview(){clearInterval(state.timer);setPanic(false);state.reviewIndex=0;const cats=currentCategories();state.reviewItems=cats.map(c=>({category:c,answer:state.answers[c]||randomDemoAnswer(c),owner:'Anonim cevap'}));$('#reviewTotal').textContent=state.reviewItems.length;renderReview();show('review')}
function randomDemoAnswer(cat){const L=state.currentLetter;const demo={İSİM:{K:'Kerem',A:'Ahmet',B:'Bora'},ŞEHİR:{K:'Kars',A:'Adana',B:'Bursa'},HAYVAN:{K:'Kedi',A:'At',B:'Balina'},YEMEK:{K:'Kebap',A:'Aşure',B:'Börek'},MARKA:{K:'Koton',A:'Adidas',B:'Bosch'},EŞYA:{K:'Koltuk',A:'Ayna',B:'Bardak'}};return demo[cat]?.[L]||`${L}...`}
function renderReview(){
  const item=state.reviewItems[state.reviewIndex];
  $('#reviewIndex').textContent=state.reviewIndex+1;$('#reviewCategory').textContent=item.category;$('#reviewAnswer').textContent=item.answer||'—';$('#reviewOwner').textContent=item.owner;
  $('#aiResult').textContent=state.mode==='classic'?'İtiraz yoksa cevap geçer. İtiraz gelirse oylama açılır; eşitlikte AI Hakem otomatik karar verir.':'Arkadaş Modunda son söz oyuncuların.';
  $('#voteYes').disabled=false;$('#voteNo').disabled=false;$('#voteYes').textContent='✓ DOĞRU';$('#voteNo').textContent='✕ İTİRAZ';
  $('#aiJudgeBtn').disabled=true;$('#aiJudgeBtn').textContent=state.mode==='classic'?'✨ AI HAKEM • EŞİTLİKTE OTOMATİK':'✨ AI HAKEM • BU MODDA KAPALI';
  const card=$('#reviewCard');card.classList.remove('reveal');void card.offsetWidth;card.classList.add('reveal');sfx('reveal')
}
function nextReview(valid=true){sfx(valid?'yes':'no');const pts=valid?10:0;state.players[0].score+=pts;state.reviewIndex++;if(state.reviewIndex>=state.reviewItems.length){simulateRoundScores();renderScore();show('score')}else renderReview()}

$('#voteYes').onclick=()=>nextReview(true);
$('#voteNo').onclick=()=>startDispute();

function demoVoteFor(item,index){
  const text=(item.answer+item.category+state.currentLetter+index).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const starts=item.answer.toLocaleUpperCase('tr-TR').startsWith(state.currentLetter.toLocaleUpperCase('tr-TR'));
  return starts ? (text%4!==0) : false;
}
async function startDispute(){
  const item=state.reviewItems[state.reviewIndex];
  $('#voteYes').disabled=true;$('#voteNo').disabled=true;sfx('no');
  $('#aiResult').textContent='⚖️ İtiraz açıldı. Oylar toplanıyor…';
  await new Promise(r=>setTimeout(r,650));
  const votes=state.players.map((p,i)=>({name:p.name,valid:i===0?false:demoVoteFor(item,i)}));
  const yes=votes.filter(v=>v.valid).length,no=votes.length-yes;
  $('#aiResult').textContent=`⚖️ Oylama: ${yes} doğru • ${no} geçersiz`;
  await new Promise(r=>setTimeout(r,700));
  if(yes>no){$('#aiResult').textContent=`✓ Çoğunluk kabul etti (${yes}-${no}). AI kullanılmadı.`;setTimeout(()=>nextReview(true),850);return}
  if(no>yes){$('#aiResult').textContent=`✕ Çoğunluk reddetti (${no}-${yes}). AI kullanılmadı.`;setTimeout(()=>nextReview(false),850);return}
  if(state.mode!=='classic'){
    $('#aiResult').textContent='🤝 Oylar eşit. Arkadaş Modunda kurucu son kararı verir.';
    $('#voteYes').disabled=false;$('#voteNo').disabled=false;$('#voteYes').textContent='KURUCU: DOĞRU';$('#voteNo').textContent='KURUCU: GEÇERSİZ';
    $('#voteYes').onclick=()=>nextReview(true);$('#voteNo').onclick=()=>nextReview(false);return;
  }
  $('#aiResult').textContent=`🤝 Oylar eşit (${yes}-${no}). AI Hakem sahaya giriyor…`;
  await callAiJudge();
}

async function callAiJudge(){
  const item=state.reviewItems[state.reviewIndex];
  $('#aiJudgeBtn').textContent='✨ AI HAKEM DÜŞÜNÜYOR…';
  try{
    const r=await fetch('/api/judge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:state.mode,letter:state.currentLetter,category:item.category,answer:item.answer})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||'AI Hakem yanıt vermedi.');
    if(data.unavailable){
      $('#aiResult').textContent='⚠️ '+data.reason+' Şimdilik kurucu karar versin.';
      $('#voteYes').disabled=false;$('#voteNo').disabled=false;$('#voteYes').textContent='KURUCU: DOĞRU';$('#voteNo').textContent='KURUCU: GEÇERSİZ';
      $('#voteYes').onclick=()=>nextReview(true);$('#voteNo').onclick=()=>nextReview(false);return;
    }
    if(data.valid===null){
      $('#aiResult').textContent='🤝 '+data.reason;
      $('#voteYes').disabled=false;$('#voteNo').disabled=false;return;
    }
    const pct=Math.round((data.confidence||0)*100);
    $('#aiResult').textContent=`${data.valid?'✨ AI Hakem: GEÇERLİ':'✨ AI Hakem: GEÇERSİZ'}${pct?` • %${pct}`:''} — ${data.reason}`;
    sfx(data.valid?'yes':'no');
    setTimeout(()=>nextReview(data.valid),1500);
  }catch(e){
    $('#aiResult').textContent='⚠️ AI Hakem şu an ulaşılamıyor. Kurucu son kararı versin.';
    $('#voteYes').disabled=false;$('#voteNo').disabled=false;$('#voteYes').textContent='KURUCU: DOĞRU';$('#voteNo').textContent='KURUCU: GEÇERSİZ';
    $('#voteYes').onclick=()=>nextReview(true);$('#voteNo').onclick=()=>nextReview(false);
  }finally{$('#aiJudgeBtn').textContent='✨ AI HAKEM • EŞİTLİKTE OTOMATİK'}
}

function simulateRoundScores(){state.players.slice(1).forEach(p=>p.score+=Math.floor(Math.random()*4+2)*10)}
function renderScore(){sfx('score');const sorted=[...state.players].sort((a,b)=>b.score-a.score);$('#scoreboard').innerHTML=sorted.map((p,i)=>`<div class="score-row"><div class="rank">#${i+1}</div><div><strong>${p.name}</strong><small>${i===0?'Turun lideri 🔥':'Oyunda'}</small></div><div class="points">${p.score}</div></div>`).join('');$('#nextRoundBtn').textContent=state.round>=state.rounds?'SONUCU GÖR':'SONRAKİ TUR'}
$('#nextRoundBtn').onclick=()=>{if(state.round>=state.rounds){finishGame()}else{state.round++;startCountdown()}};
function finishGame(){sfx('win');const sorted=[...state.players].sort((a,b)=>b.score-a.score);const w=sorted[0];$('#winnerCard').innerHTML=`<div class="winner-name">🏆 ${w.name}</div><div class="winner-points">${w.score} PUAN</div>`;$('#podium').innerHTML=sorted.slice(1,4).map((p,i)=>`<div class="podium-row"><span>${i+2}. ${p.name}</span><strong>${p.score}</strong></div>`).join('');show('finish')}
$('#playAgainBtn').onclick=()=>{state.players.forEach(p=>p.score=0);state.round=1;renderLobby();show('lobby')};$('#finishHomeBtn').onclick=()=>show('home');

$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'🔊':'🔇';$('#soundBtn').setAttribute('aria-label',sound?'Sesi kapat':'Sesi aç');if(sound){ensureAudio();sfx('go')}};
renderLobby();
