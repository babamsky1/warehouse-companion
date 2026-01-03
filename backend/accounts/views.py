from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django_rest_passwordreset.views import ResetPasswordRequestToken, ResetPasswordConfirm
from .models import User
from . import serializers


class UserListCreateView(generics.ListCreateAPIView):
    """List and create users."""
    queryset = User.objects.select_related('assigned_warehouse').all()
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by assigned warehouse if user is not admin
        if not self.request.user.is_admin:
            queryset = queryset.filter(assigned_warehouse=self.request.user.assigned_warehouse)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete users."""
    queryset = User.objects.select_related('assigned_warehouse').all()
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Users can only see their own profile unless they're admin/manager
        if not self.request.user.is_warehouse_manager:
            queryset = queryset.filter(id=self.request.user.id)
        return queryset


class CurrentUserView(generics.RetrieveAPIView):
    """Get current user information."""
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetView(ResetPasswordRequestToken):
    """Password reset request view."""
    pass


class PasswordResetConfirmView(ResetPasswordConfirm):
    """Password reset confirmation view."""
    pass


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Custom login view that returns JWT tokens."""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'error': 'Account is disabled'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    # Update last login
    user.last_login = request._get_raw_host()
    user.save(update_fields=['last_login'])

    serializer = serializers.UserSerializer(user)
    return Response({
        'user': serializer.data,
        'tokens': {
            'access': access_token,
            'refresh': str(refresh),
        }
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout view - client should discard tokens."""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass  # Token might already be invalid

    return Response({'message': 'Successfully logged out'})