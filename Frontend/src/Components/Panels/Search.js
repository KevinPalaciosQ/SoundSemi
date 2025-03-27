import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Song from './Song';

const Search = ({ darkMode, songs, onSongSelect, toggleLike, likedSongs }) => {

    return (
        <div className={`p-6 ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
            <h2 className="text-3xl font-bold mb-2">Resultados más relevantes</h2>
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

export default Search;
