
import { supabase } from "./supabase.js";

const formulario = document.getElementById("login-form");
const mensaje = document.getElementById("login-message");
const boton = document.getElementById("login-button");

// Si ya existe una sesión, ir al panel administrativo
const { data: { session } } = await supabase.auth.getSession();

if (session) {
    window.location.href = "admin.html";
}

// Iniciar sesión
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    mensaje.textContent = "";
    boton.disabled = true;
    boton.textContent = "Ingresando...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        mensaje.textContent = "Correo o contraseña incorrectos.";
        boton.disabled = false;
        boton.textContent = "Iniciar sesión";
        return;
    }

    window.location.href = "admin.html";
});
