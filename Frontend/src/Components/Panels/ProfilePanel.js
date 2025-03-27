import React, { useState, useEffect } from 'react';

// const ProfilePanel = ({ userName, userLastName, userEmail, onClose, onSave }) => {
const ProfilePanel = ({onClose, onSave}) => {
    const [isEditing, setIsEditing] = useState(false);
    // const [newUserName, setNewUserName] = useState(userName);
    // const [newUserLastName, setNewUserLastName] = useState(userLastName);
    // const [newUserEmail, setNewUserEmail] = useState(userEmail);
    const [user, setUser] = useState({});
    const [userId, setUserId] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserDoB, setNewUserDoB] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(require('../../Assets/img/usuario.png'));
    const [newProfilePicture, setNewProfilePicture] = useState('');

    useEffect(() => {
        let storedUser = localStorage.getItem('user');
        if (storedUser) {
            storedUser = JSON.parse(storedUser);
            setUserId(storedUser.id);
            setUser(storedUser);
            setNewUserName(storedUser.nombre);
            setNewUserLastName(storedUser.apellido);
            setNewUserEmail(storedUser.correo);
            setProfilePicture(storedUser.foto);
            setNewUserDoB(new Date(storedUser.fecha_nacimiento).toISOString().split('T')[0]);
        }
    }, []);

    const handleSave = () => {
        onSave(userId, newUserName, newUserLastName, newProfilePicture, newUserPassword, newUserDoB, password);
        setIsEditing(false);
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicture(e.target.result);
                setNewProfilePicture(e.target.result);
            }
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (date) => {
        const localDate = new Date(date);
        localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return localDate.toLocaleDateString('es-ES', options);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl mb-4">Mi Perfil</h2>
                <div className="flex flex-col items-center">
                    <label className="relative cursor-pointer">
                        <img 
                            src={profilePicture} 
                            alt="User Avatar" 
                            className="w-24 h-24 rounded-full mb-4 object-cover"
                        />
                        {isEditing && (
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={handleProfilePictureChange}
                            />
                        )}
                    </label>
                    {!isEditing ? (
                        <>
                            <p className="text-lg font-semibold">{newUserName} {newUserLastName}</p>
                            <p className="text-sm">{newUserEmail}</p>
                            <p className="text-sm mt-2">{formatDate(user.fecha_nacimiento)}</p>
                            {user.nombre !== 'Admin' ? (
                                <button 
                                onClick={() => setIsEditing(true)} 
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Editar
                            </button>
                            ) : (<> </>)}
                        </>
                    ) : (
                        <>
                            <input 
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Nuevo nombre"
                            />
                            <input 
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={newUserLastName}
                                onChange={(e) => setNewUserLastName(e.target.value)}
                                placeholder="Nuevo apellido"
                            />
                            {/* Correo no editable */}
                            <input 
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="Nuevo correo"
                                disabled
                            />
                            <input 
                                type="date"
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={newUserDoB}
                                onChange={(e) => setNewUserDoB(e.target.value)}
                                placeholder="Fecha de nacimiento"
                            />
                            <input 
                                type="password"
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                placeholder="Nueva contraseña"
                            />
                            <input 
                                type="password"
                                className="border border-gray-600 rounded p-2 mt-2 bg-gray-700 text-white w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña para confirmar"
                            />
                            <button 
                                onClick={handleSave} 
                                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                Guardar
                            </button>
                        </>
                    )}
                    <button 
                        onClick={onClose} 
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;

