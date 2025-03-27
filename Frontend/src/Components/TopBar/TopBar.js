import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";

const TopBar = ({ darkMode, userName, setActivePanel, setSearchActive, onSearchChange }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [user, setUser] = useState({foto: require('../../Assets/img/usuario.png')});
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('isAuthenticated');  
        localStorage.removeItem('userName');
        localStorage.removeItem('profilePic');
        localStorage.removeItem('playingSongIndex');  // Eliminar playingSongIndex del localStorage
        localStorage.removeItem('currentSong');       // Eliminar currentSong del localStorage
        localStorage.removeItem('songList');          // Eliminar songList del localStorage
        navigate('/'); 
    };

    const EditProfile = () => {
        console.log('Redirigiendo a la edición de Perfil...');
        setActivePanel('ProfilePanel');
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.trim();
        onSearchChange(query);
        setSearchActive(query.length > 0);
    };

    useEffect(() => {
        const localUser = localStorage.getItem('user');
        if (localUser) {
            setUser(JSON.parse(localUser));
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div 
            className={`z-50 fixed top-0 right-0 p-4 flex items-center ${darkMode ? 'bg-inputBackground text-white' : 'bg-gray-200 text-gray-800'}`} 
            style={{ height: '5rem', width: 'calc(100% - 20rem)' }}
        >
            <div className="flex items-center">
                <div className="relative mx-1 flex-1 max-w-xs">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="¿Qué quieres reproducir?" 
                        className={`h-11 w-96 pl-10 py-2 border rounded-lg outline-none ${darkMode ? 'bg-inputBackground text-white border-gray-700' : 'bg-white border-gray-300'}`}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div 
                className={`relative flex items-center justify-end bg-purple-600 rounded-full px-3 py-1 ml-auto cursor-pointer text-white`}
                onClick={toggleDropdown}
                ref={dropdownRef}
            >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                        src={user.foto}
                        alt="User Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <span className="ml-2">{userName}</span>
                <IoIosArrowDown className="ml-2 text-xl" />

                {dropdownVisible && (
                    <div className={`absolute top-full right-0 mt-2 rounded-lg shadow-lg w-48 ${darkMode ? 'bg-inputBackground text-white border-gray-100' : 'bg-white text-gray-800 border-gray-300'}`}>
                        {userName !== 'Admin' && (
                            <p className={`px-4 py-2 cursor-pointer ${darkMode ? 'hover:bg-secondaryBackground' : 'hover:bg-gray-100'}`} onClick={EditProfile}>Editar Perfil</p>
                        )}
                        <p className={`px-4 py-2 cursor-pointer ${darkMode ? 'hover:bg-secondaryBackground' : 'hover:bg-gray-100'}`} onClick={handleLogout}>Cerrar Sesión</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopBar;
