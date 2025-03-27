import React from 'react';
import Menu from '../../Components/Menu/Menu';
import Player from '../../Components/Player/Player';
import '../../Utils/Scroll.css';
import '../../Utils/Normalize.css';

const AdminPanel = () => {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1 overflow-hidden">
                <div className="bg-gray-200 p-6 text-gray-700 overflow-y-auto custom-scrollbar" style={{ width: '20rem', height: 'calc(100vh - 5.5rem)'}}>
                    <Menu />
                <h1>menuadmin</h1>
                </div>
                <div className="flex-1 bg-background p-4 text-gray-700 overflow-y-auto">
                    {/* Contenido del panel principal */}
                </div>
            </div>
            <div className="bg-gray-300 p-4 text-gray-700 fixed bottom-0 w-full" style={{ height: '5.5rem' }}>
                <div className="flex items-center justify-between mb-2">
                    <Player />
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
