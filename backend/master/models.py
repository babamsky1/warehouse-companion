from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class AuditFields(models.Model):
    """Abstract base class for audit fields."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )
    updated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='+'
    )

    class Meta:
        abstract = True


class Category(AuditFields):
    """Product categories with hierarchical structure."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='subcategories'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def full_path(self):
        """Get full category path including parent categories."""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class Product(AuditFields):
    """Product master data."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discontinued', 'Discontinued'),
    ]

    # Basic information
    sku = models.CharField(max_length=50, unique=True, help_text="Stock Keeping Unit")
    barcode = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products'
    )
    brand = models.CharField(max_length=100, blank=True, null=True)
    group = models.CharField(max_length=100, blank=True, null=True)

    # Pricing
    unit = models.CharField(max_length=20, default='pcs')  # pcs, kg, box, etc.
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    # Inventory control
    minimum_stock = models.PositiveIntegerField(default=0)
    maximum_stock = models.PositiveIntegerField(blank=True, null=True)
    reorder_point = models.PositiveIntegerField(default=0)

    # Supplier relationship
    primary_supplier = models.ForeignKey(
        'Supplier',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='primary_products'
    )

    # Physical attributes
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Weight in kg"
    )
    dimensions = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="LxWxH format (e.g., 10x20x30)"
    )

    # Product lifecycle
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    image_url = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        ordering = ['sku']

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def profit_margin(self):
        """Calculate profit margin percentage."""
        if self.cost_price and self.selling_price:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0

    @property
    def is_low_stock(self):
        """Check if product is below reorder point."""
        # This would need to be calculated based on actual stock levels
        return False  # Placeholder


class Warehouse(AuditFields):
    """Physical warehouse locations."""

    TYPE_CHOICES = [
        ('main', 'Main Warehouse'),
        ('regional', 'Regional Warehouse'),
        ('outlet', 'Outlet'),
        ('transit', 'Transit Point'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    code = models.CharField(max_length=20, unique=True, help_text="Warehouse code (e.g., WH-001)")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='main')
    address = models.TextField()
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    capacity = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Storage capacity in square meters"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    class Meta:
        verbose_name = _('Warehouse')
        verbose_name_plural = _('Warehouses')
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def total_locations(self):
        """Get total number of locations in this warehouse."""
        return self.locations.count()

    @property
    def active_locations(self):
        """Get number of active locations."""
        return self.locations.filter(status='active').count()


class Location(AuditFields):
    """Specific storage locations within warehouses."""

    ZONE_CHOICES = [
        ('receiving', 'Receiving Area'),
        ('storage', 'Storage Area'),
        ('picking', 'Picking Area'),
        ('shipping', 'Shipping Area'),
        ('quarantine', 'Quarantine Area'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
    ]

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='locations'
    )

    # Location identification
    zone = models.CharField(max_length=20, choices=ZONE_CHOICES, default='storage')
    aisle = models.CharField(max_length=10, blank=True, null=True)
    rack = models.CharField(max_length=20)
    bin = models.CharField(max_length=20)
    level = models.PositiveIntegerField(blank=True, null=True)

    # Tracking
    code = models.CharField(max_length=50, unique=True, help_text="Full location code (e.g., A-01-01)")
    barcode = models.CharField(max_length=100, blank=True, null=True)

    # Capacity management
    capacity = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Maximum capacity"
    )
    current_utilization = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Current usage percentage"
    )

    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    class Meta:
        verbose_name = _('Location')
        verbose_name_plural = _('Locations')
        ordering = ['warehouse', 'zone', 'aisle', 'rack', 'bin']
        unique_together = ['warehouse', 'aisle', 'rack', 'bin', 'level']

    def __str__(self):
        return f"{self.warehouse.code}-{self.code}"

    def save(self, *args, **kwargs):
        """Auto-generate location code if not provided."""
        if not self.code:
            parts = []
            if self.aisle:
                parts.append(self.aisle)
            parts.append(self.rack)
            parts.append(self.bin)
            if self.level:
                parts.append(str(self.level))
            self.code = '-'.join(parts)

        super().save(*args, **kwargs)


class Supplier(AuditFields):
    """Vendor master data."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blocked', 'Blocked'),
    ]

    code = models.CharField(max_length=20, unique=True, help_text="Supplier code")
    name = models.CharField(max_length=255)

    # Contact information
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    # Business details
    tax_id = models.CharField(max_length=50, blank=True, null=True)
    payment_terms = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="e.g., Net 30, COD"
    )
    lead_time_days = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Typical delivery time in days"
    )
    minimum_order_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Minimum order requirement"
    )

    # Performance tracking
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        blank=True,
        null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5 star rating"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    class Meta:
        verbose_name = _('Supplier')
        verbose_name_plural = _('Suppliers')
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"
