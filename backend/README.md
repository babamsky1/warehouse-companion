# Warehouse Management System - Django Backend

A comprehensive Django REST API backend for warehouse management with JWT authentication, real-time analytics, and full inventory tracking.

## 🚀 Features

- **JWT Authentication** with refresh tokens
- **Multi-tenant Support** (warehouses, locations)
- **Complete Inventory Management** (products, stock, adjustments, transfers)
- **Order Processing** (receiving, shipping, returns)
- **Real-time Analytics** and reporting
- **User Role Management** (admin, manager, operator, viewer)
- **RESTful API** with Django REST Framework
- **API Documentation** with Swagger/OpenAPI
- **CORS Support** for frontend integration

## 🛠️ Technology Stack

- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL/SQLite** - Database
- **JWT Authentication** - Token-based auth
- **Django Filters** - Advanced filtering
- **DRF Yasg** - API documentation

## 📦 Installation

1. **Clone and setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment variables** (create `.env` file):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

3. **Run migrations**:
```bash
python manage.py migrate
```

4. **Create superuser**:
```bash
python manage.py createsuperuser
```

5. **Run development server**:
```bash
python manage.py runserver
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/token/verify/` - Verify JWT token

### Master Data
- `GET /api/master/categories/` - Product categories
- `GET /api/master/products/` - Products with filtering
- `GET /api/master/warehouses/` - Warehouse management
- `GET /api/master/locations/` - Storage locations
- `GET /api/master/suppliers/` - Supplier management

### Inventory Management
- `GET /api/inventory/stocks/` - Stock levels
- `GET /api/inventory/adjustments/` - Stock adjustments
- `GET /api/inventory/transfers/` - Stock transfers
- `GET /api/inventory/stock-buffers/` - Safety stock levels

### Operations
- `GET /api/operations/receivings/` - Goods receiving
- `GET /api/operations/shipments/` - Order shipments
- `GET /api/operations/returns/` - Customer returns
- `GET /api/operations/orders/` - Customer orders

### Analytics & Reports
- `GET /api/analytics/stock-movements/` - Stock movement history
- `GET /api/analytics/inventory-summary/` - Inventory overview
- `GET /api/analytics/low-stock-report/` - Low stock alerts
- `GET /api/analytics/dashboard-summary/` - Dashboard data

## 📚 API Documentation

Access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** to get access and refresh tokens
2. **Include** the access token in the `Authorization` header:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Refresh** the token before it expires using the refresh token

## 🗄️ Database Schema

### Core Models
- **User**: Custom user model with roles and warehouse assignment
- **Category**: Hierarchical product categories
- **Product**: Product master data with pricing and inventory controls
- **Warehouse**: Physical warehouse locations
- **Location**: Specific storage locations within warehouses
- **Supplier**: Vendor information and performance tracking

### Inventory Models
- **Stock**: Current stock levels by location
- **StockBuffer**: Safety stock levels and reorder points
- **Adjustment**: Stock quantity corrections
- **Transfer**: Stock movements between locations

### Operations Models
- **Receiving**: Goods receipt processing
- **Shipment**: Order fulfillment and shipping
- **Return**: Customer return processing
- **Order**: Customer order management

### Analytics Models
- **StockMovement**: Audit trail of all stock changes

## 🧪 Testing

Run the test suite:
```bash
python manage.py test
```

## 🚀 Production Deployment

1. Set `DEBUG=False` in settings
2. Configure PostgreSQL database
3. Set up proper static file serving
4. Configure email settings
5. Use a production WSGI server (gunicorn)
6. Set up proper logging and monitoring

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository.