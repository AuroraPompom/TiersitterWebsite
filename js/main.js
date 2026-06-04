/* =========================================================
   Chiaras Mobile Tierbetreuung – Skripte
   ========================================================= */
(function () {
  "use strict";

  /* ---- Sprachumschaltung Deutsch / Englisch ---- */
  var i18nEls = Array.prototype.slice.call(document.querySelectorAll("[data-en]"));
  // deutschen Originaltext einmalig zwischenspeichern
  i18nEls.forEach(function (el) { el.setAttribute("data-de", el.innerHTML); });

  var langToggle = document.getElementById("langToggle");
  var langLabel = document.getElementById("langLabel");

  function applyLang(lang) {
    i18nEls.forEach(function (el) {
      el.innerHTML = (lang === "en") ? el.getAttribute("data-en") : el.getAttribute("data-de");
    });
    document.documentElement.lang = lang;
    if (langLabel) { langLabel.textContent = (lang === "en") ? "DE" : "EN"; }
    if (langToggle) {
      langToggle.setAttribute("aria-label", (lang === "en") ? "Auf Deutsch umschalten" : "Switch to English");
    }
    try { localStorage.setItem("siteLang", lang); } catch (e) {}
  }

  var savedLang = "de";
  try { savedLang = localStorage.getItem("siteLang") || "de"; } catch (e) {}
  applyLang(savedLang);

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      var next = (document.documentElement.lang === "en") ? "de" : "en";
      applyLang(next);
    });
  }

  /* ---- Mobile-Menü ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Menü nach Klick auf einen Link schließen
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Aktiver Navigationspunkt beim Scrollen ---- */
  var sections = document.querySelectorAll("main section[id]");
  var navItems = document.querySelectorAll('.nav-links a[href^="#"]');
  if ("IntersectionObserver" in window && sections.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navItems.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---- Jahr im Footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- WhatsApp-QR-Code erzeugen ---- */
  var qrEl = document.getElementById("qrcode");
  if (qrEl && typeof QRCode !== "undefined") {
    new QRCode(qrEl, {
      text: "https://wa.me/4917676883339",
      width: 150,
      height: 150,
      colorDark: "#4d4a44",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  /* ---- Galerie-Lightbox ---- */
  var lb = document.getElementById("lightbox");
  var figures = Array.prototype.slice.call(document.querySelectorAll(".gallery-grid figure"));
  if (lb && figures.length) {
    var lbImg = document.getElementById("lbImg");
    var lbCap = document.getElementById("lbCaption");
    var current = 0;
    var lastFocus = null;

    var items = figures.map(function (fig) {
      var img = fig.querySelector("img");
      var cap = fig.querySelector("figcaption");
      return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "", cap: cap ? cap.textContent : "" };
    });

    function show(i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      lbImg.setAttribute("src", it.src);
      lbImg.setAttribute("alt", it.alt);
      lbCap.textContent = it.cap;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.getElementById("lbClose").focus();
    }
    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) { lastFocus.focus(); }
    }

    figures.forEach(function (fig, i) {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Bild vergrößern: " + items[i].cap);
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    document.getElementById("lbClose").addEventListener("click", close);
    document.getElementById("lbPrev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lbNext").addEventListener("click", function () { show(current + 1); });
    // Klick auf den dunklen Hintergrund schließt
    lb.addEventListener("click", function (e) { if (e.target === lb) { close(); } });
    // Tastatursteuerung
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) { return; }
      if (e.key === "Escape") { close(); }
      else if (e.key === "ArrowLeft") { show(current - 1); }
      else if (e.key === "ArrowRight") { show(current + 1); }
    });
  }

  /* ---- Kontaktformular öffnet das E-Mail-Programm des Besuchers (mailto) ---- */
  var EMPFAENGER = "mobile-tiersitterin-chiara@web.de";
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Browser-Pflichtfeldprüfung respektieren
      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      var name = (form.elements.name && form.elements.name.value || "").trim();
      var email = (form.elements.email && form.elements.email.value || "").trim();
      var message = (form.elements.message && form.elements.message.value || "").trim();

      var istEnglisch = document.documentElement.lang === "en";

      var betreff = istEnglisch
        ? "Enquiry via website – " + name
        : "Anfrage über die Website – " + name;

      var koerper = istEnglisch
        ? "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message
        : "Name: " + name + "\nE-Mail: " + email + "\n\nNachricht:\n" + message;

      var mailto = "mailto:" + EMPFAENGER +
        "?subject=" + encodeURIComponent(betreff) +
        "&body=" + encodeURIComponent(koerper);

      if (status) {
        status.style.color = "#8f967b";
        status.textContent = istEnglisch
          ? "Your email program is opening – please press send there."
          : "Ihr E-Mail-Programm wird geöffnet – bitte dort auf „Senden“ klicken.";
      }

      window.location.href = mailto;
    });
  }
})();
