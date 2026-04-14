import "./FichaMedica.css"

export function FichaMedica(){
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
                        <div className="data-item"><span>Nombre Completo</span><strong>Marlon Gascuez</strong></div>
                        <div className="data-item"><span>Cédula</span><strong>V-29.882.151</strong></div>
                        <div className="data-item"><span>Edad</span><strong>23 años</strong></div>
                        <div className="data-item"><span>Fecha de Nacimiento</span><strong>16 / 01 / 2003</strong></div>
                        <div className="data-item"><span>Procedencia / Dirección</span><strong>Valencia, Venezuela</strong></div>
                        <div className="data-item"><span>Religión</span><strong>Ninguna</strong></div>
                    </div>
                </section>

                <section className="ficha-section">
                    <h2 className="section-title">Perfil Clínico</h2>
                    <div className="data-grid-lateral">
                        <div className="data-item highlight"><span>Tipo de Sangre</span><strong>O+</strong></div>
                        <div className="data-item alert"><span>Alergias</span><strong>Penicilina</strong></div>
                        <div className="data-item"><span>Patologías de Base</span><strong>Ninguna</strong></div>
                        <div className="data-item"><span>Antecedentes Quirúrgicos</span><strong>Apendicectomía (2023)</strong></div>
                    </div>
                </section>

                <section className="ficha-section">
                    <h2 className="section-title">Hábitos Psicobiológicos</h2>
                    <div className="data-grid-lateral">
                        <div className="data-item"><span>Ejercicios</span><strong>Frecuente (4 veces/sem)</strong></div>
                        <div className="data-item"><span>Bebidas Alcohólicas</span><strong>Ocasional</strong></div>
                        <div className="data-item"><span>Drogas</span><strong>Niega</strong></div>
                    </div>
                </section>
            </div>
        </aside>
    )
}