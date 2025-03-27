import React, { useState, useEffect } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { RxUpdate } from 'react-icons/rx';
import { IoTrashOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';

const Crud = ({ darkMode }) => {
    const [song, setSong] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [photo, setPhoto] = useState(null);
    const [duration, setDuration] = useState(null);
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    const [songsList, setSongsList] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSong, setUpdateSong] = useState(null);
    const [newName, setNewName] = useState('');
    const [newArtist, setNewArtist] = useState('');
    const [newSong, setNewSong] = useState(null);
    const [newDuration, setNewDuration] = useState(null);
    const [newPhoto, setNewPhoto] = useState(null);


    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL + '/canciones')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error
                });
                return;
            }
            setSongsList(data);
        })
    }, []);

    const handleSongChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const audio = new Audio(e.target.result);
                audio.onloadedmetadata = () => {
                    setSong(e.target.result);
                    setDuration(audio.duration);
                    setShowDetailsForm(true);
                };
            };
            reader.readAsDataURL(file);
        }
    };

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

    const handleNewSongChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const audio = new Audio(e.target.result);
                audio.onloadedmetadata = () => {
                    setNewSong(e.target.result);
                    setNewDuration(audio.duration);
                };
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

    const handleAddSong = (e) => {
        e.preventDefault();
        if (song && title && artist && photo) {
            fetch(process.env.REACT_APP_API_URL + '/canciones/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: title,
                    cancion: song,
                    imagen: photo,
                    duracion: duration,
                    artista: artist
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.message);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error
                    });
                    return;
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Canción registrada',
                        text: 'La canción se ha registrado correctamente'
                    });
                    setSongsList([...songsList, data]);
                    setSong(null);
                    setTitle('');
                    setArtist('');
                    setPhoto(null);
                    setDuration(null);
                    setShowDetailsForm(false);
                }
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, completa todos los campos'
            });
        }
    };

    const handleDeleteSong = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(process.env.REACT_APP_API_URL + '/canciones/eliminar', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error:', data.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error
                        });
                        return;
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Canción eliminada',
                            text: 'La canción se ha eliminado correctamente'
                        });
                        const updatedList = songsList.filter(song => song.id !== id);
                        setSongsList(updatedList);
                    }
                });
            }
        });
    };

    const handleViewDetails = (song) => {
        setSelectedSong(song);
    };

    const handleCancelAddSong = () => {
        setSong(null);
        setTitle('');
        setArtist('');
        setPhoto(null);
        setDuration(null);
        setShowDetailsForm(false);
    };

    const handleCancelUpdate = () => {
        setUpdateSong(null);
        setNewName('');
        setNewArtist('');
        setNewSong(null);
        setNewPhoto(null);
        setIsUpdating(false);
    };

    const handleCloseDetails = () => {
        setSelectedSong(null);
    };

    const handleUpdateClick = (song) => {
        setUpdateSong(song);
        setNewName(song.nombre);
        setNewArtist(song.artista);
        setIsUpdating(true);
    };

    const handleUpdateSong = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (newName && newArtist) {
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
                    duracion: newDuration,
                    artista: newArtist
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.message);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error
                    });
                    return;
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Canción actualizada',
                        text: 'La canción se ha actualizado correctamente'
                    });
                    const updatedList = songsList.map(song => {
                        if (song.id === updateSong.id) {
                            return data;
                        }
                        return song;
                    });
                    setSongsList(updatedList);
                    setUpdateSong(null);
                    setNewName('');
                    setNewArtist('');
                    setNewSong(null);
                    setNewPhoto(null);
                    setIsUpdating(false);
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, completa todos los campos'
            });
        }
    };

    return (
        <div className={`w-full ${darkMode ? 'text-white bg-mainBackground' : 'text-gray-700 bg-white'}`} style={{ height: 'calc(100vh - 11.5rem)' }}>
            <h1 className="text-4xl font-semibold text-center mt-4 ml-4">Gestión de Canciones</h1>
            
            {!isUpdating && (
                <form onSubmit={handleAddSong} className="mt-8 mx-4">
                    {!showDetailsForm ? (
                        <>
                            <div className="mb-4">
                                <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Agrega una Canción</label>
                                <input
                                    type="file"
                                    accept=".mp3"
                                    onChange={handleSongChange}
                                    className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {showDetailsForm && (
                                <div>
                                    <div className="mb-4">
                                        <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Título</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Artista</label>
                                        <input
                                            type="text"
                                            value={artist}
                                            onChange={(e) => setArtist(e.target.value)}
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fotografía</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duración</label>
                                        <input
                                            type="text"
                                            value={duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : ''}
                                            readOnly
                                            className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={`w-full py-2 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                                    >
                                        Guardar Canción
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelAddSong}
                                        className={`w-full py-2 px-4 mt-2 rounded ${darkMode ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-700 text-white hover:bg-gray-800'}`}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </form>
            )}

            {isUpdating && (
                <div className={`mt-8 mx-4 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border rounded`}>
                    <h2 className="text-2xl font-semibold mb-4">Actualizar Canción</h2>
                    <form onSubmit={handleUpdateSong}>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Título</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Artista</label>
                            <input
                                type="text"
                                value={newArtist}
                                onChange={(e) => setNewArtist(e.target.value)}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cambiar Canción</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleNewSongChange}
                                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                            />
                        </div>
                        <div className="mb-4">
                            <label className={`block text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cambiar Fotografía</label>
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
                            Actualizar Canción
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

            {!showDetailsForm && !isUpdating && (
                <div className="mt-8 mx-4">
                    <h2 className="text-2xl font-semibold mb-4">Lista de Canciones</h2>
                    {songsList.length > 0 ? (
                        <table className={`min-w-full ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
                            <thead className="bg-gray-200">
                                <tr className={`w-full ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
                                    <th className="py-2 px-4 text-left">Título</th>
                                    <th className="py-2 px-4 text-left">Artista</th>
                                    <th className="py-2 px-4 text-left">Duración</th>
                                    <th className="py-2 px-4 text-left">Fotografía</th>
                                    <th className="py-2 px-4 text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {songsList.map(song => (
                                    <tr key={song.id}>
                                        <td className="py-2 px-4 ">{song.nombre}</td>
                                        <td className="py-2 px-4 ">{song.artista}</td>
                                        <td className="py-2 px-4 ">{song.duracion ? `${Math.floor(song.duracion / 60)}:${Math.floor(song.duracion % 60).toString().padStart(2, '0')}` : ''}</td>
                                        <td className="py-2 px-4 ">
                                            <img src={song.imagen} alt={song.nombre} className="w-16 h-16 object-cover" />
                                        </td>
                                        <td className="py-2 px-4">
                                            <button
                                                onClick={() => handleViewDetails(song)}
                                                className={`mr-2 py-1 px-3 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                                            >
                                                <MdInfoOutline size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateClick(song)}
                                                className={`mr-2 py-1 px-3 rounded ${darkMode ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-yellow-700 text-white hover:bg-yellow-800'}`}
                                            >
                                                <RxUpdate size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSong(song.id)}
                                                className={`py-1 px-3 rounded ${darkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-700 text-white hover:bg-red-800'}`}
                                            >
                                                <IoTrashOutline size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay canciones en la lista.</p>
                    )}
                </div>
            )}

            {selectedSong && (
                <div className={`fixed inset-0 ${darkMode ? 'bg-mainBackground' : 'bg-gray-900'} bg-opacity-75 flex justify-center items-center z-50`}>
                    <div className={`relative bg-${darkMode ? 'secondaryBackground' : 'white'} p-6 rounded-lg shadow-lg w-3/4 max-w-2xl`}>
                        <h2 className="text-2xl font-semibold mb-4">Detalles de la Canción</h2>
                        <button 
                            onClick={handleCloseDetails}
                            className={`absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white hover:bg-gray-700`}
                            style={{ fontSize: '1.5rem' }}
                        >
                            &times;
                        </button>
                        <div className="flex items-start mb-4">
                            <div className="w-1/3 mr-4">
                                <img src={selectedSong.imagen} alt="Foto de canción" className="w-full h-auto object-cover" />
                            </div>
                            <div className="w-2/3">
                                <div className="mb-4">
                                    <p className="font-medium">Nombre:</p>
                                    <p>{selectedSong.nombre}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="font-medium">Artista:</p>
                                    <p>{selectedSong.artista}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="font-medium">Duración:</p>
                                    <p>{selectedSong.duracion ? `${Math.floor(selectedSong.duracion / 60)}:${Math.floor(selectedSong.duracion % 60).toString().padStart(2, '0')}` : ''}</p>
                                </div>
                                <div className="mb-4">
                                    <audio controls className="w-full">
                                        <source src={selectedSong.cancion} type="audio/mpeg" />
                                        Tu navegador no soporta el elemento de audio.
                                    </audio>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Crud;