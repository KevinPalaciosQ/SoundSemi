import React, { useState, useEffect } from 'react';
import MenuAdmin from '../../Components/Menu/MenuAdmin';
import Player from '../../Components/Player/Player';
import Crud from '../../Components/Crud/Crud';
import TopBar from '../../Components/TopBar/TopBar';
import Home from '../../Components/Panels/Home';
import Favorites from '../../Components/Panels/Favorites';
import Radio from "../../Components/Panels/Radio";
import NewPlayList from "../../Components/Panels/NewPlayList";
import PlayList from '../../Components/Panels/PlayList';
import ProfilePanel from '../../Components/Panels/ProfilePanel';
import Search from '../../Components/Panels/Search';
import '../../Utils/Scroll.css';
import '../../Utils/Normalize.css';
import { isDarkMode } from '../../Utils/DarkMode';
import Swal from 'sweetalert2';

const Admin = ({ userName }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [likedSongs, setLikedSongs] = useState(JSON.parse(localStorage.getItem('likedSongs')) || []);

    const [darkMode, setDarkMode] = useState(isDarkMode());
    const [activePanel, setActivePanel] = useState(() => {
        return localStorage.getItem('activePanel') || 'Home';
    });
    const [previousPanel, setPreviousPanel] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState(localStorage.getItem('selectedPlaylist') || '');
    const [playList, setPlayList] = useState(JSON.parse(localStorage.getItem('playList')) || {});
    const [currentSong, setCurrentSong] = useState(localStorage.getItem('currentSong') || null);
    const [songList, setSongList] = useState(JSON.parse(localStorage.getItem('songList')) || []);
    const [playingSongIndex, setPlayingSongIndex] = useState(() => {
        return parseInt(localStorage.getItem('playingSongIndex'), 10) || 0;
    });
    const [searchActive, setSearchActive] = useState(false);
    const [search, setSearch] = useState('');

    const handleSearchValue = (query) => {
        setSearch(query);
        console.log('Valor de búsqueda:', search);
        search_(query);
    };

    const [songs, setSongs] = useState([]);

    useEffect(() => {
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

    const search_ = (query) => {
        fetch(`${process.env.REACT_APP_API_URL}/canciones/buscar?parametro=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(query)
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
            setLikedSongs(data.map((song) => song.id));
        })
        .catch(error => console.error(error));
    };

    const handlePanelChange = (panel, playlistName = '', playlist = {}) => {
        if (panel === 'ProfilePanel') {
            setPreviousPanel(activePanel);
        }
        setActivePanel(panel);
        localStorage.setItem('activePanel', panel);
        if (panel === 'PlayList') {
            setSelectedPlaylist(playlistName);
            setPlayList(playlist);
            localStorage.setItem('selectedPlaylist', playlistName);
            localStorage.setItem('playList', JSON.stringify(playlist));
        }
    };

    const handleSongSelect = (file, index, songList) => {
        setCurrentSong(file);
        setPlayingSongIndex(index);
        setSongList(songList);
        localStorage.setItem('currentSong', file);
        localStorage.setItem('playingSongIndex', index);
        localStorage.setItem('songList', JSON.stringify(songList));
    };

    const handleSongEnd = () => {
        const nextIndex = (playingSongIndex + 1) % songList.length;
        setPlayingSongIndex(nextIndex);
        setCurrentSong(songList[nextIndex].cancion);
        localStorage.setItem('playingSongIndex', nextIndex);
        localStorage.setItem('currentSong', songList[nextIndex].cancion);
    };

    const handleBack = () => {
        const previousIndex = playingSongIndex === 0 ? songList.length - 1 : playingSongIndex - 1;
        setPlayingSongIndex(previousIndex);
        setCurrentSong(songList[previousIndex].cancion);
        localStorage.setItem('playingSongIndex', previousIndex);
        localStorage.setItem('currentSong', songList[previousIndex].cancion);
    };

    // Mostrar el panel desde el que se llama al perfil
    const onCloseProfilePanel = () => {
        console.log('Cerrando panel de perfil...');
        setActivePanel(previousPanel || 'Home');
    };

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
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-white text-gray-700'}`}>
            <TopBar darkMode={darkMode} userName={userName} setActivePanel={handlePanelChange} setSearchActive={setSearchActive} onSearchChange={handleSearchValue} />
            <div className="flex flex-1 overflow-hidden">
                <div className={`p-6 ${darkMode ? 'bg-secondaryBackground text-colorText' : 'bg-gray-200 text-gray-700'} overflow-y-auto custom-scrollbar`} style={{ width: '20rem', height: 'calc(100vh - 5.5rem)'}}>
                    <MenuAdmin setActivePanel={handlePanelChange} />
                </div>
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-mainBackground text-colorText' : 'bg-background text-gray-700'}`} style={{height: 'calc(100vh - 10.5rem)', marginTop: '5rem'}}>
                    {searchActive && <Search darkMode={darkMode} songs={songs} onSongSelect={handleSongSelect} toggleLike={toggleLike} likedSongs={likedSongs} />}
                    {!searchActive && activePanel === 'Home' && <Home darkMode={darkMode} setActivePanel={handlePanelChange} handleSongSelect={handleSongSelect} />}
                    {!searchActive && activePanel === 'Favorites' && <Favorites darkMode={darkMode} onSongSelect={handleSongSelect} playingSongIndex={playingSongIndex} />}
                    {!searchActive && activePanel === 'NewPlayList' && <NewPlayList darkMode={darkMode} setActivePanel={handlePanelChange} />}
                    {!searchActive && activePanel === 'Radio' && <Radio darkMode={darkMode} onSongSelect={handleSongSelect} playingSongIndex={playingSongIndex} />}
                    {!searchActive && activePanel === 'PlayList' && <PlayList key={playList.id} darkMode={darkMode} playListName={selectedPlaylist} playList={playList} setActivePanel={handlePanelChange} onSongSelect={handleSongSelect} />}
                    {!searchActive && activePanel === 'Crud' && <Crud darkMode={darkMode} />}
                    {!searchActive && activePanel === 'ProfilePanel' && <ProfilePanel onClose={onCloseProfilePanel} onSave={onCloseProfilePanel} />}
                </div>
            </div>
            <div className={`fixed bottom-0 w-full p-4 ${darkMode ? 'bg-secondaryBackground text-colorText' : 'bg-gray-300 text-gray-700'}`} style={{ height: '5.5rem' }}>
                <div className="flex items-center justify-between mb-2">
                    <Player rute={currentSong} onSongEnd={handleSongEnd} onBackward={handleBack} />
                </div>
            </div>
        </div>
    );
};

export default Admin;
