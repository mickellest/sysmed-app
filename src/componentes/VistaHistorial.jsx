import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './VistaHistorial.css';

export function VistaHistorial({ userCredentials }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indicadorActivo, setIndicadorActivo] = useState('glucosa');

  // Constantes de mapeo
  const indicadores = [
    { key: 'glucosa', label: 'Glucosa', unit: 'mg/dL', color: '#3e6ae1' },
    { key: 'colesterol', label: 'Colesterol', unit: 'mg/dL', color: '#8884d8' },
    { key: 'trigliceridos', label: 'Triglicéridos', unit: 'mg/dL', color: '#82ca9d' },
    { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', color: '#ffc658' },
    { key: 'urea', label: 'Urea', unit: 'mg/dL', color: '#ff7300' },
    { key: 'creatinina', label: 'Creatinina', unit: 'mg/dL', color: '#d0ed57' },
    { key: 'plaquetas', label: 'Plaquetas', unit: 'x10^3/uL', color: '#a4de6c' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: records, error } = await supabase
          .from('examenes_clinicos')
          .select('*')
          .eq('paciente_id', userCredentials.id)
          .order('fecha_escaneo', { ascending: true }); // Cronológico para la gráfica

        if (error) throw error;
        
        // Formatear data para Recharts
        const formattedData = records.map(reg => {
           let r = { fecha: new Date(reg.fecha_escaneo).toLocaleDateString() };
           indicadores.forEach(ind => {
               const val = parseFloat(reg[ind.key]);
               r[ind.key] = isNaN(val) ? null : val;
           });
           return r;
        });

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching historial", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCredentials]);

  const activeInd = indicadores.find(i => i.key === indicadorActivo);

  return (
    <div className="workspace scrollable-workspace">
      <header className="content-header">
        <h1>Análisis de Tendencias</h1>
        <p>Curvas de evolución histórica basadas en pruebas de Laboratorio subidas y leídas por OCR.</p>
      </header>
      
      <div className="historial-container">
         <div className="tabs-indicadores">
            {indicadores.map(ind => (
               <button 
                 key={ind.key} 
                 className={`tab-btn ${indicadorActivo === ind.key ? 'active' : ''}`}
                 onClick={() => setIndicadorActivo(ind.key)}
               >
                 {ind.label}
               </button>
            ))}
         </div>

         <div className="chart-wrapper">
           {loading ? (
             <p className="loading-text">Cargando métricas neuronales...</p>
           ) : data.length === 0 ? (
             <p className="loading-text">No hay exámenes previos para graficar. Usa la pestaña Exámenes para subir un resultado.</p>
           ) : (
             <>
               <h3 className="chart-title">Evolución de {activeInd.label} ({activeInd.unit})</h3>
               <ResponsiveContainer width="100%" height={400}>
                 <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                   <XAxis dataKey="fecha" stroke="#8E8E93" />
                   <YAxis stroke="#8E8E93" />
                   <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     labelStyle={{ color: '#171a20', fontWeight: 'bold' }}
                   />
                   <Legend />
                   <Line 
                     type="monotone" 
                     dataKey={indicadorActivo} 
                     name={activeInd.label}
                     stroke={activeInd.color} 
                     strokeWidth={3}
                     activeDot={{ r: 8 }} 
                     connectNulls={true}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </>
           )}
         </div>
      </div>
    </div>
  );
}
