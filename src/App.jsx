import SysMedHero from './componentes/Presentacion';
import { Formulario } from './componentes/Formulario';
import { Menu } from './componentes/Menu';
import {useState} from 'react'
import './App.css';

function App() {
  const [pantalla, setPantalla] = useState("presentacion");
  return (
    <div>
      {pantalla === "presentacion" && (
        <SysMedHero irALogin={() => setPantalla("login")} />
      )}
      {pantalla === "login" && (
        <Formulario irAMenu={() => setPantalla("menu")} />
      )}
      {pantalla === "menu" && (
        <Menu />
      )}
    </div>
  )
}

export default App
