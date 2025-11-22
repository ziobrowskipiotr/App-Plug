from flask import Blueprint, jsonify, json, request
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


@devices_bp.route("/<string:current_name>/rename", methods=["PUT"])
def rename_device(current_name):
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    if not data or 'new_name' not in data:
        return jsonify({"error": "Missing 'new_name' in request body"}), 400

    new_name = data['new_name']

    try:
        raw_output = ssh_client.get_devices()
        devices_list = json.loads(raw_output)

        for device in devices_list:
            if device.get('name') == new_name:
                return jsonify({
                    "error": f"Name '{new_name}' already exists. Choose another name."
                }), 409

        ssh_client.rename_device(current_name, new_name)

        return jsonify({
            "status": "success",
            "old_name": current_name,
            "new_name": new_name,
        })

    except json.JSONDecodeError:
        return jsonify({
            "error": "Failed to parse device list from server",
            "raw_output": raw_output
        }), 502

    except Exception as e:
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


@devices_bp.route("/<string:plug_name>/remove", methods=["DELETE"])
def remove_device(plug_name):
    try:
        raw_output = ssh_client.get_devices()
        devices_list = json.loads(raw_output)

        existing_names = [d.get('name') for d in devices_list]

        if plug_name not in existing_names:
            return jsonify({
                "error": f"Device '{plug_name}' not found. Cannot remove non-existent device."
            }), 404

        result = ssh_client.remove_device(plug_name)

        return jsonify({
            "status": "success",
            "message": f"Device '{plug_name}' has been removed",
            "result": result
        })

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse device list"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500