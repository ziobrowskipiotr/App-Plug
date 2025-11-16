from .energy.routes import energy_bp
from .health.routes import health_bp
from .manage.routes import manage_bp

ALL_BLUEPRINTS = [
    energy_bp, health_bp, manage_bp
]