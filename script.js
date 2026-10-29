/* =========================================================
   تنظیمات سریع
   ========================================================= */
const CONFIG = {
  snowCount: 45,          // تعداد گلوله‌های برف
  typingSpeed: 45,         // سرعت تایپ (میلی‌ثانیه)
  mouseSparkles: false,     // جرقه دنبال ماوس
  balloonCount: 7,
};
const $ = (s) => document.querySelector(s);
const COLORS = ['#ffd36b','#ff7eb6','#8fd0ff','#ffffff','#a58bff','#6dffb3','#ff9a5c'];

/* =========================================================
   بوم‌ها
   ========================================================= */
const snowC = $('#snow'), sctx = snowC.getContext('2d');
const fxC = $('#fx'), fctx = fxC.getContext('2d');
let W, H;
function resize(){
  const d = Math.min(devicePixelRatio || 1, 1.5);
  W = innerWidth; H = innerHeight;
  [snowC, fxC].forEach(c => { c.width = W * d; c.height = H * d; });
  sctx.setTransform(d,0,0,d,0,0); fctx.setTransform(d,0,0,d,0,0);
}
addEventListener('resize', resize); resize();

/* =========================================================
   برف: گلوله‌های محو و نرم (چند لایه عمق)
   ========================================================= */
function sprite(stop){
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(stop,'rgba(255,255,255,.7)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0,0,64,64); return c;
}
const spriteSharp = sprite(.45), spriteSoft = sprite(.12);
let snowOn = true, wind = 0, windT = 0;
const flakes = Array.from({length: CONFIG.snowCount}, () => newFlake(true));
function newFlake(anywhere){
  const z = Math.random();                      // عمق: 0 دور، 1 نزدیک
  return {
    x: Math.random() * W, y: anywhere ? Math.random() * H : -30,
    r: 3 + z * z * 20, vy: .35 + z * 1.6, ph: Math.random() * 6.28, sw: .3 + Math.random() * .8,
    a: .25 + z * .5, soft: z > .6,
  };
}
function drawSnow(){
  sctx.clearRect(0,0,W,H);
  if(!snowOn) return;
  windT += .004; wind = Math.sin(windT) * .5;
  for(const f of flakes){
    f.ph += .012; f.y += f.vy; f.x += Math.sin(f.ph) * f.sw + wind * f.vy;
    if(f.y > H + 40 || f.x < -60 || f.x > W + 60){ Object.assign(f, newFlake(false)); }
    sctx.globalAlpha = f.a;
    const s = f.r * 2;
    sctx.drawImage(f.soft ? spriteSoft : spriteSharp, f.x - f.r, f.y - f.r, s, s);
  }
  sctx.globalAlpha = 1;
}

/* =========================================================
   افکت‌ها: کاغذ رنگی و جرقه‌های طلایی
   ========================================================= */
let parts = [];
function confettiPiece(x,y,vx,vy){
  parts.push({t:'c',x,y,vx,vy,size:Math.random()*8+5,color:COLORS[Math.random()*COLORS.length|0],
    rot:Math.random()*6.28,vr:(Math.random()-.5)*.3,circle:Math.random()<.3,life:0,max:400});
}
function burst(x,y,n=65){
  for(let i=0;i<n;i++){const a=Math.random()*6.28,sp=Math.random()*10+4;confettiPiece(x,y,Math.cos(a)*sp,Math.sin(a)*sp-4);}
}
function rain(ms=900){
  const end = performance.now()+ms;
  (function drop(){ for(let i=0;i<1;i++) confettiPiece(Math.random()*W,-20,(Math.random()-.5)*3,Math.random()*3+2);
    if(performance.now()<end) requestAnimationFrame(drop); })();
}
function sparkle(x,y,n=28,spread=4){
  for(let i=0;i<n;i++){
    const a=Math.random()*6.28,sp=Math.random()*spread+1;
    parts.push({t:'s',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:Math.random()*3+1,
      color:Math.random()<.6?'255,211,107':'255,255,255',life:0,max:60+Math.random()*60});
  }
}
function ring(x,y){                              // موج نورانی
  parts.push({t:'r',x,y,r:10,life:0,max:50});
}
function celebrate(){
  burst(W*.2,H*.6,18); burst(W*.8,H*.6,18);
  setTimeout(()=>burst(W*.5,H*.4,28),250); rain();
}
function drawFx(){
  fctx.clearRect(0,0,W,H);
  parts = parts.filter(p => p.life < p.max && p.y < H + 40);
  for(const p of parts){
    p.life++;
    if(p.t==='c'){
      p.vy+=.18; p.vx*=.99; p.x+=p.vx+Math.sin(p.life/12)*.6; p.y+=p.vy; p.rot+=p.vr;
      fctx.save(); fctx.translate(p.x,p.y); fctx.rotate(p.rot); fctx.fillStyle=p.color;
      fctx.globalAlpha=Math.min(1,(p.max-p.life)/80);
      if(p.circle){fctx.beginPath();fctx.arc(0,0,p.size/2,0,6.28);fctx.fill();}
      else fctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
      fctx.restore();
    } else if(p.t==='s'){
      p.vx*=.96; p.vy=p.vy*.96+.03; p.x+=p.vx; p.y+=p.vy;
      const k=1-p.life/p.max;
      fctx.globalCompositeOperation='lighter';
      const g=fctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
      g.addColorStop(0,`rgba(${p.color},${k*.7})`); g.addColorStop(1,`rgba(${p.color},0)`);
      fctx.fillStyle=g; fctx.beginPath(); fctx.arc(p.x,p.y,p.r*5,0,6.28); fctx.fill();
      fctx.globalCompositeOperation='source-over';
    } else if(p.t==='r'){
      p.r+=14; const k=1-p.life/p.max;
      fctx.strokeStyle=`rgba(255,230,160,${k*.8})`; fctx.lineWidth=4*k+1;
      fctx.beginPath(); fctx.arc(p.x,p.y,p.r,0,6.28); fctx.stroke();
    }
  }
  fctx.globalAlpha=1;
}
(function loop(){
  if(snowOn) drawSnow();
  if(parts.length) drawFx();
  else fctx.clearRect(0,0,W,H);
  requestAnimationFrame(loop);
})();

/* کلیک روی صفحه = انفجار کاغذ رنگی (بعد از باز شدن پاکت) */
addEventListener('click', (e) => {
  if(!opened || e.target.closest('video,.btn')) return;
  burst(e.clientX, e.clientY, 10);
});

/* =========================================================
   عنوان: حرف به حرف وارد می‌شود
   ========================================================= */
const titleEl = $('#title');
Array.from(titleEl.dataset.text).forEach((ch,i) => {
  const s = document.createElement('span');
  s.className = 'ch'; s.textContent = ch === ' ' ? ' ' : ch;
  s.style.animationDelay = (.5 + i*.07) + 's, 0s';
  titleEl.appendChild(s);
});

/* =========================================================
   پاکت: باز شدن و رویداد‌ها
   ========================================================= */
const env = $('#env'), envWrap = $('#envWrap'), scene = $('#scene'), content = $('#content'), hint = $('#hint');
const music = $('#bgMusic'), btnMusic = $('#btnMusic');
let opened = false, musicBroken = false, ambientTimer = null;

function envCenter(){ const r = env.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; }

function openEnvelope(){
  if(opened) return; opened = true;
  envWrap.classList.add('stop'); hint.classList.add('hide');
  if(!musicBroken){ music.play().then(()=>btnMusic.classList.add('on')).catch(()=>{}); }

  env.classList.add('open');                              // ۱) درِ پاکت باز می‌شود
  setTimeout(() => { const c=envCenter(); sparkle(c.x,c.y,24,4); ring(c.x,c.y); }, 450);
  setTimeout(() => env.classList.add('rise'), 800);       // ۲) نامه بالا می‌آید
  setTimeout(() => {                                      // ۳) انفجار نور
    const c=envCenter();
    $('#flash').classList.add('go'); ring(c.x,c.y); 
    sparkle(c.x,c.y,32,5); celebrate();
    $('#rays').classList.add('show');
  }, 1900);
  setTimeout(() => {                                      // ۴) پاکت محو و محتوا ظاهر می‌شود
    scene.classList.add('gone');
    document.body.classList.remove('locked');
    content.classList.add('show');
    setTimeout(typeText, 1200);
    startBalloons(); startAmbient();
  }, 2300);
  setTimeout(() => { scene.style.display = 'none'; $('#flash').classList.remove('go'); }, 3400);
}
envWrap.addEventListener('click', openEnvelope);
hint.addEventListener('click', openEnvelope);

/* برگشت به پاکت */
$('#btnReplay').addEventListener('click', () => {
  opened = false; clearTimeout(typeTimer); stopBalloons(); stopAmbient();
  $('#balloons').innerHTML = ''; $('#rays').classList.remove('show');
  content.classList.remove('show'); document.body.classList.add('locked'); scrollTo(0,0);
  scene.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    scene.classList.remove('gone'); env.classList.remove('open','rise');
    envWrap.classList.remove('stop'); hint.classList.remove('hide');
  }));
});

/* جرقه‌های طلایی آرام در پس‌زمینه */
function startAmbient(){ stopAmbient(); ambientTimer = setInterval(() => sparkle(Math.random()*W, Math.random()*H*.7, 3, 1.2), 1500); }
function stopAmbient(){ clearInterval(ambientTimer); }

/* =========================================================
   بادکنک‌ها
   ========================================================= */
const balloonBox = $('#balloons'); let balloonsOn = false, balloonTimer = null;
function spawnBalloon(){
  const b = document.createElement('div'), w = 45 + Math.random()*45;
  b.className = 'balloon';
  b.style.cssText = `left:${Math.random()*95}%;--w:${w}px;--c:${COLORS[Math.random()*(COLORS.length-1)|0]};--t:${11+Math.random()*9}s;--sx:${(Math.random()-.5)*120}px`;
  b.addEventListener('click', (e) => { e.stopPropagation(); const r=b.getBoundingClientRect(); burst(r.left+r.width/2,r.top+r.height/2,8); sparkle(r.left+r.width/2,r.top+r.height/2,5,2); b.remove(); });
  b.addEventListener('animationend', () => b.remove());
  balloonBox.appendChild(b);
}
function startBalloons(){
  stopBalloons(); balloonsOn = true; $('#btnBalloons').classList.add('on');
  for(let i=0;i<3;i++) setTimeout(spawnBalloon, i*700);
  balloonTimer = setInterval(() => { if(balloonBox.children.length < CONFIG.balloonCount) spawnBalloon(); }, 2800);
}
function stopBalloons(){ clearInterval(balloonTimer); balloonsOn = false; $('#btnBalloons').classList.remove('on'); }
$('#btnBalloons').addEventListener('click', () => { if(balloonsOn){ stopBalloons(); balloonBox.innerHTML=''; } else startBalloons(); });

/* =========================================================
   تایپ متن
   ========================================================= */
const msg = $('#messageText'), fullText = msg.textContent.trim(); let typeTimer = null;
msg.textContent = '';
function typeText(){
  clearTimeout(typeTimer); msg.textContent = '';
  const cur = document.createElement('span'); cur.className = 'cursor'; msg.appendChild(cur);
  let i = 0;
  (function step(){
    if(i < fullText.length){ cur.before(document.createTextNode(fullText[i++])); msg.scrollTop = msg.scrollHeight; typeTimer = setTimeout(step, CONFIG.typingSpeed); }
    else setTimeout(() => cur.remove(), 1500);
  })();
}
$('#btnType').addEventListener('click', typeText);

/* =========================================================
   ویدئو
   ========================================================= */
const video = $('#mainVideo'), ph = $('#videoPlaceholder');
video.querySelector('source').addEventListener('error', () => ph.classList.add('show'));
video.addEventListener('error', () => ph.classList.add('show'));
video.addEventListener('loadeddata', () => ph.classList.remove('show'));
video.addEventListener('play', () => { burst(W/2, H/2, 8); if(!music.paused){ music.pause(); btnMusic.classList.remove('on'); } });

/* =========================================================
   موزیک، برف، تمام‌صفحه، جشن
   ========================================================= */
music.addEventListener('error', () => { musicBroken = true; btnMusic.style.display = 'none'; });
btnMusic.addEventListener('click', () => {
  if(musicBroken) return;
  if(music.paused){ music.play().catch(()=>{}); btnMusic.classList.add('on'); } else { music.pause(); btnMusic.classList.remove('on'); }
});
$('#btnSnow').addEventListener('click', (e) => { snowOn = !snowOn; e.currentTarget.classList.toggle('on', snowOn); });
$('#btnConfetti').addEventListener('click', celebrate);
$('#btnFull').addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });

/* =========================================================
   حرکت سه‌بعدی باکس‌ها و جرقه ماوس
   ========================================================= */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if(e.target.closest('video')) return;
    const r = card.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
    card.style.setProperty("--mx",(x+.5)*100+"%"); card.style.setProperty("--my",(y+.5)*100+"%");
    card.style.transform = `perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});
if(CONFIG.mouseSparkles && matchMedia('(pointer:fine)').matches){
  let last = 0;
  addEventListener('mousemove', (e) => {
    const now = performance.now(); if(now-last < 80) return; last = now;
    const s = document.createElement('div'); s.className = 'spark';
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:${COLORS[Math.random()*COLORS.length|0]};--dx:${(Math.random()-.5)*50}px;--dy:${Math.random()*50+10}px`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 800);
  });
}
