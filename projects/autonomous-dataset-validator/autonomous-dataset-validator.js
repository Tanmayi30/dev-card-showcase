/**
 * Autonomous Dataset Validator #5067
 * A comprehensive data validation and quality assessment tool
 */

class AutonomousDatasetValidator {
    constructor() {
        this.currentData = null;
        this.validationResults = [];
        this.validationRules = this.getDefaultRules();
        this.settings = this.loadSettings();
        this.charts = {};
        this.currentSection = 'dashboard';

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTheme();
        this.initializeCharts();
        this.updateUI();
        this.showNotification('Welcome to Autonomous Dataset Validator', 'info');
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(link.dataset.section);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // File upload
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        const uploadZone = document.getElementById('upload-zone');
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // Sample data buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadSampleData(btn.dataset.type);
            });
        });

        // Validation rules
        document.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectRule(item.dataset.rule);
            });
        });

        // Rule configuration
        document.getElementById('apply-rule').addEventListener('click', () => {
            this.applyRule();
        });

        document.getElementById('save-rule-template').addEventListener('click', () => {
            this.saveRuleTemplate();
        });

        // Validation controls
        document.getElementById('run-validation').addEventListener('click', () => {
            this.runValidation();
        });

        document.getElementById('clear-results').addEventListener('click', () => {
            this.clearResults();
        });

        // Results filters
        document.getElementById('severity-filter').addEventListener('change', () => {
            this.filterResults();
        });

        document.getElementById('type-filter').addEventListener('change', () => {
            this.filterResults();
        });

        // Export buttons
        document.getElementById('export-results').addEventListener('click', () => {
            this.exportResults();
        });

        document.getElementById('export-report').addEventListener('click', () => {
            this.exportReport();
        });

        // Settings
        document.querySelectorAll('.setting-item input, .setting-item select').forEach(input => {
            input.addEventListener('change', () => {
                this.updateSetting(input.name, input.value);
            });
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => {
                this.closeModal();
            });
        });
    }

    navigateToSection(sectionId) {
        // Update active section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Update sidebar
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;
        this.updateUI();
    }

    loadTheme() {
        const theme = this.settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.settings.theme = newTheme;
        this.saveSettings();
    }

    initializeCharts() {
        // Quality metrics chart
        const qualityCtx = document.getElementById('quality-chart');
        if (qualityCtx) {
            this.charts.quality = new Chart(qualityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Valid', 'Warnings', 'Errors'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Data types chart
        const typesCtx = document.getElementById('data-types-chart');
        if (typesCtx) {
            this.charts.dataTypes = new Chart(typesCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Count',
                        data: [],
                        backgroundColor: '#667eea',
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Validation timeline
        const timelineCtx = document.getElementById('validation-timeline');
        if (timelineCtx) {
            this.charts.timeline = new Chart(timelineCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Issues Found',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    handleFileUpload(file) {
        if (!file) return;

        const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedTypes.includes(fileExtension)) {
            this.showNotification('Unsupported file type. Please upload CSV, JSON, or Excel files.', 'error');
            return;
        }

        this.showModal('loading', 'Processing file...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseFile(file, e.target.result);
            } catch (error) {
                this.showNotification('Error parsing file: ' + error.message, 'error');
                this.closeModal();
            }
        };
        reader.readAsText(file);
    }

    parseFile(file, content) {
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        switch (fileExtension) {
            case '.csv':
                this.parseCSV(content);
                break;
            case '.json':
                this.parseJSON(content);
                break;
            case '.xlsx':
            case '.xls':
                this.parseExcel(file);
                break;
        }
    }

    parseCSV(content) {
        Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.currentData = {
                    headers: results.meta.fields,
                    rows: results.data,
                    fileName: 'uploaded_file.csv',
                    fileSize: content.length,
                    rowCount: results.data.length,
                    columnCount: results.meta.fields.length
                };
                this.updateFileInfo();
                this.closeModal();
                this.showNotification('File uploaded successfully!', 'success');
                this.navigateToSection('validation');
            },
            error: (error) => {
                this.showNotification('Error parsing CSV: ' + error.message, 'error');
                this.closeModal();
            }
        });
    }

    parseJSON(content) {
        try {
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
                this.currentData = {
                    headers: Object.keys(data[0] || {}),
                    rows: data,
                    fileName: 'uploaded_file.json',
                    fileSize: content.length,
                    rowCount: data.length,
                    columnCount: Object.keys(data[0] || {}).length
                };
            } else {
                throw new Error('JSON must be an array of objects');
            }
            this.updateFileInfo();
            this.closeModal();
            this.showNotification('File uploaded successfully!', 'success');
            this.navigateToSection('validation');
        } catch (error) {
            this.showNotification('Error parsing JSON: ' + error.message, 'error');
            this.closeModal();
        }
    }

    parseExcel(file) {
        // For demo purposes, we'll simulate Excel parsing
        // In a real implementation, you'd use a library like SheetJS
        this.showNotification('Excel parsing not implemented in demo', 'warning');
        this.closeModal();
    }

    loadSampleData(type) {
        let sampleData;

        switch (type) {
            case 'clean':
                sampleData = this.generateCleanSampleData();
                break;
            case 'errors':
                sampleData = this.generateErrorSampleData();
                break;
            case 'mixed':
                sampleData = this.generateMixedSampleData();
                break;
        }

        this.currentData = sampleData;
        this.updateFileInfo();
        this.showNotification('Sample data loaded!', 'success');
        this.navigateToSection('validation');
    }

    generateCleanSampleData() {
        const headers = ['id', 'name', 'email', 'age', 'salary', 'department'];
        const rows = [];

        for (let i = 1; i <= 100; i++) {
            rows.push({
                id: i,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                age: Math.floor(Math.random() * 50) + 20,
                salary: Math.floor(Math.random() * 50000) + 30000,
                department: ['Engineering', 'Sales', 'Marketing', 'HR'][Math.floor(Math.random() * 4)]
            });
        }

        return {
            headers,
            rows,
            fileName: 'clean_sample_data.csv',
            fileSize: JSON.stringify(rows).length,
            rowCount: rows.length,
            columnCount: headers.length
        };
    }

    generateErrorSampleData() {
        const headers = ['id', 'name', 'email', 'age', 'salary', 'department'];
        const rows = [];

        for (let i = 1; i <= 50; i++) {
            const hasErrors = Math.random() < 0.7; // 70% chance of errors
            rows.push({
                id: hasErrors && Math.random() < 0.3 ? '' : i, // 30% missing IDs
                name: hasErrors && Math.random() < 0.2 ? '' : `User ${i}`, // 20% missing names
                email: hasErrors && Math.random() < 0.4 ? `invalid-email${i}` : `user${i}@example.com`, // 40% invalid emails
                age: hasErrors && Math.random() < 0.3 ? 'invalid' : (Math.floor(Math.random() * 50) + 20).toString(), // 30% invalid ages
                salary: hasErrors && Math.random() < 0.2 ? 'not-a-number' : (Math.floor(Math.random() * 50000) + 30000).toString(), // 20% invalid salaries
                department: ['Engineering', 'Sales', 'Marketing', 'HR'][Math.floor(Math.random() * 4)]
            });
        }

        return {
            headers,
            rows,
            fileName: 'error_sample_data.csv',
            fileSize: JSON.stringify(rows).length,
            rowCount: rows.length,
            columnCount: headers.length
        };
    }

    generateMixedSampleData() {
        const headers = ['id', 'name', 'email', 'age', 'salary', 'department', 'hire_date'];
        const rows = [];

        for (let i = 1; i <= 200; i++) {
            const hasErrors = Math.random() < 0.3; // 30% chance of errors
            rows.push({
                id: i,
                name: hasErrors && Math.random() < 0.1 ? '' : `Employee ${i}`,
                email: hasErrors && Math.random() < 0.2 ? `user${i}@invalid` : `employee${i}@company.com`,
                age: hasErrors && Math.random() < 0.15 ? 'thirty' : (Math.floor(Math.random() * 40) + 22).toString(),
                salary: hasErrors && Math.random() < 0.1 ? '' : (Math.floor(Math.random() * 80000) + 40000).toString(),
                department: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
                hire_date: hasErrors && Math.random() < 0.25 ? '2023-13-45' : `202${Math.floor(Math.random() * 3) + 1}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 5)}`
            });
        }

        return {
            headers,
            rows,
            fileName: 'mixed_sample_data.csv',
            fileSize: JSON.stringify(rows).length,
            rowCount: rows.length,
            columnCount: headers.length
        };
    }

    updateFileInfo() {
        if (!this.currentData) return;

        const info = document.getElementById('file-info');
        info.innerHTML = `
            <h3>File Information</h3>
            <div class="info-grid">
                <div><strong>File Name:</strong> ${this.currentData.fileName}</div>
                <div><strong>File Size:</strong> ${(this.currentData.fileSize / 1024).toFixed(2)} KB</div>
                <div><strong>Rows:</strong> ${this.currentData.rowCount.toLocaleString()}</div>
                <div><strong>Columns:</strong> ${this.currentData.columnCount}</div>
            </div>
        `;
    }

    getDefaultRules() {
        return {
            missing_values: {
                enabled: true,
                threshold: 5,
                action: 'flag'
            },
            duplicates: {
                enabled: true,
                columns: [],
                action: 'flag'
            },
            data_types: {
                enabled: true,
                strict: false,
                custom_types: {}
            },
            ranges: {
                enabled: true,
                rules: {}
            },
            outliers: {
                enabled: true,
                method: 'iqr',
                threshold: 1.5
            },
            patterns: {
                enabled: true,
                rules: {}
            }
        };
    }

    selectRule(ruleType) {
        document.querySelectorAll('.rule-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-rule="${ruleType}"]`).classList.add('active');

        this.showRuleConfig(ruleType);
    }

    showRuleConfig(ruleType) {
        const configPanel = document.getElementById('rule-config-panel');
        const rule = this.validationRules[ruleType];

        let configHTML = '';

        switch (ruleType) {
            case 'missing_values':
                configHTML = `
                    <h4>Missing Values Configuration</h4>
                    <div class="setting-item">
                        <label>Threshold (%):</label>
                        <input type="number" name="missing_threshold" value="${rule.threshold}" min="0" max="100">
                    </div>
                    <div class="setting-item">
                        <label>Action:</label>
                        <select name="missing_action">
                            <option value="flag" ${rule.action === 'flag' ? 'selected' : ''}>Flag as Warning</option>
                            <option value="remove" ${rule.action === 'remove' ? 'selected' : ''}>Remove Rows</option>
                            <option value="impute" ${rule.action === 'impute' ? 'selected' : ''}>Impute Values</option>
                        </select>
                    </div>
                `;
                break;

            case 'duplicates':
                configHTML = `
                    <h4>Duplicate Detection Configuration</h4>
                    <div class="setting-item">
                        <label>Check All Columns:</label>
                        <input type="checkbox" name="duplicate_all_columns" ${rule.columns.length === 0 ? 'checked' : ''}>
                    </div>
                    <div class="setting-item">
                        <label>Specific Columns:</label>
                        <input type="text" name="duplicate_columns" value="${rule.columns.join(', ')}" placeholder="column1, column2">
                    </div>
                `;
                break;

            case 'data_types':
                configHTML = `
                    <h4>Data Types Configuration</h4>
                    <div class="setting-item">
                        <label>Strict Mode:</label>
                        <input type="checkbox" name="strict_types" ${rule.strict ? 'checked' : ''}>
                    </div>
                `;
                break;

            case 'ranges':
                configHTML = `
                    <h4>Range Validation Configuration</h4>
                    <p>Add range rules for numeric columns:</p>
                    <div id="range-rules">
                        ${this.renderRangeRules()}
                    </div>
                    <button class="secondary-btn" onclick="validator.addRangeRule()">Add Range Rule</button>
                `;
                break;

            case 'outliers':
                configHTML = `
                    <h4>Outlier Detection Configuration</h4>
                    <div class="setting-item">
                        <label>Method:</label>
                        <select name="outlier_method">
                            <option value="iqr" ${rule.method === 'iqr' ? 'selected' : ''}>IQR (Interquartile Range)</option>
                            <option value="zscore" ${rule.method === 'zscore' ? 'selected' : ''}>Z-Score</option>
                            <option value="modified_zscore" ${rule.method === 'modified_zscore' ? 'selected' : ''}>Modified Z-Score</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Threshold:</label>
                        <input type="number" name="outlier_threshold" value="${rule.threshold}" step="0.1" min="0">
                    </div>
                `;
                break;

            case 'patterns':
                configHTML = `
                    <h4>Pattern Validation Configuration</h4>
                    <p>Add regex patterns for text columns:</p>
                    <div id="pattern-rules">
                        ${this.renderPatternRules()}
                    </div>
                    <button class="secondary-btn" onclick="validator.addPatternRule()">Add Pattern Rule</button>
                `;
                break;
        }

        configPanel.innerHTML = configHTML;
    }

    renderRangeRules() {
        let html = '';
        Object.entries(this.validationRules.ranges.rules).forEach(([column, rule]) => {
            html += `
                <div class="setting-item">
                    <label>${column}:</label>
                    <input type="number" name="range_min_${column}" value="${rule.min}" placeholder="Min">
                    <input type="number" name="range_max_${column}" value="${rule.max}" placeholder="Max">
                    <button class="danger-btn" onclick="validator.removeRangeRule('${column}')">Remove</button>
                </div>
            `;
        });
        return html;
    }

    renderPatternRules() {
        let html = '';
        Object.entries(this.validationRules.patterns.rules).forEach(([column, pattern]) => {
            html += `
                <div class="setting-item">
                    <label>${column}:</label>
                    <input type="text" name="pattern_${column}" value="${pattern}" placeholder="Regex pattern">
                    <button class="danger-btn" onclick="validator.removePatternRule('${column}')">Remove</button>
                </div>
            `;
        });
        return html;
    }

    applyRule() {
        const ruleType = document.querySelector('.rule-item.active').dataset.rule;
        const rule = this.validationRules[ruleType];

        // Update rule settings from form inputs
        const inputs = document.querySelectorAll('#rule-config-panel input, #rule-config-panel select');
        inputs.forEach(input => {
            if (input.name.startsWith('missing_')) {
                if (input.name === 'missing_threshold') rule.threshold = parseFloat(input.value);
                if (input.name === 'missing_action') rule.action = input.value;
            } else if (input.name.startsWith('duplicate_')) {
                if (input.name === 'duplicate_all_columns') rule.columns = input.checked ? [] : [];
                if (input.name === 'duplicate_columns') rule.columns = input.value.split(',').map(s => s.trim());
            } else if (input.name === 'strict_types') {
                rule.strict = input.checked;
            } else if (input.name.startsWith('outlier_')) {
                if (input.name === 'outlier_method') rule.method = input.value;
                if (input.name === 'outlier_threshold') rule.threshold = parseFloat(input.value);
            } else if (input.name.startsWith('range_')) {
                // Handle range rules
            } else if (input.name.startsWith('pattern_')) {
                // Handle pattern rules
            }
        });

        this.showNotification(`Rule "${ruleType}" updated successfully!`, 'success');
    }

    runValidation() {
        if (!this.currentData) {
            this.showNotification('Please upload data first', 'warning');
            return;
        }

        this.showModal('loading', 'Running validation...');

        setTimeout(() => {
            this.validationResults = this.performValidation();
            this.displayResults();
            this.updateCharts();
            this.closeModal();
            this.showNotification('Validation completed!', 'success');
            this.navigateToSection('results');
        }, 2000);
    }

    performValidation() {
        const results = [];
        const { headers, rows } = this.currentData;

        // Missing values check
        if (this.validationRules.missing_values.enabled) {
            rows.forEach((row, index) => {
                headers.forEach(header => {
                    if (!row[header] || row[header] === '') {
                        results.push({
                            type: 'missing_value',
                            severity: 'warning',
                            column: header,
                            row: index + 1,
                            value: row[header],
                            message: `Missing value in column "${header}"`,
                            suggestion: 'Consider imputing or removing this row'
                        });
                    }
                });
            });
        }

        // Duplicate check
        if (this.validationRules.duplicates.enabled) {
            const seen = new Set();
            const checkColumns = this.validationRules.duplicates.columns.length > 0
                ? this.validationRules.duplicates.columns
                : headers;

            rows.forEach((row, index) => {
                const key = checkColumns.map(col => row[col]).join('|');
                if (seen.has(key)) {
                    results.push({
                        type: 'duplicate',
                        severity: 'error',
                        column: checkColumns.join(', '),
                        row: index + 1,
                        value: key,
                        message: `Duplicate row found`,
                        suggestion: 'Remove duplicate rows'
                    });
                }
                seen.add(key);
            });
        }

        // Data type validation
        if (this.validationRules.data_types.enabled) {
            rows.forEach((row, index) => {
                headers.forEach(header => {
                    const value = row[header];
                    if (value && !this.isValidDataType(value, header)) {
                        results.push({
                            type: 'data_type',
                            severity: 'error',
                            column: header,
                            row: index + 1,
                            value: value,
                            message: `Invalid data type in column "${header}"`,
                            suggestion: 'Convert to appropriate data type'
                        });
                    }
                });
            });
        }

        // Range validation
        if (this.validationRules.ranges.enabled) {
            Object.entries(this.validationRules.ranges.rules).forEach(([column, rule]) => {
                rows.forEach((row, index) => {
                    const value = parseFloat(row[column]);
                    if (!isNaN(value) && (value < rule.min || value > rule.max)) {
                        results.push({
                            type: 'range',
                            severity: 'warning',
                            column: column,
                            row: index + 1,
                            value: value,
                            message: `Value out of range (${rule.min} - ${rule.max})`,
                            suggestion: 'Check data entry or adjust range'
                        });
                    }
                });
            });
        }

        // Outlier detection
        if (this.validationRules.outliers.enabled) {
            headers.forEach(header => {
                const values = rows.map(row => parseFloat(row[header])).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const outliers = this.detectOutliers(values);
                    outliers.forEach(outlierIndex => {
                        results.push({
                            type: 'outlier',
                            severity: 'info',
                            column: header,
                            row: outlierIndex + 1,
                            value: values[outlierIndex],
                            message: `Potential outlier detected`,
                            suggestion: 'Review value for accuracy'
                        });
                    });
                }
            });
        }

        return results;
    }

    isValidDataType(value, column) {
        // Simple type detection - in a real implementation, you'd have more sophisticated logic
        if (this.validationRules.data_types.strict) {
            // Check if it's a number
            if (!isNaN(value) && !isNaN(parseFloat(value))) return true;
            // Check if it's a valid date
            if (!isNaN(Date.parse(value))) return true;
            // Otherwise assume string
            return typeof value === 'string';
        }
        return true; // Non-strict mode accepts anything
    }

    detectOutliers(values) {
        const outliers = [];
        const method = this.validationRules.outliers.method;
        const threshold = this.validationRules.outliers.threshold;

        if (method === 'iqr') {
            values.sort((a, b) => a - b);
            const q1 = values[Math.floor(values.length * 0.25)];
            const q3 = values[Math.floor(values.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - (threshold * iqr);
            const upperBound = q3 + (threshold * iqr);

            values.forEach((value, index) => {
                if (value < lowerBound || value > upperBound) {
                    outliers.push(index);
                }
            });
        }

        return outliers;
    }

    displayResults() {
        const tbody = document.querySelector('#issues-table tbody');
        tbody.innerHTML = '';

        if (this.validationResults.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No issues found! Your data looks good.</td></tr>';
            return;
        }

        this.validationResults.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="severity-${result.severity}">${result.severity}</span></td>
                <td>${result.type.replace('_', ' ')}</td>
                <td>${result.column}</td>
                <td>${result.row}</td>
                <td>${result.value || 'N/A'}</td>
                <td>${result.message}</td>
            `;
            tbody.appendChild(row);
        });
    }

    filterResults() {
        const severityFilter = document.getElementById('severity-filter').value;
        const typeFilter = document.getElementById('type-filter').value;

        const rows = document.querySelectorAll('#issues-table tbody tr');

        rows.forEach(row => {
            if (row.querySelector('.no-data')) return;

            const severity = row.cells[0].textContent.toLowerCase();
            const type = row.cells[1].textContent.toLowerCase().replace(' ', '_');

            const severityMatch = severityFilter === 'all' || severity === severityFilter;
            const typeMatch = typeFilter === 'all' || type === typeFilter;

            row.style.display = severityMatch && typeMatch ? '' : 'none';
        });
    }

    updateCharts() {
        if (!this.charts.quality) return;

        // Quality metrics
        const total = this.currentData ? this.currentData.rowCount : 0;
        const errors = this.validationResults.filter(r => r.severity === 'error').length;
        const warnings = this.validationResults.filter(r => r.severity === 'warning').length;
        const valid = total - errors - warnings;

        this.charts.quality.data.datasets[0].data = [valid, warnings, errors];
        this.charts.quality.update();

        // Data types
        if (this.currentData) {
            const typeCounts = {};
            this.currentData.rows.forEach(row => {
                this.currentData.headers.forEach(header => {
                    const value = row[header];
                    let type = 'string';
                    if (!isNaN(value) && !isNaN(parseFloat(value))) type = 'number';
                    else if (!isNaN(Date.parse(value))) type = 'date';

                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
            });

            this.charts.dataTypes.data.labels = Object.keys(typeCounts);
            this.charts.dataTypes.data.datasets[0].data = Object.values(typeCounts);
            this.charts.dataTypes.update();
        }
    }

    clearResults() {
        this.validationResults = [];
        this.displayResults();
        this.updateCharts();
        this.showNotification('Results cleared', 'info');
    }

    exportResults() {
        if (this.validationResults.length === 0) {
            this.showNotification('No results to export', 'warning');
            return;
        }

        const csv = Papa.unparse(this.validationResults);
        this.downloadFile(csv, 'validation_results.csv', 'text/csv');
        this.showNotification('Results exported successfully!', 'success');
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            fileInfo: this.currentData ? {
                name: this.currentData.fileName,
                size: this.currentData.fileSize,
                rows: this.currentData.rowCount,
                columns: this.currentData.columnCount
            } : null,
            summary: {
                totalIssues: this.validationResults.length,
                errors: this.validationResults.filter(r => r.severity === 'error').length,
                warnings: this.validationResults.filter(r => r.severity === 'warning').length,
                info: this.validationResults.filter(r => r.severity === 'info').length
            },
            results: this.validationResults
        };

        const json = JSON.stringify(report, null, 2);
        this.downloadFile(json, 'validation_report.json', 'application/json');
        this.showNotification('Report exported successfully!', 'success');
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

    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            autoValidate: true,
            maxFileSize: 10,
            exportFormat: 'csv',
            notifications: true
        };

        const saved = localStorage.getItem('autonomous-dataset-validator-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('autonomous-dataset-validator-settings', JSON.stringify(this.settings));
    }

    updateSetting(name, value) {
        this.settings[name] = value;
        this.saveSettings();
        this.showNotification('Setting updated', 'success');
    }

    showModal(type, message) {
        const modal = document.getElementById('modal');
        const content = modal.querySelector('.modal-content');

        if (type === 'loading') {
            content.innerHTML = `
                <div class="loading-spinner"></div>
                <p>${message}</p>
            `;
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        if (!this.settings.notifications) return;

        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    updateUI() {
        // Update metrics
        this.updateMetrics();

        // Update charts if data exists
        if (this.currentData) {
            this.updateCharts();
        }
    }

    updateMetrics() {
        const metrics = {
            totalRows: this.currentData ? this.currentData.rowCount : 0,
            totalColumns: this.currentData ? this.currentData.columnCount : 0,
            totalIssues: this.validationResults.length,
            errorRate: this.currentData && this.validationResults.length > 0
                ? ((this.validationResults.length / this.currentData.rowCount) * 100).toFixed(1)
                : 0
        };

        document.getElementById('total-rows').textContent = metrics.totalRows.toLocaleString();
        document.getElementById('total-columns').textContent = metrics.totalColumns;
        document.getElementById('total-issues').textContent = metrics.totalIssues.toLocaleString();
        document.getElementById('error-rate').textContent = `${metrics.errorRate}%`;
    }
}

// Global instance for event handlers
let validator;

document.addEventListener('DOMContentLoaded', () => {
    validator = new AutonomousDatasetValidator();
});

// Make validator available globally for inline event handlers
window.validator = validator;