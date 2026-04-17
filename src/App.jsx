import SysMedHero from './componentes/Presentacion';
import { Formulario } from './componentes/Formulario';
import { Menu } from './componentes/Menu';
import {useState} from 'react'
import './App.css';

function App() {
  const [pantalla, setPantalla] = useState("presentacion");
  const [userCredentials, setUserCredentials] = useState({ nombre: "", contrasena: "" });

  return (
    <div>
      {pantalla === "presentacion" && (
        <SysMedHero irALogin={() => setPantalla("login")} />
      )}
      {pantalla === "login" && (
        <Formulario 
          irAMenu={() => setPantalla("menu")} 
          setUserCredentials={setUserCredentials} 
        />
      )}
      {pantalla === "menu" && (
        <Menu userCredentials={userCredentials} />
      )}
    </div>
  )
}

export default App
