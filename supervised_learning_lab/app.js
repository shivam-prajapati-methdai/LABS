// Global variables
let canvas, ctx;
let mode = 'linear'; // 'linear' or 'logistic'
let linearPoints = [];
let logisticPoints = [];
let points = linearPoints; // Initially, points will refer to linearPoints
let isDragging = false;
let dragIndex = -1;
let currentClass = 0; // For logistic regression
let mouseDownPos = null;

// Data from JSON
const data = {
    linearExamples: [
        {"name": "House Prices", "points": [[1200, 150000], [1500, 180000], [1800, 220000], [2000, 250000], [2200, 280000], [2500, 320000], [2800, 350000]]},
        {"name": "Study Hours vs Grades", "points": [[2, 65], [3, 70], [4, 75], [5, 80], [6, 85], [7, 88], [8, 92], [9, 95]]}
    ],
    logisticExamples: [
        {"name": "Pass/Fail", "class0": [[2, 0], [3, 0], [4, 0], [5, 0]], "class1": [[6, 1], [7, 1], [8, 1], [9, 1]]},
        {"name": "Email Spam", "class0": [[1, 0], [2, 0], [3, 0], [4, 0]], "class1": [[6, 1], [7, 1], [8, 1], [9, 1]]}
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initCanvas();
    setupEventListeners();
    updateMode();
    loadExampleDatasets();
    drawCanvas();
    setupTooltips();
});

function setupTooltips() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    tooltipIcons.forEach(icon => {
        const tooltipText = icon.dataset.tooltip;
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        icon.appendChild(tooltip);
    });
}

function initCanvas() {
    canvas = document.getElementById('regression-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    drawCanvas();
}

function setupEventListeners() {
    // Mode switching
    document.getElementById('linear-mode-btn').addEventListener('click', () => switchMode('linear'));
    document.getElementById('logistic-mode-btn').addEventListener('click', () => switchMode('logistic'));
    
    // Canvas interactions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleRightClick);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // Controls
    document.getElementById('clear-btn').addEventListener('click', clearPoints);
    document.getElementById('add-random-btn').addEventListener('click', addRandomPoints);
    document.getElementById('dataset-select').addEventListener('change', loadSelectedDataset);
    document.getElementById('noise-slider').addEventListener('input', updateNoise);
    
    // Class selection for logistic regression
    document.getElementById('class0-btn').addEventListener('click', () => selectClass(0));
    document.getElementById('class1-btn').addEventListener('click', () => selectClass(1));
}

function switchMode(newMode) {
    if (mode === newMode) return;

    mode = newMode;
    if (mode === 'linear') {
        points = linearPoints;
    } else {
        points = logisticPoints;
    }
    updateMode();
    loadExampleDatasets();
    updateDisplay();
    drawCanvas();
}

function updateMode() {
    const linearBtn = document.getElementById('linear-mode-btn');
    const logisticBtn = document.getElementById('logistic-mode-btn');
    const linearControls = document.getElementById('linear-controls');
    const logisticControls = document.getElementById('logistic-controls');
    const educationContent = document.getElementById('education-content');
    const plotHelp = document.getElementById('plot-help');
    const statsLabels = document.querySelectorAll('.stat-label');
    
    if (mode === 'linear') {
        // Update button states
        linearBtn.classList.add('active');
        linearBtn.classList.remove('btn--secondary');
        linearBtn.classList.add('btn--primary');
        logisticBtn.classList.remove('active');
        logisticBtn.classList.remove('btn--primary');
        logisticBtn.classList.add('btn--secondary');
        
        // Update controls visibility
        linearControls.style.display = 'block';
        logisticControls.style.display = 'none';
        plotHelp.textContent = 'Click to add points • Drag to move • Right-click to remove';
        
        // Update stat labels for linear regression
        statsLabels[0].innerHTML = 'Slope (m): <span class="tooltip-icon" data-tooltip="The steepness of the line.">?</span>';
        statsLabels[1].innerHTML = 'Intercept (b): <span class="tooltip-icon" data-tooltip="Where the line crosses the y-axis.">?</span>';
        statsLabels[2].innerHTML = 'R²: <span class="tooltip-icon" data-tooltip="How well the line fits the data (from 0 to 1).">?</span>';
        statsLabels[3].innerHTML = 'Correlation: <span class="tooltip-icon" data-tooltip="The strength and direction of the relationship between the variables.">?</span>';
        
        // Update educational content
        educationContent.innerHTML = `
            <div class="education-section">
                <h4>What is Linear Regression?</h4>
                <p>Linear regression finds the best-fit straight line through data points to predict continuous values.</p>
                
                <h4>When to Use It</h4>
                <p>Used for predicting numerical outcomes like prices, temperatures, or scores.</p>

                <h4>Why it's cool</h4>
                <p>Predict the future! Well, sort of. You can estimate house prices, grades, or even how much ice cream you'll sell based on the temperature.</p>
                
                <h4>Key Concepts</h4>
                <ul>
                    <li><strong>Slope (m):</strong> Rate of change</li>
                    <li><strong>Intercept (b):</strong> Y-value when X=0</li>
                    <li><strong>R²:</strong> How well the line fits (0-1)</li>
                    <li><strong>Correlation:</strong> Strength of relationship (-1 to 1)</li>
                </ul>
            </div>
        `;
    } else {
        // Update button states
        logisticBtn.classList.add('active');
        logisticBtn.classList.remove('btn--secondary');
        logisticBtn.classList.add('btn--primary');
        linearBtn.classList.remove('active');
        linearBtn.classList.remove('btn--primary');
        linearBtn.classList.add('btn--secondary');
        
        // Update controls visibility
        linearControls.style.display = 'none';
        logisticControls.style.display = 'block';
        plotHelp.textContent = 'Click to add points • Select class first • Right-click to remove';
        
        // Update stat labels for logistic regression
        statsLabels[0].innerHTML = 'Coefficient: <span class="tooltip-icon" data-tooltip="The strength of the relationship between the input and the outcome.">?</span>';
        statsLabels[1].innerHTML = 'Intercept: <span class="tooltip-icon" data-tooltip="The starting point of the logistic curve.">?</span>';
        statsLabels[2].innerHTML = 'Accuracy: <span class="tooltip-icon" data-tooltip="How often the model predicts the correct class.">?</span>';
        statsLabels[3].innerHTML = 'Log-likelihood: <span class="tooltip-icon" data-tooltip="A measure of how well the model fits the data.">?</span>';
        
        // Update educational content
        educationContent.innerHTML = `
            <div class="education-section">
                <h4>What is Logistic Regression?</h4>
                <p>Logistic regression predicts the probability of binary outcomes using the sigmoid function.</p>
                
                <h4>When to Use It</h4>
                <p>Used for classification problems like pass/fail, spam/not spam, or disease/no disease.</p>

                <h4>Why it's cool</h4>
                <p>It's like a crystal ball for yes/no questions. Will a student pass? Is this email spam? Should I take an umbrella? Logistic regression can help you decide.</p>
                
                <h4>Key Concepts</h4>
                <ul>
                    <li><strong>Sigmoid:</strong> S-shaped curve (0 to 1)</li>
                    <li><strong>Probability:</strong> Likelihood of class 1</li>
                    <li><strong>Decision Boundary:</strong> Threshold (usually 0.5)</li>
                    <li><strong>Odds:</strong> p/(1-p) ratio</li>
                </ul>
            </div>
        `;
    }
    setupTooltips();
}

function loadExampleDatasets() {
    const select = document.getElementById('dataset-select');
    select.innerHTML = '<option value="">Select an example...</option>';
    
    if (mode === 'linear') {
        data.linearExamples.forEach((example, index) => {
            const option = document.createElement('option');
            option.value = `linear-${index}`;
            option.textContent = example.name;
            select.appendChild(option);
        });
    } else {
        data.logisticExamples.forEach((example, index) => {
            const option = document.createElement('option');
            option.value = `logistic-${index}`;
            option.textContent = example.name;
            select.appendChild(option);
        });
    }
}

function loadSelectedDataset() {
    const select = document.getElementById('dataset-select');
    const value = select.value;
    
    if (!value) return;
    
    if (value.startsWith('linear-')) {
        const index = parseInt(value.split('-')[1]);
        const example = data.linearExamples[index];
        linearPoints = example.points.map(p => ({x: p[0], y: p[1], class: 0}));
        points = linearPoints;
    } else if (value.startsWith('logistic-')) {
        const index = parseInt(value.split('-')[1]);
        const example = data.logisticExamples[index];
        logisticPoints = [
            ...example.class0.map(p => ({x: p[0], y: p[1], class: 0})),
            ...example.class1.map(p => ({x: p[0], y: p[1], class: 1}))
        ];
        points = logisticPoints;
    }
    
    updateDisplay();
    drawCanvas();
}

function selectClass(classNum) {
    currentClass = classNum;
    const class0Btn = document.getElementById('class0-btn');
    const class1Btn = document.getElementById('class1-btn');
    
    if (classNum === 0) {
        class0Btn.classList.add('active');
        class1Btn.classList.remove('active');
    } else {
        class1Btn.classList.add('active');
        class0Btn.classList.remove('active');
    }
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseDownPos = {x, y};
    
    // Check if clicking on existing point
    const clickedIndex = getPointAt(x, y);
    
    if (clickedIndex !== -1) {
        isDragging = true;
        dragIndex = clickedIndex;
        canvas.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent any other mouse actions
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging && dragIndex !== -1) {
        // Update the dragged point position
        const worldCoords = screenToWorld(x, y);
        points[dragIndex].x = Math.max(0, worldCoords.x);
        points[dragIndex].y = Math.max(0, worldCoords.y);
        
        updateDisplay();
        drawCanvas();
    } else {
        // Check if hovering over a point for cursor change
        const hoverIndex = getPointAt(x, y);
        canvas.style.cursor = hoverIndex !== -1 ? 'grab' : 'crosshair';
    }
}

function handleMouseUp(e) {
    if (isDragging) {
        // We were dragging, so don't add a new point
        isDragging = false;
        dragIndex = -1;
        canvas.style.cursor = 'crosshair';
        return;
    }
    
    // Only add a new point if we didn't drag and mouse didn't move much
    if (mouseDownPos && e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const distance = Math.sqrt(
            Math.pow(x - mouseDownPos.x, 2) + 
            Math.pow(y - mouseDownPos.y, 2)
        );
        
        // Only add point if mouse didn't move much (wasn't a drag attempt)
        if (distance < 5) {
            const worldCoords = screenToWorld(x, y);
            if (worldCoords.x >= 0 && worldCoords.y >= 0) {
                points.push({
                    x: worldCoords.x,
                    y: worldCoords.y,
                    class: mode === 'logistic' ? currentClass : 0
                });
                updateDisplay();
                drawCanvas();
            }
        }
    }
    
    mouseDownPos = null;
    canvas.style.cursor = 'crosshair';
}

function handleRightClick(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedIndex = getPointAt(x, y);
    if (clickedIndex !== -1) {
        points.splice(clickedIndex, 1);
        updateDisplay();
        drawCanvas();
    }
}

function getPointAt(screenX, screenY) {
    for (let i = points.length - 1; i >= 0; i--) { // Check from top to bottom
        const screenCoords = worldToScreen(points[i].x, points[i].y);
        const distance = Math.sqrt(
            Math.pow(screenX - screenCoords.x, 2) + 
            Math.pow(screenY - screenCoords.y, 2)
        );
        if (distance < 15) return i; // Generous hit radius
    }
    return -1;
}

function screenToWorld(screenX, screenY) {
    const padding = 50;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    
    // Get current data range or use defaults
    const range = points.length > 0 ? getDataRange() : {xMin: 0, xMax: 10, yMin: 0, yMax: 10};
    
    const x = ((screenX - padding) / plotWidth) * (range.xMax - range.xMin) + range.xMin;
    const y = range.yMax - ((screenY - padding) / plotHeight) * (range.yMax - range.yMin);
    
    return {x, y};
}

function worldToScreen(worldX, worldY) {
    const padding = 50;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    
    const range = points.length > 0 ? getDataRange() : {xMin: 0, xMax: 10, yMin: 0, yMax: 10};
    
    const x = padding + ((worldX - range.xMin) / (range.xMax - range.xMin)) * plotWidth;
    const y = padding + ((range.yMax - worldY) / (range.yMax - range.yMin)) * plotHeight;
    
    return {x, y};
}

function getDataRange() {
    if (points.length === 0) {
        return {xMin: 0, xMax: 10, yMin: 0, yMax: 10};
    }
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    
    let xMin = Math.min(...xs);
    let xMax = Math.max(...xs);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);
    
    // Add padding to ranges
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const xPadding = xRange * 0.1;
    const yPadding = yRange * 0.1;
    
    xMin = Math.max(0, xMin - xPadding);
    xMax += xPadding;
    yMin = Math.max(0, yMin - yPadding);
    yMax += yPadding;
    
    return {xMin, xMax, yMin, yMax};
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid and axes
    drawGrid();
    
    // Draw regression line/curve
    if (mode === 'linear' && points.length >= 2) {
        drawLinearRegression();
    } else if (mode === 'logistic' && points.length >= 2) {
        drawLogisticRegression();
    }
    
    // Draw points
    drawPoints();
    
    // Draw axes labels
    drawAxesLabels();
}

function drawGrid() {
    const padding = 50;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    
    // Light grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * plotWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Draw main axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // X-axis
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
}

function drawAxesLabels() {
    if (points.length === 0) return;
    
    const range = getDataRange();
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
        const x = 50 + (i / 5) * (canvas.width - 100);
        const value = range.xMin + (i / 5) * (range.xMax - range.xMin);
        ctx.fillText(value.toFixed(1), x, canvas.height - 20);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = canvas.height - 50 - (i / 5) * (canvas.height - 100);
        const value = range.yMin + (i / 5) * (range.yMax - range.yMin);
        ctx.fillText(value.toFixed(1), 45, y + 4);
    }
}

function drawPoints() {
    points.forEach((point, index) => {
        const screen = worldToScreen(point.x, point.y);
        
        if (mode === 'linear' || point.class === 0) {
            // Red circles for linear regression or class 0
            ctx.fillStyle = '#ff5459';
            ctx.strokeStyle = '#d63031';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        } else {
            // Blue triangles for class 1
            ctx.fillStyle = '#32b8c5';
            ctx.strokeStyle = '#00b894';
            ctx.lineWidth = 2;
            const size = 8;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - size);
            ctx.lineTo(screen.x - size, screen.y + size);
            ctx.lineTo(screen.x + size, screen.y + size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    });
}

function drawLinearRegression() {
    if (points.length < 2) return;
    
    const regression = calculateLinearRegression();
    const range = getDataRange();
    
    const startX = range.xMin;
    const endX = range.xMax;
    const startY = regression.slope * startX + regression.intercept;
    const endY = regression.slope * endX + regression.intercept;
    
    const startScreen = worldToScreen(startX, startY);
    const endScreen = worldToScreen(endX, endY);
    
    ctx.strokeStyle = '#1fb8cd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.stroke();
}

function drawLogisticRegression() {
    if (points.length < 2) return;
    
    const logistic = calculateLogisticRegression();
    const range = getDataRange();
    
    ctx.strokeStyle = '#1fb8cd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let first = true;
    for (let i = 0; i <= 200; i++) {
        const x = range.xMin + (i / 200) * (range.xMax - range.xMin);
        const z = logistic.intercept + logistic.slope * x;
        const y = 1 / (1 + Math.exp(-z));
        
        // Scale y to fit in the plot range
        const scaledY = range.yMin + y * (range.yMax - range.yMin);
        const screen = worldToScreen(x, scaledY);
        
        if (first) {
            ctx.moveTo(screen.x, screen.y);
            first = false;
        } else {
            ctx.lineTo(screen.x, screen.y);
        }
    }
    ctx.stroke();
}

function calculateLinearRegression() {
    if (points.length < 2) return {slope: 0, intercept: 0, r2: 0, correlation: 0};
    
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = points.reduce((sum, p) => sum + p.y * p.y, 0);
    
    const denominator = n * sumX2 - sumX * sumX;
    if (Math.abs(denominator) < 1e-10) {
        return {slope: 0, intercept: sumY / n, r2: 0, correlation: 0};
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R²
    const meanY = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const ssRes = points.reduce((sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
    const r2 = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTotal))) : 0;
    
    // Calculate correlation
    const stdX = Math.sqrt((n * sumX2 - sumX * sumX) / n);
    const stdY = Math.sqrt((n * sumY2 - sumY * sumY) / n);
    const correlation = stdX > 0 && stdY > 0 ? 
        ((n * sumXY - sumX * sumY) / (n * stdX * stdY)) : 0;
    
    return {slope, intercept, r2, correlation};
}

function calculateLogisticRegression() {
    if (points.length < 2) return {slope: 0, intercept: 0, accuracy: 0, logLikelihood: 0};
    
    // Simple logistic regression using gradient descent
    let slope = 0;
    let intercept = 0;
    
    const learningRate = 0.1;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
        let gradSlope = 0;
        let gradIntercept = 0;
        
        points.forEach(point => {
            const z = intercept + slope * point.x;
            const prediction = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))));
            const error = point.class - prediction;
            
            gradSlope += error * point.x;
            gradIntercept += error;
        });
        
        slope += learningRate * gradSlope / points.length;
        intercept += learningRate * gradIntercept / points.length;
    }
    
    // Calculate accuracy
    let correct = 0;
    points.forEach(point => {
        const z = intercept + slope * point.x;
        const prediction = 1 / (1 + Math.exp(-z));
        const predictedClass = prediction > 0.5 ? 1 : 0;
        if (predictedClass === point.class) correct++;
    });
    const accuracy = correct / points.length;
    
    const logLikelihood = calculateLogLikelihood(points, slope, intercept);
    
    return {slope, intercept, accuracy, logLikelihood};
}

function calculateLogLikelihood(points, slope, intercept) {
    if (points.length === 0) {
        return 0;
    }
    let logLikelihood = 0;
    for (const point of points) {
        const z = intercept + slope * point.x;
        const sigmoid = 1 / (1 + Math.exp(-z));
        if (point.class === 1) {
            if (sigmoid > 1e-15) {
                logLikelihood += Math.log(sigmoid);
            } else {
                logLikelihood += -34.538776394910684;
            }
        } else {
            if (sigmoid < 1 - 1e-15) {
                logLikelihood += Math.log(1 - sigmoid);
            } else {
                logLikelihood += -34.538776394910684;
            }
        }
    }
    return logLikelihood;
}

function updateDisplay() {
    const equationDisplay = document.getElementById('equation-display');
    const slopeValue = document.getElementById('slope-value');
    const interceptValue = document.getElementById('intercept-value');
    const r2Value = document.getElementById('r2-value');
    const correlationValue = document.getElementById('correlation-value');
    
    if (points.length < 2) {
        equationDisplay.textContent = 'Add at least two points to see the magic happen!';
        slopeValue.textContent = '--';
        interceptValue.textContent = '--';
        r2Value.textContent = '--';
        correlationValue.textContent = '--';
        return;
    }
    
    if (mode === 'linear') {
        const regression = calculateLinearRegression();
        equationDisplay.textContent = `y = ${regression.slope.toFixed(3)}x + ${regression.intercept.toFixed(3)}`;
        slopeValue.textContent = regression.slope.toFixed(3);
        interceptValue.textContent = regression.intercept.toFixed(3);
        r2Value.textContent = regression.r2.toFixed(3);
        correlationValue.textContent = regression.correlation.toFixed(3);
    } else {
        const logistic = calculateLogisticRegression();
        equationDisplay.textContent = `p = 1 / (1 + e^(-(${logistic.intercept.toFixed(2)} + ${logistic.slope.toFixed(2)}x)))`;
        slopeValue.textContent = logistic.slope.toFixed(3);
        interceptValue.textContent = logistic.intercept.toFixed(3);
        r2Value.textContent = logistic.accuracy.toFixed(3);
        correlationValue.textContent = logistic.logLikelihood.toFixed(3);
    }
}

function clearPoints() {
    if (mode === 'linear') {
        linearPoints = [];
        points = linearPoints;
    } else {
        logisticPoints = [];
        points = logisticPoints;
    }
    document.getElementById('dataset-select').value = '';
    updateDisplay();
    drawCanvas();
}

function addRandomPoints() {
    const numPoints = 5;
    const noise = parseInt(document.getElementById('noise-slider').value) / 100;
    
    if (mode === 'linear') {
        // Add points with some linear trend
        for (let i = 0; i < numPoints; i++) {
            const x = 1 + Math.random() * 8;
            const y = 2 * x + 1 + (Math.random() - 0.5) * 8 * noise; // Linear with noise
            points.push({x, y, class: 0});
        }
    } else {
        // Add binary classification points
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random() * 10;
            const baseProb = 1 / (1 + Math.exp(-(x - 5))); // Sigmoid centered at x=5
            const classValue = Math.random() < baseProb ? 1 : 0;
            const y = classValue + (Math.random() - 0.5) * 0.3 * (1 + noise * 2); // Add some noise
            points.push({x, y, class: classValue});
        }
    }
    
    updateDisplay();
    drawCanvas();
}

function updateNoise() {
    const slider = document.getElementById('noise-slider');
    const noiseValue = document.getElementById('noise-value');
    noiseValue.textContent = slider.value + '%';
    
    // Redraw canvas and update display to reflect noise changes
    if (points.length > 0) {
        updateDisplay();
        drawCanvas();
    }
}