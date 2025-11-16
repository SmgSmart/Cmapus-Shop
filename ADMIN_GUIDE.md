# Campus Shop - Admin Guide

## 🛠️ Admin Setup & Management

This guide will help you set up and manage your Campus Shop marketplace as an administrator.

### 🚀 Initial Setup

#### 1. Create Sample Data
To get started quickly with sample categories and products, run:

```bash
python manage.py create_sample_data
```

This will create:
- ✅ 8 Product categories (Electronics, Books, Clothing, etc.)
- ✅ 1 Sample store with admin as owner
- ✅ 16+ Sample products across all categories
- ✅ Admin user account (admin@campusshop.com / admin123)

To clear existing data and recreate:
```bash
python manage.py create_sample_data --clear
```

#### 2. Access Admin Panel
Visit: http://127.0.0.1:8000/admin/
Login with your superuser credentials or:
- **Email**: admin@campusshop.com
- **Password**: admin123

### 📁 Managing Categories

#### Adding New Categories
1. Go to **Stores → Categories** in admin
2. Click **"Add Category"**
3. Fill in:
   - **Name**: Category name (e.g., "Electronics")
   - **Slug**: Auto-generated from name
   - **Description**: Brief description of category
   - **Icon**: Emoji or icon for the category
   - **Is Active**: Check to make visible to users

#### Category Management Features
- ✅ **Bulk Activate/Deactivate**: Select multiple categories and use dropdown actions
- ✅ **Quick Edit**: Edit "Is Active" status directly in list view
- ✅ **Product Count**: See how many products are in each category
- ✅ **Search**: Find categories by name or description

### 🛍️ Managing Products

#### Adding New Products
1. Go to **Products → Products** in admin
2. Click **"Add Product"**
3. Fill in required information:

**Basic Information:**
- **Store**: Select the store (required)
- **Name**: Product name
- **Slug**: Auto-generated from name
- **Description**: Detailed product description
- **Category**: Select product category

**Pricing:**
- **Price**: Current selling price
- **Compare at Price**: Original price (for showing discounts)
- **Cost per Item**: Your cost (for profit calculations)

**Inventory:**
- **SKU**: Stock Keeping Unit (auto-generated)
- **Quantity**: Available stock
- **Condition**: New, Like New, Good, Fair, Poor

**Status:**
- **Is Active**: Make product visible to customers
- **Is Featured**: Show in featured products section

#### Product Management Features
- ✅ **Bulk Actions**: Activate, deactivate, feature, or unfeature multiple products
- ✅ **Quick Edit**: Edit price, active status, and featured status directly in list
- ✅ **Advanced Filters**: Filter by store, category, condition, active status
- ✅ **Search**: Find products by name, SKU, or store name
- ✅ **Product Images**: Add multiple images with main image selection
- ✅ **Product Variants**: Add size, color, or other variant options

#### Adding Product Images
1. When creating/editing a product, scroll to **Product Images** section
2. Click **"Add another Product Image"**
3. Upload image and set:
   - **Is Main**: Check for primary product image
   - **Position**: Order of images
   - **Alt Text**: Description for accessibility

### 🏪 Managing Stores

#### Store Approval Process
1. Go to **Stores → Stores** in admin
2. Find stores with **"Pending"** status
3. Click on store to review details
4. Change **Status** to:
   - **Approved**: Allow store to sell products
   - **Rejected**: Deny store application
   - **Suspended**: Temporarily disable store

#### Store Features
- ✅ **Store Analytics**: View sales, revenue, and performance metrics
- ✅ **Featured Stores**: Promote stores on homepage
- ✅ **Store Verification**: Mark trusted sellers
- ✅ **Contact Information**: Manage store contact details

### 👥 Managing Users

#### User Management
1. Go to **Accounts → Users** in admin
2. View all registered users
3. Manage user permissions:
   - **Is Staff**: Access to admin panel
   - **Is Seller**: Can create stores and sell products
   - **Is Superuser**: Full admin access

#### User Addresses
- View and manage user shipping addresses
- Set default addresses for users

### 📊 Orders & Reviews

#### Order Management
1. Go to **Orders → Orders** in admin
2. Track order status and payments
3. Manage order fulfillment

#### Review Management
1. Go to **Products → Reviews** in admin
2. **Approve/Unapprove** reviews
3. **Bulk Actions**: Approve or reject multiple reviews

### 🔧 Admin Dashboard Features

#### Enhanced List Views
- **Inline Editing**: Edit key fields directly in list views
- **Bulk Actions**: Perform actions on multiple items
- **Advanced Filters**: Filter by multiple criteria
- **Search**: Full-text search across relevant fields

#### Fieldsets Organization
- **Grouped Fields**: Related fields organized in collapsible sections
- **Read-only Fields**: Automatic fields like timestamps and statistics
- **Required vs Optional**: Clear indication of required fields

### 📈 Best Practices

#### Content Management
1. **Categories**: Start with 5-10 main categories
2. **Products**: Add high-quality images and detailed descriptions
3. **Featured Items**: Regularly update featured products and stores
4. **Reviews**: Monitor and moderate product reviews

#### Store Management
1. **Approval**: Review store applications within 24-48 hours
2. **Quality Control**: Ensure stores meet quality standards
3. **Featured Stores**: Promote active, high-quality sellers

#### User Experience
1. **Active Content**: Regularly check that active products are in stock
2. **Categories**: Keep category list manageable and well-organized
3. **Search**: Ensure products have good descriptions for searchability

### 🔍 Monitoring & Analytics

#### Key Metrics to Watch
- **Active Products**: Number of available products
- **Store Applications**: Pending store approvals
- **User Registrations**: New user signups
- **Order Volume**: Sales activity
- **Review Activity**: Product feedback

#### Regular Tasks
- [ ] Review and approve new stores weekly
- [ ] Update featured products monthly
- [ ] Monitor product reviews and respond to issues
- [ ] Check for out-of-stock products
- [ ] Update categories as needed

### 🆘 Troubleshooting

#### Common Issues

**Products not showing on frontend:**
- ✅ Check product is marked as "Active"
- ✅ Check store is "Approved"
- ✅ Check category is "Active"
- ✅ Verify product has stock quantity > 0

**Store applications not visible:**
- ✅ Check store status filter in admin
- ✅ Look for "Pending" status stores

**Categories not displaying:**
- ✅ Ensure category is marked as "Active"
- ✅ Check if category has any active products

### 📞 Support

For technical issues or questions:
1. Check the Django admin logs
2. Review error messages in browser console
3. Check server logs for backend issues
4. Verify database connectivity

---

**🎯 Quick Start Checklist:**
- [ ] Run `python manage.py create_sample_data`
- [ ] Access admin panel at `/admin/`
- [ ] Review sample categories and products
- [ ] Create additional categories as needed
- [ ] Add real products with images
- [ ] Test frontend functionality
- [ ] Set up featured products and stores