import React, { useState, useEffect } from 'react';
import { FaHome, FaHeart } from 'react-icons/fa';
import { IoIosRadio } from 'react-icons/io'; 
import { SlEarphones } from 'react-icons/sl';
import { isDarkMode } from '../../Utils/DarkMode';
import Swal from 'sweetalert2';

const options = [
    { name: 'Inicio', icon: <FaHome className="text-xl text-white" />, bgColor: 'bg-green-500', panel: 'Home' },
    { name: 'Favoritos', icon: <FaHeart className="text-xl text-white" />, bgColor: 'bg-gradient-to-br from-[#645FFB] to-[#63E2FF]', panel: 'Favorites' },
    { name: 'Radio', icon: <IoIosRadio className="text-xl text-white" />, bgColor: 'bg-radio', panel: 'Radio' }
];

const Menu = ({ setActivePanel }) => {
    const [darkMode, setDarkMode] = useState(isDarkMode());
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
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

        const darkModeListener = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeListener.addEventListener('change', (e) => {
            setDarkMode(e.matches);
        });

        return () => {
            darkModeListener.removeEventListener('change', (e) => {
                setDarkMode(e.matches);
            });
        };
    }, []);

    return (
        <>
            <div className="mb-2">
                <h2 className="mb-4 flex items-center justify-center" style={{ fontSize: '1.7rem' }}>
                    <SlEarphones className="mr-2" />
                    <span className="font-bold">Sound</span>
                    <span className="font-light"> Stream</span>
                </h2>
                <div className="space-y-1">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`${darkMode ? 'bg-secondaryBackground hover:bg-hover' : 'bg-gray-200 hover:bg-gray-100'} p-2 rounded-lg flex items-center space-x-2 cursor-pointer`}
                            onClick={() => setActivePanel(option.panel)} // Cambia el panel acivo
                        >
                            <div className={`${option.bgColor} w-11 h-11 flex items-center justify-center rounded`}>
                                {option.icon}
                            </div>
                            <span className={`text-xl ${darkMode ? 'text-colorText' : 'text-gray-700'}`}>{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-colorText' : 'text-gray-700'}`}>Playlists</h3>
            <div className="space-y-1">
                {playlists.map((playlist, index) => (
                    <div 
                        key={index} 
                        className={`p-2 rounded-lg flex items-center space-x-2 cursor-pointer ${darkMode ? 'bg-secondaryBackground text-colorText hover:bg-hover' : 'bg-gray-200 text-gray-700 hover:bg-gray-100'} ${index === playlists.length - 1 ? 'mb-4' : ''}`}
                        onClick={() => setActivePanel('PlayList', playlist.nombre, playlist)} // Cambia el panel activo y establece el nombre de la playlist
                    >
                        <img
                            src={playlist.portada}
                            alt="Playlist"
                            className="w-11 h-11 object-cover rounded" />
                        <div>
                            <h4 className="text-base font-semibold">{playlist.nombre}</h4>
                            <p className={`text-sm text-gray-500 `}>{playlist.canciones.length} Canciones</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Menu;
