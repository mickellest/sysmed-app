import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { supabase } from "../supabaseClient";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import "./VistaExamenes.css";

// Configuración del worker de PDF.js apuntando localmente a través de Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function VistaExamenes({ userCredentials }) {
  const [status, setStatus] = useState("idle"); // idle, scanning, result, error
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarImagen(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      procesarImagen(e.target.files[0]);
    }
  };

  const procesarImagen = async (file) => {
    if (!userCredentials?.id) {
       alert("Error: Sesión no detectada para vincular el resultado a la nube.");
       return;
    }
    
    setStatus("scanning");
    setProgress(0);

    try {
      let imageToProcess = file;
      let previewUrl = URL.createObjectURL(file);

      // Conversión On-The-Fly: Si es PDF, dibujamos la hoja en un Canvas invisible
      if (file.type === "application/pdf") {
         const pdf = await pdfjsLib.getDocument(previewUrl).promise;
         const page = await pdf.getPage(1); // Leemos la página 1 del reporte
         const scale = 2.5; // Escala alta para no perder calidad OCR
         const viewport = page.getViewport({ scale });
         
         const canvas = document.createElement("canvas");
         canvas.height = viewport.height;
         canvas.width = viewport.width;
         const context = canvas.getContext("2d");
         
         await page.render({ canvasContext: context, viewport: viewport }).promise;
         
         // Convertir a DataURL (Imagen cruda para Tesseract)
         imageToProcess = canvas.toDataURL("image/jpeg", 1.0);
         previewUrl = imageToProcess; 
      }

      setPreview(previewUrl);

      // Lanzar el motor OCR (Tesseract)
      const result = await Tesseract.recognize(
        imageToProcess,
        'spa',
        { logger: m => {
            if(m.status === 'recognizing text'){
                setProgress(Math.round(m.progress * 100));
            }
        }}
      );

      const texto = result.data.text.toUpperCase();
      
      // Módulo Regex de extracción de valores biológicos
      const parseValue = (regexPattern) => {
        const match = texto.match(regexPattern);
        return match ? match[1].replace(",", ".") : "No detectado";
      };

      const extGlucosa = parseValue(/GLUCOSA.*?(\d+[\.\,]?\d*)/);
      const extColesterol = parseValue(/COLESTEROL.*?(\d+[\.\,]?\d*)/);
      const extTrigli = parseValue(/TRIGLIC[EÉ]RIDOS.*?(\d+[\.\,]?\d*)/);
      const extHemo = parseValue(/HEMOGLOBINA.*?(\d+[\.\,]?\d*)/);
      
      const extUrea = parseValue(/UREA.*?(\d+[\.\,]?\d*)/);
      const extCreatinina = parseValue(/CREATININA.*?(\d+[\.\,]?\d*)/);
      const extAcidoUrico = parseValue(/[AÁA]CIDO\s+[UÚU]RICO.*?(\d+[\.\,]?\d*)/);
      const extBilirrubina = parseValue(/BILIRRUBINA.*?(\d+[\.\,]?\d*)/);
      const extPlaquetas = parseValue(/PLAQUETAS.*?(\d+[\.\,]?\d*)/);
      const extLeucocitos = parseValue(/LEUCOCITOS.*?(\d+[\.\,]?\d*)/);

      const biomarcadores = {
          paciente_id: userCredentials.id,
          glucosa: extGlucosa,
          colesterol: extColesterol,
          trigliceridos: extTrigli,
          hemoglobina: extHemo,
          urea: extUrea,
          creatinina: extCreatinina,
          acido_urico: extAcidoUrico,
          bilirrubina: extBilirrubina,
          plaquetas: extPlaquetas,
          leucocitos: extLeucocitos,
          texto_crudo: texto
      };

      // Volcar resultados en la Base de Datos Histórica
      const { error } = await supabase.from('examenes_clinicos').insert(biomarcadores);
      if(error) console.error("Error BD:", error);

      setResultados(biomarcadores);
      setTimeout(() => {
         setStatus("result");
      }, 500);

    } catch (err) {
      console.error("Error procesando documento (PDF/OCR): ", err);
      setStatus("error");
    }
  };

  // Función clínica para semáforos de advertencia
  const getEstadoBiomarcador = (tipo, valorStr) => {
      if (valorStr === "No detectado") return "neutral";
      const val = parseFloat(valorStr);
      if (isNaN(val)) return "neutral";

      if (tipo === 'glucosa') return (val >= 65 && val <= 100) ? "normal" : "alert";
      if (tipo === 'colesterol') return val < 200 ? "normal" : "alert";
      if (tipo === 'trigliceridos') return val < 150 ? "normal" : "alert";
      if (tipo === 'hemoglobina') return (val >= 12 && val <= 17.5) ? "normal" : "alert";
      if (tipo === 'urea') return (val >= 15 && val <= 45) ? "normal" : "alert";
      if (tipo === 'creatinina') return (val >= 0.6 && val <= 1.3) ? "normal" : "alert";
      if (tipo === 'acido_urico') return (val >= 3.4 && val <= 7.2) ? "normal" : "alert";
      if (tipo === 'bilirrubina') return val <= 1.2 ? "normal" : "alert";
      if (tipo === 'plaquetas') return (val >= 150 && val <= 450) ? "normal" : "alert";
      if (tipo === 'leucocitos') return (val >= 4.5 && val <= 11) ? "normal" : "alert";
      return "neutral";
  };

  return (
    <div className="workspace scrollable-workspace">
      <header className="content-header">
        <h1>Análisis Óptico Neuronal</h1>
        <p>Sube la fotografía analógica de Laboratorio. El motor de Inteligencia extraerá los biomarcadores automáticamente.</p>
      </header>

      <section className="examenes-container">
        
        {/* Zona de Drop o Vista de Escaneo */}
        <div className="scanner-layout">
           
           {(status === "idle" || status === "error") && (
             <div 
               className={`dropzone ${dragActive ? "drag-active" : ""}`}
               onDragEnter={handleDrag}
               onDragLeave={handleDrag}
               onDragOver={handleDrag}
               onDrop={handleDrop}
               onClick={() => inputRef.current.click()}
             >
               <input 
                 ref={inputRef} 
                 type="file" 
                 accept="image/*,application/pdf" 
                 onChange={handleChange} 
                 style={{display: "none"}} 
               />
               <div className="dropzone-content">
                  <div className="icon-upload">📄</div>
                  <h3>Haz clic o arrastra tu Examen Médico (PDF o Imagen)</h3>
                  <p>Admite JPG, PNG y documentos PDF. El motor leerá e interpretará el archivo.</p>
                  {status === "error" && <p className="error-text">Hubo un fallo en la red neuronal al leer el documento.</p>}
               </div>
             </div>
           )}

           {status === "scanning" && (
             <div className="scanning-container">
                <div className="image-wrapper">
                   <img src={preview} alt="Documento en analisis" className="preview-img" />
                   <div className="laser-line"></div>
                   <div className="scan-overlay"></div>
                </div>
                <div className="loading-metrics">
                   <h3>Desencriptando Biometría</h3>
                   <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
                   </div>
                   <p>{progress}% completado</p>
                </div>
             </div>
           )}

           {status === "result" && (
             <div className="resultado-final-container">
               <h2 className="resultado-title">🧬 Biomarcadores Extraídos</h2>
               <div className="resultado-grid">
                  
                  <div className={`biocard ${getEstadoBiomarcador('glucosa', resultados.glucosa)}`}>
                     <span className="bio-label">Glucosa en Sangre</span>
                     <strong className="bio-value">{resultados.glucosa} <span>mg/dL</span></strong>
                  </div>
                  
                  <div className={`biocard ${getEstadoBiomarcador('colesterol', resultados.colesterol)}`}>
                     <span className="bio-label">Colesterol Total</span>
                     <strong className="bio-value">{resultados.colesterol} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('trigliceridos', resultados.trigliceridos)}`}>
                     <span className="bio-label">Triglicéridos</span>
                     <strong className="bio-value">{resultados.trigliceridos} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('hemoglobina', resultados.hemoglobina)}`}>
                     <span className="bio-label">Hemoglobina</span>
                     <strong className="bio-value">{resultados.hemoglobina} <span>g/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('urea', resultados.urea)}`}>
                     <span className="bio-label">Urea</span>
                     <strong className="bio-value">{resultados.urea} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('creatinina', resultados.creatinina)}`}>
                     <span className="bio-label">Creatinina</span>
                     <strong className="bio-value">{resultados.creatinina} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('acido_urico', resultados.acido_urico)}`}>
                     <span className="bio-label">Ácido Úrico</span>
                     <strong className="bio-value">{resultados.acido_urico} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('bilirrubina', resultados.bilirrubina)}`}>
                     <span className="bio-label">Bilirrubina</span>
                     <strong className="bio-value">{resultados.bilirrubina} <span>mg/dL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('plaquetas', resultados.plaquetas)}`}>
                     <span className="bio-label">Plaquetas</span>
                     <strong className="bio-value">{resultados.plaquetas} <span>x10^3/uL</span></strong>
                  </div>

                  <div className={`biocard ${getEstadoBiomarcador('leucocitos', resultados.leucocitos)}`}>
                     <span className="bio-label">Leucocitos</span>
                     <strong className="bio-value">{resultados.leucocitos} <span>x10^3/uL</span></strong>
                  </div>
               </div>

               <div className="action-row">
                 <button className="btn-tesla-small" onClick={() => setStatus("idle")}>Escanear Nuevo Documento</button>
                 <span className="db-sync-msg">✅ Historial resguardado en Supabase</span>
               </div>
             </div>
           )}

        </div>
      </section>
    </div>
  );
}