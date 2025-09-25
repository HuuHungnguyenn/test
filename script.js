# script.js
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
