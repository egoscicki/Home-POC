// Home Property Valuation Tracker
// API Key: 781535378a134991b5cbfc3a1df24acc

class HomeValueTracker {
    constructor() {
        this.apiKey = '781535378a134991b5cbfc3a1df24acc';
        this.googleApiKey = null;
        this.baseUrl = 'https://api.rentcast.io/v1';
        this.currentProperty = null;
        this.valueChart = null;
        this.autocompleteService = null;
        this.placesService = null;
        
        this.initializeEventListeners();
        this.setupChart();
        this.initializeGooglePlaces();
        this.updateApiStatus();
    }

    initializeGooglePlaces() {
        // Check if user provided a Google API key
        const googleApiKeyInput = document.getElementById('googleApiKey');
        if (googleApiKeyInput) {
            googleApiKeyInput.addEventListener('input', (e) => {
                this.googleApiKey = e.target.value.trim();
                if (this.googleApiKey) {
                    this.loadGoogleMapsAPI();
                }
            });
        }

        // Initialize Google Places Autocomplete
        if (window.google && window.google.maps) {
            this.setupGooglePlacesAutocomplete();
        } else if (this.googleApiKey) {
            this.loadGoogleMapsAPI();
        }
    }

    loadGoogleMapsAPI() {
        if (!this.googleApiKey) {
            console.log('No Google API key provided, using basic autocomplete');
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleApiKey}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        window.initGooglePlaces = () => {
            this.setupGooglePlacesAutocomplete();
            this.updateApiStatus();
        };
    }

    setupGooglePlacesAutocomplete() {
        const addressInput = document.getElementById('addressInput');
        
        try {
            const autocomplete = new google.maps.places.Autocomplete(addressInput, {
                types: ['address'],
                componentRestrictions: { country: 'us' },
                fields: ['formatted_address', 'geometry', 'place_id', 'photos']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    // Store the place data for image fetching
                    this.selectedPlace = place;
                    this.searchProperty();
                }
            });

            console.log('Google Places Autocomplete initialized successfully');
        } catch (error) {
            console.error('Error setting up Google Places Autocomplete:', error);
        }
    }

    initializeEventListeners() {
        const addressInput = document.getElementById('addressInput');
        const searchBtn = document.getElementById('searchBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const retryBtn = document.getElementById('retryBtn');
        const rentcastApiKeyInput = document.getElementById('rentcastApiKey');

        // API key input handling
        if (rentcastApiKeyInput) {
            rentcastApiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value.trim();
                this.updateApiStatus();
            });
        }

        // Address input with enhanced autocomplete
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
            // Use Google Places API for real address suggestions
            const suggestions = await this.getAddressSuggestions(query);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error getting address suggestions:', error);
            // Fallback to basic suggestions
            this.showBasicSuggestions(query);
        }
    }

    async getAddressSuggestions(query) {
        return new Promise((resolve) => {
            if (!window.google || !window.google.maps) {
                resolve([]);
                return;
            }

            const service = new google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: query,
                types: ['address'],
                componentRestrictions: { country: 'us' }
            }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    resolve(predictions.slice(0, 5));
                } else {
                    resolve([]);
                }
            });
        });
    }

    showBasicSuggestions(query) {
        const sampleAddresses = [
            '123 Main St, New York, NY 10001',
            '456 Oak Ave, Los Angeles, CA 90210',
            '789 Pine Rd, Chicago, IL 60601',
            '321 Elm St, Miami, FL 33101',
            '654 Maple Dr, Seattle, WA 98101'
        ];

        const filtered = sampleAddresses
            .filter(addr => addr.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
        
        this.displaySuggestions(filtered);
    }

    displaySuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('suggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        let html = '';
        if (suggestions[0] && suggestions[0].description) {
            // Google Places API suggestions
            html = suggestions
                .map(prediction => `<div class="suggestion-item" onclick="homeTracker.selectAddress('${prediction.description}')">${prediction.description}</div>`)
                .join('');
        } else {
            // Basic suggestions
            html = suggestions
                .map(addr => `<div class="suggestion-item" onclick="homeTracker.selectAddress('${addr}')">${addr}</div>`)
                .join('');
        }

        suggestionsDiv.innerHTML = html;
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
            // First, get property details from RentCast API
            const propertyData = await this.getPropertyDataFromAPI(address);
            
            if (propertyData) {
                this.currentProperty = propertyData;
                this.displayPropertyData(propertyData);
                
                // Fetch and display property image if Google Places is available
                if (this.selectedPlace && this.googleApiKey) {
                    await this.fetchAndDisplayPropertyImage(this.selectedPlace);
                } else if (this.googleApiKey) {
                    // Try to get image from address if no place was selected
                    await this.getPropertyImageFromAddress(address);
                }
                
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

    async fetchAndDisplayPropertyImage(place) {
        try {
            console.log('🖼️ Fetching property image for place:', place);
            
            if (!place.photos || place.photos.length === 0) {
                console.log('⚠️ No photos available for this property');
                this.showImagePlaceholder();
                return;
            }

            // Show loading state for image
            this.showImageLoading();

            // Get the first photo (usually the best one)
            const photo = place.photos[0];
            const maxWidth = 600; // Optimal size for display
            
            // Request the photo with specific dimensions
            const photoUrl = photo.getUrl({
                maxWidth: maxWidth,
                maxHeight: 400
            });

            console.log('📸 Photo URL:', photoUrl);

            // Create and display the image
            await this.displayPropertyImage(photoUrl);

        } catch (error) {
            console.error('❌ Error fetching property image:', error);
            this.showImagePlaceholder();
        }
    }

    async displayPropertyImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const propertyImageDiv = document.getElementById('propertyImage');
            
            img.onload = () => {
                // Hide loading state
                this.hideImageLoading();
                
                // Clear placeholder and add image
                propertyImageDiv.innerHTML = '';
                propertyImageDiv.appendChild(img);
                
                console.log('✅ Property image displayed successfully');
                resolve();
            };
            
            img.onerror = () => {
                console.error('❌ Failed to load property image');
                this.hideImageLoading();
                this.showImagePlaceholder();
                reject(new Error('Failed to load image'));
            };
            
            // Set image source to start loading
            img.src = imageUrl;
        });
    }

    showImageLoading() {
        const imageLoading = document.getElementById('imageLoading');
        if (imageLoading) {
            imageLoading.style.display = 'flex';
        }
    }

    hideImageLoading() {
        const imageLoading = document.getElementById('imageLoading');
        if (imageLoading) {
            imageLoading.style.display = 'none';
        }
    }

    showImagePlaceholder() {
        const propertyImageDiv = document.getElementById('propertyImage');
        if (propertyImageDiv) {
            propertyImageDiv.innerHTML = `
                <div class="image-placeholder">
                    <i class="fas fa-home placeholder-icon"></i>
                    <span>No Image Available</span>
                </div>
            `;
        }
    }

    // Enhanced method to get property image from address if Google Places isn't available
    async getPropertyImageFromAddress(address) {
        if (!this.googleApiKey) {
            console.log('⚠️ No Google API key available for image search');
            return null;
        }

        try {
            console.log('🔍 Searching for property image using address:', address);
            
            // Use Google Geocoding API to get coordinates
            const geocoder = new google.maps.Geocoder();
            
            return new Promise((resolve, reject) => {
                geocoder.geocode({ address: address }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const place = results[0];
                        console.log('📍 Geocoded place:', place);
                        
                        // Use Places API to get photos
                        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
                        
                        placesService.getDetails({
                            placeId: place.place_id,
                            fields: ['photos']
                        }, (placeDetails, placeStatus) => {
                            if (placeStatus === 'OK' && placeDetails && placeDetails.photos) {
                                console.log('📸 Found photos for address:', placeDetails.photos.length);
                                const photo = placeDetails.photos[0];
                                
                                // Display the found image
                                this.showImageLoading();
                                const photoUrl = photo.getUrl({
                                    maxWidth: 600,
                                    maxHeight: 400
                                });
                                
                                this.displayPropertyImage(photoUrl);
                                resolve(photo);
                            } else {
                                console.log('⚠️ No photos found for address');
                                this.showImagePlaceholder();
                                resolve(null);
                            }
                        });
                    } else {
                        console.log('❌ Geocoding failed for address:', status);
                        this.showImagePlaceholder();
                        resolve(null);
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Error getting property image from address:', error);
            this.showImagePlaceholder();
            return null;
        }
    }

    async getPropertyDataFromAPI(address) {
        try {
            console.log('🔍 Searching for property:', address);
            console.log('🔑 Using RentCast API key:', this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT SET');
            console.log('🌐 API Base URL:', this.baseUrl);

            // First, search for the property
            const searchUrl = `${this.baseUrl}/properties?address=${encodeURIComponent(address)}`;
            console.log('📡 Search URL:', searchUrl);

            const searchResponse = await fetch(searchUrl, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Search Response Status:', searchResponse.status);
            console.log('📥 Search Response Headers:', Object.fromEntries(searchResponse.headers.entries()));

            if (!searchResponse.ok) {
                const errorText = await searchResponse.text();
                console.error('❌ Search API Error Response:', errorText);
                throw new Error(`RentCast Search API Error: ${searchResponse.status} ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();
            console.log('🔍 Search Results:', searchData);
            
            if (!searchData || searchData.length === 0) {
                throw new Error('No properties found for this address. Please check the address and try again.');
            }

            const property = searchData[0];
            const propertyId = property.id;
            console.log('🏠 Found Property ID:', propertyId);

            // Get detailed property information
            const detailsUrl = `${this.baseUrl}/properties/${propertyId}`;
            console.log('📡 Details URL:', detailsUrl);

            const detailsResponse = await fetch(detailsUrl, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Details Response Status:', detailsResponse.status);

            if (!detailsResponse.ok) {
                const errorText = await detailsResponse.text();
                console.error('❌ Details API Error Response:', errorText);
                throw new Error(`Failed to get property details: ${detailsResponse.status} ${detailsResponse.statusText}`);
            }

            const propertyDetails = await detailsResponse.json();
            console.log('🏠 Property Details:', propertyDetails);

            // Get property value history
            const historyUrl = `${this.baseUrl}/properties/${propertyId}/rental-history`;
            console.log('📡 History URL:', historyUrl);

            const historyResponse = await fetch(historyUrl, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 History Response Status:', historyResponse.status);

            let valueHistory = [];
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                console.log('📊 Rental History:', historyData);
                valueHistory = this.processValueHistory(historyData);
            } else {
                console.warn('⚠️ Could not fetch rental history:', historyResponse.status, historyResponse.statusText);
            }

            // Transform RentCast data to our format
            const transformedData = this.transformRentCastData(propertyDetails, valueHistory);
            console.log('✨ Transformed Data:', transformedData);
            
            return transformedData;

        } catch (error) {
            console.error('❌ RentCast API Error:', error);
            console.error('🔍 Error Details:', {
                message: error.message,
                stack: error.stack,
                address: address,
                apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'NOT SET'
            });
            
            // Fallback to sample data for demo purposes
            console.log('🔄 Falling back to sample data...');
            return this.getSamplePropertyData(address);
        }
    }

    transformRentCastData(propertyDetails, valueHistory) {
        console.log('🔄 Transforming RentCast data...');
        console.log('📊 Original property details:', propertyDetails);
        
        const transformed = {
            address: propertyDetails.formattedAddress || propertyDetails.address || propertyDetails.streetAddress || 'Address not available',
            propertyType: propertyDetails.propertyType || propertyDetails.type || 'Single Family Home',
            currentValue: propertyDetails.price || propertyDetails.estimatedValue || propertyDetails.marketValue || 0,
            previousValue: propertyDetails.lastSoldPrice || propertyDetails.previousPrice || 0,
            lastSoldDate: propertyDetails.lastSoldDate || propertyDetails.soldDate || 'Unknown',
            squareFootage: propertyDetails.squareFootage || propertyDetails.sqft || 0,
            bedrooms: propertyDetails.bedrooms || propertyDetails.beds || 0,
            bathrooms: propertyDetails.bathrooms || propertyDetails.baths || 0,
            lotSize: propertyDetails.lotSize || propertyDetails.acres ? `${propertyDetails.acres} acres` : 'Unknown',
            yearBuilt: propertyDetails.yearBuilt || propertyDetails.builtYear || 0,
            features: {
                pool: this.checkFeature(propertyDetails, 'pool'),
                fireplace: this.checkFeature(propertyDetails, 'fireplace'),
                garage: this.checkFeature(propertyDetails, 'garage')
            },
            valueHistory: valueHistory.length > 0 ? valueHistory : this.generateSampleValueHistory()
        };

        console.log('✨ Transformed data:', transformed);
        return transformed;
    }

    checkFeature(propertyDetails, feature) {
        const amenities = propertyDetails.amenities || propertyDetails.features || [];
        const description = (propertyDetails.description || '').toLowerCase();
        const propertyType = (propertyDetails.propertyType || '').toLowerCase();
        
        // Check multiple sources for features
        return amenities.some(amenity => 
            amenity.toLowerCase().includes(feature)
        ) || description.includes(feature) || propertyType.includes(feature);
    }

    processValueHistory(historyData) {
        if (!historyData || !Array.isArray(historyData)) return [];
        
        return historyData
            .filter(item => item.price && item.date)
            .map(item => ({
                date: item.date,
                value: item.price
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-6); // Last 6 data points
    }

    generateSampleValueHistory() {
        const baseValue = 750000;
        const history = [];
        const months = 6;
        
        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (months - i - 1));
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            const value = Math.round(baseValue * (1 + variation));
            
            history.push({
                date: date.toISOString().slice(0, 7), // YYYY-MM format
                value: value
            });
        }
        
        return history;
    }

    getSamplePropertyData(address) {
        // Enhanced sample data for demo purposes
        const baseValue = 750000 + Math.floor(Math.random() * 200000);
        const previousValue = baseValue - Math.floor(Math.random() * 50000);
        
        return {
            address: address,
            propertyType: 'Single Family Home',
            currentValue: baseValue,
            previousValue: previousValue,
            lastSoldDate: '2020-06-15',
            squareFootage: 2000 + Math.floor(Math.random() * 1000),
            bedrooms: 3 + Math.floor(Math.random() * 3),
            bathrooms: 2 + Math.floor(Math.random() * 2),
            lotSize: '0.25 acres',
            yearBuilt: 2010 + Math.floor(Math.random() * 15),
            features: {
                pool: Math.random() > 0.5,
                fireplace: Math.random() > 0.3,
                garage: Math.random() > 0.2
            },
            valueHistory: this.generateSampleValueHistory()
        };
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

    updateApiStatus() {
        const rentcastStatus = document.getElementById('rentcastStatus');
        const googleStatus = document.getElementById('googleStatus');

        if (rentcastStatus) {
            if (this.apiKey && this.apiKey.length > 0) {
                rentcastStatus.className = 'fas fa-circle status-icon connected';
                rentcastStatus.title = 'RentCast API Connected';
            } else {
                rentcastStatus.className = 'fas fa-circle status-icon disconnected';
                rentcastStatus.title = 'RentCast API Key Missing';
            }
        }

        if (googleStatus) {
            if (window.google && window.google.maps) {
                googleStatus.className = 'fas fa-circle status-icon connected';
                googleStatus.title = 'Google Places Connected';
            } else if (this.googleApiKey) {
                googleStatus.className = 'fas fa-circle status-icon loading';
                googleStatus.title = 'Google Places Loading...';
            } else {
                googleStatus.className = 'fas fa-circle status-icon disconnected';
                googleStatus.title = 'Google Places Not Available';
            }
        }
    }

    async testRentCastAPI() {
        console.log('🧪 Testing RentCast API connection...');
        
        try {
            const testUrl = `${this.baseUrl}/properties?address=123%20Main%20St%2C%20New%20York%2C%20NY%2010001&limit=1`;
            console.log('📡 Test URL:', testUrl);
            
            const response = await fetch(testUrl, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Test Response Status:', response.status);
            console.log('📥 Test Response Headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Test Successful:', data);
                alert('✅ RentCast API is working correctly!');
            } else {
                const errorText = await response.text();
                console.error('❌ API Test Failed:', response.status, errorText);
                alert(`❌ API Test Failed: ${response.status} ${response.statusText}\n\nCheck the console for details.`);
            }
        } catch (error) {
            console.error('❌ API Test Error:', error);
            alert(`❌ API Test Error: ${error.message}\n\nCheck the console for details.`);
        }
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
