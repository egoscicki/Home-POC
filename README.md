# Home Property Valuation Tracker

A sleek, Apple-inspired home property valuation tracker widget with glass UI elements and real-time property insights.

## ✨ Features

- **Beautiful Glass UI Design**: Modern, Apple-inspired interface with backdrop blur effects and soft gradients
- **Address Search with Autocomplete**: Smart address input with suggestions
- **Real-time Property Data**: Current value, price changes, and historical trends
- **Property Features Display**: Visual indicators for pool, fireplace, and garage
- **Comprehensive Property Details**: Square footage, bedrooms, bathrooms, lot size, year built, and last sold date
- **Interactive Value Charts**: Beautiful line charts showing property value history
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Loading States & Error Handling**: Smooth user experience with proper feedback

## 🎨 Design Features

- **Glass Morphism**: Modern glass UI with backdrop blur effects
- **Soft Gradients**: Beautiful background gradients for depth
- **Smooth Animations**: Elegant transitions and hover effects
- **Apple-inspired Typography**: Clean, modern font hierarchy using Inter font family
- **Responsive Grid Layout**: Adaptive design that works on all screen sizes

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6+ support
- Internet connection for external resources (fonts, Chart.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/home-poc.git
cd home-poc
```

2. Open `index.html` in your web browser

3. Start searching for properties!

## 🔧 Configuration

The application is pre-configured with a RentCast API key for demonstration purposes. To use your own API key:

1. Sign up at [RentCast](https://rentcast.io/)
2. Replace the API key in `app.js`:
```javascript
this.apiKey = 'your-api-key-here';
```

## 📱 Usage

1. **Enter Address**: Type an address in the search field
2. **Select from Suggestions**: Choose from autocomplete suggestions
3. **View Property Data**: See comprehensive property information
4. **Explore Features**: Check property amenities and details
5. **Analyze Trends**: View value history charts

## 🏗️ Project Structure

```
home-poc/
├── index.html          # Main HTML structure
├── style.css           # Glass UI styles and animations
├── app.js             # JavaScript functionality and API integration
└── README.md          # Project documentation
```

## 🎯 Key Components

### HTML Structure
- **Header Section**: App title and description
- **Address Input**: Search field with autocomplete
- **Property Display**: Main property information card
- **Details Grid**: Property attributes in organized cards
- **Value Chart**: Interactive property value history
- **Loading & Error States**: User feedback components

### CSS Features
- **Glass Cards**: `backdrop-filter: blur()` effects
- **Responsive Grid**: CSS Grid with auto-fit columns
- **Smooth Transitions**: CSS animations and transforms
- **Mobile-First**: Responsive breakpoints for all devices

### JavaScript Functionality
- **Address Autocomplete**: Smart search suggestions
- **Property Data Fetching**: API integration (currently using sample data)
- **Chart Management**: Chart.js integration for value history
- **State Management**: Loading, error, and success states
- **Event Handling**: User interactions and form submissions

## 🔌 API Integration

The application is designed to integrate with the RentCast API for real property data. Currently, it uses sample data for demonstration purposes.

### RentCast API Endpoints (Future Implementation)
- Property search and details
- Value history and trends
- Property features and amenities
- Market analysis data

## 🎨 Customization

### Colors
The app uses a carefully selected color palette:
- **Primary Blue**: `#007AFF` (Apple's signature blue)
- **Success Green**: `#34C759`
- **Error Red**: `#FF3B30`
- **Neutral Grays**: Various shades for text and backgrounds

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Fallback**: System fonts for optimal performance

### Glass Effects
- **Backdrop Blur**: `backdrop-filter: blur(20px)`
- **Transparency**: `rgba(255, 255, 255, 0.25)`
- **Border Effects**: Subtle white borders with transparency

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px - 1199px (adjusted grid)
- **Mobile**: < 768px (stacked layout)

## 🚀 Future Enhancements

- **Real API Integration**: Connect to actual RentCast API
- **User Accounts**: Save favorite properties
- **Market Comparisons**: Compare with similar properties
- **Notifications**: Price change alerts
- **Export Data**: PDF reports and data export
- **Dark Mode**: Alternative color scheme
- **Offline Support**: PWA capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **RentCast API** for property data services
- **Chart.js** for beautiful data visualization
- **Font Awesome** for icon library
- **Google Fonts** for typography

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using modern web technologies**
