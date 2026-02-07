// Confusion Matrix Interactive Lab JavaScript

// Application data will be loaded from confusion_matrix_data.json
let scenariosData = [];

async function fetchScenarioData() {
    try {
        const response = await fetch('confusion_matrix_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        scenariosData = data.scenarios;
        console.log('Scenario data loaded:', scenariosData);
    } catch (error) {
        console.error('Could not fetch scenario data:', error);
    }
}

// Global state
let currentScenario = 0;
let isEditMode = false;
let currentSection = 'welcome';
let completedSections = new Set();

// Navigation functions
function goToSection(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    // Hide current section
    const currentSectionEl = document.getElementById(currentSection);
    if (currentSectionEl) {
        currentSectionEl.classList.add('hidden');
    }

    // Show new section
    const newSectionEl = document.getElementById(sectionId);
    if (newSectionEl) {
        newSectionEl.classList.remove('hidden');
        
        // Mark previous section as completed
        if (currentSection !== 'welcome' && currentSection !== sectionId) {
            completedSections.add(currentSection);
        }
        
        currentSection = sectionId;
        updateProgressIndicator();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Special handling for practice section
        if (sectionId === 'practice') {
            updatePracticeValues();
        }
    }
}

function updateProgressIndicator() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach(step => {
        const section = step.getAttribute('data-section');
        step.classList.remove('active', 'completed');
        
        if (section === currentSection) {
            step.classList.add('active');
        }
    });
}

// Scenario management
function setActiveScenario(index) {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    scenarioButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    currentScenario = index;
}

function loadScenario(index) {
    console.log('Loading scenario:', index);
    const scenario = scenariosData[index];
    if (!scenario) return;

    // Update scenario info
    const titleEl = document.getElementById('scenario-title');
    const descEl = document.getElementById('scenario-desc');
    if (titleEl) titleEl.textContent = scenario.name;
    if (descEl) descEl.textContent = scenario.description;
    
    // Update labels
    const predPosEl = document.getElementById('pred-pos-label');
    const predNegEl = document.getElementById('pred-neg-label');
    const actualPosEl = document.getElementById('actual-pos-label');
    const actualNegEl = document.getElementById('actual-neg-label');
    
    if (predPosEl) predPosEl.textContent = scenario.positive_label;
    if (predNegEl) predNegEl.textContent = scenario.negative_label;
    if (actualPosEl) actualPosEl.textContent = scenario.positive_label;
    if (actualNegEl) actualNegEl.textContent = scenario.negative_label;
    
    // Update matrix values
    updateMatrixValues(scenario.tp, scenario.fp, scenario.fn, scenario.tn);
    
    // Update metrics
    updateMetrics(scenario);
    
    // Exit edit mode if active
    if (isEditMode) {
        toggleEditMode();
    }
}

function updateMatrixValues(tp, fp, fn, tn) {
    // Update display values
    const tpValueEl = document.getElementById('tp-value');
    const fpValueEl = document.getElementById('fp-value');
    const fnValueEl = document.getElementById('fn-value');
    const tnValueEl = document.getElementById('tn-value');
    
    if (tpValueEl) tpValueEl.textContent = tp;
    if (fpValueEl) fpValueEl.textContent = fp;
    if (fnValueEl) fnValueEl.textContent = fn;
    if (tnValueEl) tnValueEl.textContent = tn;
    
    // Update input values
    const tpInputEl = document.getElementById('tp-input');
    const fpInputEl = document.getElementById('fp-input');
    const fnInputEl = document.getElementById('fn-input');
    const tnInputEl = document.getElementById('tn-input');
    
    if (tpInputEl) tpInputEl.value = tp;
    if (fpInputEl) fpInputEl.value = fp;
    if (fnInputEl) fnInputEl.value = fn;
    if (tnInputEl) tnInputEl.value = tn;
}

function updateMetrics(data) {
    // Always calculate from current values
    calculateAndUpdateMetrics();
}

// Matrix editing functions
function toggleEditMode() {
    console.log('Toggling edit mode');
    isEditMode = !isEditMode;
    const matrixContainer = document.querySelector('.matrix-container');
    const editBtn = document.getElementById('edit-btn');
    
    if (isEditMode) {
        if (matrixContainer) matrixContainer.classList.add('edit-mode');
        if (editBtn) {
            editBtn.textContent = '✅ Save';
            editBtn.classList.remove('btn--secondary');
            editBtn.classList.add('btn--primary');
        }
    } else {
        if (matrixContainer) matrixContainer.classList.remove('edit-mode');
        if (editBtn) {
            editBtn.textContent = '✏️ Edit Values';
            editBtn.classList.remove('btn--primary');
            editBtn.classList.add('btn--secondary');
        }
        
        // Update display values and recalculate metrics
        calculateAndUpdateMetrics();
    }
}

function handleMatrixValueChange() {
    if (isEditMode) {
        calculateAndUpdateMetrics();
    }
}

function calculateAndUpdateMetrics() {
    const tpInput = document.getElementById('tp-input');
    const fpInput = document.getElementById('fp-input');
    const fnInput = document.getElementById('fn-input');
    const tnInput = document.getElementById('tn-input');
    
    const tp = parseInt(tpInput ? tpInput.value : 0) || 0;
    const fp = parseInt(fpInput ? fpInput.value : 0) || 0;
    const fn = parseInt(fnInput ? fnInput.value : 0) || 0;
    const tn = parseInt(tnInput ? tnInput.value : 0) || 0;
    
    // Update display values
    const tpValueEl = document.getElementById('tp-value');
    const fpValueEl = document.getElementById('fp-value');
    const fnValueEl = document.getElementById('fn-value');
    const tnValueEl = document.getElementById('tn-value');
    
    if (tpValueEl) tpValueEl.textContent = tp;
    if (fpValueEl) fpValueEl.textContent = fp;
    if (fnValueEl) fnValueEl.textContent = fn;
    if (tnValueEl) tnValueEl.textContent = tn;
    
    // Calculate metrics
    const total = tp + fp + fn + tn;
    
    if (total === 0) {
        updateMetricDisplay('accuracy-value', '0%');
        updateMetricDisplay('precision-value', '0%');
        updateMetricDisplay('recall-value', '0%');
        updateMetricDisplay('f1-value', '0%');
        return;
    }
    
    const accuracy = (tp + tn) / total;
    const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
    const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
    const f1Score = (precision + recall) === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
    
    // Update display with animation
    animateMetricUpdate('accuracy-value', (accuracy * 100).toFixed(1) + '%');
    animateMetricUpdate('precision-value', (precision * 100).toFixed(1) + '%');
    animateMetricUpdate('recall-value', (recall * 100).toFixed(1) + '%');
    animateMetricUpdate('f1-value', (f1Score * 100).toFixed(1) + '%');
    
    // Store current values for practice section
    window.currentMatrixValues = { tp, fp, fn, tn };
}

function updateMetricDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function animateMetricUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.transform = 'scale(1.1)';
    element.style.color = 'var(--color-success)';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = 'var(--color-primary)';
    }, 150);
}

function resetToScenario() {
    console.log('Resetting to scenario');
    const scenario = scenariosData[currentScenario];
    updateMatrixValues(scenario.tp, scenario.fp, scenario.fn, scenario.tn);
    updateMetrics(scenario);
    
    if (isEditMode) {
        toggleEditMode();
    }
}

// Practice section functions
function updatePracticeValues() {
    // Get current values from the matrix
    const tpInput = document.getElementById('tp-input');
    const fpInput = document.getElementById('fp-input');
    const fnInput = document.getElementById('fn-input');
    const tnInput = document.getElementById('tn-input');
    
    const values = window.currentMatrixValues || {
        tp: parseInt(tpInput ? tpInput.value : 0) || 18,
        fp: parseInt(fpInput ? fpInput.value : 0) || 3,
        fn: parseInt(fnInput ? fnInput.value : 0) || 2,
        tn: parseInt(tnInput ? tnInput.value : 0) || 77
    };
    
    const practiceTpEl = document.getElementById('practice-tp');
    const practiceFpEl = document.getElementById('practice-fp');
    const practiceFnEl = document.getElementById('practice-fn');
    const practiceTnEl = document.getElementById('practice-tn');
    
    if (practiceTpEl) practiceTpEl.textContent = values.tp;
    if (practiceFpEl) practiceFpEl.textContent = values.fp;
    if (practiceFnEl) practiceFnEl.textContent = values.fn;
    if (practiceTnEl) practiceTnEl.textContent = values.tn;
    
    // Reset formula displays
    const formulas = ['accuracy-formula', 'precision-formula', 'recall-formula', 'f1-formula'];
    formulas.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Click to see calculation';
            element.classList.remove('calculated');
        }
    });
}

function showFormula(metricType) {
    console.log('Showing formula for:', metricType);
    
    const practiceTpEl = document.getElementById('practice-tp');
    const practiceFpEl = document.getElementById('practice-fp');
    const practiceFnEl = document.getElementById('practice-fn');
    const practiceTnEl = document.getElementById('practice-tn');
    
    const tp = parseInt(practiceTpEl ? practiceTpEl.textContent : 18);
    const fp = parseInt(practiceFpEl ? practiceFpEl.textContent : 3);
    const fn = parseInt(practiceFnEl ? practiceFnEl.textContent : 2);
    const tn = parseInt(practiceTnEl ? practiceTnEl.textContent : 77);
    
    const total = tp + fp + fn + tn;
    
    let formula, calculation, result;
    
    switch(metricType) {
        case 'accuracy':
            formula = 'Accuracy = (TP + TN) / Total';
            calculation = `(${tp} + ${tn}) / ${total} = ${tp + tn} / ${total}`;
            result = total === 0 ? 0 : ((tp + tn) / total * 100).toFixed(1);
            break;
            
        case 'precision':
            formula = 'Precision = TP / (TP + FP)';
            calculation = `${tp} / (${tp} + ${fp}) = ${tp} / ${tp + fp}`;
            result = (tp + fp) === 0 ? 0 : (tp / (tp + fp) * 100).toFixed(1);
            break;
            
        case 'recall':
            formula = 'Recall = TP / (TP + FN)';
            calculation = `${tp} / (${tp} + ${fn}) = ${tp} / ${tp + fn}`;
            result = (tp + fn) === 0 ? 0 : (tp / (tp + fn) * 100).toFixed(1);
            break;
            
        case 'f1':
            const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
            const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
            formula = 'F1 = 2 × (Precision × Recall) / (Precision + Recall)';
            const precisionPercent = (precision * 100).toFixed(1);
            const recallPercent = (recall * 100).toFixed(1);
            calculation = `2 × (${precisionPercent}% × ${recallPercent}%) / (${precisionPercent}% + ${recallPercent}%)`;
            result = (precision + recall) === 0 ? 0 : (2 * precision * recall / (precision + recall) * 100).toFixed(1);
            break;
    }
    
    const elementId = metricType + '-formula';
    const element = document.getElementById(elementId);
    
    if (element) {
        // Animate the reveal
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.innerHTML = `
                <strong>${formula}</strong><br>
                ${calculation}<br>
                <span style="color: var(--color-success); font-weight: bold;">= ${result}%</span>
            `;
            element.classList.add('calculated');
            element.style.opacity = '1';
        }, 300);
    }
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing app');
    await fetchScenarioData(); // Wait for data to load
    setupEventListeners();
    loadScenario(0);
    updateProgressIndicator();
}

function startOver() {
    console.log('Starting over');
    completedSections.clear();
    currentScenario = 0;
    isEditMode = false;
    loadScenario(0);
    goToSection('welcome');
}

function setupEventListeners() {
    // Scenario buttons
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    scenarioButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Scenario button clicked:', index);
            setActiveScenario(index);
            loadScenario(index);
        });
    });

    // Matrix input listeners
    const inputs = ['tp-input', 'fp-input', 'fn-input', 'tn-input'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', handleMatrixValueChange);
        }
    });

    // Progress indicator clicks
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(step => {
        step.addEventListener('click', (e) => {
            e.preventDefault();
            const section = step.getAttribute('data-section');
            goToSection(section);
        });
    });
}

// Add interactive feedback and animations
document.addEventListener('click', function(e) {
    // Add click animation to buttons
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Add click animation to matrix cells
    if (e.target.classList.contains('matrix-cell')) {
        e.target.style.transform = 'scale(1.1)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 200);
    }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' && currentSection !== 'welcome') {
        const sections = ['welcome', 'basics', 'scenarios', 'practice', 'summary'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex > 0) {
            goToSection(sections[currentIndex - 1]);
        }
    } else if (e.key === 'ArrowRight' && currentSection !== 'summary') {
        const sections = ['welcome', 'basics', 'scenarios', 'practice', 'summary'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex < sections.length - 1) {
            goToSection(sections[currentIndex + 1]);
        }
    }
});

// Make functions available globally for onclick handlers
window.goToSection = goToSection;
window.toggleEditMode = toggleEditMode;
window.resetToScenario = resetToScenario;
window.showFormula = showFormula;
window.startOver = startOver;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app');
    await initializeApp();
    
    // Also ensure functions are available immediately
    window.goToSection = goToSection;
    window.toggleEditMode = toggleEditMode;
    window.resetToScenario = resetToScenario;
    window.showFormula = showFormula;
    window.startOver = startOver;
});