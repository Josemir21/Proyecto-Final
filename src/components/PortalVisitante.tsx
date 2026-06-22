import React, { useState } from "react";
import { Search, Calendar, Users, MapPin, Grid, Shield, Ticket as TicketIcon, QrCode, CreditCard, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, Star, Clock, User, Globe, Compass, FileText } from "lucide-react";
import { Destino, Ticket, Pasajero } from "../types";

interface PortalVisitanteProps {
  destinos: Destino[];
  tickets?: Ticket[];
  onEmitTicket: (ticket: Ticket) => void;
  emergenciaActiva: boolean;
}

export default function PortalVisitante({ destinos, tickets = [], onEmitTicket, emergenciaActiva }: PortalVisitanteProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'inicio' | 'buscador' | 'checkout' | 'tickets'>('inicio');
  
  // Selected ticket for "Mis Boletos" detail view
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("Todos");
  const [searchDate, setSearchDate] = useState("2026-05-29");
  const [searchQty, setSearchQty] = useState(1);

  // Booking states
  const [selectedDestino, setSelectedDestino] = useState<Destino | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [bookingHorario, setBookingHorario] = useState("");
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([
    { id: "1", nombres: "", apellidos: "", tipoDocumento: "DNI", nroDocumento: "", pais: "Perú", tipoTarifa: "Nacional", precio: 0 }
  ]);
  const [metodoPago, setMetodoPago] = useState<'Yape' | 'Tarjetas' | 'BCPPago'>('Yape');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [yapeCelular, setYapeCelular] = useState("");
  const [yapeSimulatedCode, setYapeSimulatedCode] = useState("");

  const handleSelectDestinoForBooking = (destino: Destino) => {
    if (emergenciaActiva) return;
    setSelectedDestino(destino);
    setBookingHorario(destino.horarios[0]);
    // Reset pasajeros
    setPasajeros([
      { id: "1", nombres: "", apellidos: "", tipoDocumento: "DNI", nroDocumento: "", pais: "Perú", tipoTarifa: "Nacional", precio: destino.precioBase }
    ]);
    setCheckoutStep(1);
    setActiveTab('checkout');
  };

  const handleAddPasajero = () => {
    if (!selectedDestino) return;
    const newId = (pasajeros.length + 1).toString();
    setPasajeros([
      ...pasajeros,
      {
        id: newId,
        nombres: "",
        apellidos: "",
        tipoDocumento: "DNI",
        nroDocumento: "",
        pais: "Perú",
        tipoTarifa: "Nacional",
        precio: selectedDestino.precioBase
      }
    ]);
  };

  const handleRemovePasajero = (id: string) => {
    if (pasajeros.length <= 1) return;
    setPasajeros(pasajeros.filter(p => p.id !== id));
  };

  const handlePasajeroChange = (id: string, field: keyof Pasajero, value: any) => {
    if (!selectedDestino) return;
    setPasajeros(pasajeros.map(p => {
      if (p.id === id) {
        let precio = p.precio;
        let tipoTarifa = p.tipoTarifa;
        if (field === 'tipoTarifa') {
          tipoTarifa = value;
          if (value === 'Nacional') precio = selectedDestino.precioBase;
          else if (value === 'Extranjero') precio = selectedDestino.precioExtranjero;
          else if (value === 'Estudiante') precio = Math.round(selectedDestino.precioBase * 0.5); // 50% dscto
        }
        return { ...p, [field]: value, tipoTarifa, precio };
      }
      return p;
    }));
  };

  const calculateTotal = () => {
    return pasajeros.reduce((sum, p) => sum + p.precio, 0);
  };

  const handleSubmitBooking = () => {
    if (!selectedDestino) return;
    
    // Simulate generation of electronic ticket
    const ticketId = "SGV-" + Math.floor(10000 + Math.random() * 90000);
    const newTicket: Ticket = {
      id: ticketId,
      destinoId: selectedDestino.id,
      destinoNombre: selectedDestino.nombre,
      fechaVisita: searchDate,
      horario: bookingHorario,
      pasajeros: [...pasajeros],
      total: calculateTotal(),
      metodoPago: metodoPago,
      estado: 'Emitido',
      codigoQR: `SGVCTD_TICKET_${selectedDestino.id}_${ticketId}_ACTIVE`,
      fechaEmision: new Date().toISOString()
    };

    onEmitTicket(newTicket);
    setIssuedTicket(newTicket);
    setCheckoutStep(4);
  };

  // Filter destinations
  const filteredDestinos = destinos.filter(d => {
    const matchesSearch = d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.departamento.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchCategory === "Todos" || d.categoria === searchCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-[#FAF7F2] font-sans min-h-[92vh] selection:bg-[#C0392B] selection:text-white" id="portal-visitante-main">
      {/* Institutional Top bar (Gobierno del Perú) */}
      <div className="bg-[#1A1A1A] border-b border-[#D4A017]/30 text-[#FAF7F2] text-[10px] tracking-widest py-2 px-6 md:px-12 flex flex-col sm:flex-row gap-3 items-center justify-between font-sans opacity-95">
        <div className="flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Escudo_nacional_del_Per%C3%BA.svg" 
            alt="Escudo Perú" 
            className="h-5 w-auto filter brightness-110 saturate-100" 
            referrerPolicy="no-referrer"
          />
          <div className="border-l border-white/20 pl-3 py-0.5">
            <span className="font-extrabold text-[9px] tracking-[0.2em] block text-white">GOBIERNO DEL PERÚ</span>
            <span className="text-[8px] text-slate-400 block -mt-1 tracking-wider uppercase font-medium">Ministerio de Cultura / SERNANP</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[8.5px] font-sans tracking-widest uppercase text-slate-400">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#D4A017]" /> Transacciones seguras SSL</span>
          <span className="hidden lg:inline bg-white/5 text-[#D4A017] border border-[#D4A017]/10 px-2 py-0.5 text-[7.5px] font-mono tracking-normal">ISO 27001 AUDITED</span>
          <span className="text-slate-300 font-semibold flex items-center gap-1"><Globe className="w-3 h-3 text-[#D4A017]" /> SAVETO Portal Oficial</span>
        </div>
      </div>

      {/* Modern Premium Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#1A1A1A]/5 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Logo Brand */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('inicio')}>
            <div className="bg-[#C0392B] text-white p-2.5 shadow-lg border border-[#C0392B] transition-transform hover:scale-105 duration-300">
              <Compass className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h1 className="text-2xl tracking-tighter text-[#1A1A1A] font-serif font-black flex items-center gap-1 leading-none">
                SAVETO <span className="text-[8px] tracking-[0.25em] font-sans uppercase font-black px-1.5 py-0.5 bg-[#D4A017] text-[#1A1A1A] ml-2">OFICIAL</span>
              </h1>
              <span className="text-[9px] text-[#C0392B] font-sans font-extrabold tracking-[0.15em] block uppercase -mt-0.5">Gestión de Visitas Estatales</span>
            </div>
          </div>

          {/* Quick Search Bar directly in the navbar */}
          <div className="relative w-full max-w-xs md:mx-6">
            <Search className="w-4 h-4 text-[#C0392B] absolute left-3 top-3" />
            <input
              id="nav-quick-search"
              type="text"
              placeholder="Buscar Machu Picchu, Paracas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'buscador') setActiveTab('buscador');
              }}
              className="w-full bg-[#FAF7F2] border border-[#1A1A1A]/10 rounded-full pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#C0392B] focus:border-[#C0392B] focus:outline-none transition-all font-sans placeholder-slate-400"
            />
          </div>

          {/* Links and Actions */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <button
                id="tab-visitor-home"
                onClick={() => setActiveTab('inicio')}
                className={`px-3 py-2 text-[10.5px] tracking-[0.18em] uppercase font-bold transition-all duration-300 cursor-pointer ${activeTab === 'inicio' ? 'border-b-2 border-[#C0392B] text-[#C0392B]' : 'text-[#1A1A1A]/60 hover:text-[#C0392B]'}`}
              >
                Inicio
              </button>
              <button
                id="tab-visitor-search"
                onClick={() => setActiveTab('buscador')}
                className={`px-3 py-2 text-[10.5px] tracking-[0.18em] uppercase font-bold transition-all duration-300 cursor-pointer ${activeTab === 'buscador' ? 'border-b-2 border-[#C0392B] text-[#C0392B]' : 'text-[#1A1A1A]/60 hover:text-[#C0392B]'}`}
              >
                Destinos
              </button>
              <button
                id="tab-visitor-tickets"
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-2 text-[10.5px] tracking-[0.18em] uppercase font-bold transition-all duration-300 cursor-pointer ${activeTab === 'tickets' ? 'border-b-2 border-[#C0392B] text-[#C0392B]' : 'text-[#1A1A1A]/60 hover:text-[#C0392B]'} flex items-center gap-1`}
              >
                Mis Boletos {tickets.length > 0 && <span className="ml-1 bg-[#D4A017] text-[#1A1A1A] font-black px-1.5 py-0.5 font-mono rounded-full text-[8px] animate-pulse">{tickets.length}</span>}
              </button>
            </nav>

            <div className="h-6 w-px bg-[#1A1A1A]/10 hidden lg:block"></div>

            {/* Language Switcher and Login */}
            <div className="flex items-center gap-4 text-xs">
              <div 
                id="lang-selector"
                onClick={() => alert("Simulación de Idioma: Inglés activado para extranjeros. Las tarifas e inputs de pasaporte se ajustan adecuadamente.")}
                className="hidden lg:flex items-center gap-1 text-[#1A1A1A]/60 hover:text-[#C0392B] transition-colors cursor-pointer tracking-wider font-extrabold"
              >
                <span>ES 🌐</span>
                <span className="text-[8px] text-[#D4A017] -mt-0.5">▼</span>
              </div>
              
              <button 
                id="nav-login-action"
                onClick={() => alert("El portal SAVETO utiliza autenticación integrada mediante ID Gob.pe para ciudadanos y pasaportes validados internacionalmente.")}
                className="bg-transparent hover:bg-[#1A1A1A] hover:text-[#FAF7F2] text-[#1A1A1A] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all duration-300 flex items-center gap-1.5 rounded-none"
              >
                <User className="w-3.5 h-3.5" /> Ingresar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Alert Banner */}
      {emergenciaActiva && (
        <div className="bg-[#C0392B] border-y border-[#1A1A1A]/15 text-[#FAF7F2] p-4 text-center text-xs shadow-md flex items-center justify-center gap-3 font-semibold tracking-widest uppercase font-sans animate-pulse">
          <AlertTriangle className="w-5 h-5 text-[#D4A017] shrink-0" />
          <span>CIERRE TEMPORAL DE EMERGENCIA DECRETADO. LAS VENTAS DE PASES QUEDAN TEMPORALMENTE SUSPENDIDAS.</span>
        </div>
      )}

      {/* Main Content Viewport Wrapper */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        
        {/* VIEW 1: LANDING PAGE REDESIGN */}
        {activeTab === 'inicio' && (
          <div className="space-y-20 animate-fade-in">
            
            {/* 1. HERO SECTION WITH DEGRADED GRADIENT OVERLAY */}
            <div className="relative rounded-none border border-[#1A1A1A]/5 overflow-hidden bg-[#1A1A1A] text-white shadow-2xl p-0 min-h-[580px] grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Information content */}
              <div className="lg:col-span-7 flex flex-col justify-center py-16 px-8 md:px-12 lg:px-16 relative z-10 space-y-6">
                {/* Subtle dark background pattern overlay for supreme text contrast */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A] via-[#1A1A1A] to-[#252525] -z-10"></div>
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#D4A017] text-[#1A1A1A] text-[9.5px] font-sans tracking-[0.2em] uppercase font-bold border border-white/10 shadow-lg w-max">
                  🇵🇪 PORTAL NACIONAL DE TURISMO REGULADO
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-[1.05] tracking-tight text-white">
                  Tu pase certificado a las <span className="text-[#D4A017] italic font-normal block font-serif">Maravillas Vivientes del Perú</span>
                </h2>
                
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl font-sans tracking-wide">
                  Accede a la plataforma gubernamental autorizada de boletaje digital de Machu Picchu, Kuélap, Paracas y los principales monumentos patrimoniales del país bajo lineamientos exigentes de aforo científico.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                  <button
                    id="hero-buy-pases"
                    onClick={() => setActiveTab('buscador')}
                    className="bg-[#C0392B] hover:bg-[#D4A017] text-white hover:text-[#1A1A1A] font-black text-[11px] tracking-[0.2em] uppercase px-7 py-4 rounded-none transition-all duration-300 flex items-center justify-center gap-2 border border-[#C0392B] hover:border-[#D4A017] cursor-pointer shadow-md"
                  >
                    COMPRAR BOLETOS <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="hero-view-destinos"
                    onClick={() => {
                      setSearchCategory("Todos");
                      setActiveTab('buscador');
                    }}
                    className="border border-white/60 hover:border-white text-white font-extrabold text-[11px] tracking-[0.2em] uppercase px-7 py-4 rounded-none transition-all duration-300 text-center cursor-pointer hover:bg-white/10"
                  >
                    EXPLORAR DESTINOS
                  </button>
                </div>
              </div>

              {/* Right Column: Beautiful, Unfettered Machu Picchu Picture */}
              <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-full overflow-hidden group border-t lg:border-t-0 lg:border-l border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=1600" 
                  alt="Santuario Histórico de Machu Picchu" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle soft gradient overlay only at the bottom/edges to merge content & highlight labels */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20"></div>
                
                {/* Floating caption badge with high-contrast label */}
                <div className="absolute bottom-6 left-6 right-6 bg-black/85 backdrop-blur-md p-4 border border-white/10 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-mono text-[#D4A017] font-bold block">Maravilla del Mundo</span>
                      <h4 className="font-serif font-bold text-sm text-white mt-0.5">Santuario Histórico de Machu Picchu</h4>
                      <p className="text-[9.5px] text-slate-355 font-sans mt-0.5">Patrimonio Cultural y Natural de la Humanidad</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase text-slate-400 block font-mono">UBICACIÓN</span>
                      <span className="font-bold text-xs text-white">Cusco, Perú</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical active overlay ribbon absolute at the bottom of the left column block */}
              <div className="absolute bottom-6 left-6 md:left-12 z-10 hidden xl:flex items-center gap-3 bg-black/90 backdrop-blur-md p-3 px-4 rounded-none border border-white/10 text-[9.5px] text-slate-300 font-mono tracking-wide">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-extrabold text-white uppercase tracking-widest text-[8.5px]">SISTEMA SGVCTD CONTROL ACTIVO</span>
              </div>
            </div>

            {/* Quick counters grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 md:p-8 border border-[#1A1A1A]/5 shadow-sm">
              {[
                { label: "Santuarios de Aforo", value: "Aforo Regulado", desc: "Monitoreado en vivo conforme a parámetros ecológicos." },
                { label: "Medio de Pago", value: "Transacción 0%", desc: "Billeteras oficiales sin sobrecargos ni comisiones de terceros." },
                { label: "Seguridad Integral", value: "Código QR Cifrado", desc: "Integridad del ticket físico resguardado digitalmente." },
                { label: "Acceso Instantáneo", value: "Emisión en 1s", desc: "Recibe tu PDF y boleto con QR inmediatamente en tu email." }
              ].map((st, i) => (
                <div key={i} className="space-y-2 border-l border-[#D4A017]/40 pl-4">
                  <span className="text-[9px] text-[#C0392B] font-sans font-black uppercase tracking-widest block">{st.label}</span>
                  <h5 className="text-base font-serif italic font-bold text-[#1A1A1A]">{st.value}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* 2. COMPRA EN 3 PASOS SECTION WITH CUSTOM STYLING & CONECTORA */}
            <div className="bg-[#FAF7F2] p-10 md:p-14 border border-[#1A1A1A]/5 rounded-none space-y-12">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className="text-[9px] font-extrabold text-[#C0392B] tracking-[0.25em] uppercase block">PROCESO INTEGRADO DE COMPRA</span>
                <h3 className="text-3xl md:text-4xl font-serif font-black text-[#1A1A1A]">Tu pase oficial en 3 pasos</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Olvídate de colas eternas y fraudes físicos. Compra desde cualquier lugar de forma ágil y 100% legal.</p>
              </div>

              {/* Step Flow layout with connector line */}
              <div className="relative py-4">
                {/* Horizontal connection line for desktop */}
                <div className="absolute top-1/2 left-[12%] right-[12%] h-px border-t border-[#D4A017]/35 hidden md:block z-0 -translate-y-[22px]"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center space-y-4 group">
                    <div className="w-14 h-14 bg-white border border-[#1A1A1A]/10 text-[#C0392B] transition-all duration-300 group-hover:scale-105 group-hover:border-[#C0392B] flex items-center justify-center relative shadow-md">
                      <Compass className="w-6 h-6 text-[#C0392B]" />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#D4A017] text-[#1A1A1A] w-5 h-5 flex items-center justify-center font-serif font-bold text-[10px] shadow-sm">
                        1
                      </span>
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h4 className="font-serif font-bold text-[#1A1A1A] text-lg">1. Escoge tu Destino</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Selecciona el parque arqueológico, la fecha oficial de viaje y el turno técnico adecuado según tu plan.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center space-y-4 group">
                    <div className="w-14 h-14 bg-white border border-[#1A1A1A]/10 text-[#C0392B] transition-all duration-300 group-hover:scale-105 group-hover:border-[#C0392B] flex items-center justify-center relative shadow-md">
                      <CreditCard className="w-6 h-6 text-[#C0392B]" />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#D4A017] text-[#1A1A1A] w-5 h-5 flex items-center justify-center font-serif font-bold text-[10px] shadow-sm">
                        2
                      </span>
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h4 className="font-serif font-bold text-[#1A1A1A] text-lg">2. Pago Seguro Sincronizado</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Realiza el pago con cero comisiones adicionales mediante tu número Yape, BCP instantáneo o tarjetas internacionales.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center space-y-4 group">
                    <div className="w-14 h-14 bg-white border border-[#1A1A1A]/10 text-[#C0392B] transition-all duration-300 group-hover:scale-105 group-hover:border-[#C0392B] flex items-center justify-center relative shadow-md">
                      <QrCode className="w-6 h-6 text-[#C0392B]" />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#D4A017] text-[#1A1A1A] w-5 h-5 flex items-center justify-center font-serif font-bold text-[10px] shadow-sm">
                        3
                      </span>
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h4 className="font-serif font-bold text-[#1A1A1A] text-lg">3. Boleto Electrónico Activo</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Tus accesos se emiten en línea autorizando tu ingreso. Se genera un pase con QR dinámico que puedes guardar en tu móvil.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. DESTINOS DESTACADOS SECTION WITH MAGAZINE EDITORIAL DESIGN */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1A1A1A]/10 pb-4 gap-4">
                <div>
                  <span className="text-[9px] font-extrabold text-[#C0392B] tracking-[0.2em] uppercase block">PASES DESTACADOS DEL ESTADO</span>
                  <h3 className="text-3xl font-serif font-black text-[#1A1A1A] tracking-tight">Santuarios y Destinos Oficiales</h3>
                  <p className="text-xs text-slate-500 mt-1">Garantiza tu pase regulado y respeta la capacidad de carga del monumento arqueológico nacional.</p>
                </div>
                <button 
                  id="tab-go-all-destinos"
                  onClick={() => { setSearchCategory("Todos"); setActiveTab('buscador'); }}
                  className="text-[#C0392B] hover:text-[#D4A017] font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer self-start md:self-auto border-b border-[#C0392B] pb-1 hover:border-[#D4A017]"
                >
                  VER TODOS LOS DESTINOS <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Magazine Editorial columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {destinos.slice(0, 3).map((dest) => {
                  {/* Categoría color indicator to comply with details "Verde Selva" */}
                  const categoryBadgeBg = "bg-[#2D6A4F]"; // Verde Selva for all badges as requested
                  return (
                    <div 
                      key={dest.id} 
                      id={`dest-card-landing-${dest.id}`}
                      className="group relative h-[440px] w-full rounded-none overflow-hidden border border-[#1A1A1A]/10 shadow-lg hover:shadow-2xl transition-all duration-550 cursor-pointer flex flex-col justify-end bg-black"
                      onClick={() => handleSelectDestinoForBooking(dest)}
                    >
                      {/* Full height background image */}
                      <div className="absolute inset-0">
                        <img 
                          src={dest.imagen} 
                          alt={dest.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90" 
                          referrerPolicy="no-referrer"
                        />
                        {/* Smooth dual gradient overlay for editorial look */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent transition-opacity duration-300 opacity-95 group-hover:opacity-90"></div>
                      </div>

                      {/* Top labels */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-15">
                        <span className={`px-2.5 py-1 text-[8.5px] uppercase font-bold tracking-widest ${categoryBadgeBg} text-white shadow-md`}>
                          {dest.categoria}
                        </span>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="bg-[#D4A017] text-[#1A1A1A] font-extrabold text-[8.5px] uppercase tracking-widest px-2.5 py-1 flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-current" /> {dest.rating}
                          </span>
                          <span className="bg-white text-[#C0392B] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                            {dest.id === 'MP-01' || dest.id === 'a1b2c3d4-e5f6-7890-1234-56789abcdef0' || dest.nombre.toLowerCase().includes('machu') ? 'MÁS RESERVADO' : 'TEMPORADA'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom editorial content panel */}
                      <div className="relative z-10 p-6 space-y-4 transition-transform duration-500 transform group-hover:-translate-y-1">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-extrabold text-[#D4A017] tracking-widest flex items-center gap-1 font-sans">
                            <MapPin className="w-3.5 h-3.5 text-[#D4A017]" /> {dest.ubicacion}, {dest.departamento}
                          </p>
                          <h4 className="font-serif font-black text-white text-2xl leading-none">
                            {dest.nombre}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-2 pt-1">
                            {dest.descripcion}
                          </p>
                        </div>

                        {/* Aforo custom indicator bar inside the magazine card */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                            <span>Aforo ocupado hoy</span>
                            <span className="font-semibold text-white">{Math.round((dest.capacidadActual / dest.maxCapacidad) * 100)}%</span>
                          </div>
                          <div className="w-full h-[3px] bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-[#D4A017] transition-all duration-500"
                              style={{ width: `${(dest.capacidadActual / dest.maxCapacidad) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Price and Action button appearing smoothly on hover */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block font-sans">Tarifa Nacional</span>
                            <span className="text-lg font-serif font-black text-white">S/ {dest.precioBase}.00</span>
                          </div>
                          
                          <button
                            id={`dest-card-cta-main-${dest.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDestinoForBooking(dest);
                            }}
                            disabled={emergenciaActiva}
                            className="bg-[#C0392B] hover:bg-[#D4A017] hover:text-[#1A1A1A] text-white text-[9.5px] uppercase font-bold tracking-widest px-4 py-2.5 transition-all duration-300 flex items-center gap-1.5 rounded-none"
                          >
                            RESERVAR <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SEARCH ENGINE */}
        {activeTab === 'buscador' && (
          <div className="space-y-6 animate-fade-in text-[#1A1A1A]">
            <div className="bg-[#FDFCF8] p-6 rounded-none border border-[#1A1A1A]/15 shadow-sm space-y-4">
              <h3 className="font-serif font-black text-[#1A1A1A] text-xl">Buscador Oficial de Disponibilidad de Boletos</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed -mt-3">Consulte en tiempo real los cupos técnicos disponibles establecidos por el Ministerio de Cultura y el SERNANP.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-[#1A1A1A]/60 font-bold uppercase tracking-wider block">Buscar destino o región</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Ej. Machu Picchu, Cusco..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none pl-10 pr-4 py-2.5 text-xs focus:border-[#1A1A1A] focus:outline-none transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-[#1A1A1A]/60 font-bold uppercase tracking-wider block">Categoría de Destino</label>
                  <select
                    id="search-select-category"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none px-3.5 py-2.5 text-xs focus:border-[#1A1A1A] focus:outline-none transition-all"
                  >
                    <option value="Todos">Todas las categorías</option>
                    <option value="Inca">Cultura Inca</option>
                    <option value="Pre-Inca">Cultura Pre-Inca</option>
                    <option value="Naturaleza">Naturaleza y Paisaje</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-[#1A1A1A]/60 font-bold uppercase tracking-wider block">Fecha de Visita</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="search-input-date"
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none pl-10 pr-4 py-2.5 text-xs focus:border-[#1A1A1A] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-[#1A1A1A]/60 font-bold uppercase tracking-wider block">Nro de Visitantes</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-450 absolute left-3.5 top-3.5" />
                    <input
                      id="search-input-qty"
                      type="number"
                      min={1}
                      max={10}
                      value={searchQty}
                      onChange={(e) => setSearchQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#FDFCF8] border border-[#1A1A1A]/15 rounded-none pl-10 pr-4 py-2.5 text-xs focus:border-[#1A1A1A] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinos.length > 0 ? (
                filteredDestinos.map(dest => (
                  <div key={dest.id} className="bg-[#FDFCF8] rounded-none overflow-hidden border border-[#1A1A1A]/15 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
                    <div className="relative h-44 bg-slate-50 overflow-hidden border-b border-[#1A1A1A]/10">
                      <img src={dest.imagen} alt={dest.nombre} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <span className="absolute top-3 left-3 bg-[#1A1A1A] text-[#FDFCF8] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">{dest.categoria}</span>
                      <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#1A1A1A] px-2 py-0.5 text-[9px] font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 text-[#1A1A1A] fill-[#1A1A1A]" /> {dest.rating}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-[#1A1A1A] text-lg leading-tight">{dest.nombre}</h4>
                        <p className="text-[10px] tracking-wider uppercase text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {dest.ubicacion}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">{dest.descripcion}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#1A1A1A]/10">
                        {/* Live availability bar */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 uppercase tracking-wider">Aforo ocupado hoy</span>
                            <span className="font-sans font-bold text-slate-800">{dest.capacidadActual} / <span className="text-slate-450 font-normal">{dest.maxCapacidad}</span></span>
                          </div>
                          <div className="w-full h-[3px] bg-slate-100 rounded-none overflow-hidden">
                            <div 
                              className={`h-full rounded-none transition-all duration-500 ${
                                (dest.capacidadActual / dest.maxCapacidad) > 0.85 ? 'bg-red-500' : (dest.capacidadActual / dest.maxCapacidad) > 0.6 ? 'bg-[#D4AF37]' : 'bg-[#1A1A1A]'
                              }`}
                              style={{ width: `${(dest.capacidadActual / dest.maxCapacidad) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[9px] text-[#1A1A1A]/40 font-bold block uppercase tracking-wider font-sans">Nacional desde</span>
                            <span className="text-xl font-serif font-bold text-[#1A1A1A]">S/ {dest.precioBase}.00</span>
                          </div>
                          <button
                            onClick={() => handleSelectDestinoForBooking(dest)}
                            disabled={emergenciaActiva}
                            className="bg-[#1A1A1A] text-[#FDFCF8] hover:bg-[#D4AF37] hover:text-[#1A1A1A] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-[10px] tracking-widest font-extrabold uppercase px-5 py-3 rounded-none transition-all cursor-pointer border border-[#1A1A1A]"
                          >
                            Reservar entrada
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-505 bg-white rounded-2xl border border-gray-150">
                  <AlertTriangle className="w-10 h-10 text-[#D4AF37] mx-auto mb-2" />
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">No pudimos encontrar destinos con los filtros de búsqueda colocados.</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Intenta ajustando el nombre o cambia el filtro de categoría.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: CHECKOUT STEPPER CLIENT-SIDE SIMULATION */}
        {activeTab === 'checkout' && selectedDestino && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pr-0 md:pr-4" id="checkout-container">
            {/* Steps & Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stepper Header */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-center">
                {[
                  { n: 1, label: "Turno" },
                  { n: 2, label: "Pasajeros" },
                  { n: 3, label: "Pago" },
                  { n: 4, label: "Confirmación" }
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${checkoutStep === s.n ? 'bg-red-600 text-white shadow-md' : checkoutStep > s.n ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-400'}`}>
                      {checkoutStep > s.n ? '✓' : s.n}
                    </span>
                    <span className={`text-xs font-semibold hidden md:inline ${checkoutStep === s.n ? 'text-slate-900 font-bold' : 'text-slate-450'}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: HORARIO SELECTION */}
              {checkoutStep === 1 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Paso 1: Selección de Horario de Visita</h3>
                    <p className="text-xs text-slate-500">Selecciona uno de los turnos habilitados por las autoridades del parque arqueológico.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDestino.horarios.map((hor, idx) => (
                      <label key={idx} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${bookingHorario === hor ? 'border-red-600 bg-red-50/40 text-red-950 font-bold' : 'border-gray-200 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="radio-horario"
                            value={hor}
                            checked={bookingHorario === hor}
                            onChange={() => setBookingHorario(hor)}
                            className="accent-red-600"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs block font-bold">{hor}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Duración máxima sugerida: 3h</span>
                          </div>
                        </div>
                        <span className="text-[10.5px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">Cupos Dispo</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PASAJERO DETAILS */}
              {checkoutStep === 2 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Paso 2: Registro de Visitantes</h3>
                      <p className="text-xs text-slate-500">Configura la tarifa y datos oficiales para fines de control de capacidad.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPasajero}
                      className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      + Registrar otro visitante
                    </button>
                  </div>

                  <div className="space-y-6">
                    {pasajeros.map((p, idx) => (
                      <div key={p.id} className="p-4 rounded-xl border border-gray-150 relative space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span className="text-xs font-extrabold text-slate-800">Visitante #{idx + 1}</span>
                          {pasajeros.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePasajero(p.id)}
                              className="text-slate-400 hover:text-red-600 text-[11px] font-bold cursor-pointer"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">Tarifa Aplicable</label>
                            <select
                              value={p.tipoTarifa}
                              onChange={(e) => handlePasajeroChange(p.id, 'tipoTarifa', e.target.value)}
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500/25"
                            >
                              <option value="Nacional">Nacional (S/ {selectedDestino.precioBase}.00)</option>
                              <option value="Extranjero">Extranjero (S/ {selectedDestino.precioExtranjero}.00)</option>
                              <option value="Estudiante">Estudiante -50% (S/ {Math.round(selectedDestino.precioBase * 0.5)}.00)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">Tipo Documento</label>
                            <select
                              value={p.tipoDocumento}
                              onChange={(e) => handlePasajeroChange(p.id, 'tipoDocumento', e.target.value)}
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                            >
                              <option value="DNI">DNI (Perú)</option>
                              <option value="Pasaporte">Pasaporte</option>
                              <option value="CE">C.E.</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">Nro de Documento</label>
                            <input
                              type="text"
                              value={p.nroDocumento}
                              onChange={(e) => handlePasajeroChange(p.id, 'nroDocumento', e.target.value)}
                              placeholder="Ej. 48210943"
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500/25"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">Nombres</label>
                            <input
                              type="text"
                              value={p.nombres}
                              onChange={(e) => handlePasajeroChange(p.id, 'nombres', e.target.value)}
                              placeholder="Ej. Carlos Alfredo"
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">Apellidos</label>
                            <input
                              type="text"
                              value={p.apellidos}
                              onChange={(e) => handlePasajeroChange(p.id, 'apellidos', e.target.value)}
                              placeholder="Ej. Rojas Perez"
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10.5px] text-slate-400 font-bold block">País de Residencia</label>
                            <input
                              type="text"
                              value={p.pais}
                              onChange={(e) => handlePasajeroChange(p.id, 'pais', e.target.value)}
                              placeholder="Ej. Perú, Colombia, etc."
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-gray-150">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => {
                        // Validate
                        const valid = pasajeros.every(p => p.nroDocumento && p.nombres && p.apellidos);
                        if (!valid) {
                          alert("Por favor, llena los datos obligatorios de pasaporte y nombre de todos los pasajeros.");
                          return;
                        }
                        setCheckoutStep(3);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      Ir al Pago Seguro <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASARELA DE PAGO */}
              {checkoutStep === 3 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Paso 3: Pasarela de Pago Seguro</h3>
                    <p className="text-xs text-slate-500">Transacciones protegidas con estándares WAF y encriptación de datos.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'Yape', label: 'Simulador YAPE', desc: 'Pago Código Rápido 0% recargo', icon: <QrCode className="w-4 h-4 text-purple-600" /> },
                      { id: 'Tarjetas', label: 'Banca Tarjetas', desc: 'Visa, Mastercard o AMEX', icon: <CreditCard className="w-4 h-4 text-blue-600" /> },
                      { id: 'BCPPago', label: 'Pasarela BCP', desc: 'Banca Móvil instantánea', icon: <Users className="w-4 h-4 text-amber-500" /> }
                    ].map((met) => (
                      <label key={met.id} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${metodoPago === met.id ? 'border-red-600 bg-red-50/20' : 'border-gray-200 hover:bg-slate-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {met.icon}
                            <span className="text-xs font-bold text-slate-900 block">{met.label}</span>
                          </div>
                          <input
                            type="radio"
                            name="radio-metodopago"
                            value={met.id}
                            checked={metodoPago === met.id}
                            onChange={() => setMetodoPago(met.id as any)}
                            className="accent-red-600"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{met.desc}</span>
                      </label>
                    ))}
                  </div>

                  {/* Payment Details Simulator */}
                  {metodoPago === 'Yape' && (
                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-purple-700 font-mono text-xl italic italic-all leading-none">Yape!</span>
                        <span className="text-xs text-purple-800 font-medium font-sans">Pago Inteligente mediante Código QR de Aprobación</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-purple-900 font-bold block">Celular del Yapeador</label>
                          <input
                            type="tel"
                            placeholder="Ej. 982104523"
                            value={yapeCelular}
                            onChange={(e) => setYapeCelular(e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-purple-900 font-bold block">Código de Aprobación (6 dígitos en App Yape)</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Ej. 410425"
                            value={yapeSimulatedCode}
                            onChange={(e) => setYapeSimulatedCode(e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {metodoPago === 'Tarjetas' && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200 space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        <span className="text-xs font-bold text-slate-700">Tarjeta de Crédito o Débito</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10.5px] text-slate-500 font-bold">Número de Tarjeta</label>
                          <input
                            type="text"
                            placeholder="4540 1204 9403 3891"
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-500 font-bold">Fecha Exp (MM/AA)</label>
                          <input
                            type="text"
                            placeholder="08/29"
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {metodoPago === 'BCPPago' && (
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 space-y-2">
                      <span className="font-bold block text-sm">Transferencia Banca Móvil BCP</span>
                      <p>Para completar el pago, ingresa a tu aplicación de banca móvil BCP o Telecrédito, busca la opción de "Pagos de Servicios", selecciona "Ministerio de Cultura / SGVCTD" y paga con tu número de DNI registrado.</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-150">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => {
                        if (metodoPago === 'Yape' && (!yapeCelular || !yapeSimulatedCode)) {
                          alert("Por favor ingresa un número de celular de prueba y código de aprobación Yape.");
                          return;
                        }
                        handleSubmitBooking();
                      }}
                      className="bg-red-650 hover:bg-red-700 text-white text-xs font-extrabold px-7 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      Confirmar y Emitir Boletos <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMATION & TICKET PRESENTATION */}
              {checkoutStep === 4 && issuedTicket && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md space-y-6 text-center animate-bounce-short">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-green-100 rounded-full text-green-700">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">¡Boleto Digital Emitido de Forma Exitosa!</h3>
                    <p className="text-xs text-slate-500 max-w-lg">Transacción completada bajo los lineamientos del SGVCTD y la norma ISO 27001. Tu boleto ya está activo en los servidores centrales de aforo.</p>
                  </div>

                  {/* Printable physical looking ticket mockup */}
                  <div className="max-w-md mx-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl overflow-hidden shadow-xl text-left border border-slate-800">
                    {/* Ticket Header */}
                    <div className="bg-red-600 p-4 border-b border-white/10 flex justify-between items-center bg-[radial-gradient(ellipse_at_top,#b91c1c_30%,transparent_70%)]">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        <span className="font-mono font-bold text-[11px] tracking-wider uppercase">BOLETO ELECTRÓNICO</span>
                      </div>
                      <span className="font-mono font-bold text-xs bg-slate-950/50 px-2 py-0.5 rounded border border-white/10">{issuedTicket.id}</span>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Destination Name */}
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold block">Destino Protegido</span>
                        <h4 className="font-bold text-lg text-white font-sans">{issuedTicket.destinoNombre}</h4>
                        <span className="text-xs text-slate-400 block">{selectedDestino.ubicacion}, {selectedDestino.departamento}</span>
                      </div>

                      {/* Visitor details table */}
                      <div className="border-t border-b border-white/10 py-3 space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Datos de los Visitantes</span>
                        {issuedTicket.pasajeros.map((pas) => (
                          <div key={pas.id} className="flex justify-between text-xs py-1 hover:bg-white/5 px-2 rounded">
                            <div>
                              <span className="block font-semibold text-white">{pas.nombres} {pas.apellidos}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{pas.tipoDocumento}: {pas.nroDocumento} | {pas.pais}</span>
                            </div>
                            <span className="font-bold text-amber-400 shrink-0">{pas.tipoTarifa}</span>
                          </div>
                        ))}
                      </div>

                      {/* Scheduling grid */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Fecha Visita</span>
                          <span className="text-slate-200 block font-bold">{issuedTicket.fechaVisita}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Horario de Ingreso</span>
                          <span className="text-slate-200 block font-bold">{issuedTicket.horario}</span>
                        </div>
                      </div>

                      {/* Footer QR generator block */}
                      <div className="bg-white text-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Lector en Sitio</span>
                          <span className="text-xs font-bold font-sans block text-slate-800">CÓDIGO QR SEGURO</span>
                          <p className="text-[10px] text-slate-505 font-sans leading-tight">Muestra este código en la puerta del parque. Se registrará tu aforo.</p>
                        </div>
                        
                        {/* Interactive Generated QR code container with animations */}
                        <div className="bg-gradient-to-tr from-red-600 to-amber-500 p-1.5 rounded-xl shrink-0">
                          <div className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col items-center">
                            <QrCode className="w-16 h-16 text-slate-900" />
                            <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-tight">{issuedTicket.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-3">
                    <button
                      onClick={() => setActiveTab('inicio')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Volver a Inicio
                    </button>
                    <button
                      onClick={() => {
                        alert("Un simulador de impresión de ticket PDF ha sido enviado al registro de tu cuenta.");
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Imprimir Ticket (Descargar)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Pricing & Information Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1">
                  <TicketIcon className="w-4 h-4 text-slate-500" /> Resumen de Compra
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">DESTINO SELECCIONADO</span>
                    <span className="text-sm font-bold text-slate-900 block">{selectedDestino.nombre}</span>
                    <span className="text-xs text-slate-500 block">{selectedDestino.ubicacion}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">HORARIO PROGRAMADO</span>
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded block">{bookingHorario || 'No seleccionado'}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">FECHA DE VISITA</span>
                    <span className="text-xs font-semibold text-color-value block">{searchDate}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Cálculo de Tarifas</span>
                  {pasajeros.map((p, idx) => (
                    <div key={p.id} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-600">Pasajero #{idx + 1} ({p.tipoTarifa || 'Por Definir'})</span>
                      <span className="font-medium text-slate-800">S/ {p.precio}.00</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-sm">
                    <span className="font-bold text-slate-900">Total a Pagar:</span>
                    <span className="font-extrabold text-red-650">S/ {calculateTotal()}.00</span>
                  </div>
                </div>
              </div>

              {/* Secure Transaction box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-wider inline-block">MÓDULO DE SEGURIDAD</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">Este backend utiliza cifrado de clave pública para la autenticidad e integridad de los códigos QR, evitando clonaciones o fraudes cibernéticos bajo los requerimientos del estandar de seguridad de la información ISO 27001.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: MY TICKETS VIEW */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fade-in text-[#1A1A1A]" id="visitor-tickets-tab">
            <div className="bg-[#FDFCF8] p-6 rounded-none border border-[#1A1A1A]/15 shadow-sm space-y-2">
              <h3 className="font-serif font-black text-[#1A1A1A] text-xl flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-[#C0392B]" />
                Mis Boletos Emitidos y Control de Aforo
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gestione sus pases gubernamentales oficiales, verifique el estado de validación en tiempo real y acceda a los códigos QR unívocos para el control de aforo integrado.
              </p>
            </div>

            {tickets.length === 0 ? (
              <div className="bg-white p-12 text-center border border-[#1A1A1A]/11 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-[#FAF7F2] border border-[#1A1A1A]/10 text-slate-400 mx-auto flex items-center justify-center rounded-full">
                  <TicketIcon className="w-8 h-8 text-[#C0392B]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-lg">No se encontraron boletos</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Usted no ha emitido ningún boleto electrónico durante esta sesión del simulador. Diríjase a la pestaña de Destinos para seleccionar un santuario y completar su compra de prueba.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('buscador')}
                  className="bg-[#C0392B] hover:bg-[#D4A017] text-white hover:text-[#1A1A1A] font-extrabold text-[10.5px] uppercase tracking-widest px-6 py-3 transition-all cursor-pointer shadow-sm rounded-none"
                >
                  Buscar Destinos de Visita
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Tickets list / selector */}
                <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Filtrar por Código o Pasajero..."
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-4 py-2.5 text-xs focus:border-[#1A1A1A] focus:outline-none transition-all placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const filtered = tickets.filter(t => {
                        const sQuery = ticketSearchQuery.toLowerCase();
                        return (
                          t.id.toLowerCase().includes(sQuery) ||
                          t.destinoNombre.toLowerCase().includes(sQuery) ||
                          t.pasajeros.some(p => 
                            p.nombres.toLowerCase().includes(sQuery) || 
                            p.apellidos.toLowerCase().includes(sQuery) ||
                            (p.nroDocumento && p.nroDocumento.includes(sQuery))
                          )
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-slate-500 bg-white border border-dashed border-gray-200">
                            No hay boletos que coincidan con la búsqueda.
                          </div>
                        );
                      }

                      // Find a selected ticket or pick the first candidate
                      const activeItemTicketId = selectedTicketId || filtered[0]?.id;

                      return filtered.map(tick => {
                        const isItemSelected = tick.id === activeItemTicketId;
                        const qty = tick.pasajeros.length;

                        return (
                          <div
                            key={tick.id}
                            onClick={() => setSelectedTicketId(tick.id)}
                            className={`p-4 border transition-all cursor-pointer text-left relative focus:outline-none ${
                              isItemSelected 
                                ? 'bg-white border-[#C0392B] border-l-4 shadow-md' 
                                : 'bg-[#FDFCF8] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 hover:bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-mono text-[9px] font-bold text-[#C0392B] uppercase tracking-wider block">
                                  {tick.id}
                                </span>
                                <h4 className="font-serif font-black text-[#1A1A1A] text-sm leading-tight mt-0.5">
                                  {tick.destinoNombre}
                                </h4>
                              </div>
                              <span className={`px-2 py-0.5 text-[8.5px] uppercase font-mono font-bold shrink-0 ${
                                tick.estado === 'Validado' 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                              }`}>
                                {tick.estado}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-550 mt-3 border-t border-gray-100 pt-2.5 font-sans">
                              <div>
                                <span className="text-[8px] text-slate-400 block font-bold uppercase">FECHA</span>
                                <span className="font-semibold text-slate-700">{tick.fechaVisita}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 block font-bold uppercase">HORARIO</span>
                                <span className="font-semibold text-slate-700 truncate block">{tick.horario}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10.5px] text-slate-600 mt-2.5 pt-1.5 border-t border-dashed border-gray-100">
                              <span className="font-medium text-slate-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> {qty} {qty === 1 ? 'visitante' : 'visitantes'}
                              </span>
                              <span className="font-bold text-slate-800">
                                S/ {tick.total}.00
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Ticket detailed specification / preview */}
                <div className="lg:col-span-7">
                  {(() => {
                    // Get currently active ticket or candidate
                    const filtered = tickets.filter(t => {
                      const sQuery = ticketSearchQuery.toLowerCase();
                      return (
                        t.id.toLowerCase().includes(sQuery) ||
                        t.destinoNombre.toLowerCase().includes(sQuery) ||
                        t.pasajeros.some(p => 
                          p.nombres.toLowerCase().includes(sQuery) || 
                          p.apellidos.toLowerCase().includes(sQuery) ||
                          (p.nroDocumento && p.nroDocumento.includes(sQuery))
                        )
                      );
                    });

                    const activeItemTicketId = selectedTicketId || filtered[0]?.id;
                    const activeTicket = tickets.find(t => t.id === activeItemTicketId) || tickets[0];
                    if (!activeTicket) return null;

                    // Match actual destination for images/details if possible
                    const destObj = destinos.find(d => d.id === activeTicket.destinoId || d.nombre === activeTicket.destinoNombre);

                    return (
                      <div className="bg-white border border-[#1A1A1A]/15 p-6 shadow-md rounded-none space-y-6 text-left animate-fade-in">
                        <div className="border-b border-[#1A1A1A]/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h4 className="font-serif font-black text-xl text-[#1A1A1A]">Pase Oficial Autorizado</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Emitido por el Ministerio de Cultura - SGVCTD</p>
                          </div>
                          <span className={`px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-widest ${
                            activeTicket.estado === 'Validado' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            ESTADO: {activeTicket.estado === 'Validado' ? 'VALIDADO / EN PUERTA' : 'ACTIVO / POR VALIDAR'}
                          </span>
                        </div>

                        {/* Interactive aesthetic ticket visualization split block */}
                        <div className="bg-[#1A1A1A] p-5 rounded-none border border-white/10 text-white flex flex-col md:flex-row gap-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#2a2a2a_0%,transparent_100%)]">
                          {/* Left Column: Trip Overview */}
                          <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                              <span className="text-[8px] bg-[#D4A017] text-[#1A1A1A] uppercase tracking-[0.2em] px-2 py-0.5 rounded-none font-extrabold inline-block font-sans">
                                COMPROBANTE DE EXPEDICIÓN
                              </span>
                              <h3 className="text-xl font-serif font-black text-[#FAF7F2] leading-tight pt-1">
                                {activeTicket.destinoNombre}
                              </h3>
                              <span className="text-[10px] text-slate-400 block flex items-center gap-1 font-sans font-medium mt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#D4A017]" /> {destObj ? `${destObj.ubicacion}, ${destObj.departamento}` : 'República del Perú'}
                              </span>
                            </div>

                            {/* Ticket Divider Dot/Niches line */}
                            <div className="relative flex items-center justify-between my-1">
                              <div className="w-full border-t border-dashed border-white/15"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase font-black block tracking-wider">Fecha de Visita</span>
                                <span className="text-slate-200 font-bold block">{activeTicket.fechaVisita}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase font-black block tracking-wider">Turno / Horario</span>
                                <span className="text-slate-200 font-bold block truncate">{activeTicket.horario}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase font-black block tracking-wider">ID de Boleto</span>
                                <span className="text-[#D4A017] font-bold block">{activeTicket.id}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase font-black block tracking-wider">Método de Pago</span>
                                <span className="text-slate-200 font-bold block">{activeTicket.metodoPago}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Dynamic Coded QR Block */}
                          <div className="md:w-44 flex flex-col items-center justify-center bg-white p-4 text-slate-900 border-l-4 border-[#C0392B] shrink-0">
                            {/* Animated scanning frame wrapper */}
                            <div className="relative p-1 bg-white border border-gray-100 flex flex-col items-center">
                              <QrCode className="w-24 h-24 text-slate-900" />
                              <span className="text-[7.5px] font-mono text-slate-400 mt-1 uppercase font-bold tracking-widest">{activeTicket.id}</span>
                            </div>
                            <div className="text-center mt-2 space-y-0.5">
                              <span className="text-[8px] uppercase tracking-widest font-mono text-[#C0392B] font-bold block leading-none">VERIFICADOR LECTOR</span>
                              <p className="text-[7.5px] text-slate-500 leading-none mt-1 font-sans">Presentar QR dinámico en puerta junto al documento de identidad.</p>
                            </div>
                          </div>
                        </div>

                        {/* Complete Passenger specifications panel */}
                        <div className="border border-[#1A1A1A]/10 p-5 rounded-none space-y-3.5 bg-[#FAF7F2]">
                          <span className="text-[10px] font-sans font-black uppercase text-[#C0392B] tracking-widest block border-b border-[#1A1A1A]/5 pb-1 max-w-fit">
                            Lista Oficial de Titulares Registrados
                          </span>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {activeTicket.pasajeros.map((p, idx) => (
                              <div key={p.id || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-[#1A1A1A]/5 text-xs gap-2">
                                <div>
                                  <span className="font-extrabold text-[#1A1A1A] block uppercase tracking-wide">
                                    {p.nombres} {p.apellidos}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                    {p.tipoDocumento || 'DOCUMENTO'}: <span className="font-bold text-slate-700">{p.nroDocumento}</span> | Origen: {p.pais || 'No Especificado'}
                                  </span>
                                </div>
                                <div className="text-right flex items-center sm:flex-col gap-2 sm:gap-0.5 self-end sm:self-auto shrink-0">
                                  <span className="bg-[#1A1A1A]/5 text-[#1A1A1A]/80 border border-[#1A1A1A]/10 px-2 py-0.5 font-bold font-mono text-[9px] uppercase tracking-wider block rounded">
                                    {p.tipoTarifa}
                                  </span>
                                  <span className="font-bold text-[#C0392B] block text-xs min-w-[70px] text-right font-mono">
                                    S/ {p.precio}.00
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-sm font-sans pt-2 border-t border-[#1A1A1A]/10 font-black">
                            <span className="text-slate-700 text-xs">Total del Comprobante:</span>
                            <span className="text-lg text-[#C0392B] font-mono">S/ {activeTicket.total}.00</span>
                          </div>
                        </div>

                        {/* Interactive utilities */}
                        <div className="flex flex-wrap justify-end gap-3 pt-1 border-t border-gray-100">
                          <button
                            onClick={() => {
                              alert(`Se ha solicitado la copia oficial en PDF del boleto ${activeTicket.id}. Su navegador simulará la descarga de manera segura.`);
                            }}
                            className="bg-[#1A1A1A] hover:bg-[#C0392B] text-white font-extrabold text-[10.5px] uppercase tracking-widest px-5 py-3 rounded-none transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#D4A017]" /> Descargar PDF
                          </button>
                          
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-transparent hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/20 font-extrabold text-[10.5px] uppercase tracking-widest px-5 py-3 rounded-none transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                          >
                            Imprimir Físico
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
