// Maze Environment Class
class MazeEnvironment {
    constructor() {
        this.rows = 6;
        this.cols = 6;
        this.resetMaze();
    }

    resetMaze() {
        // Default 6x6 maze layout - 0: empty, 1: wall
        this.maze = [
            [0, 0, 1, 0, 0, 0],
            [0, 1, 1, 0, 1, 0],
            [0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0]
        ];
        this.startPos = { row: 0, col: 0 };
        this.goalPos = { row: 5, col: 5 };
        this.agentPos = { ...this.startPos };
    }

    getState() {
        return this.agentPos.row * this.cols + this.agentPos.col;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && 
               col >= 0 && col < this.cols && 
               this.maze[row][col] === 0;
    }

    isGoalReached() {
        return this.agentPos.row === this.goalPos.row && 
               this.agentPos.col === this.goalPos.col;
    }

    step(action) {
        // Actions: 0=North, 1=East, 2=South, 3=West
        const moves = [
            { row: -1, col: 0 },  // North
            { row: 0, col: 1 },   // East
            { row: 1, col: 0 },   // South
            { row: 0, col: -1 }   // West
        ];

        const move = moves[action];
        const newRow = this.agentPos.row + move.row;
        const newCol = this.agentPos.col + move.col;

        let reward = -0.04; // Small negative reward for each step
        let validMove = true;

        if (this.isValidPosition(newRow, newCol)) {
            this.agentPos.row = newRow;
            this.agentPos.col = newCol;
            
            if (this.isGoalReached()) {
                reward = 1.0; // Large positive reward for reaching goal
            }
        } else {
            reward = -0.05; // Penalty for invalid move
            validMove = false;
        }

        return {
            nextState: this.getState(),
            reward: reward,
            done: this.isGoalReached(),
            validMove: validMove
        };
    }

    reset() {
        this.agentPos = { ...this.startPos };
        return this.getState();
    }

    toggleWall(row, col) {
        if ((row === this.startPos.row && col === this.startPos.col) ||
            (row === this.goalPos.row && col === this.goalPos.col)) {
            return; // Can't place walls on start or goal
        }
        this.maze[row][col] = this.maze[row][col] === 0 ? 1 : 0;
    }
}

// Q-Learning Agent Class
class QLearningAgent {
    constructor(stateSize, actionSize, learningRate = 0.7, discountFactor = 0.9, explorationRate = 0.2) {
        this.stateSize = stateSize;
        this.actionSize = actionSize;
        this.learningRate = learningRate;
        this.discountFactor = discountFactor;
        this.explorationRate = explorationRate;
        this.initializeQTable();
    }

    initializeQTable() {
        this.qTable = Array(this.stateSize).fill().map(() => 
            Array(this.actionSize).fill(0)
        );
    }

    updateParameters(learningRate, discountFactor, explorationRate) {
        this.learningRate = learningRate;
        this.discountFactor = discountFactor;
        this.explorationRate = explorationRate;
    }

    chooseAction(state) {
        if (Math.random() < this.explorationRate) {
            // Explore: random action
            return Math.floor(Math.random() * this.actionSize);
        } else {
            // Exploit: best known action
            return this.getBestAction(state);
        }
    }

    getBestAction(state) {
        const qValues = this.qTable[state];
        let maxValue = Math.max(...qValues);
        const bestActions = qValues.map((value, index) => value === maxValue ? index : -1)
                                  .filter(index => index !== -1);
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    updateQValue(state, action, reward, nextState, done) {
        const currentQ = this.qTable[state][action];
        const maxNextQ = done ? 0 : Math.max(...this.qTable[nextState]);
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
        this.qTable[state][action] = newQ;
    }

    getQValues(state) {
        return this.qTable[state].slice(); // Return copy
    }

    reset() {
        this.initializeQTable();
    }
}

// Main Application Class
class MazeLab {
    constructor() {
        this.maze = new MazeEnvironment();
        this.agent = new QLearningAgent(36, 4); // 6x6 grid, 4 actions
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 60;
        
        // Training state
        this.isTraining = false;
        this.trainingInterval = null;
        this.episodeCount = 0;
        this.successCount = 0;
        this.lastReward = 0;
        this.lastSteps = 0;
        this.trainingSpeed = 100; // ms between steps during training

        // Live training state
        this.trainingState = {
            currentState: 0,
            steps: 0,
            totalReward: 0,
            isActive: false
        };
        
        this.initializeUI();
        this.render();
    }

    initializeUI() {
        // Get UI elements
        this.elements = {
            stepBtn: document.getElementById('stepBtn'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            resetEnvBtn: document.getElementById('resetEnvBtn'),
            episodeCount: document.getElementById('episodeCount'),
            lastReward: document.getElementById('lastReward'),
            lastSteps: document.getElementById('lastSteps'),
            successRate: document.getElementById('successRate')
        };

        // Event listeners
        this.elements.stepBtn.addEventListener('click', () => this.stepEpisode());
        this.elements.startBtn.addEventListener('click', () => this.startTraining());
        this.elements.stopBtn.addEventListener('click', () => this.stopTraining());
        this.elements.resetEnvBtn.addEventListener('click', () => this.resetEnvironment());

        // Canvas click for wall editing
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        this.updateUI();
    }

    updateAgentParameters() {
        const lr = parseFloat(0.7);
        const discount = parseFloat(0.9);
        const exploration = parseFloat(0.2);
        this.agent.updateParameters(100);
    }

    handleCanvasClick(e) {
        if (this.isTraining) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row >= 0 && row < this.maze.rows && col >= 0 && col < this.maze.cols) {
            this.maze.toggleWall(row, col);
            this.render();
        }
    }

    async stepEpisode() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        this.updateButtonStates();
        
        const maxSteps = parseInt(100);
        let steps = 0;
        let totalReward = 0;
        let path = [];

        // Reset environment
        const initialState = this.maze.reset();
        let currentState = initialState;
        path.push({...this.maze.agentPos});

        while (steps < maxSteps && !this.maze.isGoalReached()) {
            // Choose and execute action (exploitation only for demonstration)
            const action = this.agent.getBestAction(currentState);
            const result = this.maze.step(action);

            // NO Q-value update during demonstration

            // Update state and tracking
            currentState = result.nextState;
            totalReward += result.reward;
            steps++;
            path.push({...this.maze.agentPos});

            // Animate the move
            this.render(path);
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));

            if (result.done) break;
        }

        // Update statistics
        this.episodeCount++;
        if (this.maze.isGoalReached()) {
            this.successCount++;
        }
        this.lastReward = totalReward;
        this.lastSteps = steps;
        
        this.updateUI();
        this.isTraining = false;
        this.updateButtonStates();
    }

    startTraining() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        this.updateButtonStates();

        // Initialize the first episode
        this.trainingState.currentState = this.maze.reset();
        this.trainingState.steps = 0;
        this.trainingState.totalReward = 0;
        this.trainingState.isActive = true;
        
        this.trainingInterval = setInterval(() => {
            this.runTrainingStep();
        }, this.trainingSpeed);
    }

    stopTraining() {
        if (!this.isTraining) return;
        
        this.isTraining = false;
        this.trainingState.isActive = false;
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
        this.updateButtonStates();
    }

    runTrainingStep() {
        if (!this.trainingState.isActive) return;

        const maxSteps = parseInt(100);
        const isDone = this.maze.isGoalReached();

        // Check if episode has ended (done or max steps)
        if (isDone || this.trainingState.steps >= maxSteps) {
            this.episodeCount++;
            if (isDone) {
                this.successCount++;
            }
            this.lastReward = this.trainingState.totalReward;
            this.lastSteps = this.trainingState.steps;
            this.updateUI();

            // Reset for the next episode
            this.trainingState.currentState = this.maze.reset();
            this.trainingState.steps = 0;
            this.trainingState.totalReward = 0;
        }

        const currentState = this.trainingState.currentState;
        
        // Choose and execute action
        const action = this.agent.chooseAction(currentState);
        const result = this.maze.step(action);
        
        // Update Q-value
        this.agent.updateQValue(currentState, action, result.reward, result.nextState, result.done);
        
        // Update live training state
        this.trainingState.currentState = result.nextState;
        this.trainingState.steps++;
        this.trainingState.totalReward += result.reward;

        // Render every step to visualize the process
        this.render();
    }

    resetQTable() {
        this.agent.reset();
        this.episodeCount = 0;
        this.successCount = 0;
        this.lastReward = 0;
        this.lastSteps = 0;
        this.updateUI();
        this.render();
    }

    resetEnvironment() {
        this.stopTraining();
        this.maze.resetMaze();
        this.agent.reset();
        this.episodeCount = 0;
        this.successCount = 0;
        this.lastReward = 0;
        this.lastSteps = 0;
        this.updateUI();
        this.render();
    }

    updateButtonStates() {
        this.elements.stepBtn.disabled = this.isTraining;
        this.elements.startBtn.disabled = this.isTraining;
        this.elements.stopBtn.disabled = !this.isTraining;
        this.elements.resetEnvBtn.disabled = this.isTraining;

        // Update button text and classes
        if (this.isTraining) {
            this.elements.startBtn.textContent = 'Training...';
            this.elements.startBtn.classList.add('btn--training');
        } else {
            this.elements.startBtn.textContent = 'Start Training';
            this.elements.startBtn.classList.remove('btn--training');
        }
    }

    updateUI() {
        this.elements.episodeCount.textContent = this.episodeCount;
        this.elements.lastReward.textContent = this.lastReward.toFixed(2);
        this.elements.lastSteps.textContent = this.lastSteps;
        
        const successRate = this.episodeCount > 0 ? 
            Math.round((this.successCount / this.episodeCount) * 100) : 0;
        this.elements.successRate.textContent = `${successRate}%`;
        
        this.updateButtonStates();
    }

    render(path = []) {
        // Clear canvas
        this.ctx.fillStyle = '#a7d38c'; // Grass background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;

                // Draw cell background
                if (this.maze.maze[row][col] === 1) {
                    // Obstacle (rock)
                    this.ctx.fillStyle = '#a1887f';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    this.ctx.strokeStyle = '#795548';
                    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = '#8d6e63';
                    this.ctx.fillRect(x + 5, y + 5, this.cellSize - 10, this.cellSize - 10);
                } else {
                    // Road
                    this.ctx.fillStyle = '#9e9e9e';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    // Dashed line
                    this.ctx.strokeStyle = '#fff59d';
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([10, 10]);
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize / 2, y);
                    this.ctx.lineTo(x + this.cellSize / 2, y + this.cellSize);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]); // Reset line dash
                }

                // Draw start position
                if (row === this.maze.startPos.row && col === this.maze.startPos.col) {
                    this.ctx.fillStyle = '#607d8b';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = 'bold 12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('START', x + this.cellSize / 2, y + this.cellSize / 2);
                }

                // Draw goal position (finish line)
                if (row === this.maze.goalPos.row && col === this.maze.goalPos.col) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    for (let i = 0; i < 4; i++) {
                        for (let j = 0; j < 4; j++) {
                            this.ctx.fillStyle = (i % 2 === j % 2) ? '#000' : '#fff';
                            this.ctx.fillRect(x + j * this.cellSize / 4, y + i * this.cellSize / 4, this.cellSize / 4, this.cellSize / 4);
                        }
                    }
                }
            }
        }

        // Draw path
        if (path.length > 0) {
            this.ctx.strokeStyle = '#f44336';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            for (let i = 0; i < path.length; i++) {
                const pos = path[i];
                const x = pos.col * this.cellSize + this.cellSize / 2;
                const y = pos.row * this.cellSize + this.cellSize / 2;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }

        // Draw car (agent)
        this.drawCar(this.maze.agentPos.col, this.maze.agentPos.row);
    }

    drawCar(col, row) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const carWidth = this.cellSize * 0.6;
        const carHeight = this.cellSize * 0.4;

        // Car body
        this.ctx.fillStyle = '#f44336';
        this.ctx.fillRect(x + this.cellSize / 2 - carWidth / 2, y + this.cellSize / 2 - carHeight / 2, carWidth, carHeight);

        // Car window
        this.ctx.fillStyle = '#bbdefb';
        this.ctx.fillRect(x + this.cellSize / 2 - carWidth / 4, y + this.cellSize / 2 - carHeight / 4, carWidth / 2, carHeight / 2);

        // Wheels
        this.ctx.fillStyle = '#212121';
        this.ctx.beginPath();
        this.ctx.arc(x + this.cellSize / 2 - carWidth / 4, y + this.cellSize / 2 + carHeight / 2, carHeight / 4, 0, 2 * Math.PI);
        this.ctx.arc(x + this.cellSize / 2 + carWidth / 4, y + this.cellSize / 2 + carHeight / 2, carHeight / 4, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawQValues(row, col, x, y) {
        const state = row * this.maze.cols + col;
        const qValues = this.agent.getQValues(state);
        const maxQ = Math.max(...qValues);
        const minQ = Math.min(...qValues);
        const range = maxQ - minQ || 1;

        // Draw Q-values as colored triangles in each corner
        const positions = [
            { x: x + this.cellSize/2, y: y + 10, textX: x + this.cellSize/2, textY: y + 15 }, // North
            { x: x + this.cellSize - 10, y: y + this.cellSize/2, textX: x + this.cellSize - 15, textY: y + this.cellSize/2 + 3 }, // East
            { x: x + this.cellSize/2, y: y + this.cellSize - 10, textX: x + this.cellSize/2, textY: y + this.cellSize - 5 }, // South
            { x: x + 10, y: y + this.cellSize/2, textX: x + 15, textY: y + this.cellSize/2 + 3 } // West
        ];

        qValues.forEach((qValue, action) => {
            // Color intensity based on Q-value
            const intensity = range > 0 ? (qValue - minQ) / range : 0;
            const color = `rgba(31, 184, 205, ${Math.max(0.1, intensity)})`;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(positions[action].x, positions[action].y, 6, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw Q-value text
            this.ctx.fillStyle = '#333333';
            this.ctx.font = '8px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(qValue.toFixed(1), positions[action].textX, positions[action].textY);
        });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MazeLab();
});