/* Mitsy Beauty — scroll experience (GSAP + ScrollTrigger + Lenis) */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktopMq = window.matchMedia("(min-width: 761px)");

  /* --- nav + progress (works with or without GSAP) --- */
  var nav = document.getElementById("nav");
  var bar = document.querySelector(".progress__bar");
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- card tilt (pointer devices, motion allowed) --- */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      var inner = card.querySelector(".card__inner");
      if (!inner) return;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = "rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { inner.style.transform = ""; });
    });
  }

  /* Phones and reduced-motion: stacked, fully visible sections. No pins. */
  if (reduce || !desktopMq.matches || !window.gsap || !window.ScrollTrigger) return;
  if (!document.querySelector(".hero__pin")) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var mm = gsap.matchMedia();
  mm.add("(min-width: 761px)", function () {
    root.classList.add("motion");

    if (window.Lenis) {
      var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on("scroll", function () { ScrollTrigger.update(); onScroll(); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (!id || id.length < 2) return;
          var el = document.querySelector(id);
          if (!el) return;
          e.preventDefault();
          lenis.scrollTo(el, { offset: 0 });
        });
      });
    }

    /* 1 HERO — content is already on screen; a short pin just scales the cutout */
    var cut = document.querySelector(".hero__cutout-inner");
    var hero = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".hero__pin", start: "top top", end: "+=70%", scrub: 0.6, pin: true, invalidateOnRefresh: true }
    });
    if (cut) hero.fromTo(cut, { scale: 1 }, { scale: 1.1, duration: 1 }, 0);
    hero.to(".hero__title", { opacity: 0.22, duration: 0.7 }, 0);

    /* 2 SHADES — heading and bottles are visible as the section enters.
       A shorter pin focuses each shade; no fade-from-empty intro. */
    var bottles = gsap.utils.toArray(".shades__bottle");
    var infos = gsap.utils.toArray(".shade-info");
    var bgs = gsap.utils.toArray(".shades__bg");
    var shadesSec = document.querySelector(".shades");
    gsap.set(infos, { yPercent: -50, autoAlpha: 0 });
    if (infos[0]) gsap.set(infos[0], { autoAlpha: 1, y: 0 });
    var sh = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: ".shades__pin", start: "top top", end: "+=220%", scrub: 0.8, pin: true,
        onUpdate: function () {
          if (!shadesSec) return;
          var on = bgs.some(function (bg) { return parseFloat(window.getComputedStyle(bg).opacity) > 0.4; });
          shadesSec.classList.toggle("is-tinted", on);
        }
      }
    });
    bottles.forEach(function (b, i) {
      var at = 0.15 + i * 0.85;
      var others = bottles.filter(function (o) { return o !== b; });
      sh.to(bgs[i], { opacity: 1, duration: 0.4 }, at)
        .to(b, { y: -20, scale: 1.08, rotation: i % 2 ? 2 : -2, duration: 0.4 }, at)
        .to(others, { opacity: 0.45, scale: 0.92, y: 0, rotation: 0, duration: 0.4 }, at)
        .to(infos[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.05);
      if (i > 0) sh.to(infos[i - 1], { autoAlpha: 0, y: -20, duration: 0.25 }, at);
    });
    var end = 0.15 + bottles.length * 0.85;
    sh.to(bgs, { opacity: 0, duration: 0.35 }, end)
      .to(infos[infos.length - 1], { autoAlpha: 0, y: -20, duration: 0.25 }, end)
      .to(bottles, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.35 }, end);

    /* 3 THE SWIPE — copy and bottle are visible immediately; wand draws on a short pin */
    var path = document.querySelector(".swipe__path"), gloss = document.querySelector(".swipe__gloss");
    if (path && gloss) {
      var len = path.getTotalLength(), glen = gloss.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(gloss, { strokeDasharray: glen, strokeDashoffset: glen });
      var wand = document.querySelector(".swipe__wand"), pin = document.querySelector(".swipe__pin");
      gsap.set(wand, { xPercent: -50, x: 0, y: 0, rotation: -90, top: "-58%" });
      function home() {
        var r = wand.getBoundingClientRect(), p = pin.getBoundingClientRect();
        var gx = Number(gsap.getProperty(wand, "x")) || 0, gy = Number(gsap.getProperty(wand, "y")) || 0;
        return { x: r.left + r.width / 2 - p.left - gx, y: r.top + r.height / 2 - p.top - gy };
      }
      function to(fx, fy) {
        return {
          x: function () { return pin.offsetWidth * fx - home().x; },
          y: function () { return pin.offsetHeight * fy - home().y; }
        };
      }
      var lift = [0.40, 0.36];
      var path1 = [[0.46, 0.74], [0.66, 0.73], [0.90, 0.62]];
      var sw = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".swipe__pin", start: "top top", end: "+=130%", scrub: 0.6, pin: true, invalidateOnRefresh: true }
      });
      sw.to(wand, Object.assign({ rotation: -78, duration: 0.3, ease: "power2.inOut" }, to(lift[0], lift[1])), 0)
        .to(wand, Object.assign({ rotation: -38, duration: 0.22, ease: "power2.inOut" }, to(path1[0][0], path1[0][1])), 0.3)
        .to(path, { strokeDashoffset: len * 0.56, duration: 0.22, ease: "power1.in" }, 0.3)
        .to(wand, Object.assign({ rotation: -30, duration: 0.28 }, to(path1[1][0], path1[1][1])), 0.52)
        .to(path, { strokeDashoffset: len * 0.3, duration: 0.28 }, 0.52)
        .to(wand, Object.assign({ rotation: -24, duration: 0.26 }, to(path1[2][0], path1[2][1])), 0.8)
        .to(path, { strokeDashoffset: 0, duration: 0.3 }, 0.8)
        .to(gloss, { strokeDashoffset: 0, duration: 0.7 }, 0.4)
        .to(wand, { opacity: 0, duration: 0.12 }, 1.05);
    }

    /* 4 REVEAL — words are already readable; a short pin finishes the light-up */
    if (document.querySelector(".reveal__text .w")) {
      gsap.fromTo(".reveal__text .w", { opacity: 0.7 }, {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: ".reveal", start: "top 70%", end: "+=45%", scrub: 0.4 }
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });

    return function () {
      root.classList.remove("motion");
      if (window.__lenis && window.__lenis.destroy) window.__lenis.destroy();
      window.__lenis = null;
    };
  });
})();
