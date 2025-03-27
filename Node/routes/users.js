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
        const [rows] = await pool.query('SELECT * FROM USUARIO');
        // Eliminar la contraseña de los usuarios y minimizar los atributos
        const usuarios = rows.map(usuario => {
            return {
                id: usuario.ID,
                nombre: usuario.NOMBRE,
                apellido: usuario.APELLIDO,
                foto: usuario.FOTO,
                correo: usuario.CORREO,
                fecha_nacimiento: usuario.FECHA_NACIMIENTO
            };
        });
        res.json(usuarios);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Error en el servidor' });
    }
    console.log('GET /usuarios');
});

router.post('/registrar', async (req, res) => {
    try {
        const { nombre, apellido, foto, correo, password, fecha_nacimiento } = req.body;
        // Validar los datos
        if (!nombre || !apellido || !foto || !correo || !password || !fecha_nacimiento) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que el correo no exista
        const [rows] = await pool.query('SELECT id FROM USUARIO WHERE correo = ?', [correo]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya existe', message: 'El correo ya existe' });
        }
        // Subir la foto a AWS S3
        const fotoBuffer = Buffer.from(foto.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Fotos/${correo}-${Date.now()}.jpg`,
            Body: fotoBuffer,
            ContentType: 'image/jpeg'
        };

        const data = await s3.upload(params).promise();
        const fotoUrl = data.Location;
        // Insertar el usuario
        const query = "INSERT INTO USUARIO (nombre, apellido, foto, correo, password, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await pool.query(query, [nombre, apellido, fotoUrl, correo, password, fecha_nacimiento]);
        res.json({ id: result.insertId, nombre, apellido, foto: fotoUrl, correo, fecha_nacimiento });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('POST /usuarios/registrar');
});

router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        // Validar los datos
        if (!correo || !password) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que el correo exista
        const [rows] = await pool.query('SELECT * FROM USUARIO WHERE correo = ? AND password = ?', [correo, password]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos', message: 'Correo o contraseña incorrectos' });
        }
        res.json({ id: rows[0].ID, nombre: rows[0].NOMBRE, apellido: rows[0].APELLIDO, foto: rows[0].FOTO, correo: rows[0].CORREO, fecha_nacimiento: rows[0].FECHA_NACIMIENTO });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('POST /usuarios/login');
});

router.put('/actualizar', async (req, res) => {
    try {
        const { id, nombre, apellido, foto, password, fecha_nacimiento, actualPassword } = req.body;
        // Validar los datos
        if (!id || !nombre || !apellido || !fecha_nacimiento || !actualPassword) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'Datos incompletos' });
        }
        // Verificar que el usuario exista y que la contraseña sea correcta
        const [rows] = await pool.query('SELECT * FROM USUARIO WHERE id = ? AND password = ?', [id, actualPassword]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado o contraseña incorrecta', message: 'Usuario no encontrado o contraseña incorrecta' });
        }
        const correo = rows[0].CORREO;

        // Eliminar la foto anterior de AWS S3
        const oldFoto = decodeURIComponent(rows[0].FOTO);
        let nuevaFoto = oldFoto;
        if (foto) {
            const key = oldFoto.split('.com/')[1];
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }).promise();

            // Subir la foto a AWS S3
            const fotoBuffer = Buffer.from(foto.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `Fotos/${correo}-${Date.now()}.jpg`,
                Body: fotoBuffer,
                ContentType: 'image/jpeg'
            };

            const data = await s3.upload(params).promise();
            nuevaFoto = data.Location;
        }

        // Actualizar el usuario
        let pass;
        !password ? pass = actualPassword : pass = password;

        const query = "UPDATE USUARIO SET nombre = ?, apellido = ?, foto = ?, password = ?, fecha_nacimiento = ? WHERE id = ?";
        await pool.query(query, [nombre, apellido, nuevaFoto, pass, fecha_nacimiento, id]);
        res.json({ id, nombre, apellido, foto: nuevaFoto, correo, fecha_nacimiento });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor', message: error.message });
    }
    console.log('PUT /usuarios/actualizar');
});

module.exports = router;