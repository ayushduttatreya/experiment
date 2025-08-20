import React, { useEffect, useRef, useState } from "react";

// Standalone React + CSS version (no external libs) — drop into any React app (single-file)
// Reasons for this rewrite:
// - Removes external component/icon dependencies that may cause missing imports.
// - Uses simple, compatible `hsl(h, s%, l%)` syntax for broad browser support.
// - Implements breathing, hue, presets, auto-vibe and confetti with plain DOM/React so clicks always work.

export default function AnkitaAestheticApp() {
  const [hue, setHue] = useState(285);
  const [affirmIndex, setAffirmIndex] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Tap to breathe");
  const [autoVibe, setAutoVibe] = useState(false);
  const [notes, setNotes] = useState(["One good thing today…"]);
  const [wishText, setWishText] = useState("");
  const confettiRef = useRef(null);
  const AFFIRMATIONS = [
    "Hey Ankita, you’re doing better than you think.",
    "Tiny steps count. You’re allowed to be soft today.",
    "Your smile could restart the sun.",
    "You’re not behind; you’re becoming.",
    "Storms don’t last; stars do.",
    "You are loved in quiet ways.",
    "The world’s a little brighter with you in it.",
  ];

  const PRESETS = [
    { name: "Lavender", h: 285 },
    { name: "Sunset", h: 14 },
    { name: "Ocean", h: 200 },
    { name: "Rose", h: 330 },
    { name: "Forest", h: 120 },
  ];

  // cycle small affirmations
  useEffect(() => {
    const id = setInterval(() => setAffirmIndex((i) => (i + 1) % AFFIRMATIONS.length), 4200);
    return () => clearInterval(id);
  }, []);

  // auto vibe
  useEffect(() => {
    if (!autoVibe) return;
    const id = setInterval(() => setHue((h) => (h + 1) % 360), 140);
    return () => clearInterval(id);
  }, [autoVibe]);

  // confetti generator (DOM-based, simpler & reliable)
  useEffect(() => {
    if (!confetti) return;
    const node = confettiRef.current;
    if (!node) return;

    const pieces = 60;
    const created = [];
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement("span");
      el.className = "confetti-piece";
      const left = Math.random() * 100;
      const offset = Math.floor((Math.random() - 0.5) * 80);
      const h = Math.round((hue + Math.random() * 60 - 30 + 360) % 360);
      el.style.left = `${left}%`;
      el.style.background = `hsl(${h}, 75%, ${50 + Math.random() * 10}%)`;
      el.style.transform = `translateY(-10px) rotate(${Math.random() * 360}deg)`;
      node.appendChild(el);
      created.push(el);

      // trigger fall
      requestAnimationFrame(() => {
        el.style.top = `${100 + Math.random() * 20}%`;
        el.style.transform = `translateY(0) rotate(${Math.random() * 720}deg)`;
        el.style.opacity = "1";
      });
    }

    // clear after animation
    const t = setTimeout(() => {
      created.forEach((c) => c.remove());
      setConfetti(false);
    }, 2300);

    return () => {
      clearTimeout(t);
      created.forEach((c) => c.remove());
    };
  }, [confetti, hue]);

  // breathing logic: 3 rounds of 4-7-8
  useEffect(() => {
    let cancelled = false;
    if (!breathing) {
      setBreathPhase("Tap to breathe");
      return;
    }

    const seq = [
      { name: "Inhale", secs: 4 },
      { name: "Hold", secs: 7 },
      { name: "Exhale", secs: 8 },
    ];

    (async () => {
      for (let round = 0; round < 3 && !cancelled; round++) {
        for (const step of seq) {
          if (cancelled) return;
          setBreathPhase(step.name);
          // wait
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, step.secs * 1000));
        }
      }
      if (!cancelled) {
        setBreathPhase("Done ✨");
        setBreathing(false);
        setTimeout(() => setBreathPhase("Tap to breathe"), 1200);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [breathing]);

  const addNote = (v) => {
    if (!v) return;
    setNotes((n) => [v, ...n]);
  };

  const launchWish = () => {
    // small visual: temporarily show a launched star element
    const node = confettiRef.current;
    if (!node) return;
    const el = document.createElement("div");
    el.className = "wish-launch";
    el.textContent = "🌠";
    node.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(-320px) translateX(180px)`;
      el.style.opacity = "1";
    });
    setTimeout(() => el.remove(), 1400);
  };

  const toggleBreath = () => {
    setBreathing((b) => !b);
  };

  return (
    <div className="ankita-root" style={{ ['--hue']: hue }}>
      <style>{`
        :root { --h: ${hue}; }
        .ankita-root{font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; min-height:100vh; color:white; background: linear-gradient(180deg, #0f1724 0%, #06060a 100%); overflow:hidden;}
        .container{max-width:1000px;margin:36px auto;padding:20px;position:relative;z-index:5}
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
        .title{font-size:20px;font-weight:700}
        .subtitle{font-size:12px;color:rgba(255,255,255,0.7)}

        /* Blobs */
        .blob{position:absolute;border-radius:50%;filter:blur(40px);opacity:0.7;transition:background 500ms ease, transform 900ms ease}
        .blob.a{width:360px;height:360px;left:-80px;top:-80px;background:radial-gradient(circle at 40% 40%, hsl(${hue},74%,56%), transparent)}
        .blob.b{width:420px;height:420px;right:-120px;top:20%;background:radial-gradient(circle at 50% 50%, hsl(${(hue+40)%360},74%,56%), transparent)}
        .blob.c{width:380px;height:380px;left:20%;bottom:-120px;background:radial-gradient(circle at 50% 50%, hsl(${(hue+320)%360},74%,56%), transparent)}

        /* Controls */
        .controls{display:flex;gap:8px;align-items:center}
        button.simple{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.06);padding:8px 12px;border-radius:10px;color:white;cursor:pointer}
        button.preset{width:30px;height:30px;border-radius:999px;border:1px solid rgba(255,255,255,0.08);cursor:pointer}

        .card{background:rgba(255,255,255,0.04);border-radius:16px;padding:18px;margin-bottom:14px;border:1px solid rgba(255,255,255,0.06)}

        /* breathing ring */
        .ring{width:160px;height:160px;border-radius:999px;border:6px solid rgba(255,255,255,0.18);display:grid;place-items:center;box-shadow:0 8px 30px rgba(0,0,0,0.6);transition:box-shadow 300ms, border-color 300ms}
        .ring .center{font-size:14px;color:rgba(255,255,255,0.9)}
        .ring.breathing{animation:breath 19s linear infinite}
        @keyframes breath{
          0%{transform:scale(1)}
          21%{transform:scale(1.15)}
          50%{transform:scale(0.95)}
          79%{transform:scale(1.08)}
          100%{transform:scale(1)}
        }

        /* confetti pieces (DOM created) */
        .confetti-area{position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:40}
        .confetti-piece{position:absolute;top:-10px;width:10px;height:10px;border-radius:2px;opacity:0;transition:top 2.2s cubic-bezier(.2,.8,.2,1),transform 2.2s linear,opacity .9s}

        /* wish */
        .wish-launch{position:absolute;right:20px;bottom:20px;font-size:22px;opacity:0;transform:translateY(0);transition:transform 1.2s ease,opacity .3s}

        /* tiles */
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
        .tile{background:rgba(255,255,255,0.03);border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,0.04)}

        .notes{display:flex;flex-direction:column;gap:8px}
        .note{background:rgba(255,255,255,0.04);padding:8px;border-radius:8px;font-size:13px}

        /* small responsive */
        @media (max-width:820px){.grid{grid-template-columns:1fr}.container{padding:16px}}
      `}</style>

      {/* background blobs */}
      <div className="blob a" style={{ background: `radial-gradient(circle at 40% 40%, hsl(${hue}, 74%, 56%), transparent)` }} />
      <div className="blob b" style={{ background: `radial-gradient(circle at 50% 50%, hsl(${(hue + 40) % 360}, 74%, 56%), transparent)` }} />
      <div className="blob c" style={{ background: `radial-gradient(circle at 50% 50%, hsl(${(hue + 320) % 360}, 74%, 56%), transparent)` }} />

      <div className="confetti-area" ref={confettiRef} />

      <div className="container">
        <div className="header">
          <div>
            <div className="subtitle">for</div>
            <div className="title">Ankita’s Pocket of Calm</div>
          </div>

          <div className="controls">
            <button className="simple" onClick={() => setHue((h) => (h + 30) % 360)}>vibe</button>
            <button className="simple" onClick={() => setConfetti(true)}>instant sunshine</button>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset"
                title={p.name}
                onClick={() => setHue(p.h)}
                style={{ background: `hsl(${p.h},74%,56%)` }}
              />
            ))}
            <button className="simple" onClick={() => setAutoVibe((a) => !a)}>{autoVibe ? 'auto on' : 'auto off'}</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Hi Ankita — take a slow breath. You’re safe here.</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>A tiny interactive space that glows with you. Tap a button, nudge the hue, or do a calm breath. Soft edges, kind words, zero pressure.</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="simple" onClick={toggleBreath}>{breathing ? 'stop breath' : 'start calm breath'}</button>
              <button className="simple" onClick={() => setAffirmIndex((i) => (i + 1) % AFFIRMATIONS.length)}>new gentle line</button>
              <button className="simple" onClick={() => setConfetti(true)}>surprise</button>
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Mood Hue</div>
              <input type="range" min={0} max={360} value={hue} onChange={(e) => setHue(parseInt(e.target.value))} style={{ width: 260 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: `hsl(${hue},74%,56%)` }} />
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{`h:${hue}`}</div>
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.9)' }}>{AFFIRMATIONS[affirmIndex]}</div>
          </div>

          <div style={{ width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className={`ring ${breathing ? 'breathing' : ''}`} style={{ borderColor: `hsl(${hue}, 80%, 70%)`, boxShadow: `0 12px 40px hsla(${hue}, 80%, 40%, 0.25)` }}>
              <div className="center">{breathing ? breathPhase : 'Tap to breathe'}</div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Try the 4–7–8 breath — repeats 3 times</div>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 18 }}>
          <div className="tile">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Pocket Compliments</div>
            <div style={{ marginBottom: 8 }}>{AFFIRMATIONS[affirmIndex]}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="simple" onClick={() => setAffirmIndex((i) => (i + 1) % AFFIRMATIONS.length)}>more kindness</button>
            </div>
          </div>

          <div className="tile">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Wish Upon a Star</div>
            <input value={wishText} onChange={(e) => setWishText(e.target.value)} placeholder="type a tiny wish…" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="simple" onClick={() => { launchWish(); setWishText(''); }}>launch star</button>
            </div>
          </div>

          <div className="tile">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Glow Notes</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input id="glow" placeholder="add a tiny glow note…" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'white' }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.currentTarget.value.trim(); if (v) { addNote(v); e.currentTarget.value = ''; } } }} />
              <button className="simple" onClick={() => { const input = document.getElementById('glow'); const v = input.value.trim(); if (v) { addNote(v); input.value = ''; } }}>add</button>
            </div>
            <div className="notes">
              {notes.map((n, i) => (
                <div className="note" key={i}>{n}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>made with a lot of ☕ and care — if this brightened even 1%, it worked.</div>
      </div>
    </div>
  );
}
