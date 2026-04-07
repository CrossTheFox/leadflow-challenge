from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Lead, LeadActivity, WebhookLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class WebhookLogSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = WebhookLog
        fields = '__all__'

    def get_created_at(self, obj):
        # Si el proveedor nos mandó una fecha real, mandamos esa.
        # Si no, mandamos la fecha en que se guardó en nuestra DB.
        return obj.external_timestamp if obj.external_timestamp else obj.created_at

class LeadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'name', 'email', 'status', 'source', 'assigned_to', 'updated_at', 'phone']

    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.assigned_to:
            response['assigned_to'] = UserSerializer(instance.assigned_to).data
        return response

class LeadActivitySerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    
    class Meta:
        model = LeadActivity
        fields = '__all__'

class LeadDetailSerializer(serializers.ModelSerializer):
    logs = WebhookLogSerializer(many=True, read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'

    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.assigned_to:
            response['assigned_to'] = UserSerializer(instance.assigned_to).data
        return response