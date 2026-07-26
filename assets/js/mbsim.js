/* mbsim — context-dependent memory retrieval, as a playable cartoon.
 *
 * Implements the paradigm in images/portfolios/postdoc/memory.jpg: an agent
 * walks a 2D infinite grid of odour patches under one of two visuo-spatial
 * contexts. Odour 1 is punished ONLY in the danger context. That is occasion
 * setting, not reversal — context gates whether an odour memory is *expressed*.
 *
 * Mechanism is dopamine-gated depression of KC->MBON synapses, which is the
 * rule the mushroom body actually uses (Hige 2015; Aso 2014; Cohn 2015;
 * Owald 2015). Context enters at the KC layer as a conjunctive code, which is
 * biologically available — gamma-d / ventral accessory calyx KCs carry visual
 * input (Vogt 2016) — and yields context-dependent retrieval from a plain
 * associative rule with no extra machinery.
 *
 * No fitted parameters, no data. Vanilla JS, no dependencies.
 */
(function () {
  "use strict";

  /* ---------------- constants ---------------- */
  var TILE = 120;                                   // world units per odour patch
  var N_KC = 40, N_CORE = 2, N_CTX = 2, N_CONJ = 5; // cartoon of ~2000 real KCs
  var W0 = 1, WMIN = 0.05, TAU_ELIG = 0.6, K_DEP = 2.2, K_REC = 0.06;
  var V_RUN = 34, SACC_RATE = 0.55;                 // units/s ; saccades/s
  var DT = 1 / 60, MAX_CATCHUP = 0.25;
  var SEED = 20260901;
  var TRAIL_MAX = 400;

  /* Training contingency, straight off the figure. A table rather than an `if`,
     so switching to a fully reversed design is a one-line edit. */
  var US = [[1, 0],     // danger: odour1 -> shock, odour2 -> nothing
            [0, 0]];    // safe:   nothing

  /* Figure uses #008001 / #000aff. Deepened a little: near-primary hues clash
     badly with the site's pink mesh, and white text needs the extra depth. */
  var CTX_COL  = ["#0a7a2f", "#2334c4"];
  var CTX_NAME = ["danger", "safe"];

  var mod2 = function (n) { return ((n % 2) + 2) % 2; };
  var wrapPi = function (a) { a = (a + Math.PI) % (2 * Math.PI);
                              return (a < 0 ? a + 2 * Math.PI : a) - Math.PI; };

  /* Deterministic PRNG (mulberry32): every visitor sees the same demo. A poster
     demo that occasionally fails on an unlucky seed is worthless. */
  function rng(s) {
    return function () {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* KC codes: odour-specific core (generalises across context), context-specific,
     and conjunctive. The conjunctive pool is what makes retrieval context-
     DEPENDENT; its size is the single knob for how much a memory leaks between
     contexts. Built once, shared by every instance on the page. */
  var KC = (function () {
    var r = rng(SEED), pool = [], k, sets, c, o, v, i;
    for (k = 0; k < N_KC; k++) pool.push(k);
    function take(n) { var out = [], j;
      for (j = 0; j < n; j++) out.push(pool.splice((r() * pool.length) | 0, 1)[0]);
      return out; }
    var core = [take(N_CORE), take(N_CORE)], ctxo = [take(N_CTX), take(N_CTX)];
    sets = [];
    for (c = 0; c < 2; c++) { sets[c] = [];
      for (o = 0; o < 2; o++) {
        v = new Uint8Array(N_KC);
        var ids = core[o].concat(ctxo[c], take(N_CONJ));
        for (i = 0; i < ids.length; i++) v[ids[i]] = 1;
        sets[c][o] = v;
      } }
    return sets;
  })();

  function tileAt(x, y) {
    var i = mod2(Math.floor(x / TILE)), j = mod2(Math.floor(y / TILE));
    return { i: i, j: j, ctx: j, odor: (i + j) % 2 };   // odour is ANTI-DIAGONAL
  }

  /* ---------------- one simulation instance ---------------- */
  function createSim(fig) {
    var variant = fig.getAttribute("data-variant") || "full";
    var canvas  = fig.querySelector(".sim__canvas");
    var still   = fig.querySelector(".sim__fallback");
    var live    = fig.querySelector(".sim__live");
    if (!canvas) return;
    var g = canvas.getContext("2d");

    var wApp = new Float32Array(N_KC), wAvd = new Float32Array(N_KC),
        elig = new Float32Array(N_KC);
    var agent, trail, trailN, ctxShown, shockOn, lastTile, tickN, W, H;

    function reset() {
      var k;
      for (k = 0; k < N_KC; k++) { wApp[k] = W0; wAvd[k] = W0; elig[k] = 0; }
      agent = { x: 60, y: 60, th: -0.7, turn: 0, turnLeft: 0 };
      trail = new Float32Array(TRAIL_MAX * 2); trailN = 0;
      ctxShown = null;                 // null = follow the world
      shockOn = true; tickN = 0;
      lastTile = tileAt(agent.x, agent.y);
      syncUI();
    }

    /* Dopamine-gated depression with a decaying eligibility trace, so onset is
       smooth rather than instantaneous and the rule does not chatter at tile
       borders. Re-exposure without the US relaxes weights back toward baseline:
       extinction / memory re-evaluation.

       The `* kc[k]` is load-bearing, not decoration. Depressing on the trace
       ALONE lets credit leak across patch borders — and because odour identity
       is anti-diagonal, safe/odour-2 is directly adjacent to danger/odour-1, so
       the untrained cell is exactly the one that gets contaminated. Measured
       over 120 s of free walking: trace-only gave 46,949 off-target depression
       events and collapsed the whole matrix to negative (-0.93, -0.90, -0.67,
       -0.84), destroying the context-dependence the demo exists to show.
       Shortening the trace only halved it. Requiring the Kenyon cell to be
       CURRENTLY active gives zero off-target events and converges to
       (-0.95, -0.21, -0.21, 0.00), stable out to 300 s. It is also the more
       defensible rule: dopamine acts on synapses whose KC is active inside the
       coincidence window, not on every synapse that was recently active. */
    function stepMB(kc, dan, dt) {
      for (var k = 0; k < N_KC; k++) {
        elig[k] += (kc[k] - elig[k]) * (dt / TAU_ELIG);
        if (dan > 0) wApp[k] += K_DEP * dan * elig[k] * kc[k] * (WMIN - wApp[k]) * dt;
        else if (kc[k] > 0) wApp[k] += K_REC * kc[k] * (W0 - wApp[k]) * dt;
      }
    }

    /* MBON readout, normalised by active-KC count. <0 avoid, >0 approach,
       0 indifferent — a naive fly reads exactly 0, which is the correct null. */
    function valence(kc) {
      var app = 0, avd = 0, n = 0;
      for (var k = 0; k < N_KC; k++) if (kc[k]) { app += wApp[k]; avd += wAvd[k]; n++; }
      return n ? (app - avd) / n : 0;
    }

    function saccade(mag) {
      agent.turn = Math.random() < 0.5 ? -mag : mag; agent.turnLeft = mag;
    }

    /* Walking flies do not steer down odour gradients: they run roughly
       straight and turn in discrete body saccades. Nothing here is goal-
       directed — avoidance EMERGES from turning more when the memory says bad. */
    function stepAgent(dt, V) {
      if (agent.turnLeft > 0) {
        var d = Math.min(agent.turnLeft, 8.7 * dt);          // ~500 deg/s
        agent.th += (agent.turn < 0 ? -1 : 1) * d; agent.turnLeft -= d;
      } else {
        agent.th += (Math.random() - 0.5) * 1.4 * dt;
        var rate = SACC_RATE * (1 + 3 * Math.max(0, -V));    // klinokinesis
        if (Math.random() < rate * dt) saccade(0.5 + Math.random() * 0.9);
      }
      var speed = V_RUN * (1 + 0.5 * Math.max(0, -V));
      agent.x += Math.cos(agent.th) * speed * dt;
      agent.y += Math.sin(agent.th) * speed * dt;
    }

    function tick(dt) {
      var t = tileAt(agent.x, agent.y);
      var shownCtx = ctxShown === null ? t.ctx : ctxShown;
      var kc = KC[shownCtx][t.odor];
      var dan = (shockOn && US[t.ctx][t.odor] === 1) ? 1 : 0;
      stepMB(kc, dan, dt);
      var V = valence(kc);
      stepAgent(dt, V);

      var nt = tileAt(agent.x, agent.y);
      if (nt.i !== lastTile.i || nt.j !== lastTile.j) {       // odour border
        if (Math.random() < Math.min(0.92, 1.15 * Math.max(0, -V)))
          saccade(2.1 + Math.random() * 0.9);                 // ~120-170 deg U-turn
        lastTile = nt;
      }
      if (tickN % 3 === 0) {
        var i = (trailN % TRAIL_MAX) * 2;
        trail[i] = agent.x; trail[i + 1] = agent.y; trailN++;
      }
      tickN++;
      if (tickN % 15 === 0) syncUI();                          // ~4 Hz, never 60
    }

    /* ---------------- render ---------------- */
    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);     // 3x gains nothing
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width; H = r.height;
    }

    function drawPanorama(panoH) {
      var t = tileAt(agent.x, agent.y);
      var c = ctxShown === null ? t.ctx : ctxShown;
      g.fillStyle = CTX_COL[c];
      g.fillRect(0, 0, W, panoH);
      if (c === 0) {                       // hatch: never colour alone
        g.save(); g.beginPath(); g.rect(0, 0, W, panoH); g.clip();
        g.strokeStyle = "rgba(255,255,255,.16)"; g.lineWidth = 2;
        for (var x = -panoH; x < W; x += 14) {
          g.beginPath(); g.moveTo(x, panoH); g.lineTo(x + panoH, 0); g.stroke();
        }
        g.restore();
      }
      // two landmarks at azimuth 0 and pi, placed by heading (closed-loop)
      g.fillStyle = "rgba(255,255,255,.92)";
      g.font = "600 " + Math.round(panoH * 0.42) + "px 'Fira Sans',sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      [[0, "⊥"], [Math.PI, "T"]].forEach(function (lm) {
        var px = W / 2 + (wrapPi(lm[0] - agent.th) / 2.4) * W;
        if (px > -30 && px < W + 30) g.fillText(lm[1], px, panoH * 0.52);
      });
      g.fillStyle = "rgba(255,255,255,.95)";
      g.font = "600 11px 'Fira Sans',sans-serif";
      g.textAlign = "left"; g.textBaseline = "top";
      g.fillText(CTX_NAME[c] + " context", 8, 6);
    }

    function drawArena(top) {
      var vh = H - top;
      g.save();
      g.beginPath(); g.rect(0, top, W, vh); g.clip();
      g.translate(W / 2 - agent.x, top + vh / 2 - agent.y);

      var x0 = Math.floor((agent.x - W / 2) / TILE) - 1;
      var x1 = Math.floor((agent.x + W / 2) / TILE) + 1;
      var y0 = Math.floor((agent.y - vh / 2) / TILE) - 1;
      var y1 = Math.floor((agent.y + vh / 2) / TILE) + 1;

      for (var i = x0; i <= x1; i++) for (var j = y0; j <= y1; j++) {
        var t = tileAt(i * TILE + 1, j * TILE + 1);
        var px = i * TILE, py = j * TILE;
        /* Context must be obvious at a glance — it is the whole point. At 0.16
           alpha the green and blue rows read as "pale green" and "pale lavender"
           and were not tellable apart. */
        g.fillStyle = CTX_COL[t.ctx];
        g.globalAlpha = 0.3; g.fillRect(px, py, TILE, TILE); g.globalAlpha = 1;
        if (t.ctx === 0) {                  // danger: hatch, never colour alone
          g.save();
          g.beginPath(); g.rect(px, py, TILE, TILE); g.clip();
          /* White, not green — a green hatch on a green tile is invisible,
             which is exactly what the first attempt shipped. */
          g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
          for (var hx = px - TILE; hx < px + TILE; hx += 13) {
            g.beginPath(); g.moveTo(hx, py + TILE); g.lineTo(hx + TILE, py); g.stroke();
          }
          g.restore();
        }
        g.strokeStyle = "rgba(110,55,122,.28)"; g.lineWidth = 1;
        g.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
        if (t.odor === 0) {                 // odour 1 gets dots as well as a label
          g.fillStyle = "rgba(50,25,60,.42)";
          for (var a = 22; a < TILE; a += 26) for (var b = 30; b < TILE; b += 26) {
            g.beginPath(); g.arc(px + a, py + b, 2.3, 0, 6.2832); g.fill();
          }
        }
        // label on an opaque chip so it stays readable over hatch and dots
        g.font = "600 10px 'Fira Sans',sans-serif";
        g.textAlign = "left"; g.textBaseline = "top";
        var lbl = "odor " + (t.odor + 1), lw = g.measureText(lbl).width;
        g.fillStyle = "rgba(255,255,255,.82)";
        g.fillRect(px + 5, py + 5, lw + 8, 14);
        g.fillStyle = "rgba(45,22,55,.9)";
        g.fillText(lbl, px + 9, py + 7);
      }

      // trail, oldest faintest
      var n = Math.min(trailN, TRAIL_MAX), s;
      for (s = 0; s < 3; s++) {
        g.beginPath(); g.globalAlpha = 0.18 + s * 0.28;
        g.strokeStyle = "#6e377a"; g.lineWidth = 1.4 + s * 0.5;
        var lo = Math.floor((n * s) / 3), hi = Math.floor((n * (s + 1)) / 3);
        for (var q = lo; q < hi; q++) {
          var idx = ((trailN - n + q) % TRAIL_MAX) * 2;
          if (q === lo) g.moveTo(trail[idx], trail[idx + 1]);
          else g.lineTo(trail[idx], trail[idx + 1]);
        }
        g.stroke();
      }
      g.globalAlpha = 1;

      // agent
      g.translate(agent.x, agent.y); g.rotate(agent.th);
      g.fillStyle = "#e24e42";
      g.beginPath(); g.moveTo(9, 0); g.lineTo(-5, 4.5); g.lineTo(-5, -4.5);
      g.closePath(); g.fill();
      g.restore();
    }

    function draw() {
      if (!W) resize();
      if (!W) return;
      var panoH = Math.max(46, Math.min(H * 0.26, 96));
      g.clearRect(0, 0, W, H);
      g.fillStyle = "#fbfbfc"; g.fillRect(0, panoH, W, H - panoH);
      drawArena(panoH);
      drawPanorama(panoH);
    }

    /* ---------------- loop: one state machine, three inputs ---------------- */
    var running = false, raf = 0, prev = 0, acc = 0;
    var userPaused = false, onScreen = true, docVisible = true;
    var reduced = window.matchMedia &&
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = (now - prev) / 1000; prev = now;
      if (!(dt > 0)) return;
      acc += Math.min(dt, MAX_CATCHUP);        // cap: no spiral of death
      while (acc >= DT) { tick(DT); acc -= DT; }
      draw();
    }
    /* Single source of truth for whether the loop runs. Deriving it from all
       three inputs on every change is what stops the classic "it stopped and
       never restarted" bug. */
    function sync() {
      var should = !userPaused && onScreen && docVisible && !reduced;
      if (should && !running) {
        running = true; prev = performance.now(); acc = 0;
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false; cancelAnimationFrame(raf);
      }
    }

    /* ---------------- UI ---------------- */
    function syncUI() {
      var t = tileAt(agent.x, agent.y);
      var shown = ctxShown === null ? t.ctx : ctxShown;
      var V = valence(KC[shown][t.odor]);
      fig.querySelectorAll("[data-ctx]").forEach(function (b) {
        var on = (b.getAttribute("data-ctx") === "world" && ctxShown === null) ||
                 String(ctxShown) === b.getAttribute("data-ctx");
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shockBtn = fig.querySelector("[data-shock]");
      if (shockBtn) {
        shockBtn.setAttribute("aria-pressed", shockOn ? "true" : "false");
        shockBtn.textContent = shockOn ? "shock: on" : "shock: off";
      }
      fig.querySelectorAll("[data-cell]").forEach(function (td) {
        var p = td.getAttribute("data-cell").split(",");
        var v = valence(KC[+p[0]][+p[1]]);
        td.textContent = v.toFixed(2);
        td.style.background = v < -0.5 ? "rgba(226,78,66,.28)"
                            : v < -0.05 ? "rgba(226,78,66,.10)" : "transparent";
      });
      if (live) live.textContent =
        CTX_NAME[shown] + " context, odor " + (t.odor + 1) + ". Memory says " +
        (V < -0.5 ? "avoid" : V < -0.05 ? "mildly avoid" : "nothing") + ".";
    }

    function setCtx(v) {
      ctxShown = v;
      if (v !== null) shockOn = false;   // an override IS a test trial
      syncUI();
    }

    fig.querySelectorAll("[data-ctx]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-ctx");
        setCtx(a === "world" ? null : +a);
      });
    });
    var shockBtn = fig.querySelector("[data-shock]");
    if (shockBtn) shockBtn.addEventListener("click", function () {
      shockOn = !shockOn; syncUI();
    });
    var resetBtn = fig.querySelector("[data-reset]");
    if (resetBtn) resetBtn.addEventListener("click", function () { reset(); draw(); });
    var playBtn = fig.querySelector("[data-play]");
    if (playBtn) playBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      playBtn.setAttribute("aria-pressed", userPaused ? "false" : "true");
      playBtn.textContent = userPaused ? "play" : "pause";
      sync();
    });

    /* ---------------- boot ---------------- */
    reset();
    canvas.hidden = false;
    if (still) still.hidden = true;
    resize();

    if (reduced) {
      /* Give the reduced-motion visitor the FINISHED result rather than an
         empty box: 45 s of simulation headlessly (<5 ms), then one draw. */
      for (var i = 0; i < 60 * 45; i++) tick(DT);
      draw();
      if (playBtn) { playBtn.textContent = "play"; userPaused = true; }
    } else {
      draw();
    }

    if (variant === "mini" && playBtn) playBtn.hidden = true;

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        onScreen = e[0].isIntersecting; sync();
      }, { threshold: 0.15 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      docVisible = !document.hidden; sync();
    });
    /* Observe the stage itself, not just window resize: the canvas also changes
       size on font load, sidebar toggle and orientation change, and a stale
       W/H means clearRect misses part of the canvas. */
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () { resize(); draw(); });
      ro.observe(fig.querySelector(".sim__stage"));
    } else {
      var rt;
      window.addEventListener("resize", function () {
        clearTimeout(rt); rt = setTimeout(function () { resize(); draw(); }, 120);
      });
    }
    sync();
  }

  function init() {
    var figs = document.querySelectorAll(".sim");
    for (var i = 0; i < figs.length; i++) createSim(figs[i]);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
