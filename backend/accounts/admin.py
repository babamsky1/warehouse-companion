from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model."""

    # Fields to display in the list view
    list_display = [
        'full_name',
        'email',
        'employee_id',
        'role',
        'status',
        'assigned_warehouse',
        'last_login',
        'is_active'
    ]

    # Fields to filter by in the right sidebar
    list_filter = [
        'role',
        'status',
        'is_active',
        'is_staff',
        'assigned_warehouse',
        'date_joined',
        'last_login'
    ]

    # Fields to search by
    search_fields = [
        'full_name',
        'email',
        'employee_id'
    ]

    # Ordering of the list view
    ordering = ['full_name']

    # Fieldsets for the detail view
    fieldsets = (
        (_('Personal Information'), {
            'fields': ('employee_id', 'full_name', 'email', 'phone')
        }),
        (_('Access Control'), {
            'fields': ('role', 'assigned_warehouse', 'status')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        }),
        (_('Audit Information'), {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Fieldsets for the add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'role', 'status'),
        }),
    )

    # Read-only fields
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']

    # Actions
    actions = ['activate_users', 'deactivate_users', 'suspend_users']

    def activate_users(self, request, queryset):
        queryset.update(status='active')
        self.message_user(request, _('Selected users have been activated.'))
    activate_users.short_description = _('Activate selected users')

    def deactivate_users(self, request, queryset):
        queryset.update(status='inactive')
        self.message_user(request, _('Selected users have been deactivated.'))
    deactivate_users.short_description = _('Deactivate selected users')

    def suspend_users(self, request, queryset):
        queryset.update(status='suspended')
        self.message_user(request, _('Selected users have been suspended.'))
    suspend_users.short_description = _('Suspend selected users')

    # Override get_queryset to show only active users by default
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_active=True)
