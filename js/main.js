/* ====================================
   IK-PRO MAIN JS
==================================== */

/* ==========================
   HAMBURGER MENU
========================== */

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

/* ==========================
   CLOSE MENU WHEN CLICK LINK
========================== */

document.querySelectorAll(".nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

/* ==========================
   NAVBAR SCROLL EFFECT
========================== */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

  if(window.scrollY > 50){

    navbar.style.boxShadow =
    "0 10px 30px rgba(0,0,0,.08)";

  }else{

    navbar.style.boxShadow = "none";

  }

});

/* ==========================
   COUNTER ANIMATION
========================== */

const counters =
document.querySelectorAll(".counter");

const counterObserver =
new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const counter = entry.target;

const target =
+counter.getAttribute("data-target");

let current = 0;

const increment =
target / 100;

const updateCounter = ()=>{

if(current < target){

current += increment;

counter.innerText =
Math.floor(current).toLocaleString();

requestAnimationFrame(updateCounter);

}else{

counter.innerText =
target.toLocaleString();

}

};

updateCounter();

counterObserver.unobserve(counter);

}

});

},{
threshold:0.5
});

counters.forEach(counter=>{
counterObserver.observe(counter);
});

/* ==========================
   FAQ ACCORDION
========================== */

const faqItems =
document.querySelectorAll(".faq-item");

faqItems.forEach(item=>{

const question =
item.querySelector(".faq-question");

question.addEventListener("click",()=>{

faqItems.forEach(faq=>{

if(faq !== item){
faq.classList.remove("active");
}

});

item.classList.toggle("active");

});

});

/* ==========================
   SWIPER TESTIMONIAL
========================== */

new Swiper(".testimonialSwiper", {

loop:true,

spaceBetween:30,

autoplay:{
delay:3500,
disableOnInteraction:false
},

pagination:{
el:".swiper-pagination",
clickable:true
},

breakpoints:{

0:{
slidesPerView:1
},

768:{
slidesPerView:2
},

1024:{
slidesPerView:3
}

}

});

/* ==========================
   AOS INIT
========================== */

AOS.init({

duration:1000,

once:true,

offset:100,

easing:"ease-in-out"

});

/* ==========================
   SMOOTH REVEAL
========================== */

const revealElements =
document.querySelectorAll(
".feature-card, .template-card, .price-card, .stat-card"
);

const revealObserver =
new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity = "1";
entry.target.style.transform =
"translateY(0)";

}

});

},{
threshold:0.1
});

revealElements.forEach(el=>{

el.style.opacity = "0";

el.style.transform =
"translateY(40px)";

el.style.transition =
".7s ease";

revealObserver.observe(el);

});

/* ==========================
   TEMPLATE PREVIEW BUTTON
========================== */

const templateButtons =
document.querySelectorAll(
".template-card button"
);

templateButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

alert(
"Fitur preview template akan dihubungkan ke halaman demo template."
);

});

});

/* ==========================
   CTA BUTTON EFFECT
========================== */

const buttons =
document.querySelectorAll(
".btn-primary"
);

buttons.forEach(button=>{

button.addEventListener("mouseenter",()=>{

button.style.transform =
"translateY(-3px)";

});

button.addEventListener("mouseleave",()=>{

button.style.transform =
"translateY(0px)";

});

});

/* ==========================
   LOADING EFFECT
========================== */

window.addEventListener("load",()=>{

document.body.classList.add("loaded");

});

/* ==========================
   SCROLL TO TOP BUTTON
========================== */

const scrollBtn =
document.createElement("button");

scrollBtn.innerHTML =
'<i class="fas fa-arrow-up"></i>';

scrollBtn.className =
"scroll-top-btn";

document.body.appendChild(scrollBtn);

scrollBtn.style.position = "fixed";
scrollBtn.style.right = "20px";
scrollBtn.style.bottom = "20px";
scrollBtn.style.width = "50px";
scrollBtn.style.height = "50px";
scrollBtn.style.border = "none";
scrollBtn.style.borderRadius = "50%";
scrollBtn.style.cursor = "pointer";
scrollBtn.style.background = "#c9a86a";
scrollBtn.style.color = "#fff";
scrollBtn.style.display = "none";
scrollBtn.style.zIndex = "999";

window.addEventListener("scroll",()=>{

if(window.scrollY > 500){

scrollBtn.style.display = "block";

}else{

scrollBtn.style.display = "none";

}

});

scrollBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

/* ==========================
   END FILE
========================== */