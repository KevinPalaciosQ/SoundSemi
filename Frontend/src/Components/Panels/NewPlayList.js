import React, { useState } from 'react';
import Swal from 'sweetalert2';

const NewPlayList = ({ darkMode, setActivePanel }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    const [name, setName] = useState('');
    const [description, setDesc] = useState('');
    const [photo, setPhoto] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSong, setUpdateSong] = useState(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSong, setNewSong] = useState(null);
    const [newPhoto, setNewPhoto] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNewPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setNewPhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPlayList = (e) => {
        e.preventDefault();
        if (name && photo) {
            fetch(process.env.REACT_APP_API_URL + '/playlists/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: name,
                    descripcion: description,
                    portada: photo,
                    id_usuario: user.id

                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.message);
                    Swal.fire({
                        icon: 'error',
                        name: 'Error',
                        text: data.error
                    });
                    return;
                } else {
                    Swal.fire({
                        icon: 'success',
                        name: 'Playlist creada',
                        text: 'La playlist se ha creado correctamente'
                    })
                    .then((result) => {
                        if (result.isConfirmed) {     
                            setName('');
                            setDesc('');
                            setPhoto(null);

                            setActivePanel('Home');
                            window.location.reload();
                        }
                    });
                }
            })
        } else {
            Swal.fire({
                icon: 'error',
                name: 'Error',
                text: 'Por favor, completa todos los campos'
            });
        }
    };

    const handleCancelAddPlayList = () => {
        setName('');
        setDesc('');
        setPhoto(null);

        setActivePanel('Home');
    };

    const handleCancelUpdate = () => {
        setUpdateSong(null);
        setNewName('');
        setNewDesc('');
        setNewSong(null);
        setNewPhoto(null);
        setIsUpdating(false);
    };

    const handleUpdatePlayList = (e) => {
        e.preventDefault();
        if (newName && newDesc) {
            fetch(process.env.REACT_APP_API_URL + '/canciones/actualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: updateSong.id,
                    nombre: newName,
                    cancion: newSong,
                    imagen: newPhoto,
                    descripcion: newDesc
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.message);
                    Swal.fire({
                        icon: 'error',
                        name: 'Error',
                        text: data.error
                    });
                    return;
                } else {
                    Swal.fire({
                        icon: 'success',
                        name: 'Canción actualizada',
                        text: 'La canción se ha actualizado correctamente'
                    });
                    setUpdateSong(null);
                    setNewName('');
                    setNewDesc('');
                    setNewSong(null);
                    setNewPhoto(null);
                    setIsUpdating(false);
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                name: 'Error',
                text: 'Por favor, completa todos los campos'
            });
        }
    };

    return (
        <div className={`w-full ${darkMode ? 'text-white bg-mainBackground' : 'text-gray-700 bg-white'}`} style={{ height: 'calc(100vh - 11.5rem)' }}>
            <h1 className="text-4xl font-semibold text-center mt-4 ml-4">Creación de Playlist</h1>
            
            {!isUpdating && (
                <form onSubmit={handleAddPlayList} className="mt-8 mx-4">
                    <div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripcion</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDesc(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Portada</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                        >
                            Guardar Playlist
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelAddPlayList}
                            className={`w-full py-2 px-4 mt-2 rounded ${darkMode ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-700 text-white hover:bg-gray-800'}`}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {isUpdating && (
                <div className={`mt-8 mx-4 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border rounded`}>
                    <h2 className="text-2xl font-semibold mb-4">Actualizar Playlist</h2>
                    <form onSubmit={handleUpdatePlayList}>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
                            <input
                                type="text"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cambiar Portada</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleNewPhotoChange}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                        >
                            Actualizar Playlist
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelUpdate}
                            className={`w-full py-2 px-4 mt-2 rounded ${darkMode ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-700 text-white hover:bg-gray-800'}`}
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NewPlayList;