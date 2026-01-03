"""
Mock Data Generator for WMS System

This module provides high-performance in-memory mock data for development and testing.
All data is generated once at startup and cached for the server lifetime.

Performance Features:
- In-memory storage for instant access
- Lazy generation with server startup
- Optimized data structures for fast filtering and searching
- Minimal memory footprint with shared data structures

Future Integration:
- Replace with database queries when Django models are configured
- Add data seeding scripts for production
- Implement data export/import functionality
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
from functools import lru_cache

# Global in-memory data storage
# These will be populated once at server startup
MOCK_USERS: List[Dict[str, Any]] = []
MOCK_PRODUCTS: List[Dict[str, Any]] = []
MOCK_DASHBOARD_DATA: Dict[str, Any] = {}
MOCK_SETTINGS: Dict[str, Any] = {}

# Constants for data generation
USER_ROLES = ['Admin', 'Manager', 'Operator', 'Viewer']
DEPARTMENTS = ['Operations', 'Inventory', 'Sales', 'Admin', 'IT']
PRODUCT_CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Tools', 'Food']
SUPPLIERS = [f'Supplier {i+1}' for i in range(20)]
STATUSES = ['Active', 'Inactive']

@lru_cache(maxsize=1)
def initialize_mock_data():
    """
    Initialize all mock data at server startup.
    Uses lru_cache to ensure it's only called once.
    """
    global MOCK_USERS, MOCK_PRODUCTS, MOCK_DASHBOARD_DATA, MOCK_SETTINGS

    print("🔄 Initializing mock data...")

    # Generate users
    MOCK_USERS = _generate_users(1000)

    # Generate products
    MOCK_PRODUCTS = _generate_products(2000)

    # Generate dashboard data
    MOCK_DASHBOARD_DATA = _generate_dashboard_data()

    # Generate settings
    MOCK_SETTINGS = _generate_settings()

    print("✅ Mock data initialized successfully!")
    print(f"   📊 {len(MOCK_USERS)} users generated")
    print(f"   📦 {len(MOCK_PRODUCTS)} products generated")
    print("   📈 Dashboard data ready")
    print("   ⚙️  Settings data ready")

def _generate_users(count: int) -> List[Dict[str, Any]]:
    """Generate mock user data with realistic attributes."""
    users = []

    for i in range(count):
        created_date = datetime.now() - timedelta(days=random.randint(0, 365))
        last_login = datetime.now() - timedelta(days=random.randint(0, 30))

        user = {
            'id': i + 1,
            'name': f'User {i + 1}',
            'email': f'user{i + 1}@example.com',
            'role': random.choice(USER_ROLES),
            'status': random.choice(STATUSES + ['Active'] * 9),  # 90% active
            'department': random.choice(DEPARTMENTS),
            'last_login': last_login.isoformat(),
            'created_at': created_date.isoformat(),
            'phone': f'+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}',
            'avatar': f'https://api.dicebear.com/7.x/avataaars/svg?seed=user{i + 1}',
        }
        users.append(user)

    return users

def _generate_products(count: int) -> List[Dict[str, Any]]:
    """Generate mock product data with inventory information."""
    products = []

    for i in range(count):
        created_date = datetime.now() - timedelta(days=random.randint(0, 180))
        updated_date = datetime.now() - timedelta(days=random.randint(0, 30))

        # Generate realistic pricing
        base_price = random.uniform(10, 500)
        price = round(base_price * random.uniform(0.8, 1.5), 2)

        # Generate stock levels with some low stock items
        stock = random.randint(0, 1000)
        reorder_point = random.randint(5, 50)

        product = {
            'id': i + 1,
            'sku': f'SKU-{str(i + 1).zfill(6)}',
            'name': f'Product {i + 1}',
            'description': f'Description for Product {i + 1}',
            'category': random.choice(PRODUCT_CATEGORIES),
            'supplier': random.choice(SUPPLIERS),
            'price': price,
            'cost': round(price * random.uniform(0.5, 0.8), 2),
            'stock': stock,
            'reorder_point': reorder_point,
            'status': 'Active' if random.random() > 0.05 else 'Inactive',  # 95% active
            'weight': round(random.uniform(0.1, 50), 2),
            'dimensions': {
                'length': round(random.uniform(1, 100), 1),
                'width': round(random.uniform(1, 100), 1),
                'height': round(random.uniform(1, 100), 1),
            },
            'created_at': created_date.isoformat(),
            'updated_at': updated_date.isoformat(),
            'barcode': f'{random.randint(100000000000, 999999999999)}',
        }
        products.append(product)

    return products

def _generate_dashboard_data() -> Dict[str, Any]:
    """Generate comprehensive dashboard statistics."""
    return {
        'summary': {
            'total_products': len(MOCK_PRODUCTS),
            'active_products': len([p for p in MOCK_PRODUCTS if p['status'] == 'Active']),
            'total_users': len(MOCK_USERS),
            'active_users': len([u for u in MOCK_USERS if u['status'] == 'Active']),
            'low_stock_items': len([p for p in MOCK_PRODUCTS if p['stock'] <= p['reorder_point']]),
            'out_of_stock_items': len([p for p in MOCK_PRODUCTS if p['stock'] == 0]),
            'total_inventory_value': sum(p['price'] * p['stock'] for p in MOCK_PRODUCTS),
            'recent_orders': random.randint(45, 155),
            'pending_orders': random.randint(5, 25),
        },
        'charts': {
            'inventory_by_category': _generate_category_chart(),
            'stock_movements': _generate_movement_chart(),
            'user_activity': _generate_activity_chart(),
        },
        'alerts': _generate_alerts(),
        'recent_activity': _generate_recent_activity(),
    }

def _generate_category_chart() -> List[Dict[str, Any]]:
    """Generate inventory distribution by category."""
    category_counts = {}
    for product in MOCK_PRODUCTS:
        category = product['category']
        category_counts[category] = category_counts.get(category, 0) + 1

    return [
        {'category': cat, 'count': count, 'percentage': round(count / len(MOCK_PRODUCTS) * 100, 1)}
        for cat, count in category_counts.items()
    ]

def _generate_movement_chart() -> List[Dict[str, Any]]:
    """Generate stock movement data for the last 30 days."""
    movements = []
    for i in range(30):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        movements.append({
            'date': date,
            'incoming': random.randint(10, 100),
            'outgoing': random.randint(5, 80),
            'adjustments': random.randint(0, 20),
        })
    return movements

def _generate_activity_chart() -> List[Dict[str, Any]]:
    """Generate user activity data."""
    activities = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        activities.append({
            'date': date,
            'logins': random.randint(20, 100),
            'orders_created': random.randint(5, 30),
            'inventory_updates': random.randint(10, 50),
        })
    return activities

def _generate_alerts() -> List[Dict[str, Any]]:
    """Generate system alerts."""
    return [
        {
            'id': 1,
            'type': 'warning',
            'title': 'Low Stock Alert',
            'message': f'{len([p for p in MOCK_PRODUCTS if p["stock"] <= p["reorder_point"]])} products are below reorder point',
            'timestamp': datetime.now().isoformat(),
        },
        {
            'id': 2,
            'type': 'info',
            'title': 'System Maintenance',
            'message': 'Scheduled maintenance in 2 hours',
            'timestamp': (datetime.now() + timedelta(hours=2)).isoformat(),
        },
    ]

def _generate_recent_activity() -> List[Dict[str, Any]]:
    """Generate recent system activity."""
    activities = []
    for i in range(10):
        timestamp = datetime.now() - timedelta(minutes=random.randint(0, 1440))  # Last 24 hours
        activity_types = [
            ('user_login', 'User logged in'),
            ('order_created', 'New order created'),
            ('product_updated', 'Product information updated'),
            ('inventory_adjusted', 'Stock level adjusted'),
            ('supplier_contacted', 'Supplier contacted'),
        ]
        activity_type, description = random.choice(activity_types)

        activities.append({
            'id': i + 1,
            'type': activity_type,
            'description': f'{description} - {random.choice(["System", "Admin", f"User {random.randint(1, len(MOCK_USERS))}"])}',
            'timestamp': timestamp.isoformat(),
            'user': f'User {random.randint(1, len(MOCK_USERS))}',
        })

    return sorted(activities, key=lambda x: x['timestamp'], reverse=True)

def _generate_settings() -> Dict[str, Any]:
    """Generate default system settings."""
    return {
        'general': {
            'company_name': 'Warehouse Co.',
            'timezone': 'UTC',
            'language': 'en',
            'date_format': 'MM/DD/YYYY',
        },
        'notifications': {
            'email_alerts': True,
            'low_stock_alerts': True,
            'order_updates': False,
            'system_maintenance': True,
        },
        'security': {
            'session_timeout': 30,
            'password_expiry': 90,
            'two_factor_auth': False,
            'login_attempts': 5,
        },
        'performance': {
            'auto_refresh': True,
            'refresh_interval': 30,
            'virtual_scrolling': True,
            'preload_data': True,
        },
    }

# Data access functions (replace with Django ORM queries in future)
def get_users(limit: int = 100, offset: int = 0, search: str = '') -> Dict[str, Any]:
    """Get paginated users with optional search."""
    filtered_users = MOCK_USERS

    if search:
        search_lower = search.lower()
        filtered_users = [
            u for u in filtered_users
            if search_lower in u['name'].lower() or
               search_lower in u['email'].lower() or
               search_lower in u['role'].lower() or
               search_lower in u['department'].lower()
        ]

    total = len(filtered_users)
    users = filtered_users[offset:offset + limit]

    return {
        'data': users,
        'total': total,
        'limit': limit,
        'offset': offset,
    }

def get_products(limit: int = 100, offset: int = 0, search: str = '') -> Dict[str, Any]:
    """Get paginated products with optional search."""
    filtered_products = MOCK_PRODUCTS

    if search:
        search_lower = search.lower()
        filtered_products = [
            p for p in filtered_products
            if search_lower in p['sku'].lower() or
               search_lower in p['name'].lower() or
               search_lower in p['category'].lower() or
               search_lower in p['supplier'].lower()
        ]

    total = len(filtered_products)
    products = filtered_products[offset:offset + limit]

    return {
        'data': products,
        'total': total,
        'limit': limit,
        'offset': offset,
    }

def get_dashboard_data() -> Dict[str, Any]:
    """Get dashboard summary data."""
    return MOCK_DASHBOARD_DATA

def get_settings() -> Dict[str, Any]:
    """Get system settings."""
    return MOCK_SETTINGS

def update_settings(new_settings: Dict[str, Any]) -> Dict[str, Any]:
    """Update system settings."""
    global MOCK_SETTINGS
    MOCK_SETTINGS.update(new_settings)
    return MOCK_SETTINGS
