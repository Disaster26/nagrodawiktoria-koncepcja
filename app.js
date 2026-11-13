(function(){
  var burger=document.getElementById('burger'),menu=document.getElementById('menu');
  function zamknij(){menu.classList.remove('otw');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Otwórz menu');}
  burger.addEventListener('click',function(){
    var o=menu.classList.toggle('otw');
    burger.setAttribute('aria-expanded',o?'true':'false');
    burger.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');
  });
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',zamknij);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij();});

  // aktywna pozycja menu
  var linki=[].slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sekcje=linki.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);
  function akt(){
    var y=window.scrollY+window.innerHeight*0.35,cur=null;
    sekcje.forEach(function(s){if(s.offsetTop<=y)cur=s.id;});
    if(!cur)cur='filary';
    linki.forEach(function(a){a.classList.toggle('akt',a.getAttribute('href')==='#'+cur);});
  }
  window.addEventListener('scroll',akt,{passive:true});akt();

  // dolny pasek po minieciu przycisku w hero
  var mob=document.getElementById('mob'),cta=document.querySelector('.hero .btn');
  if('IntersectionObserver' in window&&cta){
    new IntersectionObserver(function(en){
      var e=en[0];mob.classList.toggle('widac',!e.isIntersecting&&e.boundingClientRect.top<0);
    }).observe(cta);
  }

  // karuzele: palec, mysz, strzalki, licznik
  document.querySelectorAll('[data-karuzela]').forEach(function(k){
    var tor=k.querySelector('.tor'),el=[].slice.call(tor.children),licz=k.querySelector('.kar-licz');
    function krok(){return el[0].getBoundingClientRect().width+parseFloat(getComputedStyle(tor).columnGap||20);}
    function idx(){return Math.min(el.length-1,Math.round(tor.scrollLeft/krok()));}
    function odswiez(){licz.textContent=(idx()+1)+' / '+el.length;}
    k.querySelector('.kar-prev').addEventListener('click',function(){tor.scrollBy({left:-krok(),behavior:'smooth'});});
    k.querySelector('.kar-next').addEventListener('click',function(){tor.scrollBy({left:krok(),behavior:'smooth'});});
    tor.addEventListener('scroll',odswiez,{passive:true});
    tor.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){tor.scrollBy({left:krok(),behavior:'smooth'});e.preventDefault();}
      if(e.key==='ArrowLeft'){tor.scrollBy({left:-krok(),behavior:'smooth'});e.preventDefault();}
    });
    var start=null,sl=0,ruch=false;
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;start=e.clientX;sl=tor.scrollLeft;ruch=false;tor.classList.add('ciag');tor.setPointerCapture(e.pointerId);});
    tor.addEventListener('pointermove',function(e){if(start===null)return;var dx=e.clientX-start;if(Math.abs(dx)>4)ruch=true;tor.scrollLeft=sl-dx;});
    function koniec(){if(start===null)return;start=null;tor.classList.remove('ciag');var i=idx();tor.scrollTo({left:i*krok(),behavior:'smooth'});}
    tor.addEventListener('pointerup',koniec);tor.addEventListener('pointercancel',koniec);
    tor.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation();ruch=false;}},true);
    odswiez();
  });

  // formularz pokazowy
  var f=document.getElementById('form');
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.checkValidity()){f.reportValidity();return;}
    document.getElementById('form-ok').hidden=false;f.reset();
  });
})();
(function(){var d=document.getElementById('lista-laur');if(d&&window.matchMedia('(min-width:761px)').matches)d.open=true;})();
// filary: podswietlenie pociagniecia pedzla w duzej postaci
(function(){
  var duza=document.querySelector('.duza-postac'),fil=[].slice.call(document.querySelectorAll('.filar'));
  if(!duza||!fil.length)return;
  function ust(){
    var mid=window.innerHeight*0.5,akt=1;
    fil.forEach(function(f){if(f.getBoundingClientRect().top<mid)akt=+f.dataset.filar;});
    duza.setAttribute('data-akt',akt);
    fil.forEach(function(f){f.classList.toggle('teraz',+f.dataset.filar===akt);});
  }
  window.addEventListener('scroll',ust,{passive:true});ust();
})();
