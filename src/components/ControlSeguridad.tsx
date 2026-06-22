import React, { useState } from "react";
import { Shield, Lock, Users, AlertTriangle, Play, RefreshCw, Layers, CheckCircle, Flame, Eye, Volume2 } from "lucide-react";
import { AlertaSeguridad, LogAcceso } from "../types";

interface ControlSeguridadProps {
  alertas: AlertaSeguridad[];
  logs: LogAcceso[];
  onMitigateAlert: (id: string) => void;
  onClearLogs: () => void;
}

export default function ControlSeguridad({ alertas, logs, onMitigateAlert, onClearLogs }: ControlSeguridadProps) {
  const [blockedIPs, setBlockedIPs] = useState<string[]>([
    "185.220.101.5", "190.113.120.49"
  ]);
  const [newIpInput, setNewIpInput] = useState("");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    if (blockedIPs.includes(newIpInput)) {
      alert("Esta dirección IP ya se encuentra en la lista de bloqueo.");
      return;
    }
    setBlockedIPs([...blockedIPs, newIpInput]);
    setNewIpInput("");
    triggerNotification("Dirección IP bloqueada en el firewall perimetral.");
  };

  const handleUnblockIp = (ip: string) => {
    setBlockedIPs(blockedIPs.filter(item => item !== ip));
    triggerNotification("Dirección IP removida del WAF.");
  };

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  const handleMitigate = (id: string) => {
    onMitigateAlert(id);
    triggerNotification(`Incidente ${id} mitigado e incorporado a la bitácora ISO 27001.`);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans p-4 md:p-8 rounded-3xl shadow-2xl space-y-8 border border-slate-800" id="control-seguridad-root">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border-2 border-green-500 text-green-400 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-short text-xs">
          <Shield className="w-5 h-5 text-green-500 shrink-0" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-slate-900 to-red-950 p-2.5 rounded-2xl border border-red-900/40">
            <Lock className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#fda4af] bg-red-950 px-2.5 py-0.5 rounded border border-red-900/50">Centro de Operaciones (SOC)</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-900/50">ISO 27001 COMPLIANT</span>
            </div>
            <h2 className="font-extrabold text-xl tracking-tight text-white font-sans -mt-0.5">Monitoreo de Ciberseguridad e Infraestructura</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Prevención de DDoS, fraudes de clonación de código QR y políticas WAF del Ministerio de Cultura</p>
          </div>
        </div>
      </div>

      {/* SOC metrics columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Firewalls and WAF */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/65 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400">Protección Perimetral WAF</h4>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono block">99.98%</span>
            <span className="text-[10.5px] text-emerald-400 font-medium block">Tasa de Mitigación de DDoS Activo</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">El filtrado de cabeceras geo-referenciadas bloquea peticiones de rangos IP sospechosos en tiempo real.</p>
        </div>

        {/* Metric 2: QR Token Security */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/65 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400">Llave Digital Tokenizada</h4>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono block">SHA-256</span>
            <span className="text-[10.5px] text-emerald-400 font-medium block">Firma Criptográfica en Firma QR</span>
          </div>
          <p className="text-[11px] text-slate-505 leading-relaxed font-sans">Cada ticket emitido posee una clave única y fecha de expiración imposible de duplicar o simular.</p>
        </div>

        {/* Metric 3: Active incidents counters */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/65 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400">Incidentes Activos</h4>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-red-400 font-mono block">
              {alertas.filter(a => a.estado === 'Abierta').length}
            </span>
            <span className="text-[10.5px] text-amber-500 font-medium block">Alertas Pendientes de Revisión</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">Inspecciona y mitiga incidentes de seguridad registrados por los guardaparques en sitio.</p>
        </div>

      </div>

      {/* Core Grid: Alertas vs Firewall vs Registros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1 & 2: SECURITY ALERTS LISTS */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white border-l-2 border-red-500 pl-2">Panel Operativo de Incidentes y Amenazas</span>
            <span className="text-slate-500 font-mono">Última actualización: En Vivo</span>
          </div>

          <div className="space-y-4">
            {alertas.map(al => (
              <div key={al.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                al.gravedad === 'Crítico' ? 'bg-red-950/40 border-red-900/60' : 
                al.gravedad === 'Advertencia' ? 'bg-amber-950/30 border-amber-900/40' : 
                'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9.5px]/none font-extrabold font-mono px-2 py-0.5 rounded ${
                      al.gravedad === 'Crítico' ? 'bg-red-950 text-red-400 border border-red-800/60' : 
                      al.gravedad === 'Advertencia' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' : 
                      'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {al.gravedad}
                    </span>
                    <span className="text-slate-500 text-[10.5px] font-mono">{al.timestamp}</span>
                    <span className="text-slate-400 font-mono text-[10.5px]">• Origen: <span className="font-bold text-slate-200">{al.origen}</span></span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{al.detalles}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded font-mono ${al.estado === 'Mitigada' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-500 border border-red-900/40'}`}>
                    {al.estado}
                  </span>
                  {al.estado === 'Abierta' && (
                    <button
                      id={`btn-mitigate-${al.id}`}
                      onClick={() => handleMitigate(al.id)}
                      className="bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer shadow-sm shadow-red-900/10"
                    >
                      Mitigar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ACCESS LOG LISTS */}
          <div className="space-y-4.5 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white border-l-2 border-red-500 pl-2">Registro Técnico de API Access (Logs)</span>
              <button
                onClick={onClearLogs}
                className="text-slate-500 hover:text-red-400 font-bold transition-all text-[11px]"
              >
                Vaciar bitácora
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3.5 bg-slate-950 text-[10px] text-slate-400 font-bold font-mono uppercase grid grid-cols-4 gap-2 border-b border-slate-800">
                <span>Timestamp / IP</span>
                <span>Servicio</span>
                <span>Endpoint solicitado</span>
                <span className="text-right">Respuesta</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-800">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 grid grid-cols-4 gap-2 text-[10.5px] font-mono hover:bg-slate-850/40 transition-colors">
                      <div>
                        <span className="text-slate-300 block font-bold leading-tight">{log.timestamp}</span>
                        <span className="text-slate-500 text-[10px] block font-medium mt-0.5">{log.ip}</span>
                      </div>
                      <span className="text-slate-400 font-bold self-center">{log.servicio}</span>
                      <span className="text-red-400 self-center truncate">{log.endpoint}</span>
                      <span className={`text-right font-bold self-center ${log.estadoStr.startsWith('200') ? 'text-emerald-500' : 'text-red-500'}`}>{log.estadoStr}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 py-6 text-center text-xs font-mono">Consola limpia - No hay logs de consultas registrados en este turno.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: FIREWALL IP BLOCKING */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/80 space-y-5">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-400 border-b border-slate-800 pb-2">Firewall IP Blacklist (WAF)</h4>
            <p className="text-slate-500 text-[10.5px] mt-2 leading-relaxed">Las peticiones entrantes de estas direcciones IP son bloqueadas instantáneamente de los servidores de boletería.</p>
          </div>

          {/* Form to add IP blocker */}
          <form onSubmit={handleBlockIp} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej. 185.120.40.1"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              required
            />
            <button
              id="btn-block-ip"
              type="submit"
              className="bg-red-650 hover:bg-red-700 font-mono font-bold text-xs text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Bloquear
            </button>
          </form>

          {/* Blocked IP List */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {blockedIPs.map((ip) => (
              <div key={ip} className="p-3 bg-slate-950 rounded-xl border border-slate-800/60 flex justify-between items-center font-mono text-xs">
                <span className="text-slate-300 font-bold">{ip}</span>
                <button
                  onClick={() => handleUnblockIp(ip)}
                  className="text-red-500 hover:text-red-400 text-[11px] font-bold cursor-pointer hover:underline"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
