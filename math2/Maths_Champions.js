/* Maths Champions v2
 * Features over v1:
 *   - Multi-child profiles (each with own settings/stats/log/streak)
 *   - Per-operation operand ranges (0-15 chip picker, multi-select)
 *   - Play modes: Standard random, Missing operand, Timed challenge
 *   - Per-operation "Table drill" (drill a single base against all allowed others)
 *   - Daily play streak, voice, reduced motion, auto-pause on hidden tab
 *   - Log filters, HUD current-star badge, cert with tier badge, PWA install
 */

// ============ Constants ============
const APP_NAME = 'Maths Champions';
const APP_TAGLINE = 'Mental maths, one champion at a time.';
const DEFAULT_CERT_NAME = 'Champion';
const START_TIME_LIMIT = 60;

const KEYS = {
    profiles: 'math2.profiles',
    activeId: 'math2.activeId',
    appPassword: 'math2.appPassword',
    pfx: (id, name) => `math2.p.${id}.${name}`,
};

// operand id aliases (for querying chip containers by op char)
const OP_ALIAS = { '+': 'plus', '-': 'minus', '*': 'star', '/': 'slash' };

// ============ Storage helpers ============
const LS = {
    load(k, def) {
        try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; }
        catch { return def; }
    },
    save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
    remove(k) { try { localStorage.removeItem(k); } catch { } },
};

// ============ Defaults ============
const RANGE_0_15 = Array.from({ length: 16 }, (_, i) => i);              // [0..15]
const RANGE_1_15 = Array.from({ length: 15 }, (_, i) => i + 1);          // [1..15]

const defaultSettings = {
    ops: ['+', '-', '*'],
    length: 20,
    modes: ['type', 'choice', 'truefalse'],
    sound: true,
    voice: false,
    voiceEnabled: true,   // child-side toggle (only meaningful when voice is on)
    reducedMotion: false,
    iconPrimary: '🐬',
    allowNegative: false,
    starMax: 5,
    starStep: 1,
    numChoices: 4,
    playMode: 'standard',            // 'standard' | 'missing' | 'timed'
    timeLimit: START_TIME_LIMIT,
    activeDrill: null,               // null OR { op, base } — what PLAY starts when set
    hintPopup: false,                // false = show hint inline on the play screen; true = show in a popup

    // Per-operation operand pools (multi-select 0..15).
    // For + - *: left = a, right = b in `a op b`.
    // For /: left = divisor, right = quotient (result). Question shown as (left*right) ÷ left = right.
    // Defaults: left 0-5, right 0-10 all selected (for / divisor excludes 0).
    opRanges: {
        '+': { left: [0, 1, 2, 3, 4, 5], right: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        '-': { left: [0, 1, 2, 3, 4, 5], right: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        '*': { left: [0, 1, 2, 3, 4, 5], right: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        '/': { left: [1, 2, 3, 4, 5],    right: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    },
};

const DEFAULT_CERT_TITLE = 'Certificate of Awesome Maths';

const defaultStats = {
    totalStars: 0, bestStreak: 0, played: 0, correct: 0, wrong: 0, perfectCorrect: 0,
};

const defaultDaily = { lastDate: '', streakDays: 0, totalDays: 0 };

// ============ Global state ============
let profiles = LS.load(KEYS.profiles, []);
let activeId = LS.load(KEYS.activeId, null);
let appPassword = LS.load(KEYS.appPassword, '12345');

let settings = { ...defaultSettings };
let stats = { ...defaultStats };
let daily = { ...defaultDaily };
let weak = [];
let log = [];

let settingsUnlocked = false;
let passCallback = null;
let quietMode = false;

// Ensure at least one profile exists.
function ensureProfile() {
    if (!profiles.length) {
        const p = { id: 'p_' + Date.now(), name: 'Champion', createdAt: Date.now() };
        profiles = [p];
        activeId = p.id;
        LS.save(KEYS.profiles, profiles);
        LS.save(KEYS.activeId, activeId);
    }
    if (!profiles.find(p => p.id === activeId)) {
        activeId = profiles[0].id;
        LS.save(KEYS.activeId, activeId);
    }
}

// Deep-merge to preserve nested opRanges keys.
function mergeSettings(saved) {
    const merged = { ...defaultSettings, ...saved };
    merged.opRanges = { ...defaultSettings.opRanges };
    if (saved && saved.opRanges && typeof saved.opRanges === 'object') {
        for (const op of Object.keys(defaultSettings.opRanges)) {
            const src = saved.opRanges[op];
            if (src && Array.isArray(src.left) && Array.isArray(src.right)) {
                merged.opRanges[op] = {
                    left: src.left.slice(),
                    right: src.right.slice(),
                };
            }
        }
    }
    return merged;
}

function loadProfile(id) {
    activeId = id;
    LS.save(KEYS.activeId, activeId);
    settings = mergeSettings(LS.load(KEYS.pfx(id, 'settings'), {}));
    stats = { ...defaultStats, ...LS.load(KEYS.pfx(id, 'stats'), {}) };
    daily = { ...defaultDaily, ...LS.load(KEYS.pfx(id, 'daily'), {}) };
    weak = LS.load(KEYS.pfx(id, 'weak'), []);
    log = LS.load(KEYS.pfx(id, 'log'), []);
    applyReducedMotion();
}

function persist() {
    LS.save(KEYS.profiles, profiles);
    LS.save(KEYS.activeId, activeId);
    LS.save(KEYS.appPassword, appPassword);
    if (activeId) {
        LS.save(KEYS.pfx(activeId, 'settings'), settings);
        LS.save(KEYS.pfx(activeId, 'stats'), stats);
        LS.save(KEYS.pfx(activeId, 'daily'), daily);
        LS.save(KEYS.pfx(activeId, 'weak'), weak);
        LS.save(KEYS.pfx(activeId, 'log'), log);
    }
}

function activeProfile() { return profiles.find(p => p.id === activeId) || profiles[0]; }
function activeName() { return (activeProfile() && activeProfile().name) || DEFAULT_CERT_NAME; }

function applyReducedMotion() {
    const auto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.toggle('reduced-motion', !!settings.reducedMotion || !!auto);
}

// ============ Password gate ============
function lockSettings() { settingsUnlocked = false; }

function openPasswordModal(action) {
    passCallback = action;
    quietMode = true;
    const m = $('#modal-password');
    const inp = $('#pass-input');
    const msg = $('#pass-msg');
    if (inp) inp.value = '';
    if (msg) msg.style.display = 'none';
    if (m) m.hidden = false;
    setTimeout(() => { if (inp) inp.focus(); }, 30);
}
function closePasswordModal() {
    const m = $('#modal-password');
    if (m) m.hidden = true;
    passCallback = null;
    if ($('#screen-setup').hidden) quietMode = false;
}
function tryPassword() {
    const inp = $('#pass-input');
    const msg = $('#pass-msg');
    if (inp && inp.value === (appPassword || '12345')) {
        settingsUnlocked = true;
        const cb = passCallback;
        closePasswordModal();
        if (cb) cb();
    } else {
        if (msg) msg.style.display = 'block';
        if (inp) { inp.value = ''; inp.focus(); }
    }
}
function requireSettingsAccess(action) {
    if (settingsUnlocked) return action();
    openPasswordModal(action);
}

// ============ Reset ============
function resetAllForProfile() {
    if (!window.confirm('Erase all stats, log, weak facts and settings for THIS profile? (Other profiles are safe.)')) return;
    LS.remove(KEYS.pfx(activeId, 'settings'));
    LS.remove(KEYS.pfx(activeId, 'stats'));
    LS.remove(KEYS.pfx(activeId, 'weak'));
    LS.remove(KEYS.pfx(activeId, 'log'));
    LS.remove(KEYS.pfx(activeId, 'daily'));
    location.reload();
}
function resetEverything() {
    if (!window.confirm('Erase ALL profiles, stats, logs, and settings? This cannot be undone.')) return;
    profiles.forEach(p => {
        LS.remove(KEYS.pfx(p.id, 'settings'));
        LS.remove(KEYS.pfx(p.id, 'stats'));
        LS.remove(KEYS.pfx(p.id, 'weak'));
        LS.remove(KEYS.pfx(p.id, 'log'));
        LS.remove(KEYS.pfx(p.id, 'daily'));
    });
    LS.remove(KEYS.profiles);
    LS.remove(KEYS.activeId);
    LS.remove(KEYS.appPassword);
    location.reload();
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
function iconGroup() { return ICON_GROUPS[settings.iconPrimary] || ICON_GROUPS['🐬']; }
function pickIcons(n) {
    const pool = iconGroup().slice();
    const out = [];
    for (let i = 0; i < n; i++) {
        if (pool.length) {
            const idx = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(idx, 1)[0]);
        } else out.push(out[out.length - 1] || iconGroup()[0]);
    }
    return out;
}

// ============ Audio ============
let ac = null;
function audio() {
    if (!settings.sound) return null;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => { });
    return ac;
}
function tone(freq, dur, type = 'sine', gain = 0.15, when = 0) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
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
    tick() { tone(400, 0.03, 'square', 0.04); },
};

// ============ Voice ============
function voiceActive() {
    return !!settings.voice && settings.voiceEnabled !== false;
}
function speak(text) {
    if (!voiceActive() || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
        window.speechSynthesis.speak(u);
    } catch { }
}
function opWord(op) {
    return op === '+' ? 'plus' : op === '-' ? 'minus' : op === '*' ? 'times' : op === '/' ? 'divided by' : op;
}
function speakQuestion(q) {
    // For True/False, we speak the exact claim shown on screen.
    if (session && session.currentMode === 'truefalse' && session.tfShown != null) {
        const a = q.ask === 'a' ? String(session.tfShown) : String(q.a);
        const b = q.ask === 'b' ? String(session.tfShown) : String(q.b);
        const r = q.ask === 'ans' ? String(session.tfShown) : String(q.ans);
        speak(`Is ${a} ${opWord(q.op)} ${b} equal to ${r}?`);
        return;
    }
    const a = q.ask === 'a' ? 'what' : String(q.a);
    const b = q.ask === 'b' ? 'what' : String(q.b);
    const ans = q.ask === 'ans' ? 'what' : String(q.ans);
    speak(`${a} ${opWord(q.op)} ${b} equals ${ans}`);
}

// ============ Question generation ============
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickFrom(arr, fallback) {
    if (!arr || !arr.length) return fallback;
    return arr[Math.floor(Math.random() * arr.length)];
}
function opSym(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

function opName(op) {
    if (op === '*') return 'Multiplication';
    if (op === '/') return 'Division';
    if (op === '+') return 'Addition';
    if (op === '-') return 'Subtraction';
    return op;
}

function pickFromWeak() {
    if (!weak.length) return null;
    const total = weak.reduce((s, w) => s + w.misses, 0);
    let r = Math.random() * total;
    for (const w of weak) { r -= w.misses; if (r <= 0) return w; }
    return weak[weak.length - 1];
}

function opRange(op) {
    const r = settings.opRanges && settings.opRanges[op];
    return r || defaultSettings.opRanges[op] || defaultSettings.opRanges['+'];
}

function makeStandardTriple(op) {
    const r = opRange(op);
    let leftPool = (r.left || []).slice();
    let rightPool = (r.right || []).slice();
    if (op === '/') leftPool = leftPool.filter(v => v > 0);   // divisor can't be 0
    if (!leftPool.length) leftPool = defaultSettings.opRanges[op].left.slice();
    if (!rightPool.length) rightPool = defaultSettings.opRanges[op].right.slice();

    if (op === '/') {
        const divisor = pickFrom(leftPool, 1);
        const quotient = pickFrom(rightPool, 0);
        return { a: divisor * quotient, b: divisor, op, ans: quotient };
    }
    let a = pickFrom(leftPool, 0);
    let b = pickFrom(rightPool, 0);
    if (op === '-' && !settings.allowNegative && b > a) [a, b] = [b, a];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { a, b, op, ans };
}

function makeQuestion(focusWeak = false) {
    // Table-drill session pulls from the pre-built queue (refills on exhaustion when endless).
    if (session && session.drillMode) {
        if (session.drillIndex >= session.drillQueue.length) {
            if (session.target === Infinity && session.drillPool && session.drillPool.length) {
                session.drillQueue = session.drillQueue.concat(session.drillPool.slice());
            } else {
                return null;
            }
        }
        const queueIndex = session.drillIndex + rng(0, session.drillQueue.length - session.drillIndex - 1);
        const question = session.drillQueue[queueIndex];
        session.drillQueue.splice(queueIndex, 1);
        return question;
    }

    const src = focusWeak ? pickFromWeak() : null;
    const enabled = settings.ops.length ? settings.ops : ['+'];
    const op = src ? src.op : enabled[rng(0, enabled.length - 1)];

    if (src) {
        return { a: src.a, b: src.b, op, ans: standardAns(src.a, src.b, op), ask: 'ans' };
    }

    const t = makeStandardTriple(op);
    if (settings.playMode === 'missing') {
        const roll = Math.random();
        t.ask = roll < 0.35 ? 'a' : (roll < 0.7 ? 'b' : 'ans');
    } else {
        t.ask = 'ans';
    }
    return t;
}

function standardAns(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b !== 0 ? a / b : 0;
    return 0;
}

// Build the ordered drill queue for base against all admin-allowed 'other' values.
function buildDrillQueue(op, base) {
    const r = opRange(op);
    // Keep ascending order (not shuffled) so the table reads 1,2,3...N.
    const others = (r.right || []).slice().sort((x, y) => x - y);
    const queue = [];
    for (const other of others) {
        // For + - *, show the varying number first and the table base second (e.g. 3+2, 3-2, 3*2).
        if (op === '+') queue.push({ a: other, b: base, op, ans: other + base, ask: 'ans' });
        else if (op === '-') {
            let a = other, b = base;
            if (!settings.allowNegative && a < b) continue;
            queue.push({ a, b, op, ans: a - b, ask: 'ans' });
        }
        else if (op === '*') queue.push({ a: other, b: base, op, ans: other * base, ask: 'ans' });
        else if (op === '/') {
            // base = divisor, other = quotient; question is (base*other) ÷ base = other
            queue.push({ a: base * other, b: base, op, ans: other, ask: 'ans' });
        }
    }
    return queue;
}

function distractors(q, n = 3) {
    const target = q[q.ask];
    const set = new Set([target]);
    const allowNeg = !!settings.allowNegative;
    const push = v => {
        if (!allowNeg && v < 0) return;
        if (!set.has(v)) set.add(v);
    };
    push(target + 1); push(target - 1); push(target + 2); push(target - 2);
    if (q.op === '+') push(Math.abs(q.a - q.b));
    if (q.op === '-') push(q.a + q.b);
    if (q.op === '*') { push(q.a + q.b); push(target + q.a); push(target - q.a); }
    if (q.op === '/') { push(q.a - q.b); push(target + q.b); push(q.b); }
    let guard = 0;
    while (set.size < n + 4 && guard++ < 80) push(target + rng(-6, 6));
    const arr = [...set].filter(v => v !== target);
    arr.sort(() => Math.random() - 0.5);
    return arr.slice(0, Math.max(1, n));
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

// ============ Daily streak ============
function todayKey() { return new Date().toISOString().slice(0, 10); }
function bumpDailyOnPlay() {
    const today = todayKey();
    if (daily.lastDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    daily.streakDays = daily.lastDate === yesterday ? (daily.streakDays || 0) + 1 : 1;
    daily.totalDays = (daily.totalDays || 0) + 1;
    daily.lastDate = today;
}

// ============ Log ============
function recordEntry(q, meta) {
    const target = q[q.ask];
    log.unshift({
        op: q.op, a: q.a, b: q.b, ans: q.ans,
        ask: q.ask, target,
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
        mode: session ? session.currentMode : null,
        playMode: session ? session.playMode : settings.playMode,
        when: Date.now(),
    });
    if (log.length > 500) log.length = 500;
}

// ============ Streak multiplier ============
function streakMultiplier(streak) {
    if (streak >= 20) return 10;
    if (streak >= 15) return 6;
    if (streak >= 10) return 4;
    if (streak >= 5) return 2;
    return 1;
}

// ============ Session ============
let session = null;
let timerHandle = null;

function starMax() { return Math.max(1, parseInt(settings.starMax, 10) || 5); }
function starStep() { return Math.max(1, parseInt(settings.starStep, 10) || 1); }

function newSession(opts = {}) {
    stopTimer();
    bumpDailyOnPlay();
    session = {
        playMode: settings.playMode,
        target: settings.playMode === 'timed' ? Infinity
              : (settings.length === 'endless' ? Infinity : settings.length),
        index: 0, correct: 0, wrong: 0,
        streak: 0, bestStreak: 0,
        starsEarned: 0,
        perfectCorrect: 0,
        startedAt: Date.now(),
        pausedAt: null,
        pausedTotal: 0,
        history: [],
        missed: [],
        focusWeak: !!opts.focusWeak,
        current: null,
        currentMode: null,
        currentStars: starMax(),
        attempts: 0, answered: false,
        usedHint: false, wrongAnswers: [],
        tfExpected: null, clearInput: null, keydown: null,
        timerRemaining: settings.playMode === 'timed' ? Math.max(5, parseInt(settings.timeLimit, 10) || START_TIME_LIMIT) : null,
    };
    if (session.playMode === 'timed') startTimer();
    nextQuestion();
}

// Table drill: fixed queue of questions.
function startTableDrill(op, base) {
    stopTimer();
    bumpDailyOnPlay();
    const pool = buildDrillQueue(op, base);
    if (!pool.length) {
        toast('No questions could be generated for this table (check operand ranges)');
        show('home');
        return;
    }
    const rawLen = settings.length;
    const target = rawLen === 'endless' ? Infinity
        : Math.max(1, parseInt(rawLen, 10) || pool.length);

    let queue;
    if (target === Infinity) {
        queue = shuffle(pool);
    } else {
        queue = [];
        while (queue.length < target) queue = queue.concat(shuffle(pool));
        queue = queue.slice(0, target);
    }
    session = {
        playMode: 'drill',
        drillMode: { op, base },
        drillPool: pool,
        drillQueue: queue,
        drillIndex: 0,
        target: target === Infinity ? Infinity : queue.length,
        index: 0, correct: 0, wrong: 0,
        streak: 0, bestStreak: 0,
        starsEarned: 0, perfectCorrect: 0,
        startedAt: Date.now(),
        pausedAt: null, pausedTotal: 0,
        history: [], missed: [],
        focusWeak: false,
        current: null, currentMode: null,
        currentStars: starMax(),
        attempts: 0, answered: false,
        usedHint: false, wrongAnswers: [],
        tfExpected: null, clearInput: null, keydown: null,
        timerRemaining: null,
    };
    show('play');
    nextQuestion();
}

function restartLastSession() {
    if (session && session.drillMode) {
        startTableDrill(session.drillMode.op, session.drillMode.base);
    } else {
        newSession({ focusWeak: !!(session && session.focusWeak) });
    }
}

function startTimer() {
    stopTimer();
    timerHandle = setInterval(() => {
        if (!session || session.playMode !== 'timed') return;
        if (session.pausedAt) return;
        session.timerRemaining -= 1;
        updateHud();
        if (session.timerRemaining <= 5) sfx.tick();
        if (session.timerRemaining <= 0) { stopTimer(); endSession(); }
    }, 1000);
}
function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

function pauseSession() { if (session && !session.pausedAt) session.pausedAt = Date.now(); }
function resumeSession() {
    if (!session || !session.pausedAt) return;
    session.pausedTotal += Date.now() - session.pausedAt;
    session.pausedAt = null;
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseSession(); else resumeSession();
});

function nextQuestion() {
    removeKeypadKeys();
    const qt = $('#q-text'), qb = $('#q-body'), pa = $('.play-actions');
    if (qt) qt.style.display = '';
    if (qb) qb.style.display = '';
    if (pa) pa.style.display = '';
    const hm = $('#modal-hint');
    if (hm) hm.hidden = true;

    if (session.playMode !== 'timed' && session.index >= session.target) return endSession();

    const q = makeQuestion(session.focusWeak && weak.length > 0);
    if (!q) return endSession();

    session.index++;
    session.attempts = 0;
    session.answered = false;
    session.usedHint = false;
    session.wrongAnswers = [];
    session.currentStars = starMax();
    session.current = q;

    let enabled = settings.modes.length ? settings.modes.slice() : ['type'];
    // TF doesn't make sense when the missing piece is an operand.
    if (settings.playMode === 'missing') {
        enabled = enabled.filter(m => m !== 'truefalse');
        if (!enabled.length) enabled = ['type'];
    }
    session.currentMode = enabled[rng(0, enabled.length - 1)];
    renderPlay();
    setTimeout(() => speakQuestion(session.current), 200);
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
    const hud = $('#hud');
    if (hud) {
        hud.hidden = false;
        hud.classList.toggle('no-session', id !== 'play');
        hud.classList.toggle('on-home', id === 'home');
        hud.classList.toggle('on-setup', id === 'setup');
    }
    if (id !== 'setup') lockSettings();
    quietMode = (id === 'setup');
}

function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1000);
}

function updateHud() {
    if (!session) return;
    $('#hud-score').textContent = `⭐ ${session.starsEarned}`;
    const mul = streakMultiplier(session.streak);
    $('#hud-streak').textContent = `🔥 ${session.streak}${mul > 1 ? ` ×${mul}` : ''}`;
    if (session.playMode === 'timed') {
        const t = Math.max(0, session.timerRemaining || 0);
        $('#hud-progress').textContent = `⏱ ${t}s`;
        $('#hud-progress').classList.add('timer');
    } else {
        $('#hud-progress').textContent = session.target === Infinity
            ? `#${session.index}` : `${session.index}/${session.target}`;
        $('#hud-progress').classList.remove('timer');
    }
    $('#hud-stars-now').textContent = `🎯 ⭐×${session.currentStars}`;
    updateVoiceToggle();
    const pct = session.target === Infinity
        ? Math.min(100, session.correct * 2)
        : ((session.index - 1) / session.target) * 100;
    $('#bar').style.width = pct + '%';
}

function updateVoiceToggle() {
    const btn = $('#btn-voice-toggle');
    if (!btn) return;
    if (!settings.voice) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.textContent = settings.voiceEnabled === false ? '🔇' : '🗣';
    btn.title = settings.voiceEnabled === false ? 'Turn voice on' : 'Turn voice off';
}

function mascotFor() {
    if (!session) return '🐣';
    if (session.streak >= 10) return '🤩';
    if (session.streak >= 5) return '😃';
    if (session.streak >= 3) return '🙂';
    return '🐣';
}

// ============ Rendering ============
function questionHtml(q) {
    const sym = opSym(q.op);
    const a = q.ask === 'a' ? '<span class="blank">?</span>' : `<span class="a">${q.a}</span>`;
    const b = q.ask === 'b' ? '<span class="blank">?</span>' : `<span class="b">${q.b}</span>`;
    const r = q.ask === 'ans' ? '<span class="blank">?</span>' : `<span class="r">${q.ans}</span>`;
    return `${a} <span class="op">${sym}</span> ${b} = ${r}`;
}

function renderPlay() {
    updateHud();
    $('#play-mascot').textContent = mascotFor();
    $('#hint-slot').innerHTML = '';
    $('#hint-slot').scrollTop = 0;
    const q = session.current;
    const body = $('#q-body');
    body.innerHTML = '';

    $('#q-text').innerHTML = questionHtml(q);

    if (session.currentMode === 'type') {
        body.innerHTML = `
            <div style="text-align:center;"><div class="type-answer" id="type-answer">·</div></div>
            <div class="keypad" id="keypad"></div>
        `;
        buildKeypad();
    } else if (session.currentMode === 'choice') {
        const total = Math.min(9, Math.max(2, parseInt(settings.numChoices, 10) || 4));
        const opts = shuffle([q[q.ask], ...distractors(q, total - 1)]);
        const cols = total >= 5 ? 3 : 2;
        body.innerHTML = `<div class="choices" style="grid-template-columns: repeat(${cols}, 1fr);">${opts.map((v, i) =>
            `<button class="choice c${i % 4}" data-val="${v}">${v}</button>`).join('')
            }</div>`;
        $$('#q-body .choice').forEach(b => b.addEventListener('click', () => {
            if (session.answered || b.disabled) return;
            sfx.click();
            const val = parseInt(b.dataset.val, 10);
            session.attempts++;
            if (val === q[q.ask]) { session.answered = true; onCorrect(b); }
            else {
                session.wrongAnswers.push(val);
                session.currentStars = Math.max(1, session.currentStars - starStep());
                b.disabled = true;
                b.classList.add('flash-wrong');
                b.style.opacity = 0.4;
                sfx.wrong();
                $('#play-mascot').textContent = '🤔';
                updateHud();
            }
        }));
    } else {
        const target = q[q.ask];
        const isTrue = Math.random() < 0.5;
        let shown;
        if (isTrue) shown = target;
        else {
            let delta, tries = 0;
            do { delta = (Math.random() < 0.5 ? -1 : 1) * rng(1, 3); tries++; }
            while (!settings.allowNegative && target + delta < 0 && tries < 10);
            shown = target + delta;
            if (!settings.allowNegative && shown < 0) shown = target + Math.abs(delta);
            if (shown === target) shown = target + 1;
        }
        session.tfExpected = (shown === target) ? 1 : 0;
        session.tfShown = shown;
        const parts = {
            a: q.ask === 'a' ? `<span class="a">${shown}</span>` : `<span class="a">${q.a}</span>`,
            b: q.ask === 'b' ? `<span class="b">${shown}</span>` : `<span class="b">${q.b}</span>`,
            r: q.ask === 'ans' ? `<span class="r">${shown}</span>` : `<span class="r">${q.ans}</span>`,
        };
        $('#q-text').innerHTML = `${parts.a} <span class="op">${opSym(q.op)}</span> ${parts.b} = ${parts.r}`;
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
            render(); return;
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
    if (given === q[q.ask]) { session.answered = true; return onCorrect(el); }
    session.wrongAnswers.push(given);
    session.currentStars = Math.max(1, session.currentStars - starStep());
    sfx.wrong();
    if (el && el.classList) el.classList.add('flash-wrong');
    $('#play-mascot').textContent = '🤔';
    updateHud();
    setTimeout(() => {
        if (el && el.classList) el.classList.remove('flash-wrong');
        if (session.clearInput) session.clearInput();
    }, 400);
}

const PRAISE = ['Nice!', 'Yes!', 'Wow!', 'Great!', 'Amazing!', 'Boom!', 'Star!', 'Champion!', 'Brilliant!'];

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
    stats.perfectCorrect = (stats.perfectCorrect || 0) + (session.attempts === 1 && !session.usedHint ? 1 : 0);
    recordEntry(q, {
        ok: true, attempts: session.attempts, usedHint: session.usedHint,
        stars, streak: session.streak, mul, wrongAnswers: session.wrongAnswers
    });
    persist();
    sfx.correct();
    speak('Correct! ' + stars + ' stars.');
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
    const qb = $('#q-body'), pa = $('.play-actions');
    if (qb) qb.style.display = 'none';
    if (pa) pa.style.display = 'none';
}
function showAnswerAndPause() {
    enterLearnMode();
    const hm = $('#modal-hint');
    if (hm) hm.hidden = true;
    showHintInto($('#hint-slot'), true);
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
    $('#btn-next').addEventListener('click', () => { sfx.click(); nextQuestion(); });
}

// ============ Hints ============
function iconSpans(count, icon, cls) {
    let out = '';
    for (let i = 0; i < count; i++) out += `<span${cls ? ` class="${cls}"` : ''}>${icon}</span>`;
    return out;
}
function addHintVisual(a, b) {
    if (a + b > 24) return `<div class="hint">Count on from the bigger number. Add tens first, then ones. 🧮</div>`;
    const [p, s] = pickIcons(2);
    return `
        <div class="iconrow stacked">
            <div class="iconrow-line">${iconSpans(a, p)}</div>
            <div class="connector">+</div>
            <div class="iconrow-line">${iconSpans(b, s)}</div>
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
    if (rows * cols > 30) return `<div class="hint">Think of it as ${rows} rows of ${cols}. 🧮</div>`;
    const icons = pickIcons(rows);
    const groups = [];
    for (let group = 0; group < rows; group++) {
        let inner = '';
        for (let item = 0; item < cols; item++) inner += `<span>${icons[group]}</span>`;
        groups.push(`<div class="igroup">${inner}</div>`);
    }
    return `
        <div class="icongroups">${groups.join('')}</div>
        <div class="hint">${rows} groups of ${cols}. Count them all! 🧮</div>`;
}
function divHintVisual(a, b) {
    if (b === 0 || a === 0 || a > 30) return `<div class="hint">Share ${a} into ${b} equal groups. 🧮</div>`;
    const q = a / b;
    if (!Number.isInteger(q)) return `<div class="hint">Share ${a} into ${b} equal groups.</div>`;
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
function missingHint(q) {
    if (q.ask === 'ans') {
        if (q.op === '+') return addHintVisual(q.a, q.b);
        if (q.op === '-') return subHintVisual(q.a, q.b);
        if (q.op === '*') return mulHintVisual(q.a, q.b);
        if (q.op === '/') return divHintVisual(q.a, q.b);
    }
    if (q.op === '+' && q.ask === 'a') return `<div class="hint">What plus ${q.b} makes ${q.ans}? Count up from ${q.b}. 🧮</div>`;
    if (q.op === '+' && q.ask === 'b') return `<div class="hint">${q.a} plus what makes ${q.ans}? Count up from ${q.a}. 🧮</div>`;
    if (q.op === '-' && q.ask === 'a') return `<div class="hint">What minus ${q.b} makes ${q.ans}? Try ${q.b} + ${q.ans}. 🧮</div>`;
    if (q.op === '-' && q.ask === 'b') return `<div class="hint">${q.a} minus what makes ${q.ans}? Try ${q.a} − ${q.ans}. 🧮</div>`;
    if (q.op === '*' && q.ask === 'a') return `<div class="hint">What × ${q.b} makes ${q.ans}? Think of the ${q.b} times table. 🧮</div>`;
    if (q.op === '*' && q.ask === 'b') return `<div class="hint">${q.a} × what makes ${q.ans}? Think of the ${q.a} times table. 🧮</div>`;
    if (q.op === '/' && q.ask === 'a') return `<div class="hint">What ÷ ${q.b} makes ${q.ans}? Try ${q.b} × ${q.ans}. 🧮</div>`;
    if (q.op === '/' && q.ask === 'b') return `<div class="hint">${q.a} ÷ what makes ${q.ans}? Try ${q.a} ÷ ${q.ans}. 🧮</div>`;
    return `<div class="hint">Take your time and count carefully. 🧮</div>`;
}
function showHintInto(target, reveal = false) {
    if (!session || !session.current) return;
    const q = session.current;
    let html = missingHint(q);
    if (reveal) {
        const targetLabel = q.ask === 'ans' ? 'Answer' : 'Missing number';
        html += `<div class="hint" style="background:#ffe8e8;">${targetLabel}: <b style="font-size:1.4em;">${q[q.ask]}</b> 🌟</div>`;
        html += `<div class="hint">Full equation: <b>${q.a} ${opSym(q.op)} ${q.b} = ${q.ans}</b></div>`;
    }
    if (target) target.innerHTML = html;
}

// ============ End of session ============
function endSession() {
    stopTimer();
    show('end');
    stats.played++;
    persist();
    const dur = Math.round(((Date.now() - session.startedAt) - (session.pausedTotal || 0)) / 1000);
    const asked = session.correct + session.wrong;
    const acc = asked ? Math.round(session.perfectCorrect / asked * 100) : 0;
    $('#end-mascot').textContent = accBadge(acc);
    $('#end-title').textContent = `Great job, ${activeName()}!`;
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
    speak(`Great job, ${activeName()}! You earned ${session.starsEarned} stars.`);
}

function accBadge(acc) {
    if (acc >= 90) return '🏆';
    if (acc >= 75) return '🥇';
    if (acc >= 50) return '🥈';
    return '🌱';
}
function accTitle(acc) {
    if (acc >= 90) return 'GRAND CHAMPION';
    if (acc >= 75) return 'GOLD STAR';
    if (acc >= 50) return 'SILVER STAR';
    return 'KEEP GROWING';
}

// ============ Confetti ============
const cc = document.getElementById('confetti');
let cctx = null;
function sizeCanvas() { if (cc) { cc.width = window.innerWidth; cc.height = window.innerHeight; } }
window.addEventListener('resize', sizeCanvas);
let particles = [];
let confettiRunning = false;
function confettiBurst() {
    if (settings.reducedMotion) return;
    if (!cc) return;
    sizeCanvas();
    cctx = cctx || cc.getContext('2d');
    const colors = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    for (let i = 0; i < 90; i++) {
        particles.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
            y: window.innerHeight / 3,
            vx: (Math.random() - 0.5) * 9,
            vy: -Math.random() * 7 - 3,
            g: 0.28, c: colors[i % colors.length],
            s: 5 + Math.random() * 5, life: 90 + Math.random() * 40,
        });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(tick); }
}
function tick() {
    if (!cctx) return;
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

// ============ Certificate ============
function openCertificate() {
    const name = activeName();
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const s = session || {};
    const hasSession = !!(session && (session.correct || session.wrong));
    const dur = s.startedAt ? Math.round(((Date.now() - s.startedAt) - (s.pausedTotal || 0)) / 1000) : 0;
    const asked = (s.correct || 0) + (s.wrong || 0);
    const acc = asked ? Math.round((s.perfectCorrect || 0) / asked * 100) : 0;
    const tier = accTitle(acc);
    const badge = accBadge(acc);
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
    .badge { font-size: 20px; letter-spacing: 3px; color:#8b4513; margin: 8px 0; }
    .name { font-size: 44px; font-weight: bold; margin: 18px 0 8px; color:#c0392b; border-bottom: 3px solid #d6a419; display:inline-block; padding: 0 40px 6px; text-transform: uppercase; font-style: italic; letter-spacing: 4px; }
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
        <div class="emoji">${badge} 🌟 ${badge}</div>
        <h1>${DEFAULT_CERT_TITLE}</h1>
        <div class="badge">— ${escapeHtml(tier)} —</div>
        <h2>Proudly awarded to</h2>
        <div class="name">${escapeHtml(name)}</div>
        <div class="desc">For sharp mental maths, brave brain-work, and never giving up. Keep practicing — you're a real mathematician! 🚀</div>
        ${sessionSection}
        <div class="section-title">All-time</div>
        <div class="stats">
            <div class="st">⭐ Total stars<br>${stats.totalStars}</div>
            <div class="st">🔥 Best streak<br>${stats.bestStreak}</div>
            <div class="st">🏁 Practices<br>${stats.played}</div>
            <div class="st">📅 Day streak<br>${daily.streakDays || 0}</div>
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
function exportAll() {
    const dump = {
        version: 5,
        exportedAt: new Date().toISOString(),
        appPassword: appPassword,
        profiles: profiles.map(p => ({
            id: p.id, name: p.name, createdAt: p.createdAt,
            settings: LS.load(KEYS.pfx(p.id, 'settings'), {}),
            stats: LS.load(KEYS.pfx(p.id, 'stats'), {}),
            daily: LS.load(KEYS.pfx(p.id, 'daily'), {}),
            weak: LS.load(KEYS.pfx(p.id, 'weak'), []),
            log: LS.load(KEYS.pfx(p.id, 'log'), []),
        })),
        activeId: activeId,
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maths-champions-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Data exported 📤');
}
function importAll(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            if (!data || !Array.isArray(data.profiles)) throw new Error('bad format');
            profiles = data.profiles.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt || Date.now() }));
            data.profiles.forEach(p => {
                LS.save(KEYS.pfx(p.id, 'settings'), p.settings || {});
                LS.save(KEYS.pfx(p.id, 'stats'), p.stats || {});
                LS.save(KEYS.pfx(p.id, 'daily'), p.daily || {});
                LS.save(KEYS.pfx(p.id, 'weak'), p.weak || []);
                LS.save(KEYS.pfx(p.id, 'log'), p.log || []);
            });
            if (data.appPassword) appPassword = data.appPassword;
            if (data.activeId && profiles.find(p => p.id === data.activeId)) activeId = data.activeId;
            else activeId = profiles[0] && profiles[0].id;
            LS.save(KEYS.profiles, profiles);
            LS.save(KEYS.activeId, activeId);
            LS.save(KEYS.appPassword, appPassword);
            loadProfile(activeId);
            renderSetup();
            renderHome();
            toast('Data imported ✅');
        } catch (e) { toast('Import failed ❌'); }
    };
    reader.readAsText(file);
}

// ============ Setup UI data ============
const OPS = [
    { v: '+', label: '➕ Add' },
    { v: '-', label: '➖ Subtract' },
    { v: '*', label: '✖ Multiply' },
    { v: '/', label: '➗ Divide' },
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
const CHOICES = [2, 3, 4, 5, 6, 7, 8, 9].map(v => ({ v, label: String(v) }));
const PLAY_MODES = [
    { v: 'standard', label: '🎯 Standard' },
    { v: 'missing', label: '❓ Missing operand' },
    { v: 'timed', label: '⏱ Timed challenge' },
];
const TIME_LIMITS = [30, 45, 60, 90, 120].map(v => ({ v, label: `${v}s` }));
const YESNO = [
    { v: true, label: 'Yes' },
    { v: false, label: 'No' },
];

function renderChips(rootSel, items, current, multi, extraClass = '', onChange = null) {
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
            if (sel.includes(v)) { if (sel.length > 0) sel = sel.filter(x => x !== v); }
            else sel = [...sel, v];
        } else sel = v;
        paint();
        if (onChange) onChange(sel);
        persist();
    };
}

// Render per-operation left/right operand chip rows.
function renderOpRanges() {
    const container = $('#opranges-container');
    if (!container) return;
    const opsMeta = [
        { op: '+', label: 'Addition', leftLabel: 'Left (a)', rightLabel: 'Right (b)', leftPool: RANGE_0_15, rightPool: RANGE_0_15 },
        { op: '-', label: 'Subtraction', leftLabel: 'Left (a)', rightLabel: 'Right (b)', leftPool: RANGE_0_15, rightPool: RANGE_0_15 },
        { op: '*', label: 'Multiplication', leftLabel: 'Left (a)', rightLabel: 'Right (b)', leftPool: RANGE_0_15, rightPool: RANGE_0_15 },
        { op: '/', label: 'Division', leftLabel: 'Divisor (b, no 0)', rightLabel: 'Quotient (answer)', leftPool: RANGE_1_15, rightPool: RANGE_0_15 },
    ];
    container.innerHTML = opsMeta.map(o => {
        const alias = OP_ALIAS[o.op];
        return `
        <div class="group op-ranges-group" style="border:2px dashed #ddd; border-radius:12px; padding:10px 12px;">
            <div class="group-title">${o.label} (${opSym(o.op)})</div>
            <div class="group-sub">${o.leftLabel}</div>
            <div class="chip-row small-chips" id="oprange-left-${alias}"></div>
            <div class="group-sub" style="margin-top:8px;">${o.rightLabel}</div>
            <div class="chip-row small-chips" id="oprange-right-${alias}"></div>
        </div>
        `;
    }).join('');
    for (const o of opsMeta) {
        const alias = OP_ALIAS[o.op];
        const leftItems = o.leftPool.map(v => ({ v, label: String(v) }));
        const rightItems = o.rightPool.map(v => ({ v, label: String(v) }));
        const opRef = o.op;
        renderChips(`#oprange-left-${alias}`, leftItems, (settings.opRanges[opRef] && settings.opRanges[opRef].left) || [], true, '', v => {
            settings.opRanges[opRef].left = v.slice().sort((a, b) => a - b);
        });
        renderChips(`#oprange-right-${alias}`, rightItems, (settings.opRanges[opRef] && settings.opRanges[opRef].right) || [], true, '', v => {
            settings.opRanges[opRef].right = v.slice().sort((a, b) => a - b);
        });
    }
}

function renderProfileList() {
    const list = $('#profile-list');
    if (!list) return;
    list.innerHTML = profiles.map(p => `
        <div class="profile-row ${p.id === activeId ? 'active' : ''}">
            <b class="grow">${escapeHtml(p.name)}</b>
            <button class="btn ghost" data-act="switch" data-id="${p.id}">Switch</button>
            <button class="btn ghost" data-act="rename" data-id="${p.id}">Rename</button>
            <button class="btn danger" data-act="delete" data-id="${p.id}" ${profiles.length <= 1 ? 'disabled' : ''}>🗑</button>
        </div>
    `).join('');
    list.onclick = (e) => {
        const b = e.target.closest('button[data-act]');
        if (!b) return;
        const id = b.dataset.id, act = b.dataset.act;
        sfx.click();
        if (act === 'switch') {
            if (id !== activeId) { loadProfile(id); renderSetup(); renderHome(); toast('Switched profile'); }
        } else if (act === 'rename') {
            const name = window.prompt('New name for this profile:', profiles.find(p => p.id === id).name);
            if (name && name.trim()) {
                profiles.find(p => p.id === id).name = name.trim().slice(0, 24);
                persist();
                renderProfileList();
                renderHome();
            }
        } else if (act === 'delete') {
            if (profiles.length <= 1) return;
            if (!window.confirm('Delete this profile and all its data?')) return;
            LS.remove(KEYS.pfx(id, 'settings'));
            LS.remove(KEYS.pfx(id, 'stats'));
            LS.remove(KEYS.pfx(id, 'weak'));
            LS.remove(KEYS.pfx(id, 'log'));
            LS.remove(KEYS.pfx(id, 'daily'));
            profiles = profiles.filter(p => p.id !== id);
            if (activeId === id) activeId = profiles[0].id;
            persist();
            loadProfile(activeId);
            renderProfileList();
            renderSetup();
            renderHome();
        }
    };
}

function renderSetup() {
    renderProfileList();
    renderChips('#op-chips', OPS, settings.ops, true, '', v => {
        settings.ops = v;
        renderHome();  // drill buttons depend on enabled ops
    });
    renderOpRanges();
    renderChips('#timelimit-chips', TIME_LIMITS, parseInt(settings.timeLimit, 10) || 60, false, '', v => { settings.timeLimit = v; });
    renderChips('#len-chips', LENS, settings.length, false, '', v => {
        settings.length = v;
        const inp = $('#input-length');
        if (inp) inp.value = (typeof v === 'number') ? v : '';
    });
    renderChips('#mode-chips', MODES, settings.modes, true, '', v => { settings.modes = v; });
    renderChips('#choices-chips', CHOICES, parseInt(settings.numChoices, 10) || 4, false, '', v => { settings.numChoices = v; });
    renderChips('#icon-chips', ICON_CHOICES.map(v => ({ v, label: v })), settings.iconPrimary, false, 'icon-chip', v => { settings.iconPrimary = v; });
    renderChips('#neg-chips', YESNO, !!settings.allowNegative, false, '', v => { settings.allowNegative = v; });
    renderChips('#sound-chips', YESNO, !!settings.sound, false, '', v => { settings.sound = v; $('#btn-sound').textContent = settings.sound ? '🔊' : '🔇'; });
    renderChips('#voice-chips', YESNO, !!settings.voice, false, '', v => { settings.voice = v; });
    renderChips('#rm-chips', YESNO, !!settings.reducedMotion, false, '', v => { settings.reducedMotion = v; applyReducedMotion(); });
    renderChips('#hintpopup-chips', YESNO, !!settings.hintPopup, false, '', v => { settings.hintPopup = v; });

    $('#input-length').value = (typeof settings.length === 'number') ? settings.length : '';
    $('#input-star-max').value = settings.starMax;
    $('#input-star-step').value = settings.starStep;
    $('#input-new-password').value = '';
    const openLog = $('#btn-open-log');
    if (openLog) openLog.textContent = `📝 View log (${log.length})`;
}

function renderHomeDrillButtons() {
    const container = $('#home-drill-buttons');
    const section = $('#home-drill-section');
    if (!container) return;
    const enabled = settings.ops || [];
    const items = [
        { op: '+', sym: '➕' },
        { op: '-', sym: '➖' },
        { op: '*', sym: '✖️' },
        { op: '/', sym: '➗' },
    ];
    const active = items.filter(i => enabled.includes(i.op));
    if (section) section.hidden = active.length === 0;
    const ad = settings.activeDrill;
    container.innerHTML = active.map(i => {
        const isOn = ad && ad.op === i.op;
        const baseTag = isOn ? `<span class="drill-base">${ad.base}</span>` : '';
        return `<button class="drill-icon ${isOn ? 'on' : ''}" data-op="${i.op}" title="Table of ${i.op}">
            <span class="drill-op-sym">${i.sym}</span>
            <span class="drill-label">TABLE</span>
            ${baseTag}
        </button>`;
    }).join('');
    container.onclick = (e) => {
        const b = e.target.closest('button[data-op]');
        if (!b) return;
        sfx.click();
        const op = b.dataset.op;
        if (settings.activeDrill && settings.activeDrill.op === op) {
            // toggle off if same op is already selected
            settings.activeDrill = null;
            persist();
            renderHome();
        } else {
            openDrillModal(op);
        }
    };
}

function renderHome() {
    ensureProfile();
    const p = activeProfile();
    $('#profile-pill').textContent = `👤 ${p.name}`;
    const pillBtn = $('#profile-pill');
    if (pillBtn) {
        const canSwitch = profiles.length > 1;
        pillBtn.style.pointerEvents = canSwitch ? '' : 'none';
        pillBtn.style.cursor = canSwitch ? '' : 'default';
        pillBtn.title = canSwitch ? 'Switch profile' : '';
    }
    $('#badge-days').textContent = `📅 ${daily.streakDays || 0} day${(daily.streakDays === 1) ? '' : 's'}`;
    $('#badge-total').textContent = `⭐ ${stats.totalStars}`;
    $('#home-title').textContent = APP_NAME;
    $('#home-tagline').textContent = APP_TAGLINE;
    $('#home-greeting').innerHTML = `Hi, <b>${escapeHtml(p.name)}</b>! Ready to practice? ${settings.iconPrimary}`;
    $('#home-stats').innerHTML = `
        <div class="stat">⭐ ${stats.totalStars} <small>stars</small></div>
        <div class="stat">🔥 ${stats.bestStreak} <small>best streak</small></div>
        <div class="stat">🏁 ${stats.played} <small>practices</small></div>
        <div class="stat">📅 ${daily.streakDays || 0} <small>day streak</small></div>
    `;
    $('#btn-focus').hidden = weak.length === 0;
    $('#btn-home-cert').hidden = !(stats.played > 0 || stats.totalStars > 0);
    const tip = $('#home-tip'); if (tip) tip.hidden = profiles.length <= 1;
    updateVoiceToggle();
    renderChips('#home-playmode-chips', PLAY_MODES,
        settings.activeDrill ? '__none__' : (settings.playMode || 'standard'),
        false, '', v => {
            settings.playMode = v;
            settings.activeDrill = null;
            renderHomeDrillButtons();
            renderPlayLabel();
            const row = $('#home-playmode-chips');
            if (row) row.classList.remove('overridden');
        });
    const modeRow = $('#home-playmode-chips');
    if (modeRow) modeRow.classList.toggle('overridden', !!settings.activeDrill);
    renderHomeDrillButtons();
    renderPlayLabel();
}

// ============ Drill modal ============
function openDrillModal(op) {
    const m = $('#modal-drill');
    if (!m) return;
    let bases = (settings.opRanges[op] && settings.opRanges[op].left) || [];
    if (op === '/') bases = bases.filter(v => v > 0);
    bases = bases.slice().sort((a, b) => a - b);
    $('#drill-title').innerHTML = `Pick the number to practice <span class="drill-op-name">${opName(op)}</span> table`;
    //$('#drill-desc').textContent = op === '/' ? 'Divisor to practice (fixed part of each question):' : 'Base number to practice (fixed part of each question):';
    if (!bases.length) {
        $('#drill-base-chips').innerHTML = `<div style="opacity:.7;">No base numbers are selected in Settings for ${opSym(op)}. Open Settings → operand ranges to enable some.</div>`;
    } else {
        $('#drill-base-chips').innerHTML = bases.map(v =>
            `<button class="option-chip" data-base="${v}">${v}</button>`
        ).join('');
    }
    $('#drill-base-chips').onclick = (e) => {
        const b = e.target.closest('.option-chip[data-base]');
        if (!b) return;
        const base = parseInt(b.dataset.base, 10);
        sfx.click();
        settings.activeDrill = { op, base };
        persist();
        m.hidden = true;
        renderHome();
    };
    m.hidden = false;
}

function renderPlayLabel() {
    const b = $('#btn-play');
    if (!b) return;
    const ad = settings.activeDrill;
    if (ad) {
        b.innerHTML = '▶ PLAY' //`▶ PLAY<span class="play-sub">${opSym(ad.op)} Table of ${ad.base}</span>`;
    } else {
        b.textContent = '▶ PLAY';
    }
}

// ============ Log modal ============
let logFilter = 'all';

function tagFor(f) {
    if (f.ok) return `✅ ×${f.attempts}${f.mul > 1 ? ` <span style="color:#c0392b;">×${f.mul} streak!</span>` : ''}`;
    if (f.shownAnswer) return '👁 answer shown';
    if (f.skipped) return '⤼ skipped';
    return `✗ ${f.attempts} wrong`;
}
function filteredLog() {
    return log.filter(f => {
        if (logFilter === 'all') return true;
        if (logFilter === 'ok') return f.ok;
        if (logFilter === 'bad') return !f.ok;
        if (logFilter === 'hint') return f.usedHint;
        return true;
    });
}
function renderLog() {
    const list = $('#log-list');
    if (!list) return;
    const rows = filteredLog();
    const okCount = log.filter(x => x.ok).length;
    const badCount = log.length - okCount;
    $('#log-header').innerHTML = `<div style="opacity:.7; font-size:13px;">${log.length} total · <b>${okCount}</b> correct · <b>${badCount}</b> not solved · showing <b>${rows.length}</b></div>`;
    if (!rows.length) { list.innerHTML = '<em style="opacity:.6;">No entries in this filter.</em>'; return; }
    list.innerHTML = rows.map(f => {
        const d = new Date(f.when).toLocaleString();
        const hint = f.usedHint ? ' 💡' : '';
        const stars = f.ok ? ` · <b style="color:#c0392b;">+${f.stars} ⭐</b>` : '';
        const wrongs = (Array.isArray(f.wrongAnswers) && f.wrongAnswers.length)
            ? ` <span style="opacity:.75;">tried: <b style="color:#a04b4b;">${f.wrongAnswers.map(w => escapeHtml(String(w))).join(', ')}</b></span>`
            : '';
        const ask = f.ask === 'ans' ? `${f.a} ${opSym(f.op)} ${f.b} = ${f.ans}`
            : f.ask === 'a' ? `? ${opSym(f.op)} ${f.b} = ${f.ans} <span style="opacity:.6;">(? = ${f.target})</span>`
            : `${f.a} ${opSym(f.op)} ? = ${f.ans} <span style="opacity:.6;">(? = ${f.target})</span>`;
        return `<div class="log-row ${f.ok ? 'ok' : 'bad'}">
            <b style="min-width:150px;">${ask}</b>
            <span>${tagFor(f)}${hint}${stars}</span>${wrongs}
            <span style="margin-left:auto; opacity:.5; font-size:12px;">${d}</span>
        </div>`;
    }).join('');
}
function renderLogFilters() {
    const opts = [
        { v: 'all', label: 'All' },
        { v: 'ok', label: '✅ Correct' },
        { v: 'bad', label: '✗ Not solved' },
        { v: 'hint', label: '💡 Hint used' },
    ];
    $('#log-filters').innerHTML = opts.map(o =>
        `<button class="chip ${logFilter === o.v ? 'on' : ''}" data-v="${o.v}">${o.label}</button>`
    ).join('');
    $('#log-filters').onclick = (e) => {
        const b = e.target.closest('.chip'); if (!b) return;
        sfx.click();
        logFilter = b.dataset.v;
        renderLogFilters();
        renderLog();
    };
}

// ============ Wire up ============
function wire() {
    $('#pass-ok').addEventListener('click', () => { sfx.click(); tryPassword(); });
    $('#pass-cancel').addEventListener('click', () => { sfx.click(); closePasswordModal(); });
    $('#pass-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); tryPassword(); }
        else if (e.key === 'Escape') { e.preventDefault(); closePasswordModal(); }
    });

    $('#btn-play').addEventListener('click', () => {
        sfx.click();
        show('play');
        if (settings.activeDrill) {
            startTableDrill(settings.activeDrill.op, settings.activeDrill.base);
        } else {
            newSession();
        }
    });
    $('#btn-focus').addEventListener('click', () => { sfx.click(); show('play'); newSession({ focusWeak: true }); });
    $('#btn-home-cert').addEventListener('click', () => { sfx.click(); openCertificate(); });
    const setupBtn = $('#btn-setup');
    if (setupBtn) setupBtn.addEventListener('click', () => {
        sfx.click();
        requireSettingsAccess(() => { renderSetup(); show('setup'); });
    });
    $('#profile-pill').addEventListener('click', () => { sfx.click(); openProfileQuickModal(); });

    $('#btn-back-home').addEventListener('click', () => { sfx.click(); renderHome(); show('home'); });
    $('#btn-start').addEventListener('click', () => { sfx.click(); show('play'); newSession(); });

    $('#btn-home').addEventListener('click', () => {
        sfx.click();
        stopTimer();
        removeKeypadKeys();
        renderHome();
        show('home');
    });
    $('#btn-gear').addEventListener('click', () => {
        sfx.click();
        requireSettingsAccess(() => {
            stopTimer();
            removeKeypadKeys();
            renderSetup();
            show('setup');
        });
    });
    $('#btn-sound').addEventListener('click', () => {
        settings.sound = !settings.sound;
        persist();
        $('#btn-sound').textContent = settings.sound ? '🔊' : '🔇';
    });
    $('#btn-sound').textContent = settings.sound ? '🔊' : '🔇';

    $('#btn-voice-toggle').addEventListener('click', () => {
        if (!settings.voice) return;
        sfx.click();
        settings.voiceEnabled = settings.voiceEnabled === false ? true : false;
        if (settings.voiceEnabled === false && 'speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch { }
        }
        persist();
        updateVoiceToggle();
        toast(settings.voiceEnabled ? 'Voice on 🗣' : 'Voice off 🔇');
    });

    $('#btn-hint').addEventListener('click', () => {
        if (!session || session.answered) return;
        sfx.click();
        if (!session.usedHint) {
            session.usedHint = true;
            session.currentStars = Math.max(1, session.currentStars - starStep());
            updateHud();
        }
        if (settings.hintPopup) {
            showHintInto($('#hint-modal-content'), false);
            $('#modal-hint').hidden = false;
        } else {
            showHintInto($('#hint-slot'), false);
            $('#hint-slot').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    $('#btn-hint-close').addEventListener('click', () => { sfx.click(); $('#modal-hint').hidden = true; });

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

    $('#btn-again').addEventListener('click', () => { sfx.click(); show('play'); restartLastSession(); });
    $('#btn-focus-end').addEventListener('click', () => { sfx.click(); show('play'); newSession({ focusWeak: true }); });
    $('#btn-end-home').addEventListener('click', () => { sfx.click(); renderHome(); show('home'); });
    $('#btn-cert').addEventListener('click', () => { sfx.click(); openCertificate(); });

    $('#input-length').addEventListener('input', (e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n > 0 && n <= 999) {
            settings.length = n;
            persist();
            renderChips('#len-chips', LENS, settings.length, false, '', v => { settings.length = v; });
        }
    });
    $('#input-star-max').addEventListener('input', (e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n >= 1 && n <= 999) { settings.starMax = n; persist(); }
    });
    $('#input-star-step').addEventListener('input', (e) => {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n >= 1 && n <= 999) { settings.starStep = n; persist(); }
    });
    $('#btn-save-password').addEventListener('click', () => {
        sfx.click();
        const el = $('#input-new-password');
        if (!el) return;
        const v = (el.value || '').trim();
        if (v.length < 2) { toast('Code must be at least 2 characters'); return; }
        appPassword = v;
        persist();
        el.value = '';
        toast('Grown-up code updated 🔒');
    });

    $('#btn-new-profile').addEventListener('click', () => {
        sfx.click();
        const name = window.prompt('Name for the new profile:', 'Champion');
        if (!name) return;
        const p = { id: 'p_' + Date.now(), name: name.trim().slice(0, 24) || 'Champion', createdAt: Date.now() };
        profiles.push(p);
        loadProfile(p.id);
        persist();
        renderSetup();
        renderHome();
        toast('Profile created ✨');
    });

    $('#btn-export').addEventListener('click', () => { sfx.click(); exportAll(); });
    $('#btn-import').addEventListener('click', () => { sfx.click(); $('#file-import').click(); });
    $('#file-import').addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) importAll(f);
        e.target.value = '';
    });
    $('#btn-reset-profile').addEventListener('click', () => { sfx.click(); resetAllForProfile(); });
    $('#btn-reset-all').addEventListener('click', () => { sfx.click(); resetEverything(); });

    $('#btn-open-log').addEventListener('click', () => {
        sfx.click();
        logFilter = 'all';
        renderLogFilters();
        renderLog();
        $('#modal-log').hidden = false;
    });
    $('#btn-log-close').addEventListener('click', () => { sfx.click(); $('#modal-log').hidden = true; });
    $('#btn-clear-log').addEventListener('click', () => {
        sfx.click();
        if (!window.confirm('Clear the question log for this profile?')) return;
        log = [];
        persist();
        renderLog();
        const openLog = $('#btn-open-log');
        if (openLog) openLog.textContent = `📝 View log (${log.length})`;
        toast('Cleared 🧹');
    });

    $('#drill-close') && $('#drill-close').addEventListener('click', () => { sfx.click(); $('#modal-drill').hidden = true; });
    // click outside drill modal to dismiss
    $('#modal-drill').addEventListener('click', (e) => {
        if (e.target === $('#modal-drill')) $('#modal-drill').hidden = true;
    });
    // Escape closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        ['modal-drill', 'modal-hint', 'modal-log', 'modal-profile'].forEach(id => {
            const m = document.getElementById(id);
            if (m && !m.hidden) m.hidden = true;
        });
    });
}

function openProfileQuickModal() {
    const m = $('#modal-profile');
    if (!m) return;
    const list = $('#profile-quick-list');
    list.innerHTML = profiles.map(p => `
        <div class="profile-row ${p.id === activeId ? 'active' : ''}">
            <b class="grow">${escapeHtml(p.name)}</b>
            ${p.id === activeId
                ? '<span style="opacity:.6;">current</span>'
                : `<button class="btn ghost" data-id="${p.id}">Switch</button>`}
        </div>
    `).join('');
    list.onclick = (e) => {
        const b = e.target.closest('button[data-id]');
        if (!b) return;
        sfx.click();
        loadProfile(b.dataset.id);
        renderHome();
        m.hidden = true;
    };
    m.hidden = false;
}

// ============ Init ============
function init() {
    ensureProfile();
    loadProfile(activeId);
    wire();
    $('#profile-quick-close').addEventListener('click', () => { sfx.click(); $('#modal-profile').hidden = true; });
    renderHome();
    show('home');
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
