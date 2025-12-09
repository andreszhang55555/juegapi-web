// js/auth.js

import { auth, db } from './firebase-init.js'; // <-- Importamos instancias de init
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged, // <-- Importamos onAuthStateChanged para la UI
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc // <-- Importamos getDoc para el login
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"; 


// 2. Referencias del DOM
const registroForm = document.getElementById("registroForm");
const registroMensaje = document.getElementById("registroMensaje");
const authLinks = document.getElementById('auth-links');
const userProfile = document.getElementById('user-profile');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById("loginForm"); // <-- Referencia al formulario del login
const loginMensaje = document.getElementById("loginMensaje"); // <-- Referencia al mensaje de error/éxito


// --- FUNCIÓN DE REGISTRO (Corregida para usar handleRegistration) ---
function handleRegistration(email, password, displayName, role) { // Añadir displayName
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Opcional: Actualizar el nombre de usuario inmediatamente (requiere import 'updateProfile')
            /* updateProfile(user, { displayName: displayName }); */ 
            
            // 1. Guardar el rol en Firestore
            const userDocRef = doc(collection(db, "users"), user.uid);
            
            return setDoc(userDocRef, {
                email: user.email,
                role: role, 
                displayName: displayName, // Guardamos el nombre en Firestore
                createdAt: new Date()
            });
        })
        .then(() => {
            registroMensaje.textContent = "Registro exitoso. Redirigiendo...";
            registroMensaje.style.color = "green";
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        })
        .catch((error) => {
            console.error("Error de registro:", error.message);
            registroMensaje.textContent = `Error: ${error.message}`;
            registroMensaje.style.color = "red";
        });
}

// 3. Manejo del Evento Submit del Registro
if (registroForm) {
    registroForm.addEventListener("submit", function (event) {
        event.preventDefault(); 

        const correo = document.getElementById("correo").value;
        const password = document.getElementById("password").value;
        const rol = document.getElementById("rol").value; // Usar el campo del HTML
        const displayName = document.getElementById("displayName").value;

        // Validación simple de Contraseña (si aún la necesitas)
        // if (password !== confirmarPassword) { /* ... */ }

        // Llamar a la función principal de registro con el rol
        handleRegistration(correo, password, displayName, rol); 
    });
}


// --- LÓGICA DE LOGIN (Usando signInWithEmailAndPassword importado) ---

// Función que maneja el envío del formulario de login
// La función DEBE estar definida en auth.js (o donde se importe)
function handleLogin(email, password, roleSeleccionado) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // 1. Consultar el rol del usuario en Firestore
            const userDocRef = doc(db, "users", user.uid);
            return getDoc(userDocRef);
        })
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const userRoleDB = docSnapshot.data().role;
                
                // 2. Comparar el rol de la DB con el rol seleccionado
                if (userRoleDB === roleSeleccionado) {
                    // Login exitoso
                    localStorage.setItem('userRole', userRoleDB); 
                    window.location.href = 'index.html'; 
                    
                } else {
                    // El rol no coincide. Forzar cierre de sesión y error.
                    auth.signOut();
                    throw new Error("El rol seleccionado no coincide con su cuenta. Intente de nuevo con el rol correcto.");
                }
            } else {
                // Usuario autenticado en Auth, pero sin datos de rol en Firestore.
                auth.signOut(); 
                throw new Error("Error: Datos de rol no encontrados en la base de datos.");
            }
        })
        .catch((error) => {
            console.error("Error de login:", error.code, error.message);
            
            let displayError = "Error al iniciar sesión. Verifique sus credenciales.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                displayError = "Correo o contraseña incorrectos.";
            } else if (error.message.includes("El rol seleccionado no coincide")) {
                displayError = error.message;
            }

            // Mostrar el error en la interfaz de usuario
            loginMensaje.textContent = displayError;
            loginMensaje.style.color = "red";
        });
}


// --- LÓGICA DE SESIÓN Y UI ---

// Función para actualizar la UI (updateUI es correcta)
function updateUI(user) {
    // ... (Tu función updateUI es correcta y usa onAuthStateChanged)
    if (user) {
        authLinks.classList.add('hidden');
        userProfile.classList.remove('hidden');
        // Usa displayName de Auth si se actualizó, sino de Firestore/Email
        const userName = user.displayName || user.email.split('@')[0]; 
        usernameDisplay.textContent = userName;
        
    } else {
        userProfile.classList.add('hidden');
        authLinks.classList.remove('hidden');
    }
}

// Configuración del Listener de Estado de Autenticación
onAuthStateChanged(auth, updateUI); // <-- Usar onAuthStateChanged importado

// Función para cerrar la sesión (handleLogout es correcta)
function handleLogout() {
    auth.signOut()
        .then(() => {
            alert("Sesión cerrada correctamente.");
            window.location.href = 'index.html'; 
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
}

// Conectar el botón de logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}

// OTRAS FUNCIONES:
// El manejo de los formularios de login (si tienes uno) debe llamar a handleLogin(email, password, rol).
// js/auth.js (Continuación)

// 3A. Manejo del Evento Submit del Login
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Detener el envío por defecto del formulario

        // Obtener los valores de los inputs del formulario de LOGIN
        const correo = document.getElementById("login_correo").value;
        const password = document.getElementById("login_password").value;
        const rol = document.getElementById("login_rol").value;

        // Limpiar mensajes anteriores
        loginMensaje.textContent = "";

        if (!correo || !password || !rol) {
            loginMensaje.textContent = "Por favor, complete todos los campos y seleccione un rol.";
            loginMensaje.style.color = "red";
            return;
        }

        // Llamar a la función principal de Login
        loginMensaje.textContent = "Iniciando sesión...";
        loginMensaje.style.color = "blue";
        
        handleLogin(correo, password, rol);
    });
}