import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { isDarkMode } from '../../Utils/DarkMode';
import Swal from 'sweetalert2';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(isDarkMode()); // Estado para el modo oscuro

    const navigate = useNavigate(); // Hook para redireccionar

    useEffect(() => {
        // Actualiza el estado cuando cambian las preferencias del sistema
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // const user = email === 'user@sound-stream.com' && password === 'user';
        fetch(process.env.REACT_APP_API_URL + '/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo: email, password })
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
            } else {
                const admin = data.correo === 'admin@sound-stream.com';
                onLogin(true, data); // Llama a onLogin con el estado de autenticación y el usuario
                if (admin) {
                    navigate('/Admin');
                } else {
                    navigate('/User');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al iniciar sesión'
            });
        });
    };

    return (
        <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-mainBackground' : 'bg-background'}`}>
            <div className={`flex max-w-4xl shadow-md rounded-lg ${darkMode ? 'bg-secondaryBackground' : 'bg-white'}`}>
                {/* Formulario de login a la izquierda */}
                <div className="p-12 w-full max-w-md min-h-[500px] flex flex-col justify-center">
                    <h1 className={`text-3xl font-bold text-center mb-6 ${darkMode ? 'text-colorText' : 'text-text'}`}>
                        Inicia Sesión
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className={`block ${darkMode ? 'text-colorText' : 'text-gray-700'} mb-2`}>
                                Email:
                            </label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${darkMode ? 'bg-inputBackground text-colorText border-border' : ''}`}
                            />
                        </div>
                        <div className="mb-6 relative">
                            <label className={`block ${darkMode ? 'text-colorText' : 'text-gray-700'} mb-2`}>
                                Contraseña:
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} // Mostrar u ocultar contraseña
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className={`w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${darkMode ? 'bg-inputBackground text-colorText border-border' : ''}`}
                                />
                                <label
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)} // Alternar visibilidad de la contraseña
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                                </label>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            Iniciar Sesión
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className={` ${darkMode ? 'text-colorText' : 'text-gray-600'}`}>
                            ¿No tienes una cuenta? <Link to="/Signup" className="font-bold hover:underline">Regístrate aquí</Link>
                        </p>
                    </div>
                </div>

                {/* Imagen a la derecha */}
                <div className="hidden md:block">
                    <img 
                        src="https://cdn.dribbble.com/userupload/13158084/file/original-94b389fa3f7186b518c8ef2369081c32.png?resize=752x" 
                        alt="Login illustration"
                        className="w-100 h-full object-cover rounded-r-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
