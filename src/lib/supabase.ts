import { createClient } from "@supabase/supabase-js";
import { Destino, Ticket, TransaccionInfo, AlertaSeguridad, LogAcceso, Pasajero } from "../types";

// Acceder a las variables de entorno de Vite utilizando estrictamente la sintaxis de cadena exacta requerida por el compilador de Vite
// @ts-ignore
const envUrl = import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
// @ts-ignore
const envKey = import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

// Fallbacks dinámicos en localStorage para permitir al usuario guardar credenciales directamente en el portal si el .env no se inyecta en caliente
const localUrl = typeof window !== "undefined" ? localStorage.getItem("supabase_url_override") : null;
const localKey = typeof window !== "undefined" ? localStorage.getItem("supabase_key_override") : null;

// Credenciales por defecto provistas por el usuario
const DEFAULT_URL = "https://rrzufvznkiphhrxsziho.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyenVmdnpua2lwaGhyeHN6eGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTE1ODgsImV4cCI6MjA5NzI4NzU4OH0.Z9FbrjkpmPgrN-4PpFb3mcYBkri_JT8wBxINHvuYl9Q";

export const supabaseUrl = localUrl || envUrl || DEFAULT_URL;
export const supabaseAnonKey = localKey || envKey || DEFAULT_KEY;

// Es preferible inicializar de forma perezosa o verificar la existencia de credenciales completas
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseUrl !== "https://tu-proyecto.supabase.co"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Permite a la interfaz configurar o limpiar las credenciales de Supabase dinámicamente
 */
export function configureSupabaseDynamically(url: string, key: string) {
  if (typeof window !== "undefined") {
    if (url && key) {
      localStorage.setItem("supabase_url_override", url.trim());
      localStorage.setItem("supabase_key_override", key.trim());
    } else {
      localStorage.removeItem("supabase_url_override");
      localStorage.removeItem("supabase_key_override");
    }
    // Recargar la ventana para instanciar el nuevo cliente de Supabase globalmente
    window.location.reload();
  }
}

/**
 * SQL Schema de referencia para el editor SQL de Supabase:
 * 
 * -- 1. Tabla Destinos
 * CREATE TABLE IF NOT EXISTS destinos (
 *   id TEXT PRIMARY KEY,
 *   nombre TEXT NOT NULL,
 *   descripcion TEXT,
 *   ubicacion TEXT,
 *   departamento TEXT,
 *   imagen TEXT,
 *   max_capacidad INTEGER,
 *   capacidad_actual INTEGER,
 *   precio_base INTEGER,
 *   precio_extranjero INTEGER,
 *   horarios JSONB,
 *   rating NUMERIC,
 *   categoria TEXT
 * );
 * 
 * -- 2. Tabla Tickets
 * CREATE TABLE IF NOT EXISTS tickets (
 *   id TEXT PRIMARY KEY,
 *   destino_id TEXT,
 *   destino_nombre TEXT,
 *   fecha_visita TEXT,
 *   horario TEXT,
 *   pasajeros JSONB,
 *   total INTEGER,
 *   estado TEXT,
 *   metodo_pago TEXT,
 *   codigo_qr TEXT,
 *   fecha_emision TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- 3. Tabla Transacciones
 * CREATE TABLE IF NOT EXISTS transacciones (
 *   id TEXT PRIMARY KEY,
 *   fecha TEXT,
 *   destino TEXT,
 *   monto INTEGER,
 *   metodo TEXT,
 *   estado TEXT,
 *   visitantes INTEGER
 * );
 * 
 * -- 4. Tabla Alertas
 * CREATE TABLE IF NOT EXISTS alertas (
 *   id TEXT PRIMARY KEY,
 *   timestamp TEXT,
 *   origen TEXT,
 *   detalles TEXT,
 *   gravedad TEXT,
 *   estado TEXT
 * );
 * 
 * -- 5. Tabla Logs
 * CREATE TABLE IF NOT EXISTS logs (
 *   id TEXT PRIMARY KEY,
 *   timestamp TEXT,
 *   servicio TEXT,
 *   endpoint TEXT,
 *   solicitante TEXT,
 *   ip TEXT,
 *   estado_str TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 */

// Helpers para transformar nombres de snake_case (Postgres/Supabase) a camelCase (App)
function mapDestinoDbToApp(db: any): Destino {
  return {
    id: db.id,
    nombre: db.nombre,
    descripcion: db.descripcion || "",
    ubicacion: db.ubicacion || "",
    departamento: db.departamento || "",
    imagen: db.imagen || "",
    maxCapacidad: Number(db.aforo_maximo ?? db.max_capacidad ?? 1000),
    capacidadActual: Number(db.aforo_actual ?? db.capacidad_actual ?? 0),
    precioBase: Number(db.precio_adulto ?? db.precio_base ?? 0),
    precioExtranjero: Number(db.precio_estudiante ?? db.precio_extranjero ?? 0),
    rating: 4.8, // rating de decoración
    categoria: db.categoria || "Inca",
    horarios: Array.isArray(db.horarios) ? db.horarios : []
  };
}

function mapDestinoAppToDb(app: Destino): any {
  return {
    id: app.id,
    nombre: app.nombre,
    descripcion: app.descripcion,
    ubicacion: app.ubicacion,
    departamento: app.departamento,
    imagen: app.imagen,
    aforo_maximo: app.maxCapacidad,
    aforo_actual: app.capacidadActual,
    precio_adulto: app.precioBase,
    precio_estudiante: app.precioExtranjero,
    precio_nino: Math.round(app.precioBase * 0.46), // Precio niño proporcional (ej. 152 * 0.46 = 70.00)
    estado: app.capacidadActual > app.maxCapacidad * 0.95 
      ? 'Critico' 
      : (app.capacidadActual > app.maxCapacidad * 0.8 ? 'Advertencia' : 'Normal'),
    alertas: [],
    categoria: app.categoria,
    horarios: app.horarios
  };
}

function mapPasajeroDbToApp(db: any): Pasajero {
  return {
    id: db.id,
    nombres: db.nombres,
    apellidos: db.apellidos,
    tipoDocumento: db.tipo_documento === 'Carnet Extranjería' ? 'CE' : (db.tipo_documento || 'DNI'),
    nroDocumento: db.nro_documento,
    pais: db.pais || 'Perú',
    tipoTarifa: db.tipo_tarifa === 'Niño' ? 'Extranjero' : (db.tipo_tarifa === 'Estudiante' ? 'Estudiante' : 'Nacional'),
    precio: Number(db.precio ?? 0)
  };
}

function mapPasajeroAppToDb(app: Pasajero, ticketId: string): any {
  let docType = app.tipoDocumento === 'CE' ? 'Carnet Extranjería' : app.tipoDocumento;
  if (docType !== 'DNI' && docType !== 'Pasaporte' && docType !== 'Carnet Extranjería') {
    docType = 'DNI';
  }

  let tarifa = 'Adulto';
  if (app.tipoTarifa === 'Estudiante') {
    tarifa = 'Estudiante';
  } else if (app.tipoTarifa === 'Extranjero' && app.precio < 100) {
    tarifa = 'Niño';
  }

  const payload: any = {
    ticket_id: ticketId,
    nombres: app.nombres,
    apellidos: app.apellidos,
    tipo_documento: docType,
    nro_documento: app.nroDocumento,
    pais: app.pais || "Perú",
    tipo_tarifa: tarifa,
    precio: app.precio
  };

  if (app.id && app.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    payload.id = app.id;
  }
  return payload;
}

function mapTicketDbEstadoToApp(dbEstado: string): 'Pendiente' | 'Emitido' | 'Validado' | 'Anulado' {
  switch (dbEstado) {
    case 'Pendiente': return 'Emitido';
    case 'Validado': return 'Validado';
    case 'Cancelado': return 'Anulado';
    default: return 'Emitido';
  }
}

function mapTicketAppEstadoToDb(appEstado: 'Pendiente' | 'Emitido' | 'Validado' | 'Anulado'): string {
  switch (appEstado) {
    case 'Pendiente': return 'Pendiente';
    case 'Emitido': return 'Pendiente';
    case 'Validado': return 'Validado';
    case 'Anulado': return 'Cancelado';
    default: return 'Pendiente';
  }
}

function mapTicketDbToApp(db: any): Ticket {
  return {
    id: db.id,
    destinoId: db.destino_id,
    destinoNombre: db.destino_nombre,
    fechaVisita: db.fecha_visita,
    horario: db.horario,
    pasajeros: Array.isArray(db.pasajeros) ? db.pasajeros.map(mapPasajeroDbToApp) : [],
    total: Number(db.total ?? 0),
    estado: mapTicketDbEstadoToApp(db.estado),
    metodoPago: db.metodo_pago === 'Tarjeta de Crédito' ? 'Tarjetas' : (db.metodo_pago === 'BCPPago' ? 'BCPPago' : 'Yape'),
    codigoQR: db.id,
    fechaEmision: db.creado_en || db.fecha_emision || new Date().toISOString()
  };
}

function mapTicketAppToDb(app: Ticket): any {
  return {
    id: app.id,
    destino_id: app.destinoId,
    destino_nombre: app.destinoNombre,
    fecha_visita: app.fechaVisita,
    horario: app.horario,
    total: app.total,
    metodo_pago: app.metodoPago === 'Tarjetas' ? 'Tarjeta de Crédito' : app.metodoPago,
    estado: mapTicketAppEstadoToDb(app.estado)
  };
}

function mapLogDbToApp(db: any): LogAcceso {
  return {
    id: db.id,
    timestamp: db.timestamp,
    servicio: db.servicio,
    endpoint: db.endpoint,
    solicitante: db.solicitante,
    ip: db.ip,
    estadoStr: db.estado_str
  };
}

function mapLogAppToDb(app: LogAcceso): any {
  return {
    id: app.id,
    timestamp: app.timestamp,
    servicio: app.servicio,
    endpoint: app.endpoint,
    solicitante: app.solicitante,
    ip: app.ip,
    estado_str: app.estadoStr
  };
}

// APIs unificadas con tolerancia a fallas. Si no existen las tablas, retornarán null para usar el fallback local.
export const dbAPI = {
  // --- DESTINOS ---
  async getDestinos(): Promise<Destino[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("destinos").select("*").order("nombre");
      if (error) {
        console.warn("Supabase: Error al cargar 'destinos'. ¿La tabla existe?", error.message);
        return null;
      }
      return data.map(mapDestinoDbToApp);
    } catch (e) {
      console.error("Supabase Error:", e);
      return null;
    }
  },

  async seedDestinos(destinos: Destino[]): Promise<boolean> {
    if (!supabase) return false;
    try {
      const mapped = destinos.map(mapDestinoAppToDb);
      const { error } = await supabase.from("destinos").upsert(mapped);
      if (error) {
        console.warn("Supabase: No se pudieron sembrar los destinos raíz.", error.message);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  async updateDestinoCapacity(id: string, currentCap: number): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from("destinos")
        .update({ aforo_actual: currentCap })
        .eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },

  async updateDestinoConfig(id: string, data: Partial<Destino>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const updatePayload: any = {};
      if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
      if (data.descripcion !== undefined) updatePayload.descripcion = data.descripcion;
      if (data.ubicacion !== undefined) updatePayload.ubicacion = data.ubicacion;
      if (data.departamento !== undefined) updatePayload.departamento = data.departamento;
      if (data.imagen !== undefined) updatePayload.imagen = data.imagen;
      if (data.maxCapacidad !== undefined) updatePayload.aforo_maximo = data.maxCapacidad;
      if (data.capacidadActual !== undefined) updatePayload.aforo_actual = data.capacidadActual;
      if (data.precioBase !== undefined) updatePayload.precio_adulto = data.precioBase;
      if (data.precioExtranjero !== undefined) updatePayload.precio_estudiante = data.precioExtranjero;
      if (data.horarios !== undefined) updatePayload.horarios = data.horarios;
      if (data.categoria !== undefined) updatePayload.categoria = data.categoria;

      const { error } = await supabase
        .from("destinos")
        .update(updatePayload)
        .eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- TICKETS ---
  async getTickets(): Promise<Ticket[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, pasajeros (*)")
        .order("creado_en", { ascending: false });
      if (error) {
        console.warn("Supabase: Error al cargar 'tickets' con pasajeros.", error.message);
        return null;
      }
      return data.map(mapTicketDbToApp);
    } catch {
      return null;
    }
  },

  async insertTicket(ticket: Ticket): Promise<boolean> {
    if (!supabase) return false;
    try {
      // 1. Insertar metadatos de ticket
      const dataDb = mapTicketAppToDb(ticket);
      const { error: ticketErr } = await supabase.from("tickets").insert([dataDb]);
      if (ticketErr) {
        console.error("Supabase Error insert ticket:", ticketErr);
        return false;
      }

      // 2. Insertar registros de pasajeros asociados (relación 1:N)
      if (ticket.pasajeros && ticket.pasajeros.length > 0) {
        const passengersDb = ticket.pasajeros.map(p => mapPasajeroAppToDb(p, ticket.id));
        const { error: pasErr } = await supabase.from("pasajeros").insert(passengersDb);
        if (pasErr) {
          console.error("Supabase Error insert ticket pasajeros:", pasErr);
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async updateTicketEstado(id: string, estado: "Pendiente" | "Emitido" | "Validado" | "Anulado"): Promise<boolean> {
    if (!supabase) return false;
    try {
      const dbEstado = mapTicketAppEstadoToDb(estado);
      const { error } = await supabase
        .from("tickets")
        .update({ estado: dbEstado })
        .eq("id", id);

      // Si se valida un boleto correcto, insertamos de forma complementaria el registro_asistencia
      if (estado === "Validado" && !error) {
        try {
          const { data: ticketData } = await supabase
            .from("tickets")
            .select("*, pasajeros(*)")
            .eq("id", id)
            .single();
          
          if (ticketData && Array.isArray(ticketData.pasajeros)) {
            const listRegs = ticketData.pasajeros.map((pas: any) => ({
              ticket_id: id,
              destino_id: ticketData.destino_id,
              pasajero_id: pas.id,
              pasajero_nombre: `${pas.nombres} ${pas.apellidos}`,
              nro_documento: pas.nro_documento,
              tipo: 'Entrada',
              operador: 'Operador_Puerta_Llaqta'
            }));
            
            await supabase.from("registros_asistencia").insert(listRegs);
          }
        } catch (eScan) {
          console.warn("No se pudo registrar asistencia automática en Supabase:", eScan);
        }
      }

      return !error;
    } catch {
      return false;
    }
  },

  // --- TRANSACCIONES ---
  async getTransacciones(): Promise<TransaccionInfo[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("transacciones")
        .select("*")
        .order("fecha", { ascending: false });
      if (error) {
        // Fallback local silencioso si la tabla opcional no está creada
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  async insertTransaccion(tx: TransaccionInfo): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("transacciones").insert([tx]);
      return !error;
    } catch {
      return false;
    }
  },

  // --- ALERTAS ---
  async getAlertas(): Promise<AlertaSeguridad[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("alertas")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  async insertAlerta(alerta: AlertaSeguridad): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from("alertas").insert([alerta]);
      return !error;
    } catch {
      return false;
    }
  },

  async updateAlertaEstado(id: string, estado: "Abierta" | "Mitigada" | "En Proceso"): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from("alertas")
        .update({ estado })
        .eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- LOGS ---
  async getLogs(): Promise<LogAcceso[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        return null;
      }
      return data.map(mapLogDbToApp);
    } catch {
      return null;
    }
  },

  async insertLog(log: LogAcceso): Promise<boolean> {
    if (!supabase) return false;
    try {
      const raw = mapLogAppToDb(log);
      const { error } = await supabase.from("logs").insert([raw]);
      return !error;
    } catch {
      return false;
    }
  },

  // --- DIAGNOSTICOS ---
  async diagnoseTables(): Promise<Record<string, { status: "OK" | "ERROR", details?: string }>> {
    const results: Record<string, { status: "OK" | "ERROR", details?: string }> = {};
    if (!supabase) {
      results._global = { status: "ERROR", details: "El cliente de Supabase no está instanciado. Verifica tus credenciales." };
      return results;
    }
    const tables = ["destinos", "tickets", "pasajeros", "registros_asistencia"];
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);
        if (error) {
          results[table] = { status: "ERROR", details: error.message };
        } else {
          results[table] = { status: "OK" };
        }
      } catch (e: any) {
        results[table] = { status: "ERROR", details: e?.message || String(e) };
      }
    }
    return results;
  }
};
