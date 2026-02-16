// Nutrient Deficiency Risk Scanner JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();

    const form = document.getElementById('dietForm');
    form.addEventListener('submit', handleFormSubmit);

    // Chart view controls
    document.getElementById('viewAll').addEventListener('click', () => switchChartView('all'));
    document.getElementById('viewHighRisk').addEventListener('click', () => switchChartView('highRisk'));
});

let riskChart = null;
let currentChartView = 'all';

// Nutrient deficiency risk assessment data
const nutrientRiskFactors = {
    vitaminA: {
        name: 'Vitamin A',
        sources: ['leafyGreens', 'citrus', 'fish'],
        riskWeights: {
            leafyGreens: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            citrus: { daily: 0, weekly: 1, monthly: 2, rarely: 4 },
            fish: { weekly: 0, monthly: 2, rarely: 4 }
        },
        deficiencySigns: ['Night blindness', 'Dry skin', 'Weakened immunity'],
        recommendations: ['Eat more leafy greens', 'Include fatty fish weekly', 'Consider beta-carotene rich foods']
    },
    vitaminC: {
        name: 'Vitamin C',
        sources: ['citrus', 'berries', 'cruciferous'],
        riskWeights: {
            citrus: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            berries: { daily: 0, weekly: 1, monthly: 2, rarely: 4 },
            cruciferous: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Frequent colds', 'Slow wound healing', 'Fatigue'],
        recommendations: ['Eat citrus fruits daily', 'Include berries regularly', 'Add cruciferous vegetables']
    },
    vitaminD: {
        name: 'Vitamin D',
        sources: ['fish', 'fortified', 'dairy'],
        riskWeights: {
            fish: { weekly: 0, monthly: 2, rarely: 4 },
            fortified: { daily: 0, weekly: 1, monthly: 2, rarely: 3 },
            dairy: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Bone pain', 'Muscle weakness', 'Increased infection risk'],
        recommendations: ['Eat fatty fish weekly', 'Choose fortified foods', 'Consider sunlight exposure']
    },
    vitaminB12: {
        name: 'Vitamin B12',
        sources: ['redMeat', 'fish', 'eggs', 'dairy'],
        riskWeights: {
            redMeat: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            fish: { weekly: 0, monthly: 2, rarely: 4 },
            eggs: { daily: 0, weekly: 1, monthly: 2, rarely: 3 },
            dairy: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Fatigue', 'Tingling in hands/feet', 'Memory problems'],
        recommendations: ['Include animal products', 'Consider fortified plant foods', 'Supplementation may be needed']
    },
    iron: {
        name: 'Iron',
        sources: ['redMeat', 'leafyGreens', 'legumes'],
        riskWeights: {
            redMeat: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            leafyGreens: { daily: 0, weekly: 1, monthly: 2, rarely: 4 },
            legumes: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Fatigue', 'Pale skin', 'Shortness of breath'],
        recommendations: ['Eat red meat regularly', 'Pair iron-rich foods with vitamin C', 'Consider iron-rich plant foods']
    },
    calcium: {
        name: 'Calcium',
        sources: ['dairy', 'leafyGreens', 'fortified'],
        riskWeights: {
            dairy: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            leafyGreens: { daily: 0, weekly: 1, monthly: 2, rarely: 4 },
            fortified: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Muscle cramps', 'Brittle nails', 'Bone pain'],
        recommendations: ['Include dairy products', 'Eat leafy greens', 'Choose fortified foods']
    },
    iodine: {
        name: 'Iodine',
        sources: ['fish', 'dairy'],
        riskWeights: {
            fish: { weekly: 0, monthly: 2, rarely: 4 },
            dairy: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Thyroid issues', 'Goiter', 'Fatigue'],
        recommendations: ['Eat seafood regularly', 'Use iodized salt', 'Include dairy products']
    },
    zinc: {
        name: 'Zinc',
        sources: ['redMeat', 'legumes', 'nuts'],
        riskWeights: {
            redMeat: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            legumes: { daily: 0, weekly: 1, monthly: 2, rarely: 3 },
            nuts: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Weakened immunity', 'Hair loss', 'Slow wound healing'],
        recommendations: ['Include red meat', 'Eat legumes and nuts', 'Consider zinc-rich foods']
    },
    folate: {
        name: 'Folate',
        sources: ['leafyGreens', 'legumes', 'citrus'],
        riskWeights: {
            leafyGreens: { daily: 0, weekly: 1, monthly: 3, rarely: 5 },
            legumes: { daily: 0, weekly: 1, monthly: 2, rarely: 4 },
            citrus: { daily: 0, weekly: 1, monthly: 2, rarely: 3 }
        },
        deficiencySigns: ['Fatigue', 'Mouth sores', 'Neural tube defects risk'],
        recommendations: ['Eat leafy greens daily', 'Include legumes', 'Eat citrus fruits']
    }
};

function handleFormSubmit(e) {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(e.target);
    const responses = {};
    for (let [key, value] of formData.entries()) {
        responses[key] = value;
    }

    // Calculate nutrient deficiency risks
    const riskAssessment = calculateNutrientRisks(responses);

    // Display results
    displayResults(riskAssessment);

    // Update chart
    updateChart(riskAssessment.nutrientRisks);

    // Save assessment
    saveAssessment(riskAssessment);

    // Update history
    updateHistoryTable();

    showNotification('Nutrient risk assessment completed!', 'success');
}

function calculateNutrientRisks(responses) {
    const nutrientRisks = {};
    let totalRiskScore = 0;

    // Calculate risk for each nutrient
    Object.keys(nutrientRiskFactors).forEach(nutrientKey => {
        const nutrient = nutrientRiskFactors[nutrientKey];
        let riskScore = 0;
        let riskFactors = [];

        // Calculate risk based on food frequency responses
        nutrient.sources.forEach(source => {
            if (responses[source] && nutrient.riskWeights[source]) {
                const frequency = responses[source];
                const weight = nutrient.riskWeights[source][frequency] || 0;
                riskScore += weight;

                if (weight >= 3) {
                    riskFactors.push(`${source} consumption is ${frequency}`);
                }
            }
        });

        // Adjust for lifestyle factors
        if (responses.alcohol === 'heavy') {
            riskScore += 1; // Alcohol can affect nutrient absorption
        }
        if (responses.coffee === 'heavy') {
            riskScore += 1; // Caffeine can affect iron absorption
        }
        if (responses.medications === 'absorption') {
            riskScore += 2; // Medications can affect nutrient absorption
        }

        // Normalize risk score (0-10 scale)
        riskScore = Math.min(10, Math.max(0, riskScore));

        nutrientRisks[nutrientKey] = {
            name: nutrient.name,
            riskScore: riskScore,
            riskLevel: getRiskLevel(riskScore),
            riskFactors: riskFactors,
            deficiencySigns: nutrient.deficiencySigns,
            recommendations: nutrient.recommendations
        };

        totalRiskScore += riskScore;
    });

    // Calculate overall risk
    const averageRisk = totalRiskScore / Object.keys(nutrientRisks).length;
    const overallRiskLevel = getOverallRiskLevel(averageRisk);

    return {
        timestamp: new Date().toISOString(),
        responses: responses,
        nutrientRisks: nutrientRisks,
        overallRiskScore: Math.round(averageRisk * 10) / 10,
        overallRiskLevel: overallRiskLevel,
        highRiskNutrients: Object.keys(nutrientRisks).filter(key =>
            nutrientRisks[key].riskLevel === 'High'
        ).map(key => nutrientRisks[key].name)
    };
}

function getRiskLevel(score) {
    if (score <= 2) return 'Low';
    if (score <= 5) return 'Moderate';
    if (score <= 8) return 'High';
    return 'Very High';
}

function getOverallRiskLevel(averageScore) {
    if (averageScore <= 2) return 'Low Risk';
    if (averageScore <= 4) return 'Moderate Risk';
    if (averageScore <= 6) return 'High Risk';
    return 'Very High Risk';
}

function displayResults(assessment) {
    document.getElementById('resultsDisplay').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';

    // Update overall risk
    document.getElementById('overallScore').textContent = assessment.overallRiskScore;
    document.getElementById('overallRiskLevel').textContent = assessment.overallRiskLevel;

    // Update risk level styling
    const riskLevelElement = document.getElementById('overallRiskLevel');
    riskLevelElement.className = 'risk-level';
    riskLevelElement.classList.add(`risk-${assessment.overallRiskLevel.toLowerCase().replace(' ', '-')}`);

    // Display nutrient risks
    const risksList = document.getElementById('nutrientRisksList');
    risksList.innerHTML = '';

    Object.values(assessment.nutrientRisks).forEach(nutrient => {
        const riskItem = document.createElement('div');
        riskItem.className = 'nutrient-risk-item';
        riskItem.innerHTML = `
            <div class="nutrient-header">
                <span class="nutrient-name">${nutrient.name}</span>
                <span class="risk-badge risk-${nutrient.riskLevel.toLowerCase()}">${nutrient.riskLevel}</span>
            </div>
            <div class="risk-details">
                <div class="risk-score">Risk Score: ${nutrient.riskScore}/10</div>
                ${nutrient.riskFactors.length > 0 ?
                    `<div class="risk-factors">Contributing factors: ${nutrient.riskFactors.join(', ')}</div>` : ''}
                <div class="deficiency-signs">Potential signs: ${nutrient.deficiencySigns.join(', ')}</div>
            </div>
        `;
        risksList.appendChild(riskItem);
    });

    // Generate insights
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '';

    const highRiskNutrients = Object.values(assessment.nutrientRisks)
        .filter(n => n.riskLevel === 'High' || n.riskLevel === 'Very High');

    if (highRiskNutrients.length > 0) {
        const insight = document.createElement('div');
        insight.className = 'insight-item warning';
        insight.innerHTML = `
            <strong>High Risk Nutrients:</strong> ${highRiskNutrients.map(n => n.name).join(', ')}.
            Focus on improving intake of these nutrients through diet or consider professional guidance.
        `;
        insightsList.appendChild(insight);
    }

    const lowRiskNutrients = Object.values(assessment.nutrientRisks)
        .filter(n => n.riskLevel === 'Low');

    if (lowRiskNutrients.length > 0) {
        const insight = document.createElement('div');
        insight.className = 'insight-item success';
        insight.innerHTML = `
            <strong>Good Nutrient Status:</strong> ${lowRiskNutrients.map(n => n.name).join(', ')}.
            Continue maintaining these healthy eating patterns.
        `;
        insightsList.appendChild(insight);
    }

    // Update recommendations
    updateRecommendations(assessment);
}

function updateRecommendations(assessment) {
    const highRiskNutrients = Object.values(assessment.nutrientRisks)
        .filter(n => n.riskLevel === 'High' || n.riskLevel === 'Very High');

    // Priority actions
    let priorityActions = '';
    if (highRiskNutrients.length > 0) {
        priorityActions = `Focus on improving intake of: ${highRiskNutrients.map(n => n.name).join(', ')}. `;
        priorityActions += highRiskNutrients[0].recommendations.slice(0, 2).join('. ') + '.';
    } else {
        priorityActions = 'Your nutrient intake appears balanced. Continue maintaining these healthy eating habits.';
    }

    // Dietary improvements
    const dietaryImprovements = generateDietaryAdvice(assessment);

    // Supplementation advice
    let supplementationAdvice = '';
    if (assessment.overallRiskLevel.includes('High')) {
        supplementationAdvice = 'Consider consulting a healthcare provider or registered dietitian about potential supplementation needs.';
    } else {
        supplementationAdvice = 'Focus on nutrient-dense whole foods. Supplementation should only be considered under professional guidance.';
    }

    document.getElementById('priorityActions').textContent = priorityActions;
    document.getElementById('dietaryImprovements').textContent = dietaryImprovements;
    document.getElementById('supplementationAdvice').textContent = supplementationAdvice;
}

function generateDietaryAdvice(assessment) {
    const advice = [];

    // Check for common dietary patterns
    const responses = assessment.responses;

    if (responses.leafyGreens === 'rarely' || responses.leafyGreens === 'monthly') {
        advice.push('Increase consumption of leafy green vegetables');
    }

    if (responses.fish === 'rarely') {
        advice.push('Include fatty fish at least once per week');
    }

    if (responses.citrus === 'rarely' || responses.citrus === 'monthly') {
        advice.push('Add citrus fruits or other vitamin C-rich foods daily');
    }

    if (responses.redMeat === 'rarely' && responses.legumes === 'rarely') {
        advice.push('Ensure adequate protein sources, including both animal and plant-based options');
    }

    if (responses.dairy === 'rarely' && responses.fortified === 'rarely') {
        advice.push('Include calcium-rich foods or fortified alternatives');
    }

    if (responses.wholeGrains === 'rarely') {
        advice.push('Incorporate whole grains into meals regularly');
    }

    if (responses.nuts === 'rarely') {
        advice.push('Add nuts and seeds as healthy snacks');
    }

    return advice.length > 0 ? advice.join('. ') + '.' : 'Your dietary variety appears good. Continue with balanced eating patterns.';
}

function initializeCharts() {
    const ctx = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Deficiency Risk Score',
                data: [],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const riskLevel = getRiskLevel(context.parsed.y);
                            return `${context.label}: ${context.parsed.y}/10 (${riskLevel} Risk)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Risk Score (0-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Nutrients'
                    }
                }
            }
        }
    });
}

function updateChart(nutrientRisks) {
    if (!riskChart) return;

    let filteredRisks = nutrientRisks;

    if (currentChartView === 'highRisk') {
        filteredRisks = Object.fromEntries(
            Object.entries(nutrientRisks).filter(([key, nutrient]) =>
                nutrient.riskLevel === 'High' || nutrient.riskLevel === 'Very High'
            )
        );
    }

    const labels = Object.values(filteredRisks).map(n => n.name);
    const data = Object.values(filteredRisks).map(n => n.riskScore);

    // Color bars based on risk level
    const backgroundColors = Object.values(filteredRisks).map(nutrient => {
        switch(nutrient.riskLevel) {
            case 'Low': return 'rgba(34, 197, 94, 0.6)';
            case 'Moderate': return 'rgba(251, 191, 36, 0.6)';
            case 'High': return 'rgba(239, 68, 68, 0.6)';
            case 'Very High': return 'rgba(147, 51, 234, 0.6)';
            default: return 'rgba(156, 163, 175, 0.6)';
        }
    });

    riskChart.data.labels = labels;
    riskChart.data.datasets[0].data = data;
    riskChart.data.datasets[0].backgroundColor = backgroundColors;
    riskChart.update();
}

function switchChartView(view) {
    currentChartView = view;

    // Update button states
    document.getElementById('viewAll').classList.toggle('active', view === 'all');
    document.getElementById('viewHighRisk').classList.toggle('active', view === 'highRisk');

    // Reload current assessment data if available
    const assessments = getStoredAssessments();
    if (assessments.length > 0) {
        const latestAssessment = assessments[assessments.length - 1];
        updateChart(latestAssessment.nutrientRisks);
    }
}

function saveAssessment(assessment) {
    const assessments = getStoredAssessments();
    assessments.push(assessment);
    localStorage.setItem('nutrientAssessments', JSON.stringify(assessments));
}

function getStoredAssessments() {
    const stored = localStorage.getItem('nutrientAssessments');
    return stored ? JSON.parse(stored) : [];
}

function updateHistoryTable() {
    const assessments = getStoredAssessments();
    const tbody = document.getElementById('historyBody');

    if (assessments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No assessments completed yet.</td></tr>';
        return;
    }

    tbody.innerHTML = assessments.slice(-10).reverse().map(assessment => {
        const date = new Date(assessment.timestamp).toLocaleDateString();
        const riskClass = assessment.overallRiskLevel.toLowerCase().replace(' ', '-');
        const highRiskCount = assessment.highRiskNutrients.length;

        return `
            <tr>
                <td>${date}</td>
                <td>${assessment.overallRiskScore}</td>
                <td><span class="risk-badge risk-${riskClass}">${assessment.overallRiskLevel}</span></td>
                <td>${highRiskCount > 0 ? assessment.highRiskNutrients.join(', ') : 'None'}</td>
                <td><button class="btn-small" onclick="viewAssessment(${assessments.indexOf(assessment)})">View</button></td>
            </tr>
        `;
    }).join('');
}

function viewAssessment(index) {
    const assessments = getStoredAssessments();
    const assessment = assessments[index];

    if (assessment) {
        displayResults(assessment);
        updateChart(assessment.nutrientRisks);
        showNotification('Previous assessment loaded', 'info');
    }
}

function loadData() {
    const assessments = getStoredAssessments();
    if (assessments.length > 0) {
        updateHistoryTable();
    }
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this with a proper notification system
    alert(message);
}