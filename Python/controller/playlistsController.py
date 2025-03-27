from flask import Blueprint, request, jsonify, current_app
from util.configPage import guardarObjeto, check_password, eliminarObjeto
from db import query, query_con_retorno
from pymysql.err import MySQLError
from io import BytesIO
import logging
import base64

BlueprintPlaylists =  Blueprint('playlists', __name__)
logger = logging.getLogger(__name__)

@BlueprintPlaylists.route('/', methods=['GET'])
def getPlaylists():
    try:
        usuario_id = request.args.get('idUsuario')
        playlists = query_con_retorno('SELECT * FROM PLAYLIST')
        playlists_with_canciones = []
        if(usuario_id):
            playlists = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID_USUARIO = %s', (usuario_id,))

        for playlist in playlists:
            canciones = query_con_retorno('SELECT * FROM CANCION WHERE ID IN (SELECT ID_CANCION FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = %s)', (playlist['ID'],))
            canciones_formateadas = [{
                'id': cancion['ID'],
                'nombre': cancion['NOMBRE'],
                'cancion': cancion['CANCION'],
                'imagen': cancion['IMAGEN'],
                'duracion': cancion['DURACION'],
                'artista': cancion['ARTISTA']
            } for cancion in canciones]

            playlists_with_canciones.append({
                'id': playlist['ID'],
                'nombre': playlist['NOMBRE'],
                'descripcion': playlist['DESCRIPCION'],
                'portada': playlist['PORTADA'],
                'id_usuario': playlist['ID_USUARIO'],
                'canciones': canciones_formateadas
            })
        return jsonify(playlists_with_canciones), 200
    except MySQLError as e:
        logger.error(f"Error al obtener las playlists: {e}")
        return jsonify({'error': 'Error al obtener las playlists'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500

@BlueprintPlaylists.route('/registrar', methods=['POST'])
def registrarPlaylist():
    try:
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        portada = data.get('portada')
        id_usuario = data.get('id_usuario')

        if not nombre or not portada or not id_usuario:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        imagen_bytes = base64.b64decode(portada.split(',')[1])
        imagen_extension = 'png'
        nombre_imagen_obj = guardarObjeto(BytesIO(imagen_bytes), imagen_extension, "Fotos/")
        imagen_url = nombre_imagen_obj['Location']

        query('INSERT INTO PLAYLIST (NOMBRE, DESCRIPCION, PORTADA, ID_USUARIO) VALUES (%s, %s, %s, %s)', 
              (nombre, descripcion, imagen_url, id_usuario))

        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE NOMBRE = %s AND ID_USUARIO = %s', 
                                     (nombre, id_usuario))[0]
        playlist_formateada = {
            'id': playlist['ID'],
            'nombre': playlist['NOMBRE'],
            'descripcion': playlist['DESCRIPCION'],
            'portada': playlist['PORTADA'],
            'id_usuario': playlist['ID_USUARIO']
        }

        return jsonify(playlist_formateada), 200
    except MySQLError as e:
        logger.error(f"Error al registrar la playlist: {e}")
        return jsonify({'error': 'Error al registrar la playlist'}), 500
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500

@BlueprintPlaylists.route('/actualizar', methods=['PUT'])
def actualizarPlaylist():
    try:
        data = request.json
        id_playlist = data.get('id')
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        portada = data.get('portada')

        if not id_playlist or not nombre:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID = %s', (id_playlist,))
        if not playlist:
            return jsonify({'error': 'Playlist no encontrada'}), 404

        portada_antigua = playlist[0]['PORTADA']
        imagen_url = portada_antigua

        if portada:
            if portada_antigua:
                key_portada = portada_antigua.split('.com/')[1]
                eliminarObjeto(key_portada)

            imagen_bytes = base64.b64decode(portada.split(',')[1])
            imagen_extension = 'png'
            nombre_imagen_obj = guardarObjeto(BytesIO(imagen_bytes), imagen_extension, "Fotos/")
            imagen_url = nombre_imagen_obj['Location']

        query('UPDATE PLAYLIST SET NOMBRE = %s, DESCRIPCION = %s, PORTADA = %s WHERE ID = %s', 
              (nombre, descripcion, imagen_url, id_playlist))

        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID = %s', (id_playlist,))
        if not playlist:
            return jsonify({'error': 'Playlist no encontrada'}), 404
        
        playlist_formateada = {
            'id': playlist[0]['ID'],
            'nombre': playlist[0]['NOMBRE'],
            'descripcion': playlist[0]['DESCRIPCION'],
            'portada': playlist[0]['PORTADA'],
            'id_usuario': playlist[0]['ID_USUARIO']
        }
        return jsonify(playlist_formateada), 200
    except MySQLError as e:
        logger.error(f"Error al actualizar la playlist: {e}")
        return jsonify({'error': 'Error al actualizar la playlist'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500
    
@BlueprintPlaylists.route('/eliminar', methods=['DELETE'])
def eliminarPlaylist():
    try:
        data = request.json
        id_playlist = data.get('id')

        if not id_playlist:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID = %s', (id_playlist,))
        if not playlist:
            return jsonify({'error': 'Playlist no encontrada'}), 404
        
        portada = playlist[0]['PORTADA']
        if portada:
            key_portada = portada.split('.com/')[1]
            eliminarObjeto(key_portada)
        
        query('DELETE FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = %s', (id_playlist,))

        query('DELETE FROM PLAYLIST WHERE ID = %s', (id_playlist,))

        return jsonify({'id':id_playlist}), 200
    except MySQLError as e:
        logger.error(f"Error al eliminar la playlist: {e}")
        return jsonify({'error': 'Error al eliminar la playlist'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500


@BlueprintPlaylists.route('/agregarCancion', methods=['POST'])
def agregarCancion():
    try:
        id_playlist = request.args.get('idPlaylist')
        id_cancion = request.args.get('idCancion')

        if not id_playlist or not id_cancion:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
    
        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID = %s', (id_playlist,))
        cancion = query_con_retorno('SELECT * FROM CANCION WHERE ID = %s', (id_cancion,))
        if not playlist or not cancion:
            return jsonify({'error': 'La playlist o la canción no existen'}), 400
        
        cancion_en_playlist = query_con_retorno('SELECT * FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = %s AND ID_CANCION = %s', (id_playlist, id_cancion))
        if cancion_en_playlist:
            return jsonify({'error': 'La canción ya está en la playlist'}), 400
    
        query('INSERT INTO PLAYLIST_CANCION (ID_PLAYLIST, ID_CANCION) VALUES (%s, %s)', (id_playlist, id_cancion))
        cancionAgregada = query_con_retorno('SELECT * FROM CANCION WHERE id  = %s', (id_cancion,))[0]
        cancion_formateada = {
            'id': cancionAgregada['ID'],
            'nombre': cancionAgregada['NOMBRE'],
            'cancion': cancionAgregada['CANCION'],
            'imagen': cancionAgregada['IMAGEN'],
            'duracion': cancionAgregada['DURACION'],
            'artista': cancionAgregada['ARTISTA']
        }
        return jsonify(cancion_formateada), 200
    except MySQLError as e:
        logger.error(f"Error al agregar la canción a la playlist: {e}")
        return jsonify({'error': 'Error al agregar la canción a la playlist'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500
    
@BlueprintPlaylists.route('/eliminarCancion', methods=['DELETE'])
def eliminarCancion():
    try:
        id_playlist = request.args.get('idPlaylist')
        id_cancion = request.args.get('idCancion')

        if not id_playlist or not id_cancion:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        playlist = query_con_retorno('SELECT * FROM PLAYLIST WHERE ID = %s', (id_playlist,))
        if not playlist:
            return jsonify({'error': 'La playlist no existe'}), 400
        
        cancion = query_con_retorno('SELECT * FROM CANCION WHERE ID = %s', (id_cancion,))
        if not cancion:
            return jsonify({'error': 'La canción no existe'}), 400
   
        cancion_en_playlist = query_con_retorno('SELECT * FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = %s AND ID_CANCION = %s', (id_playlist, id_cancion))
        if not cancion_en_playlist:
            return jsonify({'error': 'La canción no está en la playlist'}),

        query('DELETE FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = %s AND ID_CANCION = %s', (id_playlist, id_cancion))

        return jsonify({'id': id_cancion}), 200
    except MySQLError as e:
        logger.error(f"Error al eliminar la canción de la playlist: {e}")
        return jsonify({'error': 'Error al eliminar la canción de la playlist'}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'Ocurrió un error inesperado'}), 500