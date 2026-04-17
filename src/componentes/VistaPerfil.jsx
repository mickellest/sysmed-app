import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Country, State } from 'country-state-city';
import "./VistaPerfil.css";

export function VistaPerfil({ userCredentials, pacienteData, setPacienteData }) {
  // Estado local para los inputs mientras editamos (draft)
  const [draftData, setDraftData] = useState(pacienteData || {});
  const [guardado, setGuardado] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados visuales de selectores "Otro"
  const [otroAlergias, setOtroAlergias] = useState(false);
  const [otroPatologias, setOtroPatologias] = useState(false);

  // Estado para cascada de país/ciudad
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [selectedIsoCountry, setSelectedIsoCountry] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [customProcedencia, setCustomProcedencia] = useState(""); // Solo referencial si ya venía algo precargado raro

  // Opciones precargadas
  const opcionesSangre = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const opcionesAlergias = ["Ninguna", "Penicilina", "AINES", "Sulfa", "Látex", "Alimentos", "Polen", "Ácaros", "Otro"];
  const opcionesPatologias = ["Ninguna", "Hipertensión", "Diabetes", "Asma", "Gastritis", "Hipotiroidismo", "Otro"];
  const opcionesHabitos = ["Ninguno", "Ocasional", "Frecuente", "Crónico"];

  useEffect(() => {
    setPaises(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (pacienteData) {
      setDraftData(pacienteData);

      // Precargar "Otro" dinámicamente si no coincide con lista
      if (pacienteData.alergias && !opcionesAlergias.map(v => v.toUpperCase()).includes(pacienteData.alergias.toUpperCase())) {
        setOtroAlergias(true);
      }
      if (pacienteData.patologias && !opcionesPatologias.map(v => v.toUpperCase()).includes(pacienteData.patologias.toUpperCase())) {
        setOtroPatologias(true);
      }
      
      setCustomProcedencia(pacienteData.procedencia || "");

      // Intentar auto-seleccionar País y Ciudad basándose en procedencia (Ej: "CARABOBO, VENEZUELA")
      if (pacienteData.procedencia && pacienteData.procedencia.includes(",")) {
        const parts = pacienteData.procedencia.split(", ");
        const sName = parts[0];
        const cName = parts[1];
        
        const paisMatch = Country.getAllCountries().find(c => c.name.toUpperCase() === cName.toUpperCase());
        if (paisMatch) {
          setSelectedIsoCountry(paisMatch.isoCode);
          setEstados(State.getStatesOfCountry(paisMatch.isoCode));
          
          const estMatch = State.getStatesOfCountry(paisMatch.isoCode).find(s => s.name.toUpperCase() === sName.toUpperCase());
          if (estMatch) setSelectedStateName(estMatch.name);
        }
      }
    }
  }, [pacienteData]);

  const handleChange = (e) => {
    setDraftData({ ...draftData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    const isoCode = e.target.value;
    setSelectedIsoCountry(isoCode);
    setEstados(State.getStatesOfCountry(isoCode));
    setSelectedStateName(""); // Reset
  };

  const handleStateChange = (e) => {
    const sName = e.target.value;
    setSelectedStateName(sName);
    
    // Si país y región están seleccionados, consolidamos "procedencia"
    const countryName = Country.getCountryByCode(selectedIsoCountry)?.name || "";
    const loc = `${sName}, ${countryName}`;
    setDraftData({ ...draftData, procedencia: loc });
  };

  const handleSelectConOtro = (e, fieldName, setOtroKey) => {
    const val = e.target.value;
    if (val === "OTRO") {
      setOtroKey(true);
      setDraftData({ ...draftData, [fieldName]: "" }); // Blanquear para escribir
    } else {
      setOtroKey(false);
      setDraftData({ ...draftData, [fieldName]: val });
    }
  };

  const handleSave = async () => {
    if(!userCredentials?.id) return;
    setIsSaving(true);
    
    // PURIFICADOR: Transformar todas las cadenas a MAYÚSCULAS
    const formatUpper = (str) => {
      if (typeof str === 'string') return str.toUpperCase();
      return str;
    };

    try {
        const pData = {
            paciente_id: userCredentials.id,
            cedula: formatUpper(draftData.cedula || ""),
            edad: formatUpper(draftData.edad || ""),
            fecha_nacimiento: formatUpper(draftData.fecha_nacimiento || ""),
            procedencia: formatUpper(draftData.procedencia || ""),
            religion: formatUpper(draftData.religion || ""),
            tipo_sangre: formatUpper(draftData.tipo_sangre || ""),
            alergias: formatUpper(draftData.alergias || ""),
            patologias: formatUpper(draftData.patologias || ""),
            antecedentes: formatUpper(draftData.antecedentes || ""),
            ejercicios: formatUpper(draftData.ejercicios || ""),
            alcohol: formatUpper(draftData.alcohol || ""),
            drogas: formatUpper(draftData.drogas || ""),
            actualizado_en: new Date().toISOString()
        };

        const { error } = await supabase
            .from('fichas_medicas')
            .upsert(pData, { onConflict: 'paciente_id' });

        // Guardamos el nombre en la tabla perfiles, ya que allá reside
        if (draftData.nombre_completo) {
          await supabase.from('perfiles').update({ nombre_completo: formatUpper(draftData.nombre_completo) }).eq('id', userCredentials.id);
        }

        if(error) {
            console.error("Error guardando ficha:", error);
            alert("No se pudo guardar la Ficha: " + error.message);
        } else {
            setPacienteData({ ...pData, nombre_completo: formatUpper(draftData.nombre_completo || "") }); 
            setGuardado(true);
            setTimeout(() => setGuardado(false), 3000);
        }
    } catch(err) {
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  // Funciones de validación cruzada para renders
  const getValue = (keyName) => draftData[keyName] || "";

  return (
    <div className="workspace scrollable-workspace">
      <header className="content-header">
        <h1>Panel de Gestión: Perfil</h1>
        <p>Actualiza la información vital de tu Ficha Médica.</p>
      </header>

      <div className="perfil-container-main">
        {/* Sección de Credenciales */}
        <section className="perfil-card">
           <h2 className="perfil-card-title">📝 Credenciales de Sesión</h2>
           <div className="cred-grid">
               <div className="cred-item">
                  <span className="cred-label">Usuario (Login):</span> 
                  <strong className="cred-value">{userCredentials?.nombre || "No definido"}</strong>
               </div>
               <div className="cred-item">
                  <span className="cred-label">Contraseña:</span> 
                  <strong className="cred-value">{userCredentials?.contrasena ? "••••••••" : "No definida"}</strong>
               </div>
           </div>
           <p className="hint-text">*Por seguridad, la contraseña real está encriptada y se oculta con viñetas.</p>
        </section>

        {/* Sección de Edición de Ficha */}
        <section className="perfil-card" style={{ marginTop: '20px' }}>
           <h2 className="perfil-card-title">🛡️ Editar Ficha Médica</h2>
           
           <h3 className="sub-section-title">Identificación</h3>
           <div className="edit-form-grid">
              <div className="perfil-input-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre_completo" value={getValue('nombre_completo')} onChange={handleChange} />
                <span className="sub-hint">Puedes modificar tu nombre público</span>
              </div>
              <div className="perfil-input-group">
                <label>Cédula</label>
                <input type="text" name="cedula" value={getValue('cedula')} onChange={handleChange} placeholder="Ej: V-12345678" />
              </div>
              <div className="perfil-input-group">
                <label>Edad</label>
                <input type="text" name="edad" value={getValue('edad')} onChange={handleChange} placeholder="Ej: 25 AÑOS" />
              </div>
              <div className="perfil-input-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={getValue('fecha_nacimiento')} onChange={handleChange} />
              </div>
              
              {/* COMPONENTES DE PAÍS / ESTADO */}
              <div className="perfil-input-group" style={{gridColumn: "1 / -1", display: 'flex', flexDirection: 'row', gap: '20px' }}>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <label>País Actual</label>
                    <select onChange={handleCountryChange} value={selectedIsoCountry}>
                       <option value="">Seleccione país...</option>
                       {paises.map(p => (
                         <option key={p.isoCode} value={p.isoCode}>{p.name}</option>
                       ))}
                    </select>
                 </div>
                 <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <label>Estado / Región</label>
                    <select onChange={handleStateChange} value={selectedStateName} disabled={!selectedIsoCountry}>
                       <option value="">{selectedIsoCountry ? "Seleccione región..." : "Primero seleccione país"}</option>
                       {estados.map(s => (
                         <option key={s.name} value={s.name}>{s.name}</option>
                       ))}
                    </select>
                 </div>
              </div>
              {customProcedencia && !selectedStateName && (
                <div className="perfil-input-group" style={{gridColumn: "1 / -1"}}>
                  <label>Procedencia guardada en BD</label>
                  <input type="text" disabled value={customProcedencia} />
                </div>
              )}

              <div className="perfil-input-group">
                <label>Religión</label>
                <input type="text" name="religion" value={getValue('religion')} onChange={handleChange} />
              </div>
           </div>

           <h3 className="sub-section-title">Perfil Clínico</h3>
           <div className="edit-form-grid">
              <div className="perfil-input-group">
                <label>Tipo de Sangre</label>
                <select name="tipo_sangre" value={getValue('tipo_sangre')} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  {opcionesSangre.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* ALERGIAS CON "OTRO" */}
              <div className="perfil-input-group">
                <label>Alergias</label>
                {!otroAlergias ? (
                  <select onChange={(e) => handleSelectConOtro(e, 'alergias', setOtroAlergias)} value={opcionesAlergias.map(v=>v.toUpperCase()).includes(getValue('alergias')) ? getValue('alergias') : (getValue('alergias') ? "OTRO" : "NINGUNA")}>
                    {opcionesAlergias.map(opt => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                  </select>
                ) : (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input type="text" name="alergias" placeholder="Especifique alergia..." value={getValue('alergias')} onChange={handleChange} autoFocus style={{flex: 1}} />
                    <button onClick={() => setOtroAlergias(false)} type="button" className="btn-cancelar">❌</button>
                  </div>
                )}
              </div>

              {/* PATOLOGIAS CON "OTRO" */}
              <div className="perfil-input-group">
                <label>Patologías de Base</label>
                {!otroPatologias ? (
                  <select onChange={(e) => handleSelectConOtro(e, 'patologias', setOtroPatologias)} value={opcionesPatologias.map(v=>v.toUpperCase()).includes(getValue('patologias')) ? getValue('patologias') : (getValue('patologias') ? "OTRO" : "NINGUNA")}>
                    {opcionesPatologias.map(opt => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                  </select>
                ) : (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input type="text" name="patologias" placeholder="Especifique patología..." value={getValue('patologias')} onChange={handleChange} autoFocus style={{flex: 1}} />
                    <button onClick={() => setOtroPatologias(false)} type="button" className="btn-cancelar">❌</button>
                  </div>
                )}
              </div>

              <div className="perfil-input-group">
                <label>Antecedentes Quirúrgicos</label>
                <input type="text" name="antecedentes" value={getValue('antecedentes')} onChange={handleChange} placeholder="Ej: Apendicectomía (2020)" />
              </div>
           </div>

           <h3 className="sub-section-title">Hábitos Psicobiológicos</h3>
           <div className="edit-form-grid">
              <div className="perfil-input-group">
                <label>Ejercicios</label>
                <select name="ejercicios" value={getValue('ejercicios')} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  {opcionesHabitos.map(opt => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                </select>
              </div>
              <div className="perfil-input-group">
                <label>Bebidas Alcohólicas</label>
                <select name="alcohol" value={getValue('alcohol')} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  {opcionesHabitos.map(opt => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                </select>
              </div>
              <div className="perfil-input-group">
                <label>Drogas</label>
                <select name="drogas" value={getValue('drogas')} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  {opcionesHabitos.map(opt => <option key={opt} value={opt.toUpperCase()}>{opt}</option>)}
                </select>
              </div>
           </div>

           <div className="perfil-actions">
             <button onClick={handleSave} className="btn-tesla-small" disabled={isSaving}>
                 {isSaving ? "Guardando..." : "Guardar Cambios"}
             </button>
             {guardado && <span className="save-success-msg">✅ ¡Actualización exitosa en la Ficha Médica!</span>}
           </div>
        </section>
      </div>
    </div>
  );
}
