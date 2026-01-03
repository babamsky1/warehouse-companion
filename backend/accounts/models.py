from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for User model with email as username."""

    def _create_user(self, email, password, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create a regular user."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('status', 'active')
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model for Warehouse Management System."""

    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('warehouse_manager', 'Warehouse Manager'),
        ('operator', 'Operator'),
        ('viewer', 'Viewer'),
        ('accountant', 'Accountant'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]

    # Basic information
    employee_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
        help_text="Employee ID from HR system"
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        help_text="User's email address (used as username)"
    )
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Access control
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='viewer'
    )
    assigned_warehouse = models.ForeignKey(
        'master.Warehouse',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='assigned_users'
    )

    # Account status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    last_login = models.DateTimeField(blank=True, null=True)

    # Django auth fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='created_users'
    )
    updated_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='updated_users'
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_warehouse_manager(self):
        return self.role in ['admin', 'warehouse_manager']

    @property
    def can_manage_inventory(self):
        return self.role in ['admin', 'warehouse_manager', 'operator']

    @property
    def can_view_reports(self):
        return self.role in ['admin', 'warehouse_manager', 'accountant', 'viewer']

    def save(self, *args, **kwargs):
        # Update last_login on login (this would be handled by auth backend)
        super().save(*args, **kwargs)
