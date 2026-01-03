from django.urls import path
from . import views

urlpatterns = [
    path('stock-movements/', views.StockMovementsListView.as_view(), name='stock-movements'),
    path('inventory-summary/', views.inventory_summary, name='inventory-summary'),
    path('low-stock-report/', views.low_stock_report, name='low-stock-report'),
    path('dashboard-summary/', views.dashboard_summary, name='dashboard-summary'),
]
