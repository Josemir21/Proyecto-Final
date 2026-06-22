import React, { useState, useEffect } from "react";
import { INICIAL_DESTINOS, INICIAL_TICKETS, INICIAL_TRANSACCIONES, INICIAL_ALERTAS, INICIAL_LOGS } from "./data";
import { Destino, Ticket, TransaccionInfo, AlertaSeguridad, LogAcceso } from "./types";
import PortalVisitante from "./components/PortalVisitante";
import PanelTaquilla from "./components/PanelTaquilla";
import BackofficeAdmin from "./components/BackofficeAdmin";
import ControlSeguridad from "./components/ControlSeguridad";
import GeminiAssistant from "./components/GeminiAssistant";
import { QrCode, Monitor, Lock, Users, Shield, MessageSquare, AlertTriangle, Activity, Database, Check, Sliders } from "lucide-react";
import { dbAPI, isSupabaseConfigured } from "./lib/supabase";


export default function App() {
  // Global Interactive States
  const [destinos, setDestinos] = useState<Destino[]>(INICIAL_DESTINOS);
  const [tickets, setTickets] = useState<Ticket[]>(INICIAL_TICKETS);
  const [transactions, setTransactions] = useState<TransaccionInfo[]>(INICIAL_TRANSACCIONES);
  const [alertas, setAlertas] = useState<AlertaSeguridad[]>(INICIAL_ALERTAS);
  const [logs, setLogs] = useState<LogAcceso[]>(INICIAL_LOGS);
  const [emergenciaActiva, setEmergenciaActiva] = useState(false);

  // Profile selection
  const [activeProfile, setActiveProfile] = useState<'Visitante' | 'Taquillero' | 'Superadmin' | 'SOC'>('Visitante');

  // Trigger simulated ping check on server & Supabase initial sync
  useEffect(() => {
    fetch("/api/ping")
      .then(res => res.json())
      .then(data => console.log("[SGVCTD PERÚ] Backend activo:", data))
      .catch(err => console.warn("[SGVCTD PERÚ] Servidor rodando local-only o sin backend activo. Simulación de contingencia activada."));

    async function syncSupabaseData() {
      if (!isSupabaseConfigured) {
        console.log("[SGVCTD PERÚ] Supabase no configurado. Utilizando estados de simulación locales.");
        return;
      }
      console.log("[SGVCTD PERÚ] Supabase configurado y activo. Iniciando sincronización remota...");

      // 1. Sincronizar Destinos
      const dbDestinos = await dbAPI.getDestinos();
      if (dbDestinos !== null) {
        if (dbDestinos.length === 0) {
          console.log("[SGVCTD PERÚ] Sembrando destinos raíz en la tabla Supabase 'destinos'...");
          await dbAPI.seedDestinos(INICIAL_DESTINOS);
          setDestinos(INICIAL_DESTINOS);
        } else {
          setDestinos(dbDestinos);
        }
      }

      // 2. Sincronizar Tickets
      const dbTickets = await dbAPI.getTickets();
      if (dbTickets !== null) {
        setTickets(dbTickets);
      }

      // 3. Sincronizar Transacciones
      const dbTx = await dbAPI.getTransacciones();
      if (dbTx !== null) {
        setTransactions(dbTx);
      }

      // 4. Sincronizar Alertas
      const dbAlerts = await dbAPI.getAlertas();
      if (dbAlerts !== null) {
        setAlertas(dbAlerts);
      }

      // 5. Sincronizar Logs
      const dbLogs = await dbAPI.getLogs();
      if (dbLogs !== null) {
        setLogs(dbLogs);
      }
    }

    syncSupabaseData();
  }, []);

  // Sync state actions
  const handleEmitTicket = async (newTicket: Ticket) => {
    // Add ticket to state registry
    setTickets(prev => [newTicket, ...prev]);
    if (isSupabaseConfigured) {
      await dbAPI.insertTicket(newTicket);
    }

    // Create a matching cashier transaction log
    const txId = "TX-" + Math.floor(10000 + Math.random() * 90000);
    const newTx: TransaccionInfo = {
      id: txId,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      destino: newTicket.destinoNombre,
      monto: newTicket.total,
      metodo: newTicket.metodoPago,
      estado: 'Éxito',
      visitantes: newTicket.pasajeros.length
    };
    setTransactions(prev => [newTx, ...prev]);
    if (isSupabaseConfigured) {
      await dbAPI.insertTransaccion(newTx);
    }

    // Create a matching server access log
    const logId = "LOG-" + Math.floor(100 + Math.random() * 900);
    const newLog: LogAcceso = {
      id: logId,
      timestamp: new Date().toTimeString().split(' ')[0],
      servicio: "Ticket-API",
      endpoint: "/v2/tickets/issue",
      solicitante: "Portal_Web_Publico",
      ip: "186.220.14.99",
      estadoStr: "201 Created"
    };
    setLogs(prev => [newLog, ...prev]);
    if (isSupabaseConfigured) {
      await dbAPI.insertLog(newLog);
    }
  };


  const handleValidateTicket = (ticketId: string): 'valid_ok' | 'clonado' | 'inexistente' => {
    const ticketIdx = tickets.findIndex(t => t.id === ticketId);
    if (ticketIdx === -1) return 'inexistente';

    const ticket = tickets[ticketIdx];
    
    if (ticket.estado === 'Validado') {
      // Intended clone/fraud warning incident
      const alId = "AL-" + Math.floor(100 + Math.random() * 900);
      const newAlert: AlertaSeguridad = {
        id: alId,
        timestamp: new Date().toTimeString().split(' ')[0],
        origen: "Control Puerta Sitio",
        detalles: `Detección de ticket duplicado (Intento de acceso con QR id: ${ticketId})`,
        gravedad: "Crítico",
        estado: "Abierta"
      };
      setAlertas(prev => [newAlert, ...prev]);
      if (isSupabaseConfigured) {
        dbAPI.insertAlerta(newAlert);
      }

      // Add bad state logs
      const logId = "LOG-" + Math.floor(100 + Math.random() * 900);
      const newLog: LogAcceso = {
        id: logId,
        timestamp: new Date().toTimeString().split(' ')[0],
        servicio: "Ticket-API",
        endpoint: "/v2/tickets/validate",
        solicitante: "Lector_Acceso_Puerta1",
        ip: "190.113.120.48",
        estadoStr: "403 Forbidden [DuplicatedToken]"
      };
      setLogs(prev => [newLog, ...prev]);
      if (isSupabaseConfigured) {
        dbAPI.insertLog(newLog);
      }

      return 'clonado';
    }

    // Valid entry ok
    const updatedTickets = [...tickets];
    updatedTickets[ticketIdx] = { ...ticket, estado: 'Validado' };
    setTickets(updatedTickets);
    if (isSupabaseConfigured) {
      dbAPI.updateTicketEstado(ticketId, 'Validado');
    }

    // Register active logs
    const logId = "LOG-" + Math.floor(100 + Math.random() * 900);
    const newLog: LogAcceso = {
      id: logId,
      timestamp: new Date().toTimeString().split(' ')[0],
      servicio: "Ticket-API",
      endpoint: "/v2/tickets/validate",
      solicitante: "Lector_Acceso_Puerta1",
      ip: "190.113.120.48",
      estadoStr: "200 OK"
    };
    setLogs(prev => [newLog, ...prev]);
    if (isSupabaseConfigured) {
      dbAPI.insertLog(newLog);
    }

    return 'valid_ok';
  };

  const handleUpdateCapacity = (destinoId: string, delta: number) => {
    setDestinos(prev => prev.map(d => {
      if (d.id === destinoId) {
        const nextCapVal = Math.min(d.maxCapacidad, d.capacidadActual + delta);
        if (isSupabaseConfigured) {
          dbAPI.updateDestinoCapacity(destinoId, nextCapVal);
        }
        return { ...d, capacidadActual: nextCapVal };
      }
      return d;
    }));
  };

  const handleUpdateDestinoConfig = (id: string, updatedConfig: Partial<Destino>) => {
    setDestinos(prev => prev.map(d => {
      if (d.id === id) {
        const full = { ...d, ...updatedConfig };
        if (isSupabaseConfigured) {
          dbAPI.updateDestinoConfig(id, updatedConfig);
        }
        return full;
      }
      return d;
    }));
  };

  const handleMitigateAlert = (id: string) => {
    setAlertas(prev => prev.map(a => {
      if (a.id === id) {
        if (isSupabaseConfigured) {
          dbAPI.updateAlertaEstado(id, 'Mitigada');
        }
        return { ...a, estado: 'Mitigada' };
      }
      return a;
    }));
  };

  const handleToggleEmergency = () => {
    const targetState = !emergenciaActiva;
    setEmergenciaActiva(targetState);

    // Emit and append incident alerts
    const alId = "AL-" + Math.floor(100 + Math.random() * 900);
    const newAlert: AlertaSeguridad = {
      id: alId,
      timestamp: new Date().toTimeString().split(' ')[0],
      origen: "Consola Superadmin MINCUL",
      detalles: targetState 
        ? "Activación preventiva del CIERRE TEMPORAL DE EMERGENCIA en destinos turísticos" 
        : "Desactivación de Alerta de Emergencia - Volviendo a niveles operativos normales",
      gravedad: targetState ? "Crítico" : "Informativo",
      estado: targetState ? "Abierta" : "Mitigada"
    };
    setAlertas(prev => [newAlert, ...prev]);
    if (isSupabaseConfigured) {
      dbAPI.insertAlerta(newAlert);
    }
  };


  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-between font-sans selection:bg-[#D4AF37] selection:text-[#1A1A1A]" id="container-app">
      
      {/* Top Demo Profile Switcher Bar */}
      <div className="bg-[#1A1A1A] p-4 px-6 md:px-12 text-xs font-sans tracking-widest uppercase flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-[#FDFCF8]/10 shadow-lg">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-[#FDFCF8]/40 font-bold block">SGVCTD Perú</span>
            <span className="hidden sm:inline text-[#FDFCF8]/20">•</span>
            <span className="text-[#D4AF37] font-serif italic normal-case tracking-normal text-sm font-medium">Control de Aforo & Capacidad</span>
          </div>
          {/* Supabase Status Indicator Badge */}
          <div className={`ml-3 hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[9.5px] uppercase font-mono tracking-[0.15em] font-extrabold border ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}`}>
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Simulador Local'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#1A1A1A] border border-[#FDFCF8]/10 p-1.5 rounded-lg">
          <span className="text-[9px] uppercase font-bold text-[#FDFCF8]/40 px-3 tracking-[0.2em]">Perfil:</span>
          {[
            { id: 'Visitante', label: '1. Visitante', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'Taquillero', label: '2. Taquilla / Sitio', icon: <QrCode className="w-3.5 h-3.5" /> },
            { id: 'Superadmin', label: '3. Admin Desk', icon: <Monitor className="w-3.5 h-3.5" /> },
            { id: 'SOC', label: '4. Seguridad SOC', icon: <Lock className="w-3.5 h-3.5" /> }
          ].map(p => (
            <button
              key={p.id}
              id={`btn-profile-${p.id}`}
              onClick={() => setActiveProfile(p.id as any)}
              className={`px-3 py-1.5 rounded text-[10px] tracking-wider uppercase font-extrabold transition-all duration-305 cursor-pointer flex items-center gap-1.5 ${activeProfile === p.id ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-md font-black' : 'text-[#FDFCF8]/60 hover:text-[#FDFCF8] hover:bg-[#FDFCF8]/5'}`}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main active Profile Viewport */}
      <main className="flex-1 w-full bg-[#FDFCF8]" id="main-active-viewport">
        {activeProfile === 'Visitante' && (
          <PortalVisitante
            destinos={destinos}
            tickets={tickets}
            onEmitTicket={handleEmitTicket}
            emergenciaActiva={emergenciaActiva}
          />
        )}

        {activeProfile === 'Taquillero' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <PanelTaquilla
              destinos={destinos}
              tickets={tickets}
              onValidateTicket={handleValidateTicket}
              onQuickSale={handleEmitTicket}
              onUpdateCapacity={handleUpdateCapacity}
              emergenciaActiva={emergenciaActiva}
            />
          </div>
        )}

        {activeProfile === 'Superadmin' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <BackofficeAdmin
              destinos={destinos}
              tickets={tickets}
              transactions={transactions}
              onToggleEmergency={handleToggleEmergency}
              emergenciaActiva={emergenciaActiva}
              onUpdateDestinoConfig={handleUpdateDestinoConfig}
              onClearTransactions={() => setTransactions([])}
            />
          </div>
        )}

        {activeProfile === 'SOC' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <ControlSeguridad
              alertas={alertas}
              logs={logs}
              onMitigateAlert={handleMitigateAlert}
              onClearLogs={() => setLogs([])}
            />
          </div>
        )}
      </main>

      {/* Persistent Gemini Assistant floating module */}
      <GeminiAssistant currentRole={
        activeProfile === 'Visitante' ? 'Visitante' :
        activeProfile === 'Taquillero' ? 'Taquillero' :
        activeProfile === 'Superadmin' ? 'Superadmin' : 'SOC'
      } />

      {/* App Institutional Footer */}
      <footer className="bg-[#1A1A1A] text-[#FDFCF8] border-t border-[#1A1A1A]/10 py-10 px-6 md:px-12 text-center text-xs space-y-3 mt-auto">
        <p className="font-serif italic text-lg text-[#D4AF37] tracking-tight">SGVCTD — República del Perú</p>
        <p className="text-[#FDFCF8]/40 font-sans tracking-[0.15em] text-[10px] uppercase">
          Sistema de Gestión de Visita y Capacidad de Carga en Destinos Turísticos
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[#FDFCF8]/30 font-sans text-[10px] uppercase tracking-widest pt-2">
          <span>Edition 2026</span>
          <span>•</span>
          <span>Directiva N° 004-2026-MINCUL</span>
          <span>•</span>
          <span>Regulador SERNANP</span>
          <span>•</span>
          <span>WAF Cybersecurity ISO 27001 Protocol</span>
        </div>
      </footer>

    </div>
  );
}
