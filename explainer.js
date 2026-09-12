(() => {
  const host = document.querySelector('#explainer');
  if (!host) return;
  const canvas = host.querySelector('.film-art');
  const title = host.querySelector('.film-title');
  const caption = host.querySelector('.film-caption');
  const toggle = host.querySelector('[data-film-toggle]');
  const replay = host.querySelector('[data-film-replay]');
  const seek = host.querySelector('[data-film-seek]');
  const clock = host.querySelector('.film-time');
  const narration = host.querySelector('[data-film-audio]');
  const mute = host.querySelector('[data-film-mute]');
  const audioStatus = host.querySelector('[data-film-audio-status]');
  let useAudio = true;
  const chapters = [...host.querySelectorAll('[data-film-chapter]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sceneStarts = [0, 6, 11, 16, 21, 26, 31];
  const length = 36;
  let time = 0, playing = false, previous = null, frame = null, current = -1;
  let inView = false;
  const scenes = [
    ['Your store. Your pace.', 'Walk into a participating store and make a little more room for your day.'],
    ['Start with your store.', 'Open ITS3LF. Choose your store or scan its store QR to begin.'],
    ['See it. Scan it.', 'Scan the product barcode. Your pick appears in your digital basket.'],
    ['Everything adds up.', 'Review your products and total before you move on to payment.'],
    ['Pay your way.', 'Pay online, or choose cash and pay at the store counter. This preview follows online payment.'],
    ['One last check.', 'After payment, show your exit QR to store staff for verification.'],
    ['A little more living.', 'Shopping done. On with your day. ITS3LF — SCAN . PAY & GO.']
  ];
  const text = (x, y, value, size = 16, fill = '#183b3d', weight = 500, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" ${extra}>${value}</text>`;
  const rect = (x,y,w,h,fill,r=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
  const circle = (x,y,r,fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const check = (x,y) => `<path d="M${x} ${y}l9 9 19-22" fill="none" stroke="#183b3d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const qr = (x,y) => `<g transform="translate(${x} ${y})">${rect(0,0,78,78,'#fff',7)}${[0,1,2].map(i => {const a=i===1?49:8,b=i===2?49:8;return rect(a,b,21,21,'#183b3d',2)+rect(a+5,b+5,11,11,'#fff')+rect(a+8,b+8,5,5,'#183b3d');}).join('')}${[ [36,9],[35,23],[9,36],[22,36],[35,36],[49,36],[62,36],[36,49],[49,49],[62,62],[49,62],[35,65]].map(([a,b])=>rect(a,b,7,7,'#183b3d')).join('')}</g>`;
  const product = (x,y,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${rect(0,0,65,93,'#ffd34d',5)}${rect(0,0,65,11,'#ead3a0',3)}${text(32,34,'DAILY',9,'#183b3d',700,'text-anchor="middle"')}${text(32,54,'OATS',17,'#183b3d',800,'text-anchor="middle"')}${rect(15,65,35,16,'#fff')}${[0,4,7,13,17,23,27].map(i=>rect(18+i,67,2,12,'#183b3d')).join('')}</g>`;
  const shopper = (x,y,scale=1,staff=false) => `<g data-actor transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="40" cy="213" rx="46" ry="7" fill="#183b3d15"/><g data-leg-left><path d="M34 126 21 174 8 204" fill="none" stroke="#183b3d" stroke-width="19" stroke-linecap="round"/><path d="M8 205h-13" stroke="#f8f7f1" stroke-width="10" stroke-linecap="round"/></g><g data-leg-right><path d="M48 126 60 173 76 204" fill="none" stroke="#244f50" stroke-width="19" stroke-linecap="round"/><path d="M76 205h14" stroke="#f8f7f1" stroke-width="10" stroke-linecap="round"/></g><path d="M26 58Q41 49 57 59L65 133H17Z" fill="${staff?'#6eafb2':'#f8f7f1'}"/>${rect(33,38,15,22,'#c88e6b',5)}${circle(41,29,23,'#dba681')}<path d="M19 28Q12-7 44 4Q67 5 64 28L50 18 30 18 27 35Z" fill="#183b3d"/><path d="M25 69 10 101 25 124M55 69 74 95 98 82" fill="none" stroke="${staff?'#6eafb2':'#f8f7f1'}" stroke-width="15" stroke-linecap="round"/>${circle(99,82,7,'#dba681')}${rect(93,64,14,25,'#183b3d',3)}${staff?rect(28,73,25,13,'#ffd34d',2):''}</g>`;
  const shelves = () => `<g opacity=".85">${rect(58,105,645,210,'#e0e9df',12)}${[155,226,297].map((y,row)=>`${Array.from({length:11},(_,i)=>{const x=75+i*56;const colors=['#a9c6b5','#efc571','#77a8aa','#f8f7f1'];return rect(x,y-38,26+(i%2)*9,38,colors[(i+row)%4],4)+rect(x+7,y-28,12,11,'#ffffff70',2);}).join('')}${rect(66,y,630,8,'#84a8a0',2)}`).join('')}</g>`;
  const store = () => `<g>${rect(80,77,385,242,'#f8f7f1',12)}${rect(68,64,409,52,'#183b3d',9)}${text(272,97,'YOUR EVERYDAY STORE',17,'#f8f7f1',700,'text-anchor="middle" letter-spacing="2"')}${rect(100,147,157,146,'#c5dfd8',4)}${rect(277,137,161,182,'#96c3bf',4)}<path d="M357 140v177M105 220h148M179 150v140" stroke="#f8f7f1" stroke-width="7"/>${rect(112,241,47,41,'#ffd34d',4)}${rect(185,234,52,48,'#79a6a1',4)}${text(357,191,'WELCOME',11,'#183b3d',700,'text-anchor="middle"')}${qr(320,207)}${rect(55,317,435,9,'#557f77',4)}</g>`;
  const phone = content => `<g data-phone transform="translate(436 24)"><ellipse cx="110" cy="337" rx="123" ry="11" fill="#183b3d15"/>${rect(0,0,220,332,'#183b3d',27)}${rect(8,8,204,316,'#f8f7f1',21)}${rect(79,12,62,12,'#183b3d',7)}${text(24,49,'ITS3LF',16,'#183b3d',800)}${text(193,47,'DEMO',8,'#527270',600,'text-anchor="end"')}${content}${rect(85,312,50,4,'#183b3d',2)}</g>`;
  const brand = () => `<g data-brand>${circle(385,165,105,'#c1dcd1')}${text(385,171,'ITS3LF',73,'#183b3d',800,'text-anchor="middle" letter-spacing="-5"')}${text(385,215,'SCAN . PAY &amp; GO',18,'#183b3d',600,'text-anchor="middle" letter-spacing="3"')}<path d="M506 110h30v30m-30 0 30-30" fill="none" stroke="#d39f14" stroke-width="6" stroke-linecap="round"/></g>`;
  function artwork(index) {
    const floor = rect(0,324,760,56,'#c8dace') + `<path d="M0 325H760" stroke="#9ebcb0"/>`;
    let body='';
    if(index===0) body=store()+shopper(520,109,.98)+text(546,57,'HELLO, BETTER SHOPPING.',10,'#527270',700,'letter-spacing="1"');
    if(index===1) body=`<g transform="translate(-10 30) scale(.73)">${store()}</g>`+phone(text(23,82,'Find your store',18,'#183b3d',700)+text(23,103,'Your next shop starts here.',10,'#527270')+rect(23,122,174,41,'#e4ece3',8)+text(34,148,'Search by location',12)+rect(23,175,174,97,'#d5e4d9',8)+qr(36,184)+text(122,215,'Scan a',11)+text(122,232,'store QR',11)+text(110,293,'CHOOSE. CONNECT. SHOP.',8,'#527270',600,'text-anchor="middle"'));
    if(index===2) body=shelves()+`<g data-picked-product>${product(215,137,1.25)}</g>`+phone(text(23,82,'Scan your pick',18,'#183b3d',700)+rect(23,99,174,155,'#dbe7dc',9)+product(78,120,1)+`<path d="M35 125v-14h17m116 0h17v14M35 227v14h17m116 0h17v-14" fill="none" stroke="#4d9093" stroke-width="3"/><path data-scan d="M33 170h153" stroke="#4d9093" stroke-width="2"/>`+`<g data-confirm>${rect(23,269,174,28,'#ffd34d',6)}${text(110,288,'Added to your basket',11,'#183b3d',700,'text-anchor="middle"')}</g>`);
    if(index===3) body=shelves()+product(175,190,1.35)+phone(text(23,82,'Your basket',18,'#183b3d',700)+[['Rolled oats','180'],['Fresh oranges','90'],['Oat drink','130']].map(([label,price],i)=>text(23,122+i*39,label,12)+text(195,122+i*39,`₹${price}`,12,'#183b3d',600,'text-anchor="end"')+rect(23,136+i*39,174,1,'#d4dfd5')).join('')+text(23,256,'Total',15,'#183b3d',700)+text(195,256,'₹400',18,'#183b3d',700,'text-anchor="end"')+rect(23,273,174,27,'#183b3d',6)+text(110,291,'Continue to payment →',10,'#f8f7f1',600,'text-anchor="middle"'));
    if(index===4) body=shopper(181,106,1)+phone(text(23,82,'Make it yours.',18,'#183b3d',700)+text(23,108,'Choose how to pay',11,'#527270')+rect(23,130,174,53,'#183b3d',9)+text(39,153,'Pay online',13,'#f8f7f1',700)+text(39,170,'UPI / supported payment apps',8,'#c5dfd8')+rect(23,196,174,47,'#e1e9df',9)+text(39,223,'Pay cash at counter',12)+`<g data-confirm>${rect(23,261,174,37,'#ffd34d',8)}${text(110,284,'Online payment complete ✓',10,'#183b3d',700,'text-anchor="middle"')}</g>`);
    if(index===5) body=shopper(128,107,1,true)+rect(260,200,97,125,'#6eafb2',8)+text(308,226,'EXIT CHECK',9,'#183b3d',700,'text-anchor="middle"')+circle(310,262,20,'#ffd34d')+check(297,262)+phone(text(23,82,'Ready for your day.',16,'#183b3d',700)+text(23,107,'Show this to store staff',11,'#527270')+`<g transform="translate(0 -8)">${qr(71,133)}</g>`+text(110,230,'EXIT PASS',12,'#183b3d',700,'text-anchor="middle" letter-spacing="2"')+rect(23,249,174,31,'#dbe8d6',7)+text(110,269,'Payment verified ✓',11,'#183b3d',600,'text-anchor="middle"')+text(110,296,'ILLUSTRATION · NOT A VALID QR',7,'#527270',500,'text-anchor="middle"'));
    if(index===6) body=brand()+`<g transform="translate(0 0)">${shopper(580,137,.85)}</g>`;
    return `<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="font-family:DM Sans,Arial,sans-serif">${rect(0,0,760,380,'#e8eee0')}${circle(680,35,150,'#dbe8d6')}${circle(62,45,90,'#f2f1e4')}${floor}${body}</svg>`;
  }
  function draw() {
    const index=sceneStarts.reduce((active,start,i)=>time>=start?i:active,0);
    const duration=(sceneStarts[index+1] ?? length)-sceneStarts[index];
    const phase=Math.min(1,(time-sceneStarts[index])/duration);
    if(index!==current){
      current=index; canvas.innerHTML=artwork(index); title.textContent=scenes[index][0]; caption.textContent=scenes[index][1];
      host.querySelector('.film-scene-label').textContent=`0${index+1} / ${['ENTER','CONNECT','SCAN','REVIEW','PAY','VERIFY','GO'][index]}`;
      chapters.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    }
    const moving=!reduced.matches;
    const actor=canvas.querySelector('[data-actor]');
    if(actor && moving){
      const origin=index===0?[520,109,.98]:index===4?[181,106,1]:index===5?[128,107,1]:[580,137,.85];
      const offset=index===0?-95*phase:index===6?130*phase:0;
      actor.setAttribute('transform',`translate(${origin[0]+offset} ${origin[1]}) scale(${origin[2]})`);
      if(index===0||index===6){
        const swing=Math.sin(phase*Math.PI*8)*9;
        actor.querySelector('[data-leg-left]').setAttribute('transform',`rotate(${swing} 40 126)`);
        actor.querySelector('[data-leg-right]').setAttribute('transform',`rotate(${-swing} 40 126)`);
      }
    }
    const mobile=canvas.querySelector('[data-phone]');
    if(mobile) mobile.setAttribute('transform',`translate(436 ${moving?24+Math.max(0,1-phase*5)*30:24})`);
    const scan=canvas.querySelector('[data-scan]');
    if(scan) scan.setAttribute('transform',`translate(0 ${moving?Math.sin(phase*Math.PI*3)*53:0})`);
    const confirm=canvas.querySelector('[data-confirm]');
    if(confirm) confirm.setAttribute('opacity',phase>.52?'1':'0');
    seek.value=String(time);
    seek.style.setProperty('--film-progress',`${time/length*100}%`);
    seek.setAttribute('aria-valuetext',`${Math.floor(time)} of ${length} seconds. ${scenes[index][0]}`);
    clock.textContent=`0:${String(Math.floor(time)).padStart(2,'0')} / 0:36`;
  }
  function sync(){toggle.textContent=playing?'Pause':'Play';toggle.setAttribute('aria-label',playing?'Pause explainer':'Play explainer');host.dataset.playing=String(playing);}
  function alignAudio(){
    if(useAudio && narration.readyState>0) narration.currentTime=time;
  }
  function startAudio(){
    if(!useAudio || !narration.paused) return;
    narration.play().catch(error=>{
      if(error.name==='AbortError') return;
      playing=false;previous=null;sync();
      audioStatus.textContent='Audio could not start. Press Play to try again.';
    });
  }
  function tick(now){
    frame=null;
    if(!playing||!inView||document.hidden){previous=null;return;}
    if(useAudio) time=Math.min(length,narration.currentTime);
    else if(previous!==null) time=Math.min(length,time+(now-previous)/1000);
    previous=now;draw();
    if(time>=length){playing=false;narration.pause();previous=null;sync();return;}
    frame=requestAnimationFrame(tick);
  }
  function schedule(){
    if(!playing||!inView||document.hidden){narration.pause();previous=null;return;}
    startAudio();
    if(frame===null){previous=null;frame=requestAnimationFrame(tick);}
  }
  toggle.addEventListener('click',()=>{if(time>=length)time=0;playing=!playing;previous=null;alignAudio();draw();sync();schedule();});
  replay.addEventListener('click',()=>{time=0;playing=true;previous=null;alignAudio();draw();sync();schedule();});
  seek.addEventListener('input',()=>{time=Number(seek.value);previous=null;if(time>=length)playing=false;alignAudio();draw();sync();schedule();});
  chapters.forEach((button,i)=>button.addEventListener('click',()=>{time=sceneStarts[i];previous=null;alignAudio();draw();}));
  mute.addEventListener('click',()=>{
    narration.muted=!narration.muted;
    mute.textContent=narration.muted?'Unmute':'Mute';
    mute.setAttribute('aria-pressed',String(narration.muted));
    mute.setAttribute('aria-label',narration.muted?'Unmute English narration':'Mute English narration');
  });
  narration.addEventListener('loadedmetadata',alignAudio);
  narration.addEventListener('playing',()=>{audioStatus.textContent='English AI narration';});
  narration.addEventListener('ended',()=>{time=length;playing=false;previous=null;draw();sync();});
  narration.addEventListener('error',()=>{
    useAudio=false;mute.disabled=true;
    audioStatus.textContent='Narration unavailable. You can still play the animation and read the captions.';
    schedule();
  });
  document.addEventListener('visibilitychange',()=>{previous=null;schedule();});
  reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;narration.pause();sync();}draw();});
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;previous=null;schedule();},{threshold:.25}).observe(host);
  }else{inView=true;}
  draw();sync();
})();
