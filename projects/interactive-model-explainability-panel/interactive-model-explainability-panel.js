/**
 * Interactive Model Explainability Panel #5065
 * A comprehensive tool for explaining machine learning models
 */

class InteractiveModelExplainabilityPanel {
    constructor() {
        this.model = null;
        this.dataset = null;
        this.currentPrediction = null;
        this.shapValues = null;
        this.limeValues = null;
        this.settings = this.loadSettings();
        this.analytics = {
            totalPredictions: 0,
            modelComparisons: 0,
            explanationsGenerated: 0
        };

        this.init();
    }

    init() {
        this.initEventListeners();
        this.initCharts();
        this.loadSampleData();
        this.applySettings();
        this.updateUI();
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Feature importance
        document.getElementById('calculate-importance').addEventListener('click', () => {
            this.calculateFeatureImportance();
        });

        document.getElementById('export-importance').addEventListener('click', () => {
            this.exportFeatureImportance();
        });

        // Prediction explanation
        document.getElementById('make-prediction').addEventListener('click', () => {
            this.makePrediction();
        });

        document.getElementById('explain-prediction').addEventListener('click', () => {
            this.explainPrediction();
        });

        document.getElementById('clear-inputs').addEventListener('click', () => {
            this.clearPredictionInputs();
        });

        // Model comparison
        document.getElementById('compare-models').addEventListener('click', () => {
            this.compareModels();
        });

        // Partial dependence
        document.getElementById('generate-pdp').addEventListener('click', () => {
            this.generatePDP();
        });

        // SHAP analysis
        document.getElementById('run-shap').addEventListener('click', () => {
            this.runSHAPAnalysis();
        });

        // LIME analysis
        document.getElementById('run-lime').addEventListener('click', () => {
            this.runLIMEAnalysis();
        });

        // Data insights
        document.getElementById('generate-plot').addEventListener('click', () => {
            this.generateDataPlot();
        });

        // Settings
        this.initSettingsListeners();

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Modals
        document.getElementById('close-error-modal').addEventListener('click', () => {
            this.hideErrorModal();
        });
    }

    initSettingsListeners() {
        // Visualization settings
        document.getElementById('chart-theme').addEventListener('change', (e) => {
            this.settings.chartTheme = e.target.value;
            this.saveSettings();
            this.updateChartTheme();
        });

        document.getElementById('animation-duration').addEventListener('change', (e) => {
            this.settings.animationDuration = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('show-gridlines').addEventListener('change', (e) => {
            this.settings.showGridlines = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('show-legend').addEventListener('change', (e) => {
            this.settings.showLegend = e.target.checked;
            this.saveSettings();
        });

        // Analysis settings
        document.getElementById('default-shap-samples').addEventListener('change', (e) => {
            this.settings.defaultSHAPSamples = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('default-lime-samples').addEventListener('change', (e) => {
            this.settings.defaultLIMESamples = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('confidence-interval').addEventListener('change', (e) => {
            this.settings.confidenceInterval = parseInt(e.target.value);
            this.saveSettings();
        });

        // Data management
        document.getElementById('load-sample-data').addEventListener('click', () => {
            this.loadSampleData();
        });

        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('import-settings').addEventListener('click', () => {
            document.getElementById('settings-file').click();
        });

        document.getElementById('settings-file').addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                this.resetSettings();
            }
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    initCharts() {
        // Performance chart
        this.performanceChart = new Chart(document.getElementById('performance-chart'), {
            type: 'radar',
            data: {
                labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC'],
                datasets: [{
                    label: 'Model Performance',
                    data: [0.85, 0.82, 0.88, 0.85, 0.91],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: this.settings.showLegend
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1,
                        grid: {
                            display: this.settings.showGridlines
                        }
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });

        // Class distribution chart
        this.classDistributionChart = new Chart(document.getElementById('class-distribution-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Class 0', 'Class 1'],
                datasets: [{
                    data: [60, 40],
                    backgroundColor: ['#2563eb', '#10b981'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: this.settings.showLegend
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });

        // Feature importance chart
        this.importanceChart = new Chart(document.getElementById('importance-chart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Feature Importance',
                    data: [],
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: this.settings.showLegend
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: this.settings.showGridlines
                        }
                    },
                    x: {
                        grid: {
                            display: this.settings.showGridlines
                        }
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });

        // Comparison chart
        this.comparisonChart = new Chart(document.getElementById('comparison-bar-chart'), {
            type: 'bar',
            data: {
                labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
                datasets: []
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: this.settings.showLegend
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        grid: {
                            display: this.settings.showGridlines
                        }
                    },
                    x: {
                        grid: {
                            display: this.settings.showGridlines
                        }
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });
    }

    loadSampleData() {
        this.showLoading('Loading sample data...');

        // Generate synthetic dataset
        this.dataset = this.generateSampleDataset();

        // Create sample model
        this.model = this.createSampleModel();

        // Update UI
        this.updateDatasetInfo();
        this.updateModelInfo();
        this.updateFeatureInputs();
        this.updateFeatureSelectors();

        this.hideLoading();
        this.showNotification('Sample data loaded successfully!');
    }

    generateSampleDataset() {
        const features = [
            'age', 'income', 'credit_score', 'debt_ratio', 'employment_years',
            'home_ownership', 'education_level', 'marital_status', 'num_dependents'
        ];

        const samples = [];
        for (let i = 0; i < 1000; i++) {
            const sample = {};
            features.forEach(feature => {
                switch (feature) {
                    case 'age':
                        sample[feature] = Math.floor(Math.random() * 60) + 20;
                        break;
                    case 'income':
                        sample[feature] = Math.floor(Math.random() * 150000) + 25000;
                        break;
                    case 'credit_score':
                        sample[feature] = Math.floor(Math.random() * 400) + 300;
                        break;
                    case 'debt_ratio':
                        sample[feature] = Math.random() * 0.8;
                        break;
                    case 'employment_years':
                        sample[feature] = Math.floor(Math.random() * 40);
                        break;
                    case 'home_ownership':
                        sample[feature] = Math.random() > 0.5 ? 1 : 0;
                        break;
                    case 'education_level':
                        sample[feature] = Math.floor(Math.random() * 4);
                        break;
                    case 'marital_status':
                        sample[feature] = Math.random() > 0.5 ? 1 : 0;
                        break;
                    case 'num_dependents':
                        sample[feature] = Math.floor(Math.random() * 5);
                        break;
                }
            });
            // Generate target (loan approval)
            sample.target = this.generateTarget(sample);
            samples.push(sample);
        }

        return { features, samples };
    }

    generateTarget(sample) {
        // Simple rule-based target generation
        let score = 0;
        score += sample.credit_score > 650 ? 1 : 0;
        score += sample.income > 50000 ? 1 : 0;
        score += sample.debt_ratio < 0.4 ? 1 : 0;
        score += sample.employment_years > 2 ? 1 : 0;
        score += sample.age > 25 && sample.age < 65 ? 1 : 0;

        return Math.random() < (score / 5) ? 1 : 0;
    }

    createSampleModel() {
        // Simulate a trained model with feature importances
        return {
            type: 'Random Forest',
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.88,
            f1Score: 0.85,
            auc: 0.91,
            featureImportance: {
                'credit_score': 0.35,
                'income': 0.25,
                'debt_ratio': 0.15,
                'employment_years': 0.12,
                'age': 0.08,
                'home_ownership': 0.03,
                'education_level': 0.01,
                'marital_status': 0.005,
                'num_dependents': 0.005
            },
            predict: (features) => this.simulatePrediction(features)
        };
    }

    simulatePrediction(features) {
        // Simple prediction simulation
        let score = 0;
        score += features.credit_score * 0.004;
        score += features.income * 0.000002;
        score -= features.debt_ratio * 2;
        score += features.employment_years * 0.02;
        score += (features.age - 20) * 0.005;

        const probability = 1 / (1 + Math.exp(-score));
        return {
            prediction: probability > 0.5 ? 1 : 0,
            probability: probability,
            confidence: Math.abs(probability - 0.5) * 2
        };
    }

    updateDatasetInfo() {
        if (!this.dataset) return;

        const classCounts = this.dataset.samples.reduce((acc, sample) => {
            acc[sample.target] = (acc[sample.target] || 0) + 1;
            return acc;
        }, {});

        document.getElementById('total-samples').textContent = this.dataset.samples.length;
        document.getElementById('feature-count').textContent = this.dataset.features.length;
        document.getElementById('class-count').textContent = Object.keys(classCounts).length;
        document.getElementById('missing-values').textContent = '0'; // Sample data has no missing values

        const balance = Math.min(...Object.values(classCounts)) / Math.max(...Object.values(classCounts));
        document.getElementById('data-balance').textContent = balance > 0.8 ? 'Balanced' : 'Imbalanced';

        // Update class distribution chart
        this.classDistributionChart.data.labels = Object.keys(classCounts).map(k => `Class ${k}`);
        this.classDistributionChart.data.datasets[0].data = Object.values(classCounts);
        this.classDistributionChart.update();
    }

    updateModelInfo() {
        if (!this.model) return;

        document.getElementById('model-type').textContent = this.model.type;
        document.getElementById('training-samples').textContent = this.dataset.samples.length;
        document.getElementById('accuracy').textContent = (this.model.accuracy * 100).toFixed(2) + '%';
        document.getElementById('precision').textContent = (this.model.precision * 100).toFixed(2) + '%';
        document.getElementById('recall').textContent = (this.model.recall * 100).toFixed(2) + '%';
        document.getElementById('f1-score').textContent = (this.model.f1Score * 100).toFixed(2) + '%';
        document.getElementById('last-trained').textContent = new Date().toLocaleDateString();

        // Update performance chart
        this.performanceChart.data.datasets[0].data = [
            this.model.accuracy,
            this.model.precision,
            this.model.recall,
            this.model.f1Score,
            this.model.auc
        ];
        this.performanceChart.update();
    }

    updateFeatureInputs() {
        const container = document.getElementById('feature-inputs');
        const limeContainer = document.getElementById('lime-feature-inputs');
        container.innerHTML = '';
        limeContainer.innerHTML = '';

        this.dataset.features.forEach(feature => {
            // Regular prediction inputs
            const inputDiv = document.createElement('div');
            inputDiv.className = 'feature-input';

            const label = document.createElement('label');
            label.textContent = feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

            const input = document.createElement('input');
            input.type = 'number';
            input.id = `feature-${feature}`;
            input.step = 'any';

            // Set default values based on feature type
            switch (feature) {
                case 'age':
                    input.value = 35;
                    break;
                case 'income':
                    input.value = 75000;
                    break;
                case 'credit_score':
                    input.value = 650;
                    break;
                case 'debt_ratio':
                    input.value = 0.3;
                    input.step = '0.01';
                    break;
                case 'employment_years':
                    input.value = 10;
                    break;
                default:
                    input.value = 1;
            }

            inputDiv.appendChild(label);
            inputDiv.appendChild(input);
            container.appendChild(inputDiv);

            // LIME inputs (copy)
            const limeInputDiv = inputDiv.cloneNode(true);
            limeInputDiv.querySelector('input').id = `lime-feature-${feature}`;
            limeContainer.appendChild(limeInputDiv);
        });
    }

    updateFeatureSelectors() {
        const selectors = ['pdp-feature', 'data-feature-x', 'data-feature-y', 'data-feature-color'];
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            select.innerHTML = '';
            this.dataset.features.forEach(feature => {
                const option = document.createElement('option');
                option.value = feature;
                option.textContent = feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                select.appendChild(option);
            });
        });
    }

    calculateFeatureImportance() {
        this.showLoading('Calculating feature importance...');

        setTimeout(() => {
            const method = document.getElementById('importance-method').value;
            const importance = this.model.featureImportance;

            // Sort features by importance
            const sortedFeatures = Object.entries(importance)
                .sort(([,a], [,b]) => b - a);

            // Update chart
            this.importanceChart.data.labels = sortedFeatures.map(([feature]) =>
                feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            );
            this.importanceChart.data.datasets[0].data = sortedFeatures.map(([, value]) => value);
            this.importanceChart.update();

            // Update feature list
            const list = document.getElementById('feature-list');
            list.innerHTML = '';
            sortedFeatures.forEach(([feature, importance], index) => {
                const item = document.createElement('div');
                item.className = 'feature-item';
                item.innerHTML = `
                    <span class="feature-name">${index + 1}. ${feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span class="feature-importance">${(importance * 100).toFixed(2)}%</span>
                `;
                list.appendChild(item);
            });

            this.hideLoading();
            this.showNotification('Feature importance calculated!');
        }, 1000);
    }

    exportFeatureImportance() {
        const importance = this.model.featureImportance;
        const csv = 'Feature,Importance\n' +
            Object.entries(importance)
                .map(([feature, value]) => `${feature},${value}`)
                .join('\n');

        this.downloadFile(csv, 'feature-importance.csv', 'text/csv');
    }

    makePrediction() {
        const features = {};
        this.dataset.features.forEach(feature => {
            const input = document.getElementById(`feature-${feature}`);
            features[feature] = parseFloat(input.value) || 0;
        });

        const result = this.model.predict(features);
        this.currentPrediction = { features, result };

        document.getElementById('predicted-class').textContent = result.prediction;
        document.getElementById('prediction-confidence').textContent = (result.confidence * 100).toFixed(2) + '%';

        this.analytics.totalPredictions++;
        this.showNotification('Prediction made successfully!');
    }

    explainPrediction() {
        if (!this.currentPrediction) {
            this.showError('Please make a prediction first!');
            return;
        }

        this.showLoading('Generating explanation...');

        setTimeout(() => {
            // Generate SHAP-like explanation
            const explanation = this.generateSHAPExplanation(this.currentPrediction);

            // Create explanation chart
            this.createExplanationChart(explanation);

            this.analytics.explanationsGenerated++;
            this.hideLoading();
            this.showNotification('Explanation generated!');
        }, 1500);
    }

    generateSHAPExplanation(prediction) {
        const explanation = [];
        const baseValue = 0.5; // Base prediction probability

        Object.entries(this.model.featureImportance).forEach(([feature, importance]) => {
            const featureValue = prediction.features[feature];
            const shapValue = (featureValue - this.getFeatureMean(feature)) * importance * 2;
            explanation.push({
                feature: feature,
                value: featureValue,
                shapValue: shapValue,
                importance: importance
            });
        });

        return explanation.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
    }

    getFeatureMean(feature) {
        const values = this.dataset.samples.map(s => s[feature]);
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    createExplanationChart(explanation) {
        const ctx = document.getElementById('explanation-chart');
        ctx.innerHTML = '';

        const topFeatures = explanation.slice(0, 10);
        const labels = topFeatures.map(item => item.feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const values = topFeatures.map(item => item.shapValue);

        new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'SHAP Value',
                    data: values,
                    backgroundColor: values.map(v => v > 0 ? '#10b981' : '#ef4444'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: this.settings.showGridlines
                        }
                    },
                    y: {
                        grid: {
                            display: this.settings.showGridlines
                        }
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });
    }

    clearPredictionInputs() {
        this.dataset.features.forEach(feature => {
            const input = document.getElementById(`feature-${feature}`);
            input.value = '';
        });
        this.currentPrediction = null;
        document.getElementById('predicted-class').textContent = '-';
        document.getElementById('prediction-confidence').textContent = '0.00%';
    }

    compareModels() {
        const selectedModels = Array.from(document.querySelectorAll('#model-checkboxes input:checked'))
            .map(cb => cb.value);

        if (selectedModels.length === 0) {
            this.showError('Please select at least one model to compare!');
            return;
        }

        this.showLoading('Comparing models...');

        setTimeout(() => {
            const results = this.generateModelComparison(selectedModels);
            this.displayModelComparison(results);
            this.analytics.modelComparisons++;
            this.hideLoading();
            this.showNotification('Model comparison completed!');
        }, 2000);
    }

    generateModelComparison(models) {
        const results = {};
        models.forEach(model => {
            results[model] = {
                accuracy: Math.random() * 0.3 + 0.7, // 0.7-1.0
                precision: Math.random() * 0.3 + 0.7,
                recall: Math.random() * 0.3 + 0.7,
                f1Score: Math.random() * 0.3 + 0.7,
                trainingTime: Math.random() * 300 + 10 // 10-310 seconds
            };
        });
        return results;
    }

    displayModelComparison(results) {
        const tableBody = document.getElementById('comparison-body');
        tableBody.innerHTML = '';

        const models = Object.keys(results);
        models.forEach(model => {
            const result = results[model];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${model.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>${(result.accuracy * 100).toFixed(2)}%</td>
                <td>${(result.precision * 100).toFixed(2)}%</td>
                <td>${(result.recall * 100).toFixed(2)}%</td>
                <td>${(result.f1Score * 100).toFixed(2)}%</td>
                <td>${result.trainingTime.toFixed(1)}s</td>
            `;
            tableBody.appendChild(row);
        });

        // Update comparison chart
        this.comparisonChart.data.labels = ['Accuracy', 'Precision', 'Recall', 'F1-Score'];
        this.comparisonChart.data.datasets = models.map((model, index) => {
            const result = results[model];
            return {
                label: model.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                data: [result.accuracy, result.precision, result.recall, result.f1Score],
                backgroundColor: `hsl(${index * 360 / models.length}, 70%, 60%)`,
                borderWidth: 1
            };
        });
        this.comparisonChart.update();
    }

    generatePDP() {
        const feature = document.getElementById('pdp-feature').value;
        const showICE = document.getElementById('pdp-ice').checked;
        const showConfidence = document.getElementById('pdp-confidence').checked;

        this.showLoading('Generating Partial Dependence Plot...');

        setTimeout(() => {
            this.createPDP(feature, showICE, showConfidence);
            this.hideLoading();
            this.showNotification('PDP generated successfully!');
        }, 1500);
    }

    createPDP(feature, showICE, showConfidence) {
        const plotDiv = document.getElementById('pdp-plot');

        // Generate sample PDP data
        const xValues = [];
        const yValues = [];
        const iceCurves = showICE ? [] : null;

        const featureStats = this.getFeatureStats(feature);
        for (let i = 0; i <= 100; i++) {
            const x = featureStats.min + (featureStats.max - featureStats.min) * (i / 100);
            xValues.push(x);
            yValues.push(this.calculatePDPValue(feature, x));
        }

        if (showICE) {
            for (let i = 0; i < 10; i++) {
                const curve = [];
                for (let j = 0; j <= 100; j++) {
                    const x = featureStats.min + (featureStats.max - featureStats.min) * (j / 100);
                    curve.push(this.calculatePDPValue(feature, x) + (Math.random() - 0.5) * 0.1);
                }
                iceCurves.push(curve);
            }
        }

        const data = [{
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines',
            name: 'Partial Dependence',
            line: { color: '#2563eb', width: 3 }
        }];

        if (iceCurves) {
            iceCurves.forEach((curve, index) => {
                data.push({
                    x: xValues,
                    y: curve,
                    type: 'scatter',
                    mode: 'lines',
                    name: `ICE ${index + 1}`,
                    line: { color: `rgba(100, 100, 100, ${0.3})`, width: 1 },
                    showlegend: false
                });
            });
        }

        const layout = {
            title: `Partial Dependence Plot for ${feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            xaxis: { title: feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            yaxis: { title: 'Predicted Probability' },
            showlegend: true
        };

        Plotly.newPlot(plotDiv, data, layout);
    }

    getFeatureStats(feature) {
        const values = this.dataset.samples.map(s => s[feature]);
        return {
            min: Math.min(...values),
            max: Math.max(...values),
            mean: values.reduce((a, b) => a + b, 0) / values.length
        };
    }

    calculatePDPValue(feature, value) {
        // Simulate PDP calculation
        const baseProb = 0.5;
        const importance = this.model.featureImportance[feature] || 0.1;
        const deviation = (value - this.getFeatureStats(feature).mean) / this.getFeatureStats(feature).max;
        return Math.max(0, Math.min(1, baseProb + deviation * importance));
    }

    runSHAPAnalysis() {
        const method = document.getElementById('shap-method-select').value;
        const samples = parseInt(document.getElementById('shap-samples').value);

        this.showLoading('Running SHAP analysis...');

        setTimeout(() => {
            this.shapValues = this.generateSHAPValues(samples);
            this.createSHAPPlots();
            this.hideLoading();
            this.showNotification('SHAP analysis completed!');
        }, 2000);
    }

    generateSHAPValues(samples) {
        const shapValues = [];
        for (let i = 0; i < samples; i++) {
            const sample = {};
            this.dataset.features.forEach(feature => {
                const stats = this.getFeatureStats(feature);
                sample[feature] = stats.min + Math.random() * (stats.max - stats.min);
            });
            sample.shapValues = this.generateSHAPExplanation({ features: sample });
            shapValues.push(sample);
        }
        return shapValues;
    }

    createSHAPPlots() {
        // SHAP Summary Plot
        const summaryDiv = document.getElementById('shap-summary-plot');
        const summaryData = this.generateSHAPSummaryData();

        const summaryPlotData = [{
            type: 'heatmap',
            x: summaryData.features,
            y: summaryData.samples.map((_, i) => `Sample ${i + 1}`),
            z: summaryData.values,
            colorscale: 'RdBu',
            showscale: true
        }];

        const summaryLayout = {
            title: 'SHAP Summary Plot',
            xaxis: { title: 'Features' },
            yaxis: { title: 'Samples' }
        };

        Plotly.newPlot(summaryDiv, summaryPlotData, summaryLayout);

        // SHAP Waterfall Plot (for first sample)
        const waterfallDiv = document.getElementById('shap-waterfall-plot');
        const waterfallData = this.generateSHAPWaterfallData();

        const waterfallPlotData = [{
            type: 'waterfall',
            x: waterfallData.features,
            y: waterfallData.values,
            measure: waterfallData.measure,
            name: 'SHAP Values'
        }];

        const waterfallLayout = {
            title: 'SHAP Waterfall Plot',
            showlegend: false
        };

        Plotly.newPlot(waterfallDiv, waterfallPlotData, waterfallLayout);
    }

    generateSHAPSummaryData() {
        const features = this.dataset.features.slice(0, 10);
        const samples = this.shapValues.slice(0, 20);
        const values = samples.map(sample =>
            features.map(feature =>
                sample.shapValues.find(s => s.feature === feature)?.shapValue || 0
            )
        );

        return { features, samples, values };
    }

    generateSHAPWaterfallData() {
        const sample = this.shapValues[0];
        const features = ['Base Value', ...sample.shapValues.slice(0, 8).map(s => s.feature), 'Final Prediction'];
        const values = [0.5];

        sample.shapValues.slice(0, 8).forEach(shap => {
            values.push(shap.shapValue);
        });

        const cumulative = values.reduce((acc, val, i) => {
            acc.push(acc[i - 1] + val);
            return acc;
        }, [0.5]);

        return {
            features: features,
            values: values,
            measure: ['absolute', ...Array(8).fill('relative'), 'total']
        };
    }

    runLIMEAnalysis() {
        const samples = parseInt(document.getElementById('lime-samples').value);
        const features = parseInt(document.getElementById('lime-features').value);

        // Get input instance
        const instance = {};
        this.dataset.features.forEach(feature => {
            const input = document.getElementById(`lime-feature-${feature}`);
            instance[feature] = parseFloat(input.value) || 0;
        });

        this.showLoading('Running LIME analysis...');

        setTimeout(() => {
            this.limeValues = this.generateLIMEValues(instance, samples, features);
            this.createLIMEPlots();
            this.hideLoading();
            this.showNotification('LIME analysis completed!');
        }, 2000);
    }

    generateLIMEValues(instance, samples, numFeatures) {
        const limeValues = [];
        const features = Object.keys(instance);

        for (let i = 0; i < samples; i++) {
            const perturbedInstance = { ...instance };
            const changedFeatures = [];

            // Randomly perturb some features
            features.forEach(feature => {
                if (Math.random() < 0.3) { // 30% chance to perturb
                    const stats = this.getFeatureStats(feature);
                    perturbedInstance[feature] = stats.min + Math.random() * (stats.max - stats.min);
                    changedFeatures.push(feature);
                }
            });

            const prediction = this.model.predict(perturbedInstance);
            limeValues.push({
                instance: perturbedInstance,
                prediction: prediction.probability,
                changedFeatures: changedFeatures
            });
        }

        return limeValues;
    }

    createLIMEPlots() {
        const chartDiv = document.getElementById('lime-chart');
        const detailsDiv = document.getElementById('lime-details');

        // Create LIME explanation chart
        const topFeatures = this.getTopLIMEFeatures(10);
        const labels = topFeatures.map(f => f.feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const values = topFeatures.map(f => f.weight);

        new Chart(chartDiv, {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'LIME Weight',
                    data: values,
                    backgroundColor: values.map(v => v > 0 ? '#10b981' : '#ef4444'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: this.settings.showGridlines
                        }
                    },
                    y: {
                        grid: {
                            display: this.settings.showGridlines
                        }
                    }
                },
                animation: {
                    duration: this.settings.animationDuration
                }
            }
        });

        // Create explanation details
        detailsDiv.innerHTML = topFeatures.map(feature => `
            <div class="lime-detail-item">
                <strong>${feature.feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                ${feature.weight > 0 ? '+' : ''}${feature.weight.toFixed(4)}
                (supports ${feature.weight > 0 ? 'positive' : 'negative'} class)
            </div>
        `).join('');
    }

    getTopLIMEFeatures(limit) {
        // Simplified LIME feature importance calculation
        const featureWeights = {};
        this.dataset.features.forEach(feature => {
            featureWeights[feature] = (Math.random() - 0.5) * 2; // Random weights for demo
        });

        return Object.entries(featureWeights)
            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
            .slice(0, limit)
            .map(([feature, weight]) => ({ feature, weight }));
    }

    generateDataPlot() {
        const xFeature = document.getElementById('data-feature-x').value;
        const yFeature = document.getElementById('data-feature-y').value;
        const colorFeature = document.getElementById('data-color-feature').value;
        const plotType = document.getElementById('plot-type').value;

        this.showLoading('Generating data plot...');

        setTimeout(() => {
            this.createDataPlot(xFeature, yFeature, colorFeature, plotType);
            this.updateDataStatistics(xFeature, yFeature);
            this.hideLoading();
            this.showNotification('Data plot generated!');
        }, 1000);
    }

    createDataPlot(xFeature, yFeature, colorFeature, plotType) {
        const plotDiv = document.getElementById('data-plot');
        const samples = this.dataset.samples.slice(0, 500); // Limit for performance

        let data = [];
        const xValues = samples.map(s => s[xFeature]);
        const yValues = samples.map(s => s[yFeature]);

        switch (plotType) {
            case 'scatter':
                data = [{
                    x: xValues,
                    y: yValues,
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                        color: samples.map(s => s[colorFeature]),
                        colorscale: 'Viridis',
                        showscale: true
                    },
                    name: 'Data Points'
                }];
                break;

            case 'histogram':
                data = [{
                    x: xValues,
                    type: 'histogram',
                    name: xFeature
                }];
                break;

            case 'boxplot':
                data = [{
                    y: yValues,
                    type: 'box',
                    name: yFeature
                }];
                break;

            case 'correlation':
                const correlationData = this.calculateCorrelationMatrix();
                data = [{
                    z: correlationData.matrix,
                    x: correlationData.features,
                    y: correlationData.features,
                    type: 'heatmap',
                    colorscale: 'RdBu',
                    showscale: true
                }];
                break;
        }

        const layout = {
            title: `${plotType.charAt(0).toUpperCase() + plotType.slice(1)} Plot`,
            xaxis: { title: xFeature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            yaxis: { title: yFeature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            showlegend: false
        };

        Plotly.newPlot(plotDiv, data, layout);
    }

    calculateCorrelationMatrix() {
        const features = this.dataset.features.slice(0, 10);
        const matrix = [];

        features.forEach(feature1 => {
            const row = [];
            features.forEach(feature2 => {
                const correlation = this.calculateCorrelation(feature1, feature2);
                row.push(correlation);
            });
            matrix.push(row);
        });

        return { features, matrix };
    }

    calculateCorrelation(feature1, feature2) {
        const values1 = this.dataset.samples.map(s => s[feature1]);
        const values2 = this.dataset.samples.map(s => s[feature2]);

        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

        const covariance = values1.reduce((acc, val1, i) =>
            acc + (val1 - mean1) * (values2[i] - mean2), 0) / values1.length;

        const std1 = Math.sqrt(values1.reduce((acc, val) =>
            acc + Math.pow(val - mean1, 2), 0) / values1.length);
        const std2 = Math.sqrt(values2.reduce((acc, val) =>
            acc + Math.pow(val - mean2, 2), 0) / values2.length);

        return covariance / (std1 * std2);
    }

    updateDataStatistics(xFeature, yFeature) {
        const statsGrid = document.getElementById('data-statistics-grid');
        statsGrid.innerHTML = '';

        [xFeature, yFeature].forEach(feature => {
            const values = this.dataset.samples.map(s => s[feature]);
            const stats = this.calculateBasicStats(values);

            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div class="stat-value">Mean: ${stats.mean.toFixed(2)}</div>
                <div class="stat-value">Std: ${stats.std.toFixed(2)}</div>
                <div class="stat-value">Min: ${stats.min.toFixed(2)}</div>
                <div class="stat-value">Max: ${stats.max.toFixed(2)}</div>
            `;
            statsGrid.appendChild(statItem);
        });
    }

    calculateBasicStats(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);

        return {
            mean: mean,
            std: std,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    // Utility methods
    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('theme-toggle').textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';
        this.updateChartTheme();
    }

    updateChartTheme() {
        const isDark = this.settings.theme === 'dark';
        Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
        Chart.defaults.borderColor = isDark ? '#334155' : '#e2e8f0';

        // Re-render all charts with new theme
        if (this.performanceChart) this.performanceChart.update();
        if (this.classDistributionChart) this.classDistributionChart.update();
        if (this.importanceChart) this.importanceChart.update();
        if (this.comparisonChart) this.comparisonChart.update();
    }

    applySettings() {
        this.applyTheme();

        // Apply settings to form elements
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    showLoading(message = 'Processing...') {
        document.getElementById('loading-text').textContent = message;
        document.getElementById('loading-modal').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-modal').classList.remove('active');
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').classList.add('active');
    }

    hideErrorModal() {
        document.getElementById('error-modal').classList.remove('active');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    exportData() {
        const data = {
            dataset: this.dataset,
            model: this.model,
            settings: this.settings,
            analytics: this.analytics,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadFile(JSON.stringify(data, null, 2), 'model-explainability-data.json', 'application/json');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.dataset) this.dataset = data.dataset;
                if (data.model) this.model = data.model;
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.applySettings();
                }
                this.updateUI();
                this.showNotification('Data imported successfully!');
            } catch (error) {
                this.showError('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateUI() {
        this.updateDatasetInfo();
        this.updateModelInfo();
        this.updateFeatureInputs();
        this.updateFeatureSelectors();
    }

    // Settings persistence
    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            chartTheme: 'light',
            animationDuration: 1000,
            showGridlines: true,
            showLegend: true,
            defaultSHAPSamples: 100,
            defaultLIMESamples: 1000,
            confidenceInterval: 95
        };

        try {
            const saved = localStorage.getItem('explainability-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    saveSettings() {
        localStorage.setItem('explainability-settings', JSON.stringify(this.settings));
    }

    resetSettings() {
        localStorage.removeItem('explainability-settings');
        this.settings = this.loadSettings();
        this.applySettings();
    }

    exportSettings() {
        const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
        this.downloadFile(JSON.stringify(this.settings, null, 2), 'explainability-settings.json', 'application/json');
    }

    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.settings = { ...this.settings, ...imported };
                this.saveSettings();
                this.applySettings();
                this.showNotification('Settings imported successfully!');
            } catch (error) {
                this.showError('Error importing settings: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        localStorage.clear();
        this.dataset = null;
        this.model = null;
        this.currentPrediction = null;
        this.shapValues = null;
        this.limeValues = null;
        this.analytics = {
            totalPredictions: 0,
            modelComparisons: 0,
            explanationsGenerated: 0
        };
        this.settings = this.loadSettings();
        this.applySettings();
        this.updateUI();
        this.showNotification('All data cleared!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.explainabilityPanel = new InteractiveModelExplainabilityPanel();
});