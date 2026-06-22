import React, { useState } from "react";
import { QrCode, Ticket as TicketIcon, Sliders, Users, CreditCard, Clock, AlertTriangle, Monitor, Power, CheckCircle, XCircle, Moon, WifiOff } from "lucide-react";
import { Destino, Ticket, Pasajero } from "../types";

interface PanelTaquillaProps {
  destinos: Destino[];
  tickets: Ticket[];
  onValidateTicket: (ticketId: string) => 'valid_ok' | 'clonado' | 'inexistente';
  onQuickSale: (ticket: Ticket) => void;
  onUpdateCapacity: (destinoId: string, delta: number) => void;
  emergenciaActiva: boolean;
}

export default function PanelTaquilla({ destinos, tickets, onValidateTicket, onQuickSale, onUpdateCapacity, emergenciaActiva }: PanelTaquillaProps) {
  // Config state
  const [selectedDestinoId, setSelectedDestinoId] = useState(destinos[0]?.id || "MP-01");
  const [offlineMode, setOfflineMode] = useState(false);

  React.useEffect(() => {
    if (destinos.length > 0 && !destinos.some(d => d.id === selectedDestinoId)) {
      setSelectedDestinoId(destinos[0].id);
    }
  }, [destinos, selectedDestinoId]);
  
  // Rapid Sales fields
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'Pasaporte'>('DNI');
  const [nroDocumento, setNroDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoTarifa, setTipoTarifa] = useState<'Nacional' | 'Extranjero' | 'Estudiante'>('Nacional');
  const [horarioIngreso, setHorarioIngreso] = useState("08:00 - 10:00");

  // QR scanner scan simulator state
  const [selectedTicketToScanId, setSelectedTicketToScanId] = useState("");
  const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'fraud' | 'error'; message: string; ticket?: Ticket } | null>({ status: 'idle', message: "Coloca un boleto digital para simular el escaneo." });

  // Get current active destination technical indicators
  const activeDestino = destinos.find(d => d.id === selectedDestinoId) || destinos[0];
  const occupancyPercentage = Math.round((activeDestino.capacidadActual / activeDestino.maxCapacidad) * 100);
  
  // Semaphore color logic
  let semaphoreColor = "bg-green-500 text-white";
  let borderSemester = "border-green-500 text-green-700";
  let bgSemester = "bg-green-50";
  if (occupancyPercentage > 85 || emergenciaActiva) {
    semaphoreColor = "bg-red-650 text-white";
    borderSemester = "border-red-600 text-red-700 font-bold";
    bgSemester = "bg-red-50";
  } else if (occupancyPercentage > 65) {
    semaphoreColor = "bg-amber-500 text-slate-900";
    borderSemester = "border-amber-500 text-amber-700 font-semibold";
    bgSemester = "bg-amber-50";
  }

  // Handle Quick sale from Cashier desk
  const handleCashierSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (emergenciaActiva) {
      alert("La venta está bloqueada debido al Cierre de Emergencia decretado por MINCUL.");
      return;
    }
    if (!nroDocumento || !nombres || !apellidos) {
      alert("Completa todos los datos obligatorios del pasajero.");
      return;
    }

    const price = tipoTarifa === 'Nacional' ? activeDestino.precioBase : 
                  tipoTarifa === 'Extranjero' ? activeDestino.precioExtranjero : 
                  Math.round(activeDestino.precioBase * 0.5);

    const ticketId = "SGV-C" + Math.floor(10000 + Math.random() * 90000);
    const mockPassenger: Pasajero = {
      id: "p_quick",
      nombres,
      apellidos,
      tipoDocumento,
      nroDocumento,
      pais: tipoTarifa === 'Nacional' ? 'Perú' : 'Extranjero',
      tipoTarifa,
      precio: price
    };

    const newTicket: Ticket = {
      id: ticketId,
      destinoId: activeDestino.id,
      destinoNombre: activeDestino.nombre,
      fechaVisita: new Date().toISOString().split('T')[0],
      horario: horarioIngreso,
      pasajeros: [mockPassenger],
      total: price,
      metodoPago: 'Yape',
      estado: 'Emitido',
      codigoQR: `SGVCTD_TICKET_${activeDestino.id}_${ticketId}_ACTIVE`,
      fechaEmision: new Date().toISOString()
    };

    onQuickSale(newTicket);
    // Auto-select for quick scan simulator convenience!
    setSelectedTicketToScanId(ticketId);
    
    // Reset forms
    setNroDocumento("");
    setNombres("");
    setApellidos("");
    alert(`¡Boleto ${ticketId} emitido correctamente en caja! Puedes escanearlo a la derecha.`);
  };

  // Run validation scan simulation
  const handleScanSimulation = () => {
    if (!selectedTicketToScanId) {
      setScanResult({
        status: 'error',
        message: "Por favor selecciona un boleto o de la lista de emitidos para escanear."
      });
      return;
    }

    const ticket = tickets.find(t => t.id === selectedTicketToScanId);
    if (!ticket) {
      setScanResult({ status: 'error', message: "Código QR inexistente u corrupto." });
      return;
    }

    // Call state validation
    const valResult = onValidateTicket(ticket.id);

    if (valResult === 'valid_ok') {
      // Success access
      setScanResult({
        status: 'success',
        message: "✓ ACCESO AUTORIZADO - BIENVENIDO",
        ticket: { ...ticket, estado: 'Validado' }
      });
      // Increment actual local guests
      onUpdateCapacity(ticket.destinoId, ticket.pasajeros.length);
    } else if (valResult === 'clonado') {
      // Fraud incident alert
      setScanResult({
        status: 'fraud',
        message: "🚫 TICKET DUPLICADO - ALERTA DE FRAUDE\nIntento de reingreso bloqueado con este ticket.",
        ticket
      });
    } else {
      // Corrupt/Other error
      setScanResult({
        status: 'error',
        message: "❌ TICKET NO VÁLIDO\nNo se encuentra en los registros oficiales."
      });
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] text-[#1A1A1A] p-6 md:p-10 rounded-none shadow-lg space-y-8 border border-[#1A1A1A]/10 animate-fade-in" id="panel-taquilla-wrapper">
      
      {/* Operating system Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#1A1A1A] text-[#FDFCF8] p-3 rounded-none border border-[#1A1A1A]">
            <Monitor className="w-5 h-5 animate-pulse text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-sans tracking-[0.18em] font-extrabold text-[#1A1A1A] bg-[#D4AF37] px-2.5 py-1">Módulo de Taquilla</span>
              {offlineMode && <span className="text-[9px] uppercase font-sans tracking-[0.18em] font-extrabold bg-[#1A1A1A] text-[#D4AF37] px-2 py-0.5 border border-[#D4AF37]/30 flex items-center gap-1"><WifiOff className="w-2.5 h-2.5" /> Modo Offline</span>}
            </div>
            <h2 className="font-serif font-black text-2xl text-[#1A1A1A] tracking-tight -mt-0.5 pt-1">Control de Aforo & Taquilla de Acceso</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Terminal Punto de Venta (POS) y Validador de Tickets en Puerta Oficial</p>
          </div>
        </div>

        {/* Operating options toggle switch */}
        <div className="flex items-center gap-4 text-[10px] font-sans tracking-wider uppercase">
          <div className="flex bg-[#FDFCF8] p-1.5 rounded-none border border-[#1A1A1A]/15">
            <button
              onClick={() => setOfflineMode(false)}
              className={`px-3 py-1.5 rounded-none font-bold transition-all cursor-pointer ${!offlineMode ? 'bg-[#1A1A1A] text-[#FDFCF8]' : 'text-slate-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              En Línea
            </button>
            <button
              onClick={() => setOfflineMode(true)}
              className={`px-3 py-1.5 rounded-none font-bold transition-all cursor-pointer ${offlineMode ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-slate-400 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'}`}
            >
              Fuera de Línea
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Operations & Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: LIVE CAPACITY GAUGE */}
        <div className="bg-[#FDFCF8] p-6 rounded-none border border-[#1A1A1A]/10 space-y-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-4">Métrico de Aforo del Sitio</span>
            
            <div className="flex justify-between items-center">
              <div className="space-y-1.5 w-full">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Destino de Control</label>
                <select
                  value={selectedDestinoId}
                  onChange={(e) => {
                    setSelectedDestinoId(e.target.value);
                    setScanResult({ status: 'idle', message: 'Coloca un boleto digital para simular el escaneo.' });
                  }}
                  className="bg-[#FDFCF8] text-[#1A1A1A] text-xs font-bold border border-[#1A1A1A]/20 rounded-none px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-full"
                >
                  {destinos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Semicircular Gauge SVG */}
          <div className="relative py-6 flex flex-col items-center justify-center space-y-3">
            <svg className="w-48 h-28" viewBox="0 0 100 50">
              {/* Back Circle path */}
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#EAE8E4" strokeWidth="8" strokeLinecap="round" />
              {/* Front progress index path */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke={occupancyPercentage > 85 || emergenciaActiva ? '#ef4444' : occupancyPercentage > 65 ? '#D4AF37' : '#1A1A1A'} 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="125" 
                strokeDashoffset={125 - (125 * (emergenciaActiva ? 100 : Math.min(100, occupancyPercentage))) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute top-16 text-center">
              <span className="text-2xl font-black text-[#1A1A1A] block font-serif">
                {emergenciaActiva ? "CIERRE" : `${occupancyPercentage}%`}
              </span>
              <span className="text-[9px] uppercase font-sans font-bold tracking-[0.15em] text-slate-400 block">Aforo Utilizado</span>
            </div>

            <div className={`mt-4 px-4 py-1.5 rounded-none text-[9px] font-sans tracking-[0.12em] text-center uppercase font-bold border ${borderSemester} ${bgSemester}`}>
              {emergenciaActiva ? "SEMÁFORO: BLOQUEADO" : occupancyPercentage > 85 ? "SEMÁFORO: CRÍTICO" : occupancyPercentage > 65 ? "SEMÁFORO: PRECAUCIÓN" : "SEMÁFORO: ESTABLE"}
            </div>
          </div>

          {/* Quick Technical Counters */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#1A1A1A]/10 pt-5 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block uppercase text-[10px] tracking-wider">INGRESADOS HOY</span>
              <span className="text-[#1A1A1A] text-lg font-bold block">
                {emergenciaActiva ? "0" : activeDestino.capacidadActual} <span className="text-xs text-slate-450 font-normal">pax</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block uppercase text-[10px tracking-wider]">AFORO MÁXIMO</span>
              <span className="text-slate-600 text-lg font-bold block">
                {activeDestino.maxCapacidad} <span className="text-xs text-slate-450 font-normal">pax</span>
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: QUICK SALES TICKET POS FORM */}
        <div className="bg-[#FDFCF8] p-6 rounded-none border border-[#1A1A1A]/10 shadow-sm">
          <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-4">Venta de Tickets en Taquilla (Caja)</span>
          
          <form onSubmit={handleCashierSale} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Horario</label>
                <select
                  value={horarioIngreso}
                  onChange={(e) => setHorarioIngreso(e.target.value)}
                  className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-2.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full font-bold"
                >
                  {activeDestino.horarios.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Tarifa Caja</label>
                <select
                  value={tipoTarifa}
                  onChange={(e) => setTipoTarifa(e.target.value as any)}
                  className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-2.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full font-bold"
                >
                  <option value="Nacional">Nacional (S/ {activeDestino.precioBase})</option>
                  <option value="Extranjero">Extranjero (S/ {activeDestino.precioExtranjero})</option>
                  <option value="Estudiante">Estud. (S/ {Math.round(activeDestino.precioBase * 0.5)})</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Doc. Identidad</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as any)}
                  className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-2.5 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full"
                >
                  <option value="DNI">DNI (Perú)</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
 
              <div className="space-y-1">
                <label className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider">Nro Documento</label>
                <input
                  type="text"
                  placeholder="DNI/Pasaporte"
                  value={nroDocumento}
                  onChange={(e) => setNroDocumento(e.target.value)}
                  className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full"
                  required
                />
              </div>
            </div>
 
            <div className="space-y-1">
              <label className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider">Nombres del Visitante</label>
              <input
                type="text"
                placeholder="Nombres completos"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full"
                required
              />
            </div>
 
            <div className="space-y-1">
              <label className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider">Apellidos del Visitante</label>
              <input
                type="text"
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] w-full"
                required
              />
            </div>
 
            <div className="bg-[#1A1A1A] text-[#FDFCF8] p-4 rounded-none border border-[#1A1A1A] flex justify-between items-center text-xs mt-3 shadow-inner">
              <span className="text-slate-400 font-bold font-sans tracking-wide uppercase text-[9px]">Total Caja:</span>
              <span className="text-lg font-bold text-[#D4AF37] font-serif">
                S/ {tipoTarifa === 'Nacional' ? activeDestino.precioBase : tipoTarifa === 'Extranjero' ? activeDestino.precioExtranjero : Math.round(activeDestino.precioBase * 0.5)}.00
              </span>
            </div>
 
            <button
              id="btn-cashier-submit"
              type="button" // Use button to trigger manual handle to prevent reload
              onClick={handleCashierSale}
              disabled={emergenciaActiva}
              className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed text-[#FDFCF8] text-[10px] tracking-widest font-extrabold uppercase py-3.5 px-4 rounded-none transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 border border-[#1A1A1A]"
            >
              <TicketIcon className="w-4 h-4" /> Emitir y Generar QR
            </button>
          </form>
        </div>
 
        {/* COLUMN 3: QR READER SIMULATOR */}
        <div className="bg-[#FDFCF8] p-6 rounded-none border border-[#1A1A1A]/10 space-y-5 shadow-sm">
          <div>
            <span className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">Validador de QR en Puerta (Control de Acceso)</span>
            <p className="text-slate-500 text-[10px] leading-relaxed font-sans mt-1">Simula la lectura de la cámara escaneando cualquiera de los boletos ya creados en el sistema.</p>
          </div>
 
          <div className="space-y-3.5 bg-[#FDFCF8] p-4 rounded-none border border-[#1A1A1A]/15">
            <span className="text-[9px] font-sans text-slate-400 block uppercase font-bold tracking-wider">1. Selecciona Boleto para Escanear</span>
            
            <div className="space-y-3">
              <select
                id="select-ticket-scan"
                value={selectedTicketToScanId}
                onChange={(e) => {
                  setSelectedTicketToScanId(e.target.value);
                  setScanResult({ status: 'idle', message: 'Coloca un boleto digital para simular el escaneo.' });
                }}
                className="w-full bg-[#FDFCF8] text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="">-- Escoger boleto de la simulación --</option>
                {tickets.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id} - {t.pasajeros[0]?.nombres} {t.pasajeros[0]?.apellidos} ({t.estado})
                  </option>
                ))}
              </select>
 
              <button
                id="btn-submit-scan"
                type="button"
                onClick={handleScanSimulation}
                className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-[#1A1A1A] text-[#FDFCF8] font-sans tracking-[0.15em] font-extrabold text-[10px] uppercase py-3 px-4 rounded-none border border-[#1A1A1A] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 animate-spin -duration-5000 text-[#D4AF37]" /> Escanear Código QR
              </button>
            </div>
          </div>
 
          {/* Render scan feedback */}
          <div className={`p-4 rounded-none border flex flex-col items-center text-center space-y-3 min-h-[160px] justify-center transition-all ${
            scanResult?.status === 'success' ? 'bg-[#FDFCF8] border-emerald-600/50 text-emerald-800' :
            scanResult?.status === 'fraud' ? 'bg-[#1A1A1A] border-red-950/40 text-red-200 animate-pulse' :
            scanResult?.status === 'error' ? 'bg-[#FDFCF8] border-[#1A1A1A]/15 text-slate-500' :
            'bg-[#FDFCF8] border-[#1A1A1A]/10 text-slate-400'
          }`}>
            {scanResult?.status === 'success' && (
              <>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div className="space-y-0.5">
                  <span className="font-sans font-bold text-[10px] tracking-widest uppercase text-emerald-600 block">{scanResult.message}</span>
                  <span className="font-serif font-bold text-[#1A1A1A] text-sm block">{scanResult.ticket?.destinoNombre}</span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    Visitante: {scanResult.ticket?.pasajeros[0]?.nombres} | Doc: {scanResult.ticket?.pasajeros[0]?.nroDocumento}
                  </span>
                </div>
              </>
            )}
 
            {scanResult?.status === 'fraud' && (
              <>
                <XCircle className="w-8 h-8 text-red-500 animate-bounce" />
                <div className="space-y-0.5">
                  <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-red-400 block">{scanResult.message}</span>
                  <p className="text-[10px] text-slate-400 font-sans max-w-xs pt-1 leading-relaxed">
                    Este código posee firma comprometida o ya sobrepasó el límite horario. Registrado evento en Centro de Seguridad.
                  </p>
                </div>
              </>
            )}
 
            {scanResult?.status === 'error' && (
              <>
                <AlertTriangle className="w-7 h-7 text-[#D4AF37]" />
                <span className="text-[10.5px] font-sans leading-relaxed">{scanResult.message}</span>
              </>
            )}
 
            {scanResult?.status === 'idle' && (
              <>
                <QrCode className="w-8 h-8 text-slate-350" />
                <p className="text-[10px] text-slate-400 font-sans max-w-[200px]">{scanResult.message}</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
