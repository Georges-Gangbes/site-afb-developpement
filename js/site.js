/* AFB-Dev : interactions légères, sans dépendance */
(function () {
  "use strict";

  /* --- Menu mobile --- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var ouvert = menu.classList.toggle("est-ouvert");
      toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("est-ouvert");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Révélations au défilement --- */
  var cibles = document.querySelectorAll(".revele");
  if (cibles.length && "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("est-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    cibles.forEach(function (c) { io.observe(c); });
  } else {
    cibles.forEach(function (c) { c.classList.add("est-visible"); });
  }

  /* --- Année courante dans le pied de page --- */
  var y = document.querySelector("[data-annee]");
  if (y) { y.textContent = new Date().getFullYear(); }

  var reduitMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointeurFin = window.matchMedia("(pointer: fine)").matches;

  /* --- Barre de progression + tassement de l'en-tête au défilement --- */
  var barre = document.querySelector(".progres");
  var entete = document.querySelector(".site-header");
  function surDefilement() {
    if (entete) entete.classList.toggle("site-header--tasse", window.scrollY > 24);
    if (barre) {
      var hauteur = document.documentElement.scrollHeight - window.innerHeight;
      var pct = hauteur > 0 ? (window.scrollY / hauteur) * 100 : 0;
      barre.style.width = pct + "%";
    }
  }
  if (barre || entete) {
    window.addEventListener("scroll", surDefilement, { passive: true });
    surDefilement();
  }

  /* --- Lueur du héro qui suit le curseur (discret) --- */
  var hero = document.querySelector(".hero");
  var lueur = document.querySelector(".hero__lueur");
  if (hero && lueur && pointeurFin && !reduitMouvement) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width - 0.5) * 40;
      var py = ((e.clientY - r.top) / r.height - 0.5) * 40;
      lueur.style.setProperty("--px", px + "px");
      lueur.style.setProperty("--py", py + "px");
    });
    hero.addEventListener("mouseleave", function () {
      lueur.style.setProperty("--px", "0px");
      lueur.style.setProperty("--py", "0px");
    });
  }

  /* --- Inclinaison légère + projecteur sur les cartes de domaine --- */
  if (pointeurFin && !reduitMouvement) {
    document.querySelectorAll(".domaine").forEach(function (carte) {
      carte.addEventListener("mousemove", function (e) {
        var r = carte.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        var rx = -((e.clientY - r.top) / r.height - 0.5) * 6;
        carte.style.setProperty("--mx", mx + "%");
        carte.style.setProperty("--my", my + "%");
        carte.style.setProperty("--rx", rx + "deg");
        carte.style.setProperty("--ry", ry + "deg");
      });
      carte.addEventListener("mouseleave", function () {
        carte.style.setProperty("--rx", "0deg");
        carte.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* --- Chiffres animés au défilement --- */
  var chiffres = document.querySelectorAll(".nombre[data-vers]");
  function animerChiffre(el) {
    var cible = parseFloat(el.getAttribute("data-vers"), 10);
    if (reduitMouvement) { el.textContent = cible; return; }
    var debut = null;
    var duree = 1300;
    function etape(t) {
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(cible * ease);
      if (p < 1) window.requestAnimationFrame(etape);
      else el.textContent = cible;
    }
    window.requestAnimationFrame(etape);
  }
  if (chiffres.length && "IntersectionObserver" in window) {
    var ioChiffres = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animerChiffre(e.target); ioChiffres.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    chiffres.forEach(function (c) { ioChiffres.observe(c); });
  } else {
    chiffres.forEach(function (c) { c.textContent = c.getAttribute("data-vers"); });
  }
})();
