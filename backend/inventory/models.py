from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from master.models import AuditFields, Product, Warehouse, Location


class Stock(AuditFields):
    """Current stock levels for products in locations."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='stock_entries'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='stock_entries'
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='stock_entries'
    )

    # Stock quantities
    quantity_available = models.PositiveIntegerField(default=0)
    quantity_reserved = models.PositiveIntegerField(default=0)
    quantity_allocated = models.PositiveIntegerField(default=0)

    # Lot tracking (optional)
    lot_number = models.CharField(max_length=100, blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    manufacturing_date = models.DateField(blank=True, null=True)

    # Cost tracking
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        blank=True,
        null=True
    )
    total_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = _('Stock')
        verbose_name_plural = _('Stocks')
        ordering = ['product', 'warehouse', 'location']
        unique_together = ['product', 'warehouse', 'location', 'lot_number']

    def __str__(self):
        return f"{self.product.sku} - {self.location.code} ({self.quantity_available})"

    @property
    def quantity_total(self):
        """Total quantity including reserved and allocated."""
        return self.quantity_available + self.quantity_reserved + self.quantity_allocated

    @property
    def quantity_available_for_sale(self):
        """Quantity available for immediate sale."""
        return self.quantity_available - self.quantity_reserved

    def save(self, *args, **kwargs):
        # Calculate total value
        if self.unit_cost and self.quantity_total:
            self.total_value = self.unit_cost * self.quantity_total
        super().save(*args, **kwargs)


class StockBuffer(AuditFields):
    """Safety stock levels for products."""

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name='stock_buffer'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='stock_buffers'
    )

    # Buffer levels
    minimum_quantity = models.PositiveIntegerField(default=0)
    maximum_quantity = models.PositiveIntegerField(blank=True, null=True)
    reorder_point = models.PositiveIntegerField(default=0)

    # Lead time in days
    lead_time_days = models.PositiveIntegerField(default=1)

    # Safety factor (percentage)
    safety_factor = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.20'),
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="Safety stock factor (0.20 = 20%)"
    )

    class Meta:
        verbose_name = _('Stock Buffer')
        verbose_name_plural = _('Stock Buffers')
        unique_together = ['product', 'warehouse']

    def __str__(self):
        return f"{self.product.sku} - {self.warehouse.code}"

    @property
    def safety_stock_quantity(self):
        """Calculate safety stock based on lead time and safety factor."""
        # This would be calculated based on historical demand
        return int(self.reorder_point * float(self.safety_factor))


class Adjustment(AuditFields):
    """Stock adjustments for inventory corrections."""

    ADJUSTMENT_TYPE_CHOICES = [
        ('increase', 'Stock Increase'),
        ('decrease', 'Stock Decrease'),
    ]

    CATEGORY_CHOICES = [
        ('physical_count', 'Physical Count'),
        ('damage', 'Damage'),
        ('theft', 'Theft'),
        ('correction', 'Data Correction'),
        ('expiry', 'Expiry'),
    ]

    # Basic information
    adjustment_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated adjustment number (ADJ-2025-001)"
    )

    # Location
    product_id = models.PositiveIntegerField()  # FK reference without constraint
    warehouse_id = models.PositiveIntegerField()
    location_id = models.PositiveIntegerField()

    # Adjustment details
    previous_qty = models.IntegerField(help_text="Quantity before adjustment")
    adjusted_qty = models.IntegerField(help_text="Quantity after adjustment")
    adjustment_type = models.CharField(
        max_length=10,
        choices=ADJUSTMENT_TYPE_CHOICES
    )

    # Reason classification
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    reason = models.TextField(help_text="Detailed explanation")

    # Approval workflow
    adjusted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='adjustments_made'
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='adjustments_approved'
    )
    approved_at = models.DateTimeField(blank=True, null=True)

    # Financial impact
    cost_impact = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Monetary value of adjustment"
    )

    class Meta:
        verbose_name = _('Adjustment')
        verbose_name_plural = _('Adjustments')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.adjustment_no} - {self.adjustment_type}"

    def save(self, *args, **kwargs):
        # Auto-generate adjustment number
        if not self.adjustment_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_adjustment = Adjustment.objects.filter(
                adjustment_no__startswith=f'ADJ-{year}-'
            ).order_by('-adjustment_no').first()

            if last_adjustment:
                last_num = int(last_adjustment.adjustment_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.adjustment_no = f'ADJ-{year}-{next_num:03d}'

        super().save(*args, **kwargs)


class Transfer(AuditFields):
    """Stock transfers between locations."""

    TRANSFER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Transfer information
    transfer_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated transfer number (TRF-2025-001)"
    )

    # Source
    from_warehouse_id = models.PositiveIntegerField()
    from_location_id = models.PositiveIntegerField()

    # Destination
    to_warehouse_id = models.PositiveIntegerField()
    to_location_id = models.PositiveIntegerField()

    # Product and quantity
    product_id = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    # Transfer details
    requested_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='transfers_requested'
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='transfers_approved'
    )
    transferred_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='transfers_executed'
    )

    # Status and dates
    status = models.CharField(
        max_length=15,
        choices=TRANSFER_STATUS_CHOICES,
        default='pending'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    transferred_at = models.DateTimeField(blank=True, null=True)

    # Notes
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Transfer')
        verbose_name_plural = _('Transfers')
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.transfer_no} - {self.product_id}"

    def save(self, *args, **kwargs):
        # Auto-generate transfer number
        if not self.transfer_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_transfer = Transfer.objects.filter(
                transfer_no__startswith=f'TRF-{year}-'
            ).order_by('-transfer_no').first()

            if last_transfer:
                last_num = int(last_transfer.transfer_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.transfer_no = f'TRF-{year}-{next_num:03d}'

        super().save(*args, **kwargs)
