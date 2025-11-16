# Campus Shop - E-Commerce Marketplace

A full-featured campus marketplace built with Django REST Framework and React.

## 🚀 Features

### Backend (Django REST Framework)
- ✅ **User Authentication**: JWT-based authentication with registration and login
- ✅ **Multi-Store Support**: Users can create and manage their own stores
- ✅ **Product Management**: Full CRUD for products with variants, images, and reviews
- ✅ **Shopping Cart**: Add/remove items, update quantities
- ✅ **Order Processing**: Complete checkout flow with order management
- ✅ **Payment Integration**: Paystack payment gateway support
- ✅ **Seller Dashboard**: Analytics, sales tracking, and payout management
- ✅ **Review System**: Product reviews and ratings
- ✅ **Search & Filtering**: Advanced filtering and search capabilities
- ✅ **API Documentation**: Auto-generated Swagger/ReDoc documentation

## 📋 Prerequisites

- Python 3.10+
- Node.js 16+ (for frontend)
- PostgreSQL (optional, SQLite configured for development)

## 🛠️ Installation

### 1. Clone the repository
```bash
cd "New folder"
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
Create a `.env` file in the project root (already created with defaults):
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Using SQLite for development)
# Uncomment for PostgreSQL:
# DB_NAME=campus_shop
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Platform Settings
PLATFORM_COMMISSION=0.05
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Create a superuser
```bash
python manage.py createsuperuser --email admin@campusshop.com
```

### 6. Start the development server
```bash
python manage.py runserver
```

The API will be available at: http://127.0.0.1:8000

## 📚 API Documentation

### Interactive API Documentation
- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/
- **Admin Panel**: http://127.0.0.1:8000/admin/

### API Endpoints

#### Authentication
```
POST   /api/accounts/token/           # Obtain JWT token
POST   /api/accounts/token/refresh/   # Refresh JWT token
POST   /api/accounts/users/           # Register new user
GET    /api/accounts/users/me/        # Get current user profile
PUT    /api/accounts/users/me/        # Update current user profile
```

#### Stores
```
GET    /api/stores/                   # List all stores
POST   /api/stores/                   # Create a new store
GET    /api/stores/{id}/              # Get store details
PUT    /api/stores/{id}/              # Update store
DELETE /api/stores/{id}/              # Delete store
GET    /api/stores/my_store/          # Get current user's store
GET    /api/stores/{id}/analytics/    # Get store analytics
POST   /api/stores/{id}/increment_view/ # Increment store views
GET    /api/stores/{id}/social_media/ # Get social media links
PUT    /api/stores/{id}/social_media/ # Update social media links
GET    /api/stores/categories/        # List all categories
```

#### Products
```
GET    /api/products/                 # List all products
POST   /api/products/                 # Create a new product
GET    /api/products/{slug}/          # Get product details
PUT    /api/products/{slug}/          # Update product
DELETE /api/products/{slug}/          # Delete product
GET    /api/products/my_products/     # Get current user's products
POST   /api/products/{slug}/increment_view/ # Increment views
GET    /api/products/{slug}/images/   # Get product images
POST   /api/products/{slug}/images/   # Add product image
GET    /api/products/{slug}/reviews/  # Get product reviews
POST   /api/products/{slug}/reviews/  # Add product review
GET    /api/products/attributes/      # List product attributes
```

#### Shopping Cart
```
GET    /api/orders/carts/my_cart/     # Get current user's cart
POST   /api/orders/carts/add_item/    # Add item to cart
POST   /api/orders/carts/update_item/ # Update cart item quantity
POST   /api/orders/carts/remove_item/ # Remove item from cart
POST   /api/orders/carts/clear/       # Clear cart
POST   /api/orders/carts/checkout/    # Checkout and create order
```

#### Orders
```
GET    /api/orders/                   # List user's orders
GET    /api/orders/{id}/              # Get order details
POST   /api/orders/{id}/cancel/       # Cancel order
GET    /api/orders/transactions/      # List transactions
```

#### Seller Orders & Payouts
```
GET    /api/orders/seller/orders/     # List seller's orders
POST   /api/orders/seller/orders/{id}/update_status/ # Update order status
GET    /api/orders/seller/payouts/    # List seller payouts
GET    /api/orders/seller/payouts/balance/ # Get seller balance
```

#### Addresses
```
GET    /api/accounts/addresses/       # List user's addresses
POST   /api/accounts/addresses/       # Create address
GET    /api/accounts/addresses/{id}/  # Get address details
PUT    /api/accounts/addresses/{id}/  # Update address
DELETE /api/accounts/addresses/{id}/  # Delete address
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. **Register a new user** or **login** to get tokens:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

2. **Use the access token** in subsequent requests:
```bash
curl -X GET http://127.0.0.1:8000/api/accounts/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **Refresh the token** when it expires:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

## 📦 Project Structure

```
campus_shop/
├── accounts/           # User authentication & profiles
│   ├── models.py       # User, Address models
│   ├── serializers.py  # API serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── stores/             # Store management
│   ├── models.py       # Store, Category, Analytics models
│   ├── serializers.py  # API serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── products/           # Product catalog
│   ├── models.py       # Product, Variant, Image, Review models
│   ├── serializers.py  # API serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── orders/             # Order processing
│   ├── models.py       # Cart, Order, Transaction, Payout models
│   ├── serializers.py  # API serializers
│   ├── views.py        # API views
│   └── urls.py         # URL routing
├── core/               # Core utilities
│   └── permissions.py  # Custom permissions
├── campus_shop/        # Project settings
│   ├── settings.py     # Django settings
│   └── urls.py         # Main URL configuration
├── static/             # Static files
├── media/              # User uploads
├── requirements.txt    # Python dependencies
└── manage.py          # Django management script
```

## 🗄️ Database Models

### User Model (Custom)
- Email-based authentication (no username)
- Profile fields: first_name, last_name, phone_number, profile_picture
- is_seller flag for store owners

### Store Model
- Owner (User)
- Name, slug, description, logo, banner
- Contact information
- Status (pending, approved, suspended)
- Rating system
- Analytics tracking
- Social media links

### Product Model
- Store reference
- Category
- Pricing (price, compare_at_price, cost_per_item)
- Inventory (SKU, barcode, quantity)
- Variants support
- Images
- Reviews & ratings
- Condition (new, used)
- Digital product support

### Order Model
- User reference
- Order items
- Status tracking
- Payment information
- Shipping/billing addresses
- Platform fee calculation

## 🎨 Admin Interface

Access the Django admin panel at http://127.0.0.1:8000/admin/

Features:
- User management
- Store approval workflow
- Product moderation
- Order management
- Review moderation
- Analytics dashboard

**Default Superuser:**
- Email: admin@campusshop.com
- Password: (set during createsuperuser command)

## 🧪 Testing the API

### Example: Create a Store

1. Register a user:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "testpass123",
    "password2": "testpass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

2. Get JWT token:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "seller@example.com", "password": "testpass123"}'
```

3. Create a store:
```bash
curl -X POST http://127.0.0.1:8000/api/stores/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Campus Store",
    "description": "Best products on campus",
    "contact_email": "store@example.com"
  }'
```

## 🔧 Configuration

### Switching to PostgreSQL

1. Install PostgreSQL and create a database
2. Update `.env` file with PostgreSQL credentials
3. Update `settings.py` to use PostgreSQL (uncomment the PostgreSQL DATABASES config)
4. Run migrations: `python manage.py migrate`

### Payment Integration

1. Sign up for a Paystack account
2. Add your Paystack keys to `.env`
3. The payment flow is ready to use

## 📝 Development Notes

- **Permissions**: Custom permissions ensure users can only modify their own resources
- **Filtering**: Uses django-filter for advanced filtering
- **Pagination**: Paginated responses for list views
- **CORS**: Configured for frontend integration
- **Media Files**: User uploads stored in `media/` directory
- **Static Files**: CSS/JS assets in `static/` directory

## 🚧 TODO / Future Enhancements

- [ ] Email notifications (order confirmations, shipping updates)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced search (Elasticsearch)
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Multi-currency support
- [ ] Shipping provider integration
- [ ] Analytics dashboard
- [ ] Mobile app API endpoints
- [ ] Social authentication (Google, Facebook)

## 📄 License

This project is for educational purposes.

## 👥 Support

For issues and questions, please create an issue in the repository.
