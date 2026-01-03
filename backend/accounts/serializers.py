from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    assigned_warehouse_name = serializers.CharField(
        source='assigned_warehouse.name',
        read_only=True
    )
    full_name = serializers.CharField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_warehouse_manager = serializers.BooleanField(read_only=True)
    can_manage_inventory = serializers.BooleanField(read_only=True)
    can_view_reports = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'employee_id', 'full_name', 'email', 'phone',
            'role', 'assigned_warehouse', 'assigned_warehouse_name',
            'status', 'last_login', 'is_active', 'date_joined',
            'is_admin', 'is_warehouse_manager', 'can_manage_inventory', 'can_view_reports',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'last_login', 'date_joined', 'is_admin', 'is_warehouse_manager',
            'can_manage_inventory', 'can_view_reports', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login request."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )
            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                'Must include email and password.'
            )

        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField()
    password = serializers.CharField(min_length=8)
    password_confirm = serializers.CharField(min_length=8)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs