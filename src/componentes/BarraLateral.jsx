import "./BarraLateral.css"

export function BarraLateral({ vistaActiva, setVistaActiva }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">SYSMED</div>
            <nav className="sidebar-nav">
                <ul>
                    <li 
                        className={vistaActiva === 'inicio' ? 'active' : ''} 
                        onClick={() => setVistaActiva('inicio')}
                    >
                        Inicio
                    </li>
                    <li 
                        className={vistaActiva === 'perfil' ? 'active' : ''} 
                        onClick={() => setVistaActiva('perfil')}
                    >
                        Perfil
                    </li>
                    <li 
                        className={vistaActiva === 'hospitales' ? 'active' : ''} 
                        onClick={() => setVistaActiva('hospitales')}
                    >
                        Hospitales
                    </li>
                    <li 
                        className={vistaActiva === 'examenes' ? 'active' : ''} 
                        onClick={() => setVistaActiva('examenes')}
                    >
                        Escáner OCR
                    </li>
                    <li 
                        className={vistaActiva === 'historial' ? 'active' : ''} 
                        onClick={() => setVistaActiva('historial')}
                    >
                        Historial
                    </li>
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button className="btn-logout" onClick={() => window.location.reload()}>Salir</button>
            </div>
        </aside>
    )
}