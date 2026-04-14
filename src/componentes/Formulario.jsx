import { useState } from "react";
import "./Formulario.css";

export function Formulario({ irAMenu }) {
    const [nombre, setNombre] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState(false);

    const fondoPantalla = "https://static.wikia.nocookie.net/heroess/images/3/3f/Dr._Mario_SSBU.png/revision/latest/scale-to-width-down/1200?cb=20181014004715&path-prefix=es";

    const estiloFondo = {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${fondoPantalla})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nombre === "" || contrasena === "") {
            setError(true);
            return;
        }
        setError(false);
        irAMenu(); 
    };

    return (
        <div className="login-container" style={estiloFondo}>
            <div className="login-box">
                <div className="logo-tesla-mini">SYSMED</div>
                <h1>Iniciar Sesión</h1>
                <form className="formulario" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                        />
                        <label>Nombre de usuario</label>
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

                    <button type="submit" className="btn-tesla">Entrar</button>
                </form>
                {error && <p className="error-msg">Todos los campos son obligatorios</p>}
            </div>
        </div>
    );
}