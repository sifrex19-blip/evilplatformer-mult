// Evil Platformer host server: no dependencies. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
const PORT=+process.env.PORT||3000,FILE=path.join(__dirname,'evil-platformer-online.html');
function lan(){const o=[];for(const l of Object.values(os.networkInterfaces()))for(const i of l)if(i.family==='IPv4'&&!i.internal)o.push('http://'+i.address+':'+PORT);return o}
const srv=http.createServer((q,r)=>q.url==='/ip'?(r.writeHead(200,{'Content-Type':'application/json'}),r.end(JSON.stringify(lan()))):fs.readFile(FILE,(e,d)=>{
  if(e){r.writeHead(500);return r.end('evil-platformer-online.html must be next to server.js')}
  r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(d)}));
const rooms=new Map(),dirty=new Set();let nid=1;
srv.on('upgrade',(req,sock)=>{
  const key=req.headers['sec-websocket-key'];if(!key){sock.destroy();return}
  const acc=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
  const c={id:'p'+nid++,sock,room:null,p:{},buf:Buffer.alloc(0)};
  sock.on('data',d=>{c.buf=Buffer.concat([c.buf,d]);let f;
    while((f=frame(c))){if(f.op===8){sock.end();return}if(f.op===1)handle(c,f.text)}});
  sock.on('close',()=>leave(c));sock.on('error',()=>leave(c));
});
function frame(c){
  const b=c.buf;if(b.length<2)return null;
  const op=b[0]&15;let len=b[1]&127,o=2;
  if(len===126){if(b.length<4)return null;len=b.readUInt16BE(2);o=4}
  else if(len===127){if(b.length<10)return null;len=Number(b.readBigUInt64BE(2));o=10}
  if(len>65536){c.sock.destroy();return null}
  if(b.length<o+4+len)return null;
  const m=b.slice(o,o+4),pl=Buffer.alloc(len);
  for(let i=0;i<len;i++)pl[i]=b[o+4+i]^m[i%4];
  c.buf=b.slice(o+4+len);return{op,text:pl.toString()};
}
function send(c,obj){
  const d=Buffer.from(JSON.stringify(obj)),n=d.length;let h;
  if(n<126)h=Buffer.from([0x81,n]);
  else if(n<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(n,2)}
  else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(n),2)}
  try{c.sock.write(Buffer.concat([h,d]))}catch(e){}
}
function leave(c){
  if(!c.room)return;const r=rooms.get(c.room);
  if(r){r.delete(c.id);if(!r.size)rooms.delete(c.room);else dirty.add(c.room)}
  c.room=null;
}
function handle(c,text){
  let m;try{m=JSON.parse(text)}catch(e){return}
  if(m.t==='join'){
    leave(c);const n=String(m.room||'lobby').slice(0,48);
    let r=rooms.get(n);if(!r)rooms.set(n,r=new Map());
    if(r.size>=12){send(c,{t:'full'});return}
    r.set(c.id,c);c.room=n;dirty.add(n);
  }else if(m.t==='pres'&&c.room&&m.p&&typeof m.p==='object'){
    Object.assign(c.p,m.p);dirty.add(c.room);
  }else if(m.t==='ev'&&c.room){
    const r=rooms.get(c.room);
    for(const o of r.values())if(o!==c)send(o,{t:'ev',topic:String(m.topic).slice(0,32),data:m.data,from:c.id});
  }
}
setInterval(()=>{
  for(const n of dirty){
    const r=rooms.get(n);if(!r)continue;
    for(const c of r.values())send(c,{t:'peers',list:[...r.values()].filter(o=>o!==c).map(o=>({id:o.id,p:o.p}))});
  }
  dirty.clear();
},50);
srv.listen(PORT,'0.0.0.0',()=>{
  console.log('\nEvil Platformer server running.\n  On this PC:   http://localhost:'+PORT);
  for(const l of Object.values(os.networkInterfaces()))for(const i of l)
    if(i.family==='IPv4'&&!i.internal)console.log('  Same Wi-Fi:   http://'+i.address+':'+PORT);
  console.log('\nFriends on your Wi-Fi open one of those links. Ctrl+C stops it.\n');
  if(process.platform==='win32')require('child_process').exec('start http://localhost:'+PORT);
});
