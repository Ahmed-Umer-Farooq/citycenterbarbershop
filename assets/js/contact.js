/* ===================== SECTION: contact — JS START =====================
   The contact page's question form: validate, submit, and the thank-you.

   Ported from the ccb-contact-cta export, minus two things it carried that
   this site already owns:
     - its own scroll-reveal IntersectionObserver -> reveal.js does that for
       every [data-reveal] on the site, and base.css styles it.
     - its own open/closed clock (data-open-hours="9-21", read against the
       VISITOR's local time, so wrong for anyone abroad) -> status.js already
       computes this from data/hours.json in the shop's timezone and writes
       data-open on #ccb-root; contact.css reads that.

   All copy, including the error messages, comes from data/strings.*.json via
   build.js and is read off data- attributes here - no Dutch or English in
   this file.

   Own IIFE, looks only inside its own root, no-ops when that root is absent.
   ===================================================================== */
(function () {
  "use strict";
  var root = document.getElementById("ccb-contact");
  if (!root || root.dataset.ccbContactReady) return;
  root.dataset.ccbContactReady = "1";

  var form = root.querySelector("[data-contact-form]");
  if (!form) return;

  var done = root.querySelector("[data-contact-done]");
  var again = root.querySelector("[data-contact-again]");
  var btn = form.querySelector("[data-contact-submit]");
  var label = btn.querySelector("[data-contact-submit-label]");
  var fields = { phone: form.phone, email: form.email, question: form.question };
  var tried = false;

  function msg(key) { return form.getAttribute("data-e-" + key) || ""; }
  function errBox(key) { return root.querySelector("[data-err-" + key + "]"); }

  /* a phone number OR an email address is required - not both - plus a
     question with something in it. Mirrors what the server must check too. */
  function validate() {
    var errors = {};
    var phone = fields.phone.value.trim();
    var email = fields.email.value.trim();

    if (!phone && !email) {
      errors.phone = errors.email = msg("contact");
    } else {
      if (phone && phone.replace(/\D/g, "").length < 9) errors.phone = msg("phone");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = msg("email");
    }
    if (fields.question.value.trim().length < 3) errors.question = msg("question");

    Object.keys(fields).forEach(function (key) {
      fields[key].setAttribute("aria-invalid", errors[key] ? "true" : "false");
      var box = errBox(key);
      if (box) box.textContent = errors[key] || "";
    });
    return errors;
  }

  // only start nagging after the first submit attempt
  form.addEventListener("input", function () { if (tried) validate(); });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    tried = true;

    var errors = validate();
    var first = ["phone", "email", "question"].filter(function (k) { return errors[k]; })[0];
    if (first) { fields[first].focus(); return; }
    if (form.website.value) return;            // honeypot filled: a bot

    var original = label.textContent;
    btn.disabled = true;
    label.textContent = form.getAttribute("data-sending") || original;

    function finish() {
      form.hidden = true;
      if (done) done.hidden = false;
      btn.disabled = false;
      label.textContent = original;
    }
    function fail() {
      btn.disabled = false;
      label.textContent = original;
      window.alert(form.getAttribute("data-e-failed") || "");
    }

    var action = form.getAttribute("action");
    /* No endpoint set yet (site.json's contact_form_action is still TODO):
       show the thank-you without sending, so the page can be demonstrated.
       Wire the endpoint before launch - see README.md. */
    if (!action) { setTimeout(finish, 900); return; }

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (r) { if (!r.ok) throw r; finish(); })
      .catch(fail);
  });

  if (again) {
    again.addEventListener("click", function () {
      form.reset();
      tried = false;
      Object.keys(fields).forEach(function (key) {
        fields[key].setAttribute("aria-invalid", "false");
        var box = errBox(key);
        if (box) box.textContent = "";
      });
      if (done) done.hidden = true;
      form.hidden = false;
      form.name.focus();
    });
  }
})();
/* ===================== SECTION: contact — JS END ===================== */
