/**
 * SGVCTD Perú - Tipos de Datos y Interfaces
 */

export interface Destino {
  id: string;
  nombre: string;
  ubicacion: string;
  departamento: string;
  descripcion: string;
  maxCapacidad: number;
  capacidadActual: number;
  imagen: string;
  categoria: 'Inca' | 'Pre-Inca' | 'Naturaleza' | 'Colonial';
  rating: number;
  precioBase: number;
  precioExtranjero: number;
  horarios: string[];
}

export interface Pasajero {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: 'DNI' | 'Pasaporte' | 'CE';
  nroDocumento: string;
  pais: string;
  tipoTarifa: 'Nacional' | 'Extranjero' | 'Estudiante';
  precio: number;
}

export interface Ticket {
  id: string; // Formato SGV-XXXXX
  destinoId: string;
  destinoNombre: string;
  fechaVisita: string;
  horario: string;
  pasajeros: Pasajero[];
  total: number;
  metodoPago: 'Yape' | 'Tarjetas' | 'BCPPago';
  estado: 'Pendiente' | 'Emitido' | 'Validado' | 'Anulado';
  codigoQR: string; // Contenido del QR
  fechaEmision: string;
}

export interface TransaccionInfo {
  id: string;
  fecha: string;
  destino: string;
  monto: number;
  metodo: string;
  estado: 'Éxito' | 'Pendiente' | 'Rechazado';
  visitantes: number;
}

export interface AlertaSeguridad {
  id: string;
  timestamp: string;
  origen: string;
  detalles: string;
  gravedad: 'Informativo' | 'Advertencia' | 'Crítico';
  estado: 'Abierta' | 'Mitigada' | 'En Proceso';
}

export interface LogAcceso {
  id: string;
  timestamp: string;
  servicio: string;
  endpoint: string;
  solicitante: string;
  ip: string;
  estadoStr: string;
}
