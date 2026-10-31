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

function sendJson(res,status,data){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
}

export const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,'http://localhost');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if(u.pathname==='/health')return sendJson(res,200,{ok:true,game:'bitti'});
    const file=files[u.pathname];
    if(!file)return sendJson(res,404,{error:'Bulunamadı'});
    const type=file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=300'});
    res.end(await readFile(new URL('./public/'+file,import.meta.url)));
  }catch(e){
    sendJson(res,500,{error:'Sunucu hatası'});
  }
});

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const port=process.env.PORT||3000;
  server.listen(port,'0.0.0.0',()=>console.log(`BİTTİ! hazır: http://localhost:${port}`));
}
