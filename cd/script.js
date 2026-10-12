// Events use descriptive URL keys, with one-letter aliases accepted for older links.
// Edits are always saved to localStorage.
var STORAGE_KEY = 'countdown.counters';
var YEAR = new Date().getFullYear();
var DEFAULTS = [
    { title: 'Christmas', raw: YEAR + '-12-25T00:00' },
    { title: 'This Year', raw: YEAR + '-01-01T00:00' }
];
var MAX = 12;
var DEFAULT_COLOR = '#818cf8';
var DEFAULT_UP_COLOR = '#f59e0b';

// units contains selected Tick format keys, largest first.
var ALL_UNITS = 'yMdhms';
var UNIT_ORDER = 'yMwdhms';

function formatFor(units) {
    return units.split('');
}

function toUnits(u) {
    u = u || '';
    // Legacy format used a lowercase 'm' prefix for months.
    if (/^(ym|m)dhms$/.test(u)) return (u[0] === 'y' ? 'yM' : 'M') + 'dhms';
    if (!/^[yMwdhms]+$/.test(u)) return ALL_UNITS;
    return UNIT_ORDER.split('').filter(function (unit) { return u.indexOf(unit) !== -1; }).join('');
}

function toColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
}

function toCounter(title, raw, units, color, upColor, message) {
    return {
        title: title,
        raw: raw,
        date: new Date(raw),
        units: toUnits(units),
        color: toColor(color, DEFAULT_COLOR),
        upColor: toColor(upColor, DEFAULT_UP_COLOR),
        message: String(message || '').slice(0, 120)
    };
}

function toList(items) {
    return items
        .filter(function (c) { return c && typeof c.raw === 'string' && !isNaN(new Date(c.raw)); })
        .slice(0, MAX)
        .map(function (c, i) {
            return toCounter(String(c.title || 'Event ' + (i + 1)).slice(0, 60), c.raw, c.units, c.color, c.upColor, c.message);
        });
}

function urlParam(params, name, alias, index) {
    var key = name + index;
    return params.has(key) ? params.get(key) : params.get(alias + index);
}

function readUrlCounters() {
    var params = new URLSearchParams(location.search);
    var items = [];
    for (var i = 1; i <= MAX; i++) {
        var date = urlParam(params, 'date', 'd', i);
        if (date === null) continue;
        items.push({
            title: urlParam(params, 'title', 't', i),
            raw: date,
            units: urlParam(params, 'units', 'u', i),
            color: urlParam(params, 'count_down_color', 'c', i),
            upColor: urlParam(params, 'count_up_color', 'cu', i),
            message: urlParam(params, 'message', 'm', i)
        });
    }
    return toList(items);
}

function readCounters() {
    var fromUrl = readUrlCounters();
    if (fromUrl.length) return fromUrl;
    var saved = [];
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {}
    var list = toList(Array.isArray(saved) ? saved : []);
    if (list.length) return list;
    return DEFAULTS.map(function (c) { return toCounter(c.title, c.raw); });
}

// Drop URL counters after saving or resetting so localStorage takes over.
function reloadWithoutUrlCounters() {
    location.href = location.pathname;
}

var counters = readCounters();
var grid = document.querySelector('.counters');
var tpl = document.getElementById('card-tpl');

counters.forEach(function (cfg, i) {
    var card = tpl.content.firstElementChild.cloneNode(true);
    card.dataset.index = i;
    card.style.setProperty('--color-down', cfg.color);
    card.style.setProperty('--color-up', cfg.upColor);
    card.querySelector('.title').textContent = cfg.title;
    card.querySelector('.target').textContent = cfg.date.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    grid.appendChild(card);
});

// Pick the column count that gives each card the largest digits.
function layoutGrid() {
    var n = counters.length;
    var groups = Math.max.apply(null, counters.map(function (c) { return formatFor(c.units).length; }));
    var gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
    var W = grid.clientWidth, H = grid.clientHeight;
    var best = 1, bestScore = 0;
    for (var c = 1; c <= n; c++) {
        var r = Math.ceil(n / c);
        var w = (W - gap * (c - 1)) / c;
        var h = (H - gap * (r - 1)) / r;
        var score = Math.min(w / (1.5 * groups), h - 40);
        if (score > bestScore) { bestScore = score; best = c; }
    }
    grid.style.gridTemplateColumns = 'repeat(' + best + ', minmax(0, 1fr))';
    grid.style.gridTemplateRows = 'repeat(' + Math.ceil(n / best) + ', minmax(0, 1fr))';
}

// Scale the flip digits so they fill the card without overflowing.
function fit(card) {
    var clock = card.querySelector('.clock');
    var face = card.querySelector('.face');
    if (!face.offsetWidth || !face.offsetHeight) return;
    var current = parseFloat(face.style.fontSize) || 40;
    var scale = Math.min(clock.clientWidth / face.offsetWidth, clock.clientHeight / face.offsetHeight) * 0.94;
    var next = Math.max(8, current * scale);
    if (Math.abs(next - current) > 0.5) face.style.fontSize = next + 'px';
}

function fitAll() {
    document.querySelectorAll('.card').forEach(fit);
}

var observer = new ResizeObserver(function () {
    layoutGrid();
    requestAnimationFrame(fitAll);
});
observer.observe(grid);
document.querySelectorAll('.clock').forEach(function (el) { observer.observe(el); });
layoutGrid();

function setMode(card, up) {
    card.classList.toggle('is-up', up);
    card.querySelector('.badge').textContent = up ? 'Time since' : 'Counting down';
}

// Drop leading zero year/month groups and attach unit labels.
function present(tick, format, value, prefix) {
    var start = 0;
    while (start < format.length - 1 && /^[yM]$/.test(format[start]) && value[start] === 0) start++;
    tick.value = value.slice(start).map(function (v, i) {
        return tick.getPreset(format[start + i])(v, tick.getConstants());
    });
    tick.root.setAttribute('aria-label', prefix + value.join(':'));
}

function startCountUp(tick, card, cfg) {
    var format = formatFor(cfg.units);
    setMode(card, true);
    card.classList.add('arrived');
    card.querySelector('.arrival').textContent = arrivalText(cfg);
    Tick.count.up(cfg.date, { format: format }).onupdate = function (value) {
        present(tick, format, value, 'Elapsed: ');
    };
}

function handleTickInit(tick) {
    var card = tick.root.closest('.card');
    var cfg = counters[card.dataset.index];

    observer.observe(card.querySelector('.face'));

    if (cfg.date <= Date.now()) {
        startCountUp(tick, card, cfg);
        return;
    }

    setMode(card, false);
    var format = formatFor(cfg.units);
    var counter = Tick.count.down(cfg.date, { format: format });
    counter.onupdate = function (value) {
        present(tick, format, value, 'Remaining: ');
    };
    counter.onended = function () {
        celebrateArrival(card);
        startCountUp(tick, card, cfg);
    };
}

var form = document.getElementById('settings');
var dialog = document.getElementById('editor');
var rows = document.getElementById('rows');
var addBtn = document.getElementById('add');
var arrivalAudioContext;

function primeArrivalAudio() {
    if (!arrivalAudioContext) {
        var AudioContextType = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextType) return;
        try { arrivalAudioContext = new AudioContextType(); } catch (e) { return; }
    }
    if (arrivalAudioContext.state === 'suspended') arrivalAudioContext.resume().catch(function () {});
}

document.addEventListener('pointerdown', primeArrivalAudio, { once: true });
document.addEventListener('keydown', primeArrivalAudio, { once: true });

function arrivalText(cfg) {
    return cfg.message || '';
}

function playArrivalSound() {
    primeArrivalAudio();
    if (!arrivalAudioContext) return;
    var context = arrivalAudioContext;
    var play = function () {
        var start = context.currentTime;
        [659.25, 880, 1046.5].forEach(function (frequency, index) {
            var noteStart = start + index * .16;
            var oscillator = context.createOscillator();
            var gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, noteStart);
            gain.gain.setValueAtTime(.0001, noteStart);
            gain.gain.exponentialRampToValueAtTime(.12, noteStart + .02);
            gain.gain.exponentialRampToValueAtTime(.0001, noteStart + .3);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(noteStart);
            oscillator.stop(noteStart + .31);
        });
    };
    if (context.state === 'suspended') context.resume().then(play).catch(function () {});
    else play();
}

function celebrateArrival(card) {
    card.classList.add('celebrating');
    setTimeout(function () { card.classList.remove('celebrating'); }, 30000);
    playArrivalSound();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof window.confetti !== 'function') return;

    var end = Date.now() + 30000;
    var fireCannons = function () {
        var rect = card.getBoundingClientRect();
        var originY = Math.min(.9, Math.max(.1, (rect.top + rect.height * .65) / window.innerHeight));
        [0.25, 0.75].forEach(function (position, index) {
            window.confetti({
                particleCount: 14,
                angle: index === 0 ? 60 : 120,
                spread: 52,
                startVelocity: 40,
                origin: { x: (rect.left + rect.width * position) / window.innerWidth, y: originY },
                colors: [getComputedStyle(card).getPropertyValue('--color-up').trim(), '#22c55e', '#f59e0b'],
                ticks: 120,
                zIndex: 10
            });
        });
    };
    fireCannons();
    var confettiTimer = setInterval(function () {
        if (Date.now() >= end) {
            clearInterval(confettiTimer);
            return;
        }
        fireCannons();
    }, 1800);
}

function moveRow(row, before, draggedRow) {
    var positions = Array.prototype.map.call(rows.children, function (item) {
        return { item: item, top: item.getBoundingClientRect().top };
    });
    positions.forEach(function (position) {
        position.item.getAnimations().forEach(function (animation) { animation.cancel(); });
    });
    rows.insertBefore(row, before);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    positions.forEach(function (position) {
        if (position.item === draggedRow) return;
        var distance = position.top - position.item.getBoundingClientRect().top;
        if (distance) position.item.animate([
            { transform: 'translateY(' + distance + 'px)' },
            { transform: 'translateY(0)' }
        ], { duration: 180, easing: 'ease-out' });
    });
}

function addRow(c) {
    var row = document.createElement('div');
    row.className = 'edit-row';
    row.innerHTML =
        '<input type="text" name="t" maxlength="60" placeholder="Title" required>' +
        '<input type="datetime-local" name="d" required>' +
        '<input type="text" name="message" maxlength="120" placeholder="Message" aria-label="Message">' +
        '<div class="chips" role="group" aria-label="Units shown">' +
                '<button type="button" class="chip" data-unit="y" title="Years" aria-label="Years">Y</button>' +
                '<button type="button" class="chip" data-unit="M" title="Months" aria-label="Months">M</button>' +
                '<button type="button" class="chip" data-unit="w" title="Weeks" aria-label="Weeks">W</button>' +
                '<button type="button" class="chip" data-unit="d" title="Days" aria-label="Days">D</button>' +
                '<button type="button" class="chip" data-unit="h" title="Hours" aria-label="Hours">H</button>' +
                '<button type="button" class="chip" data-unit="m" title="Minutes" aria-label="Minutes">M</button>' +
                '<button type="button" class="chip" data-unit="s" title="Seconds" aria-label="Seconds">S</button>' +
        '</div>' +
        '<input type="hidden" name="u">' +
        '<input type="color" name="c" aria-label="Counting down colour" title="Counting down colour">' +
        '<input type="color" name="cu" aria-label="Counting up colour" title="Counting up colour">' +
        '<button type="button" class="ghost grip" aria-label="Reorder event: drag, or use Up and Down arrow keys" title="Drag to reorder">' +
            '<svg viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">' +
                '<circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>' +
                '<circle cx="2.5" cy="8" r="1.5"/><circle cx="7.5" cy="8" r="1.5"/>' +
                '<circle cx="2.5" cy="13.5" r="1.5"/><circle cx="7.5" cy="13.5" r="1.5"/>' +
            '</svg>' +
        '</button>' +
        '<button type="button" class="ghost remove" aria-label="Remove event" title="Remove">&times;</button>';
    var units = row.querySelector('[name=u]');
    var chips = row.querySelectorAll('.chip');
    var selected = toUnits(c.units);
    var render = function () {
        units.value = selected;
        chips.forEach(function (chip) {
            var pressed = selected.indexOf(chip.dataset.unit) !== -1;
            chip.setAttribute('aria-pressed', pressed);
            chip.disabled = pressed && selected.length === 1;
            chip.title = chip.getAttribute('aria-label') + ': ' + (chip.disabled
                ? 'At least one unit must stay selected'
                : 'Click to ' + (pressed ? 'hide' : 'show'));
        });
    };
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var unit = chip.dataset.unit;
            if (selected.indexOf(unit) !== -1) {
                if (selected.length === 1) return;
                selected = selected.replace(unit, '');
            } else {
                selected = toUnits(selected + unit);
            }
            render();
        });
    });
    render();
    row.querySelector('[name=t]').value = c.title;
    row.querySelector('[name=d]').value = c.raw.slice(0, 16);
    row.querySelector('[name=message]').value = c.message || arrivalText(c);
    row.querySelector('[name=c]').value = c.color;
    row.querySelector('[name=cu]').value = c.upColor;
    row.querySelector('.remove').addEventListener('click', function () {
        if (rows.children.length > 1) row.remove();
        updateRows();
    });
    var grip = row.querySelector('.grip');
    grip.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' && row.previousElementSibling) {
            moveRow(row, row.previousElementSibling);
        } else if (e.key === 'ArrowDown' && row.nextElementSibling) {
            moveRow(row, row.nextElementSibling.nextElementSibling);
        } else {
            return;
        }
        e.preventDefault();
        grip.focus();
    });
    grip.addEventListener('pointerdown', function (e) {
        if (!e.isPrimary || e.button !== 0) return;
        e.preventDefault();
        grip.focus({ preventScroll: true });
        rows.setPointerCapture(e.pointerId);
        var startY = e.clientY;
        var pointerY = startY;
        var startTop = row.getBoundingClientRect().top;
        var dragged = false;
        var frame;
        row.classList.add('grabbed');
        var draw = function () {
            if (dragged) {
                var bounds = dialog.getBoundingClientRect();
                if (pointerY < bounds.top + 60) dialog.scrollTop -= 8;
                else if (pointerY > bounds.bottom - 60) dialog.scrollTop += 8;
                row.style.transform = '';
                var before = null;
                Array.prototype.some.call(rows.children, function (item) {
                    if (item === row) return false;
                    var center = rows.getBoundingClientRect().top + item.offsetTop + item.offsetHeight / 2;
                    if (pointerY < center) { before = item; return true; }
                    return false;
                });
                if (before !== row.nextElementSibling) moveRow(row, before, row);
                row.style.transform = 'translateY(' + (startTop + pointerY - startY - row.getBoundingClientRect().top) + 'px)';
            }
            frame = requestAnimationFrame(draw);
        };
        var onMove = function (ev) {
            if (ev.pointerId !== e.pointerId) return;
            pointerY = ev.clientY;
            if (!dragged && Math.abs(pointerY - startY) >= 5) {
                dragged = true;
                row.classList.add('dragging');
            }
        };
        var onUp = function (ev) {
            if (ev.pointerId !== e.pointerId) return;
            cancelAnimationFrame(frame);
            rows.removeEventListener('pointermove', onMove);
            rows.removeEventListener('pointerup', onUp);
            rows.removeEventListener('pointercancel', onUp);
            rows.removeEventListener('lostpointercapture', onUp);
            var offset = row.style.transform;
            row.style.transform = '';
            row.classList.remove('dragging', 'grabbed');
            grip.focus({ preventScroll: true });
            if (offset && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                row.animate([{ transform: offset }, { transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' });
            }
        };
        rows.addEventListener('pointermove', onMove);
        rows.addEventListener('pointerup', onUp);
        rows.addEventListener('pointercancel', onUp);
        rows.addEventListener('lostpointercapture', onUp);
        frame = requestAnimationFrame(draw);
    });
    rows.appendChild(row);
    updateRows();
}

function updateRows() {
    Array.prototype.forEach.call(rows.children, function (row) {
        row.querySelector('.remove').disabled = rows.children.length === 1;
    });
    addBtn.disabled = rows.children.length >= MAX;
}

// Rebuild rows on every open so cancelled edits are discarded.
function resetRows() {
    rows.replaceChildren();
    counters.forEach(addRow);
}

var settingsToggle = document.getElementById('settings-toggle');
var closeTimer;
if (window.lucide) window.lucide.createIcons();

function openEditor(side) {
    if (dialog.open) return;
    clearTimeout(closeTimer);
    dialog.classList.remove('closing');
    dialog.dataset.side = side || 'right';
    resetRows();
    dialog.showModal();
    settingsToggle.setAttribute('aria-expanded', 'true');
}

function closeEditor() {
    if (!dialog.open || dialog.classList.contains('closing')) return;
    dialog.classList.add('closing');
    closeTimer = setTimeout(function () { dialog.close(); },
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
}

settingsToggle.addEventListener('click', function () { openEditor('right'); });
document.getElementById('close-editor').addEventListener('click', closeEditor);
dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeEditor(); });
dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeEditor(); }
});
dialog.addEventListener('close', function () {
    settingsToggle.setAttribute('aria-expanded', 'false');
    dialog.classList.remove('closing');
    settingsToggle.focus({ preventScroll: true });
});
dialog.addEventListener('click', function (e) {
    var bounds = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right)) closeEditor();
});

var swipe;
document.addEventListener('pointerdown', function (e) {
    swipe = null;
    if (e.pointerType !== 'touch' || !e.isPrimary || !window.matchMedia('(max-width: 64rem)').matches) return;
    if (dialog.open) {
        if (!e.target.closest('.editor-header') || e.target.closest('button')) return;
        swipe = { x: e.clientX, y: e.clientY, side: dialog.dataset.side, closing: true, id: e.pointerId };
    } else if (e.clientX < 32 || e.clientX > window.innerWidth - 32) {
        swipe = { x: e.clientX, y: e.clientY, side: e.clientX < 32 ? 'left' : 'right', id: e.pointerId };
    }
});
document.addEventListener('pointerup', function (e) {
    if (!swipe || swipe.id !== e.pointerId) return;
    var gesture = swipe;
    swipe = null;
    var delta = e.clientX - gesture.x;
    var direction = gesture.side === 'left' ? 1 : -1;
    if (gesture.closing) direction *= -1;
    if (delta * direction > 60 && Math.abs(delta) > Math.abs(e.clientY - gesture.y) * 1.5) {
        if (gesture.closing) closeEditor();
        else openEditor(gesture.side);
    }
});
document.addEventListener('pointercancel', function () { swipe = null; });

document.getElementById('cancel').addEventListener('click', function () {
    closeEditor();
});

addBtn.addEventListener('click', function () {
    addRow({ title: '', raw: '', units: ALL_UNITS, color: DEFAULT_COLOR, upColor: DEFAULT_UP_COLOR, message: '' });
    rows.lastElementChild.querySelector('input').focus();
});

var resetBtn = document.getElementById('reset');
resetBtn.disabled = localStorage.getItem(STORAGE_KEY) === null && !readUrlCounters().length;
resetBtn.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KEY);
    reloadWithoutUrlCounters();
});

function readRows() {
    return Array.prototype.map.call(rows.children, function (row) {
        return {
            title: row.querySelector('[name=t]').value,
            raw: row.querySelector('[name=d]').value,
            units: row.querySelector('[name=u]').value,
            color: row.querySelector('[name=c]').value,
            upColor: row.querySelector('[name=cu]').value,
            message: row.querySelector('[name=message]').value.trim()
        };
    });
}

var copyBtn = document.getElementById('copy-link');
copyBtn.addEventListener('click', function () {
    var params = new URLSearchParams();
    readRows().forEach(function (c, i) {
        var n = i + 1;
        params.set('title' + n, c.title);
        params.set('date' + n, c.raw);
        params.set('units' + n, c.units);
        params.set('count_down_color' + n, c.color);
        params.set('count_up_color' + n, c.upColor);
        params.set('message' + n, c.message);
    });
    var url = location.href.split(/[?#]/)[0] + '?' + params.toString();
    var done = function (label) {
        copyBtn.textContent = label;
        setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 1500);
    };
    var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = url;
        dialog.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        ta.remove();
        if (ok) done('Copied!'); else window.prompt('Copy this link:', url);
    };
    if (!navigator.clipboard) return fallback();
    navigator.clipboard.writeText(url).then(function () { done('Copied!'); }, fallback);
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    var list = readRows();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    reloadWithoutUrlCounters();
});
