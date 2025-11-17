# Near Buy - Local Shopping App for Sri Lanka

Near Buy is a revolutionary mobile application designed to transform the local shopping experience in Sri Lanka. The app connects customers with nearby shops, allowing them to search for products, compare prices, and prepare shopping lists before visiting stores.

## 🎯 Features

### Customer App
- **Home Screen**: Browse nearby shops with GPS integration
- **Map View**: Interactive map showing shop locations with markers
- **Search**: Find products across multiple shops with filtering
- **Pre-Bill**: Build shopping lists with running totals
- **Favorites**: Save favorite shops and products
- **Settings**: Theme toggle, language selection, and profile management

### Shop Owner App (Planned)
- Shop registration and management
- Inventory management
- Order processing
- Analytics and reporting

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: Context API
- **Styling**: StyleSheet with theme system
- **Storage**: AsyncStorage for persistence
- **Maps**: React Native Maps (Google Maps)
- **Icons**: Lucide React Native
- **Typography**: System fonts

## 🎨 Design System

- **Primary Color**: #ff5900 (Orange)
- **Theme Support**: Light and dark modes
- **Responsive**: Optimized for mobile devices
- **Accessibility**: High contrast ratios and readable fonts

## 📱 Screens

1. **Home** - Shop discovery and map view
2. **Search** - Product search with filters
3. **Pre-Bill** - Shopping list management
4. **Favorites** - Saved shops and products
5. **Settings** - App configuration and profile

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the app in Expo Go or run on simulator

## 🌐 Localization

The app supports multiple languages:
- English (Default)
- Sinhala (සිංහල)
- Tamil (தமிழ்)

## 📦 Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── types/                 # TypeScript type definitions
├── utils/                 # Utilities and mock data
├── shop-owner/           # Shop owner app (stub)
└── hooks/                # Custom React hooks
```

## 🔮 Future Enhancements

- Real-time inventory updates
- Push notifications
- Payment integration
- Order tracking
- Chat functionality
- Review and rating system
- Admin dashboard

## 🤝 Contributing

This project is designed for the Sri Lankan market. Contributions are welcome to improve the local shopping experience.

## 📄 License

MIT License - Built with ❤️ for Sri Lanka