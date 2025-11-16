from functools import wraps
from flask import Blueprint, jsonify, request, json
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.ssh_service import SSHService

energy_bp = Blueprint('energy', __name__)
ssh_client = SSHService()

def ssh_request_handler(func):
    @wraps(func)
    def wrapper(plug_name, *args, **kwargs):
        try:
            output, data_key, unit = func(plug_name, *args, **kwargs)
            parsed_data = {
                "plug_name": plug_name,
                data_key: output.strip(),
            }
            if unit:
                parsed_data['unit'] = unit

            return jsonify(parsed_data), 200

        except Exception as e:
            error_name = func.__name__.replace('_', ' ').title()
            return jsonify({"error": f"Failed to run {error_name}", "details": str(e)}), 500

    return wrapper

@energy_bp.route("/<string:plug_name>/today", methods=["GET"])
@jwt_required()
@ssh_request_handler
def get_energy_today(plug_name):
    output = ssh_client.get_energy_today(plug_name)
    return output, "consumption", "kWh"

@energy_bp.route("/<string:plug_name>/yesterday", methods=["GET"])
@jwt_required()
@ssh_request_handler
def get_energy_yesterday(plug_name):
    output = ssh_client.get_energy_yesterday(plug_name)
    return output, "consumption", "kWh"

@energy_bp.route("/<string:plug_name>/history", methods=["GET"])
@jwt_required()
def get_energy_history(plug_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')

    if not from_date or not to_date:
        return jsonify({"error": "Missing 'from' or 'to' date parameters."}), 400

    try:
        ssh_client = SSHService()
        result = ssh_client.get_energy_from_to(plug_name, from_date, to_date)

        return jsonify({
            "range": f"{from_date} to {to_date}",
            "consumption": result,
            "unit": "kWh"
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to get energy history", "details": str(e)}), 500

@energy_bp.route("/<string:plug_name>/voltage", methods=["GET"])
@jwt_required()
def get_voltage(plug_name):
    try:
        ssh_client = SSHService()
        output = ssh_client.get_voltage(plug_name)

        parsed_data = {"voltage": output.strip(), "unit": "V"}

        return jsonify(parsed_data), 200

    except Exception as e:
        return jsonify({"error": "Failed to get voltage", "details": str(e)}), 500

@energy_bp.route("/<string:plug_name>/power", methods=["GET"])
@jwt_required()
def get_power(plug_name):
    try:
        ssh_client = SSHService()
        output = ssh_client.get_active_power(plug_name)

        parsed_data = {"power": output.strip(), "unit": "A"}

        return jsonify(parsed_data), 200

    except Exception as e:
        return jsonify({"error": "Failed to get active power", "details": str(e)}), 500


@energy_bp.route("/<string:plug_name>/state", methods=["GET"])
@jwt_required()
def get_state(plug_name):
    output = ssh_client.get_state(plug_name)
    return output, "state"

@energy_bp.route("/<string:plug_name>/current", methods=["GET"])
@ssh_request_handler
@jwt_required()
def get_current(plug_name):
    output = ssh_client.get_current(plug_name)
    return output, "current", "A"


@energy_bp.route("/<string:plug_name>/status", methods=["GET"])
@jwt_required()
def get_status(plug_name):
    try:
        json_string_result = ssh_client.get_status(plug_name)
        parsed_result = json.loads(json_string_result)

        return jsonify(parsed_result), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse JSON response from SSH",
                        "raw_output": json_string_result}), 500

    except Exception as e:
        return jsonify({"error": "Failed to get plug status via SSH", "details": str(e)}), 500

