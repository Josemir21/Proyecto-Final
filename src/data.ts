import { Destino, Ticket, TransaccionInfo, AlertaSeguridad, LogAcceso } from "./types";

export const INICIAL_DESTINOS: Destino[] = [
  {
    id: "MP-01",
    nombre: "Santuario Histórico de Machu Picchu",
    ubicacion: "Urubamba",
    departamento: "Cusco",
    descripcion: "La legendaria joya imperial de los Incas, patrimonio de la humanidad, suspendida con maestría entre montañas andinas y densa ceja de selva.",
    maxCapacidad: 4500,
    capacidadActual: 2840,
    imagen: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=1200",
    categoria: "Inca",
    rating: 4.9,
    precioBase: 64, // Soles (Nacional)
    precioExtranjero: 152, // Soles
    horarios: ["06:00 - 08:00", "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00"]
  },
  {
    id: "KUE-02",
    nombre: "Fortaleza Arqueológica de Kuélap",
    ubicacion: "Luya",
    departamento: "Amazonas",
    descripcion: "Colosal urbe fortificada de los Chachapoyas, defendida por ciclópeas murallas de piedra tallada de hasta 20 metros de altura en el misterioso bosque de nubes.",
    maxCapacidad: 1200,
    capacidadActual: 450,
    imagen: "https://images.unsplash.com/photo-1587542513982-534162006ed6?auto=format&fit=crop&q=80&w=1200",
    categoria: "Pre-Inca",
    rating: 4.7,
    precioBase: 30,
    precioExtranjero: 60,
    horarios: ["08:00 - 11:00", "11:00 - 14:00", "14:00 - 17:00"]
  },
  {
    id: "PAR-03",
    nombre: "Reserva Nacional de Paracas",
    ubicacion: "Pisco",
    departamento: "Ica",
    descripcion: "Donde el árido desierto de dunas doradas se funde dramáticamente con los acantilados rojizos del Océano Pacífico, hogar de una asombrosa fauna marina.",
    maxCapacidad: 2500,
    capacidadActual: 980,
    imagen: "https://images.unsplash.com/photo-1581012739500-b6f70fd4c730?auto=format&fit=crop&q=80&w=1200",
    categoria: "Naturaleza",
    rating: 4.8,
    precioBase: 15,
    precioExtranjero: 30,
    horarios: ["07:00 - 11:00", "11:00 - 14:00", "14:00 - 17:00"]
  },
  {
    id: "NAZ-04",
    nombre: "Líneas y Geoglifos de Nazca",
    ubicacion: "Provincia de Nazca",
    departamento: "Ica",
    descripcion: "Enigmáticas y monumentales figuras geométricas y zoomorfas trazadas con precisión científica por civilizaciones milenarias sobre la árida pampa iqueña.",
    maxCapacidad: 600,
    capacidadActual: 320,
    imagen: "https://images.unsplash.com/photo-1590050752117-238cb0612b1a?auto=format&fit=crop&q=80&w=1200",
    categoria: "Pre-Inca",
    rating: 4.6,
    precioBase: 40,
    precioExtranjero: 80,
    horarios: ["07:00 - 10:00", "10:00 - 13:00", "13:00 - 16:00"]
  },
  {
    id: "ARC-05",
    nombre: "Montaña de Siete Colores (Vinicunca)",
    ubicacion: "Quispicanchi",
    departamento: "Cusco",
    descripcion: "Genuina obra maestra geológica decorada con franjas minerales de vivos colores, situada a más de 5,000 m.s.n.m. bajo la tutela del apu sagrado Ausangate.",
    maxCapacidad: 1800,
    capacidadActual: 620,
    imagen: "https://images.unsplash.com/photo-1548625361-155de6c7f5ab?auto=format&fit=crop&q=80&w=1200",
    categoria: "Naturaleza",
    rating: 4.8,
    precioBase: 25,
    precioExtranjero: 50,
    horarios: ["06:00 - 09:00", "09:00 - 12:00", "12:00 - 15:00"]
  },
  {
    id: "CHAN-06",
    nombre: "Complejo Arqueológico Chan Chan",
    ubicacion: "Trujillo",
    departamento: "La Libertad",
    descripcion: "La majestuosa urbe imperial de barro y adobe labrado más extensa de la América prehispánica, testimonio del apogeo arquitectónico del Reino Chimú.",
    maxCapacidad: 1000,
    capacidadActual: 420,
    imagen: "https://images.unsplash.com/photo-1518638150341-dbf06367469b?auto=format&fit=crop&q=80&w=1200",
    categoria: "Pre-Inca",
    rating: 4.6,
    precioBase: 20,
    precioExtranjero: 50,
    horarios: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 17:00"]
  },
  {
    id: "MSC-07",
    nombre: "Monasterio de Santa Catalina",
    ubicacion: "La Ciudad Blanca",
    departamento: "Arequipa",
    descripcion: "Una mística ciudadela colonial de sillar fundada en 1579, caracterizada por sus vibrantes callejones terracota y azul cobalto, que guarda siglos de clausura histórica.",
    maxCapacidad: 800,
    capacidadActual: 240,
    imagen: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1200",
    categoria: "Colonial",
    rating: 4.8,
    precioBase: 40,
    precioExtranjero: 80,
    horarios: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"]
  },
  {
    id: "COL-08",
    nombre: "Cañón del Colca",
    ubicacion: "Chivay",
    departamento: "Arequipa",
    descripcion: "Uno de los cañones más profundos de la Tierra, custodiado por terrazas de labranza ancestrales y dominado por el majestuoso vuelo del Cóndor Andino.",
    maxCapacidad: 1500,
    capacidadActual: 510,
    imagen: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200",
    categoria: "Naturaleza",
    rating: 4.7,
    precioBase: 20,
    precioExtranjero: 70,
    horarios: ["06:00 - 10:00", "10:05 - 13:00", "13:05 - 17:00"]
  },
  {
    id: "CHO-09",
    nombre: "Parque Arqueológico Choquequirao",
    ubicacion: "Santa Teresa",
    departamento: "Cusco",
    descripcion: "La sagrada y última fortaleza de resistencia de los Incas de Vilcabamba, mística hermana de Machu Picchu, suspendida sobre un espectacular abismo verde.",
    maxCapacidad: 500,
    capacidadActual: 98,
    imagen: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1200",
    categoria: "Inca",
    rating: 4.9,
    precioBase: 60,
    precioExtranjero: 120,
    horarios: ["07:00 - 11:00", "11:00 - 14:00", "14:00 - 17:00"]
  }
];

export const INICIAL_TICKETS: Ticket[] = [
  {
    id: "SGV-38914",
    destinoId: "MP-01",
    destinoNombre: "Machu Picchu Llaqta",
    fechaVisita: "2026-05-29",
    horario: "08:00 - 10:00",
    pasajeros: [
      {
        id: "p1",
        nombres: "Juan Carlos",
        apellidos: "Quispe Mamani",
        tipoDocumento: "DNI",
        nroDocumento: "45892014",
        pais: "Perú",
        tipoTarifa: "Nacional",
        precio: 64
      },
      {
        id: "p2",
        nombres: "María Elena",
        apellidos: "Flores Rojas",
        tipoDocumento: "DNI",
        nroDocumento: "47219803",
        pais: "Perú",
        tipoTarifa: "Nacional",
        precio: 64
      }
    ],
    total: 128,
    metodoPago: "Yape",
    estado: "Emitido",
    codigoQR: "SGVCTD_TICKET_MP01_38914_OK",
    fechaEmision: "2026-05-28T09:30:15Z"
  },
  {
    id: "SGV-74125",
    destinoId: "MP-01",
    destinoNombre: "Machu Picchu Llaqta",
    fechaVisita: "2026-05-29",
    horario: "10:00 - 12:00",
    pasajeros: [
      {
        id: "p3",
        nombres: "Arnaud",
        apellidos: "Dubois",
        tipoDocumento: "Pasaporte",
        nroDocumento: "FR991042X",
        pais: "Francia",
        tipoTarifa: "Extranjero",
        precio: 152
      }
    ],
    total: 152,
    metodoPago: "Tarjetas",
    estado: "Validado",
    codigoQR: "SGVCTD_TICKET_MP01_74125_VAL",
    fechaEmision: "2026-05-28T07:12:00Z"
  }
];

export const INICIAL_TRANSACCIONES: TransaccionInfo[] = [
  { id: "TX-48921", fecha: "2026-05-28 10:15", destino: "Machu Picchu Llaqta", monto: 128.00, metodo: "Yape", estado: "Éxito", visitantes: 2 },
  { id: "TX-48920", fecha: "2026-05-28 10:12", destino: "Complejo Chan Chan", monto: 40.00, metodo: "Yape", estado: "Éxito", visitantes: 2 },
  { id: "TX-48919", fecha: "2026-05-28 10:05", destino: "Machu Picchu Llaqta", monto: 152.00, metodo: "Visa", estado: "Éxito", visitantes: 1 },
  { id: "TX-48918", fecha: "2026-05-28 09:59", destino: "Fortaleza de Kuélap", monto: 90.00, metodo: "BCP", estado: "Éxito", visitantes: 3 },
  { id: "TX-48917", fecha: "2026-05-28 09:50", destino: "Líneas de Nazca", monto: 160.00, metodo: "Mastercard", estado: "Éxito", visitantes: 2 },
  { id: "TX-48916", fecha: "2026-05-28 09:42", destino: "Machu Picchu Llaqta", monto: 304.00, metodo: "Visa", estado: "Rechazado", visitantes: 2 }
];

export const INICIAL_ALERTAS: AlertaSeguridad[] = [
  {
    id: "AL-104",
    timestamp: "10:14:22",
    origen: "Taquilla Sitio MP",
    detalles: "Detección de ticket duplicado (Intento de acceso con QR id: SGV-12044 ya validado a las 08:31)",
    gravedad: "Crítico",
    estado: "Abierta"
  },
  {
    id: "AL-103",
    timestamp: "09:45:10",
    origen: "API Gateway GobPE",
    detalles: "Pico de consumo sospechoso (420 req/min) desde bloques IP de Europa del Este en endpoint /api/availability",
    gravedad: "Advertencia",
    estado: "Abierta"
  },
  {
    id: "AL-102",
    timestamp: "08:15:00",
    origen: "Control Aforo MP",
    detalles: "El sector Wayna Picchu alcanzó el 95% de aforo instantáneo permitido para el turno 08:00 - 10:00",
    gravedad: "Informativo",
    estado: "Mitigada"
  }
];

export const INICIAL_LOGS: LogAcceso[] = [
  { id: "LOG-001", timestamp: "10:15:30", servicio: "Auth-Service", endpoint: "/v1/oauth/token", solicitante: "Taquilla_MachuPicchu_02", ip: "190.113.120.45", estadoStr: "200 OK" },
  { id: "LOG-002", timestamp: "10:15:28", servicio: "Ticket-API", endpoint: "/v2/tickets/validate", solicitante: "Lector_Acceso_Puerta1", ip: "190.113.120.48", estadoStr: "200 OK" },
  { id: "LOG-003", timestamp: "10:15:15", servicio: "Portal-Web", endpoint: "/v1/availability/search", solicitante: "App_Visitante_Web", ip: "186.220.14.99", estadoStr: "200 OK" },
  { id: "LOG-004", timestamp: "10:14:55", servicio: "Ticket-API", endpoint: "/v2/tickets/validate", solicitante: "Lector_Acceso_Puerta2", ip: "190.113.120.49", estadoStr: "403 Forbidden" },
  { id: "LOG-005", timestamp: "10:13:02", servicio: "Payment-Proxy", endpoint: "/v1/yape/charge", solicitante: "Portal_Yape_Engine", ip: "191.156.40.12", estadoStr: "200 OK" }
];
