import { useState } from "react";
import { BarraLateral } from "./BarraLateral";
import { FichaMedica } from "./FichaMedica";
import { VistaExamenes } from "./VistaExamenes";
import { VistaHospitales } from "./VistaHospitales";
import { VistaPerfil } from "./VistaPerfil";
import "./Menu.css";

export function Menu() {

  const [vistaActiva, setVistaActiva] = useState('perfil');

  return (
    <div className="menu-container">
      <BarraLateral 
        vistaActiva={vistaActiva} 
        setVistaActiva={setVistaActiva} 
      />
      
      <main className="content">
        {vistaActiva === 'perfil' && <VistaPerfil />}
        {vistaActiva === 'hospitales' && <VistaHospitales />}
        {vistaActiva === 'examenes' && <VistaExamenes />}
      </main>

      <FichaMedica />
    </div>
  );
}