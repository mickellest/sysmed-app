import { useState, useEffect } from "react";
import { BarraLateral } from "./BarraLateral";
import { FichaMedica } from "./FichaMedica";
import { VistaExamenes } from "./VistaExamenes";
import { VistaHospitales } from "./VistaHospitales";
import { VistaPerfil } from "./VistaPerfil";
import { VistaInicio } from "./VistaInicio";
import { VistaHistorial } from "./VistaHistorial";
import { supabase } from "../supabaseClient";
import "./Menu.css";

export function Menu({ userCredentials }) {

  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [isFichaVisible, setIsFichaVisible] = useState(true);

  const [loadingDb, setLoadingDb] = useState(true);
  
  // Estado global de la ficha médica
  const [pacienteData, setPacienteData] = useState({
    nombre_completo: userCredentials.nombre || "",
    cedula: "",
    edad: "",
    fecha_nacimiento: "",
    procedencia: "",
    religion: "",
    tipo_sangre: "",
    alergias: "",
    patologias: "",
    antecedentes: "",
    ejercicios: "",
    alcohol: "",
    drogas: ""
  });

  useEffect(() => {
    const fetchFicha = async () => {
      try {
        // Obtenemos los datos de Perfil para el nombre real
        const { data: profile } = await supabase
           .from('perfiles')
           .select('nombre_completo')
           .eq('id', userCredentials.id)
           .single();

        const { data, error } = await supabase
          .from('fichas_medicas')
          .select('*')
          .eq('paciente_id', userCredentials.id)
          .single();

        if (error && error.code !== 'PGRST116') {
             console.error("Error cargando ficha:", error);
        }

        setPacienteData({
          nombre_completo: profile?.nombre_completo || userCredentials.nombre || "",
          cedula: data?.cedula || "",
          edad: data?.edad || "",
          fecha_nacimiento: data?.fecha_nacimiento || "",
          procedencia: data?.procedencia || "",
          religion: data?.religion || "",
          tipo_sangre: data?.tipo_sangre || "",
          alergias: data?.alergias || "",
          patologias: data?.patologias || "",
          antecedentes: data?.antecedentes || "",
          ejercicios: data?.ejercicios || "",
          alcohol: data?.alcohol || "",
          drogas: data?.drogas || ""
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDb(false);
      }
    };

    if (userCredentials?.id) {
      fetchFicha();
    }
  }, [userCredentials]);
  return (
    <div className="menu-container">
      <BarraLateral 
        vistaActiva={vistaActiva} 
        setVistaActiva={setVistaActiva} 
      />
      
      <main className="content">
        {vistaActiva !== 'perfil' && (
          <button 
            onClick={() => setIsFichaVisible(!isFichaVisible)} 
            className="btn-toggle-ficha"
            title={isFichaVisible ? "Ocultar Ficha Médica" : "Mostrar Ficha Médica"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isFichaVisible ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </>
              )}
            </svg>
          </button>
        )}
        
        {vistaActiva === 'inicio' && (
          <VistaInicio userCredentials={userCredentials} setVistaActiva={setVistaActiva} />
        )}
        {vistaActiva === 'perfil' && (
          <VistaPerfil 
            userCredentials={userCredentials}
            pacienteData={pacienteData}
            setPacienteData={setPacienteData}
          />
        )}
        {vistaActiva === 'hospitales' && <VistaHospitales />}
        {vistaActiva === 'examenes' && <VistaExamenes userCredentials={userCredentials} />}
        {vistaActiva === 'historial' && <VistaHistorial userCredentials={userCredentials} />}
      </main>

      {/* Solo se muestra si NO estamos en perfil, y si el usuario no la ha ocultado */}
      {vistaActiva !== 'perfil' && vistaActiva !== 'inicio' && vistaActiva !== 'historial' && isFichaVisible && (
        <FichaMedica pacienteData={pacienteData} />
      )}
    </div>
  );
}