/* Mitsy Beauty — demo bag (localStorage only, nothing is sent anywhere) */
(function () {
  "use strict";
  var KEY = "mitsy-demo-cart";
  var root, overlay, drawer, linesEl, emptyEl, subEl, toastEl;
  var lastFocus = null;
  var justAddedId = null;

  function products() { return window.MITSY_PRODUCTS || []; }
  function cfg() { return window.MITSY || {}; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : { items: {} };
      if (!data || typeof data !== "object" || !data.items) return { items: {} };
      return data;
    } catch (e) { return { items: {} }; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function lines() {
    var data = load();
    var out = [];
    products().forEach(function (p) {
      var qty = parseInt(data.items[p.id], 10) || 0;
      if (qty > 0) out.push({ product: p, qty: qty, line: p.price * qty });
    });
    return out;
  }
  function count() {
    return lines().reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function subtotal() {
    return lines().reduce(function (n, l) { return n + l.line; }, 0);
  }

  function setQty(id, qty) {
    var data = load();
    qty = Math.max(0, Math.min(12, parseInt(qty, 10) || 0));
    if (qty <= 0) delete data.items[id];
    else data.items[id] = qty;
    save(data);
    render();
  }
  function add(id, qty) {
    var data = load();
    var next = (parseInt(data.items[id], 10) || 0) + (qty || 1);
    data.items[id] = Math.max(1, Math.min(12, next));
    justAddedId = id;
    save(data);
    render();
    clearTimeout(add.tid);
    add.tid = setTimeout(function () {
      justAddedId = null;
      if (!linesEl) return;
      var row = linesEl.querySelector(".cart-line.is-just-added");
      if (row) row.classList.remove("is-just-added");
    }, 2400);
  }
  function clear() {
    save({ items: {} });
    render();
  }

  function money(n) { return window.mitsyMoney ? window.mitsyMoney(n) : "$" + Number(n).toFixed(2); }

  function updateBadges() {
    var n = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n ? String(n) : "";
      el.hidden = n === 0;
    });
    document.querySelectorAll("[data-cart-toggle]").forEach(function (btn) {
      var label = n ? "Open bag, " + n + (n === 1 ? " item" : " items") : "Open bag, empty";
      btn.setAttribute("aria-label", label);
    });
  }

  function render() {
    updateBadges();
    if (!linesEl) return;
    var items = lines();
    emptyEl.hidden = items.length > 0;
    linesEl.hidden = items.length === 0;
    linesEl.innerHTML = items.map(function (l) {
      var p = l.product;
      var added = p.id === justAddedId ? " is-just-added" : "";
      return (
        '<li class="cart-line' + added + '" data-id="' + p.id + '">' +
          '<img class="cart-line__img" src="' + p.imagePng + '" alt="" width="' + p.imageWidth + '" height="' + p.imageHeight + '">' +
          '<div class="cart-line__meta">' +
            '<p class="cart-line__name">' + p.name + '</p>' +
            '<p class="cart-line__price">' + money(p.price) + ' <span class="sample-note">sample</span></p>' +
            '<div class="qty">' +
              '<button type="button" class="qty__btn" data-qty-delta="-1" aria-label="Fewer ' + p.name + '">−</button>' +
              '<span class="qty__n" aria-live="polite">' + l.qty + '</span>' +
              '<button type="button" class="qty__btn" data-qty-delta="1" aria-label="More ' + p.name + '">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-line__side">' +
            '<p class="cart-line__sum">' + money(l.line) + '</p>' +
            '<button type="button" class="cart-line__remove" data-remove>Remove</button>' +
          '</div>' +
        '</li>'
      );
    }).join("");
    if (subEl) subEl.textContent = money(subtotal());
    var checkout = drawer && drawer.querySelector("[data-cart-checkout]");
    if (checkout) {
      if (items.length === 0) {
        checkout.setAttribute("aria-disabled", "true");
        checkout.classList.add("is-disabled");
        checkout.tabIndex = -1;
      } else {
        checkout.removeAttribute("aria-disabled");
        checkout.classList.remove("is-disabled");
        checkout.tabIndex = 0;
      }
    }
    if (justAddedId && linesEl) {
      var row = linesEl.querySelector(".cart-line.is-just-added");
      if (row) revealLine(row);
    }
  }

  function revealLine(row) {
    if (!isOpen()) return;
    var gap = 12;
    var listRect = linesEl.getBoundingClientRect();
    if (listRect.height < 1) return;
    var rowRect = row.getBoundingClientRect();
    var viewTop = listRect.top + gap;
    var viewBottom = listRect.bottom - gap;
    if (rowRect.height >= viewBottom - viewTop) {
      linesEl.scrollTop += rowRect.top - listRect.top;
      return;
    }
    if (rowRect.top < viewTop) linesEl.scrollTop += rowRect.top - viewTop;
    else if (rowRect.bottom > viewBottom) linesEl.scrollTop += rowRect.bottom - viewBottom;
  }

  function isOpen() {
    return drawer && !drawer.hasAttribute("hidden");
  }

  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.removeAttribute("hidden");
    overlay.removeAttribute("hidden");
    overlay.classList.add("is-on");
    drawer.classList.add("is-open");
    document.body.classList.add("is-cart-open");
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    var closeBtn = drawer.querySelector("[data-cart-close]");
    if (closeBtn) closeBtn.focus();
  }
  function closeCart() {
    if (!drawer || !isOpen()) return;
    drawer.setAttribute("hidden", "");
    overlay.setAttribute("hidden", "");
    overlay.classList.remove("is-on");
    drawer.classList.remove("is-open");
    document.body.classList.remove("is-cart-open");
    if (toastEl) toastEl.classList.remove("is-on");
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toast(msg) {
    if (!toastEl) return;
    // Lives in the drawer header, in normal flow, so it can never sit on the footer.
    toastEl.textContent = "";
    toastEl.classList.add("is-on");
    toastEl.textContent = msg;
    clearTimeout(toast.tid);
    toast.tid = setTimeout(function () {
      if (toastEl) toastEl.classList.remove("is-on");
    }, 2400);
  }

  function inject() {
    if (document.getElementById("cart-drawer")) return;
    var wrap = document.createElement("div");
    wrap.className = "cart-root";
    wrap.innerHTML =
      '<div class="cart-overlay" data-cart-close hidden></div>' +
      '<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" hidden>' +
        '<header class="cart-drawer__head">' +
          '<div class="cart-drawer__heading">' +
            '<h2 id="cart-title" class="cart-drawer__title">Your bag</h2>' +
            '<p class="cart-added" data-cart-toast role="status" aria-live="polite"></p>' +
          '</div>' +
          '<button type="button" class="cart-drawer__close" data-cart-close aria-label="Close bag">' +
            '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</header>' +
        '<p class="demo-banner demo-banner--in">' + (cfg().demoNotice || "Demo checkout, no payment is taken") + '</p>' +
        '<p class="cart-empty" data-cart-empty>Your bag is empty.</p>' +
        '<ul class="cart-lines" data-cart-lines></ul>' +
        '<footer class="cart-drawer__foot">' +
          '<div class="cart-sub">' +
            '<span>Subtotal</span>' +
            '<strong data-cart-subtotal>$0.00</strong>' +
          '</div>' +
          '<p class="sample-note">Sample prices for this preview. Shipping is added at checkout.</p>' +
          '<a class="btn btn--solid" data-cart-checkout href="checkout.html">Checkout</a>' +
          '<button type="button" class="btn btn--ghost" data-cart-close>Continue shopping</button>' +
        '</footer>' +
      '</aside>';
    document.body.appendChild(wrap);
    overlay = wrap.querySelector(".cart-overlay");
    drawer = wrap.querySelector(".cart-drawer");
    linesEl = wrap.querySelector("[data-cart-lines]");
    emptyEl = wrap.querySelector("[data-cart-empty]");
    subEl = wrap.querySelector("[data-cart-subtotal]");
    toastEl = wrap.querySelector("[data-cart-toast]");
  }

  function onClick(e) {
    var add = e.target.closest("[data-add-to-bag]");
    if (add) {
      e.preventDefault();
      var id = add.getAttribute("data-add-to-bag");
      var p = window.mitsyProduct && window.mitsyProduct(id);
      if (!p) return;
      window.MitsyCart.add(id, 1);
      openCart();
      toast(p.name + " added to bag");
      return;
    }
    if (e.target.closest("[data-cart-toggle]")) {
      e.preventDefault();
      if (isOpen()) closeCart(); else openCart();
      return;
    }
    if (e.target.closest("[data-cart-close]")) {
      e.preventDefault();
      closeCart();
      return;
    }
    var checkout = e.target.closest("[data-cart-checkout]");
    if (checkout && checkout.classList.contains("is-disabled")) {
      e.preventDefault();
      return;
    }
    var line = e.target.closest(".cart-line");
    if (!line || !drawer || !drawer.contains(line)) return;
    var id = line.getAttribute("data-id");
    if (e.target.closest("[data-remove]")) {
      setQty(id, 0);
      return;
    }
    var deltaBtn = e.target.closest("[data-qty-delta]");
    if (deltaBtn) {
      var data = load();
      var next = (parseInt(data.items[id], 10) || 0) + parseInt(deltaBtn.getAttribute("data-qty-delta"), 10);
      setQty(id, next);
    }
  }

  function onKey(e) {
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      closeCart();
    }
    if (e.key === "Tab" && isOpen()) {
      var focusable = drawer.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      var list = [];
      focusable.forEach(function (el) { if (!el.hasAttribute("hidden") && !el.closest("[hidden]")) list.push(el); });
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function init() {
    if (!window.MITSY_PRODUCTS) return;
    inject();
    render();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
  }

  window.MitsyCart = {
    add: add,
    setQty: setQty,
    clear: clear,
    lines: lines,
    count: count,
    subtotal: subtotal,
    open: openCart,
    close: closeCart,
    render: render,
    load: load
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
