from flask import Blueprint, jsonify
from app.services.ssh_service import SSHService

manage_bp = Blueprint('manage', __name__)
ssh_client = SSHService()

@manage_bp.route("/<string:plug_name>/turn-on", methods=["POST"])
def turn_device_on(plug_name):
    result = ssh_client.turn_device_on(plug_name)
    return jsonify({"status": "success", "action": "turn-on", "result": result})

@manage_bp.route("/<string:plug_name>/turn-off", methods=["POST"])
def turn_device_off(plug_name):
    result = ssh_client.turn_device_off(plug_name)
    return jsonify({"status": "success", "action": "turn-off", "result": result})

@manage_bp.route("/<string:plug_name>/state", methods=["GET"])
def get_state(plug_name):
    output = ssh_client.get_state(plug_name)
    return jsonify({"plug_name": plug_name, "state": output})