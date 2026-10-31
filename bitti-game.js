import { randomInt, randomUUID } from 'node:crypto';

const CODE_CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LETTERS=['A','B','C','D','E','F','G','H','K','M','P','R','S','T','Y'];
const CLASSIC=['İSİM','ŞEHİR','HAYVAN','YEMEK','MARKA','EŞYA'];
const FRIENDS=['GRUPTA KİM?','EN ÇOK BUNU KİM YAPAR?','KİMİN SÖZÜ?','KİM EN GEÇ KALIR?','KİM DAHA ÇOK YER?','KİM DAHA ÇOK UYUR?'];
const trLower=s=>String(s||'').trim().toLocaleLowerCase('tr-TR');
const clean=s=>String(s??'').trim().replace(/\s+/g,' ').slice(0,40);

export class BittiGame {
  constructor(){this.rooms=new Map();}
  makeCode(){let code;do{code=Array.from({length:5},()=>CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');}while(this.rooms.has(code));return code;}
  room(code){const r=this.rooms.get(String(code||'').trim().toUpperCase());if(!r)throw Error('Oda bulunamadı. Kodu kontrol et.');return r;}
  auth(code,token){const r=this.room(code);const p=r.players.find(x=>x.token===token);if(!p)throw Error('Oturum bulunamadı. Odaya yeniden katıl.');return [r,p];}
  categories(r){return r.mode==='friends'?FRIENDS:CLASSIC;}
  create(name,settings={}){
    const code=this.makeCode();
    const r={code,phase:'lobby',mode:settings.mode==='friends'?'friends':'classic',rounds:[3,5,7,10].includes(+settings.rounds)?+settings.rounds:5,duration:[45,60,90].includes(+settings.duration)?+settings.duration:60,round:0,letter:'',deadline:null,players:[],host:null,answers:{},bittiBy:null,reviewItems:[],reviewIndex:0,reviewVotes:{},decision:null,roundPoints:{},usedLetters:[],updated:Date.now()};
    this.rooms.set(code,r);
    return this.join(code,name);
  }
  join(code,name,resumeToken=''){
    const r=this.room(code);name=clean(name).slice(0,16);if(!name)throw Error('Bir isim yaz.');
    const existing=r.players.find(p=>trLower(p.name)===trLower(name));
    if(existing){
      if(resumeToken&&existing.token===resumeToken){r.updated=Date.now();return {code:r.code,token:existing.token,rejoined:true};}
      throw Error('Bu isim odada zaten kullanılıyor. Aynı cihazdan tekrar giriyorsan sayfayı yenile veya aynı oda koduyla yeniden katıl.');
    }
    if(r.phase!=='lobby')throw Error('Bu oyun başlamış. Yeni oyuncu eklenemez; yalnızca daha önceki oyuncular geri dönebilir.');
    if(r.players.length>=8)throw Error('Oda dolu.');
    const p={id:randomUUID(),token:randomUUID(),name,score:0};r.players.push(p);r.host??=p.id;r.updated=Date.now();
    return {code:r.code,token:p.token};
  }
  chooseLetter(r){let pool=LETTERS.filter(x=>!r.usedLetters.includes(x));if(!pool.length){r.usedLetters=[];pool=[...LETTERS];}const letter=pool[randomInt(pool.length)];r.usedLetters.push(letter);return letter;}
  setPhase(r,phase,seconds=null){r.phase=phase;r.deadline=seconds?Date.now()+seconds*1000:null;r.updated=Date.now();}
  start(code,token){const [r,p]=this.auth(code,token);if(r.host!==p.id)throw Error('Oyunu yalnızca oda kurucusu başlatabilir.');if(r.phase!=='lobby')throw Error('Oyun zaten başladı.');if(r.players.length<2)throw Error('Başlamak için en az 2 gerçek oyuncu gerekli.');r.players.forEach(x=>x.score=0);r.round=1;r.usedLetters=[];this.startRound(r);}
  startRound(r){r.letter=r.mode==='classic'?this.chooseLetter(r):'';r.answers={};r.bittiBy=null;r.reviewItems=[];r.reviewIndex=0;r.reviewVotes={};r.decision=null;r.roundPoints=Object.fromEntries(r.players.map(p=>[p.id,0]));this.setPhase(r,'countdown',3.2);}
  submitAnswers(code,token,answers={}){const [r,p]=this.auth(code,token);if(!['round','lock'].includes(r.phase))throw Error('Şu an cevap gönderilemez.');const cats=this.categories(r);const safe={};for(const c of cats)safe[c]=clean(answers[c]);r.answers[p.id]=safe;r.updated=Date.now();}
  bitti(code,token,answers={}){const [r,p]=this.auth(code,token);if(r.phase!=='round')throw Error('BİTTİ! şu an kullanılamaz.');this.submitAnswers(code,token,answers);r.bittiBy=p.id;this.setPhase(r,'lock',10);}
  beginReview(r){
    const cats=this.categories(r);const items=[];
    for(const category of cats){const groups=new Map();for(const p of r.players){const answer=clean(r.answers[p.id]?.[category]);if(!answer)continue;const key=trLower(answer);if(!groups.has(key))groups.set(key,{id:randomUUID(),category,answer,ownerIds:[]});groups.get(key).ownerIds.push(p.id);}items.push(...groups.values());}
    r.reviewItems=items;r.reviewIndex=0;r.reviewVotes={};r.decision=null;
    if(!items.length){this.scoreRound(r);return;}
    this.setPhase(r,'review');
    this.ensureReviewVoters(r);
  }
  currentItem(r){return r.reviewItems[r.reviewIndex]||null;}
  eligibleVoters(r,item=this.currentItem(r)){return item?r.players.filter(p=>!item.ownerIds.includes(p.id)):[];}
  ensureReviewVoters(r){const item=this.currentItem(r);if(!item)return this.scoreRound(r);if(this.eligibleVoters(r,item).length===0){this.setPhase(r,'host_decision');}}
  vote(code,token,choice){
    const [r,p]=this.auth(code,token);if(r.phase!=='review')throw Error('Şu an oylama yok.');const item=this.currentItem(r);if(!item)throw Error('Cevap bulunamadı.');if(item.ownerIds.includes(p.id))throw Error('Kendi cevabına oy veremezsin.');
    const eligible=this.eligibleVoters(r,item);if(!eligible.some(x=>x.id===p.id))throw Error('Bu oylamaya katılamazsın.');
    r.reviewVotes[p.id]=choice==='no'?'no':'yes';r.updated=Date.now();
    const all=eligible.every(x=>Object.hasOwn(r.reviewVotes,x.id));if(!all)return {needsAI:false};
    const vals=eligible.map(x=>r.reviewVotes[x.id]),yes=vals.filter(v=>v==='yes').length,no=vals.length-yes;
    if(yes===no){if(r.mode==='classic'){this.setPhase(r,'ai_wait');return {needsAI:true,item:{id:item.id,category:item.category,answer:item.answer,letter:r.letter}};}this.setPhase(r,'host_decision');return {needsAI:false};}
    this.resolveReview(r,yes>no,'Oyuncu oylaması',`${yes}-${no}`);return {needsAI:false};
  }
  hostDecision(code,token,valid){const [r,p]=this.auth(code,token);if(r.host!==p.id)throw Error('Son kararı yalnızca oda kurucusu verebilir.');if(r.phase!=='host_decision')throw Error('Kurucu kararı gerekmiyor.');this.resolveReview(r,!!valid,'Kurucu kararı','');}
  applyAI(code,itemId,result){const r=this.room(code);const item=this.currentItem(r);if(r.phase!=='ai_wait'||!item||item.id!==itemId)return false;if(!result){this.setPhase(r,'host_decision');return true;}this.resolveReview(r,!!result.valid,'AI Hakem',result.reason||'');return true;}
  resolveReview(r,valid,source,reason){const item=this.currentItem(r);if(!item)return;item.valid=!!valid;r.decision={itemId:item.id,valid:!!valid,source,reason};this.setPhase(r,'review_result',1.8);}
  nextReview(r){r.reviewIndex++;r.reviewVotes={};r.decision=null;if(r.reviewIndex>=r.reviewItems.length){this.scoreRound(r);return;}this.setPhase(r,'review');this.ensureReviewVoters(r);}
  scoreRound(r){
    const points=Object.fromEntries(r.players.map(p=>[p.id,0]));
    for(const item of r.reviewItems){if(!item.valid)continue;const pts=item.ownerIds.length>1?5:10;for(const id of item.ownerIds)points[id]=(points[id]||0)+pts;}
    r.roundPoints=points;for(const p of r.players)p.score+=points[p.id]||0;
    this.setPhase(r,'score');
  }
  nextRound(code,token){const [r,p]=this.auth(code,token);if(r.host!==p.id)throw Error('Sonraki turu yalnızca kurucu başlatabilir.');if(r.phase!=='score')throw Error('Tur henüz bitmedi.');if(r.round>=r.rounds){this.setPhase(r,'finish');return;}r.round++;this.startRound(r);}
  reset(code,token){const [r,p]=this.auth(code,token);if(r.host!==p.id)throw Error('Rövanşı yalnızca kurucu başlatabilir.');if(r.phase!=='finish')throw Error('Oyun henüz bitmedi.');r.players.forEach(x=>x.score=0);r.round=0;r.usedLetters=[];r.answers={};r.reviewItems=[];r.reviewVotes={};r.decision=null;this.setPhase(r,'lobby');}
  tick(){const changed=[];for(const r of this.rooms.values()){if(r.deadline&&Date.now()>=r.deadline){if(r.phase==='countdown'){this.setPhase(r,'round',r.duration);changed.push(r.code);}else if(r.phase==='round'||r.phase==='lock'){this.beginReview(r);changed.push(r.code);}else if(r.phase==='review_result'){this.nextReview(r);changed.push(r.code);}}if(Date.now()-r.updated>12*3600*1000)this.rooms.delete(r.code);}return changed;}
  view(code,token){const [r,p]=this.auth(code,token);const item=this.currentItem(r);const eligible=item?this.eligibleVoters(r,item):[];const votes=item?eligible.map(x=>r.reviewVotes[x.id]).filter(Boolean):[];const bittiPlayer=r.players.find(x=>x.id===r.bittiBy);return {
    code:r.code,phase:r.phase,mode:r.mode,rounds:r.rounds,duration:r.duration,round:r.round,letter:r.letter,deadline:r.deadline,serverTime:Date.now(),bittiBy:bittiPlayer?.name||null,
    me:{id:p.id,name:p.name,isHost:r.host===p.id,score:p.score,answers:r.answers[p.id]||{},canVote:!!item&&!item.ownerIds.includes(p.id)&&r.phase==='review',voted:r.reviewVotes[p.id]||null},
    players:r.players.map(x=>({id:x.id,name:x.name,score:x.score,host:x.id===r.host,roundPoints:r.roundPoints?.[x.id]||0})),
    review:item?{id:item.id,category:item.category,answer:item.answer,duplicateCount:item.ownerIds.length,votesCast:votes.length,votesNeeded:eligible.length,yes:votes.filter(v=>v==='yes').length,no:votes.filter(v=>v==='no').length}:null,
    decision:r.decision
  };}
}
