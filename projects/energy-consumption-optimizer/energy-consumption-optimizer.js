// Energy Consumption Optimizer - JavaScript

class EnergyConsumptionOptimizer {
    constructor() {
        this.devices = [];
        this.entries = [];
        this.optimizationSuggestions = [];
        this.settings = {
            electricityRate: 0.12,
            peakRate: 0.18,
            offPeakRate: 0.08,
            peakHours: '17:00-21:00',
            carbonFactor: 0.429,
            renewablePercentage: 25,
            location: 'us',
            autoTracking: true,
            notifications: true,
            dataRetention: 90,
            currency: 'USD'
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadDevices();
        this.loadEntries();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.updateDeviceSelect();
        this.updateEntriesList();
        this.runOptimization();
    }

    setupEventListeners() {
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

        // Dashboard actions
        document.getElementById('add-device').addEventListener('click', () => {
            this.showDeviceModal();
        });

        document.getElementById('run-optimization').addEventListener('click', () => {
            this.runOptimization();
            this.switchSection('optimization');
        });

        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        // Device management
        document.getElementById('add-new-device').addEventListener('click', () => {
            this.showDeviceModal();
        });

        document.getElementById('device-category-filter').addEventListener('change', () => {
            this.filterDevices();
        });

        document.getElementById('device-status-filter').addEventListener('change', () => {
            this.filterDevices();
        });

        // Tracking
        document.getElementById('add-entry').addEventListener('click', () => {
            this.addEntry();
        });

        // Optimization
        document.getElementById('apply-all-suggestions').addEventListener('click', () => {
            this.applyAllSuggestions();
        });

        // Analytics
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTimeRange(e.target.dataset.range);
            });
        });

        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setChartType(e.target.dataset.type);
            });
        });

        // Settings
        const settingInputs = [
            'electricity-rate', 'peak-rate', 'off-peak-rate', 'peak-hours',
            'carbon-factor', 'renewable-percentage', 'location',
            'auto-tracking', 'notifications', 'data-retention', 'currency'
        ];

        settingInputs.forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('change', () => {
                this.updateSetting(id.replace(/-/g, ''), element.type === 'checkbox' ? element.checked : element.value);
            });
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.handleImport(e.target.files[0]);
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                this.resetSettings();
            }
        });

        // Device modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideDeviceModal();
        });

        document.getElementById('cancel-device').addEventListener('click', () => {
            this.hideDeviceModal();
        });

        document.getElementById('device-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDevice();
        });

        // Click outside modal to close
        document.getElementById('device-modal').addEventListener('click', (e) => {
            if (e.target.id === 'device-modal') {
                this.hideDeviceModal();
            }
        });
    }

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
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('energyOptimizerSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }

        // Apply settings to UI
        Object.keys(this.settings).forEach(key => {
            const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.updateDashboard();
        this.runOptimization();
    }

    saveSettings() {
        localStorage.setItem('energyOptimizerSettings', JSON.stringify(this.settings));
    }

    loadDevices() {
        const saved = localStorage.getItem('energyOptimizerDevices');
        if (saved) {
            this.devices = JSON.parse(saved);
            this.renderDevices();
        } else {
            // Add some sample devices
            this.addSampleDevices();
        }
    }

    saveDevices() {
        localStorage.setItem('energyOptimizerDevices', JSON.stringify(this.devices));
    }

    addSampleDevices() {
        const sampleDevices = [
            {
                id: Date.now() + 1,
                name: 'Refrigerator',
                category: 'appliances',
                powerRating: 150,
                dailyHours: 24,
                efficiency: 7,
                smart: false,
                status: 'active'
            },
            {
                id: Date.now() + 2,
                name: 'LED TV',
                category: 'electronics',
                powerRating: 80,
                dailyHours: 4,
                efficiency: 8,
                smart: true,
                status: 'active'
            },
            {
                id: Date.now() + 3,
                name: 'Air Conditioner',
                category: 'heating',
                powerRating: 1200,
                dailyHours: 8,
                efficiency: 5,
                smart: true,
                status: 'inactive'
            },
            {
                id: Date.now() + 4,
                name: 'Washing Machine',
                category: 'appliances',
                powerRating: 500,
                dailyHours: 1,
                efficiency: 6,
                smart: false,
                status: 'standby'
            }
        ];

        this.devices = sampleDevices;
        this.saveDevices();
        this.renderDevices();
    }

    renderDevices() {
        const container = document.getElementById('devices-grid');
        container.innerHTML = '';

        const filteredDevices = this.getFilteredDevices();

        filteredDevices.forEach(device => {
            const deviceCard = document.createElement('div');
            deviceCard.className = 'device-card';
            deviceCard.innerHTML = `
                <div class="device-header">
                    <div class="device-name">${device.name}</div>
                    <div class="device-status ${device.status}">${device.status}</div>
                </div>
                <div class="device-info">
                    <div class="device-info-item">
                        <div class="device-info-label">Power</div>
                        <div class="device-info-value">${device.powerRating}W</div>
                    </div>
                    <div class="device-info-item">
                        <div class="device-info-label">Daily Usage</div>
                        <div class="device-info-value">${device.dailyHours}h</div>
                    </div>
                    <div class="device-info-item">
                        <div class="device-info-label">Efficiency</div>
                        <div class="device-info-value">${device.efficiency}/10</div>
                    </div>
                    <div class="device-info-item">
                        <div class="device-info-label">Daily kWh</div>
                        <div class="device-info-value">${this.calculateDailyConsumption(device).toFixed(2)}</div>
                    </div>
                </div>
                <div class="device-actions">
                    <button class="edit-btn" onclick="optimizer.editDevice(${device.id})">Edit</button>
                    <button class="delete-btn" onclick="optimizer.deleteDevice(${device.id})">Delete</button>
                </div>
            `;
            container.appendChild(deviceCard);
        });
    }

    getFilteredDevices() {
        const categoryFilter = document.getElementById('device-category-filter').value;
        const statusFilter = document.getElementById('device-status-filter').value;

        return this.devices.filter(device => {
            const categoryMatch = categoryFilter === 'all' || device.category === categoryFilter;
            const statusMatch = statusFilter === 'all' || device.status === statusFilter;
            return categoryMatch && statusMatch;
        });
    }

    filterDevices() {
        this.renderDevices();
    }

    showDeviceModal(deviceId = null) {
        const modal = document.getElementById('device-modal');
        const form = document.getElementById('device-form');

        if (deviceId) {
            const device = this.devices.find(d => d.id === deviceId);
            if (device) {
                document.getElementById('modal-title').textContent = 'Edit Device';
                document.getElementById('device-name').value = device.name;
                document.getElementById('device-category').value = device.category;
                document.getElementById('device-power').value = device.powerRating;
                document.getElementById('device-hours').value = device.dailyHours;
                document.getElementById('device-efficiency').value = device.efficiency;
                document.getElementById('device-smart').checked = device.smart;
                form.dataset.deviceId = deviceId;
            }
        } else {
            document.getElementById('modal-title').textContent = 'Add Device';
            form.reset();
            delete form.dataset.deviceId;
        }

        modal.classList.add('show');
    }

    hideDeviceModal() {
        document.getElementById('device-modal').classList.remove('show');
    }

    saveDevice() {
        const form = document.getElementById('device-form');
        const deviceId = form.dataset.deviceId;

        const deviceData = {
            name: document.getElementById('device-name').value,
            category: document.getElementById('device-category').value,
            powerRating: parseFloat(document.getElementById('device-power').value),
            dailyHours: parseFloat(document.getElementById('device-hours').value),
            efficiency: parseInt(document.getElementById('device-efficiency').value),
            smart: document.getElementById('device-smart').checked,
            status: 'active'
        };

        if (deviceId) {
            // Update existing device
            const index = this.devices.findIndex(d => d.id === parseInt(deviceId));
            if (index !== -1) {
                this.devices[index] = { ...this.devices[index], ...deviceData };
            }
        } else {
            // Add new device
            deviceData.id = Date.now();
            this.devices.push(deviceData);
        }

        this.saveDevices();
        this.renderDevices();
        this.updateDeviceSelect();
        this.updateDashboard();
        this.runOptimization();
        this.hideDeviceModal();
    }

    editDevice(deviceId) {
        this.showDeviceModal(deviceId);
    }

    deleteDevice(deviceId) {
        if (confirm('Are you sure you want to delete this device?')) {
            this.devices = this.devices.filter(d => d.id !== deviceId);
            this.saveDevices();
            this.renderDevices();
            this.updateDeviceSelect();
            this.updateDashboard();
            this.runOptimization();
        }
    }

    calculateDailyConsumption(device) {
        return (device.powerRating * device.dailyHours) / 1000;
    }

    updateDeviceSelect() {
        const select = document.getElementById('entry-device');
        select.innerHTML = '<option value="">Select Device</option>';

        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            select.appendChild(option);
        });
    }

    loadEntries() {
        const saved = localStorage.getItem('energyOptimizerEntries');
        if (saved) {
            this.entries = JSON.parse(saved);
        } else {
            // Add some sample entries
            this.addSampleEntries();
        }
    }

    saveEntries() {
        localStorage.setItem('energyOptimizerEntries', JSON.stringify(this.entries));
    }

    addSampleEntries() {
        const now = new Date();
        const sampleEntries = [];

        for (let i = 0; i < 10; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const device = this.devices[Math.floor(Math.random() * this.devices.length)];
            if (device) {
                sampleEntries.push({
                    id: Date.now() + i,
                    deviceId: device.id,
                    consumption: this.calculateDailyConsumption(device) * (0.8 + Math.random() * 0.4),
                    duration: device.dailyHours * (0.9 + Math.random() * 0.2),
                    timestamp: date.toISOString(),
                    cost: 0,
                    carbon: 0
                });
            }
        }

        this.entries = sampleEntries;
        this.saveEntries();
        this.calculateEntryCosts();
    }

    addEntry() {
        const deviceId = document.getElementById('entry-device').value;
        const consumption = parseFloat(document.getElementById('entry-consumption').value);
        const duration = parseFloat(document.getElementById('entry-duration').value);
        const timestamp = document.getElementById('entry-date').value || new Date().toISOString();

        if (!deviceId || !consumption || !duration) {
            alert('Please fill in all fields');
            return;
        }

        const entry = {
            id: Date.now(),
            deviceId: parseInt(deviceId),
            consumption,
            duration,
            timestamp,
            cost: 0,
            carbon: 0
        };

        this.entries.unshift(entry);
        this.calculateEntryCosts();
        this.saveEntries();
        this.updateEntriesList();
        this.updateDashboard();

        // Clear form
        document.getElementById('entry-consumption').value = '';
        document.getElementById('entry-duration').value = '';
        document.getElementById('entry-date').value = '';
    }

    calculateEntryCosts() {
        this.entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const isPeak = this.isPeakHour(date);
            const rate = isPeak ? this.settings.peakRate : this.settings.electricityRate;
            entry.cost = entry.consumption * rate;
            entry.carbon = entry.consumption * this.settings.carbonFactor * (1 - this.settings.renewablePercentage / 100);
        });
    }

    isPeakHour(date) {
        const [start, end] = this.settings.peakHours.split('-');
        const [startHour] = start.split(':').map(Number);
        const [endHour] = end.split(':').map(Number);
        const hour = date.getHours();
        return hour >= startHour && hour < endHour;
    }

    updateEntriesList() {
        const container = document.getElementById('entries-list');
        container.innerHTML = '';

        this.entries.slice(0, 20).forEach(entry => {
            const device = this.devices.find(d => d.id === entry.deviceId);
            const entryItem = document.createElement('div');
            entryItem.className = 'entry-item';
            entryItem.innerHTML = `
                <div class="entry-info">
                    <div class="entry-device">${device ? device.name : 'Unknown Device'}</div>
                    <div class="entry-details">
                        ${entry.consumption.toFixed(2)} kWh • ${entry.duration.toFixed(1)}h •
                        $${entry.cost.toFixed(2)} • ${entry.carbon.toFixed(2)} kg CO₂ •
                        ${new Date(entry.timestamp).toLocaleString()}
                    </div>
                </div>
                <button class="entry-delete" onclick="optimizer.deleteEntry(${entry.id})">&times;</button>
            `;
            container.appendChild(entryItem);
        });
    }

    deleteEntry(entryId) {
        this.entries = this.entries.filter(e => e.id !== entryId);
        this.saveEntries();
        this.updateEntriesList();
        this.updateDashboard();
    }

    updateDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        const todayConsumption = todayEntries.reduce((sum, entry) => sum + entry.consumption, 0);
        const todayCost = todayEntries.reduce((sum, entry) => sum + entry.cost, 0);
        const todayCarbon = todayEntries.reduce((sum, entry) => sum + entry.carbon, 0);

        // Calculate changes (comparing to yesterday)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === yesterday.getTime();
        });

        const yesterdayConsumption = yesterdayEntries.reduce((sum, entry) => sum + entry.consumption, 0);
        const yesterdayCost = yesterdayEntries.reduce((sum, entry) => sum + entry.cost, 0);
        const yesterdayCarbon = yesterdayEntries.reduce((sum, entry) => sum + entry.carbon, 0);

        const consumptionChange = yesterdayConsumption > 0 ? ((todayConsumption - yesterdayConsumption) / yesterdayConsumption * 100) : 0;
        const costChange = yesterdayCost > 0 ? ((todayCost - yesterdayCost) / yesterdayCost * 100) : 0;
        const carbonChange = yesterdayCarbon > 0 ? ((todayCarbon - yesterdayCarbon) / yesterdayCarbon * 100) : 0;

        // Monthly calculations
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const thisMonthEntries = this.entries.filter(entry => new Date(entry.timestamp) >= thisMonth);
        const lastMonthEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= lastMonth && entryDate < thisMonth;
        });

        const monthlyCost = thisMonthEntries.reduce((sum, entry) => sum + entry.cost, 0);
        const lastMonthlyCost = lastMonthEntries.reduce((sum, entry) => sum + entry.cost, 0);
        const monthlyChange = lastMonthlyCost > 0 ? ((monthlyCost - lastMonthlyCost) / lastMonthlyCost * 100) : 0;

        // Potential savings (from optimization)
        const potentialSavings = this.optimizationSuggestions.reduce((sum, suggestion) => sum + (suggestion.monthlySavings || 0), 0);

        document.getElementById('today-consumption').textContent = `${todayConsumption.toFixed(2)} kWh`;
        document.getElementById('today-change').textContent = `${consumptionChange >= 0 ? '+' : ''}${consumptionChange.toFixed(1)}%`;
        document.getElementById('today-change').className = consumptionChange >= 0 ? 'metric-change positive' : 'metric-change negative';

        document.getElementById('monthly-cost').textContent = `$${monthlyCost.toFixed(2)}`;
        document.getElementById('monthly-change').textContent = `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`;
        document.getElementById('monthly-change').className = monthlyChange >= 0 ? 'metric-change positive' : 'metric-change negative';

        document.getElementById('carbon-footprint').textContent = `${todayCarbon.toFixed(2)} kg CO₂`;
        document.getElementById('carbon-change').textContent = `${carbonChange >= 0 ? '+' : ''}${carbonChange.toFixed(1)}%`;
        document.getElementById('carbon-change').className = carbonChange <= 0 ? 'metric-change negative' : 'metric-change positive';

        document.getElementById('potential-savings').textContent = `$${potentialSavings.toFixed(2)}`;
        document.getElementById('savings-change').textContent = potentialSavings > 0 ? '+Available' : 'None';

        this.updateCharts();
    }

    runOptimization() {
        this.optimizationSuggestions = [];

        // Analyze device usage patterns
        this.devices.forEach(device => {
            // Check for inefficient devices
            if (device.efficiency < 6) {
                this.optimizationSuggestions.push({
                    id: `efficiency-${device.id}`,
                    title: `Upgrade ${device.name}`,
                    description: `Consider upgrading to a more energy-efficient ${device.category} model. Current efficiency rating: ${device.efficiency}/10.`,
                    impact: 'High',
                    monthlySavings: this.calculateUpgradeSavings(device),
                    energyReduction: this.calculateUpgradeEnergySavings(device),
                    co2Reduction: this.calculateUpgradeCarbonSavings(device),
                    type: 'upgrade'
                });
            }

            // Check for high usage devices
            const dailyConsumption = this.calculateDailyConsumption(device);
            if (dailyConsumption > 5) {
                this.optimizationSuggestions.push({
                    id: `usage-${device.id}`,
                    title: `Reduce usage of ${device.name}`,
                    description: `${device.name} consumes ${dailyConsumption.toFixed(2)} kWh daily. Consider reducing usage hours or finding alternatives.`,
                    impact: 'Medium',
                    monthlySavings: dailyConsumption * 30 * this.settings.electricityRate,
                    energyReduction: dailyConsumption * 30,
                    co2Reduction: dailyConsumption * 30 * this.settings.carbonFactor,
                    type: 'usage'
                });
            }

            // Check for smart device potential
            if (!device.smart && device.category === 'appliances') {
                this.optimizationSuggestions.push({
                    id: `smart-${device.id}`,
                    title: `Make ${device.name} smart`,
                    description: `Upgrade ${device.name} to a smart device for automated energy optimization and remote control.`,
                    impact: 'Medium',
                    monthlySavings: dailyConsumption * 30 * this.settings.electricityRate * 0.2,
                    energyReduction: dailyConsumption * 30 * 0.2,
                    co2Reduction: dailyConsumption * 30 * 0.2 * this.settings.carbonFactor,
                    type: 'smart'
                });
            }
        });

        // Peak hour optimization
        const peakUsage = this.entries.filter(entry => this.isPeakHour(new Date(entry.timestamp)));
        if (peakUsage.length > 0) {
            const peakCost = peakUsage.reduce((sum, entry) => sum + entry.cost, 0);
            const peakSavings = peakCost * 0.3; // Assume 30% savings by shifting usage

            this.optimizationSuggestions.push({
                id: 'peak-hours',
                title: 'Optimize Peak Hour Usage',
                description: 'Shift high-energy activities away from peak hours to reduce electricity costs.',
                impact: 'High',
                monthlySavings: peakSavings,
                energyReduction: peakUsage.reduce((sum, entry) => sum + entry.consumption, 0) * 0.3,
                co2Reduction: peakUsage.reduce((sum, entry) => sum + entry.carbon, 0) * 0.3,
                type: 'schedule'
            });
        }

        this.renderOptimizationSuggestions();
        this.updateDashboard();
    }

    calculateUpgradeSavings(device) {
        const efficiencyGain = (10 - device.efficiency) / 10;
        const dailyConsumption = this.calculateDailyConsumption(device);
        const dailySavings = dailyConsumption * efficiencyGain;
        return dailySavings * 30 * this.settings.electricityRate;
    }

    calculateUpgradeEnergySavings(device) {
        const efficiencyGain = (10 - device.efficiency) / 10;
        const dailyConsumption = this.calculateDailyConsumption(device);
        return dailyConsumption * efficiencyGain * 30;
    }

    calculateUpgradeCarbonSavings(device) {
        return this.calculateUpgradeEnergySavings(device) * this.settings.carbonFactor;
    }

    renderOptimizationSuggestions() {
        const container = document.getElementById('suggestions-list');
        container.innerHTML = '';

        if (this.optimizationSuggestions.length === 0) {
            container.innerHTML = '<p>No optimization suggestions available. Add more devices and usage data for personalized recommendations.</p>';
            return;
        }

        const totalSavings = this.optimizationSuggestions.reduce((sum, s) => sum + s.monthlySavings, 0);
        const totalEnergy = this.optimizationSuggestions.reduce((sum, s) => sum + s.energyReduction, 0);
        const totalCarbon = this.optimizationSuggestions.reduce((sum, s) => sum + s.co2Reduction, 0);

        document.getElementById('monthly-savings').textContent = `$${totalSavings.toFixed(2)}`;
        document.getElementById('energy-reduction').textContent = `${totalEnergy.toFixed(1)} kWh`;
        document.getElementById('co2-reduction').textContent = `${totalCarbon.toFixed(1)} kg`;

        this.optimizationSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-header">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-impact">${suggestion.impact} Impact</div>
                </div>
                <div class="suggestion-description">${suggestion.description}</div>
                <div class="suggestion-metrics">
                    <span>💰 $${suggestion.monthlySavings.toFixed(2)}/month</span>
                    <span>⚡ ${suggestion.energyReduction.toFixed(1)} kWh/month</span>
                    <span>🌱 ${suggestion.co2Reduction.toFixed(1)} kg CO₂/month</span>
                </div>
                <div class="suggestion-actions">
                    <button class="apply-btn" onclick="optimizer.applySuggestion('${suggestion.id}')">Apply</button>
                </div>
            `;
            container.appendChild(suggestionItem);
        });
    }

    applySuggestion(suggestionId) {
        const suggestion = this.optimizationSuggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;

        // Mark as applied (in a real app, this would implement the change)
        suggestion.applied = true;

        // Remove from suggestions
        this.optimizationSuggestions = this.optimizationSuggestions.filter(s => s.id !== suggestionId);

        this.renderOptimizationSuggestions();
        this.updateDashboard();

        alert(`Applied optimization: ${suggestion.title}`);
    }

    applyAllSuggestions() {
        if (this.optimizationSuggestions.length === 0) return;

        const appliedCount = this.optimizationSuggestions.length;
        this.optimizationSuggestions = [];
        this.renderOptimizationSuggestions();
        this.updateDashboard();

        alert(`Applied ${appliedCount} optimization suggestions!`);
    }

    initializeCharts() {
        const ctx1 = document.getElementById('consumption-chart').getContext('2d');
        this.charts.consumption = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Daily Consumption (kWh)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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

        const ctx2 = document.getElementById('main-analytics-chart').getContext('2d');
        this.charts.analytics = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Consumption',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        const ctx3 = document.getElementById('device-breakdown-chart').getContext('2d');
        this.charts.deviceBreakdown = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        const ctx4 = document.getElementById('peak-usage-chart').getContext('2d');
        this.charts.peakUsage = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                datasets: [{
                    label: 'Average Consumption (kWh)',
                    data: [],
                    backgroundColor: '#10b981'
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

        const ctx5 = document.getElementById('efficiency-chart').getContext('2d');
        this.charts.efficiency = new Chart(ctx5, {
            type: 'radar',
            data: {
                labels: ['Energy Efficiency', 'Cost Optimization', 'Carbon Reduction', 'Smart Features', 'Usage Patterns'],
                datasets: [{
                    label: 'Current Score',
                    data: [0, 0, 0, 0, 0],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });

        this.updateCharts();
    }

    updateCharts() {
        // Update consumption chart (last 7 days)
        const last7Days = [];
        const consumptionData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayEntries = this.entries.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === date.getTime();
            });

            const dayConsumption = dayEntries.reduce((sum, entry) => sum + entry.consumption, 0);

            last7Days.push(date.toLocaleDateString());
            consumptionData.push(dayConsumption);
        }

        this.charts.consumption.data.labels = last7Days;
        this.charts.consumption.data.datasets[0].data = consumptionData;
        this.charts.consumption.update();

        // Update analytics chart
        this.updateAnalyticsChart();

        // Update device breakdown
        const deviceConsumption = {};
        this.devices.forEach(device => {
            const deviceEntries = this.entries.filter(entry => entry.deviceId === device.id);
            deviceConsumption[device.name] = deviceEntries.reduce((sum, entry) => sum + entry.consumption, 0);
        });

        const sortedDevices = Object.entries(deviceConsumption)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.charts.deviceBreakdown.data.labels = sortedDevices.map(([name]) => name);
        this.charts.deviceBreakdown.data.datasets[0].data = sortedDevices.map(([, consumption]) => consumption);
        this.charts.deviceBreakdown.update();

        // Update peak usage chart
        const hourlyConsumption = new Array(24).fill(0);
        this.entries.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            hourlyConsumption[hour] += entry.consumption;
        });

        // Calculate averages
        const totalDays = Math.max(1, Math.ceil((Date.now() - Math.min(...this.entries.map(e => new Date(e.timestamp).getTime()))) / (24 * 60 * 60 * 1000)));
        const avgHourly = hourlyConsumption.map(consumption => consumption / totalDays);

        this.charts.peakUsage.data.datasets[0].data = avgHourly;
        this.charts.peakUsage.update();

        // Update efficiency chart
        const efficiencyScore = this.calculateEfficiencyScore();
        this.charts.efficiency.data.datasets[0].data = [
            efficiencyScore.energy,
            efficiencyScore.cost,
            efficiencyScore.carbon,
            efficiencyScore.smart,
            efficiencyScore.usage
        ];
        this.charts.efficiency.update();
    }

    updateAnalyticsChart() {
        const timeRange = document.querySelector('.time-btn.active').dataset.range;
        const chartType = document.querySelector('.chart-btn.active').dataset.type;

        let days;
        switch (timeRange) {
            case '7d': days = 7; break;
            case '30d': days = 30; break;
            case '90d': days = 90; break;
            case '1y': days = 365; break;
            default: days = 7;
        }

        const labels = [];
        const data = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayEntries = this.entries.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === date.getTime();
            });

            let value = 0;
            switch (chartType) {
                case 'consumption':
                    value = dayEntries.reduce((sum, entry) => sum + entry.consumption, 0);
                    break;
                case 'cost':
                    value = dayEntries.reduce((sum, entry) => sum + entry.cost, 0);
                    break;
                case 'carbon':
                    value = dayEntries.reduce((sum, entry) => sum + entry.carbon, 0);
                    break;
            }

            labels.push(date.toLocaleDateString());
            data.push(value);
        }

        this.charts.analytics.data.labels = labels;
        this.charts.analytics.data.datasets[0].data = data;
        this.charts.analytics.data.datasets[0].label = chartType.charAt(0).toUpperCase() + chartType.slice(1);

        document.getElementById('main-chart-title').textContent = `Energy ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Trend`;
        this.charts.analytics.update();
    }

    setTimeRange(range) {
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-range="${range}"]`).classList.add('active');
        this.updateAnalyticsChart();
    }

    setChartType(type) {
        document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        this.updateAnalyticsChart();
    }

    calculateEfficiencyScore() {
        // Calculate various efficiency metrics (0-10 scale)
        const avgEfficiency = this.devices.reduce((sum, device) => sum + device.efficiency, 0) / Math.max(1, this.devices.length);
        const energyEfficiency = Math.min(10, avgEfficiency);

        const totalCost = this.entries.reduce((sum, entry) => sum + entry.cost, 0);
        const totalConsumption = this.entries.reduce((sum, entry) => sum + entry.consumption, 0);
        const avgCostPerKwh = totalConsumption > 0 ? totalCost / totalConsumption : this.settings.electricityRate;
        const costEfficiency = Math.max(0, Math.min(10, 10 - (avgCostPerKwh - this.settings.electricityRate) * 10));

        const renewableFactor = this.settings.renewablePercentage / 100;
        const carbonEfficiency = Math.min(10, renewableFactor * 10 + (10 - this.settings.carbonFactor) / 0.5);

        const smartDevices = this.devices.filter(d => d.smart).length;
        const smartEfficiency = Math.min(10, (smartDevices / Math.max(1, this.devices.length)) * 10);

        const peakUsage = this.entries.filter(entry => this.isPeakHour(new Date(entry.timestamp))).length;
        const totalUsage = this.entries.length;
        const usageEfficiency = Math.max(0, Math.min(10, 10 - (peakUsage / Math.max(1, totalUsage)) * 10));

        return {
            energy: energyEfficiency,
            cost: costEfficiency,
            carbon: carbonEfficiency,
            smart: smartEfficiency,
            usage: usageEfficiency
        };
    }

    generateReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            period: 'Last 30 days',
            summary: {
                totalConsumption: this.entries.reduce((sum, entry) => sum + entry.consumption, 0),
                totalCost: this.entries.reduce((sum, entry) => sum + entry.cost, 0),
                totalCarbon: this.entries.reduce((sum, entry) => sum + entry.carbon, 0),
                deviceCount: this.devices.length,
                optimizationSuggestions: this.optimizationSuggestions.length
            },
            devices: this.devices,
            topConsumers: this.getTopConsumers(),
            efficiency: this.calculateEfficiencyScore()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `energy-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getTopConsumers() {
        const deviceConsumption = {};
        this.devices.forEach(device => {
            const deviceEntries = this.entries.filter(entry => entry.deviceId === device.id);
            deviceConsumption[device.name] = deviceEntries.reduce((sum, entry) => sum + entry.consumption, 0);
        });

        return Object.entries(deviceConsumption)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    exportData() {
        const data = {
            devices: this.devices,
            entries: this.entries,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'energy-optimizer-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importData() {
        document.getElementById('import-file').click();
    }

    handleImport(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.devices) this.devices = data.devices;
                if (data.entries) this.entries = data.entries;
                if (data.settings) this.settings = { ...this.settings, ...data.settings };

                this.saveDevices();
                this.saveEntries();
                this.saveSettings();
                this.loadSettings();
                this.renderDevices();
                this.updateDeviceSelect();
                this.updateEntriesList();
                this.updateDashboard();
                this.runOptimization();

                alert('Data imported successfully!');
            } catch (error) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        this.devices = [];
        this.entries = [];
        this.optimizationSuggestions = [];
        this.saveDevices();
        this.saveEntries();
        this.renderDevices();
        this.updateDeviceSelect();
        this.updateEntriesList();
        this.updateDashboard();
        this.runOptimization();
    }

    resetSettings() {
        this.settings = {
            electricityRate: 0.12,
            peakRate: 0.18,
            offPeakRate: 0.08,
            peakHours: '17:00-21:00',
            carbonFactor: 0.429,
            renewablePercentage: 25,
            location: 'us',
            autoTracking: true,
            notifications: true,
            dataRetention: 90,
            currency: 'USD'
        };
        this.saveSettings();
        this.loadSettings();
        this.updateDashboard();
        this.runOptimization();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.optimizer = new EnergyConsumptionOptimizer();
});