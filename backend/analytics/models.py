from django.db import models
from django.utils.translation import gettext_lazy as _


class StockMovement(models.Model):
    """Stock movement tracking for analytics."""

    MOVEMENT_TYPE_CHOICES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
        ('transfer', 'Transfer'),
    ]

    product_id = models.PositiveIntegerField()
    warehouse_id = models.PositiveIntegerField()
    location_id = models.PositiveIntegerField()

    movement_type = models.CharField(max_length=15, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField()  # Positive for in, negative for out
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Reference to source document
    reference_type = models.CharField(max_length=20)  # 'adjustment', 'transfer', 'receiving', 'shipment'
    reference_id = models.PositiveIntegerField()

    # Metadata
    movement_date = models.DateTimeField(auto_now_add=True)
    performed_by = models.PositiveIntegerField()  # User ID reference

    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Stock Movement')
        verbose_name_plural = _('Stock Movements')
        ordering = ['-movement_date']
        indexes = [
            models.Index(fields=['product_id', 'movement_date']),
            models.Index(fields=['warehouse_id', 'movement_date']),
            models.Index(fields=['movement_type', 'movement_date']),
        ]

    def __str__(self):
        return f"{self.product_id} - {self.movement_type} ({self.quantity})"
