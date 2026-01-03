"""
URL configuration for wms_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# CSRF Token endpoint for frontend
def csrf_token_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Warehouse Management System API",
        default_version='v1',
        description="API for Warehouse Management System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@wms.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # CSRF Token endpoint
    path('csrf-token/', csrf_token_view, name='csrf_token'),

    # API URLs
    path('api/', include([
        # Authentication
        path('auth/', include('accounts.urls')),

        # Master Data
        path('master/', include('master.urls')),

        # Inventory Management
        path('inventory/', include('inventory.urls')),

        # Operations
        path('operations/', include('operations.urls')),

        # Analytics & Reports
        path('analytics/', include('analytics.urls')),

        # Mock Data Endpoints (High-performance in-memory data)
        path('mock/', include('mock_data.urls')),
    ])),

    # API Documentation
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)