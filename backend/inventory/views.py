from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, F, Count
from django.shortcuts import get_object_or_404
from .models import Stock, StockBuffer, Adjustment, Transfer
from . import serializers


class StockViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stock levels."""
    queryset = Stock.objects.select_related('product', 'warehouse', 'location').all()
    serializer_class = serializers.StockSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'warehouse', 'location', 'lot_number']

    @action(detail=False, methods=['get'])
    def by_warehouse(self, request):
        """Get stock by warehouse."""
        warehouse_id = request.query_params.get('warehouse_id')
        if not warehouse_id:
            return Response({'error': 'warehouse_id parameter required'}, status=400)

        stocks = self.get_queryset().filter(warehouse_id=warehouse_id)
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get stock by product."""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id parameter required'}, status=400)

        stocks = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock levels."""
        # Join with stock buffers to check against minimum levels
        low_stock_items = Stock.objects.select_related('product', 'warehouse', 'location').filter(
            Q(quantity_available__lte=F('product__reorder_point')) |
            Q(stock_buffers__minimum_quantity__isnull=False,
              quantity_available__lte=F('stock_buffers__minimum_quantity'))
        ).distinct()

        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get stock summary statistics."""
        summary = Stock.objects.aggregate(
            total_products=Count('product', distinct=True),
            total_warehouses=Count('warehouse', distinct=True),
            total_value=Sum('total_value'),
            total_quantity=Sum('quantity_available'),
        )

        # Count low stock items
        low_stock_count = self.get_queryset().filter(
            quantity_available__lte=F('product__reorder_point')
        ).count()

        summary['low_stock_items'] = low_stock_count
        return Response(summary)


class StockBufferViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stock buffers."""
    queryset = StockBuffer.objects.select_related('product', 'warehouse').all()
    serializer_class = serializers.StockBufferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'warehouse']

    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get stock buffer by product."""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'error': 'product_id parameter required'}, status=400)

        try:
            buffer = StockBuffer.objects.get(product_id=product_id)
            serializer = self.get_serializer(buffer)
            return Response(serializer.data)
        except StockBuffer.DoesNotExist:
            return Response({'error': 'Stock buffer not found'}, status=404)


class AdjustmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stock adjustments."""
    queryset = Adjustment.objects.select_related('adjusted_by', 'approved_by').all()
    serializer_class = serializers.AdjustmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['adjustment_type', 'category', 'status', 'adjusted_by', 'approved_by']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an adjustment."""
        adjustment = self.get_object()

        if adjustment.approved_by:
            return Response({'error': 'Adjustment already approved'}, status=400)

        adjustment.approved_by = request.user
        adjustment.approved_at = request._get_raw_host()  # Use timezone.now()
        adjustment.save()

        serializer = self.get_serializer(adjustment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending adjustments."""
        pending_adjustments = self.get_queryset().filter(approved_by__isnull=True)
        serializer = self.get_serializer(pending_adjustments, many=True)
        return Response(serializer.data)


class TransferViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stock transfers."""
    queryset = Transfer.objects.select_related(
        'requested_by', 'approved_by', 'transferred_by'
    ).all()
    serializer_class = serializers.TransferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'from_warehouse_id', 'to_warehouse_id', 'requested_by']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a transfer request."""
        transfer = self.get_object()

        if transfer.status != 'pending':
            return Response({'error': 'Transfer is not pending'}, status=400)

        transfer.approved_by = request.user
        transfer.approved_at = request._get_raw_host()  # Use timezone.now()
        transfer.status = 'approved'
        transfer.save()

        serializer = self.get_serializer(transfer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a transfer (move stock)."""
        transfer = self.get_object()

        if transfer.status != 'approved':
            return Response({'error': 'Transfer must be approved first'}, status=400)

        # Here you would implement the actual stock movement logic
        # This would involve updating Stock records for source and destination

        transfer.transferred_by = request.user
        transfer.transferred_at = request._get_raw_host()  # Use timezone.now()
        transfer.status = 'completed'
        transfer.save()

        serializer = self.get_serializer(transfer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending transfers."""
        pending_transfers = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(pending_transfers, many=True)
        return Response(serializer.data)
