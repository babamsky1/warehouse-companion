from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'stocks', views.StockViewSet, basename='stock')
router.register(r'adjustments', views.AdjustmentViewSet, basename='adjustment')
router.register(r'transfers', views.TransferViewSet, basename='transfer')
router.register(r'stock-buffers', views.StockBufferViewSet, basename='stock-buffer')

urlpatterns = [
    path('', include(router.urls)),
]
