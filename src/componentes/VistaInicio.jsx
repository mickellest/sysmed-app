import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './VistaInicio.css';

export function VistaInicio({ userCredentials, setVistaActiva }) {
  const [userName, setUserName] = useState(userCredentials?.nombre || 'Paciente');
  const [lastExam, setLastExam] = useState(null);
  const [stats, setStats] = useState({ total_examenes: 0, alertas: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener nombre completo real
        const { data: profile } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('id', userCredentials.id)
          .single();
        
        if (profile?.nombre_completo) {
          setUserName(profile.nombre_completo.split(" ")[0]); // Solo el primer nombre
        }

        // Obtener historial crudo para estadísticas
        const { data: examenes } = await supabase
          .from('examenes_clinicos')
          .select('*')
          .eq('paciente_id', userCredentials.id)
          .order('fecha_escaneo', { ascending: false });

        if (examenes && examenes.length > 0) {
           const latest = examenes[0];
           setLastExam(latest);
           
           // Contar alertas en el último examen (muy básico)
           let alertasCount = 0;
           ['glucosa', 'colesterol', 'trigliceridos', 'urea', 'bilirrubina'].forEach(k => {
               if(latest[k] && latest[k] !== "No detectado") {
                   const v = parseFloat(latest[k]);
                   if(k==='glucosa' && v > 100) alertasCount++;
                   if(k==='colesterol' && v > 200) alertasCount++;
                   if(k==='trigliceridos' && v > 150) alertasCount++;
               }
           });

           setStats({ total_examenes: examenes.length, alertas: alertasCount });
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, [userCredentials]);

  return (
    <div className="workspace scrollable-workspace dashboard-bg">
      <header className="dashboard-hero">
        <h1>👋 Hola, {userName}</h1>
        <p>Este es tu Tablero de Mando Clínico. ¿Qué haremos hoy?</p>
      </header>

      <section className="dashboard-widgets">
         {/* Resumen Card */}
         <div className="widget-card stats-widget">
            <h3>Actividad Reciente</h3>
            <div className="stats-row">
              <div className="stat-box">
                 <span className="stat-number">{stats.total_examenes}</span>
                 <span className="stat-label">Exámenes Subidos</span>
              </div>
              <div className="stat-box alert-box">
                 <span className="stat-number">{stats.alertas}</span>
                 <span className="stat-label">Alertas Biomédicas</span>
              </div>
            </div>
         </div>

         {/* OCR Shortcut Card */}
         <div className="widget-card action-widget" onClick={() => setVistaActiva('examenes')}>
            <div className="widget-icon">🧬</div>
            <div>
              <h3>Nuevo Escaneo OCR</h3>
              <p>Analiza hojas de laboratorio al instante con IA.</p>
            </div>
         </div>

         {/* Historial Shortcut Card */}
         <div className="widget-card action-widget" onClick={() => setVistaActiva('historial')}>
            <div className="widget-icon">📈</div>
            <div>
              <h3>Ver Analíticas</h3>
              <p>Explora la evolución de tu salud en gráficos de líneas.</p>
            </div>
         </div>
      </section>

      {lastExam && (
        <section className="dashboard-latest">
          <h2>Último Diagnóstico Guardado</h2>
          <p className="fecha-latest">{new Date(lastExam.fecha_escaneo).toLocaleDateString()}</p>
          <div className="mini-grid">
             <div className="mini-card">
               <span>Glucosa</span>
               <strong>{lastExam.glucosa !== "No detectado" ? `${lastExam.glucosa} mg/dL` : '-'}</strong>
             </div>
             <div className="mini-card">
               <span>Colesterol</span>
               <strong>{lastExam.colesterol !== "No detectado" ? `${lastExam.colesterol} mg/dL` : '-'}</strong>
             </div>
             <div className="mini-card">
               <span>Triglicéridos</span>
               <strong>{lastExam.trigliceridos !== "No detectado" ? `${lastExam.trigliceridos} mg/dL` : '-'}</strong>
             </div>
          </div>
        </section>
      )}

    </div>
  );
}
