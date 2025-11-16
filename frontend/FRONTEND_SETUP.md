# Campus Shop Frontend Setup Guide

## Prerequisites
- Node.js 16+ installed
- Backend API running at http://127.0.0.1:8000

## Setup Instructions

### Step 1: Fix PowerShell Execution Policy (One-time setup)

Run PowerShell **as Administrator** and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Install Dependencies

Open a terminal in the `frontend` directory and run:

```bash
cd frontend
npm install
```

This will install:
- React 18
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- Vite as build tool

### Step 3: Start the Development Server

```bash
npm run dev
```

The frontend will start at: **http://localhost:3000**

### Step 4: Access the Application

Open your browser and visit:
- **Landing Page**: http://localhost:3000
- **Products**: http://localhost:3000/products
- **Stores**: http://localhost:3000/stores

## Features Implemented

### 🏠 Landing Page
- Hero section with call-to-action
- Feature highlights (Secure, Fast, Best Prices)
- Categories section
- Featured products grid
- Seller call-to-action section

### 📦 Products Page
- Grid layout with product cards
- Product images with fallback
- Ratings and reviews display
- Price with compare-at-price
- Search and filter support

### 🏪 Stores Page
- Store cards with logos
- Store ratings
- "View Store" action buttons

### 🔍 Product Detail Page
- Large product images
- Product gallery
- Full description
- Add to cart functionality
- Customer reviews section
- Product specifications

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with header & footer
│   ├── pages/
│   │   ├── LandingPage.jsx     # Home page
│   │   ├── ProductsPage.jsx    # Products listing
│   │   ├── ProductDetailPage.jsx # Single product view
│   │   └── StoresPage.jsx      # Stores listing
│   ├── App.jsx                 # Routes configuration
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles & Tailwind
├── index.html
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## API Integration

The frontend is configured to proxy API requests to the Django backend:

```javascript
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }
  }
}
```

All API calls are made using Axios:
```javascript
axios.get('/api/products/')
axios.get('/api/stores/')
axios.get(`/api/products/${slug}/`)
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **Custom color scheme** with primary blue tones
- **Responsive design** for mobile, tablet, and desktop
- **Hover effects** and transitions

### Custom Tailwind Classes

```css
.btn-primary    - Primary button style
.btn-secondary  - Secondary button style
.card           - Card component with shadow
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Reload**: Changes are reflected immediately
2. **API Proxy**: No CORS issues when developing locally
3. **Responsive**: Test on different screen sizes
4. **Icons**: Use Lucide React for consistent icons

## Troubleshooting

### PowerShell Script Error
```
Solution: Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
```
Solution: Kill the process on port 3000 or change the port in vite.config.js
```

### API Not Responding
```
Solution: Make sure Django backend is running at http://127.0.0.1:8000
Check: http://127.0.0.1:8000/health/
```

### Module Not Found
```
Solution: Delete node_modules and package-lock.json, then run:
npm install
```

## Next Steps

### Features to Implement:
- [ ] User authentication (Login/Register)
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] User dashboard
- [ ] Seller dashboard
- [ ] Product search with filters
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Real-time notifications

### Enhancements:
- [ ] Add loading skeletons
- [ ] Implement pagination
- [ ] Add image zoom on product detail
- [ ] Implement lazy loading for images
- [ ] Add toast notifications
- [ ] Implement dark mode
- [ ] Add product quick view
- [ ] Implement infinite scroll

## Support

For issues or questions:
1. Check the console for errors
2. Verify backend is running
3. Check network tab for API calls
4. Review browser console logs
