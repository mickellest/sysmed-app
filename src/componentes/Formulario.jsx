import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Formulario.css";

export function Formulario({ irAMenu, setUserCredentials }) {
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const fondoPantalla = "https://consolaytablero.com/wp-content/uploads/2014/02/dr-mario.jpg";

    const estiloFondo = {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${fondoPantalla})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email || !contrasena) {
            setErrorMsg("Todos los campos son obligatorios");
            return;
        }

        setLoading(true);

        try {
            // Intentar Iniciar Sesión
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: contrasena
            });

            if (error) {
                // Si falla porque no existe, lo creamos
                if (error.message.includes("Invalid login credentials")) {
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: email,
                        password: contrasena,
                        options: {
                            data: {
                                nombre_completo: email.split('@')[0]
                            }
                        }
                    });

                    if (signUpError) throw signUpError;
                    
                    setUserCredentials({ nombre: email.split('@')[0], email: email, id: signUpData.user.id });
                    irAMenu();
                } else {
                    throw error;
                }
            } else {
                setUserCredentials({ nombre: email.split('@')[0], email: email, id: data.user.id });
                irAMenu();
            }
        } catch (error) {
            console.error("Auth Error:", error);
            setErrorMsg("Error de autenticación: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={estiloFondo}>
            <div className="login-box">
                <div className="logo-tesla-mini">SYSMED</div>
                <h1>Acceso Médico</h1>
                <form className="formulario" onSubmit={handleAuth}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <label>Correo Electrónico</label>
                    </div>
                    
                    <div className="input-group">
                        <input 
                            type="password"
                            value={contrasena}
                            onChange={e => setContrasena(e.target.value)}
                            required
                        />
                        <label>Contraseña</label>
                    </div>

                    <button type="submit" className="btn-tesla" disabled={loading}>
                        {loading ? "Autenticando..." : "Entrar / Registrarse"}
                    </button>
                </form>
                {errorMsg && <p className="error-msg">{errorMsg}</p>}
            </div>
        </div>
    );
}