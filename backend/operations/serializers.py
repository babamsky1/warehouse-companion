from rest_framework import serializers
from .models import (
    Receiving, ReceivingItem, Shipment, ShipmentItem,
    Return, ReturnItem, Order, OrderItem
)


class ReceivingItemSerializer(serializers.ModelSerializer):
    """Serializer for ReceivingItem model."""
    product_name = serializers.CharField(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    quantity_difference = serializers.IntegerField(read_only=True)

    class Meta:
        model = ReceivingItem
        fields = [
            'id', 'product_id', 'product_name', 'expected_quantity',
            'received_quantity', 'quantity_difference', 'unit_cost',
            'line_total', 'condition', 'notes'
        ]


class ReceivingSerializer(serializers.ModelSerializer):
    """Serializer for Receiving model."""
    items = ReceivingItemSerializer(many=True, read_only=True)
    received_by_name = serializers.CharField(source='received_by.full_name', read_only=True)
    inspected_by_name = serializers.CharField(source='inspected_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    total_items = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Receiving
        fields = [
            'id', 'receiving_no', 'supplier_id', 'purchase_order_no',
            'warehouse_id', 'location_id', 'received_by', 'received_by_name',
            'received_at', 'status', 'inspected_by', 'inspected_by_name',
            'inspected_at', 'approved_by', 'approved_by_name', 'approved_at',
            'notes', 'rejection_reason', 'items', 'total_items',
            'total_quantity', 'total_value', 'created_at', 'updated_at'
        ]
        read_only_fields = ['receiving_no', 'received_at', 'inspected_at', 'approved_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return obj.items.aggregate(total=Sum('received_quantity'))['total'] or 0

    def get_total_value(self, obj):
        return obj.items.aggregate(total=Sum('line_total'))['total'] or 0


class ShipmentItemSerializer(serializers.ModelSerializer):
    """Serializer for ShipmentItem model."""
    product_name = serializers.CharField(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ShipmentItem
        fields = [
            'id', 'product_id', 'product_name', 'ordered_quantity',
            'shipped_quantity', 'unit_price', 'line_total'
        ]


class ShipmentSerializer(serializers.ModelSerializer):
    """Serializer for Shipment model."""
    items = ShipmentItemSerializer(many=True, read_only=True)
    packed_by_name = serializers.CharField(source='packed_by.full_name', read_only=True)
    shipped_by_name = serializers.CharField(source='shipped_by.full_name', read_only=True)
    total_items = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            'id', 'shipment_no', 'order_no', 'customer_name', 'customer_address',
            'warehouse_id', 'location_id', 'packed_by', 'packed_by_name',
            'packed_at', 'shipped_by', 'shipped_by_name', 'shipped_at',
            'delivered_at', 'carrier', 'tracking_number', 'status',
            'notes', 'items', 'total_items', 'total_quantity', 'total_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['shipment_no', 'packed_at', 'shipped_at', 'delivered_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return obj.items.aggregate(total=Sum('shipped_quantity'))['total'] or 0

    def get_total_value(self, obj):
        return obj.items.aggregate(total=Sum('line_total'))['total'] or 0


class ReturnItemSerializer(serializers.ModelSerializer):
    """Serializer for ReturnItem model."""
    product_name = serializers.CharField(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ReturnItem
        fields = [
            'id', 'product_id', 'product_name', 'returned_quantity',
            'condition', 'unit_price', 'line_total'
        ]


class ReturnSerializer(serializers.ModelSerializer):
    """Serializer for Return model."""
    items = ReturnItemSerializer(many=True, read_only=True)
    received_by_name = serializers.CharField(source='received_by.full_name', read_only=True)
    inspected_by_name = serializers.CharField(source='inspected_by.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    total_items = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Return
        fields = [
            'id', 'return_no', 'original_order_no', 'customer_name', 'customer_address',
            'return_reason', 'received_by', 'received_by_name', 'received_at',
            'inspected_by', 'inspected_by_name', 'inspected_at',
            'approved_by', 'approved_by_name', 'approved_at',
            'processed_by', 'processed_by_name', 'processed_at',
            'status', 'refund_amount', 'notes', 'rejection_reason',
            'items', 'total_items', 'total_quantity', 'total_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['return_no', 'received_at', 'inspected_at', 'approved_at', 'processed_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return obj.items.aggregate(total=Sum('returned_quantity'))['total'] or 0

    def get_total_value(self, obj):
        return obj.items.aggregate(total=Sum('line_total'))['total'] or 0


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model."""
    product_name = serializers.CharField(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_id', 'product_name', 'quantity', 'unit_price',
            'discount_percent', 'line_total'
        ]


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model."""
    items = OrderItemSerializer(many=True, read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)
    total_items = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_no', 'customer_name', 'customer_email', 'customer_phone',
            'customer_address', 'order_type', 'status', 'subtotal', 'tax_amount',
            'shipping_amount', 'discount_amount', 'total_amount', 'processed_by',
            'processed_by_name', 'processed_at', 'shipped_at', 'delivered_at',
            'customer_notes', 'internal_notes', 'items', 'total_items',
            'total_quantity', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_no', 'processed_at', 'shipped_at', 'delivered_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_quantity(self, obj):
        return obj.items.aggregate(total=Sum('quantity'))['total'] or 0
