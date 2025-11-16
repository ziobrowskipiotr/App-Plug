from flask import Flask
import os
from flasgger import Swagger

def create_app():
    app = Flask(__name__)

    app.config['SWAGGER'] = {
        'title': 'Energy API',
        'uiversion': 3
    }

    Swagger(app, template_file="swagger_spec.yml")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG') == '1'
    from app.routes.energy.routes import energy_bp
    from app.routes.health.routes import health_bp
    from app.routes.manage.routes import manage_bp


    app.register_blueprint(energy_bp, url_prefix='/api/v1/energy')
    app.register_blueprint(manage_bp, url_prefix='/api/v1/manage')
    app.register_blueprint(health_bp)

    return app
