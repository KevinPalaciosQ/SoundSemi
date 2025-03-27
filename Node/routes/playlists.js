const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const aws = require('aws-sdk');

// Configurar AWS
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


router.get('/', async (req, res) => {
    try {
        const idUsuario = req.query.idUsuario;

        let query = 'SELECT * FROM PLAYLIST';
        if (idUsuario) {
            query = 'SELECT * FROM PLAYLIST WHERE ID_USUARIO = ?';
        }
        const [rows] = await pool.query(query, [idUsuario]);
        const playlists = await rows.map(async playlist => {
            const [rows2] = await pool.query('SELECT * FROM CANCION WHERE ID IN (SELECT ID_CANCION FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = ?)', [playlist.ID]);
            const canciones = rows2.map(cancion => {
                return {
                    id: cancion.ID,
                    nombre: cancion.NOMBRE,
                    cancion: cancion.CANCION,
                    imagen: cancion.IMAGEN,
                    duracion: cancion.DURACION,
                    artista: cancion.ARTISTA
                };
            });

            return {
                id: playlist.ID,
                nombre: playlist.NOMBRE,
                descripcion: playlist.DESCRIPCION,
                portada: playlist.PORTADA,
                id_usuario: playlist.ID_USUARIO,
                canciones: canciones
            };
        });

        const result = await Promise.all(playlists);
        
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Error en el servidor' });
    }
    if (req.query.idUsuario) {
        console.log('GET /playlists?idUsuario=' + req.query.idUsuario);
    } else {
        console.log('GET /playlists');
    }
});

router.post('/registrar', async (req, res) => {
    try {
        const { nombre, descripcion, portada, id_usuario } = req.body;
        // Validar los datos
        if (!nombre || !portada || !id_usuario) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Subir la imagen a AWS S3
        const portadaBuffer = Buffer.from(portada.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        const paramsPortada = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Fotos/${nombre}-${Date.now()}.png`,
            Body: portadaBuffer,
            ContentType: 'image/png',
        };

        const dataImagen = await s3.upload(paramsPortada).promise();
        const imagenUrl = dataImagen.Location;

        // Insertar la playlist en la base de datos
        const query = "INSERT INTO PLAYLIST (NOMBRE, DESCRIPCION, PORTADA, ID_USUARIO) VALUES (?, ?, ?, ?)";
        const [result] = await pool.query(query, [nombre, descripcion, imagenUrl, id_usuario]);
        res.json({ id: result.insertId, nombre, descripcion, portada: imagenUrl, id_usuario });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('POST /playlists/registrar');
});

router.put('/actualizar', async (req, res) => {
    try {
        const { id, nombre, descripcion, portada } = req.body;
        // Validar los datos
        if (!id || !nombre) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la playlist exista
        const [rows] = await pool.query('SELECT * FROM PLAYLIST WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La playlist no existe', message: 'La playlist no existe' });
        }

        // Eliminar la portada anterior de AWS S3 y subir la nueva portada si es necesario
        const oldPortada = decodeURIComponent(rows[0].PORTADA);
        let nuevaPortada = oldPortada;
        if (portada) {
            const key = oldPortada.split('.com/')[1];
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();

            const portadaBuffer = Buffer.from(portada.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `Fotos/${nombre}-${Date.now()}.png`,
                Body: portadaBuffer,
                ContentType: 'image/jpeg'
            };

            const data = await s3.upload(params).promise();
            nuevaPortada = data.Location;
        }

        // Actualizar la playlist en la base de datos
        const query = "UPDATE PLAYLIST SET NOMBRE = ?, DESCRIPCION = ?, PORTADA = ? WHERE ID = ?";
        await pool.query(query, [nombre, descripcion, nuevaPortada, id]);
        res.json({ id, nombre, descripcion, portada: nuevaPortada, id_usuario: rows[0].ID_USUARIO });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('PUT /playlists/actualizar');
});

router.delete('/eliminar', async (req, res) => {
    try {
        const { id } = req.body;
        // Validar los datos
        if (!id) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la playlist exista
        const [rows] = await pool.query('SELECT * FROM PLAYLIST WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La playlist no existe', message: 'La playlist no existe' });
        }

        // Eliminar la portada de AWS S3
        const keyPortada = decodeURIComponent(rows[0].PORTADA).split('.com/')[1];
        await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: keyPortada }).promise();

        // Eliminar las canciones de la playlist
        await pool.query('DELETE FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = ?', [id]);

        // Eliminar la playlist de la base de datos
        await pool.query('DELETE FROM PLAYLIST WHERE id = ?', [id]);
        res.json({ id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('DELETE /playlists/eliminar');
});

router.post('/agregarCancion', async (req, res) => {
    try {
        const idCancion = req.query.idCancion;
        const idPlaylist = req.query.idPlaylist;
        // Validar los datos
        if (!idCancion || !idPlaylist) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la cancion y la playlist existan
        const [rows] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [idCancion]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La cancion no existe', message: 'La cancion no existe' });
        }

        const [rows2] = await pool.query('SELECT * FROM PLAYLIST WHERE id = ?', [idPlaylist]);
        if (rows2.length === 0) {
            return res.status(400).json({ error: 'La playlist no existe', message: 'La playlist no existe' });
        }

        // Verificar si la cancion ya esta en la playlist
        let enPlaylist = false;
        const [rows3] = await pool.query('SELECT * FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = ? AND ID_CANCION = ?', [idPlaylist, idCancion]);
        if (rows3.length > 0) {
            enPlaylist = true;
        }

        // Agregar la cancion a la playlist
        if (enPlaylist) {
            return res.status(400).json({ error: 'La cancion ya esta en la playlist', message: 'La cancion ya esta en la playlist' });
        }
        await pool.query('INSERT INTO PLAYLIST_CANCION (ID_PLAYLIST, ID_CANCION) VALUES (?, ?)', [idPlaylist, idCancion]);
        const [result] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [idCancion]);
        const cancion = result[0];
        res.json({ id: cancion.ID, nombre: cancion.NOMBRE, cancion: cancion.CANCION, imagen: cancion.IMAGEN, duracion: cancion.DURACION, artista: cancion.ARTISTA });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('POST /playlists/agregarCancion?idCancion=' + req.query.idCancion + '&idPlaylist=' + req.query.idPlaylist);
});

router.delete('/eliminarCancion', async (req, res) => {
    try {
        const idCancion = req.query.idCancion;
        const idPlaylist = req.query.idPlaylist;
        // Validar los datos
        if (!idCancion || !idPlaylist) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la cancion y la playlist existan
        const [rows] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [idCancion]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La cancion no existe', message: 'La cancion no existe' });
        }

        const [rows2] = await pool.query('SELECT * FROM PLAYLIST WHERE id = ?', [idPlaylist]);
        if (rows2.length === 0) {
            return res.status(400).json({ error: 'La playlist no existe', message: 'La playlist no existe' });
        }

        // Verificar si la cancion esta en la playlist
        let enPlaylist = false;
        const [rows3] = await pool.query('SELECT * FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = ? AND ID_CANCION = ?', [idPlaylist, idCancion]);
        if (rows3.length > 0) {
            enPlaylist = true;
        }

        // Eliminar la cancion de la playlist
        if (!enPlaylist) {
            return res.status(400).json({ error: 'La cancion no esta en la playlist', message: 'La cancion no esta en la playlist' });
        }
        await pool.query('DELETE FROM PLAYLIST_CANCION WHERE ID_PLAYLIST = ? AND ID_CANCION = ?', [idPlaylist, idCancion]);
        res.json({ id: idCancion });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('DELETE /playlists/eliminarCancion?idCancion=' + req.query.idCancion + '&idPlaylist=' + req.query.idPlaylist);
});

module.exports = router;