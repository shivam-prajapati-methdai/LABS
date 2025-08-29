// Threshold data for medical diagnosis scenario
const thresholdData = [
  {"threshold": 0.05, "tp": 46, "fp": 222, "tn": 30, "fn": 2, "accuracy": 0.253, "precision": 0.172, "recall": 0.958, "f1_score": 0.291, "tpr": 0.958, "fpr": 0.881, "tnr": 0.119, "fnr": 0.042},
  {"threshold": 0.1, "tp": 42, "fp": 145, "tn": 107, "fn": 6, "accuracy": 0.497, "precision": 0.225, "recall": 0.875, "f1_score": 0.357, "tpr": 0.875, "fpr": 0.575, "tnr": 0.425, "fnr": 0.125},
  {"threshold": 0.15, "tp": 32, "fp": 82, "tn": 170, "fn": 16, "accuracy": 0.673, "precision": 0.281, "recall": 0.667, "f1_score": 0.395, "tpr": 0.667, "fpr": 0.325, "tnr": 0.675, "fnr": 0.333},
  {"threshold": 0.2, "tp": 26, "fp": 46, "tn": 206, "fn": 22, "accuracy": 0.773, "precision": 0.361, "recall": 0.542, "f1_score": 0.433, "tpr": 0.542, "fpr": 0.183, "tnr": 0.817, "fnr": 0.458},
  {"threshold": 0.25, "tp": 18, "fp": 27, "tn": 225, "fn": 30, "accuracy": 0.81, "precision": 0.4, "recall": 0.375, "f1_score": 0.387, "tpr": 0.375, "fpr": 0.107, "tnr": 0.893, "fnr": 0.625},
  {"threshold": 0.3, "tp": 13, "fp": 19, "tn": 233, "fn": 35, "accuracy": 0.82, "precision": 0.406, "recall": 0.271, "f1_score": 0.325, "tpr": 0.271, "fpr": 0.075, "tnr": 0.925, "fnr": 0.729},
  {"threshold": 0.35, "tp": 11, "fp": 7, "tn": 245, "fn": 37, "accuracy": 0.853, "precision": 0.611, "recall": 0.229, "f1_score": 0.333, "tpr": 0.229, "fpr": 0.028, "tnr": 0.972, "fnr": 0.771},
  {"threshold": 0.4, "tp": 8, "fp": 2, "tn": 250, "fn": 40, "accuracy": 0.86, "precision": 0.8, "recall": 0.167, "f1_score": 0.276, "tpr": 0.167, "fpr": 0.008, "tnr": 0.992, "fnr": 0.833},
  {"threshold": 0.45, "tp": 7, "fp": 0, "tn": 252, "fn": 41, "accuracy": 0.863, "precision": 1.0, "recall": 0.146, "f1_score": 0.255, "tpr": 0.146, "fpr": 0.0, "tnr": 1.0, "fnr": 0.854},
  {"threshold": 0.5, "tp": 5, "fp": 0, "tn": 252, "fn": 43, "accuracy": 0.857, "precision": 1.0, "recall": 0.104, "f1_score": 0.189, "tpr": 0.104, "fpr": 0.0, "tnr": 1.0, "fnr": 0.896},
  {"threshold": 0.55, "tp": 4, "fp": 0, "tn": 252, "fn": 44, "accuracy": 0.853, "precision": 1.0, "recall": 0.083, "f1_score": 0.154, "tpr": 0.083, "fpr": 0.0, "tnr": 1.0, "fnr": 0.917},
  {"threshold": 0.6, "tp": 2, "fp": 0, "tn": 252, "fn": 46, "accuracy": 0.847, "precision": 1.0, "recall": 0.042, "f1_score": 0.08, "tpr": 0.042, "fpr": 0.0, "tnr": 1.0, "fnr": 0.958},
  {"threshold": 0.65, "tp": 2, "fp": 0, "tn": 252, "fn": 46, "accuracy": 0.847, "precision": 1.0, "recall": 0.042, "f1_score": 0.08, "tpr": 0.042, "fpr": 0.0, "tnr": 1.0, "fnr": 0.958},
  {"threshold": 0.7, "tp": 1, "fp": 0, "tn": 252, "fn": 47, "accuracy": 0.843, "precision": 1.0, "recall": 0.021, "f1_score": 0.041, "tpr": 0.021, "fpr": 0.0, "tnr": 1.0, "fnr": 0.979},
  {"threshold": 0.75, "tp": 1, "fp": 0, "tn": 252, "fn": 47, "accuracy": 0.843, "precision": 1.0, "recall": 0.021, "f1_score": 0.041, "tpr": 0.021, "fpr": 0.0, "tnr": 1.0, "fnr": 0.979},
  {"threshold": 0.8, "tp": 0, "fp": 0, "tn": 252, "fn": 48, "accuracy": 0.84, "precision": 0.0, "recall": 0.0, "f1_score": 0.0, "tpr": 0.0, "fpr": 0.0, "tnr": 1.0, "fnr": 1.0},
  {"threshold": 0.85, "tp": 0, "fp": 0, "tn": 252, "fn": 48, "accuracy": 0.84, "precision": 0.0, "recall": 0.0, "f1_score": 0.0, "tpr": 0.0, "fpr": 0.0, "tnr": 1.0, "fnr": 1.0},
  {"threshold": 0.9, "tp": 0, "fp": 0, "tn": 252, "fn": 48, "accuracy": 0.84, "precision": 0.0, "recall": 0.0, "f1_score": 0.0, "tpr": 0.0, "fpr": 0.0, "tnr": 1.0, "fnr": 1.0}
];

// DOM elements
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdValue = document.getElementById('threshold-value');
const tpValue = document.getElementById('tp-value');
const fpValue = document.getElementById('fp-value');
const tnValue = document.getElementById('tn-value');
const fnValue = document.getElementById('fn-value');
const accuracyValue = document.getElementById('accuracy-value');
const precisionValue = document.getElementById('precision-value');
const recallValue = document.getElementById('recall-value');
const f1Value = document.getElementById('f1-value');
const fprValue = document.getElementById('fpr-value');
const fnrValue = document.getElementById('fnr-value');

// Helper function to format percentage
function formatPercentage(value) {
  return (value * 100).toFixed(1) + '%';
}

// Helper function to find data for a specific threshold
function findThresholdData(threshold) {
  return thresholdData.find(item => item.threshold === parseFloat(threshold));
}

// Helper function to add animation class
function animateValue(element) {
  element.classList.add('value-updating');
  setTimeout(() => {
    element.classList.remove('value-updating');
  }, 300);
}

// Update all values based on threshold
function updateValues(threshold) {
  const data = findThresholdData(threshold);
  
  if (!data) return;
  
  // Update threshold display
  thresholdValue.textContent = threshold;
  
  // Update confusion matrix values with animation
  animateValue(tpValue);
  animateValue(fpValue);
  animateValue(tnValue);
  animateValue(fnValue);
  
  setTimeout(() => {
    tpValue.textContent = data.tp;
    fpValue.textContent = data.fp;
    tnValue.textContent = data.tn;
    fnValue.textContent = data.fn;
  }, 150);
  
  // Update metrics with animation
  setTimeout(() => {
    animateValue(accuracyValue);
    animateValue(precisionValue);
    animateValue(recallValue);
    animateValue(f1Value);
    animateValue(fprValue);
    animateValue(fnrValue);
    
    accuracyValue.textContent = formatPercentage(data.accuracy);
    precisionValue.textContent = formatPercentage(data.precision);
    recallValue.textContent = formatPercentage(data.recall);
    f1Value.textContent = formatPercentage(data.f1_score);
    fprValue.textContent = formatPercentage(data.fpr);
    fnrValue.textContent = formatPercentage(data.fnr);
  }, 100);
}

// Add event listener to threshold slider
thresholdSlider.addEventListener('input', function(e) {
  const threshold = parseFloat(e.target.value);
  updateValues(threshold);
});

// Add keyboard navigation for the slider
thresholdSlider.addEventListener('keydown', function(e) {
  const currentValue = parseFloat(e.target.value);
  let newValue = currentValue;
  
  switch(e.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = Math.max(0.05, currentValue - 0.05);
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = Math.min(0.90, currentValue + 0.05);
      break;
    case 'Home':
      newValue = 0.05;
      break;
    case 'End':
      newValue = 0.90;
      break;
  }
  
  if (newValue !== currentValue) {
    e.target.value = newValue;
    updateValues(newValue);
    e.preventDefault();
  }
});

// Add hover effects for matrix cells
const matrixCells = document.querySelectorAll('.matrix-cell');
matrixCells.forEach(cell => {
  cell.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
  });
  
  cell.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

// Add click handler for matrix cells to show additional info
matrixCells.forEach(cell => {
  cell.addEventListener('click', function() {
    const cellType = this.classList.contains('tp-cell') ? 'True Positives' :
                     this.classList.contains('fp-cell') ? 'False Positives' :
                     this.classList.contains('tn-cell') ? 'True Negatives' :
                     'False Negatives';
    
    const explanations = {
      'True Positives': 'Patients who actually have the disease and were correctly identified by the model.',
      'False Positives': 'Healthy patients who were incorrectly flagged as having the disease.',
      'True Negatives': 'Healthy patients who were correctly identified as healthy by the model.',
      'False Negatives': 'Patients who actually have the disease but were missed by the model.'
    };
    
    alert(`${cellType}: ${explanations[cellType]}`);
  });
});

// Add threshold change suggestions based on context
function getThresholdSuggestion(threshold) {
  if (threshold <= 0.15) {
    return "Very sensitive setting - catches most diseases but many false alarms";
  } else if (threshold <= 0.25) {
    return "Balanced sensitivity - good for screening scenarios";
  } else if (threshold <= 0.35) {
    return "Moderate sensitivity - balanced precision and recall";
  } else if (threshold <= 0.50) {
    return "Conservative setting - fewer false alarms, some diseases missed";
  } else {
    return "Very specific setting - minimal false alarms but many diseases missed";
  }
}

// Add dynamic threshold suggestions
thresholdSlider.addEventListener('input', function(e) {
  const threshold = parseFloat(e.target.value);
  const suggestion = getThresholdSuggestion(threshold);
  
  // Find or create suggestion element
  let suggestionElement = document.getElementById('threshold-suggestion');
  if (!suggestionElement) {
    suggestionElement = document.createElement('div');
    suggestionElement.id = 'threshold-suggestion';
    suggestionElement.style.cssText = `
      margin-top: 12px;
      padding: 8px 16px;
      background: rgba(33, 128, 141, 0.1);
      border: 1px solid rgba(33, 128, 141, 0.2);
      border-radius: 6px;
      font-size: 12px;
      color: var(--color-primary);
      text-align: center;
      transition: all 0.3s ease;
    `;
    thresholdSlider.parentNode.appendChild(suggestionElement);
  }
  
  suggestionElement.textContent = suggestion;
  suggestionElement.style.opacity = '1';
});

function formatPercentage(value) {
  return (value * 100).toFixed(1) + '%';
}


  const formulas = {
      accuracy: '(TP + TN) / (TP + TN + FP + FN)',
      precision: 'TP / (TP + FP)',
      recall: 'TP / (TP + FN)',
      f1: '2 * (Precision * Recall) / (Precision + Recall)',
      fpr: 'FP / (FP + TN)',
      fnr: 'FN / (TP + FN)'
  };

  const metricItems = document.querySelectorAll('.metric-item');

  metricItems.forEach(item => {
      item.addEventListener('click', function() {
          const metric = this.dataset.metric;
          const formula = formulas[metric];
          
          // Remove any existing formula
          const existingFormula = this.querySelector('.metric-formula');
          if (existingFormula) {
              existingFormula.remove();
              return;
          }

          const formulaDiv = document.createElement('div');
          formulaDiv.className = 'metric-formula';
          formulaDiv.textContent = formula;
          this.appendChild(formulaDiv);
      });
  });

  const cellValues = document.querySelectorAll('.cell-value');

  cellValues.forEach(cell => {
      cell.addEventListener('input', function() {
          updateMetricsFromInput();
      });
  });

  function updateMetricsFromInput() {
      const tp = parseInt(document.getElementById('tp-value').textContent) || 0;
      const fp = parseInt(document.getElementById('fp-value').textContent) || 0;
      const tn = parseInt(document.getElementById('tn-value').textContent) || 0;
      const fn = parseInt(document.getElementById('fn-value').textContent) || 0;

      const total = tp + fp + tn + fn;

      const accuracy = total > 0 ? (tp + tn) / total : 0;
      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
      const fpr = (fp + tn) > 0 ? fp / (fp + tn) : 0;
      const fnr = (tp + fn) > 0 ? fn / (tp + fn) : 0;

      document.getElementById('accuracy-value').textContent = formatPercentage(accuracy);
      document.getElementById('precision-value').textContent = formatPercentage(precision);
      document.getElementById('recall-value').textContent = formatPercentage(recall);
      document.getElementById('f1-value').textContent = formatPercentage(f1);
      document.getElementById('fpr-value').textContent = formatPercentage(fpr);
      document.getElementById('fnr-value').textContent = formatPercentage(fnr);
  }

  const defaultThreshold = 0.25;
  updateValues(defaultThreshold);

  