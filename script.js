# script.js
'use strict';

// ====== Elements ======
const stage = document.getElementById('stage');
const tpl = document.getElementById('heartTpl');
const counterEl = document.getElementById('dayCounter');
const audio = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const musicTitleEl = document.getElementById('musicTitle');

// ====== Playlist ======
const PLAYLIST = [
  'Mirrors.mp3'
  'iloveyou3000.mp3'
  'youngandbeautiful.mp3', 
];
let currentIndex = 0;
let kicked = false;

function niceTitle(src){
  try{
    const url = new URL(src, window.location.href);
    const name = decodeURIComponent(url.pathname.split('/').pop() || '');
    return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g,' ').trim();
  }catch{ return src; }
}

function primeFirstTrack(){
  if(!PLAYLIST.length) return;
  const firstSrc = new URL(PLAYLIST[currentIndex], window.location.href).href;
  audio.preload = 'auto';
  audio.src = firstSrc;
  musicTitleEl.textContent = niceTitle(firstSrc);
  try{ audio.load(); }catch(_){}
}

function nextTrack(){
  if(!PLAYLIST.length) return;
  currentIndex = (currentIndex + 1) % PLAYLIST.length;
  audio.src = PLAYLIST[currentIndex];
  musicTitleEl.textContent = niceTitle(PLAYLIST[currentIndex]);
  audio.play().catch(()=>{});
}

audio.addEventListener('ended', nextTrack);

// First user interaction → play ASAP
const firstKick = async ()=>{
  if(kicked) return; kicked = true;
  try{
    // đảm bảo có tiếng
    audio.muted = false;
    await audio.play();
    musicBtn.textContent = '🎵 Đang phát';
    musicBtn.setAttribute('aria-pressed','true');
    musicTitleEl.hidden = false;
  }catch(e){
    // fallback: reset src rồi thử lại 1 lần
    try{ const s = audio.src; audio.src = s; audio.load(); await audio.play(); musicBtn.textContent='🎵 Đang phát'; musicBtn.setAttribute('aria-pressed','true'); musicTitleEl.hidden=false; }catch(_){ kicked=false; }
  }
  window.removeEventListener('pointerdown', firstKick);
  window.removeEventListener('keydown', firstKick);
  window.removeEventListener('touchstart', firstKick);
};

musicBtn.addEventListener('click', async ()=>{
  if(audio.paused){
    await firstKick();
  }else{
    audio.pause();
    musicBtn.textContent = '🎵 Bật nhạc';
    musicBtn.setAttribute('aria-pressed','false');
  }
});

window.addEventListener('pointerdown', firstKick, { once:true });
window.addEventListener('keydown', firstKick, { once:true });
window.addEventListener('touchstart', firstKick, { once:true });

// ====== Hearts auto float ======
function rand(min, max){ return Math.random() * (max - min) + min; }

function createHeart(x, y, color){
  const node = tpl.content.firstElementChild.cloneNode(true);
  const size = rand(16, 40);
  node.style.width = node.style.height = size + 'px';
  node.style.color = color || `hsl(${(rand(330, 380)) % 360} ${rand(70,95)}% ${rand(55,75)}%)`;

  const sway = rand(30, 120);
  const drift = rand(-sway, sway);
  const duration = rand(6, 12);
  const start = performance.now();
  const angle = rand(0, Math.PI*2);
  const rot = rand(-30, 30);
  const startX = x + drift;
  const startY = y;

  function frame(t){
    const k = (t - start) / (duration * 1000);
    if(k >= 1){ node.remove(); return; }
    const ease = 1 - Math.pow(1 - k, 2);
    const up = ease * (window.innerHeight * 0.9 + 100);
    const swayX = Math.sin(k * Math.PI * 2 + angle) * sway * (1 - k);
    node.style.transform = `translate(${startX + swayX}px, ${startY - up}px) rotate(${rot * (1-k)}deg)`;
    node.style.opacity = 1 - k;
    requestAnimationFrame(frame);
  }
  node.style.left = '0'; node.style.top = '0';
  stage.appendChild(node);
  requestAnimationFrame(frame);
}

function loop(t){
  const freq = 220;
  if(!window.lastSpawn || t - window.lastSpawn > freq){
    window.lastSpawn = t;
    const x = rand(0, window.innerWidth);
    const y = window.innerHeight + 20;
    createHeart(x, y);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ====== Click burst 🦊🐰 ======
const ICONS = ['🦊','🐰','☁️','🌟','🌸'];
function createIcon(x, y){
  const el = document.createElement('div');
  el.className = 'icon-burst';
  el.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
  el.style.fontSize = rand(28, 42) + 'px';

  const duration = rand(0.9, 1.6);
  const start = performance.now();
  const angle = rand(-Math.PI/2 - 0.7, -Math.PI/2 + 0.7);
  const speed = rand(220, 420);
  const gravity = 620;
  const spin = rand(-40, 40);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  function frame(t){
    const k = (t - start) / 1000;
    if(k >= duration){ el.remove(); return; }
    const dx = vx * k;
    const dy = vy * k + 0.5 * gravity * k * k;
    el.style.transform = `translate(${x + dx}px, ${y + dy}px) rotate(${spin * k}deg)`;
    el.style.opacity = 1 - (k / duration);
    requestAnimationFrame(frame);
  }
  el.style.left = '0'; el.style.top = '0';
  stage.appendChild(el);
  requestAnimationFrame(frame);
}

function burstAt(x, y, count = 12){
  for(let i=0;i<count;i++){
    const jitterX = rand(-25, 25);
    const jitterY = rand(-15, 15);
    createIcon(x + jitterX, y + jitterY);
  }
}

let holding = false, holdTimer;
window.addEventListener('pointerdown', (e)=>{
  holding = true; burstAt(e.clientX, e.clientY, 12);
  clearInterval(holdTimer);
  holdTimer = setInterval(()=>{ if(holding) burstAt(e.clientX, e.clientY, 8); }, 200);
});
window.addEventListener('pointerup', ()=>{ holding = false; clearInterval(holdTimer); });

// ====== Day counter (from 2025-03-20) ======
const startDate = new Date('2025-03-20T00:00:00');
function updateCounter(){
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  counterEl.textContent = `Đã bên nhau ${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
}
updateCounter();
setInterval(updateCounter, 1000);

// Prime audio on load so click phát nhanh
document.addEventListener('DOMContentLoaded', primeFirstTrack);
