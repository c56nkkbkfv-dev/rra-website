
const navToggle=document.getElementById('navToggle');const headerEl=document.querySelector('header');
if(navToggle&&headerEl){navToggle.addEventListener('click',()=>headerEl.classList.toggle('nav-open'));}
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>headerEl&&headerEl.classList.remove('nav-open')));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

// mobile polish menu close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const header = document.querySelector("header");
    if (header) header.classList.remove("nav-open");
  }
});
document.addEventListener("click", (event) => {
  const header = document.querySelector("header");
  const nav = document.querySelector(".nav");
  if (!header || !nav) return;
  if (header.classList.contains("nav-open") && !nav.contains(event.target)) {
    header.classList.remove("nav-open");
  }
});
