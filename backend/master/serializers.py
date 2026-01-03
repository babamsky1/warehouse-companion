from rest_framework import serializers
from .models import Category, Product, Warehouse, Location, Supplier


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    subcategories_count = serializers.SerializerMethodField()
    full_path = serializers.CharField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 'status',
            'subcategories_count', 'full_path',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_subcategories_count(self, obj):
        return obj.subcategories.count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for hierarchical category display."""
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'status', 'children']

    def get_children(self, obj):
        children = Category.objects.filter(parent=obj)
        return CategoryTreeSerializer(children, many=True).data


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='primary_supplier.name', read_only=True)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'barcode', 'name', 'description',
            'category', 'category_name', 'brand', 'group',
            'unit', 'cost_price', 'selling_price', 'profit_margin',
            'minimum_stock', 'maximum_stock', 'reorder_point',
            'primary_supplier', 'supplier_name',
            'weight', 'dimensions', 'status', 'image_url',
            'is_low_stock',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'profit_margin', 'is_low_stock']


class WarehouseSerializer(serializers.ModelSerializer):
    """Serializer for Warehouse model."""
    total_locations = serializers.IntegerField(read_only=True)
    active_locations = serializers.IntegerField(read_only=True)

    class Meta:
        model = Warehouse
        fields = [
            'id', 'code', 'name', 'type', 'address',
            'contact_person', 'phone', 'email', 'capacity', 'status',
            'total_locations', 'active_locations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'total_locations', 'active_locations']


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model."""
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = Location
        fields = [
            'id', 'warehouse', 'warehouse_name', 'zone', 'aisle', 'rack', 'bin', 'level',
            'code', 'barcode', 'capacity', 'current_utilization', 'description', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model."""
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'code', 'name', 'contact_person', 'phone', 'email', 'address',
            'city', 'country', 'tax_id', 'payment_terms', 'lead_time_days',
            'minimum_order_value', 'rating', 'status', 'products_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_products_count(self, obj):
        return obj.primary_products.count()
