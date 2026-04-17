import "./FichaMedica.css"

export function FichaMedica({ pacienteData }) {
    // Si no llegan datos por error, mostramos un fallback para que no crashee
    const data = pacienteData || {};

    return(
        <aside className="ficha-panel-derecho">
            <header className="ficha-header">
                <h1>Ficha Médica</h1>
                <p>Información principal del paciente</p>
            </header>

            <div className="ficha-wrapper">
                <section className="ficha-section">
                    <h2 className="section-title">Identificación</h2>
                    <div className="data-grid-lateral">
                        <div className="data-item"><span>Nombre Completo</span><strong>{data.nombre_completo}</strong></div>
                        <div className="data-item"><span>Cédula</span><strong>{data.cedula}</strong></div>
                        <div className="data-item"><span>Edad</span><strong>{data.edad}</strong></div>
                        <div className="data-item"><span>Fecha de Nacimiento</span><strong>{data.fecha_nacimiento}</strong></div>
                        <div className="data-item"><span>Procedencia / Dirección</span><strong>{data.procedencia}</strong></div>
                        <div className="data-item"><span>Religión</span><strong>{data.religion}</strong></div>
                    </div>
                </section>

                <section className="ficha-section">
                    <h2 className="section-title">Perfil Clínico</h2>
                    <div className="data-grid-lateral">
                        <div className="data-item highlight"><span>Tipo de Sangre</span><strong>{data.tipo_sangre}</strong></div>
                        <div className="data-item alert"><span>Alergias</span><strong>{data.alergias}</strong></div>
                        <div className="data-item"><span>Patologías de Base</span><strong>{data.patologias}</strong></div>
                        <div className="data-item"><span>Antecedentes Quirúrgicos</span><strong>{data.antecedentes}</strong></div>
                    </div>
                </section>

                <section className="ficha-section">
                    <h2 className="section-title">Hábitos Psicobiológicos</h2>
                    <div className="data-grid-lateral">
                        <div className="data-item"><span>Ejercicios</span><strong>{data.ejercicios}</strong></div>
                        <div className="data-item"><span>Bebidas Alcohólicas</span><strong>{data.alcohol}</strong></div>
                        <div className="data-item"><span>Drogas</span><strong>{data.drogas}</strong></div>
                    </div>
                </section>
            </div>
        </aside>
    )
}