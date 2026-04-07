from django.contrib import admin
from .models import Lead, WebhookLog, LeadActivity

admin.site.register(Lead)
admin.site.register(WebhookLog)
admin.site.register(LeadActivity)