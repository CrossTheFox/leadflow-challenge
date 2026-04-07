# 🚀 LeadFlow - Sistema de Gestión de Leads Unificado

LeadFlow es una solución de grado profesional diseñada para centralizar contactos (leads) provenientes de múltiples fuentes externas. El sistema resuelve la duplicidad de datos mediante una estrategia de Identity Resolution, ofrece trazabilidad completa mediante un Audit Trail y garantiza la integridad temporal de los datos.

---

## 🛠️ Stack Tecnológico

- **Backend:** Python 3.10+, Django 4.2+, Django REST Framework (DRF).
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript.
- **Base de Datos:** SQLite (Desarrollo local).
- **UI/UX:** Tailwind CSS + shadcn/ui + Lucide Icons.
- **Estado Global:** React Context API + Custom Hooks Pattern.

---

## 🧠 Decisiones Técnicas y Supuestos

### 1. Identity Resolution (Resolución de Identidad)
* **Email como Identificador Único:** Se determinó que el email es la clave primaria lógica para la unificación de contactos.

* **Actualización por Recencia:** Al recibir un lead existente, el sistema utiliza update_or_create para refrescar los campos (name, phone, source), asumiendo que el hit más reciente contiene la información más fidedigna.

* **Shadow Fallback de Timestamps:** Se implementó una lógica en el Serializer que prioriza el external_timestamp (fecha real del evento) sobre el created_at (fecha de inserción en DB), garantizando un Timeline históricamente exacto sin romper la compatibilidad con el frontend.

### 2. Robustez en Webhooks
* **Estrategia "Always 200 OK":** Para evitar bloqueos y reintentos infinitos de proveedores externos, el endpoint responde siempre con HTTP 200, delegando el manejo de errores a un sistema de logs interno.

* **Timestamp Normalization:** El sistema soporta nativamente 3 formatos de fecha: ISO 8601, Unix Timestamp (segundos) y Unix Timestamp (milisegundos), permitiendo la integración de casi cualquier proveedor del mercado (Stripe, Calendly, Meta, etc.).

### 3. Arquitectura Frontend (Clean Logic)
* **Separación de Responsabilidades:** Se extrajo la lógica de negocio de los componentes hacia Custom Hooks especializados:
    - **useLeadMetrics:** Encargado de todos los cálculos de conversión y agregación.
    - **useLeadDetail:** Gestiona el ciclo de vida de un lead individual, sincronizando actualizaciones locales con funciones globales del contexto (changeLeadStatus, changeLeadAssignment) para garantizar la consistencia en el Audit Trail tras cada edición.
    - **useDashboard:** Orquestador de datos para las vistas principales.

* **Context API:** Utilizado como "Single Source of Truth" para mantener sincronizados los leads y las actividades en tiempo real tras cada mutación.

### 4. Diseño de Producto y Escalabilidad
* **Pipeline Comercial Estandarizado:** Se implementó un embudo de ventas (New, Contacted, Qualified, In Progress, Lost, Won) optimizado para flujos de alta inversión, permitiendo una segmentación clara del ciclo de vida del cliente.
* **Dashboard Orientado a Resultados:** Las métricas fueron diseñadas para identificar cuellos de botella (distribución por estado) y monitorear la salud del sistema (tasa de éxito de webhooks) y la productividad del equipo en tiempo real.
* **Filtros de Gestión Avanzada:** La vista de Leads incluye filtrado multivariable (Estado y Responsable), sentando las bases técnicas para una futura arquitectura multi-inquilino (Multi-tenant) con permisos restringidos por usuario.
* **Arquitectura Extensible:** El sistema fue concebido bajo el principio de responsabilidad única, facilitando la adición de nuevas métricas, vistas o integraciones de terceros con un impacto mínimo en el núcleo del sistema.

---

## ⚙️ Instalación y Configuración

### Backend (Django)
1. Entrar a la carpeta: `cd lead_flow_backend`
2. Crear venv: `python -m venv venv`
3. Activar venv: `.\venv\Scripts\activate` (Windows) o `source venv/bin/activate` (Unix)
4. Instalar dependencias: `pip install -r requirements.txt`
5. Ejecutar migraciones: `python manage.py migrate`
6. **Llenar base de datos (Seeders):**
   ```bash
   python manage.py seed_initial
   ```
7. Correr servidor: `python manage.py runserver`
8. Ejecutar el seeder de webhooks:
    ```bash
    python manage.py seed_webhooks
    ```


### Frontend (Next.js)
1. Entrar a la carpeta: `cd lead_flow_frontend`
2. Instalar: `npm install`
3. Correr: `npm run dev` (Disponible en http://localhost:3000)

---

## 🧪 Testing y Calidad

El backend cuenta con una suite de 10 pruebas automatizadas que cubren escenarios de éxito, fallos críticos y parsing de fechas para los WebHooks.

```bash
# Ejecutar desde lead_flow_backend
python manage.py test
```

---

## 📡 Simulación de Webhooks (CURL)

Para probar la recepción de datos y la unificación de identidad, puedes ejecutar el siguiente comando en tu terminal (compatible con Windows y Bash). Este comando se debe ejecutar en la cmd:

**Caso: Registro de nuevo Lead**
```bash
curl -X POST http://127.0.0.1:8000/api/webhooks/ -H "Content-Type: application/json" -d "{\"event_type\": \"lead_created\", \"lead_data\": {\"email\": \"nuevo_lead@test.com\", \"name\": \"Juan Perez\", \"phone\": \"+56912345678\", \"source\": \"Facebook Ads\"}}"
```

---

## ⏱️ Registro de Tiempo Invertido

| Día | Actividad | Horas |
| :--- | :--- | :--- |
| **Miércoles 01/04** | Análisis técnico y configuración inicial Django/CORS. | 1.5 h |
| **Jueves 02/04** | No Avance | 0.0 h |
| **Viernes 03/04** | Estructura de base de datos, Modelos y primer prototipo Backend. | 3.0 h |
| **Sábado 04/04** | No Avance | 0.0 h |
| **Domingo 05/04** | Desarrollo de Frontend: Dashboard, Context API y UI/UX con shadcn/ui. | 4.0 h |
| **Lunes 06/04** | Robustez de Webhooks, Timestamp Parsing, Unit Testing (94.5%) y Documentación. | 4.0 h |
| **TOTAL** | **Desarrollo Full Stack Finalizado** | **12.5 h** |