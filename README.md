# E-Commerce Backend API

A complete Node.js + Express backend API for an e-commerce platform with MongoDB database, JWT authentication, and Stripe payment integration.

## Features

### 1. User Authentication
- User registration and login with JWT tokens
- Password hashing using bcrypt (12 salt rounds)
- Protected routes middleware
- Profile management and password change

### 2. Product Management
- Complete CRUD operations for products
- Product fields: name, description, price, category, stock, imageUrl
- Product search and filtering by category, price range, brand
- Pagination support
- Admin-only create, update, and delete operations

### 3. Shopping Cart
- Add products to cart
- Update product quantity in cart
- Remove products from cart
- Get user's cart with product details
- Automatic stock validation

### 4. Order & Checkout
- Create order from cart (checkout)
- Buy Now option for single products
- Order tracking with status updates
- Order cancellation with automatic stock restoration
- Admin order management

### 5. Payment Integration
- Stripe payment integration
- Create payment intents
- Payment confirmation and verification
- Webhook support for payment events
- Refund processing (admin only)

### 6. Error Handling
- Global error handler middleware
- Input validation using express-validator
- Proper error responses with status codes

## Tech Stack

- **Runtime:** Node.js v20
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Payment:** Stripe
- **Validation:** express-validator
- **Environment:** dotenv

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with appropriate values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if not running):
```bash
mongod --dbpath /tmp/mongodb/data --port 27017
```

5. Run the server:
```bash
node server.js
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "110001",
    "country": "USA"
  }
}
```

#### Change Password (Protected)
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

### Product Routes (`/api/products`)

#### Get All Products (Public)
```http
GET /api/products?page=1&limit=10&category=Electronics&minPrice=100&maxPrice=1000
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `search`: Text search in name/description
- `sortBy`: Field to sort by (price, createdAt, etc.)
- `sortOrder`: asc or desc

#### Get Single Product (Public)
```http
GET /api/products/:id
```

#### Get Product Categories (Public)
```http
GET /api/products/categories
```

#### Get Products by Category (Public)
```http
GET /api/products/category/:category
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone",
  "price": 999,
  "discountPrice": 899,
  "category": "Electronics",
  "stock": 50,
  "imageUrl": "https://example.com/image.jpg"
}
```

Categories: Electronics, Clothing, Books, Home, Sports, Beauty, Toys, Other

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 949,
  "stock": 45
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### Cart Routes (`/api/cart`)

All cart routes require authentication.

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### Order Routes (`/api/orders`)

#### Get User's Orders
```http
GET /api/orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Checkout (Create Order from Cart)
```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "110001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "stripe",
  "notes": "Please deliver after 6 PM"
}
```

#### Buy Now (Single Product)
```http
POST /api/orders/buy-now
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 1,
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "110001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "cod"
}
```

Payment Methods: `stripe`, `cod` (Cash on Delivery)

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

#### Get All Orders (Admin Only)
```http
GET /api/orders/admin/all?status=pending&paymentStatus=completed
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/admin/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

Order Status: pending, processing, shipped, delivered, cancelled

### Payment Routes (`/api/payment`)

#### Create Payment Intent
```http
POST /api/payment/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id_here"
}
```

Response includes `clientSecret` for Stripe frontend integration.

#### Confirm Payment
```http
POST /api/payment/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

#### Get Payment Status
```http
GET /api/payment/status/:orderId
Authorization: Bearer <token>
```

#### Webhook (Stripe)
```http
POST /api/payment/webhook
Stripe-Signature: <signature>
Content-Type: application/json

{
  // Stripe webhook payload
}
```

#### Refund Payment (Admin Only)
```http
POST /api/payment/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": "order_id_here",
  "amount": 999,
  "reason": "Product defective"
}
```

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "message": "E-commerce API is running successfully!",
  "timestamp": "2025-10-10T16:39:00.000Z"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Authentication

Most routes require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

After login or registration, you'll receive a token in the response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Admin Access

To create an admin user, you need to manually update the user's role in the database:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Database Models

### User
- name, email, password (hashed), phone, address, role (user/admin), isActive

### Product
- name, description, price, discountPrice, category, stock, imageUrl, images, specifications, ratings, isActive, createdBy

### Cart
- user (ref), items (product ref, quantity, price), totalAmount, totalItems

### Order
- orderNumber, user (ref), items, shippingAddress, paymentInfo, orderStatus, subtotal, shippingCost, tax, totalAmount, trackingNumber

## Validation Rules

### Registration
- Name: 2-50 characters
- Email: Valid email format
- Password: Min 6 chars, must contain uppercase, lowercase, and number
- Phone: Valid phone number format

### Product
- Price: Positive number
- Stock: Non-negative integer
- Category: Must be one of the predefined categories

### Order
- Postal Code: 6-digit Indian postal code format (can be customized)

## Business Logic

### Shipping Cost
- Free shipping for orders above ₹500
- ₹50 flat shipping fee for orders below ₹500

### Tax Calculation
- 18% GST applied on all orders

### Stock Management
- Stock is automatically reduced when order is placed
- Stock is restored when order is cancelled
- Real-time stock validation before adding to cart or placing order

## Error Codes

- 200: Success
- 201: Resource created
- 400: Bad request / Validation error
- 401: Unauthorized / Invalid credentials
- 403: Forbidden / Admin access required
- 404: Resource not found
- 500: Internal server error

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Protected routes middleware
- Admin-only routes
- Input validation and sanitization
- CORS configuration
- MongoDB injection prevention

## Project Structure

```
.
├── config/
│   ├── config.js          # Configuration constants
│   └── database.js         # MongoDB connection
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── cartController.js   # Cart operations
│   ├── orderController.js  # Order management
│   ├── paymentController.js # Payment processing
│   └── productController.js # Product CRUD
├── middleware/
│   ├── admin.js            # Admin authorization
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Global error handler
│   └── validation.js       # Input validation rules
├── models/
│   ├── Cart.js             # Cart schema
│   ├── Order.js            # Order schema
│   ├── Product.js          # Product schema
│   └── User.js             # User schema
├── routes/
│   ├── auth.js             # Auth routes
│   ├── cart.js             # Cart routes
│   ├── orders.js           # Order routes
│   ├── payment.js          # Payment routes
│   └── products.js         # Product routes
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── server.js               # Entry point
└── README.md               # Documentation
```

## Testing the API

You can test the API using tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

### Example: Create Admin and Test Flow

1. Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"Admin123"}'
```

2. Manually set admin role in MongoDB

3. Login to get token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123"}'
```

4. Create a product (use token from step 3):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Product","description":"A test product","price":99,"category":"Electronics","stock":10}'
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/ecommerce |
| JWT_SECRET | Secret for JWT signing | your-secret-key |
| JWT_EXPIRE | JWT expiration time | 7d |
| STRIPE_SECRET_KEY | Stripe secret key | sk_test_xxx |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key | pk_test_xxx |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | whsec_xxx |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Future Enhancements

- Email notifications for orders
- Product reviews and ratings
- Wishlist functionality
- Product search with advanced filters
- Order tracking integration
- Multiple payment gateways
- Coupon and discount codes
- Analytics and reporting

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
