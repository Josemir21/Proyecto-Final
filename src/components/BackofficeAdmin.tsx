import React, { useState } from "react";
import { Sliders, TrendingUp, Users, DollarSign, AlertTriangle, Play, Pause, Save, Check, RefreshCw, Eye, Percent, Ban, Database, Code, ExternalLink, FileText, Terminal, ShieldAlert, KeyRound } from "lucide-react";
import { Destino, Ticket, TransaccionInfo } from "../types";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, configureSupabaseDynamically, dbAPI } from "../lib/supabase";


interface BackofficeAdminProps {
  destinos: Destino[];
  tickets: Ticket[];
  transactions: TransaccionInfo[];
  onToggleEmergency: () => void;
  emergenciaActiva: boolean;
  onUpdateDestinoConfig: (id: string, updatedConfig: Partial<Destino>) => void;
  onClearTransactions: () => void;
}

export default function BackofficeAdmin({ destinos, tickets, transactions, onToggleEmergency, emergenciaActiva, onUpdateDestinoConfig, onClearTransactions }: BackofficeAdminProps) {
  // Supabase dynamic control state
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [copyStatus, setCopyStatus] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, { status: "OK" | "ERROR", details?: string }> | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const res = await dbAPI.diagnoseTables();
      setDiagnostics(res);
    } catch (err: any) {
      setDiagnostics({
        _global: { status: "ERROR", details: err?.message || String(err) }
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  React.useEffect(() => {
    if (isSupabaseConfigured) {
      handleDiagnose();
    }
  }, []);
  // Config state
  const [editingDestinoId, setEditingDestinoId] = useState<string | null>(null);
  const [editMaxCapacity, setEditMaxCapacity] = useState(0);
  const [editPrecioBase, setEditPrecioBase] = useState(0);
  const [editPrecioExtranjero, setEditPrecioExtranjero] = useState(0);

  // Financial calculations
  const calculateTotalSales = () => {
    return transactions.reduce((sum, rx) => rx.estado === 'Éxito' ? sum + rx.monto : sum, 0);
  };

  const calculateTotalGuests = () => {
    return transactions.reduce((sum, rx) => rx.estado === 'Éxito' ? sum + rx.visitantes : sum, 0);
  };

  const handleEditStart = (dest: Destino) => {
    setEditingDestinoId(dest.id);
    setEditMaxCapacity(dest.maxCapacidad);
    setEditPrecioBase(dest.precioBase);
    setEditPrecioExtranjero(dest.precioExtranjero);
  };

  const handleEditSave = () => {
    if (!editingDestinoId) return;
    onUpdateDestinoConfig(editingDestinoId, {
      maxCapacidad: editMaxCapacity,
      precioBase: editPrecioBase,
      precioExtranjero: editPrecioExtranjero
    });
    setEditingDestinoId(null);
  };

  return (
    <div className="w-full bg-slate-50 font-sans space-y-8 animate-fade-in pr-0 md:pr-4" id="backoffice-admin-root">
      
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded inline-block font-bold mb-1.5">Módulo Administrativo</span>
          <h2 className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">Dashboard & Control de Capacidad General</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Analíticas en vivo, calibración de aforos de ingreso y tarifas nacionales</p>
        </div>

        {/* Emergency Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-emergency"
            onClick={onToggleEmergency}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${
              emergenciaActiva 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
                : 'bg-red-600 hover:bg-red-750 text-white shadow-red-900/10'
            }`}
          >
            {emergenciaActiva ? (
              <>
                <Play className="w-4 h-4" /> Desactivar Cierre de Emergencia
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" /> Cierre Temporal de Emergencia
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 4 Core KPICards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Recaudación Total</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">S/ {calculateTotalSales().toFixed(2)}</span>
            <p className="text-[10.5px] text-green-600 font-semibold font-mono">100% de transacciones seguras</p>
          </div>
        </div>

        {/* Card 2: Visitor Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Visitantes Registrados</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">{calculateTotalGuests()} <span className="text-xs text-slate-400 font-normal">pax</span></span>
            <p className="text-[10.5px] text-red-600 font-semibold font-mono">Sincronizado vía Gateway</p>
          </div>
        </div>

        {/* Card 3: Alert limits */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Aforos Críticos</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">
              {emergenciaActiva ? "CIERRE TOTAL" : destinos.filter(d => (d.capacidadActual / d.maxCapacidad) > 0.85).length} <span className="text-xs text-slate-400 font-normal">destinos</span>
            </span>
            <p className="text-[10.5px] text-amber-600 font-semibold font-mono">Machu Picchu superpoblación</p>
          </div>
        </div>

        {/* Card 4: System health status ISO */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Seguridad ISO 27001</span>
            <span className="text-base font-extrabold text-slate-900 block font-mono">Estrictamente Activo</span>
            <p className="text-[10.5px] text-emerald-600 font-semibold font-mono">WAF / Antifraude habilitado</p>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Aforo configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic configuration panel table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Configuración de Aforos y Tarifas por Sitio</h3>
              <p className="text-xs text-slate-500">Calibra la capacidad máxima permitida por día y ajusta los precios oficiales.</p>
            </div>
            {editingDestinoId && (
              <button
                id="btn-cancel-config-edit"
                onClick={() => setEditingDestinoId(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table id="table-destinos-config" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-slate-400 font-bold uppercase font-mono bg-slate-50/50">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Destino</th>
                  <th className="py-2.5 px-3 text-center">Capacidad Máxima</th>
                  <th className="py-2.5 px-3 text-center">T. Nacional</th>
                  <th className="py-2.5 px-3 text-center">T. Extranjero</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {destinos.map((dest) => {
                  const isEditing = editingDestinoId === dest.id;
                  return (
                    <tr key={dest.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-650">{dest.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{dest.nombre}</span>
                        <span className="text-[10px] text-slate-405 block">{dest.ubicacion}, {dest.departamento}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editMaxCapacity}
                            onChange={(e) => setEditMaxCapacity(parseInt(e.target.value) || 1)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-20 text-center text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>{dest.maxCapacidad} pax</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrecioBase}
                            onChange={(e) => setEditPrecioBase(parseInt(e.target.value) || 0)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-16 text-center text-xs font-mono focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>S/ {dest.precioBase}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrecioExtranjero}
                            onChange={(e) => setEditPrecioExtranjero(parseInt(e.target.value) || 0)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-16 text-center text-xs font-mono focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>S/ {dest.precioExtranjero}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <button
                            id={`btn-save-config-${dest.id}`}
                            onClick={handleEditSave}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 px-2 text-[10.5px] rounded transition-all flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Save className="w-3 h-3" /> Guardar
                          </button>
                        ) : (
                          <button
                            id={`btn-edit-config-${dest.id}`}
                            onClick={() => handleEditStart(dest)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold p-1 px-2.5 border border-gray-250 rounded transition-all cursor-pointer inline-block"
                          >
                            Ajustar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Historic Tendencia chart & transactions list */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Historial de Ocupación Semanal</h3>
            <p className="text-xs text-slate-500">Curvas de afluencia consolidada en puntos de acceso</p>
          </div>

          {/* Elegant inline SVG static line chart */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="h-32 w-full pt-1">
              <svg className="w-full h-full font-mono" viewBox="0 0 100 40">
                {/* Horizontal grid lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                
                {/* Simulated line curve connecting values for Machupicchu 40%, 65%, 85%, 60%, 75%, 90%, 80% */}
                <path 
                  d="M 5 35 Q 20 20, 35 15 T 65 24 T 80 10 T 95 18" 
                  fill="none" 
                  stroke="#dc2626" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                />
                <circle cx="5" cy="35" r="1.5" fill="#dc2626" />
                <circle cx="35" cy="15" r="1.5" fill="#dc2626" />
                <circle cx="65" cy="24" r="1.5" fill="#dc2626" />
                <circle cx="80" cy="10" r="1.5" fill="#dc2626" />
                <circle cx="95" cy="18" r="1.5" fill="#dc2626" />

                {/* Week day labels */}
                <text x="5" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Lu</text>
                <text x="23" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Ma</text>
                <text x="41" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Mi</text>
                <text x="59" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Ju</text>
                <text x="77" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Vi</text>
                <text x="95" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Sa</text>
              </svg>
            </div>
            
            <div className="text-[10.5px] text-slate-500 pt-2 border-t border-gray-100 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span> Cusco</span>
              <span>Picos de Ocupación: 11:00 am</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 border-l-2 border-red-600 pl-2">Transacciones de Caja Recientes</span>
              <button
                onClick={onClearTransactions}
                className="text-[10.5px] font-semibold text-slate-400 hover:text-red-500"
              >
                Limpiar logs
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <div key={trx.id} className="p-3 bg-white rounded-xl border border-gray-100 flex justify-between items-center hover:scale-101 transition-all">
                    <div>
                      <span className="text-[10.5px] block font-bold text-slate-950 leading-tight">{trx.destino}</span>
                      <span className="text-[9.5px]/none text-slate-400 block mt-1 font-mono">{trx.fecha} | {trx.metodo}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-slate-900 block">S/ {trx.monto.toFixed(2)}</span>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${trx.estado === 'Éxito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {trx.estado}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 text-center py-4">No se han registrado transferencias en este ciclo.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: CONNECT AND CONFIGURE SUPABASE */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden" id="supabase-config-section">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white font-serif flex items-center gap-2">
                Conexión e Integración de Supabase 
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </h3>
              <p className="text-xs text-slate-400">Guía interactiva y de autoconfiguración para enlazar este programa de aforo con tu propia base de datos Postgres real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono border px-3 py-1 rounded-full font-bold ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
              {isSupabaseConfigured ? 'CONECTADO EN VIVO' : 'MODO SIMULADOR LOCAL'}
            </span>
          </div>
        </div>

        {/* Dynamic configuration form */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Credenciales de Conexión del Cliente
            </h4>
            {isSupabaseConfigured && (
              <span className="text-[10.5px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">
                Activa
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5Packed">
              <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">Supabase Project URL</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="https://tu-proyecto.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-sans">Busca este valor en Supabase: Project Settings &gt; API &gt; Project URL</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">Anon API Key (Public Rolle)</label>
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-sans">Busca este valor en Supabase: Project Settings &gt; API &gt; anon/public API Key</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-900">
            <div className="text-[11px] text-slate-400">
              {isSupabaseConfigured ? (
                <span className="text-slate-300">
                  ⚠️ Si cambias las credenciales e inicias sesión, el sistema se reiniciará para aplicar los parámetros de base de datos Postgres.
                </span>
              ) : (
                <span className="text-slate-400 font-sans italic">
                  Ingresa las credenciales y presiona Conectar para sincronizar destinos, tickets, transacciones, alertas y logs en vivo.
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={() => configureSupabaseDynamically("", "")}
                  className="w-full sm:w-auto border border-red-500/30 bg-red-950/40 hover:bg-red-900/30 text-red-350 text-xs px-4 py-2 font-mono font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Regresar a Simulación Local
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  if (!inputUrl || !inputKey) {
                    alert("Por favor introduce los dos parámetros (URL y Clave Anon) para poder conectar con Supabase.");
                    return;
                  }
                  // Clean potential double spaces or copied service-role additions from token
                  const cleanKey = inputKey.trim().split(/\s+/)[0];
                  configureSupabaseDynamically(inputUrl.trim(), cleanKey);
                }}
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C5A030] text-[#1A1A1A] text-xs px-5 py-2 font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 font-mono shadow-md shadow-[#D4AF37]/10"
              >
                <Check className="w-4 h-4" />
                <span>Guardar y Conectar en Caliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* DIAGNOSTIC RESULTS */}
        {isSupabaseConfigured && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs uppercase font-mono tracking-widest text-slate-200 font-bold">
                  Estado de Tablas en Supabase
                </h4>
              </div>
              <button
                type="button"
                onClick={handleDiagnose}
                disabled={isDiagnosing}
                className="flex items-center gap-1.5 text-[10.5px] uppercase font-mono tracking-wider font-bold text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                <span>{isDiagnosing ? 'Verificando...' : 'Re-Diagnosticar'}</span>
              </button>
            </div>

            {diagnostics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(diagnostics as Record<string, { status: "OK" | "ERROR", details?: string }>).map(([tableName, result]) => {
                  if (tableName === '_global') return null;
                  const isOk = result.status === 'OK';
                  return (
                    <div 
                      key={tableName} 
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        isOk 
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase">{tableName}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          isOk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-350'
                        }`}>
                          {isOk ? 'Activo' : 'Falta'}
                        </span>
                      </div>
                      {!isOk && (
                        <p className="text-[10px] text-red-300/80 leading-snug">
                          ⚠️ No se detectó la tabla. Ejecuta el script SQL de la derecha para solucionarlo.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                Cargando estado de sincronización...
              </div>
            )}
            
            {/* Show error context warning if tables are missing */}
            {diagnostics && Object.values(diagnostics as Record<string, { status: "OK" | "ERROR", details?: string }>).some(r => r.status === 'ERROR') && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/30 rounded-xl flex items-start gap-2 text-xs text-red-350 font-sans">
                <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">¡Tablas Faltantes Detectadas!</p>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed">
                    Tu base de datos Postgres está enlazada pero no contiene las tablas correctas para persistir los datos. 
                    Copia el script SQL de la derecha, pégalo en el editor SQL de Supabase y presione <strong className="text-white">Run</strong> para poder sincronizar.
                  </p>
                </div>
              </div>
            )}
            
            {diagnostics && Object.keys(diagnostics).length > 0 && Object.entries(diagnostics as Record<string, { status: "OK" | "ERROR", details?: string }>).every(([k, r]) => k === '_global' || r.status === 'OK') && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-950 rounded-xl flex items-start gap-2 text-xs text-emerald-300 font-sans">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold font-mono text-[11px] uppercase tracking-wider">¡Todas las tablas están creadas y operativas!</p>
                  <p className="text-[10.5px] text-emerald-400/90 leading-relaxed font-sans">
                    Ventas de boletos, ingresos, auditorías de seguridad perimetral y alarmas de aforo se están guardando en tiempo real en tu base de datos remota.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4 Steps Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          
          {/* Left panel: Conceptual guides and keys info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold">¿Qué información debes tener?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Para vincular el panel con tu base de datos remota necesitas exactamente <strong>dos parámetros</strong> que Supabase te entrega por defecto al crear tu cuenta:
              </p>
              
              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 flex items-start gap-3 rounded-xl">
                  <span className="flex items-center justify-center p-1 px-2.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold leading-none mt-0.5">1</span>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wide">Project URL (VITE_SUPABASE_URL)</h5>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                      La ruta URL privada de tu API REST del proyecto. <br/>
                      <span className="text-slate-500 font-mono break-all">{supabaseUrl || 'https://tu-id-de-proyecto.supabase.co'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 flex items-start gap-3 rounded-xl">
                  <span className="flex items-center justify-center p-1 px-2.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold leading-none mt-0.5">2</span>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wide">API Key Anon (VITE_SUPABASE_ANON_KEY)</h5>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                      La llave pública anaónima segura para transacciones de navegador. <br/>
                      <span className="text-slate-500 font-mono break-all">
                        {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 15)}... (${supabaseAnonKey.length} caracteres)` : 'sb_publishable_...'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt paragraph */}
            <div className="p-4 bg-emerald-900/10 border border-emerald-950 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-extrabold uppercase tracking-wider font-mono">Prompt para su IA (Copiar para su asistente)</h5>
              </div>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed italic">
                Copia y pega la siguiente instrucción en tu IA favorita para que te asesore, prepare, configure índices o elabore triggers adicionales sobre la base de datos de este programa:
              </p>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 relative group">
                <p id="prompt-ia-text" className="text-[10.5px] text-slate-300 select-all font-mono whitespace-pre-line leading-relaxed">
                  "Quiero conectar una base de datos de Supabase a una aplicación React que gestiona aforos, venta de entradas e historial de ocupación turística en Perú. Por favor, genera las sentencias SQL completas para crear las tablas de destinos, tickets, transacciones, alertas de seguridad de aforo, y logs de acceso. También implementa políticas de seguridad RLS básicas para permitir lectura y escritura pública."
                </p>
              </div>
            </div>

            <div className="p-4.5 bg-amber-500/5 border border-amber-500/10 space-y-2 rounded-xl">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Variables de Entorno (.env)</h5>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Abre el archivo <span className="text-yellow-400 font-mono font-semibold">.env</span> (o configúralo en los Secretos de AI Studio) y añade las claves de la siguiente manera:
              </p>
              <pre className="p-3 bg-black/85 text-amber-300 rounded font-mono text-[10.5px] border border-slate-850 overflow-x-auto leading-relaxed">
{`VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-role-token"`}
              </pre>
            </div>
          </div>

          {/* Right panel: Live SQL schema editor copiable code */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-bold">SQL Schema de Tablas (Copiar en Supabase Dashboard)</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              En tu proyecto de Supabase, ve a <strong className="text-white">SQL Editor</strong>, haz clic en <strong>New Query</strong>, pega el siguiente script SQL y ejecútalo (<kbd className="bg-slate-800 text-white rounded px-1 px-1.5 py-0.5 text-[10px]">Run</kbd>):
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 select-all max-h-[380px] overflow-y-auto font-mono text-[10px] text-emerald-400/90 leading-relaxed space-y-4 custom-scrollbar">
              <div>
                <span className="text-slate-500">-- 1. CREAR TABLA DE DESTINOS</span>
                <pre className="text-slate-100">{`CREATE TABLE destinos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  ubicacion TEXT,
  departamento TEXT,
  imagen TEXT,
  max_capacidad INTEGER,
  capacidad_actual INTEGER,
  precio_base INTEGER,
  precio_extranjero INTEGER,
  rating NUMERIC,
  categoria TEXT,
  horarios JSONB
);`}</pre>
              </div>

              <div>
                <span className="text-slate-500">-- 2. CREAR TABLA DE TICKETS</span>
                <pre className="text-slate-100">{`CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  destino_id TEXT,
  destino_nombre TEXT,
  fecha_visita TEXT,
  horario TEXT,
  pasajeros JSONB,
  total INTEGER,
  estado TEXT,
  metodo_pago TEXT,
  codigo_qr TEXT,
  fecha_emision TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}</pre>
              </div>

              <div>
                <span className="text-slate-500">-- 3. CREAR TABLA DE TRANSACCIONES</span>
                <pre className="text-slate-100">{`CREATE TABLE transacciones (
  id TEXT PRIMARY KEY,
  fecha TEXT,
  destino TEXT,
  monto INTEGER,
  metodo TEXT,
  estado TEXT,
  visitantes INTEGER
);`}</pre>
              </div>

              <div>
                <span className="text-slate-500">-- 4. CREAR TABLA DE ALERTAS DE SEGURIDAD</span>
                <pre className="text-slate-100">{`CREATE TABLE alertas (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  origen TEXT,
  detalles TEXT,
  gravedad TEXT,
  estado TEXT
);`}</pre>
              </div>

              <div>
                <span className="text-slate-500">-- 5. CREAR TABLA DE LOGS DE SEGURIDAD SOC</span>
                <pre className="text-slate-100">{`CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  servicio TEXT,
  endpoint TEXT,
  solicitante TEXT,
  ip TEXT,
  estado_str TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}</pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


