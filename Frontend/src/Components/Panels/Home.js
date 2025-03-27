import React, { useState, useEffect } from 'react';
import { IoMdAdd, IoMdHeartEmpty, IoMdHeart } from 'react-icons/io';
import { FaPlus, FaWindowClose } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Home = ({ darkMode, setActivePanel, handleSongSelect }) => {
    const [greeting, setGreeting] = useState('');
    const [songs, setSongs] = useState([]);
    const [favsSongs, setFavsSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [songsMessage, setSongsMessage] = useState('');
    const [user, setUser] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState({});

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName') || 'Usuario';
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        setUser(storedUser);

        fetch(process.env.REACT_APP_API_URL + '/canciones')
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
            setSongs(data);
        })
        .catch(error => console.error(error));

        fetch(process.env.REACT_APP_API_URL + '/canciones/favoritas?idUsuario=' + storedUser.id)
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
            setFavsSongs(data);
        })
        .catch(error => console.error(error));

        fetch(process.env.REACT_APP_API_URL + '/playlists?idUsuario=' + storedUser.id)
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

        const updateGreeting = () => {
            const date = new Date();
            const hour = date.getHours();

            if (hour < 12) {
                setGreeting(`¡Buenos días, ${storedUserName}!`);
                setSongsMessage('Empieza tu día con canciones llenas de energía y optimismo:');
            } else if (hour < 19) {
                setGreeting(`¡Buenas tardes, ${storedUserName}!`);
                setSongsMessage('Disfruta de tu tarde con melodías relajantes y llenas de vida:');
            } else {
                setGreeting(`¡Buenas noches, ${storedUserName}!`);
                setSongsMessage('Relájate y disfruta de canciones perfectas para terminar el día:');
            }

            const nextUpdate = new Date();
            nextUpdate.setHours(hour < 12 ? 12 : hour < 19 ? 19 : 24, 0, 0, 0);
            setTimeout(updateGreeting, nextUpdate - date);
        };

        updateGreeting();
        return () => clearTimeout(updateGreeting);

    }, []);

    const handleSongFav = (id) => {
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
                setFavsSongs([...favsSongs, data]);
            } else {
                setFavsSongs(favsSongs.filter(fav => fav.id !== id));
            }

        })
        .catch(error => console.error(error));
    }

    const handleAddSongToPlaylist = (playlistId) => {
        fetch(process.env.REACT_APP_API_URL + '/playlists/agregarCancion?idPlaylist=' + playlistId + '&idCancion=' + selectedSong.id, {
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

    const handleAddToPlaylist = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setSelectedSong({});
        setIsModalVisible(false);
    };

    return (
        <div className={`w-full p-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} style={{ height: 'calc(100vh - 11.5rem)' }}>
            <div
                className=" relative w-full h-64 bg-cover bg-center flex items-center justify-center text-white"
                style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop")',
                    borderRadius: '.75rem'
                }}
            >
                <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
                <div className="relative text-center p-4">
                    <h1 className="text-4xl font-semibold mb-2">{greeting}</h1>
                    <p className="text-2xl">{songsMessage}</p>
                </div>
            </div>

            {/* Lista de playlists */}
            <h2 className="text-2xl font-semibold mt-6">Tus Playlists</h2>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-6`}>
                <div 
                    className={`flex items-center p-2 rounded-lg shadow-md cursor-pointer ${darkMode ? 'bg-secondaryBackground text-colorText hover:bg-hover' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActivePanel('NewPlayList')}
                >
                    <div className={`w-24 h-24 flex items-center justify-center rounded-lg mr-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                        <IoMdAdd className="text-3xl" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-1">Crear Playlist</h3>
                        <p className="text-sm">Agrega tu propia lista de canciones</p>
                    </div>
                </div>

                {playlists.map((playlist, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center p-2 rounded-lg shadow-md cursor-pointer ${darkMode ? 'bg-secondaryBackground text-colorText hover:bg-hover' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActivePanel('PlayList', playlist.nombre, playlist)}
                    >
                        <img src={playlist.portada} alt={playlist.nombre} className="w-24 h-24 object-cover rounded-lg mr-4" />
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-1">{playlist.nombre}</h3>
                            <p className={`text-sm text-gray-500 `}>{playlist.canciones.length} canciones</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lista de canciones */}
            <h2 className="text-2xl font-semibold mt-6">Canciones Recomendadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-6">
                {songs.map((song, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center p-2 rounded-lg shadow-md cursor-pointer ${darkMode ? 'bg-secondaryBackground text-colorText hover:bg-hover' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleSongSelect(song.cancion, index, songs)}
                    >
                        <img src={song.imagen} alt={song.nombre} className="w-24 h-24 object-cover rounded-lg mr-4" />
                        <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-1">{`${song.nombre}`}</h3>
                            <p className="text-sm">{song.artista}</p>
                        </div>
                        <div className="ml-auto">
                            <button 
                                className="p-2 rounded-full hover:bg-gray-400"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleSongFav(song.id);
                                }}
                            >
                                {favsSongs.find(fav => fav.id === song.id) ? <IoMdHeart className="text-xl text-red-500" /> : <IoMdHeartEmpty className="text-xl" />}
                            </button>
                            <button
                                className="p-2 rounded-full hover:bg-gray-400"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedSong(song);
                                    handleAddToPlaylist();
                                }}
                            >
                                <FaPlus className="text-xl" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
        </div>
    );
};

export default Home;
