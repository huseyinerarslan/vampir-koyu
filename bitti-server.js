import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {BittiGame} from './bitti-game.js';

const game=new BittiGame();
const streams=new Set();
const files={'/':'bitti.html','/bitti':'bitti.html','/bitti/':'bitti.html','/bitti.css':'bitti.css','/bitti-boot.js':'bitti-boot.js','/bitti.js':'bitti.js'};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const tokenFrom=req=>String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
function broadcast(code){for(const s of [...streams])if(s.code===code){try{s.res.write(`data: ${JSON.stringify(game.view(code,s.token))}\n\n`);}catch{try{s.res.end();}catch{}streams.delete(s);}}}
function outputText(data){if(typeof data?.output_text==='string')return data.output_text;const out=[];for(const item of data?.output||[])for(const c of item?.content||[])if(typeof c?.text==='string')out.push(c.text);return out.join('\n');}
async function aiJudge({letter,category,answer}){
  const key=process.env.OPENAI_API_KEY;if(!key)return null;
  const model=process.env.OPENAI_MODEL||'gpt-6-luna';
  const prompt=`Türkçe İsim-Hayvan-Bitki tarzı bir kelime oyununda tarafsız hakemsin. Harf: ${letter}. Kategori: ${category}. Cevap: ${answer}. Cevabın gerçekten bu kategoriye ait olup olmadığını ve Türkçe kullanımda verilen harfle başlayıp başlamadığını değerlendir. Özel isimlerde yaygın Türkçe yazımı esas al. Uydurma veya kategori dışı cevapları reddet. Yalnızca şu JSON biçiminde yanıt ver: {"valid":true,"reason":"en fazla 12 kelimelik Türkçe gerekçe"}`;
  const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),8000);
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:prompt,max_output_tokens:100}),signal:ctrl.signal});
    if(!r.ok)return null;const data=await r.json();const text=outputText(data).trim();const match=text.match(/\{[\s\S]*\}/);if(!match)return null;const parsed=JSON.parse(match[0]);if(typeof parsed.valid!=='boolean')return null;return {valid:parsed.valid,reason:String(parsed.reason||'').slice(0,120)};
  }catch{return null;}finally{clearTimeout(timeout);}
}

export const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if(u.pathname==='/health')return json(res,200,{ok:true,game:'bitti-multiplayer'});
    if(u.pathname==='/api/events'){
      const code=u.searchParams.get('code'),token=u.searchParams.get('token');game.auth(code,token);
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});const s={code:String(code).toUpperCase(),token,res};streams.add(s);res.write(`data: ${JSON.stringify(game.view(code,token))}\n\n`);req.on('close',()=>streams.delete(s));return;
    }
    if(req.method==='POST'&&u.pathname.startsWith('/api/')){
      let body='';for await(const chunk of req){body+=chunk;if(body.length>20000)return json(res,413,{error:'İstek çok büyük.'});}const d=JSON.parse(body||'{}');const op=u.pathname.slice(5);
      if(op==='create'){const session=game.create(d.name,{mode:d.mode,rounds:d.rounds,duration:d.duration});return json(res,200,session);}
      if(op==='join'){const session=game.join(d.code,d.name,d.resumeToken||'');broadcast(session.code);return json(res,200,session);}
      const token=tokenFrom(req);if(!token)return json(res,401,{error:'Oturum bulunamadı.'});const code=d.code;
      if(op==='state')return json(res,200,game.view(code,token));
      if(op==='answers'){game.submitAnswers(code,token,d.answers);return json(res,200,{ok:true});}
      if(op==='start')game.start(code,token);
      else if(op==='bitti')game.bitti(code,token,d.answers);
      else if(op==='next')game.nextRound(code,token);
      else if(op==='reset')game.reset(code,token);
      else if(op==='host-decision')game.hostDecision(code,token,!!d.valid);
      else if(op==='vote'){
        const out=game.vote(code,token,d.vote);broadcast(code);
        if(out.needsAI){const result=await aiJudge(out.item);game.applyAI(code,out.item.id,result);broadcast(code);}return json(res,200,{ok:true});
      } else return json(res,404,{error:'İşlem bulunamadı.'});
      broadcast(code);return json(res,200,{ok:true});
    }
    const file=files[u.pathname];if(!file)return json(res,404,{error:'Bulunamadı'});const type=file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';res.writeHead(200,{'Content-Type':type,'Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=120'});res.end(await readFile(new URL('./public/'+file,import.meta.url)));
  }catch(e){json(res,400,{error:e.message||'İşlem tamamlanamadı.'});}
});
setInterval(()=>{for(const code of game.tick())broadcast(code);for(const s of streams){try{s.res.write(': heartbeat\n\n');}catch{streams.delete(s);}}},500).unref();
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=process.env.PORT||3000;server.listen(port,'0.0.0.0',()=>console.log(`BİTTİ! multiplayer hazır: http://localhost:${port}`));}
