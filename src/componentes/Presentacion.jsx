import { useState, useEffect } from 'react';

const SysMedHero = ({ irALogin }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1500", 
    "https://scontent-mia3-2.cdninstagram.com/v/t39.30808-6/490745700_1258983299560870_7570120400585046826_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=MzM0OTgzMjA2MzI0MTg0NjY5NQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjIwNDh4MTM2Ni5zZHIuQzMifQ%3D%3D&_nc_ohc=LLV9a6kZB_IQ7kNvwGSXiFe&_nc_oc=AdkzIZQrkdL-deOd8dM6CZLFywLqwzRnJUXUxxlU1o3md3PBoYSvNnN4SQWdOG9wQNU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-mia3-2.cdninstagram.com&_nc_gid=2BZi8pMId1sUZgSaFtrx9Q&_nc_ss=8&oh=00_AfxN6Xl9-S2Ihgqot_CEIytx1tx537PhGxzUIxsbdclnsg&oe=69B00726",
    
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); 

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="hero-container">
      <div className="slideshow-container">
        {images.map((imgUrl, index) => (
          <img 
            key={index} 
            src={imgUrl} 
            alt={`Medical background ${index + 1}`} 
            className={`bg-image ${index === currentImageIndex ? 'active' : 'inactive'}`}
          />
        ))}
      </div>

      <nav className="navbar">
        <div className="logo">SYSMED</div>
        <div className="nav-links">
          <span>Pacientes</span>
          <span>Profesionales</span>
          <span>Consultas</span>
          <span>Historial</span>
        </div>
        <div className="nav-links">
          <span>Soporte</span>
          <span onClick={irALogin} style={{ cursor: 'pointer' }}>Cuenta</span>
        </div>
      </nav>

      <div className="header-text">
        <h1>Conoce SysMed</h1>
        <p>Inicia sesión para acceder a tu panel de control médico.</p>
      </div>

      <div className="footer-buttons">
        <button className="btn btn-primary" onClick={irALogin}>Registrar Ahora</button>
        <button className="btn btn-secondary">Prueba de diagnóstico</button>
      </div>

      <div className="dots-container">
        <div className={`dot ${currentImageIndex === 0 ? 'active' : ''}`}></div>
        <div className={`dot ${currentImageIndex === 1 ? 'active' : ''}`}></div>
      </div>
    </div>
  );
};

export default SysMedHero;