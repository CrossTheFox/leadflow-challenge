from django.urls import path
from . import views

urlpatterns = [
    path('webhooks/', views.receive_webhook, name='receive_webhook'),
    path('leads/', views.LeadListCreateView.as_view(), name='lead-list-create'),
    path('leads/<int:pk>/', views.LeadDetailView.as_view(), name='lead-detail'),
    path('users/', views.get_users, name='user-list'),
    path('dashboard/', views.get_dashboard_stats, name='dashboard-stats'),
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard-stats'),
]