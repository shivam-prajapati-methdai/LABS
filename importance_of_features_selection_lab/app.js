// Educational ML App JavaScript

// Application state
let currentSection = 0;
let currentQuizQuestion = 0;
let quizScore = 0;

// House features data
const houseFeatures = {
    size: { min: 500, max: 5000, default: 2000, unit: "sq ft", label: "House Size" },
    bedrooms: { min: 1, max: 6, default: 3, unit: "bedrooms", label: "Bedrooms" },
    bathrooms: { min: 1, max: 4, default: 2, unit: "bathrooms", label: "Bathrooms" },
    age: { min: 0, max: 50, default: 10, unit: "years", label: "House Age" },
    lotSize: { min: 1000, max: 10000, default: 5000, unit: "sq ft", label: "Lot Size" }
};

// Price prediction model
const priceModel = {
    basePrice: 200000,
    sizeMultiplier: 100,
    bedroomBonus: 15000,
    bathroomBonus: 10000,
    agePenalty: -1000,
    lotMultiplier: 10
};

// Section names for navigation
const sections = ['welcome', 'demo', 'features', 'target', 'model', 'summary'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeSliders();
    calculatePrice();
    showSection('welcome');
    
    // Preload sections to prevent blank space issues
    preloadSections();
}

function preloadSections() {
    // Ensure all sections are properly structured before showing
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.style.minHeight = '100vh';
    });
}

// Navigation functions with smooth transitions
function prevSection() {
    if (currentSection > 0) {
        currentSection--;
        showSection(sections[currentSection]);
    }
}

function nextSection() {
    if (currentSection < sections.length - 1) {
        currentSection++;
        showSection(sections[currentSection]);
    }
}

function showSection(sectionId) {
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('is-active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('is-active');
        
        // Smooth scroll to top
        setTimeout(() => {
            if (window.CSS && CSS.supports('scroll-behavior', 'smooth')) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                smoothScrollTo(document.body);
            }
        }, 100);
    }
}

function restartLearning() {
    currentSection = 0;
    currentQuizQuestion = 0;
    quizScore = 0;
    
    // Reset sliders to default values
    resetSliders();
    
    // Smooth transition back to welcome
    showSection('welcome');
}

// Enhanced slider initialization and handling
function initializeSliders() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            updateSliderValue(this);
            debouncedCalculatePrice();
            highlightFeature(this.id);
        });
        
        // Add smooth interaction feedback
        slider.addEventListener('mousedown', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        slider.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Initialize display values
        updateSliderValue(slider);
    });
}

function updateSliderValue(slider) {
    const valueSpan = document.getElementById(slider.id + '-value');
    if (valueSpan) {
        // Add smooth number transition
        const currentValue = parseInt(valueSpan.textContent) || 0;
        const newValue = parseInt(slider.value);
        
        if (currentValue !== newValue) {
            animateNumberChange(valueSpan, currentValue, newValue, 200);
        }
    }
}

function animateNumberChange(element, start, end, duration) {
    const startTime = performance.now();
    const change = end - start;
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (change * progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function resetSliders() {
    document.getElementById('size').value = houseFeatures.size.default;
    document.getElementById('bedrooms').value = houseFeatures.bedrooms.default;
    document.getElementById('bathrooms').value = houseFeatures.bathrooms.default;
    document.getElementById('age').value = houseFeatures.age.default;
    document.getElementById('lot-size').value = houseFeatures.lotSize.default;
    
    // Update display values immediately
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueSpan = document.getElementById(slider.id + '-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value;
        }
    });
    
    calculatePrice();
}

function highlightFeature(sliderId) {
    // Remove previous highlights
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => item.classList.remove('highlight'));
    
    // Highlight corresponding feature
    let featureId = '';
    switch(sliderId) {
        case 'size':
            featureId = 'feature-size';
            break;
        case 'bedrooms':
            featureId = 'feature-bedrooms';
            break;
        case 'bathrooms':
            featureId = 'feature-bathrooms';
            break;
        case 'age':
            featureId = 'feature-age';
            break;
        case 'lot-size':
            featureId = 'feature-lot';
            break;
    }
    
    const featureElement = document.getElementById(featureId);
    if (featureElement) {
        featureElement.classList.add('highlight');
        
        // Add pulse effect
        featureElement.style.animation = 'none';
        featureElement.offsetHeight; // Trigger reflow
        featureElement.style.animation = 'pulse 0.6s ease-in-out';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            featureElement.classList.remove('highlight');
            featureElement.style.animation = '';
        }, 3000);
    }
}

// Enhanced price calculation with smooth animations
function calculatePrice() {
    const size = parseInt(document.getElementById('size').value);
    const bedrooms = parseInt(document.getElementById('bedrooms').value);
    const bathrooms = parseInt(document.getElementById('bathrooms').value);
    const age = parseInt(document.getElementById('age').value);
    const lotSize = parseInt(document.getElementById('lot-size').value);
    
    // Calculate price using the model
    let price = priceModel.basePrice;
    price += size * priceModel.sizeMultiplier;
    price += bedrooms * priceModel.bedroomBonus;
    price += bathrooms * priceModel.bathroomBonus;
    price += age * priceModel.agePenalty;
    price += lotSize * priceModel.lotMultiplier;
    
    // Ensure price doesn't go below a minimum
    price = Math.max(price, 100000);
    
    // Get current price and animate to new price
    const priceElement = document.getElementById('predicted-price');
    if (priceElement) {
        const currentPrice = parseInt(priceElement.textContent.replace(/,/g, '')) || 0;
        
        if (currentPrice !== price) {
            // Add updating animation
            priceElement.parentElement.classList.add('updating');
            
            // Animate price change
            animatePriceChange(priceElement, currentPrice, price, 400);
            
            setTimeout(() => {
                priceElement.parentElement.classList.remove('updating');
            }, 400);
        }
    }
}

function animatePriceChange(element, start, end, duration) {
    const startTime = performance.now();
    const change = end - start;
    
    function updatePrice(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (change * progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updatePrice);
        }
    }
    
    requestAnimationFrame(updatePrice);
}



// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes correctAnswer {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes incorrectAnswer {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
        100% { transform: translateX(0); }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .quiz-option {
        transition: all 0.2s ease;
    }
    
    #quiz-feedback, #quiz-next {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Enhanced button interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('quiz-option')) {
        e.target.click();
    }
    
    // Allow space bar to advance sections
    if (e.key === ' ' && sections[currentSection] !== 'quiz') {
        e.preventDefault();
        if (currentSection < sections.length - 1) {
            nextSection();
        }
    }
});

// Performance optimization: debounce price calculations
let priceCalculationTimeout;
function debouncedCalculatePrice() {
    clearTimeout(priceCalculationTimeout);
    priceCalculationTimeout = setTimeout(calculatePrice, 50);
}

// Add loading state management
function showLoadingState() {
    document.body.style.opacity = '0.7';
    document.body.style.pointerEvents = 'none';
}

function hideLoadingState() {
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
}

// Smooth scroll polyfill for older browsers
const smoothScrollTo = (element) => {
    const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
};

// Error handling and fallbacks
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // Graceful fallback - ensure basic functionality works
    if (!document.getElementById('predicted-price')) {
        console.warn('Price element not found, reinitializing...');
        setTimeout(initializeApp, 100);
    }
});

// Accessibility improvements
function addAriaLabels() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const label = slider.previousElementSibling;
        if (label) {
            slider.setAttribute('aria-label', label.textContent.replace(':', ''));
        }
    });
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent);
        }
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addAriaLabels, 100);
});