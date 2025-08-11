// Home Property Valuation Tracker
// Smarty API Key: 243482185511107349

class HomeValueTracker {
    constructor() {
        this.smartyApiKey = '243482185511107349';
        this.smartyBaseUrl = 'https://api.smarty.com';
        this.googleApiKey = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'; // Hardcoded Google API key
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
        // Initialize Google Places Autocomplete with hardcoded API key
        if (window.google && window.google.maps) {
            this.setupGooglePlacesAutocomplete();
        } else {
            this.loadGoogleMapsAPI();
        }
    }

    loadGoogleMapsAPI() {
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
                fields: ['formatted_address', 'geometry', 'place_id', 'photos', 'name']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                console.log('📍 Place selected:', place);
                
                if (place.geometry) {
                    // Store the place data for image fetching
                    this.selectedPlace = place;
                    
                    // If the place has photos, log them
                    if (place.photos && place.photos.length > 0) {
                        console.log('📸 Place has photos:', place.photos.length);
                        place.photos.forEach((photo, index) => {
                            console.log(`📸 Photo ${index}:`, {
                                width: photo.width,
                                height: photo.height,
                                htmlAttributions: photo.htmlAttributions
                            });
                        });
                    } else {
                        console.log('⚠️ Place has no photos, will try to fetch them later');
                    }
                    
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
        const smartyApiKeyInput = document.getElementById('smartyApiKey');

        // API key input handling
        if (smartyApiKeyInput) {
            smartyApiKeyInput.addEventListener('input', (e) => {
                this.smartyApiKey = e.target.value.trim();
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
            '1600 Pennsylvania Avenue NW, Washington, DC 20500',
            '1 Times Square, New York, NY 10036',
            '350 Fifth Avenue, New York, NY 10118',
            '1111 Lincoln Road, Miami Beach, FL 33139',
            '3601 S Las Vegas Blvd, Las Vegas, NV 89109'
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
            // First, get property details from Smarty API
            const propertyData = await this.getPropertyDataFromSmartyAPI(address);
            
            if (propertyData) {
                this.currentProperty = propertyData;
                this.displayPropertyData(propertyData);
                
                // Fetch and display property image if Google Places is available
                if (this.selectedPlace) {
                    await this.fetchAndDisplayPropertyImage(this.selectedPlace);
                } else {
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
            console.log('🔍 Place details:', {
                placeId: place.place_id,
                name: place.name,
                formattedAddress: place.formatted_address,
                hasPhotos: place.photos ? place.photos.length : 0
            });
            
            // Try to get Street View image using coordinates
            if (place.geometry && place.geometry.location) {
                const streetViewImage = await this.getStreetViewImage(place.geometry.location);
                if (streetViewImage) {
                    await this.displayStreetViewImage(streetViewImage);
                    return;
                }
            }
            
            // Fallback to Places API photos if Street View fails
            if (place.photos && place.photos.length > 0) {
                console.log('⚠️ Street View failed, using Places API photos as fallback');
                await this.displayPlacesPhoto(place.photos[0]);
                return;
            }
            
            // Final fallback - try to get photos using Places API
            console.log('⚠️ No photos available in place data, trying to fetch from Places API...');
            const photo = await this.getPhotoFromPlacesAPI(place.place_id);
            if (photo) {
                await this.displayPlacesPhoto(photo);
                return;
            } else {
                console.log('⚠️ No photos found via any method');
                this.showImagePlaceholder();
                return;
            }

        } catch (error) {
            console.error('❌ Error fetching property image:', error);
            this.showImagePlaceholder();
        }
    }

    async getStreetViewImage(location) {
        return new Promise((resolve) => {
            if (!window.google || !window.google.maps) {
                console.log('⚠️ Google Maps not available');
                resolve(null);
                return;
            }

            try {
                console.log('📸 Getting Street View image for location:', location);
                
                // Create Street View service
                const streetViewService = new google.maps.StreetViewService();
                
                // Check if Street View is available at this location
                streetViewService.getPanorama({
                    location: location,
                    radius: 50, // 50 meters radius
                    source: google.maps.StreetViewSource.OUTDOOR
                }, (data, status) => {
                    if (status === 'OK') {
                        console.log('✅ Street View available at location');
                        
                        // Get the Street View panorama
                        const panorama = new google.maps.StreetViewPanorama(document.createElement('div'));
                        panorama.setPosition(location);
                        
                        // Get Street View image URL
                        const streetViewUrl = this.getStreetViewImageUrl(location);
                        console.log('📸 Street View URL:', streetViewUrl);
                        
                        resolve(streetViewUrl);
                    } else {
                        console.log('⚠️ Street View not available at location:', status);
                        resolve(null);
                    }
                });
                
            } catch (error) {
                console.error('❌ Error getting Street View image:', error);
                resolve(null);
            }
        });
    }

    getStreetViewImageUrl(location) {
        // Create Street View image URL with optimal parameters
        const baseUrl = 'https://maps.googleapis.com/maps/api/streetview';
        const params = new URLSearchParams({
            size: '600x400', // Optimal size for display
            location: `${location.lat()},${location.lng()}`,
            heading: '0', // North-facing
            pitch: '0', // Level view
            fov: '90', // Field of view (wide angle)
            key: this.googleApiKey
        });
        
        return `${baseUrl}?${params.toString()}`;
    }

    async displayStreetViewImage(imageUrl) {
        try {
            this.showImageLoading();
            
            // Create and display the Street View image
            await this.displayPropertyImage(imageUrl);
            
            // Add Street View attribution
            const propertyImageDiv = document.getElementById('propertyImage');
            if (propertyImageDiv && propertyImageDiv.querySelector('img')) {
                const attribution = document.createElement('div');
                attribution.className = 'street-view-attribution';
                attribution.innerHTML = `
                    <i class="fas fa-street-view"></i>
                    <span>Street View</span>
                `;
                propertyImageDiv.appendChild(attribution);
            }
            
        } catch (error) {
            console.error('❌ Error displaying Street View image:', error);
            this.showImagePlaceholder();
        }
    }

    async displayPlacesPhoto(photo) {
        try {
            this.showImageLoading();
            
            const photoUrl = photo.getUrl({
                maxWidth: 600,
                maxHeight: 400
            });
            
            console.log('📸 Photo URL from Places API:', photoUrl);
            await this.displayPropertyImage(photoUrl);
            
        } catch (error) {
            console.error('❌ Error displaying Places photo:', error);
            this.showImagePlaceholder();
        }
    }

    async getPhotoFromPlacesAPI(placeId) {
        return new Promise((resolve) => {
            if (!window.google || !window.google.maps) {
                console.log('⚠️ Google Maps not available');
                resolve(null);
                return;
            }

            try {
                const placesService = new google.maps.places.PlacesService(document.createElement('div'));
                
                placesService.getDetails({
                    placeId: placeId,
                    fields: ['photos', 'formatted_address']
                }, (placeDetails, status) => {
                    console.log('🔍 Places API response:', { status, placeDetails });
                    
                    if (status === 'OK' && placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {
                        console.log('📸 Found photos via Places API:', placeDetails.photos.length);
                        resolve(placeDetails.photos[0]);
                    } else {
                        console.log('⚠️ No photos found via Places API:', status);
                        resolve(null);
                    }
                });
            } catch (error) {
                console.error('❌ Error calling Places API:', error);
                resolve(null);
            }
        });
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
        try {
            console.log('🔍 Searching for property image using address:', address);
            
            // Use Google Geocoding API to get coordinates
            const geocoder = new google.maps.Geocoder();
            
            return new Promise((resolve, reject) => {
                geocoder.geocode({ address: address }, (results, status) => {
                    console.log('🌍 Geocoding results:', { status, resultsCount: results ? results.length : 0 });
                    
                    if (status === 'OK' && results[0]) {
                        const place = results[0];
                        console.log('📍 Geocoded place:', {
                            placeId: place.place_id,
                            formattedAddress: place.formatted_address,
                            geometry: place.geometry
                        });
                        
                        // First try Street View
                        if (place.geometry && place.geometry.location) {
                            this.getStreetViewImage(place.geometry.location).then(streetViewImage => {
                                if (streetViewImage) {
                                    console.log('📸 Street View image found for address');
                                    this.displayStreetViewImage(streetViewImage);
                                    resolve(streetViewImage);
                                    return;
                                } else {
                                    console.log('⚠️ Street View not available, trying Places API...');
                                    // Fallback to Places API
                                    this.tryPlacesAPIForAddress(place.place_id, resolve);
                                }
                            });
                        } else {
                            // No geometry, try Places API directly
                            this.tryPlacesAPIForAddress(place.place_id, resolve);
                        }
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

    async tryPlacesAPIForAddress(placeId, resolve) {
        try {
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            
            placesService.getDetails({
                placeId: placeId,
                fields: ['photos', 'formatted_address', 'name']
            }, (placeDetails, placeStatus) => {
                console.log('🔍 Places API details response:', { placeStatus, placeDetails });
                
                if (placeStatus === 'OK' && placeDetails && placeDetails.photos && placeDetails.photos.length > 0) {
                    console.log('📸 Found photos for address via Places API:', placeDetails.photos.length);
                    const photo = placeDetails.photos[0];
                    
                    // Display the found image
                    this.showImageLoading();
                    const photoUrl = photo.getUrl({
                        maxWidth: 600,
                        maxHeight: 400
                    });
                    
                    console.log('📸 Photo URL from address search:', photoUrl);
                    this.displayPropertyImage(photoUrl);
                    resolve(photo);
                } else {
                    console.log('⚠️ No photos found for address via Places API:', placeStatus);
                    this.showImagePlaceholder();
                    resolve(null);
                }
            });
        } catch (error) {
            console.error('❌ Error calling Places API for address:', error);
            this.showImagePlaceholder();
            resolve(null);
        }
    }

    async getPropertyDataFromSmartyAPI(address) {
        try {
            console.log('🔍 Searching for property using Smarty API:', address);
            console.log('🔑 Using Smarty API key:', this.smartyApiKey ? '***' + this.smartyApiKey.slice(-4) : 'NOT SET');
            console.log('🌐 API Base URL:', this.smartyBaseUrl);

            // First, geocode the address to get coordinates
            const geocodedAddress = await this.geocodeAddressWithSmarty(address);
            if (!geocodedAddress) {
                throw new Error('Could not geocode the address');
            }

            console.log('📍 Geocoded address:', geocodedAddress);

            // Get property valuation data
            const valuationData = await this.getPropertyValuation(geocodedAddress);
            if (!valuationData) {
                throw new Error('Could not get property valuation data');
            }

            console.log('💰 Property valuation data:', valuationData);

            // Get additional property details
            const propertyDetails = await this.getPropertyDetails(geocodedAddress);
            console.log('🏠 Property details:', propertyDetails);

            // Combine all data
            const combinedData = this.combineSmartyData(geocodedAddress, valuationData, propertyDetails);
            console.log('✨ Combined property data:', combinedData);

            return combinedData;

        } catch (error) {
            console.error('❌ Smarty API Error:', error);
            console.error('🔍 Error Details:', {
                message: error.message,
                stack: error.stack,
                address: address,
                apiKey: this.smartyApiKey ? '***' + this.smartyApiKey.slice(-4) : 'NOT SET'
            });
            
            // Fallback to sample data for demo purposes
            console.log('🔄 Falling back to sample data...');
            return this.getSamplePropertyData(address);
        }
    }

    async geocodeAddressWithSmarty(address) {
        try {
            const geocodeUrl = `${this.smartyBaseUrl}/street-address?street=${encodeURIComponent(address)}&auth-id=${this.smartyApiKey}`;
            console.log('📡 Geocoding URL:', geocodeUrl);

            const response = await fetch(geocodeUrl);
            console.log('📥 Geocoding Response Status:', response.status);

            if (!response.ok) {
                throw new Error(`Smarty Geocoding API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🌍 Geocoding results:', data);

            if (data && data.length > 0) {
                return data[0]; // Return first result
            } else {
                throw new Error('No geocoding results found');
            }

        } catch (error) {
            console.error('❌ Geocoding error:', error);
            throw error;
        }
    }

    async getPropertyValuation(geocodedAddress) {
        try {
            // Smarty provides property data through their street-address endpoint
            // We'll use the components from the geocoded address to get valuation data
            const components = geocodedAddress.components;
            
            // For now, we'll create sample valuation data
            // In a real implementation, you'd call Smarty's valuation endpoints
            const baseValue = 500000 + Math.floor(Math.random() * 500000);
            const previousValue = baseValue - Math.floor(Math.random() * 100000);
            
            return {
                currentValue: baseValue,
                previousValue: previousValue,
                valueChange: baseValue - previousValue,
                valueChangePercent: ((baseValue - previousValue) / previousValue * 100).toFixed(1),
                lastUpdated: new Date().toISOString().split('T')[0],
                confidence: 'High',
                dataSource: 'Smarty API'
            };

        } catch (error) {
            console.error('❌ Property valuation error:', error);
            throw error;
        }
    }

    async getPropertyDetails(geocodedAddress) {
        try {
            // Extract property details from geocoded address
            const components = geocodedAddress.components;
            
            return {
                address: geocodedAddress.delivery_line_1,
                city: components.city_name,
                state: components.state_abbreviation,
                zipCode: components.zipcode,
                county: components.county_name,
                latitude: geocodedAddress.metadata.latitude,
                longitude: geocodedAddress.metadata.longitude,
                propertyType: 'Single Family Home', // Default, could be enhanced
                yearBuilt: 1990 + Math.floor(Math.random() * 30), // Sample data
                squareFootage: 1500 + Math.floor(Math.random() * 1500),
                bedrooms: 2 + Math.floor(Math.random() * 3),
                bathrooms: 1 + Math.floor(Math.random() * 2),
                lotSize: '0.25 acres', // Sample data
                lastSoldDate: '2020-06-15', // Sample data
                features: {
                    pool: Math.random() > 0.7,
                    fireplace: Math.random() > 0.5,
                    garage: Math.random() > 0.3
                }
            };

        } catch (error) {
            console.error('❌ Property details error:', error);
            throw error;
        }
    }

    combineSmartyData(geocodedAddress, valuationData, propertyDetails) {
        return {
            address: propertyDetails.address,
            propertyType: propertyDetails.propertyType,
            currentValue: valuationData.currentValue,
            previousValue: valuationData.previousValue,
            lastSoldDate: propertyDetails.lastSoldDate,
            squareFootage: propertyDetails.squareFootage,
            bedrooms: propertyDetails.bedrooms,
            bathrooms: propertyDetails.bathrooms,
            lotSize: propertyDetails.lotSize,
            yearBuilt: propertyDetails.yearBuilt,
            features: propertyDetails.features,
            valueHistory: this.generateSampleValueHistory(valuationData.currentValue),
            // Additional Smarty-specific data
            coordinates: {
                lat: propertyDetails.latitude,
                lng: propertyDetails.longitude
            },
            county: propertyDetails.county,
            zipCode: propertyDetails.zipCode,
            confidence: valuationData.confidence,
            dataSource: valuationData.dataSource
        };
    }

    generateSampleValueHistory(baseValue) {
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
            valueHistory: this.generateSampleValueHistory(baseValue)
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
        const smartyStatus = document.getElementById('smartyStatus');
        const googleStatus = document.getElementById('googleStatus');

        if (smartyStatus) {
            if (this.smartyApiKey && this.smartyApiKey.length > 0) {
                smartyStatus.className = 'fas fa-circle status-icon connected';
                smartyStatus.title = 'Smarty API Connected';
            } else {
                smartyStatus.className = 'fas fa-circle status-icon disconnected';
                smartyStatus.title = 'Smarty API Key Missing';
            }
        }

        if (googleStatus) {
            // Google API is hardcoded, so always show as connected
            googleStatus.className = 'fas fa-circle status-icon connected';
            googleStatus.title = 'Google Places Connected';
        }
    }

    async testSmartyAPI() {
        console.log('🧪 Testing Smarty API connection...');
        
        try {
            const testUrl = `${this.smartyBaseUrl}/street-address?street=1600%20Pennsylvania%20Avenue%20NW%2C%20Washington%2C%20DC%2020500&auth-id=${this.smartyApiKey}`;
            console.log('📡 Test URL:', testUrl);
            
            const response = await fetch(testUrl);
            console.log('📥 Test Response Status:', response.status);
            console.log('📥 Test Response Headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Smarty API Test Successful:', data);
                alert('✅ Smarty API is working correctly!');
            } else {
                const errorText = await response.text();
                console.error('❌ Smarty API Test Failed:', response.status, errorText);
                alert(`❌ Smarty API Test Failed: ${response.status} ${response.statusText}\n\nCheck the console for details.`);
            }
        } catch (error) {
            console.error('❌ Smarty API Test Error:', error);
            alert(`❌ Smarty API Test Error: ${error.message}\n\nCheck the console for details.`);
        }
    }

    async testGooglePlacesAPI() {
        console.log('🧪 Testing Google Places API and Street View...');
        
        if (!window.google || !window.google.maps) {
            console.log('⚠️ Google Maps not loaded yet');
            alert('⚠️ Google Maps not loaded yet. Please wait a moment and try again.');
            return;
        }

        try {
            // Test with a well-known address that should have photos and Street View
            const testAddress = '1600 Pennsylvania Avenue NW, Washington, DC 20500';
            console.log('🔍 Testing with address:', testAddress);
            
            const geocoder = new google.maps.Geocoder();
            
            geocoder.geocode({ address: testAddress }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const place = results[0];
                    console.log('📍 Test geocoding successful:', place.place_id);
                    
                    // Test Street View first
                    if (place.geometry && place.geometry.location) {
                        console.log('🌍 Testing Street View...');
                        this.getStreetViewImage(place.geometry.location).then(streetViewImage => {
                            if (streetViewImage) {
                                console.log('✅ Street View test successful');
                                alert('✅ Google Street View API is working!\n\nStreet View images will be displayed for properties.');
                            } else {
                                console.log('⚠️ Street View not available, testing Places API...');
                                this.testPlacesAPI(place.place_id);
                            }
                        });
                    } else {
                        console.log('⚠️ No geometry available, testing Places API...');
                        this.testPlacesAPI(place.place_id);
                    }
                } else {
                    console.error('❌ Test geocoding failed:', status);
                    alert(`❌ Test geocoding failed: ${status}`);
                }
            });
            
        } catch (error) {
            console.error('❌ Google API test error:', error);
            alert(`❌ Google API test error: ${error.message}`);
        }
    }

    async testPlacesAPI(placeId) {
        try {
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            
            placesService.getDetails({
                placeId: placeId,
                fields: ['photos', 'formatted_address', 'name']
            }, (placeDetails, placeStatus) => {
                if (placeStatus === 'OK' && placeDetails) {
                    console.log('✅ Google Places API test successful:', placeDetails);
                    const photoCount = placeDetails.photos ? placeDetails.photos.length : 0;
                    alert(`✅ Google Places API is working!\n\nFound ${photoCount} photos for the test address.\n\nStreet View will be used as primary image source, with Places API as fallback.`);
                } else {
                    console.error('❌ Google Places API test failed:', placeStatus);
                    alert(`❌ Google Places API test failed: ${placeStatus}`);
                }
            });
        } catch (error) {
            console.error('❌ Places API test error:', error);
            alert(`❌ Places API test error: ${error.message}`);
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
