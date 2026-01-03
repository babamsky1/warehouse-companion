from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

urlpatterns = [
    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # User management
    path('users/', include([
        path('', views.UserListCreateView.as_view(), name='user-list'),
        path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
        path('me/', views.CurrentUserView.as_view(), name='current-user'),
    ])),

    # Password reset
    path('password-reset/', include([
        path('', views.PasswordResetView.as_view(), name='password-reset'),
        path('confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    ])),
]