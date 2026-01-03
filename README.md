# 🏭 Warehouse Management System (WMS)

A full-stack warehouse management system with ultra-optimized performance, built with Django REST Framework backend and React frontend.

## 🚀 Features

### Backend (Django)
- **JWT Authentication** with refresh tokens
- **RESTful API** with Django REST Framework
- **PostgreSQL/SQLite** database support
- **Real-time Analytics** and reporting
- **Multi-tenant Support** (warehouses, locations)
- **Complete Inventory Management**
- **Order Processing** (receiving, shipping, returns)
- **API Documentation** with Swagger/OpenAPI

### Frontend (React)
- **Ultra-fast Performance** with React Query
- **TypeScript** for type safety
- **Modern UI** with Tailwind CSS and shadcn/ui
- **Real-time Updates** with optimistic UI
- **Advanced Caching** and prefetching
- **Responsive Design** for all devices

## 🛠️ Technology Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL/SQLite** - Database
- **JWT Authentication** - Token-based auth
- **Django Filters** - Advanced filtering
- **DRF Yasg** - API documentation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack React Query** - Data fetching & caching
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Vite** - Build tool

## 📦 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone and Setup Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### 2. Setup Frontend
```bash
cd warehouse-companion
npm install
```

### 3. Run Both Services
```bash
# Linux/macOS
./run-dev.sh

# Windows
run-dev.bat
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/swagger/

## 🔐 Default Credentials

- **Admin Email**: admin@example.com
- **Password**: admin123

## 📊 System Architecture

### Database Schema
```
Users (Custom User Model)
├── Roles: Admin, Manager, Operator, Viewer
└── Warehouse Assignment

Master Data
├── Categories (Hierarchical)
├── Products (with pricing, inventory controls)
├── Warehouses (physical locations)
├── Locations (storage bins/racks)
└── Suppliers (vendors)

Inventory Management
├── Stock (current levels by location)
├── Stock Buffers (safety levels)
├── Adjustments (corrections)
└── Transfers (movements)

Operations
├── Receivings (goods receipt)
├── Shipments (order fulfillment)
├── Returns (customer returns)
└── Orders (customer orders)

Analytics
└── Stock Movements (audit trail)
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token

### Master Data
- `GET /api/master/categories/` - Categories
- `GET /api/master/products/` - Products
- `GET /api/master/warehouses/` - Warehouses
- `GET /api/master/locations/` - Locations
- `GET /api/master/suppliers/` - Suppliers

### Inventory
- `GET /api/inventory/stocks/` - Stock levels
- `GET /api/inventory/adjustments/` - Adjustments
- `GET /api/inventory/transfers/` - Transfers
- `GET /api/inventory/stock-buffers/` - Safety stock

### Operations
- `GET /api/operations/receivings/` - Goods receiving
- `GET /api/operations/shipments/` - Shipments
- `GET /api/operations/returns/` - Returns
- `GET /api/operations/orders/` - Orders

### Analytics
- `GET /api/analytics/dashboard-summary/` - Dashboard data
- `GET /api/analytics/inventory-summary/` - Inventory overview
- `GET /api/analytics/low-stock-report/` - Low stock alerts

## 🚀 Performance Features

### Backend Optimizations
- **Database Indexing** on frequently queried fields
- **Query Optimization** with select_related/prefetch_related
- **Pagination** for large datasets
- **Caching** strategies
- **Background Processing** for heavy operations

### Frontend Optimizations
- **React Query** with intelligent caching
- **Optimistic Updates** for instant UI feedback
- **Prefetching** for navigation and related data
- **Virtual Scrolling** for large lists
- **Code Splitting** for faster loading
- **Bundle Optimization** with Vite

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd warehouse-companion
npm test
```

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False` in Django settings
2. Configure PostgreSQL database
3. Set up static file serving
4. Configure email settings
5. Use gunicorn for WSGI server
6. Set up proper logging

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files with nginx/apache
3. Configure API base URL for production

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@localhost:5432/wms
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 📚 Documentation

- **API Documentation**: Visit `/swagger/` on your backend
- **Frontend Components**: Check `warehouse-companion/README.md`
- **Backend Setup**: Check `backend/README.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, please create an issue in the repository or contact the development team.
