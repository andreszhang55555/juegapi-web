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
const authLinks = document.getElementById("auth-links");
const userProfile = document.getElementById("user-profile");
const usernameDisplay = document.getElementById("username-display");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("loginForm");
const loginMensaje = document.getElementById("loginMensaje");

// --- NUEVO: estado de sesión y enlaces del menú ---
let currentUser = null;

// Enlaces del menú (si existen en la página actual)
const linkAdmin = document.querySelector('a[href="admin.html"]');
const linkCatalogo = document.querySelector('a[href="catalogo.html"]');




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

function updateUI(user) {
  if (user) {
    // Usuario autenticado: ocultar enlaces de login/registro y mostrar perfil
    if (authLinks) {
      authLinks.classList.add("hidden");
    }
    if (userProfile) {
      userProfile.classList.remove("hidden");
    }

    let userName = user.email.split("@")[0];
    if (user.displayName && user.displayName.trim() !== "") {
      userName = user.displayName;
    }

    if (usernameDisplay) {
      usernameDisplay.textContent = userName;
    }

    const role = localStorage.getItem("userRole");

    // Mostrar u ocultar el enlace de Admin según el rol
    if (linkAdmin) {
      const liAdmin = linkAdmin.closest("li");
      if (role === "admin") {
        if (liAdmin) liAdmin.classList.remove("hidden");
      } else {
        if (liAdmin) liAdmin.classList.add("hidden");
      }
    }
  } else {
    // Invitado: no hay usuario autenticado
    if (userProfile) {
      userProfile.classList.add("hidden");
    }
    if (authLinks) {
      authLinks.classList.remove("hidden");
    }

    // Para invitados, ocultamos siempre el enlace de Admin
    if (linkAdmin) {
      const liAdmin = linkAdmin.closest("li");
      if (liAdmin) liAdmin.classList.add("hidden");
    }
  }
}

// Proteger rutas según autenticación y rol
function protegerRutas(user) {
  const path = window.location.pathname;
  const esCatalogo = path.endsWith("catalogo.html");
  const esAdmin = path.endsWith("admin.html");
  const role = localStorage.getItem("userRole");

  // Invitado intentando entrar directamente al catálogo por URL
  if (!user && esCatalogo) {
    alert("Para acceder al catálogo debes iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

  // Usuario autenticado sin rol admin intentando entrar a admin
  if (user && esAdmin && role !== "admin") {
    alert("Solo los administradores pueden acceder a esta sección.");
    window.location.href = "index.html";
  }
}

// Listener global de cambios de sesión
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;     // <- aquí se rellena currentUser
  updateUI(user);
  protegerRutas(user);
});

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