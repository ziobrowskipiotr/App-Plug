from flask import Blueprint, jsonify, json
from app.services.ssh_service import SSHService

devices_bp = Blueprint('devices', __name__)
ssh_client = SSHService()

@devices_bp.route("/<string:plug_name>/turn-on", methods=["POST"])
def turn_device_on(plug_name):
    try:
        result = ssh_client.turn_device_on(plug_name)
        return jsonify({"status": "success", "action": "turn-on", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@devices_bp.route("/<string:plug_name>/turn-off", methods=["POST"])
def turn_device_off(plug_name):
    try:
        result = ssh_client.turn_device_off(plug_name)
        return jsonify({"status": "success", "action": "turn-off", "result": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@devices_bp.route("/<string:plug_name>/state", methods=["GET"])
def get_state(plug_name):
    output = ssh_client.get_state(plug_name)
    return jsonify({"plug_name": plug_name, "state": output})

@devices_bp.route("/", methods=["GET"])
def get_devices():
    raw_output = ssh_client.get_devices()
    try:
        devices_list = json.loads(raw_output)
        return jsonify(devices_list)

    except json.JSONDecodeError:
        return jsonify({"error": "Błąd odczytu danych z urządzenia", "raw": raw_output}), 500


@devices_bp.route("/<string:plug_name>/toggle", methods=["POST"])
def toggle_device(plug_name):
    try:
        current_state = ssh_client.get_state(plug_name)

        if current_state.upper() == "ON":
            result = ssh_client.turn_device_off(plug_name)
            action = "turn-off"
        else:
            result = ssh_client.turn_device_on(plug_name)
            action = "turn-on"

        return jsonify({
            "status": "success",
            "action": action,
            "plug_name": plug_name,
            "result": result,
            "new_state": "OFF" if action == "turn-off" else "ON"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "plug_name": plug_name,
            "message": str(e)
        }), 500
