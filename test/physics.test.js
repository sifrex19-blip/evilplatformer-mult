// Physics and system regression harness. Runs the real game script in a stub DOM.
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
  get(o,k){if(k in o)return o[k];return()=>{}},
  set(o,k,v){o[k]=v;return true}
});

class El{
  constructor(id=''){
    this.id=id;this.hidden=false;this._text='';this.value='';this.dataset={};this.style={};
    this.children=[];this.className='';this.listeners={};this.width=0;this.height=0;this.checked=false;this.tagName='';
    this.classList={add:()=>{},remove:()=>{},contains:()=>false,toggle:()=>{}};
  }
  set textContent(v){this._text=String(v)}
  get textContent(){return this._text}
  set innerHTML(v){this._html=String(v);if(v==='')this.children=[]}
  get innerHTML(){return this._html||''}
  appendChild(c){this.children.push(c);return c}
  removeChild(c){this.children=this.children.filter(x=>x!==c);return c}
  addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f)}
  setPointerCapture(){} focus(){} blur(){}
  getBoundingClientRect(){return{left:0,top:0,width:this.width||240,height:this.height||320}}
  getContext(){return ctxStub}
  toDataURL(){return 'data:image/png;base64,'}
}
const els=new Map();
const get=id=>{if(!els.has(id)){const e=new El(id);
  e.tagName=(id==='c'||id==='avc'||id==='edc')?'CANVAS':(id==='chat'||id==='nm'||id==='code'||id==='srv'||id==='edname'||id==='edseed'||id==='room')?'INPUT':'BUTTON';
  els.set(id,e)}return els.get(id)};
const padBtns=['l','r','j'].map(k=>{const e=new El();e.dataset.k=k;return e});
const setBtns=['l','r','j'].map(k=>{const e=new El();e.dataset.b=k;return e});
const document={
  body:new El('body'),head:new El('head'),
  documentElement:{requestFullscreen(){}},fullscreenElement:null,
  getElementById:get,
  createElement(tag){const e=new El();e.tagName=tag.toUpperCase();return e},
  querySelectorAll(sel){
    if(sel==='#pad button[data-k]')return padBtns;
    if(sel==='#m-set [data-b]')return setBtns;
    return [];
  },
  execCommand(){}
};
const store={};
const sandbox={
  console,Date:FDate,Math,JSON,Object,Array,String,Number,Boolean,Set,Map,Promise,
  document,
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},
  location:{protocol:'file:',hostname:'',host:'',origin:'',href:'file:///game.html',search:'',pathname:'/game.html'},
  fetch:()=>Promise.resolve({ok:false,json:()=>Promise.resolve([])}),
  addEventListener(){},removeEventListener(){},
  requestAnimationFrame(cb){sandbox.__raf=cb;return 1},
  setInterval(){return 1},clearInterval(){},setTimeout(){return 1},clearTimeout(){},
  Peer:undefined,WebSocket:undefined,claude:undefined,
  navigator:{getGamepads:()=>[],vibrate(){}},
  advanceNow:ms=>{NOW+=ms}
};
sandbox.globalThis=sandbox;
sandbox.window=sandbox;

const tests=`
;(function(){
  const res=[];let failed=0;
  const ok=(n,c,x='')=>{if(!c)failed++;res.push((c?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''))};
  const run=(n,f)=>{try{f()}catch(e){failed++;res.push('FAIL '+n+'  [THREW '+e.message+']');console.error('THREW '+n+'\\n'+e.stack)}};

  // ---- core physics / collision ----
  run('spawn/landing',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<120;i++)update();
    const p=L.p;
    ok('spawn lands on ground',p.on&&Math.abs(p.y-(G-28))<0.6,'y='+p.y.toFixed(2)+' on='+p.on);
  });

  run('walking',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<20;i++)update();
    const p=L.p,x0=p.x;
    K.r=1;for(let i=0;i<40;i++)update();K.r=0;
    ok('walks right',p.x>x0+100,'dx='+(p.x-x0).toFixed(1));
    ok('stays on floor while walking',p.on&&Math.abs(p.y-(G-28))<0.6,'y='+p.y.toFixed(2));
  });

  run('jump',()=>{
    startGame(0,12345,'normal',{});
    for(let i=0;i<20;i++)update();
    const p=L.p,gy=p.y;let peak=gy;
    jumpPress();K.j=1;
    for(let i=0;i<30;i++){update();peak=Math.min(peak,p.y)}
    ok('jump gets height',gy-peak>80,'height='+(gy-peak).toFixed(1));
    K.j=0;for(let i=0;i<90;i++)update();
    ok('comes back down and lands',p.on&&Math.abs(p.y-(G-28))<0.6,'y='+p.y.toFixed(2)+' on='+p.on);
  });

  run('coyote',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:460,y:G-28,w:22,h:28,vx:0,vy:0,on:true,f:1,coyote:7},S:[g(0,500)],Hz:[],SG:[],fake:0,goal:99999};
    for(let i=0;i<2;i++)update();
    L.p.x=510;update();
    ok('left ledge without landing',!L.p.on,'on='+L.p.on);
    jumpPress();update();
    ok('coyote jump works',L.p.vy<0,'vy='+L.p.vy.toFixed(1));
  });

  run('wall',()=>{
    startGame(0,12345,'normal',{});
    L={p:{x:150,y:G-28,w:22,h:28,vx:0,vy:0,on:true,f:1,coyote:7},S:[g(0,600),{x:250,y:180,w:40,h:120,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    K.r=1;for(let i=0;i<80;i++)update();K.r=0;
    ok('wall stops player',Math.abs(L.p.x-(250-22))<0.6,'x='+L.p.x.toFixed(2));
    ok('wall does not push player up',L.p.y>G-40,'y='+L.p.y.toFixed(2));
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

  // ---- fireballs ----
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

  run('fireball variants',()=>{
    startGame(0,1,'normal',{shotgun:true});advanceNow(5000);ok('shotgun fires',fire()===true);ok('shotgun fires five',FB.length===5,'n='+FB.length);
    startGame(0,1,'normal',{onebullet:true});advanceNow(5000);ok('one bullet first shot',fire()===true);ok('one bullet blocks second',fire()===false);
    startGame(0,1,'normal',{mines:true});advanceNow(5000);ok('mine drops',fire()===true&&MINES.length===1,'n='+MINES.length);
    for(let i=0;i<30;i++)update();
    ok('mine settles without crashing',MINES.length>=0);
    startGame(0,1,'normal',{bouncyfb:true});advanceNow(5000);fire();ok('bouncy fireball has bounces',FB[0]&&FB[0].bounce===3);
  });

  // ---- mutation catalog / menu ----
  run('mutation catalog',()=>{
    const ids=Object.keys(MUT_DEFS);
    ok('at least 50 mutations',ids.length>=50,'n='+ids.length);
    ok('every mutation has a category',ids.every(k=>MUT_CATS.includes(MUT_DEFS[k].cat)));
    ok('every mutation has text',ids.every(k=>MUT_DEFS[k].name&&MUT_DEFS[k].desc));
    ok('skip token stays excluded',!ids.includes('skip'));
  });

  run('mutation menu',()=>{
    MUsel={fb:false};muTxt();buildMut();
    const btns=$('mlist').children.filter(c=>c.dataset&&c.dataset.id);
    ok('mutation buttons rendered',btns.length>=50,'n='+btns.length);
    const b=btns.find(x=>x.dataset.id==='fb');
    ok('infinite fireballs button exists',!!b);
    b.onclick();
    ok('toggle turns mutation on',MUsel.fb===true&&/Infinite Fireballs/.test($('mum').textContent),'label='+$('mum').textContent);
    b.onclick();
    ok('toggle turns mutation off',MUsel.fb===false&&$('mum').textContent==='Mutations: none','label='+$('mum').textContent);
  });

  run('settings swatches',()=>{
    buildSwatches();
    const sw=$('sw');
    ok('six colour swatches rendered',sw.children.length===6,'n='+sw.children.length);
    const before=me;
    sw.children[(before+1)%6].onclick();
    ok('swatch click changes player colour',me!==before,'me='+me);
  });

  run('mutation effects',()=>{
    startGame(0,1,'normal',{tiny:true});ok('tiny size',L.p.w===13,'w='+L.p.w);
    startGame(0,1,'normal',{giant:true});ok('giant size',L.p.w===35,'w='+L.p.w);
    startGame(0,1,'normal',{reverse:true});for(let i=0;i<20;i++)update();const x0=L.p.x;
    K.r=1;for(let i=0;i<20;i++)update();K.r=0;
    ok('reverse moves left',L.p.x<x0,'dx='+(L.p.x-x0));
    startGame(0,1,'normal',{double:true});for(let i=0;i<10;i++)update();jumpPress();K.j=1;
    for(let i=0;i<8;i++)update();K.j=0;
    ok('double jump grants an air jump',L.p.air>=1,'air='+L.p.air);
    startGame(0,1,'normal',{moon:true});for(let i=0;i<10;i++)update();ok('moon boots flag active',has('moon'));
  });

  run('all mutations smoke',()=>{
    const all={};Object.keys(MUT_DEFS).forEach(k=>all[k]=true);
    startGame(1,123,'normal',all);
    for(let i=0;i<300;i++){
      K.r=i%80<40?1:0;K.l=i%80>=40?1:0;
      if(i%37===0)jumpPress();
      if(i%29===0)fire();
      update();if(i%3===0)draw();
    }
    K.r=K.l=0;
    ok('all 56 mutations ran together',true);
    ok('player still inside the world',L.p.x>=0&&L.p.x<LW,'x='+L.p.x.toFixed(1));
  });

  // ---- levels / modes / boss ----
  run('all levels',()=>{
    for(let i=0;i<LV.length;i++){
      startGame(0,55,'normal',{},{level:i});
      for(let j=0;j<45;j++){if(j%17===0)jumpPress();update()}
      draw();
      ok('level '+(i+1)+' — '+L.name,L&&L.S.length>0&&L.goal>0);
    }
  });

  run('all modes',()=>{
    for(const md of MODES){
      startGame(0,77,md.id,{});
      for(let i=0;i<60;i++){if(i%20===0)jumpPress();update()}
      draw();
      ok('mode '+md.id+' runs',gm===md.id);
    }
  });

  run('deathmatch hud and state',()=>{
    for(const md of ['dm','koth','tag','infect','potato','shared']){
      startGame(0,1,md,{});for(let i=0;i<5;i++)update();draw();
      ok('HUD renders for '+md,true);
    }
  });

  run('boss level',()=>{
    startGame(0,1,'normal',{},{level:9});
    ok('boss exists',!!L.boss);
    const b=L.boss;b.hp=1;
    FB.push({x:b.x+20,y:b.y+30,vx:1,vy:0,l:10,age:0,hits:0});
    updateFire();
    ok('boss can be killed',b.dead===true,'hp='+b.hp);
    draw();
  });

  // ---- editor / custom levels ----
  run('editor round-trip',()=>{
    const o={name:'Test',theme:2,LW:1500,fake:800,goal:1300,S:[{x:0,y:G,w:500,h:60,t:0,c:0,kind:'solid'}],Hz:[sp(300,40,'x')],SG:[[100,'SAFE']],spawn:40};
    const enc=encodeLevel(o),dec=decodeLevel(enc);
    ok('level encode/decode round-trips',!!dec&&dec.goal===1300&&dec.name==='Test','enc='+enc.length);
    ok('base64 handles unicode',b64dec(b64enc('héllo ✓'))==='héllo ✓');
  });

  run('custom level playtest',()=>{
    const o={name:'Custom',theme:0,LW:1200,fake:700,goal:1000,S:[{x:0,y:G,w:600,h:60,t:0,c:0,kind:'solid'}],Hz:[],SG:[[50,'SAFE']],spawn:40};
    startGame(0,1,'normal',{},{custom:o,run:'custom'});
    for(let i=0;i<30;i++)update();
    draw();
    ok('custom level starts',runMode==='custom'&&L.name==='Custom');
    const ed=editorLevel();
    ok('editor exports a usable level',!!ed&&ed.goal>0);
    startCustom(ed);
    ok('editor playtest starts',mode==='game'&&runMode==='custom');
  });

  // ---- pause / retry / progression ----
  run('pause and retry',()=>{
    startGame(0,1,'normal',{});
    const x=L.p.x;
    paused=true;K.r=1;
    for(let i=0;i<20;i++)update();
    ok('pause freezes the player',L.p.x===x,'x='+L.p.x);
    paused=false;K.r=0;
    L.p.x=300;retryLevel();
    ok('retry resets the level',L.p.x<100,'x='+L.p.x);
  });

  run('progression and saves',()=>{
    unlockAch('first_clear');
    ok('achievement unlocks',!!meta.ach.first_clear);
    saveRun();
    const r=readRun();
    ok('run save exists',!!r&&typeof r.lv==='number');
    clearRun();
    ok('run save clears',readRun()===null);
    meta.souls=50;meta.hat=0;
    renderShop();
    const btns=$('shopBody').children.filter(c=>c.tagName==='BUTTON');
    ok('shop renders items',btns.length>0,'n='+btns.length);
    if(btns.length){btns[0].onclick();ok('shop purchase works',meta.hat===1||meta.souls<50,'hat='+meta.hat+' souls='+meta.souls)}
  });

  run('level timing',()=>{
    startGame(0,321,'normal',{});
    for(let i=0;i<120;i++)update();
    winLevel();
    const b=meta.best[levelKey(lv)];
    ok('best time is stored in milliseconds',!!b&&b.time>1000&&b.time<10000,'ms='+(b&&b.time));
  });

  run('meta screens render',()=>{
    meta.souls=100;
    renderShop();renderStats();renderLevels();renderProfile();renderRooms();
    ok('profile, stats, shop, levels, rooms render',true);
  });

  // ---- hazard fuzz ----
  run('collision fuzz',()=>{
    startGame(0,777,'normal',{});
    L={p:{x:100,y:200,w:22,h:28,vx:0,vy:0,on:false,f:1,coyote:0},S:[g(0,3000),
      {x:150,y:250,w:90,h:50,t:0,c:0},{x:300,y:220,w:70,h:80,t:0,c:0},
      {x:430,y:190,w:50,h:110,t:0,c:0},{x:530,y:260,w:120,h:40,t:0,c:0},
      {x:700,y:230,w:60,h:70,t:0,c:0}],Hz:[],SG:[],fake:0,goal:99999};
    let maxPen=0,worst='',stuck=0;
    for(let i=0;i<3000;i++){
      if(i%120===0){L.p.x=Math.random()*1000;L.p.y=80+Math.random()*120;L.p.vx=0;L.p.vy=0;L.p.on=false;L.p.coyote=0;dead=0}
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

  run('hazard fuzz',()=>{
    startGame(0,9,'normal',{earthquake:true,wind:true,risingwater:true,risingceiling:true});
    L={p:{x:100,y:200,w:22,h:28,vx:0,vy:0,on:false,f:1,coyote:0,stick:0,air:0,gdir:1},
      S:[g(0,3000),{x:300,y:220,w:100,h:80,t:0,c:0,kind:'solid'},{x:600,y:200,w:60,h:20,t:0,c:0,kind:'conveyor',cvx:1.2},
        {x:900,y:G-20,w:60,h:20,t:0,c:0,kind:'spring'},{x:1100,y:G-20,w:60,h:20,t:0,c:0,kind:'phantom',ph:0}],
      Hz:[saw(400,120),turret(700,120,-1),laser(800,150,100,80),pend(1000,80,70),gas(1500,100),quicksand(1800,100),
        blackhole(2000,100),fakeSafe(2200,80),tracking(2400,100),boulder(2600,100),fire(2800,100,24,12,100)],
      SG:[],fake:0,goal:99999,coins:[],boss:null,cp:null,secret:null,zone:{x:0,y:0,w:1,h:1}};
    for(let i=0;i<500;i++){
      if(i%100===0){L.p.x=50+i*3;L.p.y=180;L.p.vy=0;dead=0}
      K.r=1;if(i%7===0)jumpPress();
      update();if(i%2===0)draw();
    }
    K.r=0;
    ok('hazards run for 500 frames',true);
    ok('player remains finite',Number.isFinite(L.p.x)&&Number.isFinite(L.p.y),'x='+L.p.x.toFixed(1)+' y='+L.p.y.toFixed(1));
  });

  run('render smoke',()=>{
    startGame(0,1,'normal',{fb:true});
    K.f=1;for(let i=0;i<40;i++){update();draw()}K.f=0;
    dead=20;draw();
    dead=0;won=true;draw();won=false;
    ok('draw runs in game/dead/won states',true);
  });

  console.log(res.join('\\n'));
  console.log('\\n'+(failed?failed+' TEST(S) FAILED':'ALL TESTS PASSED'));
  globalThis.__failed=failed;
})();
`;

let code=m[1]+tests;
try{
  vm.createContext(sandbox);
  vm.runInContext(code,sandbox,{filename:'ep-game.js',timeout:30000});
  console.log('FAILURES:',sandbox.__failed);
  process.exit(sandbox.__failed?1:0);
}catch(e){
  console.error('HARNESS ERROR:',e.stack);
  process.exit(2);
}
