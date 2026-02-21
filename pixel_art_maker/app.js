/* ========================================================================
   PIXEL ART MAKER — Core Application Logic
   Rectangular grid: rows set by user, columns auto-computed to fill width.
   ======================================================================== */

(() => {
    'use strict';

    // ───────── CONFIG ─────────
    const PALETTE_COLORS = [
        // Row 1 — Reds & Pinks
        '#ff6b6b', '#ee5a5a', '#d63384', '#ff6b9d',
        '#f783ac', '#ffa8a8', '#be4bdb', '#9775fa',
        // Row 2 — Blues & Cyans
        '#4e8cff', '#339af0', '#228be6', '#1c7ed6',
        '#15aabf', '#22b8cf', '#3bc9db', '#66d9e8',
        // Row 3 — Greens & Yellows
        '#22c55e', '#40c057', '#51cf66', '#8ce99a',
        '#facc15', '#ffd43b', '#fab005', '#fb923c',
        // Row 4 — Earth tones & Neutrals
        '#e67700', '#d9480f', '#a0522d', '#8b4513',
        '#adb5bd', '#868e96', '#495057', '#212529',
    ];

    const MAX_HISTORY = 50;

    // ───────── STATE ─────────
    let gridRows = 16;   // set by the size buttons
    let gridCols = 16;   // auto-computed from container width
    let pixelSize = 16;
    let currentColor = '#ff6b6b';
    let currentTool = 'pencil';
    let showGrid = true;
    let isDrawing = false;
    let startX = -1, startY = -1;
    let recentColors = [];
    let history = [];
    let historyIndex = -1;

    // Grid data: 2D array [row][col] of color strings (null = transparent)
    let grid = [];

    // ───────── DOM REFS ─────────
    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');
    const paletteGrid = document.getElementById('palette-grid');
    const recentColorsEl = document.getElementById('recent-colors');
    const primarySwatch = document.getElementById('primary-swatch');
    const colorPicker = document.getElementById('color-picker');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomLabel = document.getElementById('zoom-label');
    const gridToggle = document.getElementById('grid-toggle');

    // ───────── INIT ─────────
    function init() {
        createPalette();
        initGrid();
        bindToolButtons();
        bindSizeButtons();
        bindActions();
        bindCanvasEvents();
        bindKeyboard();
        bindZoom();
        bindColorPicker();
        saveState();
        render();
    }

    // ───────── GRID DATA ─────────
    function initGrid() {
        computeGridDimensions();
        grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
    }

    function computeGridDimensions() {
        const containerRect = container.getBoundingClientRect();
        const availW = Math.floor(containerRect.width - 24);
        const availH = Math.floor(containerRect.height - 24);

        // Pixel size is determined by how many rows fit in the height
        pixelSize = Math.max(4, Math.floor(availH / gridRows));

        // Columns auto-computed to fill the width
        gridCols = Math.max(1, Math.floor(availW / pixelSize));

        // Set canvas size
        const canvasW = gridCols * pixelSize;
        const canvasH = gridRows * pixelSize;
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';

        zoomSlider.max = Math.max(40, pixelSize + 10);
        zoomSlider.value = pixelSize;
        zoomLabel.textContent = pixelSize + 'px';
    }

    // ───────── RENDERING ─────────
    function render() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw checkerboard for transparency
        const checkSize = pixelSize / 2;
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const px = col * pixelSize;
                const py = row * pixelSize;
                // Checkerboard
                for (let cy = 0; cy < 2; cy++) {
                    for (let cx = 0; cx < 2; cx++) {
                        ctx.fillStyle = (cx + cy) % 2 === 0 ? '#f1f3f8' : '#e2e6f0';
                        ctx.fillRect(px + cx * checkSize, py + cy * checkSize, checkSize, checkSize);
                    }
                }
                // Pixel color
                if (grid[row] && grid[row][col]) {
                    ctx.fillStyle = grid[row][col];
                    ctx.fillRect(px, py, pixelSize, pixelSize);
                }
            }
        }

        // Grid lines
        if (showGrid && pixelSize >= 6) {
            ctx.strokeStyle = 'rgba(41, 121, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i <= gridCols; i++) {
                const pos = i * pixelSize + 0.5;
                ctx.moveTo(pos, 0);
                ctx.lineTo(pos, h);
            }
            for (let i = 0; i <= gridRows; i++) {
                const pos = i * pixelSize + 0.5;
                ctx.moveTo(0, pos);
                ctx.lineTo(w, pos);
            }
            ctx.stroke();
        }
    }

    function renderPreview(points) {
        render();
        ctx.fillStyle = currentTool === 'eraser' ? 'rgba(255,255,255,0.5)' : currentColor;
        for (const [x, y] of points) {
            if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // ───────── PALETTE ─────────
    function createPalette() {
        paletteGrid.innerHTML = '';
        PALETTE_COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            if (color === currentColor) swatch.classList.add('selected');
            swatch.addEventListener('click', () => selectColor(color));
            paletteGrid.appendChild(swatch);
        });
    }

    function selectColor(color) {
        currentColor = color;
        primarySwatch.style.background = color;
        colorPicker.value = color;

        // Update selected state
        document.querySelectorAll('.palette-swatch').forEach(s => {
            s.classList.toggle('selected', s.style.backgroundColor === hexToRGB(color));
        });

        addRecentColor(color);
    }

    function hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function addRecentColor(color) {
        recentColors = recentColors.filter(c => c !== color);
        recentColors.unshift(color);
        if (recentColors.length > 8) recentColors.pop();
        renderRecentColors();
    }

    function renderRecentColors() {
        recentColorsEl.innerHTML = '';
        recentColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'recent-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.addEventListener('click', () => selectColor(color));
            recentColorsEl.appendChild(swatch);
        });
    }

    function bindColorPicker() {
        colorPicker.addEventListener('input', (e) => {
            selectColor(e.target.value);
        });
    }

    // ───────── TOOLS ─────────
    function bindToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTool = btn.dataset.tool;
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateCursor();
            });
        });
    }

    function updateCursor() {
        const cursors = {
            pencil: 'crosshair',
            eraser: 'cell',
            fill: 'pointer',
            eyedropper: 'copy',
            line: 'crosshair',
            rectangle: 'crosshair',
            circle: 'crosshair',
        };
        canvas.style.cursor = cursors[currentTool] || 'crosshair';
    }

    // ───────── CANVAS EVENTS ─────────
    function getGridPos(e) {
        const rect = canvas.getBoundingClientRect();
        // Direct mapping — CSS display size matches canvas logical size exactly
        const col = Math.floor((e.clientX - rect.left) / pixelSize);
        const row = Math.floor((e.clientY - rect.top) / pixelSize);
        return [
            Math.max(0, Math.min(gridCols - 1, col)),
            Math.max(0, Math.min(gridRows - 1, row)),
        ];
    }

    function bindCanvasEvents() {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            onMouseUp({});
        });

        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            setZoom(pixelSize + delta);
        }, { passive: false });
    }

    function onMouseDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        isDrawing = true;
        const [x, y] = getGridPos(e);
        startX = x;
        startY = y;

        if (currentTool === 'pencil') {
            setPixel(x, y, currentColor);
            render();
        } else if (currentTool === 'eraser') {
            setPixel(x, y, null);
            render();
        } else if (currentTool === 'fill') {
            floodFill(x, y, currentColor);
            saveState();
            render();
        } else if (currentTool === 'eyedropper') {
            const color = grid[y] && grid[y][x];
            if (color) selectColor(color);
        }
    }

    function onMouseMove(e) {
        if (!isDrawing) return;
        const [x, y] = getGridPos(e);

        if (currentTool === 'pencil') {
            const points = bresenhamLine(startX, startY, x, y);
            points.forEach(([px, py]) => setPixel(px, py, currentColor));
            startX = x;
            startY = y;
            render();
        } else if (currentTool === 'eraser') {
            const points = bresenhamLine(startX, startY, x, y);
            points.forEach(([px, py]) => setPixel(px, py, null));
            startX = x;
            startY = y;
            render();
        } else if (currentTool === 'line') {
            const points = bresenhamLine(startX, startY, x, y);
            renderPreview(points);
        } else if (currentTool === 'rectangle') {
            const points = getRectPoints(startX, startY, x, y);
            renderPreview(points);
        } else if (currentTool === 'circle') {
            const points = getCirclePoints(startX, startY, x, y);
            renderPreview(points);
        }
    }

    function onMouseUp(e) {
        if (!isDrawing) return;
        isDrawing = false;

        if (e.clientX !== undefined) {
            const [x, y] = getGridPos(e);

            if (currentTool === 'line') {
                const points = bresenhamLine(startX, startY, x, y);
                points.forEach(([px, py]) => setPixel(px, py, currentColor));
            } else if (currentTool === 'rectangle') {
                const points = getRectPoints(startX, startY, x, y);
                points.forEach(([px, py]) => setPixel(px, py, currentColor));
            } else if (currentTool === 'circle') {
                const points = getCirclePoints(startX, startY, x, y);
                points.forEach(([px, py]) => setPixel(px, py, currentColor));
            }
        }

        if (['pencil', 'eraser', 'line', 'rectangle', 'circle'].includes(currentTool)) {
            saveState();
        }
        render();
    }

    // ───────── PIXEL OPS ─────────
    function setPixel(x, y, color) {
        if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
            grid[y][x] = color;
        }
    }

    // ───────── ALGORITHMS ─────────

    // Bresenham line
    function bresenhamLine(x0, y0, x1, y1) {
        const points = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push([x0, y0]);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
        return points;
    }

    // Rectangle outline
    function getRectPoints(x0, y0, x1, y1) {
        const points = [];
        const minX = Math.min(x0, x1);
        const maxX = Math.max(x0, x1);
        const minY = Math.min(y0, y1);
        const maxY = Math.max(y0, y1);

        for (let x = minX; x <= maxX; x++) {
            points.push([x, minY]);
            points.push([x, maxY]);
        }
        for (let y = minY + 1; y < maxY; y++) {
            points.push([minX, y]);
            points.push([maxX, y]);
        }
        return points;
    }

    // Circle outline (Midpoint algorithm)
    function getCirclePoints(x0, y0, x1, y1) {
        const points = [];
        const radius = Math.round(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2));
        if (radius === 0) return [[x0, y0]];

        let x = radius;
        let y = 0;
        let d = 1 - radius;

        const addSymmetric = (cx, cy) => {
            points.push([x0 + cx, y0 + cy]);
            points.push([x0 - cx, y0 + cy]);
            points.push([x0 + cx, y0 - cy]);
            points.push([x0 - cx, y0 - cy]);
            points.push([x0 + cy, y0 + cx]);
            points.push([x0 - cy, y0 + cx]);
            points.push([x0 + cy, y0 - cx]);
            points.push([x0 - cy, y0 - cx]);
        };

        while (x >= y) {
            addSymmetric(x, y);
            y++;
            if (d <= 0) {
                d += 2 * y + 1;
            } else {
                x--;
                d += 2 * (y - x) + 1;
            }
        }

        // Deduplicate & filter to grid bounds
        const unique = new Map();
        points.forEach(([px, py]) => {
            if (px >= 0 && px < gridCols && py >= 0 && py < gridRows) {
                unique.set(`${px},${py}`, [px, py]);
            }
        });
        return Array.from(unique.values());
    }

    // Flood fill (BFS)
    function floodFill(x, y, fillColor) {
        const targetColor = grid[y][x];
        if (targetColor === fillColor) return;

        const queue = [[x, y]];
        const visited = new Set();
        visited.add(`${x},${y}`);

        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            grid[cy][cx] = fillColor;

            const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < gridCols && ny >= 0 && ny < gridRows
                    && !visited.has(`${nx},${ny}`)
                    && grid[ny][nx] === targetColor) {
                    visited.add(`${nx},${ny}`);
                    queue.push([nx, ny]);
                }
            }
        }
    }

    // ───────── HISTORY (Undo / Redo) ─────────
    function saveState() {
        // Remove future states if we branched
        history = history.slice(0, historyIndex + 1);
        // Deep clone grid
        const snapshot = grid.map(row => [...row]);
        history.push(snapshot);
        if (history.length > MAX_HISTORY) history.shift();
        historyIndex = history.length - 1;
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            grid = history[historyIndex].map(row => [...row]);
            render();
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            grid = history[historyIndex].map(row => [...row]);
            render();
        }
    }

    // ───────── GRID SIZE ─────────
    function bindSizeButtons() {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                if (size === gridRows) return;
                gridRows = size;
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                initGrid();
                history = [];
                historyIndex = -1;
                saveState();
                render();
            });
        });
    }

    // ───────── ZOOM ─────────
    function getMaxZoom() {
        const containerRect = container.getBoundingClientRect();
        const availH = Math.floor(containerRect.height - 24);
        return Math.max(40, Math.floor(availH / gridRows));
    }

    function setZoom(newSize) {
        const maxZoom = getMaxZoom();
        newSize = Math.max(4, Math.min(maxZoom, newSize));
        pixelSize = newSize;
        // Only change pixel visual size — grid dimensions stay fixed
        const canvasW = gridCols * pixelSize;
        const canvasH = gridRows * pixelSize;
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.style.width = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        zoomSlider.max = maxZoom;
        zoomSlider.value = pixelSize;
        zoomLabel.textContent = pixelSize + 'px';
        render();
    }

    function bindZoom() {
        zoomSlider.addEventListener('input', () => setZoom(parseInt(zoomSlider.value)));
        document.getElementById('zoom-in-btn').addEventListener('click', () => setZoom(pixelSize + 2));
        document.getElementById('zoom-out-btn').addEventListener('click', () => setZoom(pixelSize - 2));
    }

    // ───────── ACTIONS ─────────
    function bindActions() {
        document.getElementById('undo-btn').addEventListener('click', undo);
        document.getElementById('redo-btn').addEventListener('click', redo);

        // Hold-to-clear: press and hold the clear button for 800ms
        const clearBtn = document.getElementById('clear-btn');
        const clearProgress = clearBtn.querySelector('.clear-progress');
        let clearTimer = null;

        clearBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            clearProgress.style.transition = 'width 0.8s linear';
            clearProgress.style.width = '100%';
            clearTimer = setTimeout(() => {
                // Clear fires!
                grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(null));
                saveState();
                render();
                // Flash the button green briefly to confirm
                clearBtn.classList.add('cleared');
                setTimeout(() => clearBtn.classList.remove('cleared'), 500);
                // Reset bar
                clearProgress.style.transition = 'none';
                clearProgress.style.width = '0%';
            }, 800);
        });

        const cancelClear = () => {
            if (clearTimer) {
                clearTimeout(clearTimer);
                clearTimer = null;
            }
            clearProgress.style.transition = 'width 0.2s ease-out';
            clearProgress.style.width = '0%';
        };

        clearBtn.addEventListener('mouseup', cancelClear);
        clearBtn.addEventListener('mouseleave', cancelClear);

        // Touch support for hold-to-clear
        clearBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            clearBtn.dispatchEvent(new MouseEvent('mousedown'));
        });
        clearBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            cancelClear();
        });

        document.getElementById('export-btn').addEventListener('click', exportPNG);

        gridToggle.addEventListener('change', () => {
            showGrid = gridToggle.checked;
            render();
        });
    }

    // ───────── EXPORT ─────────
    function exportPNG() {
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        const scale = Math.max(1, Math.floor(512 / Math.max(gridCols, gridRows)));
        exportCanvas.width = gridCols * scale;
        exportCanvas.height = gridRows * scale;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                if (grid[row][col]) {
                    exportCtx.fillStyle = grid[row][col];
                    exportCtx.fillRect(col * scale, row * scale, scale, scale);
                }
            }
        }

        const link = document.createElement('a');
        link.download = `pixel-art-${gridCols}x${gridRows}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    }

    // ───────── KEYBOARD SHORTCUTS ─────────
    function bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Don't handle if typing in input
            if (e.target.tagName === 'INPUT') return;

            const key = e.key.toLowerCase();

            if (e.ctrlKey && key === 'z') { e.preventDefault(); undo(); return; }
            if (e.ctrlKey && key === 'y') { e.preventDefault(); redo(); return; }

            const toolMap = { p: 'pencil', e: 'eraser', f: 'fill', i: 'eyedropper', l: 'line', r: 'rectangle', c: 'circle' };

            if (toolMap[key]) {
                currentTool = toolMap[key];
                document.querySelectorAll('.tool-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.tool === currentTool);
                });
                updateCursor();
                return;
            }

            if (key === 'g') {
                gridToggle.checked = !gridToggle.checked;
                showGrid = gridToggle.checked;
                render();
            }
        });
    }

    // ───────── WINDOW RESIZE ─────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recompute dimensions and resize grid data
            const oldCols = gridCols;
            computeGridDimensions();
            // Adjust grid data to new column count
            grid = grid.map(row => {
                if (row.length < gridCols) {
                    return [...row, ...Array(gridCols - row.length).fill(null)];
                }
                return row.slice(0, gridCols);
            });
            while (grid.length < gridRows) grid.push(Array(gridCols).fill(null));
            grid = grid.slice(0, gridRows);
            render();
        }, 150);
    });

    // ───────── START ─────────
    init();
})();
