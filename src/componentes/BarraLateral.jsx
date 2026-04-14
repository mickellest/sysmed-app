import "./BarraLateral.css"

export function BarraLateral({ vistaActiva, setVistaActiva }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">SYSMED</div>
            <nav className="sidebar-nav">
                <ul>
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
                        Exámenes
                    </li>
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button className="btn-logout">Salir</button>
            </div>
        </aside>
    )
}