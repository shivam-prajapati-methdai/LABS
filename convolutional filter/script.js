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
        calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, 50px)`;
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

    // Clear highlights when leaving the entire output grid (prevents flickering)
    outputGrid.addEventListener('mouseleave', clearHighlights);
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
                cell.addEventListener('click', () => {
                    if (isDrawingMode) togglePixel(i, j);
                });
                cell.addEventListener('mouseover', (e) => {
                    if (isDrawingMode && e.buttons === 1) {
                        togglePixel(i, j, true);
                    }
                });
            } else if (type === 'output') {
                cell.addEventListener('mouseenter', () => {
                    // Debounce/Delay to prevent flickering on fast movement
                    if (window.hoverTimeout) clearTimeout(window.hoverTimeout);

                    window.hoverTimeout = setTimeout(() => {
                        stopAnimation();
                        highlightReceptiveField(i, j);
                    }, 20); // 20ms delay is enough to skip accidental diagonal crossings
                });

                // Clear on leave start, but maybe better to just let the new enter handle it?
                // The container leave handles the final clear.
                // Adding a cell leave to cancel the timeout if we leave before it fires.
                cell.addEventListener('mouseleave', () => {
                    if (window.hoverTimeout) clearTimeout(window.hoverTimeout);
                });
            }

            container.appendChild(cell);
        }
    }

    // Add container-level leave event for output to clear when actually leaving the grid
    if (type === 'output') {
        // Remove old if any (anonymous func hard to remove, but this function runs rarely)
        // Better to put this in init, but user might resize? 
        // Let's rely on init for the container event to avoid duplicates, 
        // OR just do it here with a check? No, init is safer.
        // Wait, I can't easily edit init and this function in one go if they are far apart.
        // I will just remove the cell listener here.
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

function updateMiniKernel() {
    const calcKernelGrid = document.getElementById('calc-kernel-grid');
    if (!calcKernelGrid) return;

    calcKernelGrid.innerHTML = '';
    calcKernelGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, 50px)`;

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
        // Clear previous highlights first to prevent "trailing" selections
        const prevIn = inputGrid.querySelectorAll('.highlighted-input');
        if (prevIn) prevIn.forEach(c => c.classList.remove('highlighted-input'));

        const prevOut = outputGrid.querySelectorAll('.highlighted-output');
        if (prevOut) prevOut.forEach(c => c.classList.remove('highlighted-output'));

        const outSize = outputData.length;
        const outCells = outputGrid.children;
        const outIndex = outR * outSize + outC;
        if (outCells[outIndex]) outCells[outIndex].classList.add('highlighted-output');

        const calcInputGrid = document.getElementById('calc-input-grid');
        const calcResult = document.getElementById('calc-result');

        // 1. Render Input Window (Mini Grid)
        if (calcInputGrid) {
            calcInputGrid.innerHTML = '';
            calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, 50px)`;
        }

        // Ensure mini kernel is up to date (though should be static unless changed)
        // updateMiniKernel(); // optimization: remove redundant call on hover

        let sum = 0;
        let terms = [];

        const inCells = inputGrid.children;

        for (let ki = 0; ki < KERNEL_SIZE; ki++) {
            for (let kj = 0; kj < KERNEL_SIZE; kj++) {
                const r = outR + ki;
                const c = outC + kj;
                const idx = r * GRID_SIZE + c;

                // Highlight main grids
                if (inCells[idx]) {
                    inCells[idx].classList.add('highlighted-input');
                }

                // Safety check for data
                if (!inputData[r] || inputData[r][c] === undefined) continue;

                const pVal = inputData[r][c];
                const kVal = kernelData[ki][kj];
                const prod = pVal * kVal;
                sum += prod;

                // Create Mini Input Cell
                const inCell = document.createElement('div');
                inCell.className = 'mini-cell';
                inCell.textContent = pVal;
                // Solid styling
                if (pVal === 1) {
                    inCell.style.backgroundColor = '#0d47a1';
                    inCell.style.color = 'white';
                } else {
                    inCell.style.backgroundColor = 'white';
                    inCell.style.color = '#ccc';
                }
                if (calcInputGrid) calcInputGrid.appendChild(inCell);

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
        }

        if (terms.length > 0) {
            // formula logic
            // Use Math.round for display to match result box, or keep fixed(1)? User didn't specify. 
            // Fixed(1) is good for detail.
            mathDisplay.innerHTML = `<div style="font-size: 0.9rem; color: #555;">(Pixel × Filter) Sum:</div>`;
            mathDisplay.innerHTML += terms.map(t => `<span style="background:#e3f2fd; padding: 2px 5px; border-radius: 4px; margin: 0 2px;">${t}</span>`).join(' + ');
            mathDisplay.innerHTML += `<div style="margin-top: 10px; font-size: 1.2rem; color: var(--text-color);"> = <strong>${sum.toFixed(1)}</strong></div>`;
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

    // Don't clear mini-grids, let them persist as "last viewed" or default?
    // Actually, maybe clear Input Window and Result, but keep Kernel?
    const calcInputGrid = document.getElementById('calc-input-grid');
    if (calcInputGrid) {
        calcInputGrid.innerHTML = '';
        calcInputGrid.style.gridTemplateColumns = `repeat(${KERNEL_SIZE}, 50px)`;
        for (let i = 0; i < KERNEL_SIZE * KERNEL_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'mini-cell';
            cell.textContent = '0';
            cell.style.backgroundColor = '#fff';
            calcInputGrid.appendChild(cell);
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
