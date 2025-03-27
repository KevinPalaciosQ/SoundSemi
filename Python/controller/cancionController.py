from flask import Blueprint, request, jsonify, current_app
from util.configPage import guardarObjeto, eliminarObjeto
from db import query, query_con_retorno
from pymysql.err import MySQLError
from io import BytesIO
import logging
import base64

BlueprintCancion =  Blueprint('cancion', __name__)
logger = logging.getLogger(__name__)

@BlueprintCancion.route('/', methods=['GET'])
def listarCanciones():
    try:
        canciones = query_con_retorno("SELECT * FROM CANCION")
        canciones_data = []
        for cancion in canciones:
            canciones_data.append({
                "id": cancion['ID'],
                "nombre": cancion['NOMBRE'],
                "cancion": cancion['CANCION'],
                "imagen": cancion['IMAGEN'],
                "duracion": cancion['DURACION'],
                "artista": cancion['ARTISTA']
            })
        return jsonify(canciones_data), 200
    except MySQLError as e:
        logger.error(f"Error al listar las canciones: {e}")
        return jsonify({"error": "Error al listar las canciones", "message": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado", "message": str(e)}), 500

@BlueprintCancion.route('/registrar', methods=['POST'])
def crearCancion():
    try:
        data = request.json
        nombre = data.get('nombre')
        cancion_base64 = data.get('cancion')
        imagen_base64 = data.get('imagen')
        duracion = data.get('duracion')
        artista = data.get('artista')

        if not nombre or not cancion_base64 or not imagen_base64 or not duracion or not artista:
            return jsonify({"error": "Datos incompletos", "message": "Todos los campos son obligatorios"}), 400

        imagen_bytes = base64.b64decode(imagen_base64.split(',')[1])
        imagen_extension = 'png'
        nombre_imagen_obj = guardarObjeto(BytesIO(imagen_bytes), imagen_extension, "Fotos/")
        imagen_url = nombre_imagen_obj['Location']

        cancion_bytes = base64.b64decode(cancion_base64.split(',')[1])
        cancion_extension = 'mp3'
        nombre_cancion_obj = guardarObjeto(BytesIO(cancion_bytes), cancion_extension, "Canciones/")
        cancion_url = nombre_cancion_obj['Location']

        query("INSERT INTO CANCION (NOMBRE, CANCION, IMAGEN, DURACION, ARTISTA) VALUES (%s, %s, %s, %s, %s)",
              (nombre, cancion_url, imagen_url, duracion, artista))

        canciones = query_con_retorno("SELECT * FROM CANCION WHERE NOMBRE = %s", (nombre,))
        if not canciones:
            return jsonify({"error": "No se pudo crear la canción"}), 500

        cancion_creada = canciones[0]
        cancion_data = {
            "id": cancion_creada['ID'],
            "nombre": cancion_creada['NOMBRE'],
            "cancion": cancion_creada['CANCION'],
            "imagen": cancion_creada['IMAGEN'],
            "duracion": cancion_creada['DURACION'],
            "artista": cancion_creada['ARTISTA']
        }
        return jsonify(cancion_data), 201
    except MySQLError as e:
        logger.error(f"Error al crear la canción: {e}")
        return jsonify({"error": "Error al crear la canción"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado"}), 500

@BlueprintCancion.route('/actualizar', methods=['PUT'])
def actualizarCancion():
    try:
        data = request.json
        id_cancion = data.get('id')
        nombre = data.get('nombre')
        cancion_base64 = data.get('cancion')
        imagen_base64 = data.get('imagen')
        duracion = data.get('duracion')
        artista = data.get('artista')
        if not id_cancion or not nombre or not artista:
            return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
        canciones = query_con_retorno("SELECT * FROM CANCION WHERE ID = %s", (id_cancion,))
        if not canciones:
            return jsonify({"error": "La canción no existe", "message": "La canción no existe"}), 400
        cancion_antigua = canciones[0]['CANCION']
        imagen_antigua = canciones[0]['IMAGEN']
        nueva_cancion = cancion_antigua
        nueva_imagen = imagen_antigua
        nueva_duracion = canciones[0]['DURACION']
        if cancion_base64:
            if not duracion:
                return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
            nueva_duracion = duracion

            key_cancion = cancion_antigua.split('.com/')[1]
            eliminarObjeto(key_cancion)

            cancion_bytes = base64.b64decode(cancion_base64.split(',')[1])
            cancion_extension = 'mp3'
            nombre_cancion_obj = guardarObjeto(BytesIO(cancion_bytes), cancion_extension, "Canciones/")
            nueva_cancion = nombre_cancion_obj['Location']

        if imagen_base64:
            key_imagen = imagen_antigua.split('.com/')[1]
            eliminarObjeto(key_imagen)

            imagen_bytes = base64.b64decode(imagen_base64.split(',')[1])
            imagen_extension = 'png'
            nombre_imagen_obj = guardarObjeto(BytesIO(imagen_bytes), imagen_extension, "Fotos/")
            nueva_imagen = nombre_imagen_obj['Location']
        query("UPDATE CANCION SET NOMBRE = %s, CANCION = %s, IMAGEN = %s, DURACION = %s, ARTISTA = %s WHERE ID = %s",
              (nombre, nueva_cancion, nueva_imagen, nueva_duracion, artista, id_cancion))
        canciones_actualizadas = query_con_retorno("SELECT * FROM CANCION WHERE ID = %s", (id_cancion,))
        cancion_data = {
            "id": canciones_actualizadas[0]['ID'],
            "nombre": canciones_actualizadas[0]['NOMBRE'],
            "cancion": canciones_actualizadas[0]['CANCION'],
            "imagen": canciones_actualizadas[0]['IMAGEN'],
            "duracion": canciones_actualizadas[0]['DURACION'],
            "artista": canciones_actualizadas[0]['ARTISTA']
        }
        return jsonify(cancion_data), 200
    except MySQLError as e:
        logger.error(f"Error al actualizar la canción: {e}")
        return jsonify({"error": "Error al actualizar la canción"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado"}), 500

@BlueprintCancion.route('/eliminar', methods=['DELETE'])
def eliminarCancion():
    try:
        data = request.json
        id_cancion = data.get('id')
        
        if not id_cancion:
            return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
        
        canciones = query_con_retorno("SELECT * FROM CANCION WHERE ID = %s", (id_cancion,))
        if not canciones:
            return jsonify({"error": "La canción no existe", "message": "La canción no existe"}), 400
        
        cancion = canciones[0]
        
        query("DELETE FROM FAVORITO WHERE ID_CANCION = %s", (id_cancion,))
        query("DELETE FROM PLAYLIST_CANCION WHERE ID_CANCION = %s", (id_cancion,))

        key_cancion = cancion['CANCION'].split('.com/')[1]
        eliminarObjeto(key_cancion)
        
        key_imagen = cancion['IMAGEN'].split('.com/')[1]
        eliminarObjeto(key_imagen)
        
        query("DELETE FROM CANCION WHERE ID = %s", (id_cancion,))
        
        return jsonify({"id": id_cancion}), 200
    except MySQLError as e:
        logger.error(f"Error al eliminar la canción: {e}")
        return jsonify({"error": "Error al eliminar la canción"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado"}), 500

@BlueprintCancion.route('/favoritas', methods=['GET'])
def listarCancionesFavoritas():
    try:
        id_usuario = request.args.get('idUsuario')
        if not id_usuario:
            return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
        usuario = query_con_retorno("SELECT * FROM USUARIO WHERE id = %s", (id_usuario,))
        if not usuario:
            return jsonify({"error": "El usuario no existe", "message": "El usuario no existe"}), 400
        canciones = query_con_retorno(
            "SELECT * FROM CANCION WHERE ID IN (SELECT ID_CANCION FROM FAVORITO WHERE ID_USUARIO = %s)",
            (id_usuario,)
        )
        canciones_data = []
        for cancion in canciones:
            canciones_data.append({
                "id": cancion['ID'],
                "nombre": cancion['NOMBRE'],
                "cancion": cancion['CANCION'],
                "imagen": cancion['IMAGEN'],
                "duracion": cancion['DURACION'],
                "artista": cancion['ARTISTA']
            })
        return jsonify(canciones_data), 200
    except MySQLError as e:
        logger.error(f"Error al listar las canciones favoritas: {e}")
        return jsonify({"error": "Error en el servidor", "message": str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Error en el servidor", "message": str(e)}), 500
    
@BlueprintCancion.route('/favorita', methods=['PUT'])
def marcarCancionFavorita():
    try:
        id_cancion = request.args.get('idCancion')
        id_usuario = request.args.get('idUsuario')
        if not id_cancion or not id_usuario:
            return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
        canciones = query_con_retorno("SELECT * FROM CANCION WHERE ID = %s", (id_cancion,))
        if not canciones:
            return jsonify({"error": "La canción no existe", "message": "La canción no existe"}), 400
        usuarios = query_con_retorno("SELECT * FROM USUARIO WHERE ID = %s", (id_usuario,))
        if not usuarios:
            return jsonify({"error": "El usuario no existe", "message": "El usuario no existe"}), 400
        favoritos = query_con_retorno("SELECT * FROM FAVORITO WHERE ID_USUARIO = %s AND ID_CANCION = %s", (id_usuario, id_cancion))
        if favoritos:
            query("DELETE FROM FAVORITO WHERE ID_USUARIO = %s AND ID_CANCION = %s", (id_usuario, id_cancion))
            es_favorita = False
        else:
            query("INSERT INTO FAVORITO (ID_USUARIO, ID_CANCION) VALUES (%s, %s)", (id_usuario, id_cancion))
            es_favorita = True
        canciones_actualizadas = query_con_retorno("SELECT * FROM CANCION WHERE ID = %s", (id_cancion,))
        if not canciones_actualizadas:
            return jsonify({"error": "Error al obtener la canción actualizada"}), 500
        cancion = {
            "id": canciones_actualizadas[0]['ID'],
            "nombre": canciones_actualizadas[0]['NOMBRE'],
            "cancion": canciones_actualizadas[0]['CANCION'],
            "imagen": canciones_actualizadas[0]['IMAGEN'],
            "duracion": canciones_actualizadas[0]['DURACION'],
            "artista": canciones_actualizadas[0]['ARTISTA'],
            "favorita": es_favorita
        }
        return jsonify(cancion), 200
    except MySQLError as e:
        logger.error(f"Error al marcar la canción como favorita: {e}")
        return jsonify({"error": "Error al marcar la canción como favorita"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado"}), 500
    

@BlueprintCancion.route('/buscar', methods=['GET'])
def buscarCancion():
    try:
        parametro = request.args.get('parametro')
        if not parametro:
            return jsonify({"error": "Datos incompletos", "message": "Datos incompletos"}), 400
        sql = "SELECT * FROM CANCION WHERE NOMBRE LIKE %s OR ARTISTA LIKE %s"
        params = (f"%{parametro}%", f"%{parametro}%")
        canciones = query_con_retorno(sql, params)
        canciones_data = []
        for cancion in canciones:
            canciones_data.append({
                "id": cancion['ID'],
                "nombre": cancion['NOMBRE'],
                "cancion": cancion['CANCION'],
                "imagen": cancion['IMAGEN'],
                "duracion": cancion['DURACION'],
                "artista": cancion['ARTISTA']
            })

        return jsonify(canciones_data), 200

    except MySQLError as e:
        logger.error(f"Error al buscar la canción: {e}")
        return jsonify({"error": "Error al buscar la canción"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "Ocurrió un error inesperado"}), 500
