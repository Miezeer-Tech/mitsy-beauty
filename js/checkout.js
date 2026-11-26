/* Mitsy Beauty — demo checkout. Validates in the browser and never sends data anywhere. */
(function () {
  "use strict";
  var ORDER_KEY = "mitsy-demo-order";

  function money(n) { return window.mitsyMoney ? window.mitsyMoney(n) : "$" + Number(n).toFixed(2); }
  function cfg() { return window.MITSY || {}; }

  function digits(s) { return String(s || "").replace(/\D/g, ""); }

  function formatCard(val) {
    return digits(val).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }
  function formatExpiry(val) {
    var d = digits(val).slice(0, 4);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + " / " + d.slice(2);
  }

  function shippingRate(id) {
    var list = cfg().shipping || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || { id: "standard", name: "Standard", price: 0, note: "Sample rate" };
  }

  function renderSummary(form) {
    var items = window.MitsyCart.lines();
    var ship = shippingRate(form && form.shipping ? form.shipping.value : "standard");
    var sub = window.MitsyCart.subtotal();
    var total = sub + ship.price;
    var box = document.querySelector("[data-order-summary]");
    if (!box) return { items: items, ship: ship, sub: sub, total: total };
    var lines = box.querySelector("[data-summary-lines]");
    if (lines) {
      lines.innerHTML = items.map(function (l) {
        return '<li class="summary-line">' +
          '<img src="' + l.product.imagePng + '" alt="" width="40" height="80">' +
          '<span>' + l.product.name + ' × ' + l.qty + '</span>' +
          '<strong>' + money(l.line) + '</strong></li>';
      }).join("") || '<li class="summary-line">Your bag is empty.</li>';
    }
    var el;
    if ((el = box.querySelector("[data-summary-subtotal]"))) el.textContent = money(sub);
    if ((el = box.querySelector("[data-summary-shipping]"))) el.textContent = money(ship.price) + " <span class=\"sample-note\">sample</span>";
    // shipping was set as textContent which would escape the span — use innerHTML for that one
    var shipEl = box.querySelector("[data-summary-shipping]");
    if (shipEl) shipEl.innerHTML = money(ship.price) + ' <span class="sample-note">sample</span>';
    if ((el = box.querySelector("[data-summary-total]"))) el.textContent = money(total);
    return { items: items, ship: ship, sub: sub, total: total };
  }

  function showError(input, msg) {
    input.setAttribute("aria-invalid", "true");
    var id = input.id + "-err";
    var err = document.getElementById(id);
    if (!err) {
      err = document.createElement("p");
      err.id = id;
      err.className = "field-error";
      err.setAttribute("role", "alert");
      input.insertAdjacentElement("afterend", err);
      var described = input.getAttribute("aria-describedby") || "";
      input.setAttribute("aria-describedby", (described + " " + id).trim());
    }
    err.textContent = msg;
  }
  function clearError(input) {
    input.removeAttribute("aria-invalid");
    var err = document.getElementById(input.id + "-err");
    if (err) err.textContent = "";
  }

  function validate(form) {
    var ok = true;
    var firstBad = null;
    function need(el, msg) {
      if (!el) return;
      var val = (el.value || "").trim();
      if (!val) { showError(el, msg); ok = false; if (!firstBad) firstBad = el; }
      else clearError(el);
    }
    need(form.email, "Enter an email like name@example.com.");
    if (form.email && form.email.value && !form.email.checkValidity()) {
      showError(form.email, "Enter an email like name@example.com.");
      ok = false; if (!firstBad) firstBad = form.email;
    }
    need(form.firstName, "Enter a first name.");
    need(form.lastName, "Enter a last name.");
    need(form.address1, "Enter a street address.");
    need(form.city, "Enter a city.");
    need(form.region, "Enter a state or region.");
    need(form.postal, "Enter a postal code.");
    need(form.country, "Enter a country.");
    need(form.cardName, "Enter the name on the card.");
    var num = digits(form.cardNumber.value);
    if (num.length < 13) {
      showError(form.cardNumber, "Enter a card number. In this demo any number is accepted, for example 4242 4242 4242 4242.");
      ok = false; if (!firstBad) firstBad = form.cardNumber;
    } else clearError(form.cardNumber);
    var exp = digits(form.cardExpiry.value);
    if (exp.length < 4) {
      showError(form.cardExpiry, "Enter an expiry month and year, for example 12 / 28.");
      ok = false; if (!firstBad) firstBad = form.cardExpiry;
    } else clearError(form.cardExpiry);
    var cvc = digits(form.cardCvc.value);
    if (cvc.length < 3) {
      showError(form.cardCvc, "Enter a 3- or 4-digit security code.");
      ok = false; if (!firstBad) firstBad = form.cardCvc;
    } else clearError(form.cardCvc);
    if (window.MitsyCart.count() === 0) {
      ok = false;
      var empty = document.getElementById("checkout-empty");
      if (empty) empty.hidden = false;
    }
    if (firstBad) firstBad.focus();
    return ok;
  }

  function placeOrder(form) {
    var sum = renderSummary(form);
    var last4 = digits(form.cardNumber.value).slice(-4);
    var order = {
      number: "MITSY-" + Date.now().toString(36).toUpperCase().slice(-6),
      placedAt: new Date().toISOString(),
      contact: { email: form.email.value.trim(), phone: (form.phone.value || "").trim() },
      address: {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        address1: form.address1.value.trim(),
        address2: (form.address2.value || "").trim(),
        city: form.city.value.trim(),
        region: form.region.value.trim(),
        postal: form.postal.value.trim(),
        country: form.country.value.trim()
      },
      shipping: { id: sum.ship.id, name: sum.ship.name, price: sum.ship.price, note: sum.ship.note },
      items: sum.items.map(function (l) {
        return { id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price, color: l.product.color, image: l.product.imagePng };
      }),
      subtotal: sum.sub,
      total: sum.total,
      payment: { brand: "Demo card", last4: last4 },
      demo: true
    };
    try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (e) {}
    window.MitsyCart.clear();
    window.location.href = "order-confirmation.html";
  }

  function initCheckout() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    if (window.MitsyCart.count() === 0) {
      var empty = document.getElementById("checkout-empty");
      if (empty) empty.hidden = false;
      form.hidden = true;
      var summary = document.querySelector("[data-order-summary]");
      if (summary) summary.hidden = true;
      return;
    }
    renderSummary(form);
    form.cardNumber.addEventListener("input", function () {
      var start = form.cardNumber.selectionStart;
      var before = form.cardNumber.value;
      form.cardNumber.value = formatCard(form.cardNumber.value);
      // keep cursor reasonable
      if (start && form.cardNumber.value.length !== before.length) {
        form.cardNumber.setSelectionRange(form.cardNumber.value.length, form.cardNumber.value.length);
      }
    });
    form.cardExpiry.addEventListener("input", function () {
      form.cardExpiry.value = formatExpiry(form.cardExpiry.value);
    });
    form.cardCvc.addEventListener("input", function () {
      form.cardCvc.value = digits(form.cardCvc.value).slice(0, 4);
    });
    form.querySelectorAll('input[name="shipping"]').forEach(function (r) {
      r.addEventListener("change", function () { renderSummary(form); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var btn = form.querySelector("[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Placing order…"; }
      // No network call — this is a dummy checkout.
      placeOrder(form);
    });
  }

  function initConfirmation() {
    var root = document.getElementById("confirmation");
    if (!root) return;
    var order = null;
    try { order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null"); } catch (e) { order = null; }
    var empty = document.getElementById("confirm-empty");
    var body = document.getElementById("confirm-body");
    if (!order || !order.number) {
      if (empty) empty.hidden = false;
      if (body) body.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (body) body.hidden = false;
    var set = function (sel, text) {
      var el = document.querySelector(sel);
      if (el) el.textContent = text;
    };
    set("[data-order-number]", order.number);
    set("[data-order-email]", order.contact.email);
    var addr = order.address;
    var addrText = [addr.firstName + " " + addr.lastName, addr.address1, addr.address2, addr.city + ", " + addr.region + " " + addr.postal, addr.country].filter(Boolean).join("\n");
    var addrEl = document.querySelector("[data-order-address]");
    if (addrEl) addrEl.textContent = addrText;
    set("[data-order-shipping]", order.shipping.name + " — " + money(order.shipping.price) + " (sample)");
    set("[data-order-payment]", "Card ending " + order.payment.last4);
    set("[data-order-subtotal]", money(order.subtotal));
    set("[data-order-ship-cost]", money(order.shipping.price));
    set("[data-order-total]", money(order.total));
    var lines = document.querySelector("[data-order-lines]");
    if (lines) {
      lines.innerHTML = (order.items || []).map(function (it) {
        return '<li class="summary-line">' +
          '<img src="' + it.image + '" alt="" width="40" height="80">' +
          '<span>' + it.name + ' × ' + it.qty + '</span>' +
          '<strong>' + money(it.price * it.qty) + '</strong></li>';
      }).join("");
    }
  }

  function init() {
    if (!window.MitsyCart) return;
    initCheckout();
    initConfirmation();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
