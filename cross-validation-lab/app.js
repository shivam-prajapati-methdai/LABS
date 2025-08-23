// Cross-Validation Methods Laboratory JavaScript

// Data for the application
const cvMethods = {
  kfold: {
    name: "K-Fold Cross-Validation",
    description: "Imagine you have a big bag of candy that you want to share with your friends. Instead of giving them all the candy at once, you split it into a few smaller bags (these are the 'folds'). You give one bag to a friend to taste (the 'test set') and keep the rest to yourself (the 'training set'). You do this for each friend, so everyone gets a chance to taste. This way, you get a good idea of how much everyone likes the candy.",
    key_takeaway: "A good, general-purpose method for most situations.",
    parameters: {n_splits: 5, shuffle: true, random_state: 42},
    best_for: ["General use", "When you have a good amount of data", "When the order of data doesn't matter"],
    advantages: ["All data is used for training and testing", "Gives a reliable idea of how well your model performs", "A very common and trusted method"],
    disadvantages: ["Can be slow if you have a huge amount of data", "Might not work well for data that has a time sequence (like stock prices)", "Doesn't guarantee the same mix of data in each fold"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import KFold

# Set up the K-Fold cross-validator
cv = KFold(n_splits=5, shuffle=True, random_state=42)

# 'model' is your machine learning model
# 'X' is your data, 'y' is the answers
# 'cross_val_score' runs the cross-validation
scores = cross_val_score(model, X, y, cv=cv)`
  },
  stratified: {
    name: "Stratified K-Fold",
    description: "Imagine you have a bag of red and blue marbles, but you have a lot more red ones than blue ones. If you just split them randomly, you might end up with some bags that have only red marbles. Stratified K-Fold makes sure that each small bag has the same mix of red and blue marbles as the big bag. This is important when you have an uneven amount of different types of data.",
    key_takeaway: "Use this when you have an uneven number of items in each category (imbalanced data).",
    parameters: {n_splits: 5, shuffle: true, random_state: 42},
    best_for: ["When you have uneven groups of data (e.g., more cats than dogs in a dataset of pet images)", "Classification problems (is it A or B?)"],
    advantages: ["Keeps the group balance in each fold", "Works better for imbalanced data", "Gives a more accurate score for classification"],
    disadvantages: ["Only works for classification problems", "A little more complex to set up"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import StratifiedKFold

# Set up the Stratified K-Fold cross-validator
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Run the cross-validation
scores = cross_val_score(model, X, y, cv=cv)`
  },
  loocv: {
    name: "Leave-One-Out Cross-Validation (LOOCV)",
    description: "Imagine you have a small group of friends. To see how well you know them, you pick one friend, and try to predict something about them based on what you know about everyone else. You do this for each friend, one by one. This method is very thorough, but it can take a long time if you have a lot of friends!",
    key_takeaway: "Use this when you have a very small amount of data.",
    parameters: {},
    best_for: ["Very small datasets", "When you want to use as much data as possible for training"],
    advantages: ["Uses the most data for training in each step", "Gives the same result every time you run it"],
    disadvantages: ["Takes a very long time to run on large datasets", "The results can vary a lot", "Not practical for most real-world problems"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import LeaveOneOut

# Set up the Leave-One-Out cross-validator
cv = LeaveOneOut()

# Run the cross-validation
scores = cross_val_score(model, X, y, cv=cv)`
  },
  timeseries: {
    name: "Time Series Split",
    description: "Imagine you're trying to predict the weather. You wouldn't use tomorrow's weather to predict today's weather, right? Time Series Split respects the order of time. It always uses past data to predict future data. The training set gets bigger over time, just like how you have more and more past weather data as time goes on.",
    key_takeaway: "Use this when the order of your data is important, like with time.",
    parameters: {n_splits: 5},
    best_for: ["Stock prices", "Weather forecasting", "Any data where time is a factor"],
    advantages: ["Respects the order of time", "Prevents the model from 'cheating' by looking at the future", "Gives a realistic idea of how the model will perform on new data"],
    disadvantages: ["You have less data to train on at the beginning", "Can be sensitive to big changes or trends in the data"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import TimeSeriesSplit

# Set up the Time Series Split cross-validator
cv = TimeSeriesSplit(n_splits=5)

# Run the cross-validation
scores = cross_val_score(model, X, y, cv=cv)`
  },
  group: {
    name: "Group K-Fold",
    description: "Imagine you're studying how well a new medicine works. You have several patients, and you take multiple measurements from each patient. You want to make sure that the measurements from one patient don't get split between the training and test sets. Group K-Fold keeps all the data from one group (in this case, a patient) together in either the training or the test set. This prevents the model from getting clues it wouldn't have in the real world.",
    key_takeaway: "Use this when you have data that is grouped, and the groups should not be split.",
    parameters: {n_splits: 5},
    best_for: ["Medical data (patients are groups)", "When you have multiple samples from the same source"],
    advantages: ["Prevents the model from 'cheating' by seeing data from the same group in both training and testing", "Gives a more realistic performance estimate"],
    disadvantages: ["You need to know which data belongs to which group", "The folds might not have the same size"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import GroupKFold

# 'groups' is a list that tells you which group each data point belongs to
cv = GroupKFold(n_splits=5)

# Run the cross-validation, passing in the group information
scores = cross_val_score(model, X, y, cv=cv, groups=groups)`
  },
  shuffle: {
    name: "Monte Carlo (Shuffle Split)",
    description: "This method is like shuffling a deck of cards and then dealing a certain number of cards for the test set and the rest for the training set. You can do this multiple times, and you can decide how big the test set should be. It's very flexible, but it's possible that some data points might never be used for testing.",
    key_takeaway: "A flexible method for large datasets where you want to control the number of tests and the size of the test set.",
    parameters: {n_splits: 10, test_size: 0.2, random_state: 42},
    best_for: ["Large datasets", "When you want to choose the size of the train and test sets", "When you want to run a specific number of tests"],
    advantages: ["You can control the size of the train/test sets", "You can control how many times you run the test"],
    disadvantages: ["Some data might be used in the test set multiple times, while some might not be used at all", "Less systematic than K-Fold"],
    code: `# Python code using the scikit-learn library
from sklearn.model_selection import ShuffleSplit

# Set up the Shuffle Split cross-validator
cv = ShuffleSplit(n_splits=10, test_size=0.2, random_state=42)

# Run the cross-validation
scores = cross_val_score(model, X, y, cv=cv)`
  }
};

const datasets = {
  balanced: {
    name: "Balanced Classification",
    description: "Equal number of samples per class",
    samples: 100,
    features: 5,
    classes: 2,
    class_distribution: [50, 50],
    characteristics: ["Equal class representation", "No class imbalance issues", "Good for general CV methods"]
  },
  imbalanced: {
    name: "Imbalanced Classification", 
    description: "Unequal class distribution (90% class 0, 10% class 1)",
    samples: 100,
    features: 5,
    classes: 2,
    class_distribution: [90, 10],
    characteristics: ["Severe class imbalance", "Minority class underrepresented", "Requires stratified methods"]
  },
  small: {
    name: "Small Dataset",
    description: "Limited training data (30 samples)",
    samples: 30,
    features: 4,
    classes: 2,
    class_distribution: [15, 15],
    characteristics: ["Very limited data", "Every sample counts", "LOOCV might be beneficial"]
  },
  timeseries: {
    name: "Time Series",
    description: "Sequential temporal data with trend",
    samples: 80,
    features: 1,
    temporal: true,
    characteristics: ["Temporal dependencies", "Sequential ordering important", "Future shouldn't predict past"]
  },
  grouped: {
    name: "Grouped Data",
    description: "Multiple measurements per subject (10 groups, 5 measurements each)",
    samples: 50,
    features: 3,
    classes: 2,
    groups: 10,
    characteristics: ["Correlated samples within groups", "Group independence important", "Prevent data leakage across groups"]
  }
};

const performanceData = {
  balanced: {
    kfold: {mean_score: 0.85, std_score: 0.03, time_per_fold: 0.02},
    stratified: {mean_score: 0.85, std_score: 0.03, time_per_fold: 0.02},
    loocv: {mean_score: 0.84, std_score: 0.15, time_per_fold: 0.01},
    shuffle: {mean_score: 0.84, std_score: 0.04, time_per_fold: 0.02}
  },
  imbalanced: {
    kfold: {mean_score: 0.78, std_score: 0.08, time_per_fold: 0.02},
    stratified: {mean_score: 0.82, std_score: 0.04, time_per_fold: 0.02},
    loocv: {mean_score: 0.79, std_score: 0.12, time_per_fold: 0.01},
    shuffle: {mean_score: 0.80, std_score: 0.06, time_per_fold: 0.02}
  },
  small: {
    kfold: {mean_score: 0.75, std_score: 0.12, time_per_fold: 0.01},
    stratified: {mean_score: 0.76, std_score: 0.11, time_per_fold: 0.01},
    loocv: {mean_score: 0.77, std_score: 0.08, time_per_fold: 0.005},
    shuffle: {mean_score: 0.74, std_score: 0.14, time_per_fold: 0.01}
  },
  timeseries: {
    kfold: {mean_score: 0.65, std_score: 0.15, time_per_fold: 0.02},
    timeseries: {mean_score: 0.72, std_score: 0.08, time_per_fold: 0.02},
    shuffle: {mean_score: 0.68, std_score: 0.12, time_per_fold: 0.02}
  },
  grouped: {
    kfold: {mean_score: 0.70, std_score: 0.18, time_per_fold: 0.02},
    group: {mean_score: 0.75, std_score: 0.09, time_per_fold: 0.02},
    shuffle: {mean_score: 0.72, std_score: 0.15, time_per_fold: 0.02}
  }
};

const glossary = {
  "Fold": "A part of the dataset. If you split your data into 5 folds, you have 5 parts.",
  "Training Set": "The part of the data that the model learns from.",
  "Test Set": "The part of the data that is used to check how well the model has learned.",
  "Class Imbalance": "When you have a lot more of one type of data than another (e.g., 90 pictures of cats and 10 pictures of dogs).",
  "Data Leakage": "When the model gets information during training that it wouldn't have in the real world. This can make the model seem better than it actually is.",
  "Score": "A number that tells you how well the model performed on the test set. A higher score is usually better.",
  "Mean Score": "The average score across all the folds.",
  "Standard Deviation": "A number that tells you how much the scores vary from the mean score. A smaller number means the scores are more consistent."
};

// Global state
let currentMethod = 'kfold';
let currentDataset = 'balanced';
let currentSplits = [];
let performanceChart = null;
let compareMode = false;
let comparisonData = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Cross-Validation Laboratory...');
  initializeEventListeners();
  updateMethodDisplay();
  updateDatasetDisplay();
  updateParameterControls();
  populateGlossary();
});

function initializeEventListeners() {
  console.log('Setting up event listeners...');
  
  // Method selection
  const methodRadios = document.querySelectorAll('input[name="cv-method"]');
  methodRadios.forEach(radio => {
    radio.addEventListener('change', function(event) {
      console.log('Method changed to:', event.target.value);
      handleMethodChange(event);
    });
  });
  
  // Dataset selection
  const datasetSelect = document.getElementById('dataset-type');
  if (datasetSelect) {
    datasetSelect.addEventListener('change', function(event) {
      console.log('Dataset changed to:', event.target.value);
      handleDatasetChange(event);
    });
  }
  
  // Parameter controls
  const nSplitsSlider = document.getElementById('n-splits');
  const testSizeSlider = document.getElementById('test-size');
  const shuffleToggle = document.getElementById('shuffle-toggle');
  
  if (nSplitsSlider) {
    nSplitsSlider.addEventListener('input', handleParameterChange);
  }
  if (testSizeSlider) {
    testSizeSlider.addEventListener('input', handleParameterChange);
  }
  if (shuffleToggle) {
    shuffleToggle.addEventListener('change', handleParameterChange);
  }
  
  // Action buttons
  const runButton = document.getElementById('run-cv');
  const compareButton = document.getElementById('compare-methods');
  const generateButton = document.getElementById('generate-data');
  const resetButton = document.getElementById('reset');
  
  if (runButton) {
    runButton.addEventListener('click', function() {
      console.log('Running cross-validation...');
      runCrossValidation();
    });
  }
  if (compareButton) {
    compareButton.addEventListener('click', toggleCompareMode);
  }
  if (generateButton) {
    generateButton.addEventListener('click', generateNewDataset);
  }
  if (resetButton) {
    resetButton.addEventListener('click', resetApplication);
  }
}

function handleMethodChange(event) {
  currentMethod = event.target.value;
  console.log('Method changed to:', currentMethod);
  updateMethodDisplay();
  updateParameterControls();
  if (!compareMode) {
    clearResults();
  }
}

function handleDatasetChange(event) {
  currentDataset = event.target.value;
  console.log('Dataset changed to:', currentDataset);
  updateDatasetDisplay();
  clearResults();
  comparisonData = {};
  if (compareMode) {
      updateComparisonView();
  }
}

function handleParameterChange() {
  const nSplitsSlider = document.getElementById('n-splits');
  const testSizeSlider = document.getElementById('test-size');
  
  if (nSplitsSlider) {
    document.getElementById('n-splits-value').textContent = nSplitsSlider.value;
  }
  if (testSizeSlider) {
    document.getElementById('test-size-value').textContent = testSizeSlider.value;
  }
  
  if (!compareMode) {
    clearResults();
  }
}

function updateMethodDisplay() {
  console.log('Updating method display for:', currentMethod);
  const method = cvMethods[currentMethod];
  
  if (!method) {
    console.error('Method not found:', currentMethod);
    return;
  }
  
  // Update description
  const descElement = document.getElementById('method-desc');
  if (descElement) {
    descElement.textContent = method.description;
  }

  // Update key takeaway
  const takeawayElement = document.getElementById('method-takeaway');
  if (takeawayElement) {
    takeawayElement.textContent = method.key_takeaway;
  }
  
  // Update method details
  updateList('best-for-list', method.best_for);
  updateList('advantages-list', method.advantages);
  updateList('disadvantages-list', method.disadvantages);
  
  // Update code example
  const codeElement = document.getElementById('code-example');
  if (codeElement) {
    codeElement.innerHTML = ''; // Clear previous content
    const code = document.createElement('code');
    code.textContent = method.code;
    codeElement.appendChild(code);
    // If you are using a syntax highlighting library, you might need to re-run it here.
    // For example, if you were using highlight.js: hljs.highlightBlock(codeElement);
  }
}

function updateList(listId, items) {
  const list = document.getElementById(listId);
  if (!list || !items) return;
  
  list.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}

function updateDatasetDisplay() {
  console.log('Updating dataset display for:', currentDataset);
  const dataset = datasets[currentDataset];
  
  if (!dataset) {
    console.error('Dataset not found:', currentDataset);
    return;
  }
  
  const samplesEl = document.getElementById('samples-count');
  const featuresEl = document.getElementById('features-count');
  const classesEl = document.getElementById('classes-count');
  const distributionEl = document.getElementById('class-distribution');
  
  if (samplesEl) samplesEl.textContent = dataset.samples;
  if (featuresEl) featuresEl.textContent = dataset.features;
  
  if (dataset.classes) {
    if (classesEl) classesEl.textContent = dataset.classes;
    if (distributionEl) distributionEl.textContent = JSON.stringify(dataset.class_distribution);
  } else {
    if (classesEl) classesEl.textContent = 'N/A';
    if (distributionEl) distributionEl.textContent = 'N/A';
  }
}

function updateParameterControls() {
  const method = cvMethods[currentMethod];
  const testSizeGroup = document.getElementById('test-size-group');
  const nSplitsSlider = document.getElementById('n-splits');
  const shuffleToggle = document.getElementById('shuffle-toggle');
  const loocvNote = document.getElementById('loocv-note');
  
  if (!method) return;
  
  // Show/hide test size for shuffle split
  if (testSizeGroup) {
    if (currentMethod === 'shuffle') {
      testSizeGroup.style.display = 'block';
    } else {
      testSizeGroup.style.display = 'none';
    }
  }
  
  // Update default values
  if (method.parameters && method.parameters.n_splits && nSplitsSlider) {
    nSplitsSlider.value = method.parameters.n_splits;
    const valueDisplay = document.getElementById('n-splits-value');
    if (valueDisplay) {
      valueDisplay.textContent = method.parameters.n_splits;
    }
  }
  
  // Disable controls for LOOCV
  if (currentMethod === 'loocv') {
    if (nSplitsSlider) nSplitsSlider.disabled = true;
    if (shuffleToggle) shuffleToggle.disabled = true;
    if (loocvNote) loocvNote.style.display = 'block';
  } else {
    if (nSplitsSlider) nSplitsSlider.disabled = false;
    if (shuffleToggle) shuffleToggle.disabled = false;
    if (loocvNote) loocvNote.style.display = 'none';
  }
}

function runCrossValidation() {
  console.log('Starting cross-validation with method:', currentMethod, 'dataset:', currentDataset);
  
  const dataset = datasets[currentDataset];
  if (!dataset) {
    console.error('Dataset not found:', currentDataset);
    return;
  }
  
  const nSplitsSlider = document.getElementById('n-splits');
  const testSizeSlider = document.getElementById('test-size');
  const shuffleToggle = document.getElementById('shuffle-toggle');
  
  const nSplits = currentMethod === 'loocv' ? dataset.samples : (nSplitsSlider ? parseInt(nSplitsSlider.value) : 5);
  const testSize = testSizeSlider ? parseFloat(testSizeSlider.value) : 0.2;
  const shuffle = shuffleToggle ? shuffleToggle.checked : true;
  
  console.log('Parameters:', {nSplits, testSize, shuffle});
  
  // Generate cross-validation splits
  currentSplits = generateCVSplits(currentMethod, dataset, nSplits, testSize, shuffle);
  console.log('Generated splits:', currentSplits.length);
  
  if (compareMode) {
    const scores = currentSplits.map(split => split.score);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdScore = Math.sqrt(scores.map(x => Math.pow(x - meanScore, 2)).reduce((a, b) => a + b, 0) / scores.length);
    comparisonData[currentMethod] = {
        mean_score: meanScore,
        std_score: stdScore,
        name: cvMethods[currentMethod].name
    };
    updateComparisonView();
  }

  // Update visualizations
  displaySplits(currentSplits);
  displayPerformanceMetrics();
  updatePerformanceChart();
}

function generateCVSplits(method, dataset, nSplits, testSize, shuffle) {
  console.log('Generating CV splits for method:', method);
  
  switch (method) {
    case 'kfold':
    case 'stratified':
      return generateKFoldSplits(dataset.samples, nSplits, shuffle, method === 'stratified' ? dataset : null);
    
    case 'loocv':
      return generateLOOCVSplits(dataset.samples);
    
    case 'timeseries':
      return generateTimeSeriesSplits(dataset.samples, nSplits);
    
    case 'group':
      return generateGroupKFoldSplits(dataset, nSplits);
    
    case 'shuffle':
      return generateShuffleSplits(dataset.samples, nSplits, testSize);
    
    default:
      return generateKFoldSplits(dataset.samples, nSplits, shuffle);
  }
}

function generateKFoldSplits(samples, nSplits, shuffle, dataset = null) {
  const splits = [];
  let indices = Array.from({length: samples}, (_, i) => i);
  
  if (shuffle) {
      if (dataset && dataset.class_distribution) { // Stratified shuffle
          const class1_count = dataset.class_distribution[0];
          const class2_count = dataset.class_distribution[1];
          const class1_indices = Array.from({length: class1_count}, (_, i) => i);
          const class2_indices = Array.from({length: class2_count}, (_, i) => i + class1_count);
          
          shuffleArray(class1_indices);
          shuffleArray(class2_indices);

          indices = [...class1_indices, ...class2_indices];
      } else {
        shuffleArray(indices);
      }
  }
  
  const foldSize = Math.floor(samples / nSplits);
  
  for (let i = 0; i < nSplits; i++) {
    const testStart = i * foldSize;
    const testEnd = i === nSplits - 1 ? samples : (i + 1) * foldSize;
    
    const testIndices = indices.slice(testStart, testEnd);
    const trainIndices = [...indices.slice(0, testStart), ...indices.slice(testEnd)];
    
    // Generate realistic performance score
    const basePerf = performanceData[currentDataset] && performanceData[currentDataset][currentMethod] 
      ? performanceData[currentDataset][currentMethod].mean_score 
      : 0.80;
    const variation = performanceData[currentDataset] && performanceData[currentDataset][currentMethod] 
      ? performanceData[currentDataset][currentMethod].std_score 
      : 0.05;
    const score = basePerf + (Math.random() - 0.5) * variation * 2;
    
    splits.push({
      fold: i + 1,
      trainIndices,
      testIndices,
      trainSize: trainIndices.length,
      testSize: testIndices.length,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  return splits;
}

function generateLOOCVSplits(samples) {
  const splits = [];
  const maxSplits = Math.min(samples, 15); // Limit for performance
  
  for (let i = 0; i < maxSplits; i++) {
    const testIndices = [i];
    const trainIndices = Array.from({length: samples}, (_, idx) => idx).filter(idx => idx !== i);
    
    const baseScore = performanceData[currentDataset] && performanceData[currentDataset]['loocv'] 
      ? performanceData[currentDataset]['loocv'].mean_score 
      : 0.77;
    const score = baseScore + (Math.random() - 0.5) * 0.16; // Higher variance for LOOCV
    
    splits.push({
      fold: i + 1,
      trainIndices,
      testIndices,
      trainSize: trainIndices.length,
      testSize: 1,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  return splits;
}

function generateTimeSeriesSplits(samples, nSplits) {
  const splits = [];
  const minTrainSize = Math.floor(samples / (nSplits + 1));
  
  for (let i = 0; i < nSplits; i++) {
    const trainEnd = minTrainSize * (i + 2);
    const testStart = trainEnd;
    const testEnd = Math.min(trainEnd + minTrainSize, samples);
    
    if (testStart >= samples) break;
    
    const trainIndices = Array.from({length: trainEnd}, (_, idx) => idx);
    const testIndices = Array.from({length: testEnd - testStart}, (_, idx) => idx + testStart);
    
    const baseScore = performanceData[currentDataset] && performanceData[currentDataset]['timeseries'] 
      ? performanceData[currentDataset]['timeseries'].mean_score 
      : 0.72;
    const score = baseScore + (Math.random() - 0.5) * 0.12;
    
    splits.push({
      fold: i + 1,
      trainIndices,
      testIndices,
      trainSize: trainIndices.length,
      testSize: testIndices.length,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  return splits;
}

function generateGroupKFoldSplits(dataset, nSplits) {
  const splits = [];
  const totalGroups = dataset.groups || 10;
  const groupSize = Math.floor(dataset.samples / totalGroups);
  const groups = Array.from({length: totalGroups}, (_, i) => i);
  shuffleArray(groups);
  
  const groupsPerFold = Math.floor(totalGroups / nSplits);
  
  for (let i = 0; i < nSplits; i++) {
    const testGroupStart = i * groupsPerFold;
    const testGroupEnd = i === nSplits - 1 ? totalGroups : (i + 1) * groupsPerFold;
    
    const testGroups = groups.slice(testGroupStart, testGroupEnd);
    const trainGroups = [...groups.slice(0, testGroupStart), ...groups.slice(testGroupEnd)];
    
    const testIndices = [];
    const trainIndices = [];
    
    testGroups.forEach(group => {
      for (let j = 0; j < groupSize; j++) {
        testIndices.push(group * groupSize + j);
      }
    });
    
    trainGroups.forEach(group => {
      for (let j = 0; j < groupSize; j++) {
        trainIndices.push(group * groupSize + j);
      }
    });
    
    const baseScore = performanceData[currentDataset] && performanceData[currentDataset]['group'] 
      ? performanceData[currentDataset]['group'].mean_score 
      : 0.75;
    const score = baseScore + (Math.random() - 0.5) * 0.12;
    
    splits.push({
      fold: i + 1,
      trainIndices,
      testIndices,
      trainSize: trainIndices.length,
      testSize: testIndices.length,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  return splits;
}

function generateShuffleSplits(samples, nSplits, testSize) {
  const splits = [];
  const testSamples = Math.floor(samples * testSize);
  
  for (let i = 0; i < nSplits; i++) {
    const indices = Array.from({length: samples}, (_, idx) => idx);
    shuffleArray(indices);
    
    const testIndices = indices.slice(0, testSamples);
    const trainIndices = indices.slice(testSamples);
    
    const baseScore = performanceData[currentDataset] && performanceData[currentDataset]['shuffle'] 
      ? performanceData[currentDataset]['shuffle'].mean_score 
      : 0.78;
    const score = baseScore + (Math.random() - 0.5) * 0.10;
    
    splits.push({
      fold: i + 1,
      trainIndices,
      testIndices,
      trainSize: trainIndices.length,
      testSize: testIndices.length,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  return splits;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displaySplits(splits) {
  console.log('Displaying splits:', splits.length);
  const splitsDisplay = document.getElementById('splits-display');
  if (!splitsDisplay) return;
  
  splitsDisplay.innerHTML = '';
  
  const maxSplitsToShow = Math.min(splits.length, 10);
  
  for (let i = 0; i < maxSplitsToShow; i++) {
    const split = splits[i];
    const splitRow = document.createElement('div');
    splitRow.className = 'split-row';
    
    const totalSamples = split.trainSize + split.testSize;
    const trainPercent = (split.trainSize / totalSamples) * 100;
    const testPercent = (split.testSize / totalSamples) * 100;
    
    splitRow.innerHTML = `
      <div class="split-label">Fold ${split.fold}</div>
      <div class="split-bars">
        <div class="train-bar" style="width: ${trainPercent}%;">
          Train (${split.trainSize})
        </div>
        <div class="test-bar" style="width: ${testPercent}%;">
          Test (${split.testSize})
        </div>
      </div>
      <div class="split-stats">
        Score: ${split.score.toFixed(3)}
      </div>
    `;
    
    splitsDisplay.appendChild(splitRow);
  }
  
  if (splits.length > maxSplitsToShow) {
    const moreInfo = document.createElement('p');
    moreInfo.className = 'placeholder-text';
    moreInfo.textContent = `... and ${splits.length - maxSplitsToShow} more folds`;
    splitsDisplay.appendChild(moreInfo);
  }
}

function displayPerformanceMetrics() {
  console.log('Displaying performance metrics');
  const tableBody = document.querySelector('#metrics-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  const maxRowsToShow = Math.min(currentSplits.length, 8);
  
  for (let i = 0; i < maxRowsToShow; i++) {
    const split = currentSplits[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${split.fold}</td>
      <td>${split.trainSize}</td>
      <td>${split.testSize}</td>
      <td>${split.score.toFixed(3)}</td>
    `;
    tableBody.appendChild(row);
  }
  
  if (currentSplits.length > maxRowsToShow) {
    const moreRow = document.createElement('tr');
    moreRow.innerHTML = `<td colspan="4" class="placeholder-text">... and ${currentSplits.length - maxRowsToShow} more folds</td>`;
    tableBody.appendChild(moreRow);
  }
  
  // Update summary statistics
  if (currentSplits.length > 0) {
    const scores = currentSplits.map(split => split.score);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdScore = Math.sqrt(scores.map(x => Math.pow(x - meanScore, 2)).reduce((a, b) => a + b, 0) / scores.length);
    const avgTime = performanceData[currentDataset] && performanceData[currentDataset][currentMethod] 
      ? performanceData[currentDataset][currentMethod].time_per_fold 
      : 0.02;
    
    const meanScoreEl = document.getElementById('mean-score');
    const stdScoreEl = document.getElementById('std-score');
    const avgTimeEl = document.getElementById('avg-time');
    
    if (meanScoreEl) meanScoreEl.textContent = meanScore.toFixed(3);
    if (stdScoreEl) stdScoreEl.textContent = stdScore.toFixed(3);
    if (avgTimeEl) avgTimeEl.textContent = `${(avgTime * 1000).toFixed(1)}ms`;
    
    const summaryStats = document.getElementById('summary-stats');
    if (summaryStats) {
      summaryStats.style.display = 'grid';
    }
  }
}

function updatePerformanceChart() {
  console.log('Updating performance chart');
  const canvas = document.getElementById('performance-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (performanceChart) {
    performanceChart.destroy();
  }
  
  if (currentSplits.length === 0) {
      return;
  }

  const scores = currentSplits.map(split => split.score);
  const labels = currentSplits.map(split => `Fold ${split.fold}`);
  
  // Limit chart data for readability
  const maxPoints = 10;
  const chartLabels = labels.slice(0, maxPoints);
  const chartScores = scores.slice(0, maxPoints);
  
  performanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'CV Score',
        data: chartScores,
        backgroundColor: '#1FB8CD',
        borderColor: '#13343B',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `${cvMethods[currentMethod].name} Performance`
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1.0,
          title: {
            display: true,
            text: 'Score'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Cross-Validation Fold'
          }
        }
      }
    }
  });
}

function toggleCompareMode() {
  compareMode = !compareMode;
  const button = document.getElementById('compare-methods');
  const comparisonContainer = document.getElementById('comparison-container');
  if (!button || !comparisonContainer) return;
  
  if (compareMode) {
    button.textContent = 'Exit Compare Mode';
    button.classList.add('btn--primary');
    button.classList.remove('btn--secondary');
    comparisonContainer.style.display = 'block';
    updateComparisonView();
  } else {
    button.textContent = 'Compare Methods';
    button.classList.remove('btn--primary');
    button.classList.add('btn--secondary');
    comparisonContainer.style.display = 'none';
    comparisonData = {};
  }
}

function updateComparisonView() {
    const container = document.getElementById('comparison-container');
    if (!container) return;

    const tableBody = document.querySelector('#comparison-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (Object.keys(comparisonData).length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="placeholder-text">Run cross-validation for different methods to compare them.</td></tr>';
        return;
    }

    for (const method in comparisonData) {
        const data = comparisonData[method];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.mean_score.toFixed(3)}</td>
            <td>${data.std_score.toFixed(3)}</td>
        `;
        tableBody.appendChild(row);
    }
}


function generateNewDataset() {
  const dataset = datasets[currentDataset];
  const samplesVariation = Math.floor(Math.random() * 20) - 10;
  const newSamples = Math.max(20, dataset.samples + samplesVariation);

  // Actually update the dataset properties
  dataset.samples = newSamples;
  if (dataset.class_distribution) {
    const class1_percentage = Math.random() * 0.4 + 0.3; // between 30% and 70%
    dataset.class_distribution[0] = Math.round(newSamples * class1_percentage);
    dataset.class_distribution[1] = newSamples - dataset.class_distribution[0];
  }
  
  // Update display
  updateDatasetDisplay();
  
  clearResults();
  
  // Show feedback
  const button = document.getElementById('generate-data');
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Generated!';
    button.classList.add('btn--primary');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('btn--primary');
    }, 1000);
  }
}

function resetApplication() {
  console.log('Resetting application');
  
  // Reset state
  currentMethod = 'kfold';
  currentDataset = 'balanced';
  currentSplits = [];
  compareMode = false;
  comparisonData = {};
  
  // Reset UI elements
  const kfoldRadio = document.getElementById('kfold');
  if (kfoldRadio) kfoldRadio.checked = true;
  
  const datasetSelect = document.getElementById('dataset-type');
  if (datasetSelect) datasetSelect.value = 'balanced';
  
  const nSplitsSlider = document.getElementById('n-splits');
  if (nSplitsSlider) nSplitsSlider.value = 5;
  
  const testSizeSlider = document.getElementById('test-size');
  if (testSizeSlider) testSizeSlider.value = 0.2;
  
  const shuffleToggle = document.getElementById('shuffle-toggle');
  if (shuffleToggle) shuffleToggle.checked = true;
  
  // Update displays
  updateMethodDisplay();
  updateDatasetDisplay();
  updateParameterControls();
  clearResults();
  
  // Reset compare mode button
  const compareButton = document.getElementById('compare-methods');
  if (compareButton) {
    compareButton.textContent = 'Compare Methods';
    compareButton.classList.remove('btn--primary');
    compareButton.classList.add('btn--secondary');
  }

  const comparisonContainer = document.getElementById('comparison-container');
  if (comparisonContainer) {
      comparisonContainer.style.display = 'none';
  }
}

function clearResults() {
  console.log('Clearing results');
  currentSplits = [];
  
  if (compareMode) {
      return;
  }

  // Clear visualizations
  const splitsDisplay = document.getElementById('splits-display');
  if (splitsDisplay) {
    splitsDisplay.innerHTML = '<p class="placeholder-text">Click "Run Cross-Validation" to see splits visualization</p>';
  }
  
  // Clear metrics table
  const tableBody = document.querySelector('#metrics-table tbody');
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="4" class="placeholder-text">Run cross-validation to see metrics</td></tr>';
  }
  
  // Hide summary stats
  const summaryStats = document.getElementById('summary-stats');
  if (summaryStats) {
    summaryStats.style.display = 'none';
  }
  
  // Clear performance chart
  if (performanceChart) {
    performanceChart.destroy();
    performanceChart = null;
  }
}

function populateGlossary() {
    const glossaryList = document.getElementById('glossary-list');
    if (!glossaryList) return;

    glossaryList.innerHTML = '';

    for (const term in glossary) {
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = glossary[term];
        glossaryList.appendChild(dt);
        glossaryList.appendChild(dd);
    }
}
