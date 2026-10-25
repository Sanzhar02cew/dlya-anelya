const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);
let privateLetterKey=new URLSearchParams(location.hash.slice(1)).get('letter');
try{if(privateLetterKey)sessionStorage.setItem('anelya-letter-key',privateLetterKey);else privateLetterKey=sessionStorage.getItem('anelya-letter-key')}catch{}
let letterOpened=false;
function fromBase64URL(s){const b=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(b),c=>c.charCodeAt(0))}
async function unlockLetter(){
  if(letterOpened)return true;
  if(!privateLetterKey){$('#letter-lock-note').textContent='Это личное письмо. Открой секретную ссылку, которую прислал Санжар.';return false}
  const button=$('#unlock-letter');button.disabled=true;button.textContent='Открываем…';
  try{
    const envelope=JSON.parse($('#private-letter-data').textContent);
    const key=await crypto.subtle.importKey('raw',fromBase64URL(privateLetterKey),'AES-GCM',false,['decrypt']);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64URL(envelope.iv)},key,fromBase64URL(envelope.data));
    const body=$('#letter-body');body.className='letter-content';body.innerHTML=new TextDecoder().decode(plain);letterOpened=true;return true;
  }catch{button.disabled=false;button.textContent='Открыть письмо ♡';$('#letter-lock-note').textContent='Не получилось открыть письмо. Проверь, что секретная ссылка скопирована полностью.';return false}
}
$('#unlock-letter').addEventListener('click',unlockLetter);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}

if(!reduceMotion){const colors=['#e7b6be','#e8c3be','#c9c4a2'];for(let i=0;i<12;i++){const p=document.createElement('i');p.className='petal';p.style.cssText=`left:${Math.random()*100}%;--size:${6+Math.random()*7}px;--duration:${15+Math.random()*15}s;--delay:${-Math.random()*30}s;--petal-color:${colors[i%3]}`;$('#petals').append(p)}}

function confetti(x=innerWidth/2,y=innerHeight*.45,count=45){if(reduceMotion)return;const colors=['#c47f96','#e5b0bf','#b9bda0','#d6b67b','#c3b3d8'];for(let i=0;i<count;i++){const p=document.createElement('span');p.className='particle';p.textContent=i%3?'✿':'♡';const angle=Math.random()*Math.PI*2,dist=100+Math.random()*270;p.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist-70}px;--rotation:${Math.random()*500-250}deg;--duration:${1.5+Math.random()*1.3}s;--particle-color:${colors[i%colors.length]};--size:${10+Math.random()*16}px`;document.body.append(p);setTimeout(()=>p.remove(),3000)}}

$('#open-letter').addEventListener('click',()=>{const b=$('#open-letter').getBoundingClientRect();confetti(b.x+b.width/2,b.y,25);unlockLetter();$('#letter').scrollIntoView({behavior:reduceMotion?'instant':'smooth'});setTimeout(()=>{const letter=$('.letter-paper');letter.classList.add('visible')},500)});
const wishDialog=$('#wish-dialog');document.querySelectorAll('.wish-flower').forEach(button=>button.addEventListener('click',()=>{$('#dialog-title').textContent=button.dataset.wish;$('#dialog-message').textContent=button.dataset.message;wishDialog.showModal()}));$('.dialog-close').addEventListener('click',()=>wishDialog.close());$('.dialog-done').addEventListener('click',()=>wishDialog.close());wishDialog.addEventListener('click',e=>{if(e.target===wishDialog){const r=wishDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)wishDialog.close()}});

let blown=false;function blow(){if(blown)return;blown=true;$('#cake').classList.add('extinguished');$('#cake').setAttribute('aria-label','Свечка погасла. Пусть желание сбудется!');$('#blow-button').hidden=true;$('#wish-success').hidden=false;$('#cake-instruction').innerHTML='Сохрани желание в своём сердце.<br>Оно обязательно найдёт дорогу к тебе 🤍';const r=$('#cake').getBoundingClientRect();confetti(r.x+r.width/2,r.y+70,70)}
$('#cake').addEventListener('click',blow);$('#blow-button').addEventListener('click',blow);$('#relight').addEventListener('click',()=>{blown=false;$('#cake').classList.remove('extinguished');$('#cake').setAttribute('aria-label','Загадать желание и погасить свечку');$('#blow-button').hidden=false;$('#wish-success').hidden=true;$('#cake-instruction').innerHTML='Закрой глаза и подумай о самой заветной мечте.<br>А потом погаси свечку ✨'});

const soundtrack=$('#soundtrack');
let wantsMusic=true,playAttempt=0;
soundtrack.volume=.55;
function musicState(playing){
  $('#music').setAttribute('aria-pressed',String(playing));
  $('#music').setAttribute('aria-label',playing?'Выключить музыку':'Включить музыку');
  $('#music-label').textContent=playing?'Выключить музыку':'Включить музыку';
}
function tryMusic(){
  if(!wantsMusic||!soundtrack.paused)return;
  const attempt=++playAttempt;
  try{
    const playback=soundtrack.play();
    if(playback?.catch)playback.catch(error=>{
      if(attempt!==playAttempt||!wantsMusic||error.name==='AbortError')return;
      musicState(false);
      $('#music-label').textContent=error.name==='NotAllowedError'?'Коснись экрана ♫':'Музыка недоступна';
    });
  }catch{musicState(false);$('#music-label').textContent='Коснись экрана ♫'}
}
soundtrack.addEventListener('playing',()=>musicState(true));
soundtrack.addEventListener('pause',()=>musicState(false));
soundtrack.addEventListener('error',()=>{musicState(false);$('#music-label').textContent='Музыка недоступна'});
soundtrack.addEventListener('canplay',tryMusic);
['pointerdown','touchend','click','keydown'].forEach(type=>document.addEventListener(type,event=>{
  if(event.target.closest?.('#music'))return;
  tryMusic();
},{passive:true}));
$('#music').addEventListener('click',()=>{
  if(!soundtrack.paused){wantsMusic=false;++playAttempt;soundtrack.pause();musicState(false)}
  else{wantsMusic=true;tryMusic()}
});
tryMusic();
if(privateLetterKey)$('#letter-lock-note').textContent='Это письмо адресовано только тебе. Нажми, чтобы открыть ♡';
