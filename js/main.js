(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOff = () => reduceMotion || root.classList.contains("animations-off");

  const LEAD_FORM = {
    endpoint: "https://api.web3forms.com/submit",
    accessKey: "ce029fa1-ecba-443d-815d-afea2d960cc6"
  };

  const SUBJECT_LABELS = {
    he: { family: "דיני משפחה", labor: "דיני עבודה", realestate: "נדל״ן", other: "אחר" },
    en: { family: "Family law", labor: "Employment", realestate: "Real estate", other: "Other" }
  };

  const STR = {
    he: {
      name: "חסר כאן שם מלא",
      phone: "המספר לא נראה שלם",
      email: "המייל לא נראה תקין",
      subject: "בחרו נושא לפני השליחה",
      message: "ספרו בקצרה במה מדובר",
      submitFail: "השליחה לא הצליחה. נסו שוב בעוד רגע, או התקשרו אלינו."
    },
    en: {
      name: "Please add your full name",
      phone: "That phone number looks incomplete",
      email: "That email looks incorrect",
      subject: "Choose a subject first",
      message: "Tell us briefly what this is about",
      submitFail: "We could not send your details. Please try again or call us."
    }
  };

  function lang() {
    return root.lang === "en" ? "en" : "he";
  }

  function syncTeamLabels() {
    document.querySelectorAll(".team-card button[data-open-he]").forEach((button) => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.textContent = lang() === "en"
        ? (open ? button.dataset.openEn : button.dataset.en)
        : (open ? button.dataset.openHe : button.dataset.he);
    });
  }

  function applyLang(next) {
    const useEn = next === "en";
    root.lang = useEn ? "en" : "he";
    root.dir = useEn ? "ltr" : "rtl";
    document.querySelectorAll("[data-en]").forEach((el) => {
      if (el.tagName === "META" || el.hasAttribute("data-open-he")) return;
      if (!el.dataset.he) el.dataset.he = el.textContent.trim();
      el.textContent = useEn ? el.dataset.en : el.dataset.he;
    });
    document.querySelectorAll("[data-en-label]").forEach((el) => {
      if (!el.dataset.heLabel) el.dataset.heLabel = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", useEn ? el.dataset.enLabel : el.dataset.heLabel);
    });
    document.querySelectorAll("[data-en-alt]").forEach((el) => {
      if (!el.dataset.heAlt) el.dataset.heAlt = el.getAttribute("alt") || "";
      el.setAttribute("alt", useEn ? el.dataset.enAlt : el.dataset.heAlt);
    });
    const meta = document.querySelector('meta[name="description"]');
    if (meta && meta.dataset.en) {
      if (!meta.dataset.he) meta.dataset.he = meta.getAttribute("content") || "";
      meta.setAttribute("content", useEn ? meta.dataset.en : meta.dataset.he);
    }
    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.setLang === (useEn ? "en" : "he")));
    });
    syncTeamLabels();
    try { localStorage.setItem("cohen-lang", useEn ? "en" : "he"); } catch (err) { /* ignore */ }
  }

  applyLang(root.lang === "en" ? "en" : "he");
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.setLang));
  });

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
  const current = file === "" ? "index.html" : file;
  document.querySelectorAll(".desktop-nav a, .mobile-nav a, .footer-links a").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("#")[0].split("?")[0];
    if (href === current) a.setAttribute("aria-current", "page");
  });
  if (current === "article.html") {
    document.querySelectorAll(".desktop-nav a[href='articles.html'], .mobile-nav a[href='articles.html']").forEach((a) => {
      a.setAttribute("aria-current", "page");
    });
  }
  if (["family.html", "labor.html", "real-estate.html"].includes(current)) {
    document.querySelectorAll(".has-sub").forEach((el) => el.classList.add("is-active"));
  }

  const burger = document.querySelector(".burger");
  const mobileNav = document.getElementById("mobile-nav");
  const mainEl = document.getElementById("main");
  const footerEl = document.querySelector(".site-footer");

  function setMenu(open) {
    if (!burger || !mobileNav) return;
    mobileNav.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (mainEl) mainEl.inert = open;
    if (footerEl) footerEl.inert = open;
    if (open) {
      const first = mobileNav.querySelector("a");
      if (first) first.focus();
    }
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", () => setMenu(mobileNav.hidden));
  }

  const sub = document.querySelector(".has-sub");
  const subBtn = sub ? sub.querySelector("button") : null;
  function closeSub() {
    if (!sub || !subBtn) return;
    sub.classList.remove("is-open");
    subBtn.setAttribute("aria-expanded", "false");
  }
  if (sub && subBtn) {
    subBtn.addEventListener("click", () => {
      const open = sub.classList.toggle("is-open");
      subBtn.setAttribute("aria-expanded", String(open));
    });
    sub.addEventListener("mouseenter", () => {
      if (window.innerWidth < 1024) return;
      sub.classList.add("is-open");
      subBtn.setAttribute("aria-expanded", "true");
    });
    sub.addEventListener("mouseleave", () => {
      if (window.innerWidth < 1024) return;
      closeSub();
    });
    sub.addEventListener("focusout", (e) => {
      if (!sub.contains(e.relatedTarget)) closeSub();
    });
    document.addEventListener("click", (e) => {
      if (!sub.contains(e.target)) closeSub();
    });
  }

  const widget = document.querySelector(".a11y-widget");
  const a11yToggle = document.querySelector(".a11y-toggle");
  const a11yPanel = document.getElementById("a11y-panel");
  if (a11yToggle && a11yPanel) {
    a11yToggle.setAttribute("aria-pressed", String(root.classList.contains("contrast")));
    const motionBtn = a11yPanel.querySelector("[data-motion]");
    const contrastBtn = a11yPanel.querySelector("[data-contrast]");
    if (motionBtn) motionBtn.setAttribute("aria-pressed", String(root.classList.contains("animations-off") || reduceMotion));
    if (contrastBtn) contrastBtn.setAttribute("aria-pressed", String(root.classList.contains("contrast")));

    a11yToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = a11yPanel.hidden;
      a11yPanel.hidden = !willOpen;
      a11yToggle.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        const first = a11yPanel.querySelector("button");
        if (first) first.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (widget && !widget.contains(e.target)) {
        a11yPanel.hidden = true;
        a11yToggle.setAttribute("aria-expanded", "false");
      }
    });

    const steps = [87.5, 100, 112.5, 125, 137.5];
    let fontIndex = 1;
    try {
      const saved = parseFloat(localStorage.getItem("cohen-font"));
      const found = steps.indexOf(saved);
      if (found >= 0) fontIndex = found;
    } catch (err) { /* ignore */ }

    function setFont(next) {
      fontIndex = Math.max(0, Math.min(steps.length - 1, next));
      const value = steps[fontIndex] + "%";
      root.style.fontSize = value;
      try { localStorage.setItem("cohen-font", value); } catch (err) { /* ignore */ }
    }

    a11yPanel.querySelector("[data-font='up']")?.addEventListener("click", () => setFont(fontIndex + 1));
    a11yPanel.querySelector("[data-font='down']")?.addEventListener("click", () => setFont(fontIndex - 1));
    contrastBtn?.addEventListener("click", () => {
      const on = root.classList.toggle("contrast");
      contrastBtn.setAttribute("aria-pressed", String(on));
      try { localStorage.setItem("cohen-contrast", on ? "on" : "off"); } catch (err) { /* ignore */ }
    });
    motionBtn?.addEventListener("click", () => {
      const on = root.classList.toggle("animations-off");
      motionBtn.setAttribute("aria-pressed", String(on));
      try { localStorage.setItem("cohen-motion", on ? "off" : "on"); } catch (err) { /* ignore */ }
      if (on) {
        document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
        document.querySelectorAll("[data-why-step]").forEach((el) => el.classList.add("is-in"));
        document.querySelectorAll("[data-count]").forEach((el) => { el.textContent = el.dataset.count; });
        document.querySelectorAll("[data-stat-count]").forEach((el) => {
          const digit = el.querySelector(".about-intro__stat-digit");
          const target = el.dataset.target;
          if (digit && target) digit.textContent = target;
        });
        const photo = document.querySelector("[data-parallax]");
        if (photo) photo.style.transform = "";
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (mobileNav && !mobileNav.hidden) {
        setMenu(false);
        burger.focus();
      }
      if (a11yPanel && !a11yPanel.hidden) {
        a11yPanel.hidden = true;
        a11yToggle.setAttribute("aria-expanded", "false");
        a11yToggle.focus();
      }
      closeSub();
    }
    if (e.key === "Tab" && mobileNav && !mobileNav.hidden) {
      const items = [
        document.querySelector(".site-header .logo"),
        ...document.querySelectorAll(".site-header .lang button"),
        burger,
        ...mobileNav.querySelectorAll("a")
      ].filter(Boolean);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector("button");
    const panel = item.querySelector(".faq-panel");
    if (!button || !panel) return;
    panel.setAttribute("aria-hidden", "true");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      item.classList.toggle("is-open", !open);
      panel.setAttribute("aria-hidden", String(open));
    });
  });

  document.querySelectorAll(".team-card").forEach((card) => {
    const button = card.querySelector("button");
    const bio = card.querySelector(".team-bio");
    if (!button || !bio) return;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".team-card").forEach((other) => {
        const otherBtn = other.querySelector("button");
        const otherBio = other.querySelector(".team-bio");
        if (other !== card && otherBtn && otherBio) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherBio.hidden = true;
        }
      });
      button.setAttribute("aria-expanded", String(!open));
      bio.hidden = open;
      syncTeamLabels();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const topic = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      document.querySelectorAll("[data-topic]").forEach((card) => {
        card.hidden = topic !== "all" && card.dataset.topic !== topic;
      });
    });
  });

  if (document.querySelector("[data-article]")) {
    const id = new URLSearchParams(location.search).get("id") || "mediation";
    const articles = [...document.querySelectorAll("[data-article]")];
    const match = articles.some((el) => el.dataset.article === id);
    articles.forEach((el) => {
      el.hidden = el.dataset.article !== (match ? id : "mediation");
    });
  }

  const ERROR_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="#B3261E" stroke-width="1.5"/><path d="M8 4.6v3.8" stroke="#B3261E" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.2" r="0.8" fill="#B3261E"/></svg>';

  function fieldKey(input) {
    if (input.type === "email") return "email";
    if (input.type === "tel") return "phone";
    if (input.tagName === "SELECT") return "subject";
    if (input.tagName === "TEXTAREA") return "message";
    return "name";
  }

  function isValid(input) {
    const value = input.value.trim();
    if (input.required && !value) return false;
    if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
    if (input.type === "tel") {
      const digits = value.replace(/\D/g, "");
      if (!/^0\d{8,9}$/.test(digits)) return false;
    }
    if (input.tagName === "TEXTAREA" && input.required && value.length < 8) return false;
    return true;
  }

  function setError(input, message) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("is-invalid", Boolean(message));
    let msg = field.querySelector(".field-error");
    if (!message) {
      if (msg) msg.remove();
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      return;
    }
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "field-error";
      msg.id = input.id + "-error";
      msg.setAttribute("role", "alert");
      field.appendChild(msg);
    }
    msg.replaceChildren();
    msg.insertAdjacentHTML("afterbegin", ERROR_SVG);
    msg.append(document.createTextNode(" " + message));
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", msg.id);
  }

  document.querySelectorAll("[data-form]").forEach((form) => {
    const inputs = [...form.querySelectorAll("input, select, textarea")];
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true" && isValid(input)) setError(input, "");
      });
      input.addEventListener("change", () => {
        if (input.getAttribute("aria-invalid") === "true" && isValid(input)) setError(input, "");
      });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const messages = STR[lang()];
      let first = null;
      inputs.forEach((input) => {
        const ok = isValid(input);
        setError(input, ok ? "" : messages[fieldKey(input)]);
        if (!ok && !first) first = input;
      });
      if (first) {
        first.focus();
        return;
      }

      const fields = form.querySelector(".form-fields");
      const success = form.querySelector(".form-success");
      const submitBtn = form.querySelector('button[type="submit"]');
      let formError = form.querySelector(".form-submit-error");
      if (formError) formError.hidden = true;

      const body = new FormData();
      body.append("access_key", LEAD_FORM.accessKey);
      body.append("botcheck", "");
      body.append("from_name", "Yael Shahar Levinson — Website");
      body.append("page", location.pathname + location.search);
      body.append("page_title", document.title);

      let inquiryTopic = "";
      let inquiryTopicLabel = "";
      inputs.forEach((input) => {
        if (!input.name) return;
        const value = input.value.trim();
        if (input.name === "subject") {
          inquiryTopic = value;
          inquiryTopicLabel = SUBJECT_LABELS[lang()][value] || value;
          body.append("inquiry_topic", inquiryTopic);
          body.append("inquiry_topic_label", inquiryTopicLabel);
          return;
        }
        body.append(input.name, value);
      });

      const topicLabel = inquiryTopicLabel || inquiryTopic;
      body.append(
        "subject",
        topicLabel
          ? (lang() === "en" ? "New inquiry — " : "פנייה מהאתר — ") + topicLabel
          : (lang() === "en" ? "New inquiry from the website" : "פנייה חדשה מהאתר")
      );

      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(LEAD_FORM.endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || "submit failed");
        }
        if (fields) fields.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
        }
      } catch (err) {
        if (!formError && fields) {
          formError = document.createElement("p");
          formError.className = "form-submit-error field-error";
          formError.setAttribute("role", "alert");
          fields.appendChild(formError);
        }
        if (formError) {
          formError.hidden = false;
          formError.replaceChildren();
          formError.insertAdjacentHTML("afterbegin", ERROR_SVG);
          formError.append(document.createTextNode(" " + messages.submitFail));
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  document.querySelectorAll("[data-count]").forEach((el) => {
    if (motionOff()) return;
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        el.textContent = "0";
        const start = performance.now();
        const tick = (now) => {
          if (motionOff()) {
            el.textContent = String(target);
            return;
          }
          const t = Math.min(1, (now - start) / 900);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  const photo = document.querySelector("[data-parallax]");
  if (photo) {
    const onParallax = () => {
      if (motionOff() || window.innerWidth < 1024) {
        photo.style.transform = "";
        return;
      }
      const y = Math.min(24, window.scrollY * 0.05);
      photo.style.transform = "translate3d(0, " + y + "px, 0)";
    };
    onParallax();
    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", onParallax);
  }

  const reviewsRoot = document.querySelector("[data-reviews]");
  if (reviewsRoot) {
    const slides = [...reviewsRoot.querySelectorAll("[data-review-slide]")];
    const stage = reviewsRoot.querySelector(".reviews-stage");
    const prevBtn = reviewsRoot.querySelector("[data-reviews-prev]");
    const nextBtn = reviewsRoot.querySelector("[data-reviews-next]");
    const dotsHost = reviewsRoot.querySelector("[data-reviews-dots]");
    const bar = reviewsRoot.querySelector("[data-reviews-bar]");
    const status = reviewsRoot.querySelector("[data-reviews-status]");
    const DURATION = 6000;
    let index = 0;
    let booted = false;
    let hovering = false;
    let focused = false;
    let dragging = false;
    let offscreen = true;
    let elapsed = 0;
    let lastTs = 0;
    let rafId = 0;
    let running = false;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let motionWasOff = false;

    function reviewsMotionOff() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        || root.classList.contains("animations-off");
    }
    motionWasOff = reviewsMotionOff();

    function labelFor(i) {
      const n = i + 1;
      const total = slides.length;
      return lang() === "en"
        ? "Review " + n + " of " + total
        : "ביקורת " + n + " מתוך " + total;
    }

    function syncLabels() {
      const en = lang() === "en";
      reviewsRoot.setAttribute("aria-roledescription", en ? "carousel" : "קרוסלה");
      dotsHost.querySelectorAll("button").forEach((dot, i) => {
        dot.setAttribute("aria-label", labelFor(i));
      });
      if (booted) announce();
    }

    function announce() {
      if (!status) return;
      const slide = slides[index];
      if (!slide) return;
      const parts = [labelFor(index)];
      [".review-name", ".review-text", ".review-tag"].forEach((sel) => {
        const el = slide.querySelector(sel);
        if (!el) return;
        const value = el.textContent.trim().replace(/\.+$/g, "");
        if (value) parts.push(value);
      });
      status.textContent = parts.join(". ");
    }

    slides.forEach((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.role = "tab";
      dot.tabIndex = -1;
      dot.setAttribute("aria-controls", slide.id);
      dot.setAttribute("aria-selected", "false");
      dot.addEventListener("click", () => {
        if (i === index) return;
        show(i, i > index ? 1 : -1);
      });
      dotsHost.appendChild(dot);
    });

    function updateDots(moveFocus) {
      const dots = [...dotsHost.querySelectorAll("button")];
      dots.forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", String(on));
        dot.tabIndex = on ? 0 : -1;
      });
      if (moveFocus && dots[index]) dots[index].focus();
    }

    function show(next, dir) {
      const count = slides.length;
      if (!count || !stage) return;
      const target = ((next % count) + count) % count;
      const direction = dir > 0 ? 1 : dir < 0 ? -1 : 0;
      const moveFocus = dotsHost.contains(document.activeElement);
      if (booted && target === index) return;

      const prev = index;
      const incoming = slides[target];
      const outgoing = slides[prev];
      const reduce = reviewsMotionOff() || direction === 0 || prev === target;

      if (!reduce) {
        const sign = (root.dir === "rtl" ? -1 : 1) * direction;
        stage.style.setProperty("--review-enter", (20 * sign) + "px");
        stage.style.setProperty("--review-exit", (-20 * sign) + "px");
      }

      slides.forEach((slide) => slide.removeAttribute("hidden"));

      if (!reduce && incoming !== outgoing) {
        incoming.classList.remove("is-active", "is-leaving");
        void incoming.offsetWidth;
        outgoing.classList.remove("is-active");
        outgoing.classList.add("is-leaving");
        incoming.classList.add("is-active");
        slides.forEach((slide, i) => {
          if (i !== target && i !== prev) slide.classList.remove("is-active", "is-leaving");
        });
      } else {
        slides.forEach((slide, i) => {
          slide.classList.toggle("is-active", i === target);
          slide.classList.remove("is-leaving");
        });
      }

      slides.forEach((slide, i) => {
        const on = i === target;
        slide.setAttribute("aria-hidden", on ? "false" : "true");
        if ("inert" in slide) slide.inert = !on;
      });

      const shouldAnnounce = booted;
      index = target;
      booted = true;
      updateDots(moveFocus);
      if (shouldAnnounce) announce();
      resetProgress();
    }

    function setBar(progress) {
      if (!bar) return;
      const value = Math.min(1, Math.max(0, progress));
      bar.style.transform = "scaleX(" + value + ")";
    }

    function stopLoop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastTs = 0;
    }

    function paused() {
      return hovering || focused || dragging || document.hidden || offscreen || reviewsMotionOff();
    }

    function frame(ts) {
      if (!running) return;
      if (!lastTs) lastTs = ts;
      elapsed += ts - lastTs;
      lastTs = ts;
      const progress = elapsed / DURATION;
      setBar(progress);
      if (progress >= 1) {
        stopLoop();
        show(index + 1, 1);
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    function startProgress() {
      if (reviewsMotionOff()) {
        reviewsRoot.classList.add("is-static");
        stopLoop();
        setBar(0);
        return;
      }
      reviewsRoot.classList.remove("is-static");
      if (paused() || running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(frame);
    }

    function resetProgress() {
      elapsed = 0;
      setBar(0);
      stopLoop();
      startProgress();
    }

    function pauseProgress() {
      if (!running) return;
      stopLoop();
    }

    function resumeProgress() {
      if (paused()) return;
      startProgress();
    }

    prevBtn?.addEventListener("click", () => show(index - 1, -1));
    nextBtn?.addEventListener("click", () => show(index + 1, 1));

    reviewsRoot.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const forward = root.dir === "rtl" ? e.key === "ArrowLeft" : e.key === "ArrowRight";
      show(index + (forward ? 1 : -1), forward ? 1 : -1);
    });

    reviewsRoot.addEventListener("pointerenter", (e) => {
      if (!canHover || e.pointerType !== "mouse") return;
      hovering = true;
      pauseProgress();
    });
    reviewsRoot.addEventListener("pointerleave", (e) => {
      if (!canHover || e.pointerType !== "mouse") return;
      hovering = false;
      resumeProgress();
    });
    reviewsRoot.addEventListener("focusin", () => {
      focused = true;
      pauseProgress();
    });
    reviewsRoot.addEventListener("focusout", (e) => {
      if (reviewsRoot.contains(e.relatedTarget)) return;
      focused = false;
      resumeProgress();
    });

    if (stage) {
      let tracking = null;
      stage.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        tracking = { id: e.pointerId, x: e.clientX, y: e.clientY, locked: false };
      });
      stage.addEventListener("pointermove", (e) => {
        if (!tracking || e.pointerId !== tracking.id || tracking.locked) return;
        const dx = e.clientX - tracking.x;
        const dy = e.clientY - tracking.y;
        if (Math.hypot(dx, dy) < 10) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          tracking.locked = true;
          dragging = true;
          stage.classList.add("is-dragging");
          if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
          pauseProgress();
        } else {
          tracking = null;
        }
      });
      const endDrag = (e, cancelled) => {
        if (!tracking || e.pointerId !== tracking.id) return;
        const dx = e.clientX - tracking.x;
        const locked = tracking.locked;
        tracking = null;
        dragging = false;
        stage.classList.remove("is-dragging");
        if (cancelled || !locked || Math.abs(dx) < 48) {
          resumeProgress();
          return;
        }
        const forward = root.dir === "rtl" ? dx > 0 : dx < 0;
        show(index + (forward ? 1 : -1), forward ? 1 : -1);
      };
      stage.addEventListener("pointerup", (e) => endDrag(e, false));
      stage.addEventListener("pointercancel", (e) => endDrag(e, true));
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseProgress();
      else resumeProgress();
    });

    if ("IntersectionObserver" in window) {
      const watch = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          offscreen = !entry.isIntersecting;
          if (offscreen) pauseProgress();
          else resumeProgress();
        });
      }, { threshold: 0.35 });
      watch.observe(reviewsRoot);
    } else {
      offscreen = false;
    }

    new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === "lang" || m.attributeName === "dir")) syncLabels();
      const nowOff = reviewsMotionOff();
      if (nowOff === motionWasOff) return;
      motionWasOff = nowOff;
      slides.forEach((slide) => slide.classList.remove("is-leaving"));
      if (nowOff) {
        reviewsRoot.classList.add("is-static");
        stopLoop();
        setBar(0);
      } else {
        reviewsRoot.classList.remove("is-static");
        resetProgress();
      }
    }).observe(root, { attributes: true, attributeFilter: ["lang", "class", "dir"] });

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionMedia.addEventListener) {
      motionMedia.addEventListener("change", () => {
        const nowOff = reviewsMotionOff();
        if (nowOff === motionWasOff) return;
        motionWasOff = nowOff;
        slides.forEach((slide) => slide.classList.remove("is-leaving"));
        if (nowOff) {
          reviewsRoot.classList.add("is-static");
          stopLoop();
          setBar(0);
        } else {
          reviewsRoot.classList.remove("is-static");
          resetProgress();
        }
      });
    }

    syncLabels();
    if (reviewsMotionOff()) reviewsRoot.classList.add("is-static");
    show(0, 0);
  }

  const whyRoot = document.querySelector("[data-why]");
  if (whyRoot) {
    const rule = whyRoot.querySelector("[data-why-rule]");
    const stepsWrap = whyRoot.querySelector("[data-why-steps]");
    const steps = [...whyRoot.querySelectorAll("[data-why-step]")];
    let watching = false;
    let ticking = false;

    function whyStopped() {
      return motionOff();
    }
    function clamp01(v) {
      return v < 0 ? 0 : v > 1 ? 1 : v;
    }
    function setRule(p) {
      if (!rule) return;
      rule.style.transform = "scaleX(" + p.toFixed(3) + ")";
    }
    function ruleProgress() {
      if (!rule) return 1;
      const rect = rule.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.82;
      const end = vh * 0.56;
      return clamp01((start - rect.top) / (start - end || 1));
    }
    function paintRule() {
      ticking = false;
      if (whyStopped()) {
        setRule(1);
        return;
      }
      setRule(ruleProgress());
    }
    function requestRule() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paintRule);
    }
    function startWatch() {
      if (watching) return;
      watching = true;
      window.addEventListener("scroll", requestRule, { passive: true });
      requestRule();
    }
    function stopWatch() {
      if (!watching) return;
      window.removeEventListener("scroll", requestRule);
      watching = false;
      ticking = false;
    }
    function revealSteps() {
      steps.forEach((el) => el.classList.add("is-in"));
    }
    function applyWhy() {
      const staticNow = whyStopped();
      whyRoot.classList.toggle("is-static", staticNow);
      if (staticNow) {
        stopWatch();
        setRule(1);
        revealSteps();
        return;
      }
      startWatch();
    }

    applyWhy();

    if ("IntersectionObserver" in window) {
      if (rule) {
        const ruleIo = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (whyStopped()) return;
            if (entry.isIntersecting) startWatch();
            else stopWatch();
          });
        }, { rootMargin: "64px 0px 64px 0px" });
        ruleIo.observe(rule);
      }
      if (stepsWrap) {
        const stepsIo = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealSteps();
            stepsIo.unobserve(entry.target);
          });
        }, { threshold: 0.16, rootMargin: "0px 0px -36px 0px" });
        stepsIo.observe(stepsWrap);
      }
    } else {
      revealSteps();
      setRule(1);
    }

    window.addEventListener("resize", () => { if (!whyStopped()) requestRule(); }, { passive: true });
    new MutationObserver(applyWhy).observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function finalizeAboutIntroStat(el) {
    const digit = el.querySelector(".about-intro__stat-digit");
    const target = Number(el.dataset.target);
    if (digit && !Number.isNaN(target)) digit.textContent = String(target);
  }

  function initAboutIntroStatsCount() {
    const statsRow = document.querySelector(".about-intro__stats");
    const section = document.getElementById("about-intro");
    if (!statsRow || !section) return;
    const counters = statsRow.querySelectorAll("[data-stat-count]");
    if (!counters.length) return;

    const DURATION_MS = 2000;
    const VIS_RATIO = 0.4;

    if (motionOff()) return;

    let started = false;
    let statsObserver = null;

    function sectionIsVisible() {
      return section.classList.contains("is-in");
    }

    function statsVisibleEnough() {
      const rect = statsRow.getBoundingClientRect();
      if (rect.height <= 0) return false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      return visible > 0 && visible / rect.height >= VIS_RATIO;
    }

    function runCountUp() {
      counters.forEach((el) => {
        const target = Number(el.dataset.target);
        const digit = el.querySelector(".about-intro__stat-digit");
        if (!digit || Number.isNaN(target)) return;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min(1, (now - start) / DURATION_MS);
          const value = Math.round(target * easeOutCubic(progress));
          digit.textContent = String(value);
          if (progress < 1) requestAnimationFrame(tick);
          else digit.textContent = String(target);
        }
        requestAnimationFrame(tick);
      });
    }

    function tryStartCountUp() {
      if (started || motionOff()) return;
      if (!sectionIsVisible() || !statsVisibleEnough()) return;
      started = true;
      if (statsObserver) statsObserver.disconnect();

      counters.forEach((el) => {
        const digit = el.querySelector(".about-intro__stat-digit");
        if (digit) digit.textContent = "0";
      });
      requestAnimationFrame(() => runCountUp());
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(finalizeAboutIntroStat);
      return;
    }

    statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.intersectionRatio >= VIS_RATIO || statsVisibleEnough()) tryStartCountUp();
      });
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });

    statsObserver.observe(statsRow);

    if (!sectionIsVisible()) {
      const sectionObserver = new MutationObserver(() => {
        if (sectionIsVisible()) {
          sectionObserver.disconnect();
          tryStartCountUp();
        }
      });
      sectionObserver.observe(section, { attributes: true, attributeFilter: ["class"] });
    }

    window.addEventListener("load", tryStartCountUp, { once: true });
    tryStartCountUp();
  }

  const reveals = document.querySelectorAll(".reveal");
  if (!motionOff() && reveals.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  initAboutIntroStatsCount();
})();
