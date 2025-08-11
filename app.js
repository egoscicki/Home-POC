// Home Property Valuation Tracker
// API Key: 781535378a134991b5cbfc3a1df24acc

class HomeValueTracker {
    constructor() {
        this.apiKey = '781535378a134991b5cbfc3a1df24acc';
        this.baseUrl = 'https://api.rentcast.io/v1';
        this.currentProperty = null;
        this.valueChart = null;
        
        this.initializeEventListeners();
        this.setupChart();
    }

    initializeEventListeners() {
        const addressInput = document.getElementById('addressInput');
        const searchBtn = document.getElementById('searchBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const retryBtn = document.getElementById('retryBtn');

        // Address input with autocomplete
        addressInput.addEventListener('input', this.handleAddressInput.bind(this));
        addressInput.addEventListener('focus', this.showSuggestions.bind(this));
        
        // Search button
        searchBtn.addEventListener('click', this.searchProperty.bind(this));
        
        // Enter key in address input
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProperty();
            }
        });

        // Refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshProperty.bind(this));
        }

        // Retry button
        if (retryBtn) {
            retryBtn.addEventListener('click', this.retrySearch.bind(this));
        }

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-group')) {
                this.hideSuggestions();
            }
        });
    }

    async handleAddressInput(e) {
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            this.hideSuggestions();
            return;
        }

        try {
            const suggestions = await this.getAddressSuggestions(query);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error getting address suggestions:', error);
        }
    }

    async getAddressSuggestions(query) {
        // For demo purposes, we'll create some sample suggestions
        // In a real implementation, you'd call a geocoding API
        const sampleAddresses = [
            '123 Main St, New York, NY 10001',
            '456 Oak Ave, Los Angeles, CA 90210',
            '789 Pine Rd, Chicago, IL 60601',
            '321 Elm St, Miami, FL 33101',
            '654 Maple Dr, Seattle, WA 98101'
        ];

        return sampleAddresses
            .filter(addr => addr.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
    }

    displaySuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('suggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsDiv.innerHTML = suggestions
            .map(addr => `<div class="suggestion-item" onclick="homeTracker.selectAddress('${addr}')">${addr}</div>`)
            .join('');
        
        suggestionsDiv.style.display = 'block';
    }

    selectAddress(address) {
        document.getElementById('addressInput').value = address;
        this.hideSuggestions();
        this.searchProperty();
    }

    showSuggestions() {
        const suggestionsDiv = document.getElementById('suggestions');
        if (suggestionsDiv.children.length > 0) {
            suggestionsDiv.style.display = 'block';
        }
    }

    hideSuggestions() {
        document.getElementById('suggestions').style.display = 'none';
    }

    async searchProperty() {
        const address = document.getElementById('addressInput').value.trim();
        
        if (!address) {
            this.showError('Please enter a valid address');
            return;
        }

        this.showLoading();
        this.hideSuggestions();

        try {
            // First, get property details
            const propertyData = await this.getPropertyData(address);
            
            if (propertyData) {
                this.currentProperty = propertyData;
                this.displayPropertyData(propertyData);
                this.hideLoading();
                this.showPropertySection();
            } else {
                throw new Error('No property data found');
            }
        } catch (error) {
            console.error('Error searching property:', error);
            this.showError(error.message || 'Failed to fetch property data');
            this.hideLoading();
        }
    }

    async getPropertyData(address) {
        // For demo purposes, we'll create sample property data
        // In a real implementation, you'd call the RentCast API
        const sampleData = {
            address: address,
            propertyType: 'Single Family Home',
            currentValue: 750000,
            previousValue: 720000,
            lastSoldDate: '2020-06-15',
            squareFootage: 2400,
            bedrooms: 4,
            bathrooms: 2.5,
            lotSize: '0.25 acres',
            yearBuilt: 2015,
            features: {
                pool: true,
                fireplace: true,
                garage: true
            },
            valueHistory: [
                { date: '2020-01', value: 680000 },
                { date: '2020-06', value: 720000 },
                { date: '2021-01', value: 735000 },
                { date: '2021-06', value: 740000 },
                { date: '2022-01', value: 745000 },
                { date: '2022-06', value: 750000 }
            ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return sampleData;
    }

    displayPropertyData(data) {
        // Update main property info
        document.getElementById('propertyAddress').textContent = data.address;
        document.getElementById('propertyType').textContent = data.propertyType;
        
        // Update current value
        document.getElementById('currentValue').textContent = this.formatCurrency(data.currentValue);
        
        // Update value change
        const valueChange = data.currentValue - data.previousValue;
        const changePercentage = ((valueChange / data.previousValue) * 100).toFixed(1);
        
        const changeAmount = document.querySelector('.change-amount');
        const changePercent = document.querySelector('.change-percentage');
        
        changeAmount.textContent = `${valueChange >= 0 ? '+' : ''}${this.formatCurrency(valueChange)}`;
        changePercent.textContent = `${valueChange >= 0 ? '+' : ''}${changePercentage}%`;
        
        if (valueChange < 0) {
            changeAmount.style.color = '#FF3B30';
            changePercent.style.color = '#FF3B30';
            changePercent.style.background = 'rgba(255, 59, 48, 0.1)';
        }

        // Update property features
        this.updateFeatures(data.features);
        
        // Update property details
        document.getElementById('lastSoldDate').textContent = this.formatDate(data.lastSoldDate);
        document.getElementById('squareFootage').textContent = this.formatNumber(data.squareFootage);
        document.getElementById('bedrooms').textContent = data.bedrooms;
        document.getElementById('bathrooms').textContent = data.bathrooms;
        document.getElementById('lotSize').textContent = data.lotSize;
        document.getElementById('yearBuilt').textContent = data.yearBuilt;
        
        // Update chart
        this.updateChart(data.valueHistory);
    }

    updateFeatures(features) {
        const poolFeature = document.getElementById('poolFeature');
        const fireplaceFeature = document.getElementById('fireplaceFeature');
        const garageFeature = document.getElementById('garageFeature');
        
        poolFeature.classList.toggle('active', features.pool);
        fireplaceFeature.classList.toggle('active', features.fireplace);
        garageFeature.classList.toggle('active', features.garage);
    }

    setupChart() {
        const ctx = document.getElementById('valueChart').getContext('2d');
        
        this.valueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Property Value',
                    data: [],
                    borderColor: '#007AFF',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007AFF',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    updateChart(valueHistory) {
        if (!this.valueChart) return;
        
        const labels = valueHistory.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        const values = valueHistory.map(item => item.value);
        
        this.valueChart.data.labels = labels;
        this.valueChart.data.datasets[0].data = values;
        this.valueChart.update();
    }

    async refreshProperty() {
        if (this.currentProperty) {
            await this.searchProperty();
        }
    }

    retrySearch() {
        this.hideError();
        this.searchProperty();
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('propertySection').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
    }

    showPropertySection() {
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('propertySection').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('propertySection').style.display = 'none';
        document.getElementById('loadingState').style.display = 'none';
    }

    hideError() {
        document.getElementById('errorState').style.display = 'none';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homeTracker = new HomeValueTracker();
});

// Add click handler for suggestions
window.selectAddress = function(address) {
    window.homeTracker.selectAddress(address);
};
