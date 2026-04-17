# SysMed - Ecosistema de Gestión Médica y Analítica Neuronal 🧬

SysMed es una plataforma nativa de la nube (*Cloud-Native*) que integra Inteligencia Artificial directamente en el navegador web para automatizar y revolucionar la captura de datos de laboratorios médicos. Construida con React y PostgreSQL, SysMed no es solo un archivador clínico, es un instrumento de analítica biomédica activa.

## 🚀 Funcionalidades Principales

- **Escáner Óptico de IA (OCR en el Edge):** Permite arrastrar fotografías o PDFs de informes de laboratorio. El motor interno (Tesseract.js) analiza la imagen extrae más de 10 biomarcadores vitales (Glucosa, Colesterol, Urea, etc.) en milisegundos de forma totalmente autónoma.
- **Gráficos Estadísticos (Recharts):** Traza el historial del paciente generando curvas analíticas geométricas al instante, advirtiendo al médico de desviaciones peligrosas directamente en la pantalla.
- **Seguridad Bancaria (Supabase RLS):** Los perfiles médicos y analíticas están empaquetados bajo estrictas políticas *Row-Level-Security*, haciendo imposible el acceso a datos sin la sesión correspondiente.
- **Cloud y Single-Page-App:** Arquitectura SPA extremadamente fluida, el software jamás requiere recargar la página brindando una experiencia Premium e Inmersiva a través del patrón Glassmorphism estético.

## 🛠️ Stack Tecnológico
- **Frontend / UI:** React 18, Vite, CSS Grid y Flexbox.
- **Backend / DBA:** API de Supabase, PostgreSQL, Auth.
- **Motores Gráficos y Procesamiento:** TesseractWebAssembly, PDF.js de Mozilla, Recharts.
- **Suelo de Hospedaje (Deployment):** GitHub Pages Network.

## 💼 Pitch de Venta Rápido
*"Transformamos el papel y el PDF muerto en gráficas de vida interactiva. Reducimos el tiempo de captura de información de una hora a dos clics, con la máxima confidencialidad impulsada por el procesamiento privado del navegador."*
