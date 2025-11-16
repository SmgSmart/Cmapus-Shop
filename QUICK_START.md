# Campus Shop - Quick Start Guide

## 🚀 Getting Started

### 1. Server Status
First, check if the server is running:
```bash
curl http://127.0.0.1:8000/health/
```
Expected response: `{"status": "ok", "message": "Campus Shop API is running"}`

### 2. Create Your First User
Register a new user account:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Student"
  }'
```

### 3. Get Authentication Token
Login to get your JWT token:
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "securepass123"
  }'
```

Save the `access` token from the response - you'll need it for authenticated requests.

### 4. Create Your Store
Create a store to start selling (replace YOUR_TOKEN with the access token):
```bash
curl -X POST http://127.0.0.1:8000/api/stores/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Campus Store",
    "description": "Best textbooks and supplies on campus",
    "contact_email": "store@university.edu",
    "contact_phone": "+1234567890"
  }'
```

### 5. Browse Categories
See available product categories:
```bash
curl http://127.0.0.1:8000/api/stores/categories/
```

### 6. View All Stores
Browse all approved stores:
```bash
curl http://127.0.0.1:8000/api/stores/
```

## 📱 Frontend Development

The project includes a React frontend in the `frontend/` directory. To set it up:

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The frontend will be available at: http://localhost:5173

## 🔧 Admin Panel

Access the Django admin at: http://127.0.0.1:8000/admin/

Login with the superuser account you created to:
- Manage users and stores
- Approve store applications
- Monitor orders and transactions
- Manage product categories

## 📖 API Documentation

Visit the interactive API documentation:
- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/

## 🛠 Development Tips

### Database Management
- **Reset database**: Delete `db.sqlite3` and run `python manage.py migrate`
- **Create test data**: Use Django admin or API endpoints
- **Backup database**: Copy `db.sqlite3` file

### Common Issues
1. **Port already in use**: Change port with `python manage.py runserver 8001`
2. **Migration errors**: Run `python manage.py makemigrations` then `python manage.py migrate`
3. **Static files issues**: Run `python manage.py collectstatic`

### Next Steps
1. Create some product categories in the admin
2. Register as a seller and create products
3. Test the shopping cart and checkout flow
4. Explore the API documentation
5. Start building your frontend integration

## 🎯 Key Features to Test

### For Students (Buyers)
- Register and browse products
- Add items to cart
- Checkout and place orders
- Leave product reviews

### For Sellers
- Create and manage store
- Add and manage products
- Track orders and sales
- Manage payouts

### For Admins
- Approve store applications
- Manage users and content
- Monitor platform activity
- Handle disputes

Happy coding! 🚀