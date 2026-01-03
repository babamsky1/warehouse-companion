from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'receivings', views.ReceivingViewSet, basename='receiving')
router.register(r'shipments', views.ShipmentViewSet, basename='shipment')
router.register(r'returns', views.ReturnViewSet, basename='return')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
