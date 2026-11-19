/* Mitsy Beauty — scroll experience (GSAP + ScrollTrigger + Lenis) */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- sign-up: visual only, posts nowhere --- */
  var form = document.getElementById("signup");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = form.querySelector("input"), msg = document.getElementById("signup-msg");
    if (!input.value || !input.checkValidity()) {
      msg.textContent = "Enter an email like name@example.com.";
      input.setAttribute("aria-invalid", "true"); input.focus(); return;
    }
    input.removeAttribute("aria-invalid");
    msg.textContent = "Thanks! This is a preview, so sign-up isn't connected yet.";
  });

  /* --- nav + progress (works with or without GSAP) --- */
  var nav = document.getElementById("nav");
  var bar = document.querySelector(".progress__bar");
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 24);
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- card tilt (pointer devices, motion allowed) --- */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      var inner = card.querySelector(".card__inner");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = "rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { inner.style.transform = ""; });
    });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) return; // static fallback
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("motion");

  /* --- Lenis smooth scroll synced to ScrollTrigger --- */
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", function () { ScrollTrigger.update(); onScroll(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: 0 });
      });
    });
  }

  var mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 761px)", mobile: "(max-width: 760px)" }, function (ctx) {
    var mobile = ctx.conditions.mobile;

    /* 1 HERO — card grows to full-bleed, logo lifts away, tagline slides in */
    var card = document.querySelector(".hero__card");
    gsap.set(".hero__tag", { opacity: 0, y: 80 });
    gsap.set(".hero__tag span", { xPercent: -12 });
    var hero = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".hero__pin", start: "top top", end: "+=170%", scrub: 0.6, pin: true,
        onUpdate: function (s) { card.classList.toggle("is-scrim", s.progress > 0.55); } }
    });
    hero
      .to(".hero__cue", { opacity: 0, duration: 0.1 }, 0)
      .to(".hero__brand", { scale: mobile ? 1.15 : 1.35, opacity: 0, y: mobile ? -40 : -60, duration: 0.5 }, 0)
      .to(".hero__grid", { opacity: 0, duration: 0.4 }, 0)
      .to(card, { x: 0, y: 0, scale: 1, borderRadius: 0, boxShadow: "0 0 0 0 rgba(0,0,0,0)", duration: 0.7, ease: "power1.inOut" }, 0)
      .fromTo(".hero__img", { scale: 1.12 }, { scale: 1, duration: 0.7 }, 0)
      .to(".hero__tag", { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.6)
      .to(".hero__tag span", { xPercent: 0, stagger: 0.06, duration: 0.3, ease: "power2.out" }, 0.6)
      .to({}, { duration: 0.2 });

    /* 2 SHADES — bottles rise one by one, background shifts to each shade */
    var bottles = gsap.utils.toArray(".shades__bottle");
    var infos = gsap.utils.toArray(".shade-info");
    var bgs = gsap.utils.toArray(".shades__bg");
    if (!mobile) gsap.set(infos, { yPercent: -50 });
    gsap.set(bottles, { y: mobile ? 160 : 260, opacity: 0, rotation: function (i) { return [-7, 5, -4, 7][i]; } });
    var sh = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: ".shades__pin", start: "top top", end: "+=420%", scrub: 0.8, pin: true }
    });
    sh.from(".shades__head", { y: 40, opacity: 0, duration: 0.4 }, 0)
      .to(bottles, { y: 0, opacity: 1, rotation: 0, stagger: 0.18, duration: 0.6, ease: "power3.out" }, 0.1);
    bottles.forEach(function (b, i) {
      var at = 1.1 + i * 1.1;
      var others = bottles.filter(function (o) { return o !== b; });
      sh.to(bgs[i], { opacity: 1, duration: 0.5 }, at)
        .to(b, { y: mobile ? -18 : -46, scale: 1.12, rotation: i % 2 ? 3 : -3, duration: 0.5 }, at)
        .to(others, { opacity: 0.4, scale: 0.92, y: 0, rotation: 0, duration: 0.5 }, at)
        .fromTo(infos[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, at + 0.1);
      if (i > 0) sh.to(infos[i - 1], { autoAlpha: 0, y: -30, duration: 0.3 }, at);
      // parallax on the swatch card
      sh.fromTo(infos[i].querySelector(".shade-info__swatch"), { y: 50, rotation: -14 }, { y: 0, rotation: -8, duration: 0.8, ease: "none", immediateRender: false }, at);
    });
    var end = 1.1 + bottles.length * 1.1;
    sh.to(bgs, { opacity: 0, duration: 0.5 }, end)
      .to(infos[infos.length - 1], { autoAlpha: 0, y: -30, duration: 0.3 }, end)
      .to(bottles, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.5 }, end)
      .to({}, { duration: 0.3 });

    /* 3 THE SWIPE — wand comes out of the bottle, stroke draws across */
    var path = document.querySelector(".swipe__path"), gloss = document.querySelector(".swipe__gloss");
    var len = path.getTotalLength(), glen = gloss.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(gloss, { strokeDasharray: glen, strokeDashoffset: glen });
    var wand = document.querySelector(".swipe__wand"), pin = document.querySelector(".swipe__pin");
    gsap.set(wand, { xPercent: -50, x: 0, y: 0, rotation: -90, top: mobile ? "-46%" : "-58%" });
    // where the wand's centre sits at rest, relative to the pinned viewport
    function home() {
      var r = wand.getBoundingClientRect(), p = pin.getBoundingClientRect();
      var gx = Number(gsap.getProperty(wand, "x")) || 0, gy = Number(gsap.getProperty(wand, "y")) || 0;
      return { x: r.left + r.width / 2 - p.left - gx, y: r.top + r.height / 2 - p.top - gy, h: r.height };
    }
    function to(fx, fy) { return { x: function () { return innerWidth * fx - home().x; }, y: function () { return innerHeight * fy - home().y; } }; }
    var lift = mobile ? [0.64, 0.56] : [0.40, 0.36];
    var path1 = mobile ? [[0.52, 0.76], [0.74, 0.72], [0.98, 0.64]] : [[0.46, 0.74], [0.66, 0.73], [0.90, 0.62]];
    var sw = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".swipe__pin", start: "top top", end: "+=240%", scrub: 0.6, pin: true, invalidateOnRefresh: true }
    });
    sw.fromTo(".swipe__copy > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.3, ease: "power2.out" }, 0)
      .fromTo(".swipe__stage", { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0)
      .to(wand, Object.assign({ rotation: -78, duration: 0.35, ease: "power2.inOut" }, to(lift[0], lift[1])), 0.3)
      .to(wand, Object.assign({ rotation: -38, duration: 0.25, ease: "power2.inOut" }, to(path1[0][0], path1[0][1])), 0.65)
      .to(path, { strokeDashoffset: len * 0.56, duration: 0.25, ease: "power1.in" }, 0.65)
      .to(wand, Object.assign({ rotation: -30, duration: 0.35 }, to(path1[1][0], path1[1][1])), 0.9)
      .to(path, { strokeDashoffset: len * 0.3, duration: 0.35 }, 0.9)
      .to(wand, Object.assign({ rotation: -24, duration: 0.3 }, to(path1[2][0], path1[2][1])), 1.25)
      .to(path, { strokeDashoffset: 0, duration: 0.35 }, 1.25)
      .to(gloss, { strokeDashoffset: 0, duration: 0.9 }, 0.75)
      .to(wand, { opacity: 0, duration: 0.15 }, 1.45)
      .to({}, { duration: 0.25 });

    /* 4 REVEAL — words light up from faded to solid white */
    gsap.fromTo(".reveal__text .w", { opacity: 0.16 }, {
      opacity: 1, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: ".reveal", start: "top top", end: "+=110%", scrub: 0.5, pin: true }
    });

    /* 5 COLLECTION — cards float in on the grid */
    gsap.from(".card", { y: 80, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".collection__grid", start: "top 80%" } });
    gsap.from(".collection__head > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: ".collection", start: "top 75%" } });

    /* 6 CLOSING — image parallax + copy rise */
    gsap.fromTo(".closing__media img", { scale: 1.15 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom bottom", scrub: true } });
    gsap.from(".closing__copy > *", { y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: ".closing", start: "top 70%" } });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
