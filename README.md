# E-commerce API

A comprehensive e-commerce API built with NestJS following best architectural practices, featuring full CRUD operations for products, users, and orders with complete e2e testing coverage.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for Products, Users, and Orders
- **Comprehensive CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Advanced Order Management**: Order lifecycle management with status transitions and stock validation
- **Input Validation**: Robust validation using class-validator with detailed error messages
- **API Documentation**: Complete Swagger/OpenAPI documentation with interactive interface
- **Exception Handling**: Global exception filter with proper error responses
- **Response Transformation**: Consistent API response format with success/error handling
- **Pagination Support**: Built-in pagination for list endpoints
- **Stock Management**: Real-time inventory tracking with stock validation
- **Soft Delete**: User soft delete functionality with data preservation
- **Configuration Management**: Environment-based configuration with validation
- **Full Test Coverage**: Comprehensive e2e test suite covering all endpoints and edge cases

## 🏗️ Architecture

The application follows NestJS best practices with a modular architecture:

```
src/
├── config/           # Configuration management
├── common/           # Shared utilities and components
│   ├── dto/         # Common DTOs (pagination, responses)
│   ├── entities/    # Base entities
│   ├── filters/     # Exception filters
│   ├── interceptors/# Response transformers
│   └── pipes/       # Validation pipes
├── modules/         # Feature modules
│   ├── products/    # Product management
│   ├── users/       # User management
│   └── orders/      # Order management
└── main.ts          # Application bootstrap
```

Each module follows the standard NestJS structure:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Entities**: Data models and relationships
- **DTOs**: Data transfer objects with validation
- **Tests**: Comprehensive e2e test coverage

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with e2e testing
- **Configuration**: @nestjs/config
- **UUID**: For unique identifiers

## 📋 API Endpoints

### Products
- `POST /api/v1/products` - Create a new product
- `GET /api/v1/products` - Get all products with filtering and pagination
- `GET /api/v1/products/categories` - Get all product categories
- `GET /api/v1/products/:id` - Get a product by ID
- `PATCH /api/v1/products/:id` - Update a product
- `PATCH /api/v1/products/:id/stock` - Update product stock
- `DELETE /api/v1/products/:id` - Delete a product

### Users
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users` - Get all active users
- `GET /api/v1/users/:id` - Get a user by ID
- `PATCH /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user (soft delete)

### Orders
- `POST /api/v1/orders` - Create a new order
- `GET /api/v1/orders` - Get all orders or filter by user
- `GET /api/v1/orders/:id` - Get an order by ID
- `PATCH /api/v1/orders/:id` - Update order status
- `PATCH /api/v1/orders/:id/cancel` - Cancel an order

### Application
- `GET /api/v1` - API welcome message
- `GET /api/v1/health` - Health check endpoint

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd example-ecommerce-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

### API Documentation

Once the application is running, you can access the interactive Swagger documentation at:
```
http://localhost:3000/api/v1/docs
```

## 🧪 Testing

The application includes comprehensive e2e test coverage for all endpoints and business logic.

### Run All Tests
```bash
npm run test:e2e
```

### Test Coverage
- **69 test cases** covering all endpoints
- **100% endpoint coverage** including success and error scenarios
- **Validation testing** for all input parameters
- **Business logic testing** for order management and stock validation
- **Integration testing** for cross-module functionality

### Test Categories
- **Products Module**: CRUD operations, stock management, validation
- **Users Module**: User management, role handling, soft delete
- **Orders Module**: Order lifecycle, status transitions, stock validation
- **Integration Tests**: Cross-module workflows and data consistency
- **Application Tests**: Health checks and general endpoints

## 📊 Data Models

### Product
```typescript
{
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Order
```typescript
{
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem
```typescript
{
  productId: string;
  quantity: number;
  price: number;
}
```

## 🔧 Configuration

The application uses environment-based configuration with the following variables:

```bash
# Application
PORT=3000
NODE_ENV=development

# API
API_PREFIX=api/v1
API_VERSION=1.0

# Add other configuration as needed
```

## 🛡️ Validation & Error Handling

- **Input Validation**: All endpoints use class-validator for robust input validation
- **Global Exception Filter**: Consistent error response format across the application
- **Custom Validation Messages**: Detailed, user-friendly error messages
- **HTTP Status Codes**: Proper status codes for different scenarios (200, 201, 400, 404, 409, 500)

## 📈 Business Logic

### Order Management
- **Stock Validation**: Ensures sufficient inventory before order creation
- **Status Transitions**: Enforces valid order status changes (pending → confirmed → shipped → delivered)
- **Automatic Calculations**: Computes total amounts based on current product prices
- **Cancellation Rules**: Prevents cancellation of delivered orders

### Inventory Management
- **Real-time Stock Updates**: Automatic stock reduction on order creation
- **Stock Restoration**: Returns stock on order cancellation
- **Negative Stock Prevention**: Validates stock availability before operations

### User Management
- **Email Uniqueness**: Prevents duplicate user registrations
- **Soft Delete**: Preserves user data while marking as inactive
- **Role-based Operations**: Supports customer and admin roles

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start:prod
```

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) - A progressive Node.js framework
- Documentation powered by [Swagger/OpenAPI](https://swagger.io/)
- Testing with [Jest](https://jestjs.io/)
- Validation using [class-validator](https://github.com/typestack/class-validator)