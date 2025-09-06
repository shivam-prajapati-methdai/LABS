// Regression Metrics Lab - Interactive Application
class RegressionMetricsLab {
    constructor() {
        this.canvas = document.getElementById('regression-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Data and state
        this.points = [];
        this.regressionLine = null;
        this.metrics = { mse: 0, rmse: 0, mae: 0, r2: 0 };
        this.isDragging = false;
        this.dragIndex = -1;
        this.currentChallenge = -1; // No challenge active initially
        this.achievements = {
            perfect: false,
            error: false,
        };
        this.editMode = false;
        this.highlightedPointIndex = -1;
        this.flipTimeouts = []; // New: To store setTimeout IDs for flip animations
        
        // Application data
        this.challengeData = [
            {
                name: "Perfect Linear Relationship",
                description: "Try to achieve R² > 0.95",
                target_r_squared: 0.95,
                initial_points: [
                    {x: 1, y: 2}, {x: 3, y: 6}, {x: 5, y: 10}, {x: 7, y: 14}, {x: 9, y: 18}
                ]
            },
            {
                name: "Minimize Error Challenge",
                description: "Get MSE below 2.0",
                target_mse: 2.0,
                initial_points: [
                    {x: 2, y: 4}, {x: 4, y: 8}, {x: 6, y: 15}, {x: 8, y: 16}, {x: 10, y: 20}
                ]
            },
            {
                name: "Outlier Impact",
                description: "See how outliers affect metrics",
                initial_points: [
                    {x: 2, y: 4}, {x: 4, y: 8}, {x: 6, y: 12}, {x: 8, y: 16}, {x: 10, y: 35}
                ]
            }
        ];
        
        this.metricExplanations = {
            mse: {
                title: "Mean Squared Error (MSE)",
                formula: "MSE = (1/n) × Σ(yᵢ - ŷᵢ)²",
                explanation: "Measures average squared differences between actual and predicted values. Larger errors are penalized more heavily due to squaring.",
                good_range: "Lower is better - values close to 0 indicate perfect fit",
                when_to_use: "Use when you want to heavily penalize large errors"
            },
            rmse: {
                title: "Root Mean Squared Error (RMSE)",
                formula: "RMSE = √MSE",
                explanation: "Square root of MSE, giving errors in same units as the target variable. Easier to interpret than MSE.",
                good_range: "Lower is better - represents typical prediction error magnitude",
                when_to_use: "Use for interpretable error measurement in original units"
            },
            mae: {
                title: "Mean Absolute Error (MAE)",
                formula: "MAE = (1/n) × Σ|yᵢ - ŷᵢ|",
                explanation: "Average absolute difference between actual and predicted values. Less sensitive to outliers than MSE/RMSE.",
                good_range: "Lower is better - represents average absolute deviation",
                when_to_use: "Use when outliers shouldn't dominate the error measurement"
            },
            r2: {
                title: "R-squared (R²)",
                formula: "R² = 1 - (SSR/SST)",
                explanation: "Proportion of variance in target variable explained by the model. Measures goodness of fit.",
                good_range: "0 to 1, where 1 = perfect fit, 0.7+ = good fit",
                when_to_use: "Use to understand how well your model explains the data variability"
            }
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadInitialData(); // Now loads empty data
        this.update();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onRightClick(e));
        
        // Global mouse events for drag handling
        document.addEventListener('mousemove', (e) => this.onGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onGlobalMouseUp(e));
        
        // UI events
        document.getElementById('reset-btn').addEventListener('click', () => this.resetData());
        document.getElementById('add-noise-btn').addEventListener('click', () => this.addNoise());
        document.getElementById('edit-btn').addEventListener('click', () => this.toggleEditMode());
        
        // New: Dataset selection buttons
        document.querySelectorAll('.dataset-buttons .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id === 'clear-data-btn') {
                    this.clearAllPoints();
                } else {
                    const datasetIndex = parseInt(e.target.dataset.datasetIndex);
                    this.loadDataset(datasetIndex);
                }
            });
        });

        // New: Start Challenge buttons
        document.querySelectorAll('.start-challenge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeIndex = parseInt(e.target.dataset.challengeIndex);
                this.startChallenge(challengeIndex); // Changed to startChallenge
            });
        });
        
        // Info buttons (for general metric info, not point-specific)
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metric = e.target.dataset.metric;
                this.showMetricInfoTooltip(metric);
            });
        });
        
        // Modal events
        document.getElementById('tooltip-close').addEventListener('click', () => this.hideMetricInfoTooltip());
        document.getElementById('tooltip-modal').addEventListener('click', (e) => {
            if (e.target.id === 'tooltip-modal') this.hideMetricInfoTooltip();
        });
    }
    
    loadInitialData() {
        this.points = []; // Start with an empty canvas
        this.currentChallenge = -1; // Ensure no challenge is active
        this.resetChallengeStatuses(); // Reset all challenge statuses
    }
    
    startChallenge(index) { // Renamed from loadChallenge
        this.currentChallenge = index;
        // Do NOT load initial_points here. Preserve current data.
        
        // Update UI for challenges
        // First, reset all challenges, but preserve 'completed' status
        document.querySelectorAll('.challenge-card').forEach((card, i) => {
            const statusElement = card.querySelector('.challenge-status');
            if (i === index) {
                card.classList.add('active');
                // Only update status if it's not already completed
                if (statusElement && !statusElement.classList.contains('completed')) {
                    statusElement.textContent = 'In Progress...';
                    statusElement.classList.remove('completed'); 
                }
            } else {
                card.classList.remove('active');
                // Only reset to 'Not Started' if it's not already 'Completed'
                if (statusElement && !statusElement.classList.contains('completed')) {
                    statusElement.textContent = 'Not Started';
                }
            }
        });
        
        this.update();
    }

    loadDataset(index) {
        this.points = [...this.challengeData[index].initial_points];
        this.currentChallenge = -1; // No challenge active when loading a dataset
        this.resetChallengeStatuses(); // Reset all challenge statuses, preserving completed ones
        this.update();
    }

    clearAllPoints() {
        this.points = [];
        this.currentChallenge = -1; // No challenge active
        this.resetChallengeStatuses(); // Reset all challenge statuses, preserving completed ones
        this.update();
    }

    resetChallengeStatuses() {
        document.querySelectorAll('.challenge-card').forEach(card => {
            card.classList.remove('active');
            const statusElement = card.querySelector('.challenge-status');
            // Add a check here to ensure statusElement is not null
            if (statusElement) {
                // Only reset to 'Not Started' if it's not already 'Completed'
                if (!statusElement.classList.contains('completed')) {
                    statusElement.textContent = 'Not Started';
                    statusElement.classList.remove('completed');
                }
            }
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left),
            y: (e.clientY - rect.top)
        };
    }
    
    canvasToData(pos) {
        const padding = 50;
        const dataX = ((pos.x - padding) / (this.canvas.width - 2 * padding)) * 20;
        const dataY = (1 - (pos.y - padding) / (this.canvas.height - 2 * padding)) * 40;
        return { x: Math.max(0, Math.min(20, dataX)), y: Math.max(0, Math.min(40, dataY)) };
    }
    
    dataToCanvas(point) {
        const padding = 50;
        const canvasX = padding + (point.x / 20) * (this.canvas.width - 2 * padding);
        const canvasY = padding + (1 - point.y / 40) * (this.canvas.height - 2 * padding);
        return { x: canvasX, y: canvasY };
    }
    
    findNearestPoint(pos) {
        let minDistance = Infinity;
        let nearestIndex = -1;
        
        this.points.forEach((point, index) => {
            const canvasPoint = this.dataToCanvas(point);
            const distance = Math.sqrt(
                Math.pow(pos.x - canvasPoint.x, 2) + Math.pow(pos.y - canvasPoint.y, 2)
            );
            if (distance < 20 && distance < minDistance) { // Increased sensitivity from 15 to 20
                minDistance = distance;
                nearestIndex = index;
            }
        });
        
        return nearestIndex;
    }
    
    updateCursor(nearestIndex) {
        this.canvas.classList.remove('dragging', 'hovering-point');
        
        if (this.isDragging) {
            this.canvas.classList.add('dragging');
            document.body.classList.add('dragging');
        } else if (nearestIndex >= 0) {
            this.canvas.classList.add('hovering-point');
        }
    }
    
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const nearestIndex = this.findNearestPoint(pos);

        if (this.editMode) {
            // Existing edit mode logic
            if (nearestIndex >= 0) {
                this.isDragging = true;
                this.dragIndex = nearestIndex;
                this.updateCursor(nearestIndex);
                e.preventDefault();
            } else {
                const dataPoint = this.canvasToData(pos);
                this.points.push(dataPoint);
                this.update();
            }
            this.hideMetricCardDetails(); // Hide flipped cards when in edit mode
        } else {
            // New non-edit mode logic
            if (nearestIndex >= 0) {
                this.highlightedPointIndex = nearestIndex;
                this.update(); // Redraw to highlight
                this.showPointDetailsOnCards(nearestIndex); // Show point details on cards
            } else {
                // Clicked outside a point in non-edit mode, hide details
                this.highlightedPointIndex = -1;
                this.hideMetricCardDetails();
                this.update(); // Redraw to remove highlight
            }
        }
    }
    
    onMouseMove(e) {
        if (!this.editMode) {
            this.canvas.classList.remove('hovering-point');
            return;
        }
        if (this.isDragging && this.dragIndex >= 0) {
            return; // Handle in global mouse move
        }
        
        const pos = this.getMousePos(e);
        const nearestIndex = this.findNearestPoint(pos);
        this.updateCursor(nearestIndex);
    }
    
    onGlobalMouseMove(e) {
        if (!this.editMode) return;
        if (this.isDragging && this.dragIndex >= 0) {
            const pos = this.getMousePos(e);
            const dataPoint = this.canvasToData(pos);
            this.points[this.dragIndex] = dataPoint;
            this.update();
        }
    }
    
    onMouseUp(e) {
        this.onGlobalMouseUp(e);
    }
    
    onGlobalMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragIndex = -1;
            this.updateCursor(-1);
            document.body.classList.remove('dragging');
        }
    }
    
    onMouseLeave(e) {
        this.canvas.classList.remove('hovering-point');
    }
    
    onRightClick(e) {
        if (!this.editMode) return;
        e.preventDefault();
        const pos = this.getMousePos(e);
        const nearestIndex = this.findNearestPoint(pos);
        
        if (nearestIndex >= 0) {
            this.points.splice(nearestIndex, 1);
            this.update();
        }
    }
    
    calculateLinearRegression() {
        if (this.points.length < 2) {
            this.regressionLine = null;
            return;
        }
        
        const n = this.points.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        this.points.forEach(point => {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        this.regressionLine = { slope, intercept };
    }
    
    calculateMetrics() {
        if (!this.regressionLine || this.points.length < 2) {
            this.metrics = { mse: 0, rmse: 0, mae: 0, r2: 0 };
            return;
        }
        
        const { slope, intercept } = this.regressionLine;
        let sumSquaredError = 0;
        let sumAbsoluteError = 0;
        let sumY = 0;
        let sumSquaredTotal = 0;
        
        this.points.forEach(point => {
            const predicted = slope * point.x + intercept;
            const error = point.y - predicted;
            
            sumSquaredError += error * error;
            sumAbsoluteError += Math.abs(error);
            sumY += point.y;
        });
        
        const meanY = sumY / this.points.length;
        this.points.forEach(point => {
            sumSquaredTotal += Math.pow(point.y - meanY, 2);
        });
        
        const mse = sumSquaredError / this.points.length;
        const rmse = Math.sqrt(mse);
        const mae = sumAbsoluteError / this.points.length;
        const r2 = sumSquaredTotal === 0 ? 1 : 1 - (sumSquaredError / sumSquaredTotal);
        
        this.metrics = { mse, rmse, mae, r2: Math.max(0, r2) };
    }
    
    drawCanvas() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw regression line
        if (this.regressionLine) {
            this.drawRegressionLine();
        }
        
        // Draw residual lines
        if (this.regressionLine) {
            this.drawResiduals();
        }
        
        // Draw points
        this.drawPoints();
        
        // Draw axes labels
        this.drawAxesLabels();
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const padding = 50;
        
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * (this.canvas.width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, this.canvas.height - padding);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * (this.canvas.height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(this.canvas.width - padding, y);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, this.canvas.height - padding);
        ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, this.canvas.height - padding);
        ctx.stroke();
    }
    
    drawAxesLabels() {
        const ctx = this.ctx;
        const padding = 50;
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // X-axis labels
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i / 4) * (this.canvas.width - 2 * padding);
            const value = (i / 4) * 20;
            ctx.fillText(value.toString(), x, this.canvas.height - padding + 20);
        }
        
        ctx.textAlign = 'right';
        
        // Y-axis labels
        for (let i = 0; i <= 4; i++) {
            const y = this.canvas.height - padding - (i / 4) * (this.canvas.height - 2 * padding);
            const value = (i / 4) * 40;
            ctx.fillText(value.toString(), padding - 10, y + 5);
        }
    }
    
    drawRegressionLine() {
        if (!this.regressionLine) return;
        
        const ctx = this.ctx;
        const { slope, intercept } = this.regressionLine;
        
        ctx.strokeStyle = '#1FB8CD';
        ctx.lineWidth = 3;
        
        const startX = 0;
        const endX = 20;
        const startY = slope * startX + intercept;
        const endY = slope * endX + intercept;
        
        const startCanvas = this.dataToCanvas({ x: startX, y: startY });
        const endCanvas = this.dataToCanvas({ x: endX, y: endY });
        
        ctx.beginPath();
        ctx.moveTo(startCanvas.x, startCanvas.y);
        ctx.lineTo(endCanvas.x, endCanvas.y);
        ctx.stroke();
    }
    
    drawResiduals() {
        if (!this.regressionLine) return;
        
        const ctx = this.ctx;
        const { slope, intercept } = this.regressionLine;
        
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        this.points.forEach((point, index) => {
            const predicted = slope * point.x + intercept;
            const actualCanvas = this.dataToCanvas(point);
            const predictedCanvas = this.dataToCanvas({ x: point.x, y: predicted });
            
            ctx.beginPath();
            ctx.moveTo(actualCanvas.x, actualCanvas.y);
            ctx.lineTo(predictedCanvas.x, predictedCanvas.y);
            
            // Highlight residual for selected point
            if (index === this.highlightedPointIndex) {
                ctx.strokeStyle = '#4CAF50'; // Green color for highlighted residual
                ctx.lineWidth = 3; // Thicker line
            } else {
                ctx.strokeStyle = '#FF6B6B';
                ctx.lineWidth = 2;
            }
            ctx.stroke();
        });
        
        ctx.setLineDash([]);
    }
    
    drawPoints() {
        const ctx = this.ctx;
        
        this.points.forEach((point, index) => {
            const canvasPoint = this.dataToCanvas(point);
            
            // Point shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.arc(canvasPoint.x + 2, canvasPoint.y + 2, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Point
            ctx.fillStyle = index === this.dragIndex ? '#FFC185' : '#B4413C';
            // Add highlight for selected point
            if (index === this.highlightedPointIndex) {
                ctx.fillStyle = '#4CAF50'; // Green color for highlighted point
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3; // Thicker border
                ctx.beginPath();
                ctx.arc(canvasPoint.x, canvasPoint.y, 10, 0, 2 * Math.PI); // Slightly larger
                ctx.fill();
                ctx.stroke();
            } else {
                // Fix: Added fill and stroke for non-highlighted points
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(canvasPoint.x, canvasPoint.y, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        });
    }
    
    updateMetricsDisplay() {
        // Update values
        document.getElementById('mse-value').textContent = this.metrics.mse.toFixed(2);
        document.getElementById('rmse-value').textContent = this.metrics.rmse.toFixed(2);
        document.getElementById('mae-value').textContent = this.metrics.mae.toFixed(2);
        document.getElementById('r2-value').textContent = this.metrics.r2.toFixed(3);
        
        // Update progress bars and color coding
        this.updateMetricCard('mse', this.metrics.mse, 20, true);
        this.updateMetricCard('rmse', this.metrics.rmse, 10, true);
        this.updateMetricCard('mae', this.metrics.mae, 10, true);
        this.updateMetricCard('r2', this.metrics.r2, 1, false);
    }
    
    updateMetricCard(metric, value, maxValue, lowerIsBetter) {
        const card = document.getElementById(`${metric}-card`);
        const fill = document.getElementById(`${metric}-fill`);
        
        let percentage, quality;
        
        if (lowerIsBetter) {
            percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
            if (value < maxValue * 0.1) quality = 'excellent';
            else if (value < maxValue * 0.3) quality = 'good';
            else if (value < maxValue * 0.6) quality = 'fair';
            else quality = 'poor';
        } else {
            percentage = Math.max(0, Math.min(100, value * 100));
            if (value > 0.9) quality = 'excellent';
            else if (value > 0.7) quality = 'good';
            else if (value > 0.4) quality = 'fair';
            else quality = 'poor';
        }
        
        fill.style.width = `${percentage}%`;
        card.className = `metric-card ${quality}`;
    }

    checkChallenges() {
        // Only check if a challenge is currently active
        if (this.currentChallenge === -1) return; 

        const challenge = this.challengeData[this.currentChallenge];
        const statusElement = document.getElementById(`challenge-${this.currentChallenge}-status`);
        
        let completed = false;
        
        if (challenge.target_r_squared && this.metrics.r2 > challenge.target_r_squared) {
            completed = true;
        } else if (challenge.target_mse && this.metrics.mse < challenge.target_mse) {
            completed = true;
        }
        
        // Only mark as completed if it was 'In Progress...' and now meets criteria
        if (completed && statusElement && statusElement.textContent === 'In Progress...') {
            statusElement.textContent = '✅ Completed!';
            statusElement.classList.add('completed');
            this.showCelebration(`Great job! You completed the ${challenge.name} challenge!`);
            this.checkAchievements();
        } else if (!completed && statusElement && statusElement.textContent !== 'Not Started') { 
            // If it was 'Completed' and no longer meets criteria, it should remain 'Completed'
            // If it was 'In Progress...' and no longer meets criteria, it should remain 'In Progress...'
            // This prevents flickering between 'In Progress...' and 'Not Started'
            if (statusElement.textContent !== 'In Progress...' && !statusElement.classList.contains('completed')) {
                statusElement.textContent = 'In Progress...';
                statusElement.classList.remove('completed');
            }
        }
    }
    
    checkAchievements() {
        // Perfect Fit Achievement
        if (this.metrics.r2 > 0.95 && !this.achievements.perfect) {
            this.achievements.perfect = true;
            this.unlockAchievement('achievement-perfect', 'Perfect Fit Master');
        }
        
        // Error Minimizer Achievement
        if (this.metrics.mse < 2.0 && !this.achievements.error) {
            this.achievements.error = true;
            this.unlockAchievement('achievement-error', 'Error Minimizer');
        }
    }
    
    unlockAchievement(id, name) {
        const element = document.getElementById(id);
        element.classList.remove('locked');
        element.classList.add('unlocked');
        this.showCelebration(`🏅 Achievement Unlocked: ${name}!`);
    }
    
    showCelebration(text) {
        const celebration = document.getElementById('celebration');
        const celebrationText = document.getElementById('celebration-text');
        
        celebrationText.textContent = text;
        celebration.classList.remove('hidden');
        
        setTimeout(() => {
            celebration.classList.add('hidden');
        }, 2000);
    }
    
    showMetricInfoTooltip(metric) {
        const modal = document.getElementById('tooltip-modal');
        const data = this.metricExplanations[metric];
        
        document.getElementById('tooltip-title').textContent = data.title;
        document.getElementById('tooltip-formula').textContent = data.formula;
        document.getElementById('tooltip-explanation').textContent = data.explanation;
        document.getElementById('tooltip-range').textContent = data.good_range;
        document.getElementById('tooltip-usage').textContent = data.when_to_use;
        
        modal.classList.remove('hidden');
    }
    
    hideMetricInfoTooltip() {
        document.getElementById('tooltip-modal').classList.add('hidden');
    }

    // New: Show point details on metric cards (flipping them)
    showPointDetailsOnCards(pointIndex) {
        const point = this.points[pointIndex];
        if (!point || !this.regressionLine) {
            this.hideMetricCardDetails();
            return;
        }

        const { slope, intercept } = this.regressionLine;
        const predicted = slope * point.x + intercept;
        const residual = point.y - predicted;

        // Calculate individual contributions
        const mseContribution = residual * residual;
        const rmseContribution = Math.sqrt(mseContribution);
        const maeContribution = Math.abs(residual);

        let r2Contribution = 0;
        if (this.points.length > 1) {
            const sumY = this.points.reduce((sum, p) => sum + p.y, 0);
            const meanY = sumY / this.points.length;
            const totalSquaredDifference = Math.pow(point.y - meanY, 2);
            if (totalSquaredDifference !== 0) {
                r2Contribution = mseContribution / totalSquaredDifference; // This is the proportion of *this point's* total variance explained by its error
            }
        }

        const metricCards = [
            { id: 'mse', value: mseContribution, formula: this.metricExplanations.mse.formula, explanation: `(y - ŷ)² = (${point.y.toFixed(2)} - ${predicted.toFixed(2)})² = ${mseContribution.toFixed(2)}` },
            { id: 'rmse', value: rmseContribution, formula: this.metricExplanations.rmse.formula, explanation: `√((y - ŷ)²) = √(${mseContribution.toFixed(2)}) = ${rmseContribution.toFixed(2)}` },
            { id: 'mae', value: maeContribution, formula: this.metricExplanations.mae.formula, explanation: `|y - ŷ| = |${point.y.toFixed(2)} - ${predicted.toFixed(2)}| = ${maeContribution.toFixed(2)}` },
            { id: 'r2', value: r2Contribution, formula: this.metricExplanations.r2.formula, explanation: `Error contribution to R²: ${r2Contribution.toFixed(4)}` }
        ];

        // Clear any existing flip timeouts
        this.flipTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.flipTimeouts = []; // Clear the array

        // Immediately unflip all cards before starting the new sequence
        document.querySelectorAll('.metric-card').forEach(cardElement => {
            cardElement.classList.remove('flipped');
            // Clear content immediately to prevent old data from flashing
            const formulaElement = cardElement.querySelector('.metric-card-back .formula');
            const calculationElement = cardElement.querySelector('.metric-card-back .calculation');
            if (formulaElement) formulaElement.textContent = '';
            if (calculationElement) calculationElement.textContent = '';
        });

        // Add a small delay before starting the new flip sequence
        // to allow the unflip animation to start (if any)
        const initialDelay = 600; // Increased delay to match hideMetricCardDetails animation duration
        metricCards.forEach((metric, index) => {
            const timeoutId = setTimeout(() => {
                const cardElement = document.getElementById(`${metric.id}-card`);
                const formulaElement = cardElement.querySelector('.metric-card-back .formula');
                const calculationElement = cardElement.querySelector('.metric-card-back .calculation');

                if (formulaElement) formulaElement.textContent = metric.formula;
                if (calculationElement) calculationElement.textContent = metric.explanation;

                cardElement.classList.add('flipped');
            }, initialDelay + index * 150); // Stagger the flip animation after initial delay
            this.flipTimeouts.push(timeoutId);
        });
    }

    // New: Hide point details on metric cards (flipping them back)
    hideMetricCardDetails() {
        // Clear any existing flip timeouts
        this.flipTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.flipTimeouts = [];

        document.querySelectorAll('.metric-card').forEach(cardElement => {
            cardElement.classList.remove('flipped');
            // Optionally clear content after flip back animation completes
            setTimeout(() => {
                const formulaElement = cardElement.querySelector('.metric-card-back .formula');
                const calculationElement = cardElement.querySelector('.metric-card-back .calculation');
                if (formulaElement) formulaElement.textContent = '';
                if (calculationElement) calculationElement.textContent = '';
            }, 600); // Match flip animation duration
        });
    }
    
    resetData() {
        // When resetting data, also reset current challenge and its status
        this.currentChallenge = -1;
        this.resetChallengeStatuses();
        this.points = []; // Clear points on reset
        this.hideMetricCardDetails(); // Ensure cards are unflipped on reset
        this.update();
    }
    
    addNoise() {
        this.points.forEach(point => {
            point.y += (Math.random() - 0.5) * 4;
            point.y = Math.max(0, Math.min(40, point.y));
        });
        this.update();
        this.hideMetricCardDetails(); // Ensure cards are unflipped on add noise
    }
    
    update() {
        this.calculateLinearRegression();
        this.calculateMetrics();
        this.drawCanvas();
        this.updateMetricsDisplay();
        this.checkChallenges();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const editBtn = document.getElementById('edit-btn');
        if (this.editMode) {
            editBtn.textContent = '✅ Editing';
            editBtn.classList.remove('btn--primary');
            editBtn.classList.add('btn--success');
            this.canvas.classList.add('editing-active');
            // When entering edit mode, clear any highlighted point and hide tooltip
            this.highlightedPointIndex = -1;
            this.hideMetricCardDetails(); // Hide flipped cards when entering edit mode
            this.hideMetricInfoTooltip(); // Also hide general info tooltip
            this.update(); // Redraw to remove highlight
        } else {
            editBtn.textContent = '✏️ Edit Mode';
            editBtn.classList.remove('btn--success');
            editBtn.classList.add('btn--primary');
            this.canvas.classList.remove('editing-active');
        }
        this.updateCursor(-1);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RegressionMetricsLab();
});