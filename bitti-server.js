import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const files={
  '/':'bitti.html',
  '/bitti':'bitti.html',
  '/bitti/':'bitti.html',
  '/bitti.css':'bitti.css',
  '/bitti.js':'bitti.js'
};
const judgeRates=new Map();

function sendJson(res,status,data){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
}
function normalizeLetter(v=''){return String(v).trim().toLocaleUpperCase('tr-TR').slice(0,1)}
function cleanText(v,max=40){return String(v??'').trim().slice(0,max)}
function takeOutputText(data){
  for(const item of data?.output||[])for(const part of item?.content||[])if(part?.type==='output_text'&&part.text)return part.text;
  return '';
}
async function readBody(req,limit=4096){
  let body='';
  for await(const chunk of req){body+=chunk;if(body.length>limit)throw new Error('İstek çok büyük.');}
  return JSON.parse(body||'{}');
}
async function judgeAnswer({letter,category,answer,mode}){
  letter=normalizeLetter(letter);category=cleanText(category,60);answer=cleanText(answer,60);mode=cleanText(mode,20);
  if(!answer)return {valid:false,confidence:1,reason:'Cevap boş.',source:'rule'};
  if(mode==='friends')return {valid:null,confidence:1,reason:'Arkadaş Modu cevaplarını grup bilir; AI hakem kullanılmaz.',source:'rule'};
  if(letter&&!answer.toLocaleUpperCase('tr-TR').startsWith(letter))return {valid:false,confidence:1,reason:`Cevap ${letter} harfiyle başlamıyor.`,source:'rule'};
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return {unavailable:true,reason:'AI Hakem henüz sunucuda etkinleştirilmedi.'};
  const model=process.env.OPENAI_JUDGE_MODEL||'gpt-6-luna';
  const payload={
    model,
    reasoning:{effort:'none'},
    instructions:'Sen BİTTİ! adlı Türkçe isim-şehir-hayvan tarzı parti oyununun tarafsız son hakemisin. Yalnızca verilen kategori, harf ve cevabı değerlendir. Yazım hatası küçük ve anlam açıksa toleranslı ol. Uydurma, kategori dışı veya bariz biçimde yanlış cevabı geçersiz say. Marka/özel isimlerde Türkiye’de veya dünyada gerçekten bilinen kullanımı kabul et. Kısa karar ver. SADECE şu JSON biçiminde cevap ver: {"valid":true,"confidence":0.0,"reason":"kısa Türkçe gerekçe"}. confidence 0 ile 1 arasında sayı olmalı.',
    input:`Harf: ${letter}\nKategori: ${category}\nCevap: ${answer}`,
    max_output_tokens:120
  };
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(12000)
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data?.error?.message||'AI servisine ulaşılamadı.');
  const raw=takeOutputText(data).replace(/^```(?:json)?\s*|\s*```$/g,'').trim();
  let parsed;
  try{parsed=JSON.parse(raw)}catch{throw new Error('AI kararı okunamadı.');}
  return {
    valid:parsed.valid===true,
    confidence:Math.max(0,Math.min(1,Number(parsed.confidence)||0)),
    reason:cleanText(parsed.reason,180)||'Karar verildi.',
    source:'ai',model
  };
}

export const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if(u.pathname==='/health')return sendJson(res,200,{ok:true,game:'bitti',aiJudge:!!process.env.OPENAI_API_KEY});
    if(req.method==='POST'&&u.pathname==='/api/judge'){
      const ip=req.headers['x-forwarded-for']?.split(',')[0]?.trim()||req.socket.remoteAddress||'unknown';
      let rate=judgeRates.get(ip);const now=Date.now();
      if(!rate||now-rate.time>60000){rate={time:now,n:0};judgeRates.set(ip,rate)}
      if(++rate.n>20)return sendJson(res,429,{error:'AI Hakem için çok hızlı istek gönderildi.'});
      const body=await readBody(req,2048);
      const result=await judgeAnswer(body);
      return sendJson(res,200,result);
    }
    const file=files[u.pathname];
    if(!file)return sendJson(res,404,{error:'Bulunamadı'});
    const type=file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=300'});
    res.end(await readFile(new URL('./public/'+file,import.meta.url)));
  }catch(e){
    sendJson(res,500,{error:e.message||'Sunucu hatası'});
  }
});

setInterval(()=>{const now=Date.now();for(const [ip,r] of judgeRates)if(now-r.time>120000)judgeRates.delete(ip)},60000).unref();

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const port=process.env.PORT||3000;
  server.listen(port,'0.0.0.0',()=>console.log(`BİTTİ! hazır: http://localhost:${port}`));
}
