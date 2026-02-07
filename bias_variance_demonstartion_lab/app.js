// Global parameters
        let currentParams = {
            polynomialDegree: 3,
            noiseLevel: 0.8,
            sampleSize: 50,
            numSimulations: 30
        };

        let currentData = null;
        let isCalculating = false;

        // True function for demonstration (cubic with some complexity)
        function trueFunction(x) {
            return 0.5 * Math.sin(x * 0.8) + 0.3 * x + 0.1 * Math.pow(x, 2) * Math.sin(x * 2);
        }

        // Generate training data
        function generateData(sampleSize, noiseLevel) {
            const X_train = [];
            const y_train = [];
            const X_test = Array.from({ length: 100 }, (_, i) => -4 + i * (8 / 99));
            const y_test_true = X_test.map(trueFunction);

            for (let i = 0; i < sampleSize; i++) {
                const x = Math.random() * 8 - 4;
                X_train.push(x);
                y_train.push(trueFunction(x) + (Math.random() * 2 - 1) * noiseLevel);
            }

            const sortedTrain = X_train.map((x, i) => ({ x, y: y_train[i] })).sort((a, b) => a.x - b.x);
            
            return {
                X_train: sortedTrain.map(p => p.x),
                y_train: sortedTrain.map(p => p.y),
                X_test: X_test,
                y_test_true: y_test_true,
                noiseLevel: noiseLevel
            };
        }

        // Simple polynomial regression using least squares
        function trainPolynomialModel(X_train, y_train, degree) {
            const n = X_train.length;

            // Create design matrix
            const A = [];
            for (let i = 0; i < n; i++) {
                const row = [];
                for (let j = 0; j <= degree; j++) {
                    row.push(Math.pow(X_train[i], j));
                }
                A.push(row);
            }

            // Solve normal equations: (A^T * A) * coeffs = A^T * y
            const At = math.transpose(A);
            const AtA = math.multiply(At, A);
            const Aty = math.multiply(At, y_train);

            // Solve using math.js
            const coefficients = solveLinearSystem(AtA, Aty);

            return {
                coefficients: coefficients,
                degree: degree,
                predict: function(X_input) {
                    return X_input.map(x => {
                        let sum = 0;
                        for (let i = 0; i <= this.degree; i++) {
                            sum += this.coefficients[i] * Math.pow(x, i);
                        }
                        return sum;
                    });
                }
            };
        }

        // Solve linear system using math.js
        function solveLinearSystem(A, b) {
            try {
                // Use LU decomposition with partial pivoting
                const lu = math.lup(A);
                const x = math.lusolve(lu, b);
                return x.toArray().flat();
            } catch (e) {
                // If matrix is singular or other error, return zeros
                console.warn(`Could not solve linear system for degree. Returning zeros. Error: ${e}`);
                return new Array(A.length).fill(0);
            }
        }

        // Simulate errors for bias-variance decomposition
        async function simulateErrorsAndDecompose(numSimulations, sampleSize, noiseLevel, maxPolynomialDegree) {
            const errorResults = Array.from({ length: maxPolynomialDegree + 1 }, () => ({
                biasSquared: 0,
                variance: 0,
                totalError: 0
            }));

            const initialData = generateData(sampleSize, noiseLevel);
            const X_test = initialData.X_test;
            const y_test_true = initialData.y_test_true;
            const irreducibleError = Math.pow(noiseLevel, 2);

            const allPredictionsForDegree = Array.from({ length: maxPolynomialDegree + 1 }, () => []);

            for (let sim = 0; sim < numSimulations; sim++) {
                const { X_train, y_train } = generateData(sampleSize, noiseLevel);

                for (let degree = 1; degree <= maxPolynomialDegree; degree++) {
                    try {
                        const model = trainPolynomialModel(X_train, y_train, degree);
                        const predictions = model.predict(X_test);
                        allPredictionsForDegree[degree].push(predictions);
                    } catch (e) {
                        // Skip if numerical issues
                        continue;
                    }
                }
            }

            for (let degree = 1; degree <= maxPolynomialDegree; degree++) {
                if (allPredictionsForDegree[degree].length === 0) continue;

                const avgPredictions = Array.from({ length: X_test.length }, (_, i) => {
                    let sum = 0;
                    for (const simPredictions of allPredictionsForDegree[degree]) {
                        sum += simPredictions[i];
                    }
                    return sum / allPredictionsForDegree[degree].length;
                });

                const biasSquared = avgPredictions.reduce((sum, avgPred, i) =>
                    sum + Math.pow(avgPred - y_test_true[i], 2), 0
                ) / X_test.length;

                const variance = allPredictionsForDegree[degree].reduce((sumSims, simPredictions) =>
                    sumSims + simPredictions.reduce((sumPts, pred, i) =>
                        sumPts + Math.pow(pred - avgPredictions[i], 2), 0
                    ) / X_test.length, 0
                ) / allPredictionsForDegree[degree].length;

                errorResults[degree] = {
                    biasSquared: biasSquared,
                    variance: variance,
                    totalError: biasSquared + variance + irreducibleError
                };
            }

            return { errorResults, irreducibleError, X_test, y_test_true };
        }

        // Update model fitting plot
        function updateModelFittingPlot(X_train, y_train, X_test, y_test_true, modelPredictions, currentDegree) {
            const traceTrain = {
                x: X_train,
                y: y_train,
                mode: 'markers',
                type: 'scatter',
                name: 'Training Data',
                marker: {
                    color: '#ff6b6b',
                    size: 8,
                    opacity: 0.7
                },
                hovertemplate: 'Training Point<br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>'
            };

            const traceTrue = {
                x: X_test,
                y: y_test_true,
                mode: 'lines',
                type: 'scatter',
                name: 'True Function',
                line: { 
                    color: '#2c5aa0', 
                    width: 3,
                    dash: 'dot'
                },
                hovertemplate: 'True Function<br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>'
            };

            const traceModel = {
                x: X_test,
                y: modelPredictions,
                mode: 'lines',
                type: 'scatter',
                name: `Fitted Model (Degree ${currentDegree})`,
                line: { 
                    color: '#4ecdc4', 
                    width: 4 
                },
                hovertemplate: `Model Prediction (Degree ${currentDegree})<br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>`
            };

            const layout = {
                title: {
                    text: `Model Fitting: Polynomial Degree ${currentDegree}`,
                    font: { size: 16, color: '#2d3748' }
                },
                xaxis: { 
                    title: 'X',
                    gridcolor: '#e2e8f0',
                    zerolinecolor: '#cbd5e0'
                },
                yaxis: { 
                    title: 'Y',
                    gridcolor: '#e2e8f0',
                    zerolinecolor: '#cbd5e0'
                },
                plot_bgcolor: '#f7fafc',
                paper_bgcolor: 'rgba(0,0,0,0)',
                hovermode: 'closest',
                showlegend: true,
                legend: {
                    x: 0.02,
                    y: 0.98,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    bordercolor: '#e2e8f0',
                    borderwidth: 1
                }
            };

            Plotly.newPlot('modelFittingPlot', [traceTrain, traceTrue, traceModel], layout, {responsive: true});
        }

        // Update error decomposition chart
        function updateErrorDecompositionChart(errorData, irreducibleError) {
            const degrees = errorData.map((_, i) => i).slice(1);
            const biasSquared = errorData.map(d => d.biasSquared).slice(1);
            const variance = errorData.map(d => d.variance).slice(1);
            const totalError = errorData.map(d => d.totalError).slice(1);

            const traceBias = {
                x: degrees,
                y: biasSquared,
                name: 'Squared Bias',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#ff6b6b', width: 3 },
                marker: { size: 8 },
                hovertemplate: 'Degree %{x}<br>Squared Bias: %{y:.4f}<extra></extra>'
            };

            const traceVariance = {
                x: degrees,
                y: variance,
                name: 'Variance',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#4ecdc4', width: 3 },
                marker: { size: 8 },
                hovertemplate: 'Degree %{x}<br>Variance: %{y:.4f}<extra></extra>'
            };

            const traceIrreducible = {
                x: degrees,
                y: Array(degrees.length).fill(irreducibleError),
                name: 'Irreducible Error',
                type: 'scatter',
                mode: 'lines',
                line: { 
                    color: '#95a5a6', 
                    width: 2, 
                    dash: 'dot' 
                },
                hovertemplate: 'Irreducible Error: %{y:.4f}<extra></extra>'
            };

            const traceTotalError = {
                x: degrees,
                y: totalError,
                name: 'Total Error',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#45b7d1', width: 4 },
                marker: { size: 10 },
                hovertemplate: 'Degree %{x}<br>Total Error: %{y:.4f}<extra></extra>'
            };

            // Find optimal complexity
            let minError = Infinity;
            let minErrorIndex = -1;

            totalError.forEach((error, index) => {
                if (!isNaN(error) && error < minError) {
                    minError = error;
                    minErrorIndex = index;
                }
            });

            if (minErrorIndex !== -1) {
                const optimalDegree = degrees[minErrorIndex];
                const layout = {
                    title: {
                        text: 'Bias-Variance Decomposition',
                        font: { size: 16, color: '#2d3748' }
                    },
                    xaxis: { 
                        title: 'Polynomial Degree (Model Complexity)',
                        gridcolor: '#e2e8f0',
                        zerolinecolor: '#cbd5e0'
                    },
                    yaxis: { 
                        title: 'Error',
                        gridcolor: '#e2e8f0',
                        zerolinecolor: '#cbd5e0'
                    },
                    plot_bgcolor: '#f7fafc',
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    hovermode: 'x unified',
                    showlegend: true,
                    legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        bordercolor: '#e2e8f0',
                        borderwidth: 1
                    },
                    annotations: [{
                        x: optimalDegree,
                        y: totalError[minErrorIndex],
                        text: `Optimal<br>Degree: ${optimalDegree}`,
                        showarrow: true,
                        arrowhead: 2,
                        arrowcolor: '#e74c3c',
                        bgcolor: 'rgba(231, 76, 60, 0.1)',
                        bordercolor: '#e74c3c',
                        borderwidth: 1
                    }]
                };
                Plotly.newPlot('errorDecompositionChart', [traceBias, traceVariance, traceIrreducible, traceTotalError], layout, {responsive: true});
            } else {
                const layout = {
                    title: {
                        text: 'Bias-Variance Decomposition',
                        font: { size: 16, color: '#2d3748' }
                    },
                    xaxis: { 
                        title: 'Polynomial Degree (Model Complexity)',
                    },
                    yaxis: { 
                        title: 'Error',
                    },
                    annotations: [{
                        text: 'Could not compute errors for any complexity.',
                        x: 0.5,
                        y: 0.5,
                        xref: 'paper',
                        yref: 'paper',
                        showarrow: false
                    }]
                };
                Plotly.newPlot('errorDecompositionChart', [traceBias, traceVariance, traceIrreducible, traceTotalError], layout, {responsive: true});
            }
            
            // Update current error display
            updateCurrentErrorDisplay(errorData, currentParams.polynomialDegree, irreducibleError);
        }

        // Update current error display
        function updateCurrentErrorDisplay(errorData, currentDegree, irreducibleError) {
            const currentError = errorData[currentDegree] || { biasSquared: 0, variance: 0, totalError: 0 };
            document.getElementById('currentError').innerHTML = `
                <div style="margin-top: 8px;">
                    <div>Bias²: <strong>${currentError.biasSquared.toFixed(4)}</strong></div>
                    <div>Variance: <strong>${currentError.variance.toFixed(4)}</strong></div>
                    <div>Irreducible: <strong>${irreducibleError.toFixed(4)}</strong></div>
                    <div style="border-top: 1px solid #cbd5e0; margin-top: 5px; padding-top: 5px;">
                        Total: <strong>${currentError.totalError.toFixed(4)}</strong>
                    </div>
                </div>
            `;
        }

        // Main update function
        async function updateAllVisualizations() {
            if (isCalculating) return;
            isCalculating = true;

            const { polynomialDegree, noiseLevel, sampleSize, numSimulations } = currentParams;

            try {
                // Show loading state
                document.getElementById('currentError').innerHTML = '<div class="loading">Calculating...</div>';

                // Generate or reuse training data
                if (!currentData) {
                    currentData = generateData(sampleSize, noiseLevel);
                }
                const { X_train, y_train, X_test, y_test_true } = currentData;

                // Train single model for fitting example
                const singleModel = trainPolynomialModel(X_train, y_train, polynomialDegree);
                const singleModelPredictions = singleModel.predict(X_test);
                updateModelFittingPlot(X_train, y_train, X_test, y_test_true, singleModelPredictions, polynomialDegree);

                // Simulate errors for decomposition
                const { errorResults, irreducibleError } = await simulateErrorsAndDecompose(
                    numSimulations,
                    sampleSize,
                    noiseLevel,
                    15 // Max degree for decomposition chart
                );
                updateErrorDecompositionChart(errorResults, irreducibleError);

            } catch (error) {
                console.error('Error updating visualizations:', error);
                document.getElementById('currentError').innerHTML = '<div style="color: #e53e3e;">Error in calculation</div>';
            } finally {
                isCalculating = false;
            }
        }

        // Toggle education panel
        function toggleEducation() {
            const content = document.getElementById('educationContent');
            content.classList.toggle('show');
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize sliders
            const polySlider = document.getElementById('polyDegreeSlider');
            const polyValue = document.getElementById('polyDegreeValue');
            const noiseSlider = document.getElementById('noiseSlider');
            const noiseValue = document.getElementById('noiseValue');
            const sampleSlider = document.getElementById('sampleSizeSlider');
            const sampleValue = document.getElementById('sampleSizeValue');
            const generateBtn = document.getElementById('generateDataBtn');

            // Set initial values
            polySlider.value = currentParams.polynomialDegree;
            polyValue.textContent = currentParams.polynomialDegree;
            noiseSlider.value = currentParams.noiseLevel;
            noiseValue.textContent = currentParams.noiseLevel;
            sampleSlider.value = currentParams.sampleSize;
            sampleValue.textContent = currentParams.sampleSize;

            // Polynomial degree slider
            polySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                currentParams.polynomialDegree = value;
                polyValue.textContent = value;
                updateAllVisualizations();
            });

            // Noise level slider
            noiseSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                currentParams.noiseLevel = value;
                noiseValue.textContent = value;
                currentData = null; // Invalidate current data
                updateAllVisualizations();
            });

            // Sample size slider
            sampleSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                currentParams.sampleSize = value;
                sampleValue.textContent = value;
                currentData = null; // Invalidate current data
                updateAllVisualizations();
            });

            // Generate new data button
            generateBtn.addEventListener('click', () => {
                currentData = null; // Force new data generation
                updateAllVisualizations();
            });

            // Initial load
            updateAllVisualizations();
        });

        // Add some visual feedback for interactions
        document.addEventListener('DOMContentLoaded', () => {
            const sliders = document.querySelectorAll('.slider');
            sliders.forEach(slider => {
                slider.addEventListener('input', function() {
                    this.style.background = `linear-gradient(to right, #667eea 0%, #667eea ${((this.value - this.min) / (this.max - this.min)) * 100}%, #e2e8f0 ${((this.value - this.min) / (this.max - this.min)) * 100}%, #e2e8f0 100%)`;
                });
                
                // Initialize slider background
                const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.background = `linear-gradient(to right, #667eea 0%, #667eea ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
            });
        });