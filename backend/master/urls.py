from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'warehouses', views.WarehouseViewSet, basename='warehouse')
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'suppliers', views.SupplierViewSet, basename='supplier')

urlpatterns = [
    path('', include(router.urls)),
]
