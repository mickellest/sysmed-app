import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './VistaHospitales.css'; // Importamos estilos propios

// Fix para los iconos de leaflet en react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const VALENCIA_COORDS = { lat: 10.1620, lng: -68.0077 };

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function VistaHospitales() {
  const [userLocation, setUserLocation] = useState(VALENCIA_COORDS);
  const [hospitals, setHospitals] = useState([]);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [radius, setRadius] = useState(5000); // Radio de búsqueda en metros por defecto (5km)
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null); // Nuevo estado para mostrar error al usuario

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoaded(true);
        },
        () => {
          console.warn("Ubicación denegada. Usando centro de Valencia.");
          setLocationLoaded(true);
        }
      );
    } else {
      setLocationLoaded(true);
    }
  }, []);

  // Efecto que re-ejecuta la búsqueda de OSM si cambia el radio o termina de cargar la ubicación
  useEffect(() => {
    if (!locationLoaded) return;

    let isCurrent = true;
    const controller = new AbortController();

    const delayDebounceFn = setTimeout(() => {
      async function fetchHospitals() {
        setIsLoading(true); 
        setFetchError(null); // Limpiamos errores pasados
        setHospitals([]); 

        try {
          // timeout:10 asegura que el servidor no se quede colgado, haciéndolo más eficiente
          const query = `
            [out:json][timeout:10];
            (
              node["amenity"="hospital"](around:${radius},${userLocation.lat},${userLocation.lng});
              way["amenity"="hospital"](around:${radius},${userLocation.lat},${userLocation.lng});
              relation["amenity"="hospital"](around:${radius},${userLocation.lat},${userLocation.lng});
            );
            out center;
          `;
          const encodedQuery = encodeURIComponent(query);
          const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}&t=${Math.floor(Date.now() / 10000)}`;
          
          let response = await fetch(url, { signal: controller.signal });
          
          // Si nos da Gateway Timeout (504) o saturado (429), intentamos un endpoint secundario de respaldo
          if (!response.ok && (response.status === 504 || response.status === 429)) {
             console.warn("Servidor principal saturado. Intentando servidor de respaldo...");
             const backupUrl = `https://overpass.kumi.systems/api/interpreter?data=${encodedQuery}`;
             response = await fetch(backupUrl, { signal: controller.signal });
          }

          if (!response.ok) {
            throw new Error(`Servidores de mapas ocupados (Error ${response.status}). Intenta en unos segundos.`);
          }

          const data = await response.json();
          
          if (isCurrent && data && data.elements) {
            const parsedHospitals = data.elements.map(el => {
              return {
                id: el.id,
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
                name: el.tags?.name || "Centro de Salud / Hospital",
                type: el.tags?.amenity || ""
              };
            }).filter(h => h.lat && h.lng);
            
            setHospitals(parsedHospitals);
          }
        } catch (error) {
          if (error.name !== 'AbortError' && isCurrent) {
            console.error("Error buscando en la API:", error);
            setFetchError("🗺️ Los servidores gratuitos de mapas están temporalmente saturados. Por favor, cambia la distancia para reintentar.");
          }
        } finally {
          if (isCurrent) {
            setIsLoading(false);
          }
        }
      }

      fetchHospitals();
    }, 600);

    return () => {
      isCurrent = false;
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [userLocation, locationLoaded, radius]); 

  const dynamicZoom = radius > 15000 ? 11 : radius > 10000 ? 12 : 13;

  return (
    <div className="workspace-hospitales" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <header className="content-header">
        <h1>Red de Hospitales</h1>
        <p>Centros de atención médica certificados dentro de tu área.</p>
      </header>

      {/* Selector de distancia */}
      <div className="filtros-mapa" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#171a20', fontWeight: '500' }}>
          Distancia máxima:
        </h3>
        <select 
          value={radius} 
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="radius-selector"
        >
          <option value={5000}>5 Kilómetros</option>
          <option value={10000}>10 Kilómetros</option>
          <option value={15000}>15 Kilómetros</option>
          <option value={20000}>20 Kilómetros</option>
        </select>
        
        {isLoading && <span style={{ color: '#3e6ae1', fontSize: '0.9rem', fontWeight: '500' }}>Buscando...</span>}
      </div>

      {fetchError && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          {fetchError}
        </div>
      )}

      <section className="map-section" style={{ width: '100%', flexGrow: 1 }}>
        <div className="mapa-contenedor">
          <MapContainer 
            center={userLocation} 
            zoom={dynamicZoom} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Si el usuario localizó, repintamos vista si zoom o centro cambian */}
            {locationLoaded && <ChangeView center={userLocation} zoom={dynamicZoom} />}

            {/* Pin del usuario */}
            {locationLoaded && (
               <Marker position={userLocation} icon={userIcon}>
                  <Popup><strong>¡Tu ubicación actual!</strong></Popup>
               </Marker>
            )}

            {/* Lista dinámica de Hospitales */}
            {hospitals.map((hospital) => (
              <Marker key={hospital.id} position={{ lat: hospital.lat, lng: hospital.lng }} icon={hospitalIcon}>
                <Popup>
                  <strong style={{ fontSize: '1.1rem', color: '#171a20' }}>{hospital.name}</strong>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        </div>
        
        {/* Leyenda de colores */}
        <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#5c5e62' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3e6ae1', borderRadius: '50%' }}></span> Tu ubicación
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#ea4335', borderRadius: '50%' }}></span> Clínicas/Hospitales ({hospitals.length} resultados)
            </span>
        </div>
      </section>
    </div>
  );
}