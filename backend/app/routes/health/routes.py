from flask import Blueprint, jsonify, request
from app.services.ssh_service import SSHService
import time

health_bp = Blueprint('health_bp', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    start_time = time.time()

    try:
        ssh_client = SSHService()
        test_plug_name = "plug"

        ssh_client.get_state(test_plug_name)
        ssh_status = "healthy"

    except Exception as exc:
        ssh_status = f"unhealthy: {str(exc)[:150]}..."

    response_time = round((time.time() - start_time) * 1000, 2)

    overall_status = "ok"

    status_code = 200
    if ssh_status.startswith("unhealthy"):
        overall_status = "degraded"
        status_code = 503

    return (
        jsonify({
            "status": overall_status,
            "service": "App-Plug Backend",
            "dependencies": {
                "ssh_server": ssh_status
            },
            "response_time_ms": response_time,
            "message": "Service is running"
        }),
        status_code,
    )
