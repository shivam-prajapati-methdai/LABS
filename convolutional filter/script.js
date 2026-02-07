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

    document.getElementById('clear-input').addEventListener('click', () => {
        stopAnimation();
        clearInput();
        calculateConvolution();
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
}

function createGrid(container, size, type) {
    container.style.gridTemplateColumns = `repeat(${size}, 25px)`;
    container.style.gridTemplateRows = `repeat(${size}, 25px)`;
    container.innerHTML = '';

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.type = type;

            if (type === 'input') {
                cell.addEventListener('click', () => togglePixel(i, j));
                cell.addEventListener('mouseover', (e) => {
                    if (e.buttons === 1) {
                        togglePixel(i, j, true);
                    }
                });
            } else if (type === 'output') {
                cell.addEventListener('mouseenter', () => highlightReceptiveField(i, j));
                cell.addEventListener('mouseleave', clearHighlights);
            }

            container.appendChild(cell);
        }
    }
}

function createKernelGrid() {
    kernelGrid.innerHTML = '';
    for (let i = 0; i < KERNEL_SIZE; i++) {
        for (let j = 0; j < KERNEL_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.1';
            input.value = kernelData[i][j];
            input.addEventListener('input', (e) => {
                kernelData[i][j] = parseFloat(e.target.value) || 0;
                filterSelect.value = 'custom';
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
    if (forceOn) {
        inputData[r][c] = 1;
    } else {
        inputData[r][c] = inputData[r][c] === 0 ? 1 : 0;
    }
    imageSelect.value = 'custom'; // Switch to custom if edited
    renderInput();
    calculateConvolution();
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

            // Grayscale shading for input
            const intensity = Math.floor(val * 255);
            cell.style.backgroundColor = val > 0 ? `rgb(${intensity}, ${intensity}, ${intensity})` : 'var(--cell-empty)';
            cell.style.border = val > 0 ? '1px solid #333' : '1px solid #eee';

            // Show number if 1, else empty for cleanliness? Or 0?
            // User asked for "image block contains no number". Let's show 1. 0 can be empty.
            cell.textContent = val === 1 ? '1' : '';
            // Make sure text color is visible on white background
            cell.style.color = val === 1 ? 'black' : '#ccc';
        }
    }
}

function handleFilterChange(e) {
    const filterName = e.target.value;
    if (KERNELS[filterName]) {
        kernelData = JSON.parse(JSON.stringify(KERNELS[filterName]));
        updateKernelView();
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
    for (let i = 0; i < outSize; i++) {
        for (let j = 0; j < outSize; j++) {
            const val = outputData[i][j];
            const cell = cells[i * outSize + j];
            if (!cell) continue;

            // Simplify display for kids: just show colors, or minimal spread
            // Use classes
            cell.className = 'cell';

            if (val >= 2) cell.classList.add('val-pos-high');
            else if (val > 0) cell.classList.add('val-pos-mid');
            else if (val <= -2) cell.classList.add('val-neg-high');
            else if (val < 0) cell.classList.add('val-neg-mid');

            // Show numbers. user wanted them visible.
            cell.textContent = Math.round(val);
            if (val === 0) cell.style.color = '#aaa'; // Dim zeros
        }
    }
}

function highlightReceptiveField(outR, outC) {
    const outSize = outputData.length;
    const outCells = outputGrid.children;
    const outIndex = outR * outSize + outC;
    outCells[outIndex].classList.add('highlighted-output');

    const inCells = inputGrid.children;
    let calculationStr = `Magic Calculation:\n\n`;
    let sum = 0;
    let terms = [];

    for (let ki = 0; ki < KERNEL_SIZE; ki++) {
        for (let kj = 0; kj < KERNEL_SIZE; kj++) {
            const r = outR + ki;
            const c = outC + kj;
            const idx = r * GRID_SIZE + c;

            if (inCells[idx]) {
                inCells[idx].classList.add('highlighted-input');
            }

            const pVal = inputData[r][c];
            const kVal = kernelData[ki][kj];
            const prod = pVal * kVal;
            sum += prod;

            if (Math.abs(prod) > 0.01) {
                terms.push(`${pVal}×${kVal}`);
            }
        }
    }

    if (terms.length > 0) {
        calculationStr += terms.join(' + ');
        calculationStr += `\n= ${sum.toFixed(1)}`;
    } else {
        calculationStr += "0 (Empty space)";
    }

    mathDisplay.textContent = calculationStr;
    calcText.textContent = `Spot Value: ${sum.toFixed(1)}`;
}

function clearHighlights() {
    const inCells = inputGrid.querySelectorAll('.highlighted-input');
    inCells.forEach(c => c.classList.remove('highlighted-input'));

    const outCells = outputGrid.querySelectorAll('.highlighted-output');
    outCells.forEach(c => c.classList.remove('highlighted-output'));

    mathDisplay.textContent = "";
    calcText.textContent = "Hover over the colorful grid to see the magic math!";
}

let animationInterval;
function startAnimation() {
    const outSize = outputData.length;
    let r = 0;
    let c = 0;

    clearHighlights();

    animationInterval = setInterval(() => {
        clearHighlights();
        highlightReceptiveField(r, c);

        c++;
        if (c >= outSize) {
            c = 0;
            r++;
        }
        if (r >= outSize) {
            // Loop functionality
            r = 0;
            // stopAnimation(); // Optional: auto stop
        }
    }, 150);
}

function stopAnimation() {
    clearInterval(animationInterval);
    clearHighlights();
}

// Start
init();
