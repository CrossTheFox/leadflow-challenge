from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Lead, WebhookLog, LeadActivity
from django.contrib.auth.models import User

class WebhookExhaustiveTests(APITestCase):
    def setUp(self):
        self.url = reverse('receive_webhook')

    # --- ESCENARIOS EXITOSOS & IDENTITY RESOLUTION ---
    def test_create_new_lead_success(self):
        """Prueba que un lead nuevo se cree correctamente"""
        payload = {
            "event_type": "lead_created",
            "lead_data": {
                "email": "test@example.com",
                "name": "Test User",
                "source": "Web"
            }
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(WebhookLog.objects.get().status_code, 200)

    def test_update_existing_lead(self):
        """Prueba Identity Resolution: mismo email actualiza datos, no duplica"""
        Lead.objects.create(email="update@test.com", name="Viejo", source="Web")
        payload = {
            "event_type": "update",
            "lead_data": {"email": "update@test.com", "name": "Nuevo"}
        }
        self.client.post(self.url, payload, format='json')
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(Lead.objects.get(email="update@test.com").name, "Nuevo")

    # --- ESCENARIOS DE TIMESTAMP PARSING (ROBUSTEZ) ---
    def test_timestamp_parsing_iso(self):
        """Prueba parsing de fecha ISO 8601"""
        payload = {
            "event_type": "test",
            "timestamp": "2026-04-07T10:00:00Z",
            "lead_data": {"email": "iso@test.com"}
        }
        self.client.post(self.url, payload, format='json')
        log = WebhookLog.objects.get(event_type="test")
        self.assertEqual(log.external_timestamp.year, 2026)

    def test_timestamp_parsing_unix(self):
        """Prueba parsing de Unix Timestamp (segundos)"""
        payload = {
            "event_type": "unix",
            "timestamp": 1712491200, # Apr 7 2024
            "lead_data": {"email": "unix@test.com"}
        }
        self.client.post(self.url, payload, format='json')
        log = WebhookLog.objects.get(event_type="unix")
        self.assertEqual(log.external_timestamp.month, 4)

    def test_timestamp_invalid(self):
        """Prueba que un timestamp basura no rompa el sistema"""
        payload = {
            "event_type": "bad_ts",
            "timestamp": "esto-no-es-fecha",
            "lead_data": {"email": "bad@test.com"}
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        log = WebhookLog.objects.get(event_type="bad_ts")
        self.assertIsNone(log.external_timestamp)

    # --- ESCENARIOS DE ERROR (WEBHOOKS MALOS) ---

    def test_missing_email(self):
        """Prueba que sin email se registre error 400 en el log"""
        payload = {
            "event_type": "bad_data",
            "lead_data": {"name": "No Email User"}
        }
        self.client.post(self.url, payload, format='json')
        
        log = WebhookLog.objects.get(event_type="bad_data")

        self.assertEqual(log.status_code, 400)
        self.assertEqual(log.error_message, "Missing email in lead_data")

    def test_crash_resilience(self):
        """Prueba que el sistema capture excepciones graves (500) y las guarde"""
        payload = {
            "event_type": "crash_test",
            "lead_data": None 
        }
        self.client.post(self.url, payload, format='json')
        
        log = WebhookLog.objects.get(status_code=500)
        self.assertEqual(log.event_type, 'error_processing')
        self.assertIsNotNone(log.error_message)

    # --- ESCENARIOS DE LÓGICA DE NEGOCIO (ACTIVIDADES) ---
    def test_activity_on_status_change(self):
        """Prueba que al cambiar el estado de un Lead se cree una Actividad"""
        lead = Lead.objects.create(email="act@test.com", status="NEW")
        detail_url = reverse('lead-detail', kwargs={'pk': lead.pk})
        
        self.client.patch(detail_url, {"status": "WON"}, format='json')
        self.assertTrue(LeadActivity.objects.filter(lead=lead, description__icontains="WON").exists())

    def test_activity_on_assignment_change(self):
        """Prueba que al asignar un vendedor se cree una Actividad"""
        user = User.objects.create_user(username="vendedor1")
        lead = Lead.objects.create(email="assign@test.com")
        detail_url = reverse('lead-detail', kwargs={'pk': lead.pk})
        
        self.client.patch(detail_url, {"assigned_to": user.id}, format='json')
        self.assertTrue(LeadActivity.objects.filter(lead=lead, description__icontains="vendedor1").exists())

    def test_dashboard_stats_completeness(self):
        """Prueba que el dashboard devuelva todos los campos requeridos"""
        url = reverse('dashboard-stats')
        response = self.client.get(url)
        self.assertIn("pipeline", response.data)
        self.assertIn("recent_activities", response.data)
        self.assertIn("webhooks", response.data)