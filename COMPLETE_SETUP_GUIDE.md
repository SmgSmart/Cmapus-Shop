# 🏪 Campus Shop - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### 1. Automatic Setup
Run the setup script to automatically configure everything:

```bash
python setup_admin.py
```

This will:
- ✅ Apply database migrations
- ✅ Create admin user (admin@campusshop.com / admin123)
- ✅ Create 8 product categories
- ✅ Create 16+ sample products
- ✅ Set up a sample store

### 2. Start the Applications

```bash
# Terminal 1 - Django Backend
python manage.py runserver

# Terminal 2 - React Frontend
cd frontend
npm install  # First time only
npm run dev
```

### 3. Access Your Applications
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Documentation**: http://127.0.0.1:8000/api/docs/

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Database Setup
```bash
python manage.py migrate
```

### 2. Create Admin User
```bash
python manage.py createsuperuser --email admin@campusshop.com
```

### 3. Create Sample Data
```bash
python manage.py create_sample_data
```

### 4. Start Servers
```bash
# Django
python manage.py runserver

# React (in another terminal)
cd frontend && npm run dev
```

## 📊 Admin Panel Features

### 🏷️ Categories Management
**Location**: Admin → Stores → Categories

**Features**:
- ✅ **Easy Creation**: Just name, description, and icon
- ✅ **Bulk Actions**: Activate/deactivate multiple categories
- ✅ **Quick Edit**: Toggle active status directly in list
- ✅ **Product Count**: See how many products per category
- ✅ **Auto Slug**: URL-friendly slugs generated automatically

**Sample Categories Created**:
- 💻 Electronics (Laptops, phones, accessories)
- 📚 Books & Stationery (Textbooks, supplies)
- 👕 Clothing & Fashion (Apparel, shoes)
- 🍔 Food & Beverages (Snacks, drinks)
- ⚽ Sports & Fitness (Equipment, gear)
- 💄 Beauty & Personal Care (Cosmetics, hygiene)
- 🏠 Home & Living (Furniture, decor)
- 🎨 Art & Crafts (Supplies, materials)

### 🛍️ Products Management
**Location**: Admin → Products → Products

**Features**:
- ✅ **Complete Product Info**: Name, description, pricing, inventory
- ✅ **Image Management**: Multiple images with main image selection
- ✅ **Bulk Actions**: Activate, feature, or manage multiple products
- ✅ **Quick Edit**: Edit price, status, and featured directly in list
- ✅ **Advanced Filters**: Filter by store, category, condition, status
- ✅ **Stock Management**: Track quantities and conditions
- ✅ **Featured Products**: Highlight products on homepage

**Product Fields**:
- **Basic**: Name, description, category, store
- **Pricing**: Price, compare price, cost
- **Inventory**: SKU, quantity, condition
- **Status**: Active, featured visibility
- **Images**: Multiple product photos

### 🏪 Store Management
**Location**: Admin → Stores → Stores

**Features**:
- ✅ **Store Approval**: Review and approve seller applications
- ✅ **Store Status**: Pending, approved, rejected, suspended
- ✅ **Featured Stores**: Promote stores on homepage
- ✅ **Analytics**: View store performance metrics
- ✅ **Contact Management**: Store contact information

### 👥 User Management
**Location**: Admin → Accounts → Users

**Features**:
- ✅ **User Roles**: Customer, seller, staff, admin
- ✅ **Address Management**: User shipping addresses
- ✅ **Account Status**: Active, inactive users
- ✅ **Seller Approval**: Manage seller permissions

## 📱 Frontend Integration

### 🔍 What Users See
1. **Homepage**: Featured products and stores
2. **Products Page**: All products with search/filters
3. **Categories**: Products filtered by category
4. **Shopping Cart**: Add/remove items, checkout
5. **User Accounts**: Registration, login, profiles
6. **Seller Dashboard**: Store and product management

### 🛒 Shopping Flow
1. **Browse**: Users see all active products from approved stores
2. **Search/Filter**: By category, price, name
3. **Add to Cart**: Authenticated users can add items
4. **Checkout**: Complete purchase with address/payment
5. **Orders**: Track order status and history

### 🏪 Seller Flow
1. **Register**: Create user account
2. **Create Store**: Apply for seller status
3. **Approval**: Admin approves store application
4. **Add Products**: Sellers manage their inventory
5. **Orders**: Process customer orders

## 🎯 Admin Workflow

### Daily Tasks
1. **Check Pending Stores**: Review new seller applications
2. **Monitor Products**: Ensure active products are accurate
3. **Review Reports**: Check for any issues or violations

### Weekly Tasks
1. **Update Featured Content**: Refresh featured products/stores
2. **Category Management**: Add new categories as needed
3. **User Support**: Address any user issues

### Monthly Tasks
1. **Analytics Review**: Check platform performance
2. **Content Cleanup**: Remove inactive/outdated content
3. **Feature Updates**: Plan new features or improvements

## 🔧 Customization

### Adding New Categories
1. Go to **Stores → Categories**
2. Click **"Add Category"**
3. Fill in:
   - Name (required)
   - Description
   - Icon (emoji or text)
   - Active status

### Adding Products for Testing
1. Go to **Products → Products**
2. Click **"Add Product"**
3. Select the sample store or create new store
4. Fill in product details
5. Add product images
6. Set as active and optionally featured

### Bulk Operations
- **Select Multiple Items**: Use checkboxes in list views
- **Choose Action**: From dropdown at top of list
- **Apply**: Click "Go" to perform bulk action

## 🚨 Troubleshooting

### Common Issues

**Products not showing on frontend:**
```bash
# Check these conditions:
1. Product is_active = True
2. Store status = 'approved'
3. Category is_active = True
4. Product quantity > 0
```

**Categories not displaying:**
```bash
# Verify:
1. Category is_active = True
2. Category has active products
```

**Store approval not working:**
```bash
# Check:
1. Store status in admin
2. User is_seller permission
3. Store owner is active user
```

**Frontend not connecting to API:**
```bash
# Verify:
1. Django server running on port 8000
2. React dev server running on port 3000
3. Proxy configuration in vite.config.js
4. CORS settings in Django
```

### Error Recovery
If something goes wrong:

```bash
# Reset and rebuild
python manage.py create_sample_data --clear
python setup_admin.py
```

## 📈 Monitoring

### Key Metrics to Track
- **Products**: Total, active, featured
- **Stores**: Total, approved, pending
- **Users**: Total, sellers, active
- **Orders**: Volume, value, status

### Admin Dashboard
Visit `/admin/` to see:
- Real-time statistics
- Recent products and stores
- Pending applications
- Quick action buttons

## 🎉 Success Checklist

After setup, verify:
- [ ] Admin panel accessible at `/admin/`
- [ ] Can login with admin credentials
- [ ] Categories visible in admin and frontend
- [ ] Products visible in admin and frontend
- [ ] Frontend cart functionality working
- [ ] User registration/login working
- [ ] Seller store creation working
- [ ] Product search and filtering working

## 📞 Support

### Documentation
- **ADMIN_GUIDE.md**: Detailed admin operations
- **API_TESTING_GUIDE.md**: API endpoint testing
- **FRONTEND_SETUP.md**: Frontend configuration

### Quick Help
- Check Django admin error messages
- Review browser console for frontend errors
- Verify database connectivity
- Check server logs for backend issues

---

**🎯 You now have a fully functional Campus Shop marketplace with admin management capabilities!**

**Start by accessing the admin panel and exploring the sample data, then customize it for your specific campus needs.**