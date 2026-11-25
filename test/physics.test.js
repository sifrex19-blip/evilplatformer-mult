// Physics/collision regression harness. Runs the real game script in a stub DOM.
// Usage: node test/physics.test.js  (or: npm test)
const fs=require('fs'),vm=require('vm'),path=require('path');
const file=path.join(__dirname,'..','Evil Platformer.html');
const html=fs.readFileSync(file,'utf8');
const m=html.match(/<script>\n(const cv=.*?)<\/script>/s);
if(!m)throw new Error('inline script not found');

let NOW=1700000000000;
const RealDate=Date;
class FDate extends RealDate{static now(){return NOW}}

const ctxStub=new Proxy({
  measureText:t=>({width:String(t).length*7}),
  createPattern:()=>({}),
  getImageData:()=>({data:[]}),
  putImageData(){},
},{
  get(o,k){ if(k in o)return o[k]; return ()=>{} },
  set(o,k,v){o[k]=v;return true}
});

class El{
  constructor(id=''){this.id=id;this.hidden=false;this.textContent='';this.value='';this.dataset={};this.style={};this.children=[];this.className='';this.listeners={};this.width=0;this.height=0;this.checked=false;
    this.classList={add(){},remove(){},contains(){return false}}}
  appendChild(c){this.children.push(c);return c}
  addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f)}
  setPointerCapture(){}
  focus(){} blur(){}
  getBoundingClientRect(){return {left:0,top:0,width:this.width||240,height:this.height||320}}
  getContext(){return ctxStub}
}
const els=new Map();
const get=id=>{if(!els.has(id))els.set(id,new El(id));return els.get(id)};
const padBtns=['l','r','j'].map(k=>{const e=new El();e.dataset.k=k;return e});
const setBtns=['l','r','j'].map(k=>{const e=new El();e.dataset.b=k;return e});
const document={
  body:new El('body'),
  documentElement:{requestFullscreen(){}},
  fullscreenElement:null,
  getElementById:get,
  createElement(tag){const e=new El();e.tagName=tag.toUpperCase();return e},
  querySelectorAll(sel){
    if(sel==='#pad button[data-k]')return padBtns;
    if(sel==='#m-set [data-b]')return setBtns;
    return [];
  }
};
const store={};
const sandbox={
  console,Date:FDate,Math,JSON,Object,Array,String,Number,Boolean,Set,Map,Promise,
  document,
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},
  location:{protocol:'file:',hostname:'',host:'',origin:'',href:'file:///game.html'},
  fetch:()=>Promise.resolve({ok:false,json:()=>Promise.resolve([])}),
  addEventListener(){},removeEventListener(){},
  requestAnimationFrame(cb){sandbox.__raf=cb;return 1},
  setInterval(){return 1},clearInterval(){},setTimeout(){return 1},clearTimeout(){},
  Peer:undefined,WebSocket:undefined,claude:undefined,
  advanceNow:ms=>{NOW+=ms}
};
sandbox.globalThis=sandbox;
sandbox.window=sandbox;

const tests=`
;(function(){
  const res=[];let failed=0;
  const ok=(n,c,x='')=>{if(!c)failed++;res.push((c?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''))};
  const run=(n,f)=>{try{f()}catch(e){failed++;res.push('FAIL '+n+'  [THREW '+e.message+']')}};
  const G_=G;

  run('spawn/landing',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<120;i++)update();
    const p=L.p;
    ok('spawn lands on ground',p.on&&Math.abs(p.y-(G_-28))<0.6,'y='+p.y.toFixed(2)+' on='+p.on);
  });

  run('walking',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<20;i++)update();
    const p=L.p,x0=p.x;
    K.r=1;for(let i=0;i<40;i++)update();K.r=0;
    ok('walks right',p.x>x0+100,'dx='+(p.x-x0).toFixed(1));
    ok('stays on floor while walking',p.on&&Math.abs(p.y-(G_-28))<0.6,'y='+p.y.toFixed(2));
  });

  run('jump',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<20;i++)update();
    const p=L.p,gy=p.y;let peak=gy;
    jumpPress();K.j=1;
    for(let i=0;i<30;i++){update();peak=Math.min(peak,p.y)}
    ok('jump gets height',gy-peak>80,'height='+(gy-peak).toFixed(1));
    K.j=0;for(let i=0;i<90;i++)update();
    ok('comes back down and lands',p.on&&Math.abs(p.y-(G_-28))<0.6,'y='+p.y.toFixed(2)+' on='+p.on);
  });

  run('coyote',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:460,y:G_-28,w:22,h:28,vx:0,vy:0,on:true,f:1,coyote:7},S:[g(0,500)],Hz:[],SG:[],fake:0,goal:99999};
    for(let i=0;i<2;i++)update();
    L.p.x=510;update();
    ok('left ledge without landing',!L.p.on,'on='+L.p.on);
    jumpPress();update();
    ok('coyote jump works',L.p.vy<0,'vy='+L.p.vy.toFixed(1));
  });

  run('wall',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:150,y:G_-28,w:22,h:28,vx:0,vy:0,on:true,f:1,coyote:7},S:[g(0,600),{x:250,y:180,w:40,h:120,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    K.r=1;for(let i=0;i<80;i++)update();K.r=0;
    ok('wall stops player',Math.abs(L.p.x-(250-22))<0.6,'x='+L.p.x.toFixed(2));
    ok('wall does not push player up',L.p.y>G_-40,'y='+L.p.y.toFixed(2));
  });

  run('elevated landing',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:180,y:120,w:22,h:28,vx:0,vy:0,on:false,f:1,coyote:0},S:[g(0,600),{x:150,y:220,w:100,h:80,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    for(let i=0;i<90;i++)update();
    ok('lands on platform top',L.p.on&&Math.abs(L.p.y-(220-28))<0.6,'y='+L.p.y.toFixed(2)+' on='+L.p.on);
  });

  run('no wall snap-up',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:130,y:230,w:22,h:28,vx:0,vy:2,on:false,f:1,coyote:0},S:[g(0,600),{x:150,y:220,w:100,h:80,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    update();
    ok('pushed out sideways, not onto top',L.p.x<=128.6&&L.p.y>200,'x='+L.p.x.toFixed(2)+' y='+L.p.y.toFixed(2));
  });

  run('ceiling',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:180,y:200,w:22,h:28,vx:0,vy:-10,on:false,f:1,coyote:0},S:[g(0,600),{x:150,y:120,w:100,h:60,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    let minY=9999;K.j=1;for(let i=0;i<12;i++){update();minY=Math.min(minY,L.p.y)}K.j=0;
    ok('head never tunnels through ceiling',minY>=179.5&&minY<181,'minY='+minY.toFixed(2));
  });

  run('corner correction',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:130,y:200,w:22,h:28,vx:0,vy:-10,on:false,f:1,coyote:0},S:[g(0,600),{x:150,y:120,w:100,h:60,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    K.j=1;for(let i=0;i<10;i++)update();K.j=0;
    ok('nudged around ceiling corner',L.p.x<129&&L.p.y<180&&L.p.vy<0,'x='+L.p.x.toFixed(2)+' y='+L.p.y.toFixed(2)+' vy='+L.p.vy.toFixed(2));
  });

  run('fireball base cooldown',()=>{
    startGame(0,1,'normal',{});
    advanceNow(10000);
    const a=fire(),b=fire();
    ok('first fireball fires',a===true);
    ok('cooldown blocks immediate second',b===false);
    advanceNow(1600);
    ok('fires again after cooldown',fire()===true);
  });

  run('infinite fireballs mutation',()=>{
    startGame(0,1,'normal',{fb:true});
    advanceNow(10000);
    let n=0;for(let i=0;i<10;i++)if(fire())n++;
    ok('no cooldown at all',n===10,'fired='+n);
    ok('mutation flag set',!!MU.fb);
    K.f=1;for(let i=0;i<120;i++)update();K.f=0;
    ok('holding fire sprays fireballs',FB.length>60,'alive='+FB.length);
    ok('fireball count stays sane',FB.length<=500,'alive='+FB.length);
  });

  run('mutation menu',()=>{
    MUsel={fb:false};muTxt();buildMut();
    ok('one mutation listed',$('mlist').children.length===1,'n='+$('mlist').children.length);
    $('mlist').children[0].onclick();
    ok('toggle turns mutation on',MUsel.fb===true&&/Infinite Fireballs/.test($('mum').textContent),'label='+$('mum').textContent);
    $('mlist').children[0].onclick();
    ok('toggle turns mutation off',MUsel.fb===false&&$('mum').textContent==='Mutations: none','label='+$('mum').textContent);
  });

  run('collision fuzz',()=>{
    startGame(0,777,'normal',{});
    L={p:{x:100,y:200,w:22,h:28,vx:0,vy:0,on:false,f:1,coyote:0},S:[g(0,3000),
      {x:150,y:250,w:90,h:50,t:0,c:0},{x:300,y:220,w:70,h:80,t:0,c:0},
      {x:430,y:190,w:50,h:110,t:0,c:0},{x:530,y:260,w:120,h:40,t:0,c:0},
      {x:700,y:230,w:60,h:70,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    let maxPen=0,worst='',stuck=0;
    for(let i=0;i<4000;i++){
      if(i%120===0){L.p.x=Math.random()*1000;L.p.y=80+Math.random()*120;L.p.vx=0;L.p.vy=0;L.p.on=false;L.p.coyote=0;dead=0;}
      K.r=Math.random()<.5?1:0;K.l=Math.random()<.12?1:0;
      if(Math.random()<.08)jumpPress();
      K.j=Math.random()<.5?1:0;
      update();
      for(const s of L.S){
        if(s.dead)continue;
        const ox=Math.min(L.p.x+L.p.w,s.x+s.w)-Math.max(L.p.x,s.x);
        const oy=Math.min(L.p.y+L.p.h,s.y+s.h)-Math.max(L.p.y,s.y);
        const pen=Math.min(ox,oy);
        if(ox>0.6&&oy>0.6&&pen>maxPen){maxPen=pen;worst='x='+L.p.x.toFixed(1)+' y='+L.p.y.toFixed(1)+' n='+i}
      }
      if(L.p.x<-1||L.p.x>2900)stuck++;
    }
    K.r=K.l=K.j=0;
    ok('no deep solid penetration in fuzz',maxPen<1.1,'maxPen='+maxPen.toFixed(2)+' '+worst);
    ok('player stays in level bounds',stuck===0,'oob='+stuck);
  });

  run('render smoke',()=>{
    startGame(0,1,'normal',{fb:true});
    K.f=1;for(let i=0;i<40;i++){update();draw()}K.f=0;
    dead=20;draw();
    dead=0;won=true;draw();won=false;
    ok('draw ran in game/dead/won states',true);
  });

  console.log(res.join('\\n'));
  console.log('\\n'+(failed?failed+' TEST(S) FAILED':'ALL TESTS PASSED'));
  globalThis.__failed=failed;
})();
`;

let code=m[1]+tests;
try{
  vm.createContext(sandbox);
  vm.runInContext(code,sandbox,{filename:'ep-game.js',timeout:15000});
  console.log('FAILURES:',sandbox.__failed);
  process.exit(sandbox.__failed?1:0);
}catch(e){
  console.error('HARNESS ERROR:',e.stack);
  process.exit(2);
}
