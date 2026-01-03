from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from master.models import AuditFields


class Receiving(AuditFields):
    """Goods receiving records."""

    RECEIVING_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('received', 'Received'),
        ('inspected', 'Inspected'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Receiving information
    receiving_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated receiving number (RCV-2025-001)"
    )

    # Supplier and order reference
    supplier_id = models.PositiveIntegerField()
    purchase_order_no = models.CharField(max_length=50, blank=True, null=True)

    # Warehouse and location
    warehouse_id = models.PositiveIntegerField()
    location_id = models.PositiveIntegerField()

    # Receiving details
    received_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='receivings'
    )
    received_at = models.DateTimeField(auto_now_add=True)

    # Status and approval
    status = models.CharField(
        max_length=15,
        choices=RECEIVING_STATUS_CHOICES,
        default='draft'
    )
    inspected_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='inspections'
    )
    inspected_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='receiving_approvals'
    )
    approved_at = models.DateTimeField(blank=True, null=True)

    # Notes and comments
    notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Receiving')
        verbose_name_plural = _('Receivings')
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.receiving_no} - {self.supplier_id}"

    def save(self, *args, **kwargs):
        # Auto-generate receiving number
        if not self.receiving_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_receiving = Receiving.objects.filter(
                receiving_no__startswith=f'RCV-{year}-'
            ).order_by('-receiving_no').first()

            if last_receiving:
                last_num = int(last_receiving.receiving_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.receiving_no = f'RCV-{year}-{next_num:03d}'

        super().save(*args, **kwargs)


class ReceivingItem(models.Model):
    """Individual items in a receiving record."""

    receiving = models.ForeignKey(
        Receiving,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_id = models.PositiveIntegerField()
    expected_quantity = models.PositiveIntegerField()
    received_quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    # Quality control
    condition = models.CharField(
        max_length=20,
        choices=[
            ('good', 'Good'),
            ('damaged', 'Damaged'),
            ('expired', 'Expired'),
            ('wrong_item', 'Wrong Item'),
        ],
        default='good'
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Receiving Item')
        verbose_name_plural = _('Receiving Items')
        unique_together = ['receiving', 'product_id']

    def __str__(self):
        return f"{self.receiving.receiving_no} - {self.product_id}"

    @property
    def quantity_difference(self):
        return self.received_quantity - self.expected_quantity

    @property
    def line_total(self):
        return self.received_quantity * self.unit_cost


class Shipment(AuditFields):
    """Goods shipment records."""

    SHIPMENT_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    # Shipment information
    shipment_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated shipment number (SHP-2025-001)"
    )

    # Order reference
    order_no = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=255)
    customer_address = models.TextField()

    # Warehouse and location
    warehouse_id = models.PositiveIntegerField()
    location_id = models.PositiveIntegerField()

    # Shipment details
    packed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='shipments_packed'
    )
    packed_at = models.DateTimeField(blank=True, null=True)

    shipped_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='shipments_shipped'
    )
    shipped_at = models.DateTimeField(blank=True, null=True)

    delivered_at = models.DateTimeField(blank=True, null=True)

    # Shipping information
    carrier = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=15,
        choices=SHIPMENT_STATUS_CHOICES,
        default='draft'
    )

    # Notes
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Shipment')
        verbose_name_plural = _('Shipments')
        ordering = ['-packed_at']

    def __str__(self):
        return f"{self.shipment_no} - {self.customer_name}"

    def save(self, *args, **kwargs):
        # Auto-generate shipment number
        if not self.shipment_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_shipment = Shipment.objects.filter(
                shipment_no__startswith=f'SHP-{year}-'
            ).order_by('-shipment_no').first()

            if last_shipment:
                last_num = int(last_shipment.shipment_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.shipment_no = f'SHP-{year}-{next_num:03d}'

        super().save(*args, **kwargs)


class ShipmentItem(models.Model):
    """Individual items in a shipment."""

    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_id = models.PositiveIntegerField()
    ordered_quantity = models.PositiveIntegerField()
    shipped_quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    class Meta:
        verbose_name = _('Shipment Item')
        verbose_name_plural = _('Shipment Items')
        unique_together = ['shipment', 'product_id']

    def __str__(self):
        return f"{self.shipment.shipment_no} - {self.product_id}"

    @property
    def line_total(self):
        return self.shipped_quantity * self.unit_price


class Return(AuditFields):
    """Customer returns processing."""

    RETURN_STATUS_CHOICES = [
        ('received', 'Received'),
        ('inspected', 'Inspected'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ]

    RETURN_REASON_CHOICES = [
        ('defective', 'Defective Product'),
        ('wrong_item', 'Wrong Item'),
        ('customer_dissatisfaction', 'Customer Dissatisfaction'),
        ('changed_mind', 'Changed Mind'),
        ('other', 'Other'),
    ]

    # Return information
    return_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated return number (RTN-2025-001)"
    )

    # Order reference
    original_order_no = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=255)
    customer_address = models.TextField()

    # Return details
    return_reason = models.CharField(max_length=30, choices=RETURN_REASON_CHOICES)
    received_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='returns_received'
    )
    received_at = models.DateTimeField(auto_now_add=True)

    # Processing
    inspected_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='returns_inspected'
    )
    inspected_at = models.DateTimeField(blank=True, null=True)

    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='returns_approved'
    )
    approved_at = models.DateTimeField(blank=True, null=True)

    processed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='returns_processed'
    )
    processed_at = models.DateTimeField(blank=True, null=True)

    # Status and outcome
    status = models.CharField(
        max_length=15,
        choices=RETURN_STATUS_CHOICES,
        default='received'
    )

    # Financial
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    # Notes
    notes = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Return')
        verbose_name_plural = _('Returns')
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.return_no} - {self.customer_name}"

    def save(self, *args, **kwargs):
        # Auto-generate return number
        if not self.return_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_return = Return.objects.filter(
                return_no__startswith=f'RTN-{year}-'
            ).order_by('-return_no').first()

            if last_return:
                last_num = int(last_return.return_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.return_no = f'RTN-{year}-{next_num:03d}'

        super().save(*args, **kwargs)


class ReturnItem(models.Model):
    """Individual items in a return."""

    return_record = models.ForeignKey(
        Return,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_id = models.PositiveIntegerField()
    returned_quantity = models.PositiveIntegerField()
    condition = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New/Unused'),
            ('used', 'Used'),
            ('damaged', 'Damaged'),
            ('defective', 'Defective'),
        ],
        default='used'
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    class Meta:
        verbose_name = _('Return Item')
        verbose_name_plural = _('Return Items')
        unique_together = ['return_record', 'product_id']

    def __str__(self):
        return f"{self.return_record.return_no} - {self.product_id}"

    @property
    def line_total(self):
        return self.returned_quantity * self.unit_price


class Order(AuditFields):
    """Customer orders."""

    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    ORDER_TYPE_CHOICES = [
        ('standard', 'Standard Order'),
        ('express', 'Express Order'),
        ('backorder', 'Backorder'),
    ]

    # Order information
    order_no = models.CharField(
        max_length=20,
        unique=True,
        help_text="Auto-generated order number (ORD-2025-001)"
    )

    # Customer information
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()

    # Order details
    order_type = models.CharField(
        max_length=15,
        choices=ORDER_TYPE_CHOICES,
        default='standard'
    )
    status = models.CharField(
        max_length=15,
        choices=ORDER_STATUS_CHOICES,
        default='pending'
    )

    # Financial
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Processing
    processed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='orders_processed'
    )
    processed_at = models.DateTimeField(blank=True, null=True)

    # Shipping
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    internal_notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_no} - {self.customer_name}"

    def save(self, *args, **kwargs):
        # Auto-generate order number
        if not self.order_no:
            from django.utils import timezone
            year = timezone.now().year
            # Get the next sequence number
            last_order = Order.objects.filter(
                order_no__startswith=f'ORD-{year}-'
            ).order_by('-order_no').first()

            if last_order:
                last_num = int(last_order.order_no.split('-')[-1])
                next_num = last_num + 1
            else:
                next_num = 1

            self.order_no = f'ORD-{year}-{next_num:03d}'

        # Calculate total
        self.total_amount = self.subtotal + self.tax_amount + self.shipping_amount - self.discount_amount

        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual items in an order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_id = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')
        unique_together = ['order', 'product_id']

    def __str__(self):
        return f"{self.order.order_no} - {self.product_id}"

    @property
    def line_total(self):
        discount_amount = (self.quantity * self.unit_price) * (self.discount_percent / 100)
        return (self.quantity * self.unit_price) - discount_amount
