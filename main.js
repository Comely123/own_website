(function () {
  "use strict";

  var viewport = document.getElementById("track");
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var picker = document.getElementById("picker");
  var pickerName = document.getElementById("picker-name");
  var navBtns = Array.prototype.slice.call(document.querySelectorAll("[data-go]"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var locking = false;

  function panelCount() {
    return panels.length;
  }

  function goTo(i, smooth) {
    if (i < 0) i = 0;
    if (i > panelCount() - 1) i = panelCount() - 1;
    index = i;
    var left = panels[i].offsetLeft;
    viewport.scrollTo({ left: left, behavior: smooth === false || reduce ? "auto" : "smooth" });
    syncUI();
  }

  function syncUI() {
    var chips = picker ? picker.querySelectorAll(".chip") : [];
    for (var n = 0; n < chips.length; n++) {
      chips[n].classList.toggle("is-on", n === index);
    }
    if (pickerName) {
      var label = panels[index].getAttribute("data-node") || String(index + 1);
      if (pickerName.textContent !== label) {
        pickerName.textContent = label;
        pickerName.classList.remove("is-anim");
        void pickerName.offsetWidth;
        pickerName.classList.add("is-anim");
      }
    }
    for (var b = 0; b < navBtns.length; b++) {
      var g = parseInt(navBtns[b].getAttribute("data-go"), 10);
      navBtns[b].classList.toggle("is-on", g === index);
    }
  }

  function buildPicker() {
    if (!picker) return;
    picker.innerHTML = "";
    panels.forEach(function (p, i) {
      var label = p.getAttribute("data-node") || String(i + 1);
      var thumb = p.getAttribute("data-thumb") || "assets/img/avatar-v2.webp";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " is-on" : "");
      btn.setAttribute("aria-label", "Show " + label);
      btn.innerHTML =
        '<span class="chip__dot" aria-hidden="true"></span>' +
        '<span class="chip__thumb"><img src="' + thumb + '" alt="' + label + '"></span>';
      btn.addEventListener("click", function () { goTo(i); });
      picker.appendChild(btn);
    });
  }

  function nearestIndex() {
    var x = viewport.scrollLeft;
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < panels.length; i++) {
      var d = Math.abs(panels[i].offsetLeft - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  var scrollTick = false;
  viewport.addEventListener("scroll", function () {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(function () {
      index = nearestIndex();
      syncUI();
      scrollTick = false;
    });
  }, { passive: true });

  // wheel still moves pages, but metro UI is gone — selection is via chips
  viewport.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    if (e.target.closest && (
      e.target.closest(".film-rail") ||
      e.target.closest(".shelf-detail__scroll") ||
      e.target.closest(".shelf-page__right") ||
      e.target.closest(".shelf-page__left") ||
      e.target.closest(".shelf-stage")
    )) return;
    e.preventDefault();
    if (locking) return;
    if (Math.abs(e.deltaY) < 8) return;
    locking = true;
    goTo(index + (e.deltaY > 0 ? 1 : -1));
    setTimeout(function () { locking = false; }, reduce ? 100 : 650);
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(panelCount() - 1);
    }
  });

  for (var i = 0; i < navBtns.length; i++) {
    navBtns[i].addEventListener("click", function (ev) {
      var g = parseInt(ev.currentTarget.getAttribute("data-go"), 10);
      if (!isNaN(g)) goTo(g);
    });
  }

  buildPicker();
  // Always open Home on load/refresh, regardless of any stale URL hash.
  if (location.hash && location.hash !== "#p-home") {
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  goTo(0, false);
  window.addEventListener("resize", function () {
    goTo(index, false);
  });
  window.addEventListener("hashchange", function () {
    var t = document.querySelector(location.hash);
    if (!t) return;
    var i = panels.indexOf(t);
    if (i >= 0) goTo(i);
  });

  (function () {
    var photo = document.querySelector(".home__photo img");
    var home = document.getElementById("p-home");
    if (!photo || !home || reduce) return;
    var tx = 0, ty = 0, gx = 0, gy = 0;
    home.addEventListener("mousemove", function (e) {
      var r = home.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    home.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
    (function loop() {
      gx += (tx - gx) * 0.05;
      gy += (ty - gy) * 0.05;
      photo.style.transform =
        "scale(1.1) perspective(900px) rotateY(" + (-6 + gx * -4) + "deg) translate(" +
        (gx * 14) + "px," + (gy * 10) + "px)";
      window.requestAnimationFrame(loop);
    })();
  })();

  /* Work shelf — 6 projects, default Smart Rail */
  (function () {
    var BOOKS = [
      {
        id: "rail",
        spine: "Smart Rail",
        title: "Carriage-Level Passenger Flow Prediction & Guidance",
        sub: "Smart Rail · Completed",
        year: "Nov 2025 – Nov 2026",
        meta: "Smart Rail · Completed",
        body: "Project · Smart Rail, Intelligent Travel\nPeriod: Nov 2025 – Nov 2026\nRole: Member, Shanxi University Innovation Training Program\n\nMotivation\nAfter Taiyuan Metro opened, I wanted to predict how passengers spread across individual carriages before boarding — so riders could pick less crowded cars and stations could guide flow more intelligently.\n\nWhat I did\n• Built the carriage-level passenger-flow dataset: collection, cleaning, feature engineering\n• Designed and evaluated deep-learning models, incl. a GNN time-series predictor\n• Built the website and mini-program guidance surfaces, wired to the backend\n• Joined model optimization and solution discussions with the team\n\nOutcome\nEarned national, provincial and university recognition — and gave me end-to-end experience from data to a live transit-guidance loop.",
        out: "National / provincial / university recognition",
        specs: [],
        images: [],
        cover: "assets/img/shelf/rail.webp",
        link: { href: "https://www.metromtl.xyz/", label: "metromtl.xyz ↗" }
      },
      {
        id: "jdpm",
        spine: "JDPM",
        title: "Intelligent Driving Behavior Interpretation",
        sub: "JDPM · In progress",
        year: "In progress",
        meta: "JDPM · In progress",
        body: "Project: Intelligent Driving Behavior Interpretation System\nStatus: Independent track · in progress\n\nResearch Motivation\nOn my own, I have been exploring autonomous-driving problems — especially the algorithms and ideas behind detection, prediction, and the interpretation of driving behavior, treated as one connected pipeline rather than separate modules.\n\nTechnical Exploration\n• Investigated integrated detection and prediction workflows for intelligent driving\n• Explored algorithmic ideas for analyzing and interpreting driving behavior\n• Built a software platform with full-stack techniques — backend interfaces, database functionality, and cloud deployment\n\nOutcomes and Direction\nThis work deepened my interest in how AI systems stay reliable in complex environments. I want to keep studying how predictive models generalize across scenarios, and how algorithmic methods can support safer intelligent systems. A software copyright is registered and the paper is underway.",
        out: "Software platform · paper in progress",
        specs: [],
        images: [],
        cover: "assets/img/shelf/jdpm.webp",
        link: { href: "https://github.com/Comely123/JDPM.git", label: "GitHub ↗" }
      },
      {
        id: "arm",
        spine: "Duct Arm",
        title: "Reuleaux Triangle Cleaning Arm for Square Pipelines",
        sub: "Duct Arm · Completed",
        year: "Published",
        meta: "Duct Arm · Completed",
        body: "Publication: Design and Research of a Reuleaux Triangle Cleaning Arm for Square Pipelines\nRole: Third Author\n\nResearch Motivation\nSmall square pipelines are awkward to clean with round tools. With a teammate, I helped frame the problem and explore a cleaning arm built on Reuleaux-triangle geometry — a constant-width shape that keeps contact and reaches the corner seams more effectively.\n\nMethods and Contributions\n• Shaped the research approach and defined the design problem\n• Contributed to experimental design and preparation of the manuscript\n• Studied, with the team, whether the proposed structure actually fits square-pipeline cleaning in practice\n\nOutcomes\nPublished in Machine Tool & Hydraulics (机床与液压). The project was my first taste of collaborative engineering research, experimental design, and academic writing.",
        out: "Published · Machine Tool & Hydraulics · 3rd author",
        specs: [],
        images: [],
        cover: "assets/img/shelf/arm.webp",
        link: null
      },
      {
        id: "esg",
        spine: "ESG",
        title: "ESG Rating-Revision Forecasting for Sustainable Finance",
        sub: "ESG · Completed",
        year: "IC-AIF 2027",
        meta: "ESG · Completed",
        body: "Manuscript · Evaluating Cross-Dimensional Feature Stability in ESG Rating-Revision Forecasting\nStatus: Accepted, IC-AIF 2027 · Third author\n\nMotivation\nReaching the 2026 Siemens Cup national final pulled me into ESG — and made me ask whether AI can really help, and whether ESG dimensions carry stable, useful predictive signal for later rating revisions, or only short-lived correlation.\n\nWhat I did\n• Combined ESG analysis with AI-based predictive modeling\n• Measured the predictive information carried across dimensions\n• Separated statistical dependence from stable, incremental predictive value\n\nOutcome\nThe work sharpened how I judge models — by stability and real usefulness, not just accuracy. Accepted for presentation at IC-AIF 2027.",
        out: "IC-AIF 2027 · Third author",
        specs: [],
        images: [],
        cover: "assets/img/shelf/esg.webp",
        link: { href: "https://esg.metromtl.xyz/", label: "esg.metromtl.xyz ↗" }
      },
      {
        id: "insight",
        spine: "Engine",
        title: "AI Retrieval Engine for Patents, Papers & Trends",
        sub: "Engine · Completed",
        year: "WorkBuddy · DingTalk",
        meta: "Engine · Completed",
        body: "Project · AI-powered retrieval engine for patents, papers & trends\nEcosystem: WorkBuddy + DingTalk · Role: AI Application Design & Development\n\nMotivation\nPatents, papers and live signals grow faster than anyone can track, and scattered sources still force people to search, sort and report by hand. I built an engine that joins discovery, AI analysis and delivery inside the tools teams already use.\n\nWhat I did\n• Designed retrieval across patents, papers and live trends\n• Integrated WorkBuddy with DingTalk for analysis and report handoff\n• Let users launch a task with a few fields; deliver an editable report by email\n• Added an idea-collection path so early concepts get discussed and reviewed\n\nOutcome\nCuts first-pass research effort while keeping a human in the loop — a practical agent + collaboration-platform pattern.",
        out: "WorkBuddy · DingTalk",
        specs: [],
        images: [],
        cover: "assets/img/shelf/insight.webp",
        link: null
      },
      {
        id: "zero",
        spine: "Supply chain",
        title: "Qinengli ERP — Procure-to-Pay & Supplier Collaboration",
        sub: "Supply chain · In progress",
        year: "Figma · Enterprise",
        meta: "Supply chain · In progress",
        body: "Project · Qinengli ERP — procure-to-pay & supplier collaboration\nStack: Figma + enterprise design system · Role: Application design & prototyping\n\nMotivation\nProcurement, suppliers, inventory and settlement usually live in separate tools, so handoffs stay unclear. I designed connected, walkable procure-to-pay chains, with AI supporting — not replacing — the approver.\n\nWhat I did\n• Supplier onboarding → qualification → quality (inspection, NCR, CAPA, scorecards)\n• Requisition → demand pool → inquiry, auction, tender or agreement buying\n• Award → contract/PO → receiving & inventory → reconciliation & payment\n• AI assists price comparison, award advice, contract diff, supplier review\n\nOutcome\nOne reviewable workflow across buyers, quality, warehouse and finance — same document, next action clear.",
        out: "Figma · Enterprise design system",
        specs: [],
        images: [],
        cover: "assets/img/shelf/zero.webp",
        link: null
      }
    ];

    var root = document.getElementById("shelf-root");
    var stage = document.getElementById("shelf-stage");
    var detail = document.getElementById("shelf-detail");
    var cap = document.getElementById("shelf-cap");
    if (!root || !stage || !detail) return;

    var N = BOOKS.length;
    var COPIES = 3;
    var TOTAL = N * COPIES;
    var s = N; // middle copy, book 0
    var T = N;
    var active = 0;
    var hover = -1;
    var lifts = [];
    var tapes = [];
    var H = 0, ws = 0, d = 0, gap = 0;
    var dragging = false, dragMoved = false, dragX0 = 0, dragT0 = 0;
    var lastWheel = 0;

    function smoothstep(x) {
      x = Math.max(0, Math.min(1, x));
      return x * x * (3 - 2 * x);
    }
    function B(r) {
      if (Math.abs(r) < 1) return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
      return r > 0 ? 0.5 : -0.5;
    }
    function F(r) {
      return r * (ws + gap) + (d - ws + 1.6 * gap) * B(r);
    }
    function wrapRel(v, scroll) {
      var r = v - scroll;
      while (r > TOTAL / 2) r -= TOTAL;
      while (r < -TOTAL / 2) r += TOTAL;
      return r;
    }

    function measure() {
      var probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;height:var(--H);pointer-events:none";
      stage.appendChild(probe);
      H = probe.offsetHeight || 220;
      stage.removeChild(probe);
      ws = H * 142 / 840;
      d = H * 474 / 900;
      gap = H * 0.03;
      root.style.setProperty("--ws", ws + "px");
      root.style.setProperty("--d", d + "px");
      root.style.setProperty("--H", H + "px");
    }

    function build() {
      root.innerHTML = "";
      tapes = [];
      lifts = [];
      for (var c = 0; c < COPIES; c++) {
        for (var i = 0; i < N; i++) {
          var book = BOOKS[i];
          var v = c * N + i;
          var el = document.createElement("div");
          el.className = "tape";
          el.dataset.v = String(v);
          el.dataset.i = String(i);
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", book.title);
          var sp = document.createElement("div");
          sp.className = "tape__face tape__sp";
          sp.style.backgroundImage = "url('" + book.cover + "')";
          var lab = document.createElement("span");
          lab.className = "tape__sp-label";
          lab.textContent = book.spine;
          sp.appendChild(lab);
          var cv = document.createElement("div");
          cv.className = "tape__face tape__cv";
          cv.style.backgroundImage = "url('" + book.cover + "')";
          el.appendChild(sp);
          el.appendChild(cv);
          root.appendChild(el);
          tapes.push({ el: el, v: v, i: i, sp: sp, cv: cv });
          lifts[v] = 0;
          (function (vv, ii) {
            el.addEventListener("pointerenter", function () { hover = vv; });
            el.addEventListener("pointerleave", function () { if (hover === vv) hover = -1; });
            el.addEventListener("click", function (e) {
              if (dragMoved) return;
              var r = wrapRel(vv, T);
              if (Math.abs(r) < 0.5) return;
              T = Math.round(T + r);
            });
          })(v, i);
        }
      }
    }

    function setCap(book) {
      if (!cap) return;
      var titleSp = cap.querySelector(".shelf-cap__title span");
      var subSp = cap.querySelector(".shelf-cap__sub span");
      var yearSp = cap.querySelector(".shelf-cap__year span");
      if (titleSp) titleSp.textContent = book.title;
      if (subSp) subSp.textContent = book.sub;
      if (yearSp) yearSp.textContent = book.year;
    }

    var globalScale = 1;

    // Set a book's text fields into the detail panel (no scaling here).
    function paintDetailFields(book) {
      var meta = detail.querySelector('[data-field="meta"]');
      var title = detail.querySelector('[data-field="title"]');
      var body = detail.querySelector('[data-field="body"]');
      var out = detail.querySelector('[data-field="out"]');
      var specs = detail.querySelector('[data-field="specs"]');
      var media = detail.querySelector('[data-field="media"]');
      var link = detail.querySelector('[data-field="link"]');
      meta.textContent = book.meta;
      title.textContent = book.title;
      body.textContent = book.body;
      if (book.out) {
        out.hidden = false;
        out.textContent = book.out;
      } else {
        out.hidden = true;
        out.textContent = "";
      }
      if (book.specs && book.specs.length) {
        specs.hidden = false;
        specs.innerHTML = book.specs.map(function (t) { return "<span>" + t + "</span>"; }).join("");
      } else {
        specs.hidden = true;
        specs.innerHTML = "";
      }
      media.innerHTML = "";
      media.hidden = true;
      if (book.link) {
        link.hidden = false;
        link.href = book.link.href;
        link.textContent = book.link.label;
      } else {
        link.hidden = true;
        link.removeAttribute("href");
        link.textContent = "";
      }
    }

    // One shared scale for every project -> uniform font size (top-aligned, bottoms free).
    function measureGlobalScale() {
      var scroll = detail.querySelector(".shelf-detail__scroll");
      var fit = document.getElementById("shelf-fit");
      if (!scroll || !fit) return;
      var cs = window.getComputedStyle(scroll);
      var padTop = parseFloat(cs.paddingTop) || 0;
      var padBot = parseFloat(cs.paddingBottom) || 0;
      var avail = scroll.clientHeight - padTop - padBot;
      var cur = BOOKS[active];
      var maxNeed = 0;
      fit.style.transform = "scale(1)";
      BOOKS.forEach(function (book) {
        paintDetailFields(book);
        var need = fit.scrollHeight;
        if (need > maxNeed) maxNeed = need;
      });
      paintDetailFields(cur);
      if (maxNeed > avail && avail > 0) {
        globalScale = Math.max(0.7, avail / maxNeed);
      } else {
        globalScale = 1;
      }
    }

    function renderDetail(book) {
      paintDetailFields(book);
      fitDetail();
    }
    function fitDetail() {
      var fit = document.getElementById("shelf-fit");
      if (!fit) return;
      fit.style.transform = "scale(" + globalScale + ")";
    }

    function paint(dt) {
      var k = dragging ? 18 : 5.2;
      if (reduce) {
        s = T;
      } else {
        s += (T - s) * (1 - Math.exp(-k * dt));
        if (Math.abs(T - s) < 1e-4) s = T;
      }
      while (s > N * 2 + 4) { s -= N; T -= N; }
      while (s < N - 4) { s += N; T += N; }

      /* Update copy from target book only — avoid intermediate thrash while shelf springs */
      var idx = ((Math.round(T) % N) + N) % N;
      if (idx !== active) {
        active = idx;
        setCap(BOOKS[active]);
        renderDetail(BOOKS[active]);
      }

      var halfW = stage.clientWidth / 2;
      for (var t = 0; t < tapes.length; t++) {
        var item = tapes[t];
        var r = wrapRel(item.v, s);
        var x = F(r);
        if (Math.abs(x) > halfW + 1.5 * d) {
          item.el.style.visibility = "hidden";
          continue;
        }
        item.el.style.visibility = "visible";
        var o = smoothstep(Math.max(0, 1 - Math.abs(r)));
        var liftTarget = (hover === item.v && Math.abs(r) > 0.5) ? 1 : 0;
        lifts[item.v] += (liftTarget - lifts[item.v]) * (1 - Math.exp(-12 * dt));
        var lift = lifts[item.v];
        var rotY = -90 * o;
        var rotZ = -4.5 * o;
        var z = o * 0.2 * H;
        var y = -o * 0.025 * H - lift * 0.045 * H;
        item.el.style.transform =
          "translate3d(" + x + "px," + y + "px," + z + "px) rotateZ(" + rotZ + "deg) rotateY(" + rotY + "deg)";
        item.el.style.zIndex = String(Math.round(100 - Math.abs(r) * 4));
        item.sp.style.setProperty("--shade", String(o * 0.55));
        item.cv.style.setProperty("--shade", String((1 - o) * 0.5));
      }
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      paint(dt);
      requestAnimationFrame(frame);
    }

    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true;
      dragMoved = false;
      dragX0 = e.clientX;
      dragT0 = T;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX0;
      if (Math.abs(dx) > 5) dragMoved = true;
      if (dragMoved) T = dragT0 - dx / (ws + gap);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      T = Math.round(T);
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      T += delta / (ws + gap) * 0.5;
      lastWheel = performance.now();
      setTimeout(function () {
        if (performance.now() - lastWheel >= 150) T = Math.round(T);
      }, 160);
    }, { passive: false });

    var prev = document.getElementById("shelf-prev");
    var next = document.getElementById("shelf-next");
    if (prev) prev.addEventListener("click", function () { T = Math.round(T) - 1; });
    if (next) next.addEventListener("click", function () { T = Math.round(T) + 1; });

    measure();
    build();
    // seed caption/detail without animation
    active = 0;
    var titleSp = cap.querySelector(".shelf-cap__title span");
    var subSp = cap.querySelector(".shelf-cap__sub span");
    var yearSp = cap.querySelector(".shelf-cap__year span");
    if (titleSp) titleSp.textContent = BOOKS[0].title;
    if (subSp) subSp.textContent = BOOKS[0].sub;
    if (yearSp) yearSp.textContent = BOOKS[0].year;
    measureGlobalScale();
    renderDetail(BOOKS[0]);
    requestAnimationFrame(frame);
    window.addEventListener("resize", function () {
      measure();
      measureGlobalScale();
      fitDetail();
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
      measureGlobalScale();
      fitDetail();
    });
    window.addEventListener("load", function () {
      measureGlobalScale();
      fitDetail();
    });
  })();
})();
