import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiAssistantProps {
  currentRole: string;
}

export default function GeminiAssistant({ currentRole }: GeminiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "¡Hola! Soy tu **Copiloto Inteligente de SGVCTD Perú**. Conectado bajo la norma **ISO 27001** y entrenado para asistirte con el control de aforos, reserva de boletos y planes de contingencia.\n\n¿En qué puedo asistirte el día de hoy?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle role-specific greeting update without resetting conversation history
  const handleRolePrompt = (promptText: string) => {
    setInputValue(promptText);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    const updatedMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile: currentRole
        })
      });

      if (!response.ok) {
        throw new Error("Error en la conexión con el servidor de la inteligencia artificial");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: "assistant" as const, content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: "❌ **Error de Conexión:** No pude conectar con el servicio inteligente en `/api/gemini/chat`. Por favor, verifica que el servidor Express esté corriendo correctamente."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="btn-open-assistant"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 animate-bounce"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium text-sm">
            Copiloto SGVCTD
          </span>
          <span className="absolute -top-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Main Assistant window */}
      {isOpen && (
        <div id="panel-assistant" className="bg-white rounded-2xl shadow-3xl w-[380px] sm:w-[440px] h-[580px] flex flex-col border border-gray-100 overflow-hidden transition-all duration-300 ease-out transform scale-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-950 text-white p-4 flex items-center justify-between border-b border-red-900/40">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-red-600 to-amber-500 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  Copiloto Inteligente SGVCTD
                  <span className="flex items-center text-[10px] bg-red-950/80 text-red-400 border border-red-800/50 px-1.5 py-px rounded-full font-mono">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
                    GEMINI
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  Rol activo: <span className="text-amber-400 font-medium">{currentRole}</span>
                </div>
              </div>
            </div>
            <button
              id="btn-close-assistant"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick recommendations panel based on current profile */}
          <div className="bg-amber-500/5 border-b border-amber-500/10 p-2.5 px-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-amber-800 font-mono font-bold uppercase tracking-wider mr-1">Consultas rápidas:</span>
            {currentRole === "Visitante" && (
              <>
                <button 
                  onClick={() => handleRolePrompt("¿Cuáles son los horarios y tarifas oficiales para subir a Machu Picchu?")}
                  className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Tarifas Cusco
                </button>
                <button 
                  onClick={() => handleRolePrompt("¿Me explicas cómo funciona el código QR para el ingreso?")}
                  className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Uso del QR
                </button>
              </>
            )}
            {(currentRole === "Taquillero" || currentRole === "Panel en Sitio") && (
              <>
                <button 
                  onClick={() => handleRolePrompt("¿Cuál es el protocolo si un turista se presenta con un QR sospechoso de fraude?")}
                  className="bg-white hover:bg-red-50 text-red-900 border border-red-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Control de Fraude
                </button>
                <button 
                  onClick={() => handleRolePrompt("¿Cómo se opera el sistema de venta rápida si falla internet?")}
                  className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Modo Offline
                </button>
              </>
            )}
            {currentRole === "Superadmin" && (
              <>
                <button 
                  onClick={() => handleRolePrompt("¿Cómo auditar el cumplimiento del estandar ISO 27001 en los servidores de aforo?")}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Auditoría ISO
                </button>
                <button 
                  onClick={() => handleRolePrompt("¿Qué acciones se toman si un destino supera el 95% de aforo de emergencia?")}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-[10.5px] px-2 py-1 rounded-md transition-all font-medium shadow-2xs"
                >
                  Límites de Aforo
                </button>
              </>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                    PE
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-red-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none font-sans"
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="space-y-1 whitespace-pre-line prose max-w-none text-slate-800">
                      {m.content.split("\n").map((line, lIdx) => {
                        // Very basic markdown bolding replacing
                        let formattedLine = line;
                        // Bold tags
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        let match;
                        while ((match = boldRegex.exec(line)) !== null) {
                          formattedLine = formattedLine.replace(match[0], `<strong class="font-bold text-red-950">${match[1]}</strong>`);
                        }
                        
                        return (
                          <p key={lIdx} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }}></p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 bg-gradient-to-tr from-red-600 to-amber-500 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 animate-spin">
                  ✦
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-gray-400 text-[11px] ml-1 font-medium font-mono">Gemini pensando...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              id="input-assistant-prompt"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregúntale al copiloto sobre aforos, ISO..."
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-600 transition-all font-sans"
            />
            <button
              id="btn-send-assistant"
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white p-2.5 px-3 rounded-xl transition-all self-end flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
