// Configuration
const GRID_SIZE = 14; // Increased to 14x14 for better digit representation
const KERNEL_SIZE = 3;

// State
let inputData = [];
let kernelData = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1] // Default Top Sobel
];
let outputData = [];
let isDrawingMode = false; // Toggle state

// DOM Elements
const inputGrid = document.getElementById('input-grid');
const kernelGrid = document.getElementById('kernel-grid');
const outputGrid = document.getElementById('output-grid');
const filterSelect = document.getElementById('filter-select');
const imageSelect = document.getElementById('image-select');
const mathDisplay = document.getElementById('math-display');
const calcText = document.getElementById('calc-text');

// Kernels (Filters) - Renamed for friendlier UI if needed, but keeping keys assumes matching value
// Kernels (Filters)
const KERNELS = {
    'identity': [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    'top-sobel': [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], // Flipped for positive activation on 0->1
    'bottom-sobel': [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
    'left-sobel': [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], // Flipped
    'right-sobel': [[1, 0, -1], [2, 0, -2], [1, 0, -1]],
    'outline': [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    'sharpen': [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    'blur': [[0.0625, 0.125, 0.0625], [0.125, 0.25, 0.125], [0.0625, 0.125, 0.0625]],
    'custom': [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
};

// ... (PRESETS remain the same, huge block omitted for brevity in tool call if not changing) ...

// Skipping to renderInput modifications
// Note: In a real tool call I must include enough context or replace the specific functions. 
// I will replace separate blocks to be safe and precise.

// Block 1: Kernels


// Preset Images (14x14 Digits and Shapes)
const PRESETS = {
    'digit-0': [
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-1': [
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-7': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'shape-rect': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-2': [
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-3': [
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-4': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'digit-5': [
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'shape-cross': [
        [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    // Add more presets similarly...
};



function init() {
    // Initialize Input Data
    inputData = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

    // Create Grids
    createGrid(inputGrid, GRID_SIZE, 'input');
    createKernelGrid();
    const outSize = GRID_SIZE - KERNEL_SIZE + 1;
    createGrid(outputGrid, outSize, 'output');

    // Initial Load
    imageSelect.value = 'digit-7'; // Start with a 7
    loadPreset('digit-7');

    // Kernel check
    if (filterSelect.value && KERNELS[filterSelect.value]) {
        kernelData = JSON.parse(JSON.stringify(KERNELS[filterSelect.value]));
    }
    updateKernelView();
    updateMiniKernel();

    // Initialize Input Window in explainer with zeros (placeholder)
    const calcInputGrid = document.getElementById('calc-input-grid');
    if (calcInputGrid) {
        calcInputGrid.innerHTML = '';
        calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, var(--mini-cell-size))`;
        for (let i = 0; i < KERNEL_SIZE * KERNEL_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'mini-cell';
            cell.textContent = '0';
            cell.style.backgroundColor = '#fff';
            calcInputGrid.appendChild(cell);
        }
    }

    calculateConvolution();

    // Event Listeners
    filterSelect.addEventListener('change', (e) => {
        stopAnimation();
        handleFilterChange(e);
    });

    imageSelect.addEventListener('change', (e) => {
        stopAnimation();
        if (e.target.value === 'random') {
            randomizeInput();
        } else {
            loadPreset(e.target.value);
        }
        calculateConvolution();
    });

    // Draw Mode Toggle
    const drawBtn = document.getElementById('draw-mode');
    drawBtn.addEventListener('click', () => {
        isDrawingMode = !isDrawingMode;

        if (isDrawingMode) {
            drawBtn.classList.add('active-mode'); // UX: Visual indicator
            drawBtn.style.backgroundColor = '#4caf50'; // Green for active
            drawBtn.textContent = '✏️ Drawing ON';
            imageSelect.value = 'custom'; // Logic: Set image to custom
            // We DO NOT clear input here, allowing user to edit existing. 
            // Or should we? "Draw a custom shape" implies fresh start?
            // Let's keep existing, user can clear if needed.
        } else {
            drawBtn.classList.remove('active-mode');
            drawBtn.style.backgroundColor = ''; // Revert
            drawBtn.textContent = '✏️ Draw';
            // Logic: Filter remains unchanged (fixes user bug)
        }
    });

    document.getElementById('clear-input').addEventListener('click', () => {
        stopAnimation();
        clearInput();
        calculateConvolution();
        // Update to custom if we clear?
        imageSelect.value = 'custom';
    });

    const animateBtn = document.getElementById('animate-btn');
    const stopBtn = document.getElementById('stop-btn');

    animateBtn.addEventListener('click', () => {
        animateBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        startAnimation();
    });

    stopBtn.addEventListener('click', () => {
        stopBtn.style.display = 'none';
        animateBtn.style.display = 'inline-block';
        stopAnimation();
    });

    // ── Output grid hover: event delegation on the container ──
    // Using 'mouseover' on the grid so moving between cells
    // (even across borders) keeps the highlight stable.
    let lastHoveredCell = null;

    outputGrid.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell || cell.dataset.type !== 'output') return;
        if (cell === lastHoveredCell) return;   // same cell — skip
        lastHoveredCell = cell;

        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);

        // Pause animation without destroying highlights
        clearInterval(animationInterval);
        const animateBtn = document.getElementById('animate-btn');
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn && stopBtn.style.display !== 'none') {
            stopBtn.style.display = 'none';
            animateBtn.style.display = 'inline-block';
        }

        highlightReceptiveField(r, c);
    });

    let gridLeaveTimeout = null;
    outputGrid.addEventListener('mouseleave', () => {
        lastHoveredCell = null;
        gridLeaveTimeout = setTimeout(clearHighlights, 120);
    });
    outputGrid.addEventListener('mouseenter', () => {
        if (gridLeaveTimeout) {
            clearTimeout(gridLeaveTimeout);
            gridLeaveTimeout = null;
        }
    });
}

function createGrid(container, size, type) {
    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 32;
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
            } else if (type === 'output') {
                // Hover handled by grid-level event delegation (see init)
            }

            container.appendChild(cell);
        }
    }
}

function createKernelGrid() {
    kernelGrid.innerHTML = '';
    const kCellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--kernel-cell-size')) || 70;
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
                // Allow user to type "-" or empty without forcing 0 immediately in the data, 
                // but for calculation we need a number.
                // If it's NaN, we might keep the old value in data? Or treat as 0?
                // Treating as 0 is safer for calculation. 
                // However, we want the mini-kernel to update?
                // Let's us 0 for calc, but maybe don't "fix" the input value.

                kernelData[i][j] = isNaN(val) ? 0 : val;
                filterSelect.value = 'custom';

                updateMiniKernel(); // Update the visual explainer
                calculateConvolution();
            });

            cell.appendChild(input);
            kernelGrid.appendChild(cell);
        }
    }
}

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

function togglePixel(r, c, forceOn = false) {
    const currentVal = inputData[r][c];
    let newVal;

    if (forceOn) {
        newVal = 1;
    } else {
        newVal = currentVal === 0 ? 1 : 0;
    }

    // Performance Update 1: Break loop if value hasn't effectively changed
    // This prevents re-writes when dragging over the same pixel repeatedly
    if (newVal === currentVal) return;

    // Update Data
    inputData[r][c] = newVal;

    // Performance Update 2: Conditional DOM update (Don't trigger paint layout on dropdown if not needed)
    if (imageSelect.value !== 'custom') {
        imageSelect.value = 'custom';
    }

    // Performance Update 3: Update ONLY the specific cell, do not re-render entire grid (renderInput())
    // O(1) DOM update instead of O(N)
    const cells = inputGrid.children;
    const cellIndex = r * GRID_SIZE + c;
    const cell = cells[cellIndex];
    if (cell) {
        if (newVal === 1) {
            cell.style.backgroundColor = '#0d47a1';
            cell.style.color = 'white';
            cell.style.border = '1px solid #0d47a1';
        } else {
            cell.style.backgroundColor = 'white'; // default
            cell.style.color = '#ccc';
            cell.style.border = '1px solid #e0e0e0';
        }
        cell.textContent = newVal;
    }

    // Performance Update 4: Debounce/Throttle Convolution
    // Drawing can fire mouseover every ~8-16ms. Calculation is expensive.
    // We batch the calculation to the next frame or small delay.
    if (window.calcTimeout) clearTimeout(window.calcTimeout);
    window.calcTimeout = setTimeout(() => {
        calculateConvolution();
    }, 10);
}

function randomizeInput() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            inputData[i][j] = Math.random() > 0.8 ? 1 : 0; // Less noise for cleaner look
        }
    }
    renderInput();
}

function loadPreset(name) {
    if (PRESETS[name]) {
        // Deep copy
        inputData = JSON.parse(JSON.stringify(PRESETS[name]));
        renderInput();
    }
}

function clearInput() {
    inputData = inputData.map(row => row.map(() => 0));
    renderInput();
}

function renderInput() {
    const cells = inputGrid.children;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const val = inputData[i][j];
            const cell = cells[i * GRID_SIZE + j];

            // Solid impact style
            // If it's a 1, it's dark blue/black. If 0, white.
            if (val === 1) {
                cell.style.backgroundColor = '#0d47a1'; // Dark Blue
                cell.style.color = 'white';
                cell.style.border = '1px solid #0d47a1';
            } else {
                cell.style.backgroundColor = 'white';
                cell.style.color = '#ccc';
                cell.style.border = '1px solid #e0e0e0';
            }

            cell.textContent = val;
        }
    }
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

function renderOutput() {
    const outSize = outputData.length;

    // Ensure grid matches size
    if (outputGrid.children.length !== outSize * outSize) {
        createGrid(outputGrid, outSize, 'output');
    }

    const cells = outputGrid.children;
    const classesToCheck = ['val-pos-high', 'val-pos-mid', 'val-neg-high', 'val-neg-mid'];

    for (let i = 0; i < outSize; i++) {
        for (let j = 0; j < outSize; j++) {
            const val = outputData[i][j];
            const cell = cells[i * outSize + j];
            if (!cell) continue;

            const roundedVal = Math.round(val);

            // 1. Text Content — strict comparison to avoid JS coercion
            //    ("" == 0 is true in JS, so loose != skips setting "0")
            const valStr = String(roundedVal);
            if (cell.textContent !== valStr) {
                cell.textContent = valStr;
            }

            // 2. Class Diffing (Crucial for flicker)
            let targetClass = '';
            if (roundedVal >= 2) targetClass = 'val-pos-high';
            else if (roundedVal > 0) targetClass = 'val-pos-mid';
            else if (roundedVal <= -2) targetClass = 'val-neg-high';
            else if (roundedVal < 0) targetClass = 'val-neg-mid';
            else targetClass = 'val-zero'; // roundedVal === 0

            // Remove unwanted classes (including val-zero)
            const allValClasses = ['val-pos-high', 'val-pos-mid', 'val-neg-high', 'val-neg-mid', 'val-zero'];

            allValClasses.forEach(cls => {
                if (cls !== targetClass && cell.classList.contains(cls)) {
                    cell.classList.remove(cls);
                }
            });

            // Add target class only if missing
            if (targetClass && !cell.classList.contains(targetClass)) {
                cell.classList.add(targetClass);
            }

            // 3. Color Diffing - REMOVED! Handled by CSS classes now.
            // Ensure no inline color overrides the class
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
            // Solid colors for impact
            if (kVal > 0) {
                kCell.style.backgroundColor = '#90caf9'; // Light Blue
                kCell.style.color = '#000';
            } else if (kVal < 0) {
                kCell.style.backgroundColor = '#ffccbc'; // Light Orange
                kCell.style.color = '#000';
            } else {
                kCell.style.backgroundColor = '#fff';
                kCell.style.color = '#ccc';
            }
            calcKernelGrid.appendChild(kCell);
        }
    }
}

function highlightReceptiveField(outR, outC) {
    try {
        const outSize = outputData.length;
        const outIndex = outR * outSize + outC;
        const outCells = outputGrid.children;

        // 1. Smart Output Highlight (Only change if different)
        // Check if allow "multiple" output (unlikely in this logic, usually 1 active)
        // We'll just ensure the correct one is on, others off.
        const currentOut = outputGrid.querySelector('.highlighted-output');
        if (currentOut && currentOut !== outCells[outIndex]) {
            currentOut.classList.remove('highlighted-output');
        }
        if (outCells[outIndex] && !outCells[outIndex].classList.contains('highlighted-output')) {
            outCells[outIndex].classList.add('highlighted-output');
        }

        const calcInputGrid = document.getElementById('calc-input-grid');
        const calcResult = document.getElementById('calc-result');

        // 2. Render Input Window (Mini Grid) - OPTIMIZED: Reuse DOM
        if (calcInputGrid) {
            const totalCells = KERNEL_SIZE * KERNEL_SIZE;

            // One-time setup if empty or wrong size
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

        let sum = 0;
        let terms = [];
        let miniGridIdx = 0; // Linear index for mini-grid updates

        // Collect Target Input Indices for this Receptive Field
        const newInIndices = new Set();
        for (let ki = 0; ki < KERNEL_SIZE; ki++) {
            for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                const r = outR + ki;
                const c = outC + kj;
                const idx = r * GRID_SIZE + c;
                newInIndices.add(idx);
            }
        }

        // 3. Smart Input Highlight (Diffing)
        const inCells = inputGrid.children;
        const currentIn = inputGrid.querySelectorAll('.highlighted-input');

        currentIn.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            const idx = r * GRID_SIZE + c;
            if (!newInIndices.has(idx)) {
                cell.classList.remove('highlighted-input');
            }
        });

        newInIndices.forEach(idx => {
            if (inCells[idx] && !inCells[idx].classList.contains('highlighted-input')) {
                inCells[idx].classList.add('highlighted-input');
            }
        });

        // 4. Calculate & Populate Mini Grid (Update existing DOM)
        // 4. Calculate & Populate Mini Grid (Update existing DOM)
        for (let ki = 0; ki < KERNEL_SIZE; ki++) {
            for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                const r = outR + ki;
                const c = outC + kj;

                // Handle Boundaries (Zero Padding)
                // Fixes "stale data" flicker where miniGridIdx desyncs
                let pVal = 0;
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    pVal = inputData[r][c];
                }

                const kVal = kernelData[ki][kj];
                const prod = pVal * kVal;
                sum += prod;

                // UPDATE Mini Input Cell (DOM Reuse)
                if (calcInputGrid && calcInputGrid.children[miniGridIdx]) {
                    const inCell = calcInputGrid.children[miniGridIdx];
                    inCell.textContent = pVal;

                    // Solid styling update
                    // Reset style to base first if needed, but we overwrite properties
                    if (pVal === 1) {
                        inCell.style.backgroundColor = '#0d47a1';
                        inCell.style.color = 'white';
                    } else {
                        inCell.style.backgroundColor = 'white';
                        inCell.style.color = '#ccc';
                    }
                }
                miniGridIdx++; // ALWAYS increment to keep sync!

                // We don't rebuild kernel here, just calculate
                if (Math.abs(prod) > 0.01) {
                    terms.push(`(${pVal}×${kVal})`);
                }
            }
        }

        if (calcResult) {
            calcResult.textContent = Math.round(sum);
            calcResult.className = 'result-box'; // reset
            if (sum >= 2) calcResult.classList.add('val-pos-high');
            else if (sum > 0) calcResult.classList.add('val-pos-mid');
            else if (sum <= -2) calcResult.classList.add('val-neg-high');
            else if (sum < 0) calcResult.classList.add('val-neg-mid');
            else if (sum === 0) calcResult.classList.add('val-zero'); // Consistent styling
        }

        if (terms.length > 0) {
            let html = `<div style="font-size: 0.9rem; color: #555;">(Pixel × Filter) Sum:</div>`;
            html += terms.map(t => `<span style="background:#e3f2fd; padding: 2px 5px; border-radius: 4px; margin: 0 2px;">${t}</span>`).join(' + ');
            html += `<div style="margin-top: 10px; font-size: 1.2rem; color: var(--text-color);"> = <strong>${sum.toFixed(1)}</strong></div>`;
            mathDisplay.innerHTML = html;
        } else {
            mathDisplay.innerHTML = "0 <span style='font-size:0.8rem; color:#888'>(All zero interactions)</span>";
        }

        calcText.textContent = `Spot Value: ${sum.toFixed(1)}`;

    } catch (err) {
        console.error("Highlight error:", err);
        clearHighlights(); // Restore state so it doesn't look broken
    }
}


function clearHighlights() {
    const inCells = inputGrid.querySelectorAll('.highlighted-input');
    inCells.forEach(c => c.classList.remove('highlighted-input'));

    const outCells = outputGrid.querySelectorAll('.highlighted-output');
    outCells.forEach(c => c.classList.remove('highlighted-output'));

    // Reset mini-grid cells IN-PLACE (no innerHTML destroy/rebuild)
    const calcInputGrid = document.getElementById('calc-input-grid');
    if (calcInputGrid) {
        const totalCells = KERNEL_SIZE * KERNEL_SIZE;
        if (calcInputGrid.children.length !== totalCells) {
            // First time or wrong size: build from scratch
            calcInputGrid.innerHTML = '';
            calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, var(--mini-cell-size))`;
            for (let i = 0; i < totalCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'mini-cell';
                cell.textContent = '0';
                cell.style.backgroundColor = '#fff';
                cell.style.color = '#ccc';
                calcInputGrid.appendChild(cell);
            }
        } else {
            // Reuse existing nodes — just reset content/styles
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

    mathDisplay.innerHTML = "<em>Hover over the colorful grid or click Calculate to see the magic math!</em>";
    calcText.textContent = "Hover over the colorful grid to see the magic math!";
}

let animationInterval;
function startAnimation() {
    const outSize = outputData.length;
    let r = 0;
    let c = 0;

    stopAnimation(); // safe clear

    animationInterval = setInterval(() => {
        try {
            // Manual clear to avoid flickering
            const inCells = inputGrid.querySelectorAll('.highlighted-input');
            if (inCells) inCells.forEach(c => c.classList.remove('highlighted-input'));

            const outCells = outputGrid.querySelectorAll('.highlighted-output');
            if (outCells) outCells.forEach(c => c.classList.remove('highlighted-output'));

            highlightReceptiveField(r, c);

            c++;
            if (c >= outSize) {
                c = 0;
                r++;
            }
            if (r >= outSize) r = 0;
        } catch (err) {
            console.error("Animation error:", err);
            stopAnimation();
        }
    }, 300);
}

function stopAnimation() {
    clearInterval(animationInterval);
    clearHighlights();
}

// Start
init();