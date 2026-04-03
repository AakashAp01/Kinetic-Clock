/* ═══════════════════════════════════════════════════════
    PERFECTED CONTINUOUS DIGIT MAP
    Angles: 0=Up, 90=Right, 180=Down, 270=Left.
═══════════════════════════════════════════════════════ */

const b = [45, 225];

const DIGITS = {
    '0': [
        [[90, 180], [180, 270]],
        [[0, 180], [0, 180]],
        [[0, 180], [0, 180]],
        [[0, 180], [0, 180]],
        [[0, 90], [0, 270]]
    ],
    '1': [
        [b, [180, 180]],
        [b, [0, 180]],
        [b, [0, 180]],
        [b, [0, 180]],
        [b, [0, 0]]
    ],
    '2': [
        [[90, 90], [180, 270]],
        [b, [0, 180]],
        [[90, 180], [0, 270]],
        [[0, 180], b],
        [[0, 90], [270, 270]]
    ],
    '3': [
        [[90, 90], [180, 270]],
        [b, [0, 180]],
        [[90, 90], [0, 180]],
        [b, [0, 180]],
        [[90, 90], [0, 270]]
    ],
    '4': [
        [[180, 180], [180, 180]],
        [[0, 180], [0, 180]],
        [[0, 90], [0, 180]],
        [b, [0, 180]],
        [b, [0, 0]]
    ],
    '5': [
        [[90, 180], [270, 270]],
        [[0, 180], b],
        [[0, 90], [180, 270]],
        [b, [0, 180]],
        [[90, 90], [0, 270]]
    ],
    '6': [
        [[90, 180], [270, 270]],
        [[0, 180], b],
        [[0, 180], [180, 270]],
        [[0, 180], [0, 180]],
        [[0, 90], [0, 270]]
    ],
    '7': [
        [[90, 90], [180, 270]],
        [b, [0, 180]],
        [b, [0, 180]],
        [b, [0, 180]],
        [b, [0, 0]]
    ],
    '8': [
        [[90, 180], [180, 270]],
        [[0, 180], [0, 180]],
        [[90, 180], [0, 270]],
        [[0, 180], [0, 180]],
        [[0, 90], [0, 270]]
    ],
    '9': [
        [[90, 180], [180, 270]],
        [[0, 180], [0, 180]],
        [[0, 90], [180, 270]],
        [b, [0, 180]],
        [[90, 90], [0, 270]]
    ],
    'space': [[b], [b], [b], [b], [b]]
};

/* ═══════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
═══════════════════════════════════════════════════════ */
const LS_KEY = 'kineticClock_v1';

function saveState() {
    const state = {
        mode,
        is24Hour,
        isDark,
        swElapsed,
        swRunning: false,
        laps,
        swLastLapTime,
        tmTotal,
        tmRemaining,
        tmRunning: false
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(e) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.mode !== undefined)         mode          = s.mode;
        if (s.is24Hour !== undefined)     is24Hour      = s.is24Hour;
        if (s.isDark !== undefined)       isDark        = s.isDark;
        if (s.swElapsed !== undefined)    swElapsed     = s.swElapsed;
        if (Array.isArray(s.laps))        laps          = s.laps;
        if (s.swLastLapTime !== undefined) swLastLapTime = s.swLastLapTime;
        if (s.tmTotal !== undefined)      tmTotal       = s.tmTotal;
        if (s.tmRemaining !== undefined)  tmRemaining   = s.tmRemaining;
    } catch(e) {}
}

/* ═══════════════════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════════════════ */
const gridEl = document.getElementById('grid');
let cells = [];
let isChaos = false;

let mode = 'CLOCK';
let is24Hour = true;
let isDark = true;

// Stopwatch
let swElapsed = 0;
let swRunning = false;
let laps = [];
let swLastLapTime = 0;

// Timer
let tmTotal = 0;
let tmRemaining = 0;
let tmRunning = false;

loadState();

/* ═══════════════════════════════════════════════════════
   MOUSE PARALLAX (3D TILT EFFECT)
═══════════════════════════════════════════════════════ */
document.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    document.getElementById('wrapper').style.transform = `rotateY(${xAxis}deg) rotateX(${-yAxis}deg)`;
});

document.addEventListener('mouseleave', () => {
    document.getElementById('wrapper').style.transform = 'rotateY(0deg) rotateX(0deg)';
});

/* ═══════════════════════════════════════════════════════
   GRID INIT — SPOKE CELLS
═══════════════════════════════════════════════════════ */
function initGrid() {
    for (let i = 0; i < 55; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        const arm1 = document.createElement('div');
        arm1.className = 'arm arm-long';

        const arm2 = document.createElement('div');
        arm2.className = 'arm arm-short';

        const colIndex = i % 11;
        const waveDelay = `${colIndex * 0.05}s`;

        arm1.style.transition = 'none';
        arm2.style.transition = 'none';
        arm1.style.transform = 'rotate(45deg)';
        arm2.style.transform = 'rotate(225deg)';

        const pivot = document.createElement('div');
        pivot.className = 'pivot';

        cell.appendChild(arm1);
        cell.appendChild(arm2);
        cell.appendChild(pivot);
        gridEl.appendChild(cell);

        cells.push({ arm1, arm2, rot1: 45, rot2: 225, delay: waveDelay });
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
        cells.forEach(c => {
            c.arm1.style.transition = `transform 0.6s cubic-bezier(0.34, 1.35, 0.64, 1) ${c.delay}`;
            c.arm2.style.transition = `transform 0.6s cubic-bezier(0.34, 1.35, 0.64, 1) ${c.delay}`;
        });
    }));
}

/* ═══════════════════════════════════════════════════════
   ROTATION LOGIC
═══════════════════════════════════════════════════════ */
function shortPath(current, target) {
    const delta = ((target - current) % 360 + 540) % 360 - 180;
    return current + delta;
}

function setCellAngle(i, a1, a2) {
    if (isChaos) return;
    const c = cells[i];
    const n1 = shortPath(c.rot1, a1);
    const n2 = shortPath(c.rot2, a2);

    if (n1 !== c.rot1) { c.arm1.style.transform = `rotate(${n1}deg)`; c.rot1 = n1; }
    if (n2 !== c.rot2) { c.arm2.style.transform = `rotate(${n2}deg)`; c.rot2 = n2; }
}

/* ═══════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════ */
const pad = n => String(n).padStart(2, '0');

function fmtMS(totalSecs) {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${pad(m)}:${pad(s)}`;
}

/* ═══════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════ */
let toastTimeout = null;
function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════════════════════
   MASTER TICKER
═══════════════════════════════════════════════════════ */
function masterTick() {
    if (isChaos) return;

    let displayStr = '0000';
    let shouldSpinColon = false;

    if (mode === 'CLOCK') {
        const now = new Date();
        let h = now.getHours();
        if (!is24Hour) h = h % 12 || 12;
        displayStr = `${pad(h)}${pad(now.getMinutes())}`;
        shouldSpinColon = true;

    } else if (mode === 'SW') {
        if (swRunning) swElapsed++;
        const m = Math.floor(swElapsed / 60);
        const s = swElapsed % 60;
        displayStr = `${pad(m)}${pad(s)}`;
        shouldSpinColon = swRunning;

    } else if (mode === 'TIMER') {
        if (tmRunning && tmRemaining > 0) tmRemaining--;
        if (tmRemaining === 0 && tmRunning) {
            tmRunning = false;
            onTimerEnd();
        }
        const m = Math.floor(tmRemaining / 60);
        const s = tmRemaining % 60;
        displayStr = `${pad(m)}${pad(s)}`;
        shouldSpinColon = tmRunning;
        updateTimerRing();
    }

    const layout = [
        { char: displayStr[0], colStart: 0,  width: 2 },
        { char: 'space',       colStart: 2,  width: 1 },
        { char: displayStr[1], colStart: 3,  width: 2 },
        { char: ':',           colStart: 5,  width: 1 },
        { char: displayStr[2], colStart: 6,  width: 2 },
        { char: 'space',       colStart: 8,  width: 1 },
        { char: displayStr[3], colStart: 9,  width: 2 }
    ];

    for (let row = 0; row < 5; row++) {
        for (const { char, colStart, width } of layout) {
            if (char === ':') {
                const idx = row * 11 + colStart;
                const c = cells[idx];
                if (row === 1 || row === 3) {
                    if (c.rot1 % 360 !== 0) c.rot1 = 0;
                    if (c.rot2 % 360 !== 180) c.rot2 = 180;
                    if (shouldSpinColon) {
                        c.rot1 += 360;
                        c.rot2 += 360;
                    }
                    c.arm1.style.transform = `rotate(${c.rot1}deg)`;
                    c.arm2.style.transform = `rotate(${c.rot2}deg)`;
                } else {
                    setCellAngle(idx, b[0], b[1]);
                }
            } else {
                const digitRow = DIGITS[char][row];
                for (let col = 0; col < width; col++) {
                    const idx = row * 11 + colStart + col;
                    const [a1, a2] = width === 1 ? digitRow[0] : digitRow[col];
                    setCellAngle(idx, a1, a2);
                }
            }
        }
    }

    document.getElementById('sw-start-label').textContent = swRunning ? 'Stop' : 'Start';
    const swIcon = document.querySelector('#btn-sw-start i');
    if (swIcon) swIcon.className = swRunning ? 'fas fa-pause' : 'fas fa-play';

    document.getElementById('tm-start-label').textContent = tmRunning ? 'Stop' : 'Start';
    const tmIcon = document.querySelector('#btn-tm-start i');
    if (tmIcon) tmIcon.className = tmRunning ? 'fas fa-pause' : 'fas fa-play';
}

/* ═══════════════════════════════════════════════════════
   TIMER EFFECTS
═══════════════════════════════════════════════════════ */
function updateTimerRing() {
    const ring = document.querySelector('.timer-ring-wrap');
    if (!ring) return;
    if (tmRunning && tmRemaining > 0) {
        ring.classList.add('visible');
    } else {
        ring.classList.remove('visible');
    }
}

function onTimerEnd() {
    showToast('⏰ Timer Finished!');
    document.body.style.transition = 'background 0.15s ease';
    document.body.style.background = 'radial-gradient(circle at 50% 30%, #7f1d1d 0%, #020617 100%)';
    setTimeout(() => {
        document.body.style.background = '';
        setTimeout(() => { document.body.style.transition = ''; }, 1000);
    }, 2000);
    triggerSweepAnimation();
}

/* ═══════════════════════════════════════════════════════
   SWEEP ANIMATION
═══════════════════════════════════════════════════════ */
function triggerSweepAnimation() {
    if (isChaos) return;
    isChaos = true;

    cells.forEach((cell, i) => {
        const col = i % 11;
        const delay = col * 50;
        setTimeout(() => {
            cell.arm1.style.transitionDelay = '0s';
            cell.arm2.style.transitionDelay = '0s';
            const angle = col * 33;
            cell.arm1.style.transform = `rotate(${angle}deg)`;
            cell.arm2.style.transform = `rotate(${angle + 180}deg)`;
            cell.rot1 = angle % 360;
            cell.rot2 = (angle + 180) % 360;
        }, delay);
    });

    setTimeout(() => {
        cells.forEach(c => {
            c.arm1.style.transitionDelay = c.delay;
            c.arm2.style.transitionDelay = c.delay;
        });
        isChaos = false;
        masterTick();
    }, 1200 + cells.length * 8);
}

/* ═══════════════════════════════════════════════════════
   CHAOS WAVE
═══════════════════════════════════════════════════════ */
function triggerChaos() {
    if (isChaos) return;
    isChaos = true;

    cells.forEach(cell => {
        cell.arm1.style.transitionDelay = '0s';
        cell.arm2.style.transitionDelay = '0s';
        const r1 = Math.round(Math.random() * 1440) - 720;
        const r2 = Math.round(Math.random() * 1440) - 720;
        cell.arm1.style.transform = `rotate(${r1}deg)`;
        cell.arm2.style.transform = `rotate(${r2}deg)`;
        cell.rot1 = ((r1 % 360) + 360) % 360;
        cell.rot2 = ((r2 % 360) + 360) % 360;
    });

    setTimeout(() => {
        cells.forEach(c => {
            c.arm1.style.transitionDelay = c.delay;
            c.arm2.style.transitionDelay = c.delay;
        });
        isChaos = false;
        masterTick();
    }, 1200);
}

/* ═══════════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════════ */
function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-icon');
    icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    showToast(isDark ? '🌙 Dark mode' : '☀️ Light mode');
    saveState();
}

/* ═══════════════════════════════════════════════════════
   FULLSCREEN
═══════════════════════════════════════════════════════ */
function toggleFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFs) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('fs-icon');
    const wrapper = document.getElementById('wrapper');
    wrapper.style.transform = 'rotateY(0deg) rotateX(0deg)';
    if (document.fullscreenElement) {
        document.body.classList.add('is-fullscreen');
        icon.className = 'fas fa-compress';
        showToast('⛶ Fullscreen — press F or Esc to exit');
    } else {
        document.body.classList.remove('is-fullscreen');
        icon.className = 'fas fa-expand';
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.classList.toggle('is-fullscreen', isFs);
    document.getElementById('fs-icon').className = isFs ? 'fas fa-compress' : 'fas fa-expand';
    document.getElementById('wrapper').style.transform = 'rotateY(0deg) rotateX(0deg)';
});

/* ═══════════════════════════════════════════════════════
   LAP LOGIC
═══════════════════════════════════════════════════════ */
function recordLap() {
    if (!swRunning && swElapsed === 0) return;
    const lapTime = swElapsed - swLastLapTime;
    swLastLapTime = swElapsed;
    laps.unshift({ n: laps.length + 1, t: lapTime, abs: swElapsed });
    renderLaps();
    showToast(`Lap ${laps.length} — ${fmtMS(lapTime)}`);
    saveState();
}

function renderLaps() {
    const list = document.getElementById('lap-list');
    if (laps.length === 0) {
        list.classList.remove('visible');
        list.innerHTML = '';
        return;
    }
    list.classList.add('visible');

    let bestIdx = 0, worstIdx = 0;
    if (laps.length > 1) {
        laps.forEach((l, i) => {
            if (l.t < laps[bestIdx].t) bestIdx = i;
            if (l.t > laps[worstIdx].t) worstIdx = i;
        });
    }

    list.innerHTML = laps.map((lap, i) => {
        const cls = laps.length > 1 ? (i === bestIdx ? 'best' : i === worstIdx ? 'worst' : '') : '';
        const prev = laps[i + 1] ? laps[i + 1].t : null;
        const delta = prev !== null ? lap.t - prev : null;
        const deltaStr = delta !== null
            ? `<span class="lap-delta" style="color:${delta > 0 ? 'var(--lap-worst-color)' : 'var(--lap-best-color)'}">${delta > 0 ? '+' : ''}${fmtMS(Math.abs(delta))}</span>`
            : '';
        return `<div class="lap-item ${cls}">
            <span class="lap-num">Lap ${lap.n}</span>
            <span class="lap-time">${fmtMS(lap.t)}</span>
            ${deltaStr}
        </div>`;
    }).join('');
}

function resetLaps() {
    laps = [];
    swLastLapTime = 0;
    renderLaps();
}

/* ═══════════════════════════════════════════════════════
   UI CONTROLS & EVENTS
═══════════════════════════════════════════════════════ */
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        mode = target.dataset.mode;
        document.getElementById(`panel-${mode}`).classList.add('active');

        if (mode !== 'SW') {
            document.getElementById('lap-list').classList.remove('visible');
        } else {
            renderLaps();
        }

        updateTimerRing();
        masterTick();
        saveState();
    });
});

document.getElementById('btn-format').addEventListener('click', () => {
    is24Hour = !is24Hour;
    document.getElementById('format-label').textContent = is24Hour ? '24H' : '12H';
    masterTick();
    saveState();
});
document.getElementById('btn-chaos').addEventListener('click', triggerChaos);
document.getElementById('btn-sweep').addEventListener('click', triggerSweepAnimation);

document.getElementById('btn-sw-start').addEventListener('click', () => {
    swRunning = !swRunning;
    saveState();
});
document.getElementById('btn-sw-lap').addEventListener('click', recordLap);
document.getElementById('btn-sw-reset').addEventListener('click', () => {
    swRunning = false;
    swElapsed = 0;
    resetLaps();
    masterTick();
    saveState();
});

document.getElementById('btn-tm-sub5').addEventListener('click', () => { tmRemaining = Math.max(0, tmRemaining - 300); tmTotal = Math.max(tmTotal, tmRemaining); masterTick(); saveState(); });
document.getElementById('btn-tm-sub').addEventListener('click', () => { tmRemaining = Math.max(0, tmRemaining - 60); masterTick(); saveState(); });
document.getElementById('btn-tm-add').addEventListener('click', () => { tmRemaining = Math.min(5999, tmRemaining + 60); tmTotal = tmRemaining; masterTick(); saveState(); });
document.getElementById('btn-tm-add5').addEventListener('click', () => { tmRemaining = Math.min(5999, tmRemaining + 300); tmTotal = tmRemaining; masterTick(); saveState(); });
document.getElementById('btn-tm-start').addEventListener('click', () => {
    if (tmRemaining === 0) { showToast('Set a time first!'); return; }
    tmRunning = !tmRunning;
    updateTimerRing();
    saveState();
});
document.getElementById('btn-tm-reset').addEventListener('click', () => {
    tmRunning = false;
    tmRemaining = 0;
    tmTotal = 0;
    updateTimerRing();
    masterTick();
    saveState();
});

document.getElementById('btn-theme').addEventListener('click', toggleTheme);
document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
        case 'f': case 'F': toggleFullscreen(); break;
        case 'd': case 'D': toggleTheme(); break;
        case ' ':
            e.preventDefault();
            if (mode === 'SW') swRunning = !swRunning;
            else if (mode === 'TIMER') {
                if (tmRemaining > 0) { tmRunning = !tmRunning; updateTimerRing(); }
            }
            break;
        case 'l': case 'L':
            if (mode === 'SW') recordLap();
            break;
        case 'r': case 'R':
            if (mode === 'SW') { swRunning = false; swElapsed = 0; resetLaps(); masterTick(); }
            else if (mode === 'TIMER') { tmRunning = false; tmRemaining = 0; tmTotal = 0; updateTimerRing(); masterTick(); }
            break;
        case 'c': case 'C':
            triggerChaos();
            break;
    }
});

/* ═══════════════════════════════════════════════════════
   TIMER RING IN DOM
═══════════════════════════════════════════════════════ */
(function addTimerRing() {
    const chassis = document.querySelector('.clock-chassis');
    const ring = document.createElement('div');
    ring.className = 'timer-ring-wrap';
    chassis.appendChild(ring);
})();

/* ═══════════════════════════════════════════════════════
   BOOT — Apply persisted state to UI
═══════════════════════════════════════════════════════ */
(function applyPersistedState() {

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-icon').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    document.getElementById('format-label').textContent = is24Hour ? '24H' : '12H';

    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === mode);
    });

    document.querySelectorAll('.panel').forEach(p => {
        p.classList.toggle('active', p.id === `panel-${mode}`);
    });

    if (mode === 'SW') renderLaps();
})();

initGrid();
setInterval(saveState, 5000);
setTimeout(masterTick, 100);
setInterval(masterTick, 1000);
