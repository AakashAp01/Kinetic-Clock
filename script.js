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
           APP STATE
        ═══════════════════════════════════════════════════════ */
        const gridEl = document.getElementById('grid');
        let cells = [];
        let isChaos = false;

        let mode = 'CLOCK';
        let is24Hour = true;

        let swElapsed = 0;
        let swRunning = false;

        let tmRemaining = 0;
        let tmRunning = false;

        /* ═══════════════════════════════════════════════════════
           MOUSE PARALLAX (3D TILT EFFECT)
        ═══════════════════════════════════════════════════════ */
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
            document.getElementById('wrapper').style.transform = `rotateY(${xAxis}deg) rotateX(${-yAxis}deg)`;
        });

        /* ═══════════════════════════════════════════════════════
           GRID INIT
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
                arm1.style.transitionDelay = waveDelay;
                arm2.style.transitionDelay = waveDelay;

                const pivot = document.createElement('div');
                pivot.className = 'pivot';

                arm1.style.transition = 'none';
                arm2.style.transition = 'none';
                arm1.style.transform = 'rotate(45deg)';
                arm2.style.transform = 'rotate(225deg)';

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
           MASTER TICKER
        ═══════════════════════════════════════════════════════ */
        const pad = n => String(n).padStart(2, '0');

        function masterTick() {
            if (isChaos) return;

            let displayStr = "00:00";
            let shouldSpinColon = false;

            if (mode === 'CLOCK') {
                const now = new Date();
                let h = now.getHours();
                if (!is24Hour) h = h % 12 || 12;
                displayStr = `${pad(h)}${pad(now.getMinutes())}`;
                shouldSpinColon = true;

            } else if (mode === 'SW') {
                if (swRunning) swElapsed++;
                let m = Math.floor(swElapsed / 60);
                let s = swElapsed % 60;
                displayStr = `${pad(m)}${pad(s)}`;
                shouldSpinColon = swRunning;

            } else if (mode === 'TIMER') {
                if (tmRunning && tmRemaining > 0) tmRemaining--;
                if (tmRemaining === 0) tmRunning = false;
                let m = Math.floor(tmRemaining / 60);
                let s = tmRemaining % 60;
                displayStr = `${pad(m)}${pad(s)}`;
                shouldSpinColon = tmRunning;
            }

            // Render to Grid
            const layout = [
                { char: displayStr[0], colStart: 0, width: 2 },
                { char: 'space', colStart: 2, width: 1 },
                { char: displayStr[1], colStart: 3, width: 2 },
                { char: ':', colStart: 5, width: 1 },
                { char: displayStr[2], colStart: 6, width: 2 },
                { char: 'space', colStart: 8, width: 1 },
                { char: displayStr[3], colStart: 9, width: 2 }
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
        }

        /* ═══════════════════════════════════════════════════════
           UI CONTROLS & EVENTS
        ═══════════════════════════════════════════════════════ */

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

                e.target.classList.add('active');
                mode = e.target.dataset.mode;
                document.getElementById(`panel-${mode}`).classList.add('active');
                masterTick();
            });
        });

        document.getElementById('btn-format').addEventListener('click', () => {
            is24Hour = !is24Hour;
            document.getElementById('format-label').textContent = is24Hour ? '24H' : '12H';
            masterTick();
        });

        document.getElementById('btn-chaos').addEventListener('click', function () {
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
        });

        document.getElementById('btn-sw-start').addEventListener('click', () => swRunning = !swRunning);
        document.getElementById('btn-sw-reset').addEventListener('click', () => { swRunning = false; swElapsed = 0; masterTick(); });
        document.getElementById('btn-tm-add').addEventListener('click', () => { tmRemaining += 60; if (tmRemaining > 3599) tmRemaining = 3599; masterTick(); });
        document.getElementById('btn-tm-sub').addEventListener('click', () => { tmRemaining -= 60; if (tmRemaining < 0) tmRemaining = 0; masterTick(); });
        document.getElementById('btn-tm-start').addEventListener('click', () => tmRunning = !tmRunning);
        document.getElementById('btn-tm-reset').addEventListener('click', () => { tmRunning = false; tmRemaining = 0; masterTick(); });

        /* ═══════════════════════════════════════════════════════
           BOOT
        ═══════════════════════════════════════════════════════ */
        initGrid();
        setTimeout(masterTick, 100);
        setInterval(masterTick, 1000);
