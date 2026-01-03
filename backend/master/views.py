from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from .models import Category, Product, Warehouse, Location, Supplier
from . import serializers


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing product categories."""
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'parent']
    search_fields = ['name', 'description']

    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        """Get subcategories of a category."""
        category = self.get_object()
        subcategories = Category.objects.filter(parent=category)
        serializer = self.get_serializer(subcategories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get hierarchical category tree."""
        # Get root categories (no parent)
        root_categories = Category.objects.filter(parent__isnull=True)
        serializer = serializers.CategoryTreeSerializer(root_categories, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for managing products."""
    queryset = Product.objects.select_related('category', 'primary_supplier').all()
    serializer_class = serializers.ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'status', 'primary_supplier', 'brand']
    search_fields = ['sku', 'name', 'barcode', 'description']

    @action(detail=False, methods=['get'])
    def search_by_sku(self, request):
        """Search product by SKU."""
        sku = request.query_params.get('sku', '')
        if not sku:
            return Response({'error': 'SKU parameter is required'}, status=400)

        try:
            product = Product.objects.get(sku=sku)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products below reorder point."""
        # This would typically check actual stock levels
        # For now, return products with reorder_point > 0
        products = Product.objects.filter(
            reorder_point__gt=0,
            status='active'
        ).order_by('sku')
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class WarehouseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing warehouses."""
    queryset = Warehouse.objects.prefetch_related('locations').all()
    serializer_class = serializers.WarehouseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'status']
    search_fields = ['code', 'name', 'contact_person']

    @action(detail=True, methods=['get'])
    def locations(self, request, pk=None):
        """Get all locations in a warehouse."""
        warehouse = self.get_object()
        locations = warehouse.locations.all()
        serializer = serializers.LocationSerializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get warehouse statistics."""
        warehouse = self.get_object()
        stats = {
            'total_locations': warehouse.total_locations,
            'active_locations': warehouse.active_locations,
            'occupancy_rate': 0,  # Would calculate based on location utilization
        }
        return Response(stats)


class LocationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing warehouse locations."""
    queryset = Location.objects.select_related('warehouse').all()
    serializer_class = serializers.LocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['warehouse', 'zone', 'status', 'aisle', 'rack']
    search_fields = ['code', 'barcode', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()
        warehouse_id = self.request.query_params.get('warehouse_id')
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        return queryset


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing suppliers."""
    queryset = Supplier.objects.all()
    serializer_class = serializers.SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'country']
    search_fields = ['code', 'name', 'contact_person', 'email']

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Get products supplied by this supplier."""
        supplier = self.get_object()
        products = Product.objects.filter(primary_supplier=supplier)
        serializer = serializers.ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get supplier performance metrics."""
        supplier = self.get_object()
        # This would calculate based on order history, delivery times, etc.
        performance = {
            'rating': supplier.rating,
            'on_time_delivery': 0,  # Would calculate from order data
            'quality_score': 0,     # Would calculate from returns/issues
        }
        return Response(performance)
