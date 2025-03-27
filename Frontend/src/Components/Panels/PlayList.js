import React, { useState, useEffect } from 'react';
import Song from './Song';
import Swal from 'sweetalert2';

const PlayList = ({ darkMode, playListName, playList, setActivePanel, onSongSelect }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    const [selectedPlayList, setSelectedPlayList] = useState(playList);
    const [likedSongs, setLikedSongs] = useState(JSON.parse(localStorage.getItem('likedSongs')) || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlayListName, setNewPlayListName] = useState(playListName);
    const [newDescription, setNewDescription] = useState(playList.descripcion);
    const [coverImage, setCoverImage] = useState(playList.portada);

    useEffect(() => {
        localStorage.setItem('selectedPlaylist', selectedPlayList.nombre);
        localStorage.setItem('playList', JSON.stringify(selectedPlayList));
    }, [selectedPlayList]);

    useEffect(() => {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    }, [likedSongs]);

    const toggleLike = (id) => {
        fetch(process.env.REACT_APP_API_URL + '/canciones/favorita?idCancion=' + id + '&idUsuario=' + user.id, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error
                });
                return;
            }
            // Agregar o quitar la canción de la lista de favoritos
            if (data.favorita) {
                setLikedSongs([...likedSongs, id]);
            } else {
                setLikedSongs(likedSongs.filter(songId => songId !== id));
            }

        })
        .catch(error => console.error(error));
    }

    const handleTitleClick = () => {
        setIsModalOpen(true);
    };

    const handleEliminar = () => {
        setIsModalOpen(false);
        Swal.fire({
            title: '¿Desea eliminar la Playlist?',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(process.env.REACT_APP_API_URL + '/playlists/eliminar', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: selectedPlayList.id })
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        console.log(data.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Playlist eliminada',
                            text: 'La Playlist ha sido eliminada correctamente'
                        })
                        .then(() => {
                            setActivePanel('Home');
                            window.location.reload();
                        });
                    }
                });
            }
        });
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        Swal.fire({
            title: '¿Desea actualizar la Playlist?',
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(process.env.REACT_APP_API_URL + '/playlists/actualizar', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: selectedPlayList.id,
                        nombre: newPlayListName,
                        descripcion: newDescription,
                        portada: null
                    })
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        console.log(data.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Playlist actualizada',
                            text: 'La Playlist ha sido actualizada correctamente'
                        })
                        .then(() => {
                            setSelectedPlayList({ ...selectedPlayList, nombre: newPlayListName, descripcion: newDescription });
                            setNewPlayListName(newPlayListName);
                            setNewDescription(newDescription);
                            window.location.reload();
                        });
                    }
                });
            }
        });
    };

    const handleCancel = () => {
        setNewPlayListName(selectedPlayList.nombre);
        setNewDescription(selectedPlayList.descripcion);
        setIsModalOpen(false);
    };

    const handleCoverImageClick = () => {
        Swal.fire({
            title: '¿Desea cambiar la portada de la Playlist?',
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('coverImageInput').click();
            }
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                fetch(process.env.REACT_APP_API_URL + '/playlists/actualizar', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: selectedPlayList.id,
                        nombre: selectedPlayList.nombre,
                        descripcion: selectedPlayList.descripcion,
                        portada: e.target.result
                    })
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        console.log(data.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Portada actualizada',
                            text: 'La portada de la Playlist ha sido actualizada correctamente'
                        })
                        .then(() => {
                            setCoverImage(e.target.result);
                            setSelectedPlayList({ ...selectedPlayList, portada: e.target.result });
                            window.location.reload();
                        });
                    }
                })
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className={`p-6 ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
            <div className="flex items-center mb-6">
                <img
                    src={coverImage}
                    alt="Playlist Cover"
                    className="w-24 h-24 object-cover rounded-lg mr-4 cursor-pointer"
                    onClick={handleCoverImageClick}
                />
                <input
                    type="file"
                    id="coverImageInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
                <div>
                    <h2 onClick={handleTitleClick} className="text-3xl font-bold mb-2 cursor-pointer">{newPlayListName}</h2>
                    <p className="text-sm text-gray-500">{selectedPlayList.descripcion}</p>
                    <p className="text-sm text-gray-500">{selectedPlayList.canciones ? selectedPlayList.canciones.length : 0} canciones</p>
                </div>
            </div>
            <table className={`min-w-full ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
                <thead>
                    <tr className={`w-full ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
                        <th className="p-2 text-left text-sm w-10">No.</th>
                        <th className="p-2 text-left text-sm">Título</th>
                        <th className="p-2 text-left text-sm w-20">Duración</th>
                        <th className="p-2 text-left text-sm w-16"></th>
                        <th className="p-2 text-left text-sm w-16"></th>
                    </tr>
                </thead>
                <tbody>
                    {selectedPlayList.canciones ? selectedPlayList.canciones.map((song, index) => (
                        <Song
                            key={index}
                            index={index}
                            song={song}
                            songs={selectedPlayList.canciones}
                            likedSongs={likedSongs}
                            toggleLike={toggleLike}
                            darkMode={darkMode}
                            handleSongClick={onSongSelect}
                            playList={selectedPlayList}
                        />
                    )) : null}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`bg-${darkMode ? 'mainBackground' : 'white'} p-6 rounded-lg shadow-lg w-96`}>
                        <h3 className="text-xl mb-4">Editar el nombre de la Playlist</h3>
                        <input
                            type="text"
                            value={newPlayListName}
                            onChange={(e) => setNewPlayListName(e.target.value)}
                            className={`w-full p-2 mb-4 outline-none ${darkMode ? 'bg-inputBackground text-colorText' : 'bg-gray-100 text-gray-700'} rounded-lg`}
                        />
                        <h3 className="text-xl mb-4">Editar la descripción de la Playlist</h3>
                        <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className={`w-full p-2 mb-4 outline-none ${darkMode ? 'bg-inputBackground text-colorText' : 'bg-gray-100 text-gray-700'} rounded-lg`}
                        />
                        <div className="flex justify-end space-x-3">
                            <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400">Cancelar</button>
                            <button onClick={handleEliminar} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400">Eliminar</button>
                            <button onClick={handleConfirm} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark">Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayList;
