from flask import Flask
from flask_cors import CORS
import db as db
from controller.LoginController import BlueprintLogin
from controller.cancionController import BlueprintCancion
from controller.playlistsController import BlueprintPlaylists

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=['GET'])
def hola():
    return "<h1>'Seminario de Sistemas 1 - Practica 1'</h1>"

app.register_blueprint(BlueprintLogin, url_prefix='/usuarios')
app.register_blueprint(BlueprintCancion, url_prefix='/canciones')
app.register_blueprint(BlueprintPlaylists, url_prefix='/playlists')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)