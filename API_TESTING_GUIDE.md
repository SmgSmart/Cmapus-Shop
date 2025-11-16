# Campus Shop API Testing Guide

Complete guide to testing all API endpoints with example requests.

## Base URL
```
http://127.0.0.1:8000
```

## 1. User Registration & Authentication

### Register a New User
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123",
    "password2": "SecurePass123",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "+2348012345678"
  }'
```

### Login (Get JWT Token)
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "full_name": "Test User",
    "is_seller": false
  }
}
```

### Get Current User Profile
```bash
curl -X GET http://127.0.0.1:8000/api/accounts/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update User Profile
```bash
curl -X PATCH http://127.0.0.1:8000/api/accounts/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "phone_number": "+2348098765432"
  }'
```

## 2. Store Management

### Create a Store
```bash
curl -X POST http://127.0.0.1:8000/api/stores/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campus Tech Store",
    "description": "Best electronics and gadgets on campus",
    "contact_email": "techstore@example.com",
    "contact_phone": "+2348012345678",
    "address": "Room 101, Student Center Building"
  }'
```

### Get My Store
```bash
curl -X GET http://127.0.0.1:8000/api/stores/my_store/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### List All Stores
```bash
curl -X GET http://127.0.0.1:8000/api/stores/
```

### Get Store Details
```bash
curl -X GET http://127.0.0.1:8000/api/stores/{store-slug}/
```

### Update Store
```bash
curl -X PATCH http://127.0.0.1:8000/api/stores/{store-slug}/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "contact_email": "newemail@example.com"
  }'
```

### Get Store Analytics
```bash
curl -X GET http://127.0.0.1:8000/api/stores/{store-slug}/analytics/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Social Media Links
```bash
curl -X PUT http://127.0.0.1:8000/api/stores/{store-slug}/social_media/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "website": "https://mytechstore.com",
    "facebook": "https://facebook.com/mytechstore",
    "instagram": "https://instagram.com/mytechstore",
    "twitter": "https://twitter.com/mytechstore"
  }'
```

## 3. Categories

### List All Categories
```bash
curl -X GET http://127.0.0.1:8000/api/stores/categories/
```

## 4. Product Management

### Create a Product
```bash
curl -X POST http://127.0.0.1:8000/api/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro M3",
    "description": "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD",
    "price": "450000.00",
    "compare_at_price": "500000.00",
    "quantity": 5,
    "category": 1,
    "condition": "new",
    "is_physical": true,
    "weight": "1500.00"
  }'
```

### List All Products
```bash
# Basic list
curl -X GET http://127.0.0.1:8000/api/products/

# With filters
curl -X GET "http://127.0.0.1:8000/api/products/?category=1&is_featured=true&ordering=-created_at"

# Search
curl -X GET "http://127.0.0.1:8000/api/products/?search=macbook"
```

### Get Product Details
```bash
curl -X GET http://127.0.0.1:8000/api/products/{product-slug}/
```

### Update Product
```bash
curl -X PATCH http://127.0.0.1:8000/api/products/{product-slug}/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": "445000.00",
    "quantity": 3
  }'
```

### Get My Products
```bash
curl -X GET http://127.0.0.1:8000/api/products/my_products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add Product Image
```bash
curl -X POST http://127.0.0.1:8000/api/products/{product-slug}/images/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "alt_text=MacBook Pro front view" \
  -F "is_main=true" \
  -F "position=0"
```

### Get Product Reviews
```bash
curl -X GET http://127.0.0.1:8000/api/products/{product-slug}/reviews/
```

### Add Product Review
```bash
curl -X POST http://127.0.0.1:8000/api/products/{product-slug}/reviews/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Excellent product!",
    "comment": "Works perfectly, fast delivery, highly recommended."
  }'
```

## 5. Shopping Cart

### Get My Cart
```bash
curl -X GET http://127.0.0.1:8000/api/orders/carts/my_cart/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add Item to Cart
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/add_item/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### Add Item with Variant
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/add_item/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "variant_id": 2,
    "quantity": 1
  }'
```

### Update Cart Item Quantity
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/update_item/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cart_item_id": 1,
    "quantity": 3
  }'
```

### Remove Item from Cart
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/remove_item/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cart_item_id": 1
  }'
```

### Clear Cart
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/clear/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 6. Addresses

### Create Address
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/addresses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address_type": "shipping",
    "full_name": "Test User",
    "phone_number": "+2348012345678",
    "address_line1": "Room 205, Hostel A",
    "address_line2": "University Campus",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postal_code": "100001",
    "is_default": true
  }'
```

### List Addresses
```bash
curl -X GET http://127.0.0.1:8000/api/accounts/addresses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 7. Checkout & Orders

### Checkout (Create Order)
```bash
curl -X POST http://127.0.0.1:8000/api/orders/carts/checkout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address_id": 1,
    "billing_address_id": 1,
    "payment_method": "paystack",
    "customer_note": "Please deliver between 2-4 PM"
  }'
```

**Response:**
```json
{
  "order": {
    "id": 1,
    "order_number": "ORD-20241107-A1B2C3D4",
    "status": "pending",
    "total": "450000.00",
    "items": [...]
  },
  "transaction": {
    "id": 1,
    "reference": "TXN-E5F6G7H8",
    "amount": "450000.00",
    "status": "pending"
  },
  "payment_url": "/api/payments/process/TXN-E5F6G7H8/"
}
```

### List My Orders
```bash
curl -X GET http://127.0.0.1:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Order Details
```bash
curl -X GET http://127.0.0.1:8000/api/orders/{order-id}/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Cancel Order
```bash
curl -X POST http://127.0.0.1:8000/api/orders/{order-id}/cancel/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 8. Seller: Order Management

### List Seller Orders
```bash
curl -X GET http://127.0.0.1:8000/api/orders/seller/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Order Status
```bash
curl -X POST http://127.0.0.1:8000/api/orders/seller/orders/{order-id}/update_status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

**Available Statuses:**
- `pending` - Pending Payment
- `processing` - Processing
- `shipped` - Shipped
- `delivered` - Delivered
- `cancelled` - Cancelled
- `refunded` - Refunded

## 9. Seller: Payouts

### Get Seller Balance
```bash
curl -X GET http://127.0.0.1:8000/api/orders/seller/payouts/balance/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "total_sales": "1500000.00",
  "platform_fees": "75000.00",
  "total_payouts": "1000000.00",
  "pending_payouts": "100000.00",
  "available_balance": "325000.00"
}
```

### List Seller Payouts
```bash
curl -X GET http://127.0.0.1:8000/api/orders/seller/payouts/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 10. Transactions

### List My Transactions
```bash
curl -X GET http://127.0.0.1:8000/api/orders/transactions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Query Parameters

### Filtering
```bash
# Filter by category
?category=1

# Filter by store
?store=1

# Filter active products only
?is_active=true

# Filter by condition
?condition=new
```

### Searching
```bash
# Search products by name or description
?search=macbook

# Search stores
?search=tech
```

### Ordering
```bash
# Order by price (ascending)
?ordering=price

# Order by price (descending)
?ordering=-price

# Order by creation date (newest first)
?ordering=-created_at

# Multiple ordering
?ordering=-is_featured,price
```

### Pagination
```bash
# Default pagination (page size: 20)
?page=1

# Custom page size
?page_size=50&page=1
```

## Error Handling

### Common HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Error message",
  "detail": "Detailed error description"
}
```

or for field errors:
```json
{
  "email": ["This field is required."],
  "password": ["This field may not be blank."]
}
```

## Tips for Testing

1. **Save your access token** to a variable:
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

2. **Use the token in requests**:
```bash
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/endpoint/
```

3. **Pretty print JSON responses** with `jq`:
```bash
curl http://127.0.0.1:8000/api/products/ | jq
```

4. **Use Postman or Insomnia** for easier testing with GUI

5. **Check the interactive API docs** at http://127.0.0.1:8000/api/docs/
