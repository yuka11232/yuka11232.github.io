// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// Mobile menu toggle
const menu = document.querySelector("#mobile-menu");


menu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menu.classList.toggle("active");
});



menu.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menu.classList.toggle('is-active');
});



const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});


