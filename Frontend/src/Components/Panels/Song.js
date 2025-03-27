import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaPlus, FaWindowClose, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Song = ({ index, song, songs, likedSongs, toggleLike, darkMode, handleSongClick, playList }) => {
    const [playlists, setPlaylists] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL + '/playlists?idUsuario=' + JSON.parse(localStorage.getItem('user')).id)
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
            setPlaylists(data);
        })
        .catch(error => console.error(error));
    }, []);

    const handleAddSongToPlaylist = (playlistId) => {
        fetch(process.env.REACT_APP_API_URL + '/playlists/agregarCancion?idPlaylist=' + playlistId + '&idCancion=' + song.id, {
            method: 'POST'
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
            Swal.fire({
                icon: 'success',
                title: 'Canción agregada',
                text: 'La canción ha sido agregada a la playlist'
            })
            .then(() => {
                setIsModalVisible(false);
                window.location.reload();
            });
        })
        .catch(error => console.error(error));
    };

    const handleDelSongFromPlaylist = (playlistId) => {
        fetch(process.env.REACT_APP_API_URL + '/playlists/eliminarCancion?idPlaylist=' + playlistId + '&idCancion=' + song.id, {
            method: 'DELETE'
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
            Swal.fire({
                icon: 'success',
                title: 'Canción eliminada',
                text: 'La canción ha sido eliminada de la playlist'
            })
            .then(() => {
                setIsModalVisible(false);
                const selectedPlaylist = playList.nombre;
                localStorage.setItem('selectedPlaylist', selectedPlaylist);
                const newSongList = playList.canciones.filter(cancion => cancion.id !== song.id);
                localStorage.setItem('playList', JSON.stringify({ ...playList, canciones: newSongList }));
                window.location.reload();
            });
        })
        .catch(error => console.error(error));
    };

    const handleAddToPlaylist = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <tr
                className={`${darkMode ? 'bg-darkBackground text-colorText hover:bg-hover' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSongClick(song.cancion, index, songs)}
            >
                <td className="p-2 text-sm w-10">{index + 1}</td>
                <td className="p-2 text-sm flex items-center space-x-3">
                    <img src={song.imagen} alt={song.nombre} className="w-12 h-12 object-cover" />
                    <div>
                        <div>{song.nombre}</div>
                        <div className="text-gray-500">{song.artista}</div>
                    </div>
                </td>
                <td className="p-2 text-sm w-20 text-left">{`${Math.floor(song.duracion / 60)}:${Math.floor(song.duracion % 60).toString().padStart(2, '0')}`}</td>
                <td className="p-2 text-sm w-16 text-center">
                    <button onClick={(event) => { event.stopPropagation(); toggleLike(song.id); }}>
                        <FaHeart
                            className={`w-6 h-6 cursor-pointer ${likedSongs.includes(song.id) ? 'text-red-500' : 'text-gray-400'}`}
                        />
                    </button>
                </td>
                {!playList ? (
                    <td className="p-2 text-sm w-16 text-center relative" ref={dropdownRef}>
                        <button onClick={(event) => { event.stopPropagation(); handleAddToPlaylist(); }}>
                            <FaPlus className="w-6 h-6 text-gray-400 cursor-pointer" />
                        </button>
                    </td>
                ) : (
                    <td className="p-2 text-sm w-16 text-center relative" ref={dropdownRef}>
                        <button onClick={(event) => { event.stopPropagation(); handleDelSongFromPlaylist(playList.id); }}>
                            <FaTrash className="w-6 h-6 text-gray-400 cursor-pointer" />
                        </button>
                    </td>
                )}
            </tr>
            {isModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>
                    <div className={`relative rounded-lg shadow-lg w-80 p-4 ${darkMode ? 'bg-secondaryBackground text-colorText' : 'bg-white text-gray-700'}`}>
                        <h3 className="text-lg font-semibold mb-4">Selecciona una playlist</h3>
                        <ul>
                            {playlists.map(playlist => (
                                <li key={playlist.id} className="py-2">
                                    <button 
                                        className="w-full text-left"
                                        onClick={() => handleAddSongToPlaylist(playlist.id)}
                                    >
                                        {playlist.nombre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button className="absolute top-2 right-2 text-gray-500 dark:text-gray-300" onClick={handleCloseModal}> <FaWindowClose /> </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Song;
