from rest_framework import serializers
from .models import Stock, StockBuffer, Adjustment, Transfer


class StockSerializer(serializers.ModelSerializer):
    """Serializer for Stock model."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    quantity_total = serializers.IntegerField(read_only=True)
    quantity_available_for_sale = serializers.IntegerField(read_only=True)

    class Meta:
        model = Stock
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name', 'location', 'location_code',
            'quantity_available', 'quantity_reserved', 'quantity_allocated', 'quantity_total',
            'quantity_available_for_sale', 'lot_number', 'expiry_date', 'manufacturing_date',
            'unit_cost', 'total_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'quantity_total', 'quantity_available_for_sale']


class StockBufferSerializer(serializers.ModelSerializer):
    """Serializer for StockBuffer model."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    safety_stock_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = StockBuffer
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name', 'minimum_quantity', 'maximum_quantity',
            'reorder_point', 'lead_time_days', 'safety_factor', 'safety_stock_quantity',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'safety_stock_quantity']


class AdjustmentSerializer(serializers.ModelSerializer):
    """Serializer for Adjustment model."""
    adjusted_by_name = serializers.CharField(source='adjusted_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    quantity_difference = serializers.SerializerMethodField()

    class Meta:
        model = Adjustment
        fields = [
            'id', 'adjustment_no', 'product_id', 'warehouse_id', 'location_id',
            'previous_qty', 'adjusted_qty', 'quantity_difference', 'adjustment_type',
            'category', 'reason', 'adjusted_by', 'adjusted_by_name',
            'approved_by', 'approved_by_name', 'approved_at',
            'cost_impact', 'created_at', 'updated_at'
        ]
        read_only_fields = ['adjustment_no', 'approved_at', 'created_at', 'updated_at']

    def get_quantity_difference(self, obj):
        return obj.adjusted_qty - obj.previous_qty

    def create(self, validated_data):
        validated_data['adjusted_by'] = self.context['request'].user
        return super().create(validated_data)


class TransferSerializer(serializers.ModelSerializer):
    """Serializer for Transfer model."""
    requested_by_name = serializers.CharField(source='requested_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    transferred_by_name = serializers.CharField(source='transferred_by.full_name', read_only=True)
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Transfer
        fields = [
            'id', 'transfer_no', 'from_warehouse_id', 'from_location_id',
            'to_warehouse_id', 'to_location_id', 'product_id', 'quantity',
            'unit_cost', 'total_value', 'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name', 'transferred_by', 'transferred_by_name',
            'status', 'requested_at', 'approved_at', 'transferred_at', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'transfer_no', 'approved_at', 'transferred_at',
            'created_at', 'updated_at'
        ]

    def get_total_value(self, obj):
        return obj.quantity * obj.unit_cost if obj.unit_cost else 0

    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)
