// ═══════════════════ Configuration ═══════════════════
const GRID_SIZE = 14;
const KERNEL_SIZE = 3;

// ═══════════════════ State ═══════════════════
let inputData = [];
let kernelData = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
let outputData = [];
let isDrawingMode = false;
let animRow = 0;
let animCol = 0;
let animationInterval = null;

// ═══════════════════ DOM ═══════════════════
const inputGrid = document.getElementById('input-grid');
const kernelGrid = document.getElementById('kernel-grid');
const outputGrid = document.getElementById('output-grid');
const filterSelect = document.getElementById('filter-select');
const imageSelect = document.getElementById('image-select');
const mathDisplay = document.getElementById('math-display');
const calcText = document.getElementById('calc-text');

// ═══════════════════ Kernels ═══════════════════
const KERNELS = {
    'identity': [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    'top-sobel': [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    'bottom-sobel': [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
    'left-sobel': [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    'right-sobel': [[1, 0, -1], [2, 0, -2], [1, 0, -1]],
    'outline': [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    'sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    'blur': [[0.0625, 0.125, 0.0625], [0.125, 0.25, 0.125], [0.0625, 0.125, 0.0625]],
    'custom': [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
};

// ═══════════════════ Presets ═══════════════════
const PRESETS = {
    'digit-0': [
        [0,0,0,0,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,0,0,0,0,0,1,1,0,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-1': [
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-2': [
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,0,0,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-3': [
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,1,1,1,0,0,1,1,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-4': [
        [0,0,0,0,0,0,0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,0,1,1,0,0,0,0],
        [0,0,0,0,1,1,0,0,1,1,0,0,0,0],
        [0,0,0,1,1,0,0,0,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-5': [
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'digit-7': [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'shape-rect': [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,0,0,0,0,0,0,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'shape-cross': [
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0]
    ]
};


// ═══════════════════ Init ═══════════════════
function init() {
    inputData = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

    createGrid(inputGrid, GRID_SIZE, 'input');
    createKernelGrid();
    const outSize = GRID_SIZE - KERNEL_SIZE + 1;
    createGrid(outputGrid, outSize, 'output');

    // Load default
    imageSelect.value = 'digit-7';
    loadPreset('digit-7');

    if (filterSelect.value && KERNELS[filterSelect.value]) {
        kernelData = JSON.parse(JSON.stringify(KERNELS[filterSelect.value]));
    }
    updateKernelView();
    updateMiniKernel();
    initMiniInputGrid();

    calculateConvolution();
    setupEventListeners();
}

function initMiniInputGrid() {
    const calcInputGrid = document.getElementById('calc-input-grid');
    if (!calcInputGrid) return;
    calcInputGrid.innerHTML = '';
    calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, var(--mini-cell-size))`;
    for (let i = 0; i < KERNEL_SIZE * KERNEL_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'mini-cell';
        cell.textContent = '0';
        cell.style.backgroundColor = '#fff';
        cell.style.color = '#ccc';
        calcInputGrid.appendChild(cell);
    }
}

// ═══════════════════ Event Listeners ═══════════════════
function setupEventListeners() {
    // Filter change
    filterSelect.addEventListener('change', (e) => {
        stopAnimation();
        handleFilterChange(e);
    });

    // Image change
    imageSelect.addEventListener('change', (e) => {
        stopAnimation();
        if (e.target.value === 'random') {
            randomizeInput();
        } else {
            loadPreset(e.target.value);
        }
        calculateConvolution();
    });

    // Draw mode
    const drawBtn = document.getElementById('draw-mode');
    drawBtn.addEventListener('click', () => {
        isDrawingMode = !isDrawingMode;
        if (isDrawingMode) {
            drawBtn.classList.add('active-mode');
            drawBtn.textContent = '✏️ Drawing ON';
            imageSelect.value = 'custom';
        } else {
            drawBtn.classList.remove('active-mode');
            drawBtn.textContent = '✏️ Draw';
        }
    });

    // Clear
    document.getElementById('clear-input').addEventListener('click', () => {
        stopAnimation();
        clearInput();
        calculateConvolution();
        imageSelect.value = 'custom';
    });

    // Step button
    document.getElementById('step-btn').addEventListener('click', () => {
        stopAnimation();
        highlightReceptiveField(animRow, animCol);
        advancePosition();
    });

    // Play button
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');

    playBtn.addEventListener('click', () => {
        playBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        startAnimation();
    });

    stopBtn.addEventListener('click', () => {
        stopBtn.style.display = 'none';
        playBtn.style.display = 'inline-block';
        stopAnimation();
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        stopAnimation();
        animRow = 0;
        animCol = 0;
        clearHighlights();
        const stopBtn = document.getElementById('stop-btn');
        const playBtn = document.getElementById('play-btn');
        stopBtn.style.display = 'none';
        playBtn.style.display = 'inline-block';
    });

    // Output grid hover (event delegation) — rAF batched to prevent flicker
    let lastHoveredCell = null;
    let hoverRafId = null;

    outputGrid.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell || cell.dataset.type !== 'output') return;
        if (cell === lastHoveredCell) return;
        lastHoveredCell = cell;

        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);

        // Pause animation without destroying state
        clearInterval(animationInterval);
        const sb = document.getElementById('stop-btn');
        const pb = document.getElementById('play-btn');
        if (sb && sb.style.display !== 'none') {
            sb.style.display = 'none';
            pb.style.display = 'inline-block';
        }

        // Update step position to match hover
        animRow = r;
        animCol = c;

        // Batch DOM updates into a single frame
        if (hoverRafId) cancelAnimationFrame(hoverRafId);
        hoverRafId = requestAnimationFrame(() => {
            highlightReceptiveField(r, c);
            hoverRafId = null;
        });
    });

    let gridLeaveTimeout = null;
    outputGrid.addEventListener('mouseleave', () => {
        lastHoveredCell = null;
        if (hoverRafId) { cancelAnimationFrame(hoverRafId); hoverRafId = null; }
        gridLeaveTimeout = setTimeout(clearHighlights, 150);
    });
    outputGrid.addEventListener('mouseenter', () => {
        if (gridLeaveTimeout) {
            clearTimeout(gridLeaveTimeout);
            gridLeaveTimeout = null;
        }
    });

    // Mini-grid cell hover → highlight corresponding input & kernel cells
    setupMiniGridHover();
}

function setupMiniGridHover() {
    const calcInputGrid = document.getElementById('calc-input-grid');
    const calcKernelGrid = document.getElementById('calc-kernel-grid');

    [calcInputGrid, calcKernelGrid].forEach(grid => {
        if (!grid) return;
        grid.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.mini-cell');
            if (!cell) return;
            const idx = Array.from(grid.children).indexOf(cell);
            if (idx < 0) return;

            // Highlight corresponding cell in both mini grids
            highlightMiniPair(idx);
        });
        grid.addEventListener('mouseleave', () => {
            clearMiniHighlights();
        });
    });
}

function highlightMiniPair(idx) {
    const calcInputGrid = document.getElementById('calc-input-grid');
    const calcKernelGrid = document.getElementById('calc-kernel-grid');
    clearMiniHighlights();

    if (calcInputGrid && calcInputGrid.children[idx]) {
        calcInputGrid.children[idx].classList.add('mini-highlight');
    }
    if (calcKernelGrid && calcKernelGrid.children[idx]) {
        calcKernelGrid.children[idx].classList.add('mini-highlight');
    }
}

function clearMiniHighlights() {
    document.querySelectorAll('.mini-highlight').forEach(el => el.classList.remove('mini-highlight'));
}

// ═══════════════════ Grid Creation ═══════════════════
function createGrid(container, size, type) {
    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 30;
    container.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    container.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
    container.innerHTML = '';

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.type = type;

            if (type === 'input') {
                cell.addEventListener('click', () => {
                    if (isDrawingMode) togglePixel(i, j);
                });
                cell.addEventListener('mouseover', (e) => {
                    if (isDrawingMode && e.buttons === 1) {
                        togglePixel(i, j, true);
                    }
                });
            }

            container.appendChild(cell);
        }
    }
}

function createKernelGrid() {
    kernelGrid.innerHTML = '';
    const kCellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--kernel-cell-size')) || 64;
    kernelGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, ${kCellSize}px)`;
    kernelGrid.style.gridTemplateRows = `repeat(${KERNEL_SIZE}, ${kCellSize}px)`;

    for (let i = 0; i < KERNEL_SIZE; i++) {
        for (let j = 0; j < KERNEL_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.value = kernelData[i][j];
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                kernelData[i][j] = isNaN(val) ? 0 : val;
                filterSelect.value = 'custom';
                updateMiniKernel();
                calculateConvolution();
            });

            cell.appendChild(input);
            kernelGrid.appendChild(cell);
        }
    }
}

// ═══════════════════ Rendering ═══════════════════
function updateKernelView() {
    const inputs = kernelGrid.querySelectorAll('input');
    let idx = 0;
    for (let i = 0; i < KERNEL_SIZE; i++) {
        for (let j = 0; j < KERNEL_SIZE; j++) {
            inputs[idx].value = kernelData[i][j];
            idx++;
        }
    }
}

function renderInput() {
    const cells = inputGrid.children;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const val = inputData[i][j];
            const cell = cells[i * GRID_SIZE + j];
            if (val === 1) {
                cell.style.backgroundColor = '#1a2744';
                cell.style.color = '#fff';
                cell.style.border = '1px solid #1a2744';
            } else {
                cell.style.backgroundColor = '#fff';
                cell.style.color = '#ccc';
                cell.style.border = '1px solid #e8ecf2';
            }
            cell.textContent = val;
        }
    }
}

function renderOutput() {
    const outSize = outputData.length;
    if (outputGrid.children.length !== outSize * outSize) {
        createGrid(outputGrid, outSize, 'output');
    }

    const cells = outputGrid.children;
    const allValClasses = ['val-pos-high', 'val-pos-mid', 'val-neg-high', 'val-neg-mid', 'val-zero'];

    for (let i = 0; i < outSize; i++) {
        for (let j = 0; j < outSize; j++) {
            const val = outputData[i][j];
            const cell = cells[i * outSize + j];
            if (!cell) continue;

            const rounded = Math.round(val);
            const valStr = String(rounded);
            if (cell.textContent !== valStr) cell.textContent = valStr;

            let targetClass = '';
            if (rounded >= 2) targetClass = 'val-pos-high';
            else if (rounded > 0) targetClass = 'val-pos-mid';
            else if (rounded <= -2) targetClass = 'val-neg-high';
            else if (rounded < 0) targetClass = 'val-neg-mid';
            else targetClass = 'val-zero';

            allValClasses.forEach(cls => {
                if (cls !== targetClass && cell.classList.contains(cls)) cell.classList.remove(cls);
            });
            if (targetClass && !cell.classList.contains(targetClass)) cell.classList.add(targetClass);
            if (cell.style.color) cell.style.color = '';
        }
    }
}

function updateMiniKernel() {
    const calcKernelGrid = document.getElementById('calc-kernel-grid');
    if (!calcKernelGrid) return;

    calcKernelGrid.innerHTML = '';
    calcKernelGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, var(--mini-cell-size))`;

    for (let i = 0; i < KERNEL_SIZE; i++) {
        for (let j = 0; j < KERNEL_SIZE; j++) {
            const kVal = kernelData[i][j];
            const kCell = document.createElement('div');
            kCell.className = 'mini-cell';
            kCell.textContent = kVal;
            if (kVal > 0) {
                kCell.style.backgroundColor = '#ffcdd2';
                kCell.style.color = '#b71c1c';
            } else if (kVal < 0) {
                kCell.style.backgroundColor = '#bbdefb';
                kCell.style.color = '#0d47a1';
            } else {
                kCell.style.backgroundColor = '#f5f5f5';
                kCell.style.color = '#bbb';
            }
            calcKernelGrid.appendChild(kCell);
        }
    }

    // Re-attach hover listener
    setupMiniGridHover();
}

// ═══════════════════ Data Operations ═══════════════════
function togglePixel(r, c, forceOn = false) {
    const currentVal = inputData[r][c];
    let newVal;
    if (forceOn) {
        newVal = 1;
    } else {
        newVal = currentVal === 0 ? 1 : 0;
    }
    if (newVal === currentVal) return;
    inputData[r][c] = newVal;

    if (imageSelect.value !== 'custom') imageSelect.value = 'custom';

    const cells = inputGrid.children;
    const cell = cells[r * GRID_SIZE + c];
    if (cell) {
        if (newVal === 1) {
            cell.style.backgroundColor = '#1a2744';
            cell.style.color = '#fff';
            cell.style.border = '1px solid #1a2744';
        } else {
            cell.style.backgroundColor = '#fff';
            cell.style.color = '#ccc';
            cell.style.border = '1px solid #e8ecf2';
        }
        cell.textContent = newVal;
    }

    if (window.calcTimeout) clearTimeout(window.calcTimeout);
    window.calcTimeout = setTimeout(() => calculateConvolution(), 10);
}

function randomizeInput() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            inputData[i][j] = Math.random() > 0.8 ? 1 : 0;
        }
    }
    renderInput();
}

function loadPreset(name) {
    if (PRESETS[name]) {
        inputData = JSON.parse(JSON.stringify(PRESETS[name]));
        renderInput();
    }
}

function clearInput() {
    inputData = inputData.map(row => row.map(() => 0));
    renderInput();
}

function handleFilterChange(e) {
    const filterName = e.target.value;
    if (KERNELS[filterName]) {
        kernelData = JSON.parse(JSON.stringify(KERNELS[filterName]));
        updateKernelView();
        updateMiniKernel();
        calculateConvolution();
    }
}

function calculateConvolution() {
    const outH = GRID_SIZE - KERNEL_SIZE + 1;
    const outW = GRID_SIZE - KERNEL_SIZE + 1;
    outputData = [];

    for (let i = 0; i < outH; i++) {
        const rowData = [];
        for (let j = 0; j < outW; j++) {
            let sum = 0;
            for (let ki = 0; ki < KERNEL_SIZE; ki++) {
                for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                    sum += inputData[i + ki][j + kj] * kernelData[ki][kj];
                }
            }
            rowData.push(sum);
        }
        outputData.push(rowData);
    }
    renderOutput();
}

// ═══════════════════ Highlighting ═══════════════════
function highlightReceptiveField(outR, outC) {
    try {
        const outSize = outputData.length;
        const outIndex = outR * outSize + outC;
        const outCells = outputGrid.children;

        // 1. Output highlight
        const currentOut = outputGrid.querySelector('.highlighted-output');
        if (currentOut && currentOut !== outCells[outIndex]) {
            currentOut.classList.remove('highlighted-output');
        }
        if (outCells[outIndex] && !outCells[outIndex].classList.contains('highlighted-output')) {
            outCells[outIndex].classList.add('highlighted-output');
        }

        const calcInputGrid = document.getElementById('calc-input-grid');
        const calcResult = document.getElementById('calc-result');

        // 2. Ensure mini input grid has correct number of cells
        if (calcInputGrid) {
            const totalCells = KERNEL_SIZE * KERNEL_SIZE;
            if (calcInputGrid.children.length !== totalCells) {
                calcInputGrid.innerHTML = '';
                calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, var(--mini-cell-size))`;
                for (let i = 0; i < totalCells; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'mini-cell';
                    calcInputGrid.appendChild(cell);
                }
            }
        }

        // 3. Input highlight (diff-based)
        const newInIndices = new Set();
        for (let ki = 0; ki < KERNEL_SIZE; ki++) {
            for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                const r = outR + ki;
                const c = outC + kj;
                newInIndices.add(r * GRID_SIZE + c);
            }
        }

        const inCells = inputGrid.children;
        const currentIn = inputGrid.querySelectorAll('.highlighted-input');
        currentIn.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            if (!newInIndices.has(r * GRID_SIZE + c)) cell.classList.remove('highlighted-input');
        });
        newInIndices.forEach(idx => {
            if (inCells[idx] && !inCells[idx].classList.contains('highlighted-input')) {
                inCells[idx].classList.add('highlighted-input');
            }
        });

        // 4. Compute & populate mini grid + math
        let sum = 0;
        let terms = [];
        let miniGridIdx = 0;

        for (let ki = 0; ki < KERNEL_SIZE; ki++) {
            for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                const r = outR + ki;
                const c = outC + kj;
                let pVal = 0;
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    pVal = inputData[r][c];
                }
                const kVal = kernelData[ki][kj];
                const prod = pVal * kVal;
                sum += prod;

                // Update mini input cell
                if (calcInputGrid && calcInputGrid.children[miniGridIdx]) {
                    const inCell = calcInputGrid.children[miniGridIdx];
                    inCell.textContent = pVal;
                    if (pVal === 1) {
                        inCell.style.backgroundColor = '#1a2744';
                        inCell.style.color = '#fff';
                    } else {
                        inCell.style.backgroundColor = '#fff';
                        inCell.style.color = '#ccc';
                    }
                }
                miniGridIdx++;

                terms.push({ pVal, kVal, prod });
            }
        }

        // Result box
        if (calcResult) {
            const rounded = Math.round(sum);
            calcResult.textContent = rounded;
            calcResult.className = 'result-box';
            if (rounded >= 2) calcResult.classList.add('val-pos-high');
            else if (rounded > 0) calcResult.classList.add('val-pos-mid');
            else if (rounded <= -2) calcResult.classList.add('val-neg-high');
            else if (rounded < 0) calcResult.classList.add('val-neg-mid');
            else calcResult.classList.add('val-zero');
        }

        // Math display
        const nonZeroTerms = terms.filter(t => Math.abs(t.prod) > 0.001);
        if (nonZeroTerms.length > 0) {
            let html = '<div style="margin-bottom:4px; font-size:0.8rem; color:#6b8299;">(pixel × filter) sum:</div>';
            html += terms.map(t => {
                const highlight = Math.abs(t.prod) > 0.001;
                const bg = highlight ? (t.prod > 0 ? '#ffebee' : '#e3f2fd') : '#f5f5f5';
                const color = highlight ? (t.prod > 0 ? '#c62828' : '#1565c0') : '#bbb';
                return `<span style="display:inline-block;background:${bg};padding:2px 6px;border-radius:4px;margin:1px 2px;color:${color};font-size:0.82rem;">(${t.pVal}×${t.kVal})</span>`;
            }).join(' + ');
            html += `<div style="display:inline-block;margin-top:8px;font-size:1.1rem;color:var(--text-color);"> = <strong>${sum % 1 === 0 ? sum : sum.toFixed(2)}</strong></div>`;
            mathDisplay.innerHTML = html;
        } else {
            mathDisplay.innerHTML = `<span style="color:#999;">0 — all zero interactions</span>`;
        }

        // Position text
        const outW = GRID_SIZE - KERNEL_SIZE + 1;
        const step = outR * outW + outC + 1;
        const totalSteps = outW * outW;
        calcText.innerHTML = `Position (${outR}, ${outC}) &nbsp;·&nbsp; <span class="step-indicator">Step ${step} / ${totalSteps}</span>`;

    } catch (err) {
        console.error("Highlight error:", err);
        clearHighlights();
    }
}

function clearHighlights() {
    inputGrid.querySelectorAll('.highlighted-input').forEach(c => c.classList.remove('highlighted-input'));
    outputGrid.querySelectorAll('.highlighted-output').forEach(c => c.classList.remove('highlighted-output'));

    // Reset mini input grid in-place
    const calcInputGrid = document.getElementById('calc-input-grid');
    if (calcInputGrid) {
        const totalCells = KERNEL_SIZE * KERNEL_SIZE;
        if (calcInputGrid.children.length !== totalCells) {
            initMiniInputGrid();
        } else {
            for (let i = 0; i < calcInputGrid.children.length; i++) {
                const cell = calcInputGrid.children[i];
                cell.textContent = '0';
                cell.style.backgroundColor = '#fff';
                cell.style.color = '#ccc';
            }
        }
    }

    const calcResult = document.getElementById('calc-result');
    if (calcResult) {
        calcResult.textContent = '?';
        calcResult.className = 'result-box';
    }

    mathDisplay.innerHTML = "<em style='color:#999;'>Hover over output pixels or press Step to see the math</em>";
    calcText.textContent = "Hover over output or press Step";
}

// ═══════════════════ Animation ═══════════════════
function advancePosition() {
    const outSize = GRID_SIZE - KERNEL_SIZE + 1;
    animCol++;
    if (animCol >= outSize) {
        animCol = 0;
        animRow++;
    }
    if (animRow >= outSize) {
        animRow = 0;
    }
}

function startAnimation() {
    stopAnimation();
    animationInterval = setInterval(() => {
        try {
            // Clear previous highlights efficiently
            inputGrid.querySelectorAll('.highlighted-input').forEach(c => c.classList.remove('highlighted-input'));
            outputGrid.querySelectorAll('.highlighted-output').forEach(c => c.classList.remove('highlighted-output'));

            highlightReceptiveField(animRow, animCol);
            advancePosition();
        } catch (err) {
            console.error("Animation error:", err);
            stopAnimation();
        }
    }, 300);
}

function stopAnimation() {
    clearInterval(animationInterval);
    animationInterval = null;
}

// ═══════════════════ Start ═══════════════════
init();
