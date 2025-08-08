// K-Means Clustering Lab - Interactive Learning Application
class KMeansLab {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.points = [];
        this.centroids = [];
        this.k = 3;
        this.isRunning = false;
        this.isPaused = false;
        this.isDrawing = false;
        this.currentStep = 'ready';
        this.iteration = 0;
        this.maxIterations = 50;
        this.animationSpeed = 1;
        this.showLines = true;
        this.showRegions = true;
        this.colors = ['#3B82F6', '#EC4899', '#22C55E', '#8B5CF6', '#F97316', '#06B6D4', '#F59E0B', '#E11D48'];
        
        this.presetData = {
            basketball: {
                name: "Basketball Team Formation",
                points: [
                    {x: 150, y: 200, label: "Guard 1"},
                    {x: 180, y: 180, label: "Guard 2"},
                    {x: 200, y: 220, label: "Forward 1"},
                    {x: 120, y: 240, label: "Center 1"},
                    {x: 160, y: 260, label: "Forward 2"},
                    {x: 550, y: 180, label: "Guard 3"},
                    {x: 580, y: 200, label: "Guard 4"},
                    {x: 600, y: 160, label: "Forward 3"},
                    {x: 620, y: 220, label: "Center 2"},
                    {x: 560, y: 240, label: "Forward 4"}
                ],
                k: 2
            },
            study: {
                name: "Study Groups",
                points: [
                    {x: 100, y: 300, label: "Low effort"},
                    {x: 120, y: 320, label: "Low effort"},
                    {x: 140, y: 280, label: "Low effort"},
                    {x: 300, y: 200, label: "Medium effort"},
                    {x: 320, y: 180, label: "Medium effort"},
                    {x: 280, y: 220, label: "Medium effort"},
                    {x: 340, y: 190, label: "Medium effort"},
                    {x: 550, y: 120, label: "High effort"},
                    {x: 580, y: 100, label: "High effort"},
                    {x: 600, y: 140, label: "High effort"},
                    {x: 570, y: 110, label: "High effort"}
                ],
                k: 3
            },
            music: {
                name: "Music Preferences",
                points: [
                    {x: 150, y: 150, label: "Rock fan"},
                    {x: 180, y: 120, label: "Rock fan"},
                    {x: 200, y: 180, label: "Rock fan"},
                    {x: 400, y: 400, label: "Pop fan"},
                    {x: 420, y: 380, label: "Pop fan"},
                    {x: 380, y: 420, label: "Pop fan"},
                    {x: 600, y: 250, label: "Hip-hop fan"},
                    {x: 580, y: 270, label: "Hip-hop fan"},
                    {x: 620, y: 230, label: "Hip-hop fan"}
                ],
                k: 3
            }
        };

        this.stepExplanations = {
            ready: {
                title: "Ready to Start!",
                description: "Choose your data and click 'Start' to begin the clustering process."
            },
            initialization: {
                title: "Step 1: Initialization",
                description: "Randomly place K centroids on the canvas."
            },
            assignment: {
                title: "Step 2: Assignment",
                description: "Assign each data point to the nearest centroid."
            },
            update: {
                title: "Step 3: Update",
                description: "Move each centroid to the mean of its assigned points."
            },
            convergence: {
                title: "Step 4: Convergence Check",
                description: "If assignments haven't changed, the algorithm is done."
            },
            converged: {
                title: "Algorithm Complete!",
                description: "The clusters have stabilized."
            }
        };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateStepDisplay();
    }

    setupCanvas() {
        this.canvas = document.getElementById('clustering-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.delay = 100;
        this.lastTime = 0;
        this.draw();
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isRunning) return;
            this.isDrawing = true;
            const pos = this.getMousePos(e);
            this.addPoint(pos.x, pos.y);
            this.updateDisplay();
            this.draw();
            this.lastTime = now;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing && !this.isRunning) {
                const pos = this.getMousePos(e);
                const now = new Date().getTime();
                if(now - this.lastTime > this.delay){
                this.addPoint(pos.x, pos.y);
                this.updateDisplay();
                this.draw();
                this.lastTime = now;
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });

        document.getElementById('start-btn').addEventListener('click', () => this.startAlgorithm());
        document.getElementById('step-btn').addEventListener('click', () => this.stepAlgorithm());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseAlgorithm());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetAlgorithm());
        document.getElementById('random-data-btn').addEventListener('click', () => this.generateRandomData());

        document.getElementById('k-slider').addEventListener('input', (e) => {
            this.k = parseInt(e.target.value);
            document.getElementById('k-value').textContent = this.k;
            if (!this.isRunning) this.resetAlgorithm();
        });

        document.getElementById('preset-selector').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPresetData(e.target.value);
            } else {
                this.points = [];
                this.resetAlgorithm();
            }
        });

        // Tab switching logic
        const tabs = document.querySelectorAll('.tab-link');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = document.getElementById(tab.dataset.tab);
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                target.classList.add('active');
            });
        });
    }

    addPoint(x, y, label = '') {
        this.points.push({ x, y, cluster: -1, label });
    }

    loadPresetData(presetKey) {
        const preset = this.presetData[presetKey];
        this.points = preset.points.map(p => ({...p, cluster: -1}));
        this.k = preset.k;
        document.getElementById('k-slider').value = this.k;
        document.getElementById('k-value').textContent = this.k;
        this.resetAlgorithm();
    }

    generateRandomData() {
        this.points = [];
        const numPoints = 50 + Math.floor(Math.random() * 50);
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.addPoint(x, y);
        }
        this.resetAlgorithm();
        document.getElementById('preset-selector').value = '';
    }

    initializeCentroids() {
        this.centroids = [];
        for (let i = 0; i < this.k; i++) {
            this.centroids.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
        }
    }

    calculateDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    assignPointsToClusters() {
        let changed = false;
        this.points.forEach(point => {
            let minDistance = Infinity;
            let closestCluster = -1;
            this.centroids.forEach((centroid, i) => {
                const distance = this.calculateDistance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = i;
                }
            });
            if (point.cluster !== closestCluster) {
                changed = true;
                point.cluster = closestCluster;
            }
        });
        return changed;
    }

    updateCentroids() {
        for (let i = 0; i < this.centroids.length; i++) {
            const clusterPoints = this.points.filter(p => p.cluster === i);
            if (clusterPoints.length > 0) {
                const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
                const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
                this.centroids[i] = { x: sumX / clusterPoints.length, y: sumY / clusterPoints.length };
            }
        }
    }

    calculateTotalCost() {
        let totalCost = 0;
        this.points.forEach(point => {
            if (point.cluster !== -1) {
                const centroid = this.centroids[point.cluster];
                totalCost += this.calculateDistance(point, centroid) ** 2;
            }
        });
        return Math.round(totalCost);
    }

    startAlgorithm() {
        if (this.points.length < this.k) {
            alert(`You need at least ${this.k} points for ${this.k} clusters.`);
            return;
        }
        this.isRunning = true;
        this.isPaused = false;
        this.iteration = 0;
        this.currentStep = 'initialization';
        this.initializeCentroids();
        this.runAlgorithmStep();
    }

    stepAlgorithm() {
        if (!this.isRunning) {
            this.startAlgorithm();
        } else {
            this.isPaused = true;
            this.runAlgorithmStep();
        }
    }

    pauseAlgorithm() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? 'Resume' : 'Pause';
        if (!this.isPaused) {
            this.runAlgorithmStep();
        }
    }

    resetAlgorithm() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 'ready';
        this.iteration = 0;
        this.centroids = [];
        this.points.forEach(p => p.cluster = -1);
        this.updateStepDisplay();
        this.updateDisplay();
        this.draw();
    }

    runAlgorithmStep() {
        if (!this.isRunning || this.isPaused) return;

        let changed = false;
        switch (this.currentStep) {
            case 'initialization':
                this.currentStep = 'assignment';
                break;
            case 'assignment':
                changed = this.assignPointsToClusters();
                this.currentStep = changed ? 'update' : 'converged';
                break;
            case 'update':
                this.updateCentroids();
                this.iteration++;
                this.currentStep = 'assignment';
                break;
        }

        if (this.currentStep === 'converged' || this.iteration >= this.maxIterations) {
            this.isRunning = false;
            this.currentStep = 'converged';
        }

        this.updateStepDisplay();
        this.updateDisplay();
        this.draw();

        if (this.isRunning) {
            setTimeout(() => this.runAlgorithmStep(), 500);
        }
    }

    updateStepDisplay() {
        const stepInfo = this.stepExplanations[this.currentStep];
        document.getElementById('step-title').textContent = stepInfo.title;
        document.getElementById('step-description').textContent = stepInfo.description;
        document.getElementById('iteration-count').textContent = `Iteration: ${this.iteration}`;
        const progress = this.currentStep === 'converged' ? 100 : (this.iteration / this.maxIterations) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    updateDisplay() {
        document.getElementById('point-count').textContent = this.points.length;
        document.getElementById('total-cost').textContent = this.centroids.length > 0 ? this.calculateTotalCost() : '-';
    }

    drawVoronoiRegions() {
        if (this.centroids.length === 0) return;
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let x = 0; x < this.canvas.width; x++) {
            for (let y = 0; y < this.canvas.height; y++) {
                let minDistance = Infinity;
                let closestCentroid = 0;
                for (let i = 0; i < this.centroids.length; i++) {
                    const distance = this.calculateDistance({x, y}, this.centroids[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = i;
                    }
                }
                const color = this.hexToRgb(this.colors[closestCentroid % this.colors.length]);
                const index = (y * this.canvas.width + x) * 4;
                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = 50; // Alpha for region transparency
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawVoronoiRegions();

        // Draw points
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.cluster === -1 ? '#94a3b8' : this.colors[point.cluster % this.colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        // Draw centroids
        this.centroids.forEach((centroid, i) => {
            this.ctx.beginPath();
            this.ctx.arc(centroid.x, centroid.y, 10, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
            this.ctx.fill();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new KMeansLab());
