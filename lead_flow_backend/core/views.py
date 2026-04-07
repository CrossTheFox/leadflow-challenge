from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from rest_framework import status

from .utils.date_parser import parse_external_timestamp
from .models import Lead, WebhookLog, LeadActivity
from .serializers import LeadActivitySerializer, LeadListSerializer, LeadDetailSerializer, UserSerializer, WebhookLogSerializer
from rest_framework import generics
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# --------------------------------------------------- VISTA PRINCIPAL PARA RECIBIR WEBHOOKS ---------------------------------------------------
@api_view(['POST'])
def receive_webhook(request):
    raw_data = request.data
    
    try:
        event_type = raw_data.get('event_type', 'unknown')
        lead_data = raw_data.get('lead_data', {})

        raw_ts = raw_data.get('timestamp') or lead_data.get('created_at')
        parsed_ts = parse_external_timestamp(raw_ts)

        email = lead_data.get('email')
        name = lead_data.get('name')
        phone = lead_data.get('phone')
        source = lead_data.get('source', 'unknown_webhook')

        if not email:
            WebhookLog.objects.create(
                event_type=event_type,
                payload=raw_data,
                status_code=400,
                error_message="Missing email in lead_data",
                external_timestamp=parsed_ts
            )
            return Response({"message": "Invalid payload: email is required"}, status=status.HTTP_200_OK)

        lead, _ = Lead.objects.update_or_create(
            email=email,
            defaults={
                'name': name if name else 'Sin Nombre',
                'phone': phone,
                'source': source,
            }
        )

        WebhookLog.objects.create(
            lead=lead,
            event_type=event_type,
            payload=raw_data,
            status_code=200,
            external_timestamp=parsed_ts
        )

        return Response({"message": "Processed successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        WebhookLog.objects.create(
            event_type='error_processing',
            payload=raw_data,
            status_code=500,
            error_message=str(e),
        )

        return Response({"message": "Internal error processed"}, status=status.HTTP_200_OK)
    
# ------------------------------------------------------- VISTAS PARA LEADS Y DASHBOARD ---------------------------------------------------
class LeadListCreateView(generics.ListCreateAPIView):
    queryset = Lead.objects.select_related('assigned_to').all()
    serializer_class = LeadListSerializer

class LeadDetailView(generics.RetrieveUpdateAPIView):
    queryset = Lead.objects.prefetch_related('logs', 'activities').all()
    serializer_class = LeadDetailSerializer

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        old_assigned_to = instance.assigned_to

        updated_lead = serializer.save()

        if old_status != updated_lead.status:
            LeadActivity.objects.create(
                lead=updated_lead,
                description=f"Estado cambiado: {old_status} ➔ {updated_lead.status}"
            )
        
        if old_assigned_to != updated_lead.assigned_to:
            assignee_name = updated_lead.assigned_to.username if updated_lead.assigned_to else "Sin asignar"
            LeadActivity.objects.create(
                lead=updated_lead,
                description=f"Asignación actualizada: {assignee_name}"
            )

# --- AUXILIARES Y DASHBOARD ---
@api_view(['GET'])
def get_users(request):
    users = User.objects.filter(is_active=True)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_dashboard_stats(request):
    three_days_ago = timezone.now() - timedelta(days=3)
    stuck_count = Lead.objects.filter(status='NEW', created_at__lt=three_days_ago).count()
    
    recent_webhooks = WebhookLog.objects.order_by('-created_at')[:15]
    
    recent_activities = LeadActivity.objects.select_related('lead').order_by('-created_at')[:15]
    
    stats = {
        "pipeline": Lead.objects.values('status').annotate(count=Count('status')),
        "sources": Lead.objects.values('source').annotate(count=Count('source')),
        "stuck_leads": stuck_count,
        "webhooks": {
            "total": WebhookLog.objects.count(),
            "success": WebhookLog.objects.filter(status_code=200).count(),
            "failed": WebhookLog.objects.exclude(status_code=200).count(),
        },
        "recent_webhooks": WebhookLogSerializer(recent_webhooks, many=True).data,
        
        "recent_activities": LeadActivitySerializer(recent_activities, many=True).data
    }
    return Response(stats)