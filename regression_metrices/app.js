// Dataset definitions
const datasets = {
    good_fit: [
        {area: 1041.17, actual: 171.65, predicted: 204.76},
        {area: 1116.17, actual: 219.45, predicted: 215.43},
        {area: 1311.99, actual: 240.03, predicted: 243.29},
        {area: 1312.04, actual: 290.78, predicted: 243.30},
        {area: 1363.65, actual: 236.50, predicted: 250.64},
        {area: 1366.81, actual: 310.59, predicted: 251.09},
        {area: 1424.68, actual: 254.95, predicted: 259.32},
        {area: 1582.46, actual: 250.74, predicted: 281.76},
        {area: 1608.48, actual: 290.87, predicted: 285.47},
        {area: 1749.08, actual: 281.98, predicted: 305.47},
        {area: 1890.68, actual: 342.15, predicted: 325.76},
        {area: 2043.34, actual: 398.72, predicted: 347.46},
        {area: 2156.23, actual: 387.54, predicted: 363.52},
        {area: 2287.45, actual: 412.89, predicted: 382.20},
        {area: 2398.12, actual: 435.67, predicted: 397.95},
        {area: 2456.78, actual: 468.23, predicted: 406.30},
        {area: 2567.89, actual: 502.15, predicted: 422.13},
        {area: 2678.34, actual: 489.76, predicted: 437.85},
        {area: 2789.45, actual: 518.92, predicted: 453.67},
        {area: 2940.12, actual: 523.45, predicted: 475.12}
    ],
    perfect_fit: [
        {area: 1000, actual: 210, predicted: 210},
        {area: 1200, actual: 240, predicted: 240},
        {area: 1400, actual: 270, predicted: 270},
        {area: 1600, actual: 300, predicted: 300},
        {area: 1800, actual: 330, predicted: 330},
        {area: 2000, actual: 360, predicted: 360},
        {area: 2200, actual: 390, predicted: 390},
        {area: 2400, actual: 420, predicted: 420},
        {area: 2600, actual: 450, predicted: 450},
        {area: 2800, actual: 480, predicted: 480},
        {area: 3000, actual: 510, predicted: 510}
    ],
    poor_fit: [
        {area: 1200, actual: 180, predicted: 240},
        {area: 1400, actual: 420, predicted: 270},
        {area: 1600, actual: 250, predicted: 300},
        {area: 1800, actual: 480, predicted: 330},
        {area: 2000, actual: 290, predicted: 360},
        {area: 2200, actual: 520, predicted: 390},
        {area: 2400, actual: 350, predicted: 420},
        {area: 2600, actual: 580, predicted: 450},
        {area: 2800, actual: 400, predicted: 480},
        {area: 3000, actual: 620, predicted: 510}
    ]
};

// Global variables
let currentDataset = 'good_fit';
let selectedPoint = null;
let showRegression = true;
let showErrors = true;

// Chart colors
const colors = {
    actual: '#4A90E2',      // A brighter, more distinct blue
    predicted: '#F5A623',  // A vibrant orange
    regression: '#D0021B',  // A strong red
    error: '#7F8C8D',      // A slightly lighter grey for better contrast
    background: '#F7FAFC'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    handleResize(); // Initial resize
    window.addEventListener('resize', handleResize);
});

function handleResize() {
    resizeCanvas('regression-chart', 1.6);
    resizeCanvas('comparison-chart', 2);
    updateVisualization();
    updateCalculations();
    drawComparisonChart();
}

function resizeCanvas(canvasId, aspectRatio) {
    const canvas = document.getElementById(canvasId);
    const container = canvas.parentElement;
    const width = container.offsetWidth;
    canvas.width = width;
    canvas.height = width / aspectRatio;
}

function initializeEventListeners() {
    // Dataset selector
    document.getElementById('dataset-select').addEventListener('change', function() {
        currentDataset = this.value;
        selectedPoint = null;
        updateVisualization();
        updateCalculations();
        updatePointInfo();
    });

    // Visualization controls
    document.getElementById('show-regression').addEventListener('change', function() {
        showRegression = this.checked;
        updateVisualization();
    });

    document.getElementById('show-errors').addEventListener('change', function() {
        showErrors = this.checked;
        updateVisualization();
    });

    // Canvas click handler
    document.getElementById('regression-chart').addEventListener('click', handleCanvasClick);
}

function calculateMetrics(data) {
    const n = data.length;
    let sumSquaredErrors = 0;
    let sumActual = 0;
    let sumSquaredActual = 0;

    // Calculate basic sums
    data.forEach(point => {
        const error = point.actual - point.predicted;
        sumSquaredErrors += error * error;
        sumActual += point.actual;
        sumSquaredActual += point.actual * point.actual;
    });

    // Calculate MSE
    const mse = sumSquaredErrors / n;
    
    // Calculate RMSE
    const rmse = Math.sqrt(mse);
    
    // Calculate R²
    const meanActual = sumActual / n;
    let totalSumSquares = 0;
    data.forEach(point => {
        totalSumSquares += Math.pow(point.actual - meanActual, 2);
    });
    const rSquared = totalSumSquares > 0 ? 1 - (sumSquaredErrors / totalSumSquares) : 1;

    return {
        mse: mse,
        rmse: rmse,
        rSquared: Math.max(0, rSquared), // Ensure R² doesn't go negative
        sumSquaredErrors: sumSquaredErrors,
        n: n
    };
}

function updateMetricsDisplay(metrics) {
    // Update values with animation
    const mseEl = document.getElementById('mse-value');
    const rmseEl = document.getElementById('rmse-value');
    const r2El = document.getElementById('r2-value');

    // Add updating class for animation
    [mseEl, rmseEl, r2El].forEach(el => el.classList.add('updating'));

    setTimeout(() => {
        mseEl.textContent = metrics.mse.toFixed(2);
        rmseEl.textContent = metrics.rmse.toFixed(2);
        r2El.textContent = metrics.rSquared.toFixed(3);

        // Remove updating class
        [mseEl, rmseEl, r2El].forEach(el => el.classList.remove('updating'));

        // Update interpretations and colors
        updateMetricInterpretations(metrics);
    }, 150);
}

function updateMetricInterpretations(metrics) {
    const mseCard = document.getElementById('mse-value').closest('.metric-result-card');
    const rmseCard = document.getElementById('rmse-value').closest('.metric-result-card');
    const r2Card = document.getElementById('r2-value').closest('.metric-result-card');

    // Reset classes
    [mseCard, rmseCard, r2Card].forEach(card => {
        card.classList.remove('good', 'average', 'poor');
    });

    // MSE/RMSE interpretation (lower is better)
    const rmseThreshold = currentDataset === 'perfect_fit' ? 1 : 
                         currentDataset === 'good_fit' ? 50 : 100;
    
    if (metrics.rmse < rmseThreshold * 0.5) {
        mseCard.classList.add('good');
        rmseCard.classList.add('good');
    } else if (metrics.rmse < rmseThreshold) {
        mseCard.classList.add('average');
        rmseCard.classList.add('average');
    } else {
        mseCard.classList.add('poor');
        rmseCard.classList.add('poor');
    }

    // R² interpretation (higher is better)
    if (metrics.rSquared > 0.8) {
        r2Card.classList.add('good');
    } else if (metrics.rSquared > 0.5) {
        r2Card.classList.add('average');
    } else {
        r2Card.classList.add('poor');
    }

    // Update interpretation text
    document.getElementById('mse-interpretation').textContent = 
        `${metrics.rmse < rmseThreshold * 0.5 ? 'Excellent' : 
           metrics.rmse < rmseThreshold ? 'Good' : 'Poor'} fit quality`;
    
    document.getElementById('rmse-interpretation').textContent = 
        `Average error: ±${metrics.rmse.toFixed(1)} units`;
    
    document.getElementById('r2-interpretation').textContent = 
        `Explains ${(metrics.rSquared * 100).toFixed(1)}% of variance`;
}

function updateVisualization() {
    const canvas = document.getElementById('regression-chart');
    const ctx = canvas.getContext('2d');
    const data = datasets[currentDataset];

    if (!data || data.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up scaling
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Find data ranges
    const areas = data.map(d => d.area);
    const actuals = data.map(d => d.actual);
    const predicted = data.map(d => d.predicted);
    const allValues = [...actuals, ...predicted];

    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // Add some padding to the ranges
    const areaRange = maxArea - minArea;
    const valueRange = maxValue - minValue;
    const areaMin = minArea - areaRange * 0.1;
    const areaMax = maxArea + areaRange * 0.1;
    const valueMin = minValue - valueRange * 0.1;
    const valueMax = maxValue + valueRange * 0.1;

    // Scaling functions
    const scaleX = (area) => padding + ((area - areaMin) / (areaMax - areaMin)) * chartWidth;
    const scaleY = (value) => canvas.height - padding - ((value - valueMin) / (valueMax - valueMin)) * chartHeight;

    // Draw axes
    drawAxes(ctx, canvas, padding, areaMin, areaMax, valueMin, valueMax);

    // Draw regression line if enabled
    if (showRegression) {
        drawRegressionLine(ctx, data, scaleX, scaleY, areaMin, areaMax);
    }

    // Draw error lines if enabled
    if (showErrors) {
        drawErrorLines(ctx, data, scaleX, scaleY);
    }

    // Draw data points
    drawDataPoints(ctx, data, scaleX, scaleY);

    // Store scaling functions for click handling
    canvas.scaleX = scaleX;
    canvas.scaleY = scaleY;
    canvas.data = data;
}

function drawAxes(ctx, canvas, padding, areaMin, areaMax, valueMin, valueMax) {
    ctx.strokeStyle = '#626C71';
    ctx.lineWidth = 1;
    ctx.font = '12px var(--font-family-base)';
    ctx.fillStyle = '#626C71';

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.textAlign = 'center';
    ctx.fillText('Area (sq ft)', canvas.width / 2, canvas.height - 20);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Price ($1000s)', 0, 0);
    ctx.restore();

    // Draw tick marks and labels
    const xTicks = 5;
    const yTicks = 5;

    for (let i = 0; i <= xTicks; i++) {
        const x = padding + (i / xTicks) * (canvas.width - 2 * padding);
        const value = areaMin + (i / xTicks) * (areaMax - areaMin);
        
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - padding);
        ctx.lineTo(x, canvas.height - padding + 5);
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(value).toString(), x, canvas.height - padding + 20);
    }

    for (let i = 0; i <= yTicks; i++) {
        const y = canvas.height - padding - (i / yTicks) * (canvas.height - 2 * padding);
        const value = valueMin + (i / yTicks) * (valueMax - valueMin);
        
        ctx.beginPath();
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(padding, y);
        ctx.stroke();
        
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
}

function drawRegressionLine(ctx, data, scaleX, scaleY, areaMin, areaMax) {
    ctx.strokeStyle = colors.regression;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(scaleX(areaMin), scaleY(56.66 + 0.1423 * areaMin));
    ctx.lineTo(scaleX(areaMax), scaleY(56.66 + 0.1423 * areaMax));
    ctx.stroke();
}

function drawErrorLines(ctx, data, scaleX, scaleY) {
    ctx.strokeStyle = colors.error;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    data.forEach(point => {
        const x = scaleX(point.area);
        const actualY = scaleY(point.actual);
        const predictedY = scaleY(point.predicted);

        ctx.beginPath();
        ctx.moveTo(x, actualY);
        ctx.lineTo(x, predictedY);
        ctx.stroke();
    });

    ctx.setLineDash([]);
}

function drawDataPoints(ctx, data, scaleX, scaleY) {
    data.forEach((point, index) => {
        const x = scaleX(point.area);
        const actualY = scaleY(point.actual);
        const predictedY = scaleY(point.predicted);

        // Highlight selected point
        const isSelected = selectedPoint === index;
        const pointSize = isSelected ? 8 : 6;

        // Draw actual values
        ctx.fillStyle = colors.actual;
        ctx.strokeStyle = isSelected ? '#000' : colors.actual;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.arc(x, actualY, pointSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw predicted values
        ctx.fillStyle = colors.predicted;
        ctx.strokeStyle = isSelected ? '#000' : colors.predicted;
        ctx.beginPath();
        ctx.rect(x - pointSize, predictedY - pointSize, pointSize * 2, pointSize * 2);
        ctx.fill();
        ctx.stroke();
    });
}

function handleCanvasClick(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const data = canvas.data;
    if (!data) return;

    // Find the closest point
    let closestDistance = Infinity;
    let closestIndex = -1;

    data.forEach((point, index) => {
        const pointX = canvas.scaleX(point.area);
        const actualY = canvas.scaleY(point.actual);
        const predictedY = canvas.scaleY(point.predicted);

        const distanceToActual = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - actualY, 2));
        const distanceToPredicted = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - predictedY, 2));

        const minDistance = Math.min(distanceToActual, distanceToPredicted);

        if (minDistance < closestDistance && minDistance < 20) {
            closestDistance = minDistance;
            closestIndex = index;
        }
    });

    if (closestIndex !== -1) {
        selectedPoint = closestIndex;
        updateVisualization();
        updatePointInfo();
        highlightTableRow(closestIndex);
    }
}

function updatePointInfo() {
    const pointInfoEl = document.getElementById('point-info');
    
    if (selectedPoint === null) {
        pointInfoEl.innerHTML = '<h4>Point Information</h4><p>Click on a data point to see details</p>';
        return;
    }

    const data = datasets[currentDataset];
    const point = data[selectedPoint];
    const error = point.actual - point.predicted;
    const squaredError = error * error;

    pointInfoEl.innerHTML = `
        <h4>Point ${selectedPoint + 1} Details</h4>
        <div class="point-details">
            <p><strong>Area:</strong> ${point.area.toLocaleString()} sq ft</p>
            <p><strong>Actual Price:</strong> $${point.actual.toFixed(2)}k</p>
            <p><strong>Predicted Price:</strong> $${point.predicted.toFixed(2)}k</p>
            <p><strong>Error:</strong> ${error > 0 ? '+' : ''}${error.toFixed(2)}k</p>
            <p><strong>Squared Error:</strong> ${squaredError.toFixed(2)}</p>
        </div>
    `;
}

function updateCalculations() {
    const data = datasets[currentDataset];
    const metrics = calculateMetrics(data);

    // Update metrics display
    updateMetricsDisplay(metrics);

    // Update calculation table
    updateCalculationTable(data, metrics);

    // Update step-by-step calculations
    updateStepCalculations(metrics);
}

function updateCalculationTable(data, metrics) {
    const tbody = document.querySelector('#calculation-table tbody');
    tbody.innerHTML = '';

    data.forEach((point, index) => {
        const error = point.actual - point.predicted;
        const squaredError = error * error;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${point.area.toLocaleString()}</td>
            <td>${point.actual.toFixed(2)}</td>
            <td>${point.predicted.toFixed(2)}</td>
            <td>${error > 0 ? '+' : ''}${error.toFixed(2)}</td>
            <td>${squaredError.toFixed(2)}</td>
        `;
        
        row.addEventListener('click', () => {
            selectedPoint = index;
            updateVisualization();
            updatePointInfo();
            highlightTableRow(index);
        });

        tbody.appendChild(row);
    });

    document.getElementById('total-squared-error').textContent = metrics.sumSquaredErrors.toFixed(2);
}

function highlightTableRow(index) {
    // Remove existing highlights
    document.querySelectorAll('.calculation-table tbody tr').forEach(row => {
        row.classList.remove('highlighted-row');
    });

    // Highlight selected row
    const rows = document.querySelectorAll('.calculation-table tbody tr');
    if (rows[index]) {
        rows[index].classList.add('highlighted-row');
    }
}

function updateStepCalculations(metrics) {
    document.getElementById('mse-calculation').textContent = 
        `MSE = ${metrics.sumSquaredErrors.toFixed(2)} / ${metrics.n} = ${metrics.mse.toFixed(2)}`;
    
    document.getElementById('rmse-calculation').textContent = 
        `RMSE = √${metrics.mse.toFixed(2)} = ${metrics.rmse.toFixed(2)}`;
    
    document.getElementById('r2-calculation').textContent = 
        `R² = ${metrics.rSquared.toFixed(3)} (${(metrics.rSquared * 100).toFixed(1)}% variance explained)`;
}

function drawComparisonChart() {
    const canvas = document.getElementById('comparison-chart');
    const ctx = canvas.getContext('2d');

    // Calculate metrics for all datasets
    const allMetrics = {};
    Object.keys(datasets).forEach(key => {
        allMetrics[key] = calculateMetrics(datasets[key]);
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart settings
    const padding = { top: 60, right: 40, bottom: 60, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const numGroups = Object.keys(datasets).length;
    const groupWidth = chartWidth / numGroups;

    // Colors for each metric
    const metricColors = ['#1FB8CD', '#FFC185', '#B4413C'];
    const datasetLabels = {'good_fit': 'Good Fit', 'perfect_fit': 'Perfect Fit', 'poor_fit': 'Poor Fit'};

    // Draw axes
    ctx.strokeStyle = '#626C71';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();

    // Draw bars and labels
    let groupX = padding.left;
    Object.keys(allMetrics).forEach((datasetKey, datasetIndex) => {
        const metrics = allMetrics[datasetKey];
        const values = [
            metrics.mse / 10000, // Scale MSE down for visualization
            metrics.rmse / 100,  // Scale RMSE down for visualization
            metrics.rSquared     // R² is already 0-1
        ];

        const barWidth = groupWidth / (values.length + 1);

        values.forEach((value, metricIndex) => {
            const barHeight = Math.max(0, (value * chartHeight) / 1.2);
            const barX = groupX + (metricIndex + 0.5) * barWidth;
            const barY = canvas.height - padding.bottom - barHeight;

            ctx.fillStyle = metricColors[metricIndex];
            ctx.fillRect(barX, barY, barWidth * 0.8, barHeight);

            // Add value labels
            ctx.fillStyle = '#134252';
            ctx.font = '18px var(--font-family-base)';
            ctx.textAlign = 'center';
            
            let displayValue;
            if (metricIndex === 0) displayValue = (metrics.mse / 1000).toFixed(1) + 'k';
            else if (metricIndex === 1) displayValue = metrics.rmse.toFixed(1);
            else displayValue = metrics.rSquared.toFixed(2);

            ctx.fillText(displayValue, barX + barWidth * 0.4, barY - 10);
        });

        // Dataset labels
        ctx.fillStyle = '#134252';
        ctx.font = '22px var(--font-family-base)';
        ctx.textAlign = 'center';
        ctx.fillText(datasetLabels[datasetKey], groupX + groupWidth / 2, canvas.height - padding.bottom + 30);

        groupX += groupWidth;
    });

    // Legend
    const legendY = padding.top - 40;
    const legendItems = ['MSE (÷1000)', 'RMSE', 'R²'];
    let legendX = padding.left;

    legendItems.forEach((item, index) => {
        ctx.fillStyle = metricColors[index];
        ctx.fillRect(legendX, legendY, 20, 20);
        
        ctx.fillStyle = '#134252';
        ctx.font = '22px var(--font-family-base)';
        ctx.textAlign = 'left';
        ctx.fillText(item, legendX + 25, legendY + 18);
        
        legendX += ctx.measureText(item).width + 50;
    });
}