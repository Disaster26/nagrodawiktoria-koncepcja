(function(){
  var burger=document.getElementById('burger'),menu=document.getElementById('menu');
  function zamknij(){menu.classList.remove('otw');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Otwórz menu');}
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var o=menu.classList.toggle('otw');
      burger.setAttribute('aria-expanded',o?'true':'false');
      burger.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');
    });
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',zamknij);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')zamknij();});
  }

  // aktywna pozycja menu (tylko strona glowna z kotwicami)
  if(menu&&document.body.dataset.strona==='glowna'){
    var linki=[].slice.call(menu.querySelectorAll('a[href^="#"]'));
    var wszystkie=[].slice.call(menu.querySelectorAll('a'));
    var sekcje=linki.map(function(a){return document.querySelector(a.getAttribute('href'));}).filter(Boolean);
    var akt=function(){
      var y=window.scrollY+window.innerHeight*0.35,cur=null;
      sekcje.forEach(function(s){if(s.offsetTop<=y)cur=s.id;});
      if(!cur)cur='filary';
      wszystkie.forEach(function(a){a.classList.toggle('akt',a.getAttribute('href')==='#'+cur);});
    };
    window.addEventListener('scroll',akt,{passive:true});akt();
  }

  // dolny pasek na telefonie
  var mob=document.getElementById('mob'),cta=document.querySelector('.hero .btn');
  if(mob){
    if('IntersectionObserver' in window&&cta){
      new IntersectionObserver(function(en){
        var e=en[0];mob.classList.toggle('widac',!e.isIntersecting&&e.boundingClientRect.top<0);
      }).observe(cta);
    }else{
      var pokaz=function(){mob.classList.toggle('widac',window.scrollY>320);};
      window.addEventListener('scroll',pokaz,{passive:true});pokaz();
    }
  }

  // karuzele: palec, mysz, strzalki, licznik (bez petli)
  document.querySelectorAll('[data-karuzela]').forEach(function(k){
    var tor=k.querySelector('.tor'),el=[].slice.call(tor.children),licz=k.querySelector('.kar-licz');
    var prev=k.querySelector('.kar-prev'),next=k.querySelector('.kar-next');
    function krok(){return el[0].getBoundingClientRect().width+parseFloat(getComputedStyle(tor).columnGap||20);}
    function idx(){return Math.min(el.length-1,Math.round(tor.scrollLeft/krok()));}
    function odswiez(){
      if(licz)licz.textContent=(idx()+1)+' / '+el.length;
      var max=tor.scrollWidth-tor.clientWidth-2;
      if(prev)prev.disabled=tor.scrollLeft<=2;
      if(next)next.disabled=tor.scrollLeft>=max;
    }
    if(prev)prev.addEventListener('click',function(){tor.scrollBy({left:-krok(),behavior:'smooth'});});
    if(next)next.addEventListener('click',function(){tor.scrollBy({left:krok(),behavior:'smooth'});});
    tor.addEventListener('scroll',odswiez,{passive:true});
    window.addEventListener('resize',odswiez);
    tor.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){tor.scrollBy({left:krok(),behavior:'smooth'});e.preventDefault();}
      if(e.key==='ArrowLeft'){tor.scrollBy({left:-krok(),behavior:'smooth'});e.preventDefault();}
    });
    tor.addEventListener('dragstart',function(e){e.preventDefault();});
    var start=null,sl=0,ruch=false;
    tor.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0)return;
      if(e.target.closest('iframe'))return;
      start=e.clientX;sl=tor.scrollLeft;ruch=false;
    });
    tor.addEventListener('pointermove',function(e){
      if(start===null)return;var dx=e.clientX-start;
      if(!ruch&&Math.abs(dx)>6){ruch=true;tor.classList.add('ciag');try{tor.setPointerCapture(e.pointerId);}catch(_){}}
      if(ruch)tor.scrollLeft=sl-dx;
    });
    function koniec(){
      if(start===null)return;start=null;
      if(ruch){tor.classList.remove('ciag');var i=idx();tor.scrollTo({left:i*krok(),behavior:'smooth'});}
    }
    tor.addEventListener('pointerup',koniec);tor.addEventListener('pointercancel',koniec);
    tor.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation();ruch=false;}},true);
    odswiez();
  });

  // filmy: lekki podglad, YouTube (nocookie) dopiero po kliknieciu
  document.querySelectorAll('.film-play').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.dataset.yt,ekran=b.parentNode,f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';
      f.title=b.getAttribute('aria-label')||'Film';
      f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
      ekran.replaceChild(f,b);
    });
  });

  // lightbox: wszystkie zdjecia z data-lb, grupowane w obrebie [data-lb-grupa]
  var lbLinki=[].slice.call(document.querySelectorAll('a[data-lb]'));
  if(lbLinki.length){
    var lb=document.createElement('div');
    lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Powiększone zdjęcie');
    lb.innerHTML='<span class="lb-licz"></span><figure><img alt=""><figcaption></figcaption></figure>'+
      '<button class="lb-x" type="button" aria-label="Zamknij">&times;</button>'+
      '<button class="lb-p" type="button" aria-label="Poprzednie zdjęcie">&#8592;</button>'+
      '<button class="lb-n" type="button" aria-label="Następne zdjęcie">&#8594;</button>';
    document.body.appendChild(lb);
    var lbImg=lb.querySelector('img'),lbCap=lb.querySelector('figcaption'),lbLicz=lb.querySelector('.lb-licz');
    var bP=lb.querySelector('.lb-p'),bN=lb.querySelector('.lb-n'),bX=lb.querySelector('.lb-x');
    var grupa=[],nr=0,powrot=null;
    function pokaz(i){
      nr=i;var a=grupa[nr],img=a.querySelector('img');
      lbImg.src=a.getAttribute('href');lbImg.alt=img?img.alt:'';
      lbCap.textContent=a.dataset.opis||(img?img.alt:'');
      lbLicz.textContent=grupa.length>1?(nr+1)+' / '+grupa.length:'';
      bP.hidden=nr===0;bN.hidden=nr===grupa.length-1;
      if(nr<grupa.length-1){var pre=new Image();pre.src=grupa[nr+1].getAttribute('href');}
    }
    function otworz(a){
      var g=a.closest('[data-lb-grupa]');
      grupa=g?[].slice.call(g.querySelectorAll('a[data-lb]')):[a];
      powrot=a;pokaz(grupa.indexOf(a));
      lb.classList.add('otw');document.body.classList.add('lb-blok');bX.focus();
    }
    function zamknijLb(){lb.classList.remove('otw');document.body.classList.remove('lb-blok');lbImg.removeAttribute('src');if(powrot)powrot.focus({preventScroll:true});}
    lbLinki.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();otworz(a);});});
    bX.addEventListener('click',zamknijLb);
    bP.addEventListener('click',function(){if(nr>0)pokaz(nr-1);});
    bN.addEventListener('click',function(){if(nr<grupa.length-1)pokaz(nr+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)zamknijLb();});
    document.addEventListener('keydown',function(e){
      if(!lb.classList.contains('otw'))return;
      if(e.key==='Escape')zamknijLb();
      if(e.key==='ArrowRight'&&nr<grupa.length-1)pokaz(nr+1);
      if(e.key==='ArrowLeft'&&nr>0)pokaz(nr-1);
      if(e.key==='Tab'){var f=[bX,bP,bN].filter(function(b){return !b.hidden;});var i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}
    });
    var sx=null;
    lb.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')sx=e.clientX;});
    lb.addEventListener('pointerup',function(e){
      if(sx===null)return;var dx=e.clientX-sx;sx=null;
      if(dx<-50&&nr<grupa.length-1)pokaz(nr+1);
      if(dx>50&&nr>0)pokaz(nr-1);
    });
  }

  // formularz pokazowy
  var f=document.getElementById('form');
  if(f)f.addEventListener('submit',function(e){
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

// 16.11: rok, edycja i terminy liczone automatycznie
// nabor co roku 4.01-31.07, materialy do 4.09; data Gali tylko gdy podana przez Fundacje, inaczej "jesienia <rok>"
(function(){
  var GALA={2027:'30 października 2027'};
  var d=new Date(),Y=d.getFullYear();
  var Yn=d.getMonth()<=6?Y:Y+1,nr=Yn-1997; // XXIX edycja = 2026; po 31 lipca pokazujemy kolejna edycje
  function rzym(n){var w=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']],s='';w.forEach(function(p){while(n>=p[0]){s+=p[1];n-=p[0];}});return s;}
  function ust(sel,v){document.querySelectorAll(sel).forEach(function(e){e.textContent=v;});}
  ust('[data-rok-biezacy]',Y);ust('[data-rok-nabor]',Yn);ust('[data-edycja-nabor]',rzym(nr));
  ust('[data-nabor-zakres]','4 stycznia do 31 lipca '+Yn);
  ust('[data-materialy]','4 września '+Yn);ust('[data-lipiec]','31 lipca '+Yn);
  ust('[data-gala]',GALA[Yn]||('jesienią '+Yn));
  document.querySelectorAll('[data-jubileusz]').forEach(function(e){e.hidden=nr%5!==0;});
})();
// 17.11: lista laureatow 2026 zwinięta na telefonie do 8 pozycji
(function(){
  var l=document.querySelector('[data-l26]'),b=document.querySelector('[data-l26-wiecej]');
  if(!l||!b||!window.matchMedia('(max-width:760px)').matches)return;
  l.classList.add('zwin');b.hidden=false;
  b.addEventListener('click',function(){l.classList.remove('zwin');b.remove();});
})();
