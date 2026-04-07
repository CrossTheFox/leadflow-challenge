from django.db import models
from django.contrib.auth.models import User

class Lead(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('QUALIFIED', 'Qualified'),
        ('IN_PROGRESS', 'In Progress'),
        ('LOST', 'Lost'),
        ('WON', 'Won'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    source = models.CharField(max_length=100)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.email})"
    
class LeadActivity(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    description = models.CharField(max_length=255) # Ej: "Estado cambiado a WON"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Activity for {self.lead.email}: {self.description}"

class WebhookLog(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    status_code = models.IntegerField()
    error_message = models.TextField(blank=True, null=True)
    external_timestamp = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log {self.event_type} - Status {self.status_code}"