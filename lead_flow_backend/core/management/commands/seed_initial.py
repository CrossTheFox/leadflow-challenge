# core/management/commands/seed_initial.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Lead, LeadActivity
from django.utils import timezone

class Command(BaseCommand):
    help = 'Crea vendedores y clientes iniciales manuales'

    def handle(self, *args, **kwargs):
        self.stdout.write("Limpiando datos de prueba anteriores...")
        User.objects.filter(username__startswith='vendedor').delete()
        Lead.objects.filter(source='Manual').delete()

        # 1. Crear 3 Vendedores
        vendedores = []
        for i in range(1, 4):
            user, created = User.objects.get_or_create(
                username=f'vendedor{i}',
                defaults={
                    'first_name': f'Vendedor',
                    'last_name': str(i),
                    'email': f'vendedor{i}@empresa.com'
                }
            )
            vendedores.append(user)
        self.stdout.write(self.style.SUCCESS('✅ 3 Vendedores creados.'))

        # 2. Crear 10 Clientes Normales (Manuales)
        for i in range(1, 11):
            lead = Lead.objects.create(
                email=f'cliente.manual.{i}@test.com',
                name=f'Cliente Manual {i}',
                phone=f'+5690000000{i}',
                source='Manual',
                status='NEW',
                assigned_to=vendedores[i % 3]
            )
            LeadActivity.objects.create(
                lead=lead,
                description="Lead ingresado manualmente por el equipo comercial."
            )
        
        self.stdout.write(self.style.SUCCESS(f'✅ 10 Clientes manuales creados.'))
        self.stdout.write(self.style.SUCCESS('🚀 Seed inicial completado!'))