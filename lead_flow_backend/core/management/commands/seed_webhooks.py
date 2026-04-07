# core/management/commands/seed_webhooks.py
import json
import subprocess
from django.core.management.base import BaseCommand
from core.models import Lead

class Command(BaseCommand):
    help = 'Simula webhooks reales con diferentes tipos de timestamps y errores'

    def add_arguments(self, parser):
        parser.add_argument(
            '--url',
            type=str,
            default='http://127.0.0.1:8000/api/webhooks/',
            help='URL del endpoint de webhooks'
        )

    def handle(self, *args, **options):
        url = options['url']
        
        self.stdout.write(self.style.WARNING(f"⚠️ Asegúrate de tener el 'runserver' corriendo en otra terminal."))

        payloads = [
            # 1. ÉXITO: Formato ISO 8601 (Standard)
            {
                "event_type": "facebook_ads_lead",
                "timestamp": "2026-04-07T10:00:00Z",
                "lead_data": {
                    "email": "lead.facebook@test.com",
                    "name": "User Facebook ISO",
                    "phone": "+56911112222",
                    "source": "Facebook"
                }
            },
            # 2. ÉXITO: Unix Timestamp en SEGUNDOS
            {
                "event_type": "mailchimp_signup",
                "timestamp": 1712491200, 
                "lead_data": {
                    "email": "lead.mailchimp@test.com",
                    "name": "User Mailchimp UnixSec",
                    "source": "Mailchimp"
                }
            },
            # 3. ÉXITO: Unix Timestamp en MILISEGUNDOS (Común en JS)
            {
                "event_type": "calendly_meeting",
                "timestamp": 1712491200000,
                "lead_data": {
                    "email": "lead.calendly@test.com",
                    "name": "User Calendly UnixMs",
                    "source": "Calendly"
                }
            },
            # 4. ÉXITO: Identity Resolution (Actualiza el Lead del caso 1)
            {
                "event_type": "facebook_retargeting",
                "lead_data": {
                    "email": "lead.facebook@test.com",
                    "name": "User Facebook (ACTUALIZADO)",
                    "source": "Facebook"
                }
            },
            # 5. ERROR 400: Falta el email
            {
                "event_type": "error_payload",
                "lead_data": {
                    "name": "Lead Fallido",
                    "source": "Unknown"
                }
            },
            # 6. ERROR 500: Estructura corrupta (lead_data no es dict)
            {
                "event_type": "crash_test",
                "lead_data": "esto_causara_un_error_de_atributo"
            }
        ]

        for idx, payload in enumerate(payloads, 1):
            json_data = json.dumps(payload)
            
            curl_args = [
                'curl', '-X', 'POST', url,
                '-H', 'Content-Type: application/json',
                '-d', json_data,
                '-s', '-o', 'nul' if subprocess.os.name == 'nt' else '/dev/null', # Silencia salida según OS
                '-w', '%{http_code}'
            ]

            self.stdout.write(f"--- Enviando Webhook #{idx}: {payload['event_type']} ---")

            try:
                result = subprocess.run(curl_args, capture_output=True, text=True)
                http_status = result.stdout.strip()
                
                # Tu vista siempre retorna 200 para cumplir con la robustez de webhooks
                if http_status == '200':
                    self.stdout.write(self.style.SUCCESS(f"✅ Recibido OK (HTTP 200)"))
                else:
                    self.stdout.write(self.style.ERROR(f"❌ Fallo de red/URL (HTTP {http_status})"))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error al ejecutar cURL: {str(e)}"))

        self.stdout.write(self.style.SUCCESS('\n🚀 Simulación completada. Revisa los logs en el dashboard para ver los estados 200, 400 y 500.'))