"""
Mock Data API Views

High-performance API endpoints serving JSON data from in-memory dictionaries.
All endpoints are cached using Django's cache_page decorator for optimal performance.

Performance Features:
- Response caching to reduce computation
- Minimal serialization overhead
- Fast in-memory data access
- Optimized JSON responses

Future Integration:
- Replace with Django REST Framework ViewSets when database is configured
- Add proper authentication and permission checks
- Implement real-time data updates
"""

import json
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from . import data_generator

# Cache timeout in seconds (5 minutes for development)
CACHE_TIMEOUT = 300

@cache_page(CACHE_TIMEOUT)
@require_http_methods(["GET"])
def users_api(request):
    """
    GET /api/users/
    Returns paginated list of users with optional search.

    Query Parameters:
    - limit: Number of results per page (default: 100, max: 1000)
    - offset: Pagination offset (default: 0)
    - search: Search term for filtering users

    Response: JSON with data, total, limit, offset
    """
    try:
        limit = min(int(request.GET.get('limit', 100)), 1000)  # Max 1000 for performance
        offset = max(int(request.GET.get('offset', 0)), 0)
        search = request.GET.get('search', '').strip()

        result = data_generator.get_users(limit=limit, offset=offset, search=search)

        return JsonResponse({
            'success': True,
            'data': result,
            'message': f'Retrieved {len(result["data"])} users'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error retrieving users: {str(e)}'
        }, status=500)

@cache_page(CACHE_TIMEOUT)
@require_http_methods(["GET"])
def products_api(request):
    """
    GET /api/products/
    Returns paginated list of products with optional search.

    Query Parameters:
    - limit: Number of results per page (default: 100, max: 1000)
    - offset: Pagination offset (default: 0)
    - search: Search term for filtering products

    Response: JSON with data, total, limit, offset
    """
    try:
        limit = min(int(request.GET.get('limit', 100)), 1000)  # Max 1000 for performance
        offset = max(int(request.GET.get('offset', 0)), 0)
        search = request.GET.get('search', '').strip()

        result = data_generator.get_products(limit=limit, offset=offset, search=search)

        return JsonResponse({
            'success': True,
            'data': result,
            'message': f'Retrieved {len(result["data"])} products'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error retrieving products: {str(e)}'
        }, status=500)

@cache_page(CACHE_TIMEOUT)
@require_http_methods(["GET"])
def dashboard_api(request):
    """
    GET /api/dashboard/
    Returns comprehensive dashboard data including statistics and charts.

    Response: JSON with summary statistics, charts data, alerts, and recent activity
    """
    try:
        data = data_generator.get_dashboard_data()

        return JsonResponse({
            'success': True,
            'data': data,
            'message': 'Dashboard data retrieved successfully'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error retrieving dashboard data: {str(e)}'
        }, status=500)

@cache_page(CACHE_TIMEOUT)
@require_http_methods(["GET"])
def settings_api(request):
    """
    GET /api/settings/
    Returns system settings configuration.

    Response: JSON with general, notifications, security, and performance settings
    """
    try:
        data = data_generator.get_settings()

        return JsonResponse({
            'success': True,
            'data': data,
            'message': 'Settings retrieved successfully'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error retrieving settings: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_settings_api(request):
    """
    POST /api/settings/update/
    Updates system settings.

    Body: JSON with settings data to update
    Response: JSON with updated settings
    """
    try:
        # Parse JSON body
        body = json.loads(request.body.decode('utf-8'))
        settings_data = body.get('settings', {})

        if not settings_data:
            return JsonResponse({
                'success': False,
                'message': 'No settings data provided'
            }, status=400)

        # Update settings (this will clear the cache automatically)
        updated_settings = data_generator.update_settings(settings_data)

        return JsonResponse({
            'success': True,
            'data': updated_settings,
            'message': 'Settings updated successfully'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error updating settings: {str(e)}'
        }, status=500)

# Performance monitoring endpoints
@require_http_methods(["GET"])
def health_check(request):
    """
    GET /api/health/
    Basic health check endpoint for monitoring.

    Response: JSON with server status and mock data statistics
    """
    try:
        stats = {
            'users_count': len(data_generator.MOCK_USERS),
            'products_count': len(data_generator.MOCK_PRODUCTS),
            'dashboard_data_ready': bool(data_generator.MOCK_DASHBOARD_DATA),
            'settings_ready': bool(data_generator.MOCK_SETTINGS),
        }

        return JsonResponse({
            'success': True,
            'status': 'healthy',
            'data': stats,
            'message': 'Mock data server is running optimally'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'status': 'unhealthy',
            'message': f'Server error: {str(e)}'
        }, status=500)

@require_http_methods(["POST"])
def invalidate_cache(request):
    """
    POST /api/cache/invalidate/
    Manually invalidate all cached responses (development utility).

    Response: JSON confirmation
    """
    try:
        from django.core.cache import cache
        cache.clear()

        return JsonResponse({
            'success': True,
            'message': 'Cache invalidated successfully'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error invalidating cache: {str(e)}'
        }, status=500)
