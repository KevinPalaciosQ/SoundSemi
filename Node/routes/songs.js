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
        const [rows] = await pool.query('SELECT * FROM CANCION');
        const canciones = rows.map(cancion => {
            return {
                id: cancion.ID,
                nombre: cancion.NOMBRE,
                cancion: cancion.CANCION,
                imagen: cancion.IMAGEN,
                duracion: cancion.DURACION,
                artista: cancion.ARTISTA
            };
        });
        res.json(canciones);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Error en el servidor' });
    }
    console.log('GET /songs');
});

router.post('/registrar', async (req, res) => {
    try {
        const { nombre, cancion, imagen, duracion, artista } = req.body;
        // Validar los datos
        if (!nombre || !cancion || !imagen || !duracion || !artista) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Subir la imagen y la cancion a AWS S3
        const cancionBuffer = Buffer.from(cancion.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
        const imagenBuffer = Buffer.from(imagen.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        const paramsCancion = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Canciones/${nombre}-${Date.now()}.mp3`,
            Body: cancionBuffer,
            ContentType: 'audio/mp3',
        };

        const dataCancion = await s3.upload(paramsCancion).promise();
        const cancionUrl = dataCancion.Location;
        
        const paramsImagen = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Fotos/${nombre}-${Date.now()}.png`,
            Body: imagenBuffer,
            ContentType: 'image/png',
        };

        const dataImagen = await s3.upload(paramsImagen).promise();
        const imagenUrl = dataImagen.Location;

        // Insertar la cancion en la base de datos
        const query = "INSERT INTO CANCION (nombre, cancion, imagen, duracion, artista) VALUES (?, ?, ?, ?, ?)";
        const [result] = await pool.query(query, [nombre, cancionUrl, imagenUrl, duracion, artista]);
        res.json({ id: result.insertId, nombre, cancion: cancionUrl, imagen: imagenUrl, duracion, artista });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('POST /canciones/registrar');
});

router.put('/actualizar', async (req, res) => {
    try {
        const { id, nombre, cancion, imagen, duracion, artista } = req.body;
        // Validar los datos
        if (!id || !nombre || !artista) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la cancion exista
        const [rows] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La cancion no existe', message: 'La cancion no existe' });
        }

        // Eliminar la cancion anterior de AWS S3 y subir la nueva cancion si es necesario
        const oldCancion = decodeURIComponent(rows[0].CANCION);
        let nuevaCancion = oldCancion;
        let nuevaDuracion = rows[0].DURACION;
        if (cancion) {
            if (!duracion) {
                return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
            }
            nuevaDuracion = duracion;

            const key = oldCancion.split('.com/')[1];
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();

            const cancionBuffer = Buffer.from(cancion.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `Canciones/${nombre}-${Date.now()}.mp3`,
                Body: cancionBuffer,
                ContentType: 'audio/mp3',
            };

            const data = await s3.upload(params).promise();
            nuevaCancion = data.Location;
        }

        // Eliminar la foto anterior de AWS S3 y subir la nueva foto si es necesario
        const oldImagen = decodeURIComponent(rows[0].IMAGEN);
        let nuevaImagen = oldImagen;
        if (imagen) {
            const key = oldImagen.split('.com/')[1];
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();

            const imagenBuffer = Buffer.from(imagen.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `Fotos/${nombre}-${Date.now()}.png`,
                Body: imagenBuffer,
                ContentType: 'image/jpeg'
            };

            const data = await s3.upload(params).promise();
            nuevaImagen = data.Location;
        }

        // Actualizar la cancion
        const query = "UPDATE CANCION SET nombre = ?, cancion = ?, imagen = ?, duracion = ?, artista = ? WHERE id = ?";
        await pool.query(query, [nombre, nuevaCancion, nuevaImagen, nuevaDuracion, artista, id]);
        res.json({ id, nombre, cancion: nuevaCancion, imagen: nuevaImagen, duracion: nuevaDuracion, artista });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('PUT /canciones/actualizar');
});

router.delete('/eliminar', async (req, res) => {
    try {
        const { id } = req.body;
        // Validar los datos
        if (!id) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la cancion exista
        const [rows] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La cancion no existe', message: 'La cancion no existe' });
        }

        // Eliminar la cancion y la imagen de AWS S3
        const keyCancion = decodeURIComponent(rows[0].CANCION).split('.com/')[1];
        await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: keyCancion }).promise();

        const keyImagen = decodeURIComponent(rows[0].IMAGEN).split('.com/')[1];
        await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: keyImagen }).promise();

        // Eliminar la cancion de la base de datos
        await pool.query('DELETE FROM CANCION WHERE id = ?', [id]);
        res.json({ id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('DELETE /canciones/eliminar');
});

router.get('/favoritas', async (req, res) => {
    try {
        const id = req.query.idUsuario;
        // Validar los datos
        if (!id) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que el usuario exista
        const [rows] = await pool.query('SELECT * FROM USUARIO WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'El usuario no existe', message: 'El usuario no existe' });
        }
        // Obtener las canciones favoritas del usuario
        const [rows2] = await pool.query('SELECT * FROM CANCION WHERE ID IN (SELECT ID_CANCION FROM FAVORITO WHERE ID_USUARIO = ?)', [id]);

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
        res.json(canciones);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('GET /canciones/favoritas?idUsuario=' + req.query.idUsuario);
});

router.put('/favorita', async (req, res) => {
    try {
        const idCancion = req.query.idCancion;
        const idUsuario = req.query.idUsuario;
        // Validar los datos
        if (!idCancion || !idUsuario) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que la cancion y el usuario existan
        const [rows] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [idCancion]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'La cancion no existe', message: 'La cancion no existe' });
        }

        const [rows2] = await pool.query('SELECT * FROM USUARIO WHERE id = ?', [idUsuario]);
        if (rows2.length === 0) {
            return res.status(400).json({ error: 'El usuario no existe', message: 'El usuario no existe' });
        }

        // Verificar si la cancion ya es favorita
        let fav = false;
        const [rows3] = await pool.query('SELECT * FROM FAVORITO WHERE ID_USUARIO = ? AND ID_CANCION = ?', [idUsuario, idCancion]);
        if (rows3.length > 0) {
            fav = true;
        }

        // Agregar o eliminar la cancion de favoritos
        if (fav) {
            await pool.query('DELETE FROM FAVORITO WHERE ID_USUARIO = ? AND ID_CANCION = ?', [idUsuario, idCancion]);
        } else {
            await pool.query('INSERT INTO FAVORITO (ID_USUARIO, ID_CANCION) VALUES (?, ?)', [idUsuario, idCancion]);
        }

        // Obtener la cancion actualizada
        const [rows4] = await pool.query('SELECT * FROM CANCION WHERE id = ?', [idCancion]);
        const cancion = {
            id: rows4[0].ID,
            nombre: rows4[0].NOMBRE,
            cancion: rows4[0].CANCION,
            imagen: rows4[0].IMAGEN,
            duracion: rows4[0].DURACION,
            artista: rows4[0].ARTISTA,
            favorita: !fav
        };
        res.json(cancion);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('PUT /canciones/favorita?idCancion=' + req.query.idCancion + '&idUsuario=' + req.query.idUsuario);
});

router.get('/buscar', async (req, res) => {
    try {
        const parametro = req.query.parametro;
        // Validar los datos
        if (parametro) {
            // Obtener las canciones favoritas del usuario
            const [rows2] = await pool.query(`SELECT * FROM CANCION WHERE NOMBRE LIKE '%${parametro}%' OR ARTISTA LIKE '%${parametro}%' `);

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
            res.json(canciones);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('GET /canciones/buscar?cancion=' + req.query.cancion);
});

module.exports = router;