from datetime import datetime
from functools import wraps
from flask import Blueprint, jsonify, request, json

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
@ssh_request_handler
def get_energy_today(plug_name):
    output = ssh_client.get_energy_today(plug_name)
    return output, "consumption", "kWh"

@energy_bp.route("/<string:plug_name>/yesterday", methods=["GET"])
@ssh_request_handler
def get_energy_yesterday(plug_name):
    output = ssh_client.get_energy_yesterday(plug_name)
    return output, "consumption", "kWh"

@energy_bp.route("/<string:plug_name>/history", methods=["GET"])
def get_energy_history(plug_name):
    from_date = request.args.get('from')
    to_date = request.args.get('to')

    start = str(datetime.strptime(from_date, "%d-%m-%Y %H:%M:%S"))
    end = str(datetime.strptime(to_date, "%d-%m-%Y %H:%M:%S"))

    try:
        result = ssh_client.get_energy_from_to(plug_name, start, end)

        return jsonify({
            "range": f"{start} to {end}",
            "consumption": result,
            "unit": "kWh"
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to get energy history", "details": str(e)}), 500

@energy_bp.route("/<string:plug_name>/voltage", methods=["GET"])
def get_voltage(plug_name):
    try:
        ssh_client = SSHService()
        output = ssh_client.get_voltage(plug_name)

        parsed_data = {"voltage": output.strip(), "unit": "V"}

        return jsonify(parsed_data), 200

    except Exception as e:
        return jsonify({"error": "Failed to get voltage", "details": str(e)}), 500

@energy_bp.route("/<string:plug_name>/power", methods=["GET"])
def get_power(plug_name):
    try:
        ssh_client = SSHService()
        output = ssh_client.get_active_power(plug_name)

        parsed_data = {"power": output.strip(), "unit": "A"}

        return jsonify(parsed_data), 200

    except Exception as e:
        return jsonify({"error": "Failed to get active power", "details": str(e)}), 500


@energy_bp.route("/<string:plug_name>/current", methods=["GET"])
@ssh_request_handler
def get_current(plug_name):
    output = ssh_client.get_current(plug_name)
    return output, "current", "A"


@energy_bp.route("/<string:plug_name>/status", methods=["GET"])
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

