from rest_framework import serializers
from .models import StockMovement


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer for StockMovement model."""

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product_id', 'warehouse_id', 'location_id',
            'movement_type', 'quantity', 'unit_cost', 'reference_type',
            'reference_id', 'movement_date', 'performed_by', 'notes'
        ]
