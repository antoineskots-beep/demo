// Lafix Appliance Repair: shared behavior for all pages

// Language: a first visit follows the browser language; the EN/FR link saves the visitor's choice
(function () {
  "use strict";

  var switcher = document.querySelector(".lang-switch");
  if (!switcher) return;

  var saved = null;
  try { saved = localStorage.getItem("lafix-lang"); } catch (error) {}

  var browser = String((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase();
  var wanted = saved || (browser.indexOf("fr") === 0 ? "fr" : "en");

  if (wanted !== document.documentElement.lang) {
    window.location.replace(switcher.href);
    return;
  }

  switcher.addEventListener("click", function () {
    try { localStorage.setItem("lafix-lang", switcher.getAttribute("data-lang")); } catch (error) {}
  });
})();

(function () {
  "use strict";

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNav(false);
        toggle.focus();
      }
    });
  }

  // Header shadow once the page has scrolled
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Hide the sticky call bar while the main call button is on screen
  var callBar = document.querySelector(".call-bar");
  var mainCall = document.getElementById("hero-call");
  if (callBar && mainCall && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      callBar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }).observe(mainCall);
  }

  // Service browser on the home page: hover, focus, click or arrow keys show the matching details
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".svc-tab"));

  function showTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("mouseenter", function () { showTab(tab, false); });
    tab.addEventListener("focus", function () { showTab(tab, false); });
    tab.addEventListener("click", function () { showTab(tab, false); });
    tab.addEventListener("keydown", function (event) {
      var next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      showTab(tabs[(next + tabs.length) % tabs.length], true);
    });
  });

  // Coverage map: tap or press Enter to show a city name on touch screens and keyboards
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));

  function clearPins(except) {
    pins.forEach(function (p) { if (p !== except) p.classList.remove("is-active"); });
  }

  pins.forEach(function (pin) {
    pin.addEventListener("click", function (event) {
      event.stopPropagation();
      clearPins(pin);
      pin.classList.toggle("is-active");
    });
    pin.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        clearPins(pin);
        pin.classList.toggle("is-active");
      }
    });
  });

  document.addEventListener("click", function () { clearPins(null); });

  // Request form validation
  var form = document.getElementById("request-form");
  if (!form) return;

  var isFrench = document.documentElement.lang === "fr";
  var messages = isFrench
    ? {
        name: "Entrez votre nom.",
        phone: "Entrez un numéro de téléphone avec l'indicatif régional, par exemple 438 527 3337.",
        appliance: "Choisissez l'appareil à réparer."
      }
    : {
        name: "Enter your name.",
        phone: "Enter a phone number with area code, for example 438 527 3337.",
        appliance: "Choose the appliance that needs work."
      };

  var rules = {
    name: function (value) {
      return value.trim().length >= 2 ? "" : messages.name;
    },
    phone: function (value) {
      var digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11 ? "" : messages.phone;
    },
    appliance: function (value) {
      return value ? "" : messages.appliance;
    }
  };

  function check(field) {
    var input = form.elements[field];
    var message = rules[field](input.value);
    document.getElementById(field + "-error").textContent = message;
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  Object.keys(rules).forEach(function (field) {
    form.elements[field].addEventListener("blur", function () { check(field); });
    form.elements[field].addEventListener("input", function () {
      if (form.elements[field].classList.contains("is-invalid")) check(field);
    });
  });

  form.addEventListener("submit", function (event) {
    var firstInvalid = null;

    Object.keys(rules).forEach(function (field) {
      if (!check(field) && !firstInvalid) firstInvalid = form.elements[field];
    });

    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
    }
  });
})();
