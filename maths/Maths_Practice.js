// ============ Storage ============
const LS = {
    settingsKey: 'maths.settings',
    statsKey: 'maths.stats',
    weakKey: 'maths.weak',
    // storage key kept as 'failed' for backward-compat; the array now holds ALL question outcomes
    logKey: 'maths.failed',
    load(k, def) {
        try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; }
        catch { return def; }
    },
    save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};

const defaultSettings = {
    ops: ['+', '-', '*'],
    difficulty: 'easy',
    length: 20,
    modes: ['type', 'choice', 'truefalse'],
    sound: true,
    iconPrimary: '🐬',
    allowNegative: false,
    childName: '',
    starMax: 5,
    starStep: 1,
    parentPassword: '12345',
};

const DEFAULT_CERT_NAME = 'Champion';
const APP_NAME = 'Maths Champions';

const defaultStats = { totalStars: 0, bestStreak: 0, played: 0, correct: 0, wrong: 0 };

let settings = { ...defaultSettings, ...LS.load(LS.settingsKey, {}) };
let stats = { ...defaultStats, ...LS.load(LS.statsKey, {}) };
let weak = LS.load(LS.weakKey, []);
let log = LS.load(LS.logKey, []);

function persist() {
    LS.save(LS.settingsKey, settings);
    LS.save(LS.statsKey, stats);
    LS.save(LS.weakKey, weak);
    LS.save(LS.logKey, log);
}

// ============ Settings gate (in-app masked modal) ============
let settingsUnlocked = false;
let passCallback = null;

function lockSettings() { settingsUnlocked = false; }

function openPasswordModal(action) {
    passCallback = action;
    quietMode = true;
    const modal = document.getElementById('modal-backdrop');
    const input = document.getElementById('pass-input');
    const msg = document.getElementById('pass-msg');
    if (input) input.value = '';
    if (msg) msg.style.display = 'none';
    if (modal) modal.hidden = false;
    setTimeout(() => { if (input) input.focus(); }, 30);
}
function closePasswordModal() {
    const modal = document.getElementById('modal-backdrop');
    if (modal) modal.hidden = true;
    passCallback = null;
    // if success path leads to Settings, show('setup') will re-set quietMode true; otherwise silence off
    if (document.getElementById('screen-setup').hidden) quietMode = false;
}
function tryPassword() {
    const input = document.getElementById('pass-input');
    const msg = document.getElementById('pass-msg');
    const expected = settings.parentPassword || defaultSettings.parentPassword;
    if (input && input.value === expected) {
        settingsUnlocked = true;
        const cb = passCallback;
        closePasswordModal();
        if (cb) cb();
    } else {
        if (msg) msg.style.display = 'block';
    }
}

function requireSettingsAccess(action) {
    if (settingsUnlocked) return action();
    openPasswordModal(action);
}

function resetAllData() {
    if (!window.confirm('Erase ALL saved stars, streaks, tricky facts, question log, and settings? This cannot be undone.')) return;
    try {
        localStorage.removeItem(LS.settingsKey);
        localStorage.removeItem(LS.statsKey);
        localStorage.removeItem(LS.weakKey);
        localStorage.removeItem(LS.logKey);
    } catch { }
    // hard reload so every module re-reads defaults from a clean slate
    location.reload();
}

function recordEntry(q, meta) {
    log.unshift({
        op: q.op, a: q.a, b: q.b, ans: q.ans,
        ok: !!meta.ok,
        attempts: meta.attempts || 0,
        usedHint: !!meta.usedHint,
        shownAnswer: !!meta.shownAnswer,
        skipped: !!meta.skipped,
        given: meta.given,
        wrongAnswers: Array.isArray(meta.wrongAnswers) ? meta.wrongAnswers.slice() : [],
        stars: meta.stars || 0,
        streak: meta.streak || 0,
        mul: meta.mul || 1,
        mode: meta.mode || (session ? session.currentMode : null),
        when: Date.now(),
    });
    if (log.length > 500) log.length = 500;
}

// ============ Streak multiplier ============
// Reward long correct-in-a-row runs so kids get big stars.
function streakMultiplier(streak) {
    if (streak >= 20) return 10;
    if (streak >= 15) return 6;
    if (streak >= 10) return 4;
    if (streak >= 5) return 2;
    return 1;
}

// ============ Icons ============
const ICON_GROUPS = {
    '🐬': ['🐬','🐟','🐙','🦈','🦑','🐳','🐡','🦞','🦐','🐚','🪼','🦭'],
    '🌸': ['🌸','🌺','🌻','🌷','🌼','💐','🌹','🏵','🪷','🪻','🪴','🍀'],
    '🐝': ['🐝','🐞','🦋','🐛','🐜','🦟','🦗','🕷','🪲','🪳','🦂','🐌'],
    '🍎': ['🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍑','🥭','🍒','🍐','🥝'],
    '⭐': ['⭐','🌙','☀️','⚡','🌈','💫','🌟','✨','🪩','☄️','🌞','🌝'],
    '🐱': ['🐱','🐶','🐰','🐭','🐹','🐻','🐼','🦊','🐨','🐯','🐮','🐷'],
    '🚗': ['🚗','✈️','🚐','🚕','🚌','🚓','🚑','🚒','🚚','🚜','🚙','🏍️'],
};
const ICON_CHOICES = Object.keys(ICON_GROUPS);

function iconGroup() {
    return ICON_GROUPS[settings.iconPrimary] || ICON_GROUPS['🐬'];
}

function pickIcons(n) {
    const pool = iconGroup().slice();
    const out = [];
    for (let i = 0; i < n; i++) {
        if (pool.length) {
            const idx = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(idx, 1)[0]);
        } else {
            out.push(out[out.length - 1] || iconGroup()[0]);
        }
    }
    return out;
}

// ============ Audio (WebAudio, on-demand) ============
let ac = null;
let quietMode = false;   // suppress click sound while on Settings / password modal
function audio() {
    if (!settings.sound) return null;
    if (!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); }
        catch { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => { });
    return ac;
}
function tone(freq, dur, type = 'sine', gain = 0.15, when = 0) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(a.destination);
    const t = a.currentTime + when;
    o.start(t); o.stop(t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
const sfx = {
    click() { if (quietMode) return; tone(600, 0.04, 'square', 0.05); },
    correct() { tone(660, 0.12, 'sine', 0.2); tone(880, 0.18, 'sine', 0.2, 0.1); },
    wrong() { tone(180, 0.25, 'sawtooth', 0.15); },
    level() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.15, 'triangle', 0.18, i * 0.09)); },
};

// ============ Question generation ============
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function rangesFor(op, diff) {
    if (op === '*') {
        if (diff === 'easy') return [0, 9, 0, 9];
        if (diff === 'medium') return [0, 12, 0, 9];
        return [0, 19, 0, 9];
    }
    if (op === '/') {
        if (diff === 'easy') return [0, 9, 1, 9];
        if (diff === 'medium') return [0, 12, 1, 10];
        return [0, 15, 1, 12];
    }
    if (diff === 'easy') return [0, 9, 0, 9];
    if (diff === 'medium') return [0, 19, 0, 9];
    return [10, 99, 10, 99];
}

function pickFromWeak() {
    if (!weak.length) return null;
    const total = weak.reduce((s, w) => s + w.misses, 0);
    let r = Math.random() * total;
    for (const w of weak) { r -= w.misses; if (r <= 0) return w; }
    return weak[weak.length - 1];
}

function makeQuestion(focusWeak = false) {
    const src = focusWeak ? pickFromWeak() : null;
    const ops = settings.ops.length ? settings.ops : ['+'];
    const op = src ? src.op : ops[rng(0, ops.length - 1)];

    if (op === '/') {
        if (src) return { a: src.a, b: src.b, op, ans: src.a / src.b };
        const [qMin, qMax, bMin, bMax] = rangesFor('/', settings.difficulty);
        const b = rng(Math.max(1, bMin), Math.max(1, bMax));
        const q = rng(qMin, qMax);
        return { a: b * q, b, op, ans: q };
    }

    const [minA, maxA, minB, maxB] = rangesFor(op, settings.difficulty);
    let a = src ? src.a : rng(minA, maxA);
    let b = src ? src.b : rng(minB, maxB);
    if (op === '-' && !settings.allowNegative && b > a) [a, b] = [b, a];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { a, b, op, ans };
}

function opSym(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

function distractors(q) {
    const set = new Set([q.ans]);
    const allowNeg = !!settings.allowNegative;
    const push = v => {
        if (!allowNeg && v < 0) return;
        if (!set.has(v)) set.add(v);
    };
    push(q.ans + 1); push(q.ans - 1); push(q.ans + 2); push(q.ans - 2);
    if (q.op === '+') push(Math.abs(q.a - q.b));
    if (q.op === '-') push(q.a + q.b);
    if (q.op === '*') { push(q.a + q.b); push(q.ans + q.a); push(q.ans - q.a); }
    if (q.op === '/') { push(q.a - q.b); push(q.ans + q.b); push(q.b); }
    let guard = 0;
    while (set.size < 8 && guard++ < 30) push(q.ans + rng(-5, 5));
    const arr = [...set].filter(v => v !== q.ans);
    arr.sort(() => Math.random() - 0.5);
    return arr.slice(0, 3);
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ============ Weak facts ============
function factKey(op, a, b) {
    if (op === '+' || op === '*') { if (a > b) [a, b] = [b, a]; }
    return `${op}:${a}x${b}`;
}
function markWeak(q) {
    const key = factKey(q.op, q.a, q.b);
    let w = weak.find(w => factKey(w.op, w.a, w.b) === key);
    if (!w) { w = { op: q.op, a: q.a, b: q.b, misses: 0 }; weak.push(w); }
    w.misses++;
    if (weak.length > 40) { weak.sort((x, y) => y.misses - x.misses); weak = weak.slice(0, 40); }
}
function cleanWeak(q) {
    const key = factKey(q.op, q.a, q.b);
    const i = weak.findIndex(w => factKey(w.op, w.a, w.b) === key);
    if (i >= 0) {
        weak[i].misses = Math.max(0, weak[i].misses - 1);
        if (weak[i].misses === 0) weak.splice(i, 1);
    }
}

// ============ Session ============
let session = null;
function starMax() { return Math.max(1, parseInt(settings.starMax, 10) || 5); }
function starStep() { return Math.max(1, parseInt(settings.starStep, 10) || 1); }

function newSession(opts = {}) {
    session = {
        target: settings.length === 'endless' ? Infinity : settings.length,
        index: 0, correct: 0, wrong: 0,
        streak: 0, bestStreak: 0,
        starsEarned: 0,
        perfectCorrect: 0,
        startedAt: Date.now(),
        history: [],
        missed: [],
        focusWeak: !!opts.focusWeak,
        current: null,
        currentMode: null,
        currentStars: starMax(),
        attempts: 0,
        answered: false,
        usedHint: false,
        wrongAnswers: [],
        tfExpected: null,
        clearInput: null,
        keydown: null,
    };
    nextQuestion();
}

function nextQuestion() {
    removeKeypadKeys();
    // close hint modal if it was left open
    const hm = document.getElementById('hint-modal-backdrop');
    if (hm) hm.hidden = true;
    const qt = document.getElementById('q-text');
    const qb = document.getElementById('q-body');
    const pa = document.querySelector('.play-actions');
    if (qt) qt.style.display = '';
    if (qb) qb.style.display = '';
    if (pa) pa.style.display = '';
    if (session.index >= session.target) return endSession();
    session.index++;
    session.attempts = 0;
    session.answered = false;
    session.usedHint = false;
    session.wrongAnswers = [];
    session.currentStars = starMax();
    session.current = makeQuestion(session.focusWeak && weak.length > 0);
    const enabled = settings.modes.length ? settings.modes : ['type'];
    session.currentMode = enabled[rng(0, enabled.length - 1)];
    renderPlay();
}

// ============ UI helpers ============
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function show(id) {
    ['home', 'setup', 'play', 'end'].forEach(s => {
        const el = $('#screen-' + s);
        if (el) el.hidden = (s !== id);
    });
    $('#hud').hidden = (id !== 'play');
    if (id !== 'setup') lockSettings();
    quietMode = (id === 'setup');
}

function updateHud() {
    const mul = streakMultiplier(session.streak);
    $('#hud-score').textContent = `⭐ ${session.starsEarned}`;
    $('#hud-streak').textContent = `🔥 ${session.streak}${mul > 1 ? ` ×${mul}` : ''}`;
    $('#hud-progress').textContent = session.target === Infinity
        ? `#${session.index}`
        : `${session.index}/${session.target}`;
    const pct = session.target === Infinity
        ? Math.min(100, session.correct * 2)
        : ((session.index - 1) / session.target) * 100;
    $('#bar').style.width = pct + '%';
}

function mascotFor() {
    if (session.streak >= 10) return '🤩';
    if (session.streak >= 5) return '😃';
    if (session.streak >= 3) return '🙂';
    return '🐣';
}

function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 900);
}

// ============ Rendering ============
function renderPlay() {
    updateHud();
    $('#play-mascot').textContent = mascotFor();
    $('#hint-slot').innerHTML = '';
    $('#hint-slot').scrollTop = 0;
    const q = session.current;
    const sym = opSym(q.op);
    const body = $('#q-body');
    body.innerHTML = '';

    if (session.currentMode === 'type') {
        $('#q-text').innerHTML =
            `<span class="a">${q.a}</span> <span class="op">${sym}</span> ` +
            `<span class="b">${q.b}</span> = <span class="blank">?</span>`;
        body.innerHTML = `
            <div style="text-align:center;">
                <div class="type-answer" id="type-answer">·</div>
            </div>
            <div class="keypad" id="keypad"></div>
        `;
        buildKeypad();
    } else if (session.currentMode === 'choice') {
        $('#q-text').innerHTML =
            `<span class="a">${q.a}</span> <span class="op">${sym}</span> ` +
            `<span class="b">${q.b}</span> = <span class="blank">?</span>`;
        const total = Math.min(9, Math.max(2, parseInt(settings.numChoices, 10) || 4));
        const opts = shuffle([q.ans, ...distractors(q, total - 1)]);
        const cols = total >= 7 ? 3 : (total >= 5 ? 3 : 2);
        body.innerHTML = `<div class="choices" style="grid-template-columns: repeat(${cols}, 1fr);">${opts.map((v, i) =>
            `<button class="choice c${i % 4}" data-val="${v}">${v}</button>`).join('')
            }</div>`;
        $$('#q-body .choice').forEach(b => b.addEventListener('click', () => {
            if (session.answered || b.disabled) return;
            sfx.click();
            const val = parseInt(b.dataset.val, 10);
            session.attempts++;
            if (val === q.ans) {
                session.answered = true;
                onCorrect(b);
            } else {
                session.wrongAnswers.push(val);
                session.currentStars = Math.max(1, session.currentStars - starStep());
                b.disabled = true;
                b.classList.add('flash-wrong');
                b.style.opacity = 0.4;
                sfx.wrong();
                $('#play-mascot').textContent = '🤔';
            }
        }));
    } else {
        const isTrue = Math.random() < 0.5;
        let shown;
        if (isTrue) shown = q.ans;
        else {
            let delta, tries = 0;
            do {
                delta = (Math.random() < 0.5 ? -1 : 1) * rng(1, 3);
                tries++;
            } while (!settings.allowNegative && q.ans + delta < 0 && tries < 10);
            shown = q.ans + delta;
            if (!settings.allowNegative && shown < 0) shown = q.ans + Math.abs(delta);
            if (shown === q.ans) shown = q.ans + 1;
        }
        session.tfExpected = (shown === q.ans) ? 1 : 0;
        $('#q-text').innerHTML =
            `<span class="a">${q.a}</span> <span class="op">${sym}</span> ` +
            `<span class="b">${q.b}</span> = <span class="b">${shown}</span>`;
        body.innerHTML = `
            <div class="tf">
                <button class="btn accent" data-tf="1">✅ Yes</button>
                <button class="btn" data-tf="0" style="background:var(--primary)">❌ No</button>
            </div>`;
        $$('#q-body [data-tf]').forEach(b => b.addEventListener('click', () => {
            if (session.answered) return;
            sfx.click();
            session.attempts++;
            session.answered = true;
            const gave = parseInt(b.dataset.tf, 10);
            const ok = gave === session.tfExpected;
            if (ok) onCorrect(b);
            else {
                session.wrongAnswers.push(gave === 1 ? 'Yes' : 'No');
                session.currentStars = 0;
                session.streak = 0;
                session.wrong++;
                stats.wrong++;
                session.missed.push({ ...q });
                markWeak(q);
                recordEntry(q, { ok: false, attempts: session.attempts, usedHint: session.usedHint, given: gave, wrongAnswers: session.wrongAnswers });
                persist();
                sfx.wrong();
                showAnswerAndPause();
            }
        }));
    }
}

function buildKeypad() {
    const kp = $('#keypad');
    const withSign = !!settings.allowNegative;
    const rows = withSign
        ? [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['sign', '0', 'back'], ['ok-wide']]
        : [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['back', '0', 'ok']];

    const cells = [];
    rows.forEach(r => r.forEach(k => {
        if (k === 'ok') cells.push(`<button class="key ok" data-k="ok">✓</button>`);
        else if (k === 'ok-wide') cells.push(`<button class="key ok wide" data-k="ok">✓</button>`);
        else if (k === 'back') cells.push(`<button class="key back" data-k="back">⌫</button>`);
        else if (k === 'sign') cells.push(`<button class="key" data-k="sign">±</button>`);
        else cells.push(`<button class="key" data-k="${k}">${k}</button>`);
    }));
    kp.innerHTML = cells.join('');

    let buffer = '';
    const ans = $('#type-answer');
    const render = () => { ans.textContent = buffer || '·'; };
    session.clearInput = () => { buffer = ''; render(); };
    const digitCount = () => buffer.replace('-', '').length;

    kp.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (session.answered) return;
        sfx.click();
        const k = b.dataset.k;
        if (k === 'back') { buffer = buffer.slice(0, -1); render(); return; }
        if (k === 'sign' && withSign) {
            buffer = buffer.startsWith('-') ? buffer.slice(1) : '-' + buffer;
            render();
            return;
        }
        if (k === 'ok') {
            if (!buffer || buffer === '-') return;
            handleTypeAnswer(parseInt(buffer, 10), ans);
            return;
        }
        if (digitCount() >= 4) return;
        buffer += k; render();
    });

    session.keydown = (e) => {
        if (session.answered) return;
        if (/^[0-9]$/.test(e.key) && digitCount() < 4) { buffer += e.key; sfx.click(); render(); }
        else if (e.key === 'Backspace') { buffer = buffer.slice(0, -1); render(); }
        else if (e.key === '-' && withSign) {
            buffer = buffer.startsWith('-') ? buffer.slice(1) : '-' + buffer;
            render();
        }
        else if (e.key === 'Enter' && buffer && buffer !== '-') {
            handleTypeAnswer(parseInt(buffer, 10), ans);
        }
    };
    window.addEventListener('keydown', session.keydown);
}

function removeKeypadKeys() {
    if (session && session.keydown) {
        window.removeEventListener('keydown', session.keydown);
        session.keydown = null;
    }
}

// ============ Answer handling ============
function handleTypeAnswer(given, el) {
    if (session.answered) return;
    session.attempts++;
    const q = session.current;
    if (given === q.ans) {
        session.answered = true;
        return onCorrect(el);
    }
    session.wrongAnswers.push(given);
    session.currentStars = Math.max(1, session.currentStars - starStep());
    sfx.wrong();
    if (el && el.classList) el.classList.add('flash-wrong');
    $('#play-mascot').textContent = '🤔';
    setTimeout(() => {
        if (el && el.classList) el.classList.remove('flash-wrong');
        if (session.clearInput) session.clearInput();
    }, 400);
}

const PRAISE = ['Nice!', 'Yes!', 'Wow!', 'Great!', 'Amazing!', 'Boom!', 'Star!'];

function onCorrect(el) {
    const q = session.current;
    session.streak++;
    const mul = streakMultiplier(session.streak);
    const stars = Math.max(0, session.currentStars * mul);
    session.correct++;
    session.starsEarned += stars;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    if (session.attempts === 1 && !session.usedHint) {
        cleanWeak(q);
        session.perfectCorrect++;
    }
    stats.correct++;
    stats.totalStars += stars;
    stats.bestStreak = Math.max(stats.bestStreak, session.streak);
    recordEntry(q, {
        ok: true, attempts: session.attempts, usedHint: session.usedHint,
        stars, streak: session.streak, mul,
        wrongAnswers: session.wrongAnswers
    });
    persist();
    sfx.correct();
    if (el && el.classList) el.classList.add('flash-correct');
    $('#play-mascot').textContent = mascotFor();
    const hintTag = session.usedHint ? ' 💡' : '';
    const mulTag = mul > 1 ? ` ×${mul}!` : '';
    toast(`+${stars} ⭐${mulTag}  ${PRAISE[rng(0, PRAISE.length - 1)]}${hintTag}`);
    const milestone = [3, 5, 10, 15, 20].includes(session.streak) ||
        [10, 25, 50, 100].includes(session.correct);
    if (milestone) { sfx.level(); confettiBurst(); }
    setTimeout(nextQuestion, 750);
}

// ============ Reveal / Show Answer ============
function enterLearnMode() {
    const qb = document.getElementById('q-body');
    const pa = document.querySelector('.play-actions');
    if (qb) qb.style.display = 'none';
    if (pa) pa.style.display = 'none';
}

function showAnswerAndPause() {
    enterLearnMode();
    // hide any open hint modal so the reveal stays in focus
    const hm = document.getElementById('hint-modal-backdrop');
    if (hm) hm.hidden = true;
    showHint(true);
    const slot = $('#hint-slot');
    const box = document.createElement('div');
    box.className = 'hint learn-box';
    box.innerHTML = `
        <div>Take a moment to remember this one. 🧠</div>
        <div style="margin-top:10px;">
            <button class="btn accent" id="btn-next">Next ▶</button>
        </div>
    `;
    slot.appendChild(box);
    slot.scrollTop = slot.scrollHeight;
    $('#btn-next').addEventListener('click', () => {
        sfx.click();
        nextQuestion();
    });
}

// ============ Hints (visual only, no numeric answer unless reveal=true) ============
function iconSpans(count, icon, cls) {
    let out = '';
    for (let i = 0; i < count; i++) out += `<span${cls ? ` class="${cls}"` : ''}>${icon}</span>`;
    return out;
}

function addHintVisual(a, b) {
    if (a + b > 24) {
        return `<div class="hint">Count on from the bigger number. Add tens first, then ones. 🧮</div>`;
    }
    const [p, s] = pickIcons(2);
    return `
        <div class="iconrow">
            ${iconSpans(a, p)}
            <span class="connector">+</span>
            ${iconSpans(b, s)}
        </div>
        <div class="hint">Count them all! 🧮</div>`;
}

function subHintVisual(a, b) {
    if (a < b) return `<div class="hint">You're taking away more than you have — the answer is below zero.</div>`;
    if (a > 24) return `<div class="hint">Take away tens first, then ones. 🧮</div>`;
    const [p] = pickIcons(1);
    let items = '';
    for (let i = 0; i < a; i++) {
        const cls = i >= a - b ? 'cross' : '';
        items += `<span${cls ? ` class="${cls}"` : ''}>${p}</span>`;
    }
    return `
        <div class="iconrow">${items}</div>
        <div class="hint">Start with ${a}, cross out ${b}. Count what's left! 🧮</div>`;
}

function mulHintVisual(rows, cols) {
    if (rows === 0 || cols === 0) return `<div class="hint">Anything times zero is nothing. 🌟</div>`;
    if (rows * cols > 30) return `<div class="hint">Think of it as ${rows} rows of ${cols}. Count carefully! 🧮</div>`;
    const icons = pickIcons(rows);
    const style = `grid-template-columns: repeat(${cols}, auto);`;
    let cells = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) cells += `<span>${icons[r]}</span>`;
    }
    return `
        <div class="icongrid" style="${style}">${cells}</div>
        <div class="hint">${rows} rows of ${cols}. Count them all! 🧮</div>`;
}

function divHintVisual(a, b) {
    if (b === 0 || a === 0 || a > 30) {
        return `<div class="hint">Share ${a} into ${b} equal groups. How many in each? 🧮</div>`;
    }
    const q = a / b;
    if (!Number.isInteger(q)) {
        return `<div class="hint">Share ${a} into ${b} equal groups.</div>`;
    }
    const icons = pickIcons(b);
    const groups = [];
    for (let g = 0; g < b; g++) {
        let inner = '';
        for (let k = 0; k < q; k++) inner += `<span>${icons[g]}</span>`;
        groups.push(`<div class="igroup">${inner}</div>`);
    }
    return `
        <div class="icongroups">${groups.join('')}</div>
        <div class="hint">Look at ${b} groups. How many in each? 🧮</div>`;
}

function showHint(reveal = false, target = null) {
    if (!session || !session.current) return;
    const q = session.current;
    let html = '';
    if (q.op === '+') html += addHintVisual(q.a, q.b);
    else if (q.op === '-') html += subHintVisual(q.a, q.b);
    else if (q.op === '*') html += mulHintVisual(q.a, q.b);
    else if (q.op === '/') html += divHintVisual(q.a, q.b);
    if (reveal) {
        html += `<div class="hint" style="background:#ffe8e8;">Answer: <b style="font-size:1.4em;">${q.ans}</b> 🌟</div>`;
    }
    const el = target || $('#hint-slot');
    if (el) el.innerHTML = html;
}

// ============ End of session ============
function endSession() {
    show('end');
    stats.played++;
    persist();
    const dur = Math.round((Date.now() - session.startedAt) / 1000);
    const asked = session.correct + session.wrong;
    const acc = asked ? Math.round(session.perfectCorrect / asked * 100) : 0;
    $('#end-mascot').textContent = acc >= 90 ? '🏆' : acc >= 70 ? '🥳' : acc >= 50 ? '💪' : '🌱';
    $('#end-title').textContent = settings.childName
        ? `Great job, ${settings.childName}!`
        : 'Great job!';
    $('#end-stats').innerHTML = `
        <div class="stats-strip">
            <div class="stat">⭐ ${session.starsEarned} <small>stars this round</small></div>
            <div class="stat">${session.correct} <small>correct</small></div>
            <div class="stat">${session.perfectCorrect} <small>first-try</small></div>
            <div class="stat">${session.wrong} <small>not solved</small></div>
            <div class="stat">${session.bestStreak} <small>best streak</small></div>
            <div class="stat">${acc}% <small>first-try accuracy</small></div>
            <div class="stat">${dur}s <small>time</small></div>
        </div>`;
    const missWrap = $('#missed-wrap');
    if (session.missed.length) {
        missWrap.innerHTML = `<div style="margin-top:6px;">Tricky facts to remember:</div>
            <div class="missed-list">${session.missed.map(m =>
            `<div class="missed">${m.a} ${opSym(m.op)} ${m.b} = ${m.ans}</div>`).join('')}</div>`;
        $('#btn-focus-end').hidden = false;
    } else {
        missWrap.innerHTML = `<div style="margin-top:6px;">No misses! Amazing! 🌟</div>`;
        $('#btn-focus-end').hidden = true;
    }
    if (acc >= 80) confettiBurst();
}

// ============ Confetti ============
const cc = $('#confetti');
let cctx = null;
function sizeCanvas() { cc.width = window.innerWidth; cc.height = window.innerHeight; }
sizeCanvas();
window.addEventListener('resize', sizeCanvas);
let particles = [];
let confettiRunning = false;
function confettiBurst() {
    cctx = cctx || cc.getContext('2d');
    const colors = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    for (let i = 0; i < 90; i++) {
        particles.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
            y: window.innerHeight / 3,
            vx: (Math.random() - 0.5) * 9,
            vy: -Math.random() * 7 - 3,
            g: 0.28,
            c: colors[i % colors.length],
            s: 5 + Math.random() * 5,
            life: 90 + Math.random() * 40,
        });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(tick); }
}
function tick() {
    cctx.clearRect(0, 0, cc.width, cc.height);
    particles.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
        cctx.fillStyle = p.c;
        cctx.fillRect(p.x, p.y, p.s, p.s);
    });
    particles = particles.filter(p => p.life > 0 && p.y < window.innerHeight + 20);
    if (particles.length) requestAnimationFrame(tick);
    else { confettiRunning = false; cctx.clearRect(0, 0, cc.width, cc.height); }
}

// ============ Certificate (session + lifetime) ============
function openCertificate() {
    const raw = (settings.childName || '').trim();
    const name = raw || DEFAULT_CERT_NAME;
    const date = new Date().toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const s = session || {};
    const hasSession = !!(session && (session.correct || session.wrong));
    const dur = s.startedAt ? Math.round((Date.now() - s.startedAt) / 1000) : 0;
    const asked = (s.correct || 0) + (s.wrong || 0);
    const acc = asked ? Math.round((s.perfectCorrect || 0) / asked * 100) : 0;
    const w = window.open('', '_blank', 'width=1100,height=760');
    if (!w) { toast('Please allow pop-ups to print the certificate'); return; }
    const sessionSection = hasSession ? `
        <div class="section-title">This round</div>
        <div class="stats">
            <div class="st">⭐ Stars<br>${s.starsEarned || 0}</div>
            <div class="st">✅ Correct<br>${s.correct || 0}</div>
            <div class="st">🎯 First-try<br>${s.perfectCorrect || 0}</div>
            <div class="st">✗ Not solved<br>${s.wrong || 0}</div>
            <div class="st">🔥 Best streak<br>${s.bestStreak || 0}</div>
            <div class="st">📈 Accuracy<br>${acc}%</div>
            <div class="st">⏱ Time<br>${dur}s</div>
        </div>` : '';
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(APP_NAME)} — Certificate</title>
<style>
    @page { size: A4 landscape; margin: 12mm; }
    body { margin:0; font-family: Georgia, 'Comic Neue', serif; background:#f7f2e0; }
    .cert { max-width: 1080px; margin: 24px auto; padding: 26px 40px; border: 10px double #d6a419; border-radius: 20px; text-align: center; background: linear-gradient(135deg, #fffbe6, #fff3c1); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
    .cert h1 { font-size: 40px; margin: 6px 0; color:#8b4513; letter-spacing: 3px; }
    .cert h2 { font-size: 20px; margin: 4px 0 10px; color:#333; font-weight: normal; }
    .name {
        font-size: 44px; font-weight: bold; margin: 18px 0 8px; color:#c0392b;
        border-bottom: 3px solid #d6a419; display:inline-block; padding: 0 40px 6px;
        text-transform: uppercase; font-style: italic; letter-spacing: 4px;
    }
    .desc { font-size: 17px; margin: 8px 40px; color:#333; line-height:1.5; }
    .section-title { text-align:left; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color:#8b4513; margin: 14px 0 4px; border-bottom: 1px dashed #d6a419; padding-bottom: 3px; }
    .stats { display:flex; gap: 10px; justify-content:center; margin: 4px 0; flex-wrap: wrap; }
    .st { padding: 8px 10px; background: white; border-radius: 10px; border: 2px solid #d6a419; font-weight: bold; font-size: 13px; min-width: 92px; line-height: 1.25; }
    .date { margin-top: 14px; font-size: 15px; color:#555; }
    .emoji { font-size: 34px; margin: 2px; }
    .footer { margin-top: 8px; opacity: .8; font-style: italic; font-size: 13px; }
    .noprint-bar { text-align:center; padding: 10px; }
    .noprint-bar button { padding: 12px 22px; font-size: 16px; cursor: pointer; border-radius: 10px; border: none; background: #06D6A0; color: white; font-weight: bold; }
    @media print { .noprint-bar { display: none; } body { background: white; } .cert { margin: 0 auto; box-shadow: none; } }
</style></head>
<body>
    <div class="cert">
        <div class="emoji">🏆 🌟 🏆</div>
        <h1>Certificate of Awesome Maths</h1>
        <h2>Proudly awarded to</h2>
        <div class="name">${escapeHtml(name)}</div>
        <div class="desc">For sharp mental maths, brave brain-work, and never giving up. Keep practicing — you're a real mathematician! 🚀</div>

        ${sessionSection}

        <div class="section-title">All-time</div>
        <div class="stats">
            <div class="st">⭐ Total stars<br>${stats.totalStars}</div>
            <div class="st">🔥 Best streak<br>${stats.bestStreak}</div>
            <div class="st">🏁 Practices<br>${stats.played}</div>
        </div>

        <div class="date">Awarded on ${escapeHtml(date)}</div>
        <div class="footer">— ${escapeHtml(APP_NAME)}</div>
    </div>
    <div class="noprint-bar">
        <button onclick="window.print()">🖨 Print / Save as PDF (Landscape)</button>
    </div>
</body></html>`;
    w.document.write(html);
    w.document.close();
}

// ============ Export / Import ============
function exportData() {
    const data = {
        settings: LS.load(LS.settingsKey, {}),
        stats: LS.load(LS.statsKey, {}),
        weak: LS.load(LS.weakKey, []),
        log: LS.load(LS.logKey, []),
        exportedAt: new Date().toISOString(),
        version: 3,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maths-practice-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Data exported 📤');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            if (data.settings && typeof data.settings === 'object') settings = { ...defaultSettings, ...data.settings };
            if (data.stats && typeof data.stats === 'object') stats = { ...defaultStats, ...data.stats };
            if (Array.isArray(data.weak)) weak = data.weak.filter(w => w && typeof w.op === 'string');
            // accept both new 'log' and legacy 'failed' key
            const importedLog = Array.isArray(data.log) ? data.log : (Array.isArray(data.failed) ? data.failed : null);
            if (importedLog) log = importedLog.filter(f => f && typeof f.op === 'string');
            persist();
            renderSetup();
            renderHome();
            toast('Data imported ✅');
        } catch (e) {
            toast('Import failed ❌');
        }
    };
    reader.readAsText(file);
}

// ============ Setup UI ============
const OPS = [
    { v: '+', label: '➕ Add' },
    { v: '-', label: '➖ Subtract' },
    { v: '*', label: '✖ Multiply' },
    { v: '/', label: '➗ Divide' },
];
const DIFFS = [
    { v: 'easy', label: '😊 Easy (0–9)' },
    { v: 'medium', label: '🙂 Medium (up to 19)' },
    { v: 'hard', label: '😎 Hard (2-digit)' },
];
const LENS = [
    { v: 10, label: '10' },
    { v: 20, label: '20' },
    { v: 50, label: '50' },
    { v: 'endless', label: '∞ Endless' },
];
const MODES = [
    { v: 'type', label: '⌨ Type' },
    { v: 'choice', label: '🔢 Choose' },
    { v: 'truefalse', label: '✅ True/False' },
];
const CHOICES = [
    { v: 2, label: '2' },
    { v: 3, label: '3' },
    { v: 4, label: '4' },
    { v: 5, label: '5' },
    { v: 6, label: '6' },
    { v: 7, label: '7' },
    { v: 8, label: '8' },
    { v: 9, label: '9' },
];

const YESNO = [
    { v: false, label: 'No' },
    { v: true, label: 'Yes' },
];

function renderChips(rootSel, items, current, multi, extraClass = '') {
    const root = $(rootSel);
    if (!root) return;
    let sel = multi ? [...current] : current;
    const paint = () => {
        root.innerHTML = items.map(it => {
            const on = multi ? sel.includes(it.v) : sel === it.v;
            return `<button class="chip ${extraClass} ${on ? 'on' : ''}" data-v="${escapeHtml(String(it.v))}">${it.label}</button>`;
        }).join('');
    };
    paint();
    root.onclick = (e) => {
        const b = e.target.closest('.chip'); if (!b) return;
        sfx.click();
        const raw = b.dataset.v;
        let v;
        if (raw === 'endless') v = 'endless';
        else if (raw === 'true') v = true;
        else if (raw === 'false') v = false;
        else if (/^-?\d+$/.test(raw)) v = parseInt(raw, 10);
        else v = raw;
        if (multi) {
            if (sel.includes(v)) { if (sel.length > 1) sel = sel.filter(x => x !== v); }
            else sel = [...sel, v];
        } else {
            sel = v;
        }
        paint();
        if (rootSel === '#op-chips') settings.ops = sel;
        if (rootSel === '#diff-chips') settings.difficulty = sel;
        if (rootSel === '#len-chips') settings.length = sel;
        if (rootSel === '#mode-chips') settings.modes = sel;
        if (rootSel === '#icon-chips') settings.iconPrimary = sel;
        if (rootSel === '#neg-chips') settings.allowNegative = sel;
        if (rootSel === '#choices-chips') settings.numChoices = sel;
        persist();
        if (rootSel === '#len-chips') { const inp = $('#input-length'); if (inp) inp.value = (typeof sel === 'number') ? sel : ''; }
    };
}

function tagFor(f) {
    if (f.ok) return `✅ ×${f.attempts}${f.mul > 1 ? ` <span style="color:#c0392b;">${'×' + f.mul} streak!</span>` : ''}`;
    if (f.shownAnswer) return '👁 answer shown';
    if (f.skipped) return '⤼ skipped';
    return `✗ ${f.attempts} wrong`;
}

function renderLog() {
    const list = $('#failed-list');
    if (!list) return;
    if (!log.length) {
        list.innerHTML = '<em style="opacity:.6;">No questions answered yet.</em>';
        return;
    }
    // small header with counts
    const okCount = log.filter(x => x.ok).length;
    const badCount = log.length - okCount;
    const header = `<div style="margin-bottom:6px; opacity:.7; font-size:13px;">
        ${log.length} questions logged · <b>${okCount}</b> correct · <b>${badCount}</b> not solved
    </div>`;
    list.innerHTML = header + log.map(f => {
        const d = new Date(f.when).toLocaleString();
        const hint = f.usedHint ? ' 💡' : '';
        const stars = f.ok ? ` · <b style="color:#c0392b;">+${f.stars} ⭐</b>` : '';
        const bg = f.ok ? '#eafff2' : '#fff0f0';
        const wrongs = (Array.isArray(f.wrongAnswers) && f.wrongAnswers.length)
            ? ` <span style="opacity:.75;">tried: <b style="color:#a04b4b;">${f.wrongAnswers.map(w => escapeHtml(String(w))).join(', ')}</b></span>`
            : '';
        return `<div style="padding:6px 8px; margin:4px 0; background:${bg}; border-radius:8px; display:flex; gap:8px; align-items:baseline; flex-wrap:wrap;">
            <b style="min-width:110px;">${f.a} ${opSym(f.op)} ${f.b} = ${f.ans}</b>
            <span>${tagFor(f)}${hint}${stars}</span>${wrongs}
            <span style="margin-left:auto; opacity:.5; font-size:12px;">${d}</span>
        </div>`;
    }).join('');
}

function renderSetup() {
    renderChips('#op-chips', OPS, settings.ops, true);
    renderChips('#diff-chips', DIFFS, settings.difficulty, false);
    renderChips('#len-chips', LENS, settings.length, false);
    renderChips('#mode-chips', MODES, settings.modes, true);
    renderChips('#choices-chips', CHOICES, parseInt(settings.numChoices, 10) || 4, false);
    renderChips('#icon-chips', ICON_CHOICES.map(v => ({ v, label: v })), settings.iconPrimary, false, 'icon-chip');
    renderChips('#neg-chips', YESNO, settings.allowNegative, false);
    const inpName = $('#input-child-name'); if (inpName) inpName.value = settings.childName || '';
    const inpLen = $('#input-length'); if (inpLen) inpLen.value = (typeof settings.length === 'number') ? settings.length : '';
    const inpMax = $('#input-star-max'); if (inpMax) inpMax.value = settings.starMax;
    const inpStep = $('#input-star-step'); if (inpStep) inpStep.value = settings.starStep;
    const inpNewPass = $('#input-new-password'); if (inpNewPass) inpNewPass.value = '';
    const openLog = $('#btn-open-log'); if (openLog) openLog.textContent = `📝 View log (${log.length})`;
}

function renderHome() {
    const greeting = settings.childName
        ? `Hi, <b>${escapeHtml(settings.childName)}</b>! Ready to practice? ${settings.iconPrimary}`
        : `Ready to practice? ${settings.iconPrimary}`;
    $('#home-greeting').innerHTML = greeting;
    $('#home-stats').innerHTML = `
        <div class="stat">⭐ ${stats.totalStars} <small>stars</small></div>
        <div class="stat">🔥 ${stats.bestStreak} <small>best streak</small></div>
        <div class="stat">🏁 ${stats.played} <small>practices</small></div>
    `;
    $('#btn-focus').hidden = weak.length === 0;
    const certBtn = $('#btn-home-cert');
    if (certBtn) certBtn.hidden = !(stats.played > 0 || stats.totalStars > 0);
}

// ============ Wire up ============
$('#btn-play').addEventListener('click', () => { sfx.click(); show('play'); newSession(); });
$('#btn-setup').addEventListener('click', () => {
    sfx.click();
    requireSettingsAccess(() => { renderSetup(); show('setup'); });
});
$('#btn-gear').addEventListener('click', () => {
    sfx.click();
    requireSettingsAccess(() => {
        removeKeypadKeys();
        renderSetup();
        show('setup');
    });
});
$('#btn-back-home').addEventListener('click', () => { sfx.click(); renderHome(); show('home'); });
$('#btn-start').addEventListener('click', () => { sfx.click(); show('play'); newSession(); });
$('#btn-focus').addEventListener('click', () => { sfx.click(); show('play'); newSession({ focusWeak: true }); });
$('#btn-focus-end').addEventListener('click', () => { sfx.click(); show('play'); newSession({ focusWeak: true }); });
$('#btn-again').addEventListener('click', () => { sfx.click(); show('play'); newSession(); });
$('#btn-end-home').addEventListener('click', () => { sfx.click(); renderHome(); show('home'); });
$('#btn-cert').addEventListener('click', () => { sfx.click(); openCertificate(); });
$('#btn-home-cert').addEventListener('click', () => { sfx.click(); openCertificate(); });
$('#btn-home').addEventListener('click', () => {
    sfx.click();
    removeKeypadKeys();
    renderHome();
    show('home');
});

$('#btn-hint').addEventListener('click', () => {
    if (!session || session.answered) return;
    sfx.click();
    if (!session.usedHint) {
        session.usedHint = true;
        session.currentStars = Math.max(1, session.currentStars - starStep());
    }
    const content = document.getElementById('hint-modal-content');
    if (content) showHint(false, content);
    const m = document.getElementById('hint-modal-backdrop');
    if (m) m.hidden = false;
});
$('#btn-hint-close').addEventListener('click', () => {
    sfx.click();
    const m = document.getElementById('hint-modal-backdrop');
    if (m) m.hidden = true;
});

$('#btn-show-answer').addEventListener('click', () => {
    if (!session || session.answered) return;
    sfx.click();
    const q = session.current;
    session.answered = true;
    session.streak = 0;
    session.wrong++;
    stats.wrong++;
    session.missed.push({ ...q });
    markWeak(q);
    recordEntry(q, { ok: false, attempts: session.attempts, usedHint: session.usedHint, shownAnswer: true, wrongAnswers: session.wrongAnswers });
    persist();
    showAnswerAndPause();
});

$('#btn-skip').addEventListener('click', () => {
    if (!session || session.answered) return;
    sfx.click();
    const q = session.current;
    session.answered = true;
    session.streak = 0;
    session.wrong++;
    stats.wrong++;
    session.missed.push({ ...q });
    markWeak(q);
    recordEntry(q, { ok: false, attempts: session.attempts, usedHint: session.usedHint, skipped: true, wrongAnswers: session.wrongAnswers });
    persist();
    nextQuestion();
});

$('#btn-sound').addEventListener('click', () => {
    settings.sound = !settings.sound;
    persist();
    $('#btn-sound').textContent = settings.sound ? '🔊' : '🔇';
});
$('#btn-sound').textContent = settings.sound ? '🔊' : '🔇';

$('#input-child-name').addEventListener('input', (e) => {
    settings.childName = e.target.value.slice(0, 24);
    persist();
});

$('#input-length').addEventListener('input', (e) => {
    const n = parseInt(e.target.value, 10);
    if (Number.isFinite(n) && n > 0 && n <= 999) {
        settings.length = n;
        persist();
        renderChips('#len-chips', LENS, settings.length, false);
    }
});

$('#input-star-max').addEventListener('input', (e) => {
    const n = parseInt(e.target.value, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 999) {
        settings.starMax = n;
        persist();
    }
});
$('#input-star-step').addEventListener('input', (e) => {
    const n = parseInt(e.target.value, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 999) {
        settings.starStep = n;
        persist();
    }
});

$('#btn-save-password').addEventListener('click', () => {
    sfx.click();
    const el = $('#input-new-password');
    if (!el) return;
    const v = (el.value || '').trim();
    if (v.length < 2) { toast('Code must be at least 2 characters'); return; }
    settings.parentPassword = v;
    persist();
    el.value = '';
    toast('Grown-up code updated 🔒');
});

$('#btn-export').addEventListener('click', () => { sfx.click(); exportData(); });
$('#btn-import').addEventListener('click', () => { sfx.click(); $('#file-import').click(); });
$('#file-import').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importData(file);
    e.target.value = '';
});
$('#btn-reset').addEventListener('click', () => { sfx.click(); resetAllData(); });
$('#btn-clear-failed').addEventListener('click', () => {
    sfx.click();
    if (!window.confirm('Clear the question log?')) return;
    log = [];
    persist();
    renderLog();
    const openLog = $('#btn-open-log'); if (openLog) openLog.textContent = `📝 View log (${log.length})`;
    toast('Cleared 🧹');
});

$('#btn-open-log').addEventListener('click', () => {
    sfx.click();
    renderLog();
    const m = document.getElementById('log-modal-backdrop');
    if (m) m.hidden = false;
});
$('#btn-log-close').addEventListener('click', () => {
    sfx.click();
    const m = document.getElementById('log-modal-backdrop');
    if (m) m.hidden = true;
});

// Password modal buttons + Enter/Esc keys
$('#pass-ok').addEventListener('click', () => { sfx.click(); tryPassword(); });
$('#pass-cancel').addEventListener('click', () => { sfx.click(); closePasswordModal(); });
$('#pass-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); tryPassword(); }
    else if (e.key === 'Escape') { e.preventDefault(); closePasswordModal(); }
});

renderHome();
show('home');
