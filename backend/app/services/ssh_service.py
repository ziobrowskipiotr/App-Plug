import paramiko
import os

class SSHService:
    def __init__(self):
        self.hostname = os.environ.get('SSH_HOST')
        self.username = os.environ.get('SSH_USER')
        self.password = os.environ.get('PASS')
        self.port = os.environ.get('SSH_PORT')
        self.base_dir = os.environ.get('BASE_DIR')
        self.spc_command_path = os.environ.get('SPC_COMMAND_PATH')

    def _execute_command(self, command_args):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            client.connect(
                hostname=self.hostname,
                port=self.port,
                username=self.username,
                password=self.password
            )

            full_command = f"cd {self.base_dir} && {self.spc_command_path} {command_args}"
            stdin, stdout, stderr = client.exec_command(full_command)
            output = stdout.read().decode("utf-8").strip()
            error_output = stderr.read().decode("utf-8").strip()

            if error_output:
                raise Exception(f"Błąd komendy SSH ({full_command}): {error_output}")
            return output

        except Exception as e:
            raise Exception(f"Nie udało się wykonać komendy SSH ({command_args}): {str(e)}")
        finally:
            client.close()

    def get_state(self, plug_name):
        command = f"state {plug_name}"
        return self._execute_command(command)

    def get_devices(self):
        command = f"devices"
        return self._execute_command(command)

    def get_active_power(self, plug_name):
        command = f"active-power {plug_name}"
        return self._execute_command(command)

    def get_energy_today(self, plug_name):
        command = f"energy-today {plug_name}"
        return self._execute_command(command)

    def get_energy_yesterday(self, plug_name):
        command = f"energy-yesterday {plug_name}"
        return self._execute_command(command)

    def get_energy_from_to(self, plug_name, from_date, to_date):
        command = f'energy --name {plug_name} --from "{from_date}" --to "{to_date}"'
        return self._execute_command(command)

    def get_voltage(self, plug_name):
        command = f"voltage {plug_name}"
        return self._execute_command(command)

    def get_current(self, plug_name):
        command = f"current {plug_name}"
        return self._execute_command(command)

    def get_status(self, plug_name):
        command = f"status {plug_name}"
        return self._execute_command(command)

    def turn_device_on(self, plug_name):
        command = f"on {plug_name}"
        return self._execute_command(command)

    def turn_device_off(self, plug_name):
        command = f"off {plug_name}"
        return self._execute_command(command)
