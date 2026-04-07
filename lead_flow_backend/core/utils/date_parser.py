# utils/date_parser.py
from django.utils import timezone
from datetime import datetime

def parse_external_timestamp(ts_value):
    """
    Intenta convertir diversos formatos de fecha en un objeto datetime aware de Django.
    """
    if not ts_value:
        return None
    
    try:
        # 1. Intentar ISO 8601 (Ej: "2026-04-07T12:00:00Z")
        if isinstance(ts_value, str):
            return timezone.datetime.fromisoformat(ts_value.replace('Z', '+00:00'))
        
        # 2. Intentar Unix Timestamp (Ej: 1712491200)
        if isinstance(ts_value, (int, float)):
            if ts_value > 1e11: 
                ts_value = ts_value / 1000
            return timezone.make_aware(datetime.fromtimestamp(ts_value))
            
    except Exception as e:
        print(f"Error parsing timestamp {ts_value}: {e}")
        
    return None