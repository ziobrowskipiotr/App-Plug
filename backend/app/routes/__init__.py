from .energy.routes import energy_bp
from .health.routes import health_bp
from .devices.routes import devices_bp

ALL_BLUEPRINTS = [
    energy_bp, devices_bp, health_bp,
]