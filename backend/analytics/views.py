from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta
from .models import StockMovement
from . import serializers


class StockMovementsListView(generics.ListAPIView):
    """List stock movements with filtering and pagination."""
    serializer_class = serializers.StockMovementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StockMovement.objects.all()

        # Apply filters
        product_id = self.request.query_params.get('product_id')
        warehouse_id = self.request.query_params.get('warehouse_id')
        movement_type = self.request.query_params.get('movement_type')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        if date_from:
            queryset = queryset.filter(movement_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(movement_date__lte=date_to)

        return queryset.order_by('-movement_date')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_summary(request):
    """Get overall inventory summary."""
    from inventory.models import Stock

    summary = Stock.objects.aggregate(
        total_products=Count('product', distinct=True),
        total_warehouses=Count('warehouse', distinct=True),
        total_locations=Count('location', distinct=True),
        total_stock_value=Sum('total_value'),
        total_quantity=Sum('quantity_available'),
    )

    # Add additional metrics
    summary['active_products'] = Stock.objects.filter(
        quantity_available__gt=0
    ).aggregate(count=Count('product', distinct=True))['count']

    summary['low_stock_items'] = Stock.objects.filter(
        quantity_available__lte=F('product__reorder_point')
    ).count()

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_report(request):
    """Get detailed low stock report."""
    from inventory.models import Stock

    low_stock_items = Stock.objects.select_related('product', 'warehouse', 'location').filter(
        quantity_available__lte=F('product__reorder_point')
    ).values(
        'product__id', 'product__name', 'product__sku',
        'product__minimum_stock', 'product__reorder_point',
        'warehouse__name', 'quantity_available'
    ).annotate(
        shortage=F('product__reorder_point') - F('quantity_available')
    ).order_by('shortage')

    result = []
    for item in low_stock_items:
        result.append({
            'product_id': item['product__id'],
            'product_name': item['product__name'],
            'product_sku': item['product__sku'],
            'minimum_stock': item['product__minimum_stock'] or 0,
            'current_quantity': item['quantity_available'],
            'shortage': max(0, item['shortage']),
            'warehouse_name': item['warehouse__name'],
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Get dashboard summary data."""
    from inventory.models import Stock
    from operations.models import Order

    # Inventory metrics
    inventory_summary = Stock.objects.aggregate(
        total_stock_value=Sum('total_value'),
        total_products=Count('product', distinct=True),
        total_warehouses=Count('warehouse', distinct=True),
    )

    # Order metrics
    thirty_days_ago = timezone.now() - timedelta(days=30)
    order_summary = Order.objects.filter(created_at__gte=thirty_days_ago).aggregate(
        total_orders=Count('id'),
        pending_orders=Count('id', filter=Q(status='pending')),
        completed_orders=Count('id', filter=Q(status__in=['shipped', 'delivered'])),
        total_revenue=Sum('total_amount', filter=Q(status__in=['shipped', 'delivered'])),
    )

    # Recent movements (last 10)
    recent_movements = StockMovement.objects.select_related().order_by('-movement_date')[:10]

    result = {
        **inventory_summary,
        **order_summary,
        'recent_movements': [
            {
                'id': movement.id,
                'product_id': movement.product_id,
                'movement_type': movement.movement_type,
                'quantity': movement.quantity,
                'movement_date': movement.movement_date,
                'reference_type': movement.reference_type,
            } for movement in recent_movements
        ],
        'low_stock_items': Stock.objects.filter(
            quantity_available__lte=F('product__reorder_point')
        ).count(),
    }

    return Response(result)
