from flask import Blueprint

from app.services.ssh_service import SSHService

manage_bp = Blueprint('manage', __name__)
ssh_client = SSHService()

@manage_bp.route("/<string:plug_name>/turn-on", methods=["GET"])
def turn_device_on(plug_name):
    return ssh_client.turn_device_on(plug_name)

@manage_bp.route("/<string:plug_name>/turn-off", methods=["GET"])
def turn_device_off(plug_name):
    return ssh_client.turn_device_off(plug_name)

@manage_bp.route("/<string:plug_name>/state", methods=["GET"])
def get_state(plug_name):
    output = ssh_client.get_state(plug_name)
    return output, "state"