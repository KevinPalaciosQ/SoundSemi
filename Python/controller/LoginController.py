from flask import Blueprint, request, jsonify, current_app
from util.configPage import guardarObjeto, check_password, eliminarObjeto
from db import query, query_con_retorno
from pymysql.err import MySQLError
from io import BytesIO
import logging
import base64

BlueprintLogin =  Blueprint('login', __name__)
logger = logging.getLogger(__name__)

@BlueprintLogin.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        correo = data.get('correo')
        password = data.get('password')

        if not correo or not password:
            return jsonify({"error": "Correo o contraseña vacíos"}), 400

        usuario = query_con_retorno("SELECT * FROM USUARIO WHERE CORREO = %s", (correo,))
        if not usuario:
            return jsonify({"error": "Correo o contraseña incorrectos"}), 401

        usuario = usuario[0]
        hashed_password = usuario['PASSWORD']

        if correo == 'admin@sound-stream.com':
            if not password == 'admin':
                return jsonify({"error": "Correo o contraseña incorrectos"}), 401
        else:
            if not check_password(password, hashed_password):
                return jsonify({"error": "Correo o contraseña incorrectos"}), 401

        usuario_data = {
            "id": usuario['ID'],
            "nombre": usuario['NOMBRE'],
            "apellido": usuario['APELLIDO'],
            "foto": usuario['FOTO'],
            "correo": usuario['CORREO'],
            "fecha_nacimiento": usuario['FECHA_NACIMIENTO']
        }
        return jsonify(usuario_data), 200

    except MySQLError as e:
        print(f"Error en la consulta de login: {e}")
        return jsonify({"error": "Error en el servidor"}), 500
    except Exception as e:
        print(f"Error inesperado: {e}")
        return jsonify({"error": "Error en el servidor"}), 500


@BlueprintLogin.route('/registrar', methods=['POST'])
def registrar():
    try:
        data = request.json
        if 'foto' not in data or not data['foto']:
            return jsonify({"error": "Falta la imagen del perfil"}), 400
        nombres = data.get('nombre')
        apellidos = data.get('apellido')
        foto = data.get('foto')
        email = data.get('correo')
        password = data.get('password')
        fecha_nacimiento = data.get('fecha_nacimiento')

        correo = query_con_retorno("SELECT * FROM USUARIO WHERE CORREO = %s", (email,))
        if correo:
            return jsonify({"error": "El correo ya está registrado"}), 400
        cifrar_password = password
        if foto:
            foto_bytes = base64.b64decode(foto.split(',')[1])
            extension = 'jpg'
            nombre_imagen = guardarObjeto(BytesIO(foto_bytes), extension, "Fotos/")
            path_foto = nombre_imagen['Location']
        else:
            path_foto = None

        query("INSERT INTO USUARIO (NOMBRE, APELLIDO, FOTO, CORREO, PASSWORD, FECHA_NACIMIENTO) VALUES (%s, %s, %s, %s, %s, %s)",
              (nombres, apellidos, path_foto, email, cifrar_password, fecha_nacimiento))
        return jsonify({"message": "Usuario registrado"}), 201
    except MySQLError as e:
        print(f"Error al registrar el usuario: {e}")
        return jsonify({"error": "Error al registrar el usuario"}), 500
    except Exception as e:
        print(f"Error inesperado: {e}")
        return jsonify({"error": "Error inesperado"}), 500
    
@BlueprintLogin.route('/actualizar', methods=['PUT'])
def actualizar_usuario():
    try:
        data = request.json
        id = data.get('id')
        nombres = data.get('nombre')
        apellidos = data.get('apellido')
        nueva_foto = data.get('foto')
        nueva_password = data.get('password')
        fecha_nacimiento = data.get('fecha_nacimiento')
        actual_password = data.get('actualPassword')
        # Verificar que el usuario exista
        if id is None or not nombres or not apellidos or not actual_password:
            return jsonify({"error": "Datos incompletos"}), 400
        usuario = query_con_retorno("SELECT * FROM USUARIO WHERE ID = %s", (id,))
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        usuario = usuario[0]
        # Verificación de la contraseña actual
        if not check_password(actual_password, usuario['PASSWORD']):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401
        if nueva_foto:
            eliminarObjeto(usuario['FOTO'])
            foto_bytes = base64.b64decode(nueva_foto.split(',')[1])
            extension = 'jpg'
            nueva_foto_obj = guardarObjeto(BytesIO(foto_bytes), extension, "Fotos/")
            nueva_foto_url = nueva_foto_obj['Location']
        else:
            nueva_foto_url = usuario['FOTO']
        if nueva_password:
            nueva_password_cifrada = nueva_password
        else:
            nueva_password_cifrada = usuario['PASSWORD']
        query("UPDATE USUARIO SET NOMBRE = %s, APELLIDO = %s, FOTO = %s, PASSWORD = %s, FECHA_NACIMIENTO = %s WHERE id = %s",
              (nombres, apellidos, nueva_foto_url, nueva_password_cifrada, fecha_nacimiento, id))
        usuario_actualizado = query_con_retorno("SELECT * FROM USUARIO WHERE ID = %s", (id,))

        if not usuario_actualizado:
            return jsonify({"error": "No se pudo obtener la información actualizada"}), 500
        usuario_actualizado = usuario_actualizado[0]
        usuario_data = {
            "id": usuario_actualizado['ID'],
            "nombre": usuario_actualizado['NOMBRE'],
            "apellido": usuario_actualizado['APELLIDO'],
            "foto": usuario_actualizado['FOTO'],
            "correo": usuario_actualizado['CORREO'],
            "fecha_nacimiento": usuario_actualizado['FECHA_NACIMIENTO']
        }
        return jsonify(usuario_data), 200
    except MySQLError as e:
        print(f"Error al actualizar el usuario: {e}")
        return jsonify({"error": "Error al actualizar el usuario"}), 500
    except Exception as e:
        print(f"Error inesperado: {e}")
        return jsonify({"error": "Error inesperado"}), 500


## -- USUARIO -- ##
@BlueprintLogin.route('/', methods=['GET'])
def obtener_usuarios():
    try:
        usuarios = query_con_retorno("SELECT * FROM USUARIO")
        if not usuarios:
            return jsonify({"message": "No users found"}), 404
        usuarios_data = []
        for usuario in usuarios:
            usuario_data = {
                "id": usuario['ID'],
                "nombre": usuario['NOMBRE'],
                "apellido": usuario['APELLIDO'],
                "foto": usuario['FOTO'],
                "correo": usuario['CORREO'],
                "fecha_nacimiento": usuario['FECHA_NACIMIENTO']
            }
            usuarios_data.append(usuario_data)
        return jsonify(usuarios_data), 200
    except MySQLError as e:
        current_app.logger.error(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Unexpected error occurred"}), 500
