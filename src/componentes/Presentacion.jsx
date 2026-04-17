import { useState, useEffect } from 'react';
import './Presentacion.css';

const SysMedHero = ({ irALogin }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1500", 
    "https://images.unsplash.com/photo-1551076805-e18690c5e561?auto=format&fit=crop&q=80&w=1500",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); 

    return () => clearInterval(timer);
  }, [images.length]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION (Glassmorphism + Dark Gradient) */}
      <section className="hero-container">
        <div className="slideshow-container">
          {images.map((imgUrl, index) => (
            <img 
              key={index} 
              src={imgUrl} 
              alt={`Medical background ${index + 1}`} 
              className={`bg-image ${index === currentImageIndex ? 'active' : 'inactive'}`}
            />
          ))}
          <div className="hero-overlay"></div>
        </div>

        <nav className="navbar-landing">
          <div className="logo-landing">SYSMED</div>
          <div className="nav-links-landing">
            <span onClick={() => scrollToSection('pacientes')}>Pacientes</span>
            <span onClick={() => scrollToSection('profesionales')}>Profesionales</span>
            <span onClick={irALogin}>Consultas</span>
            <span onClick={irALogin}>Historial</span>
          </div>
          <div className="nav-links-landing right-links">
            <span onClick={() => scrollToSection('soporte')}>Soporte</span>
            <button className="btn-nav-login" onClick={irALogin}>Ingresar</button>
          </div>
        </nav>

        <div className="header-text-landing">
          <h1>La medicina del futuro, <br/><span className="text-accent">en tus manos.</span></h1>
          <p>Potenciamos el ecosistema clínico integrando historiales seguros y diagnóstico óptico mediante Inteligencia Artificial.</p>
          
          <div className="footer-buttons-landing">
            <button className="btn-landing btn-primary-landing" onClick={irALogin}>Registrar Ahora</button>
            <button className="btn-landing btn-secondary-landing" onClick={irALogin}>Prueba de diagnóstico OCR</button>
          </div>
        </div>

        <div className="dots-container">
          <div className={`dot ${currentImageIndex === 0 ? 'active' : ''}`}></div>
          <div className={`dot ${currentImageIndex === 1 ? 'active' : ''}`}></div>
        </div>
      </section>

      {/* 2. ZONA DE PODER (Tecnología a tu Servicio) */}
      <section id="pacientes" className="features-section">
        <h2 className="section-title-landing">Arquitectura Tecnológica Superior</h2>
        <p className="section-subtitle-landing">Diseñado para minimizar errores humanos y acelerar flujos hospitalarios.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>100% Cloud Native</h3>
            <p>Conectado directamente a clústers relacionales (Supabase). Pierde tu dispositivo de hardware, nunca perderás tu historial de salud.</p>
          </div>
          <div className="feature-card" id="profesionales">
            <div className="feature-icon">🧬</div>
            <h3>Lector Neuronal OCR</h3>
            <p>Olvídate del tipeo manual. Ingresa una fotografía física del laboratorio y nuestro Láser Tesseract extraerá métricas cruciales al instante.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Fichas Seguras SSL</h3>
            <p>Tu privacidad es sagrada. Solo tu cuenta verificada es capaz de leer las fichas médicas inyectadas bajo nuestras Políticas RLS.</p>
          </div>
        </div>
      </section>

      {/* 3. PARALLAX DEMO SECTION */}
      <section className="parallax-section">
        <div className="parallax-overlay">
          <h2>Da el salto a la medicina del mañana</h2>
          <p>Únete a las filas de la innovación y centraliza la vida clínica.</p>
          <button className="btn-landing btn-primary-landing" onClick={irALogin}>Comenzar Gratuitamente</button>
        </div>
      </section>

      {/* 4. FOOTER (Soporte y Créditos) */}
      <footer id="soporte" className="sysmed-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>SYSMED</h2>
            <p>Evolucionando el sector salud línea por línea.</p>
          </div>
          <div className="footer-team">
            <h3>Soporte Técnico y Development Team</h3>
            <ul>
              <li>Marlon Gascuez</li>
              <li>Edwin Goldcheidt</li>
              <li>Mickelle Stolfo</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SysMed Startup Original. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default SysMedHero;