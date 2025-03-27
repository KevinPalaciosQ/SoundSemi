import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import Song from './Song';
import Swal from 'sweetalert2';

const Favorites = ({ darkMode, onSongSelect, playingSongIndex }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [songs, setSongs] = useState([]);
    const [likedSongs, setLikedSongs] = useState(JSON.parse(localStorage.getItem('likedSongs')) || []);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
        fetch(process.env.REACT_APP_API_URL + '/canciones/favoritas?idUsuario=' + user.id)
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
            setLikedSongs(data.map((song) => song.id));
        })
    }, []);

    useEffect(() => {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
        fetch(process.env.REACT_APP_API_URL + '/canciones/favoritas?idUsuario=' + user.id)
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

    return (
        <div className={`p-6 ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
            <div className="flex items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#645FFB] to-[#63E2FF] rounded-lg flex items-center justify-center mr-4">
                    <FaHeart className="w-12 h-12 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-2">Favoritos</h2>
                    <p className="text-sm text-gray-500">{songs.length} Canciones</p>
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
                    {songs.map((song, index) => (
                        <Song
                            key={index}
                            index={index}
                            song={song}
                            songs={songs}
                            likedSongs={likedSongs}
                            toggleLike={toggleLike}
                            darkMode={darkMode}
                            handleSongClick={onSongSelect}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Favorites;