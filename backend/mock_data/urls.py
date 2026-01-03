"""
Mock Data API URLs

URL patterns for high-performance mock data endpoints.
All endpoints are optimized for speed and include caching.

Performance Notes:
- Endpoints use cache_page decorator for automatic response caching
- URLs are designed for easy frontend integration
- Minimal middleware overhead
"""

from django.urls import path
from . import views

# Mock data API endpoints
urlpatterns = [
    # Core data endpoints
    path('users/', views.users_api, name='mock_users'),
    path('products/', views.products_api, name='mock_products'),
    path('dashboard/', views.dashboard_api, name='mock_dashboard'),
    path('settings/', views.settings_api, name='mock_settings'),

    # Update endpoints
    path('settings/update/', views.update_settings_api, name='mock_settings_update'),

    # Utility endpoints
    path('health/', views.health_check, name='mock_health'),
    path('cache/invalidate/', views.invalidate_cache, name='mock_cache_invalidate'),
]
