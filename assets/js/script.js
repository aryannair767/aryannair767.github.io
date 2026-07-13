(function(){'use strict';
var reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initMobileSidebar(){
var toggle=document.getElementById('mobileToggle');
var sidebar=document.getElementById('sidebar');
var overlay=document.getElementById('sidebarOverlay');
if(!toggle||!sidebar)return;
toggle.addEventListener('click',function(){
sidebar.classList.toggle('open');
if(overlay)overlay.classList.toggle('active');
});
if(overlay){overlay.addEventListener('click',function(){
sidebar.classList.remove('open');overlay.classList.remove('active');
});}
document.querySelectorAll('.sidebar-link').forEach(function(link){
link.addEventListener('click',function(){
sidebar.classList.remove('open');
if(overlay)overlay.classList.remove('active');
});
});
document.addEventListener('keydown',function(e){
if(e.key==='Escape'&&sidebar.classList.contains('open')){
sidebar.classList.remove('open');
if(overlay)overlay.classList.remove('active');
}
});
}

function initScrollSpy(){
var links=document.querySelectorAll('.sidebar-link[data-nav-target]');
if(!links.length||!('IntersectionObserver' in window))return;
var sections=[];
links.forEach(function(link){
var section=document.getElementById(link.dataset.navTarget);
if(section)sections.push(section);
});
if(!sections.length)return;
var observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(!entry.isIntersecting)return;
links.forEach(function(link){
link.classList.toggle('active',link.dataset.navTarget===entry.target.id);
});
});
},{rootMargin:'-20% 0px -60% 0px',threshold:0});
sections.forEach(function(section){observer.observe(section);});
}

function initReveal(){
var items=document.querySelectorAll('.reveal');
if(!items.length||!('IntersectionObserver' in window))return;
document.documentElement.classList.add('js-ready');
var observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
});
},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
items.forEach(function(item){observer.observe(item);});
}

function highlightSql(text){
var escaped=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
escaped=escaped.replace(/\b(SELECT|FROM|WHERE)\b/g,'<span class="db-kw">$1</span>');
escaped=escaped.replace(/'([^']*)'/g,'<span class="db-str">\'$1\'</span>');
return escaped;
}

function initSqlTerminal(){
var queryEl=document.getElementById('sqlQuery');
var resultTable=document.getElementById('sqlResult');
var panel=document.querySelector('.db-panel');
if(!queryEl||!resultTable||!panel)return;
var codeEls=Array.prototype.slice.call(queryEl.querySelectorAll('.db-code'));
if(!codeEls.length)return;
var linesPlain=codeEls.map(function(el){return el.textContent;});
function showResult(){resultTable.classList.add('visible');}
codeEls.forEach(function(el){el.textContent='';});
var hasRun=false;
var observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting&&!hasRun){
hasRun=true;
observer.unobserve(entry.target);
if(reducedMotion){
codeEls.forEach(function(el,i){el.innerHTML=highlightSql(linesPlain[i]);});
showResult();return;
}
var lineIndex=0,charIndex=0;
var cursor=document.createElement('span');
cursor.className='db-cursor';
function typeStep(){
if(lineIndex>=codeEls.length){cursor.remove();setTimeout(showResult,200);return;}
var currentEl=codeEls[lineIndex];
var fullLine=linesPlain[lineIndex];
if(charIndex<=fullLine.length){
currentEl.textContent=fullLine.slice(0,charIndex);
currentEl.appendChild(cursor);
charIndex++;setTimeout(typeStep,22);
}else{
currentEl.innerHTML=highlightSql(fullLine);
lineIndex++;charIndex=0;setTimeout(typeStep,120);
}
}
setTimeout(typeStep,450);
}
});
},{threshold:0.2});
observer.observe(panel);
}

function initCarousel(){
var images=['images/pic10.jpg','images/pic12.png','images/pic13.png'];
var img=document.getElementById('retailCarouselImg');
var prevBtn=document.getElementById('retailCarouselPrev');
var nextBtn=document.getElementById('retailCarouselNext');
var dotsWrap=document.getElementById('retailCarouselDots');
if(!img||!prevBtn||!nextBtn)return;
var index=0,dots=[];
if(dotsWrap){images.forEach(function(src,i){
var dot=document.createElement('button');
dot.type='button';dot.className='carousel-dot';
dot.setAttribute('aria-label','Show image '+(i+1)+' of '+images.length);
dot.addEventListener('click',function(){show(i);});
dotsWrap.appendChild(dot);dots.push(dot);
});}
function updateControls(){
prevBtn.style.visibility=(index===0)?'hidden':'visible';
nextBtn.style.visibility=(index===images.length-1)?'hidden':'visible';
dots.forEach(function(dot,i){dot.classList.toggle('active',i===index);});
}
function show(i){
index=Math.max(0,Math.min(images.length-1,i));
img.src=images[index];updateControls();
}
nextBtn.addEventListener('click',function(e){e.preventDefault();show(index+1);});
prevBtn.addEventListener('click',function(e){e.preventDefault();show(index-1);});
updateControls();
}

function initContactForm(){
var form=document.getElementById('contactForm');
var status=document.getElementById('formStatus');
if(!form)return;
var submitBtn=form.querySelector('button[type="submit"]');
form.addEventListener('submit',function(e){
e.preventDefault();
status.style.color='var(--muted)';status.textContent='Sending...';
if(submitBtn)submitBtn.disabled=true;
fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
.then(function(res){return res.json();})
.then(function(json){
if(json.success){
status.style.color='var(--accent)';
status.textContent="Message sent — Thanks! I'll get back to you soon.";
form.reset();
}else{
status.style.color='#c0392b';
status.textContent='Something went wrong. Please email me directly instead.';
}
}).catch(function(){
status.style.color='#c0392b';
status.textContent='Network error — please email me directly instead.';
}).finally(function(){if(submitBtn)submitBtn.disabled=false;});
});
}
function initLightbox(){
var lightbox=document.getElementById('lightbox');
var lightboxImg=document.getElementById('lightboxImg');
var prevBtn=document.getElementById('lightboxPrev');
var nextBtn=document.getElementById('lightboxNext');
var gallery=['images/pic10.jpg','images/pic12.png','images/pic13.png','images/pic11.png'];
var currentIndex=0;
if(!lightbox||!lightboxImg)return;

document.querySelectorAll('.lightbox-trigger').forEach(function(el){
el.style.cursor='zoom-in';
el.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var src=el.getAttribute('src')||'';
var idx=gallery.findIndex(function(img){return src.indexOf(img)!==-1;});
currentIndex=(idx===-1)?0:idx;
showLightbox();
});
});

function showLightbox(){
lightbox.classList.add('visible');
lightboxImg.src=gallery[currentIndex];
if(prevBtn)prevBtn.style.visibility=(currentIndex===0)?'hidden':'visible';
if(nextBtn)nextBtn.style.visibility=(currentIndex===gallery.length-1)?'hidden':'visible';
}

if(prevBtn){
prevBtn.addEventListener('click',function(e){
e.stopPropagation();
if(currentIndex>0){currentIndex--;showLightbox();}
});
}
if(nextBtn){
nextBtn.addEventListener('click',function(e){
e.stopPropagation();
if(currentIndex<gallery.length-1){currentIndex++;showLightbox();}
});
}
lightbox.addEventListener('click',function(e){
if(e.target===lightbox){lightbox.classList.remove('visible');}
});
}
function initFooterYear(){
var yearEl=document.getElementById('currentYear');
if(yearEl){yearEl.textContent=new Date().getFullYear();}
}

document.addEventListener('DOMContentLoaded',function(){
initMobileSidebar();initScrollSpy();initReveal();
initSqlTerminal();initCarousel();initContactForm();initLightbox();
initFooterYear();
});
})();