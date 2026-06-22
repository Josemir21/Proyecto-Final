import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Key control logs - safe initialization
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("ADVERTENCIA: GEMINI_API_KEY no encontrada en variables de entorno.");
      // We don't crash, we just lazy-log/throw inside the endpoint when used.
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MISSING_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// APIs
app.get("/api/ping", (req, res) => {
  res.json({ status: "online", time: new Date().toISOString() });
});

// Chatbot inteligente
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "El cuerpo de la solicitud debe incluir una lista de mensajes 'messages'." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: "💡 **[Modo Simulación Activo]** El Asistente Inteligente está funcionando en modo local porque no se ha configurado la variable `GEMINI_API_KEY` en los Secretos. \n\n*¡Hola! Soy tu Asistente del SGVCTD Perú. ¿En qué puedo ayudarte hoy respecto a aforos, boletos para Machu Picchu o protocolos ISO 27001?*"
      });
    }

    const ai = getGeminiClient();

    // Context System Instructions according to active role in the simulation
    const systemPrompt = `Eres el Co-piloto Inteligente del SGVCTD Perú (Sistema de Gestión de Visitas a Centros Turísticos y Destinos).
Tu objetivo es dar recomendaciones técnicas, resolver dudas de turistas sobre boletos y ayudar a los administradores con el control de aforos y protocolos de seguridad (ISO 27001).

Información del contexto del sistema peruano:
- El portal permite comprar entradas electrónicas para destinos emblemáticos: Machu Picchu Llaqta (aforo max: 4500/día), Kuélap (aforo max: 1200/día), Choquequirao (aforo max: 800/día), Líneas de Nazca (aforo max: 600/día), Caral (aforo max: 500/día).
- Hay tres roles principales en la demo interactiva: 
  1. Portal del Visitante: donde el público busca disponibilidad, llena datos de pasajeros y obtiene un boleto digital QR.
  2. Panel de Taquilla & Control en Sitio: para operadores, con venta rápida y validador de código QR (semáforo de aforo).
  3. Backoffice Admin: con KPIs de recaudación, gestión de tarifas y un botón de "Cierre de Emergencia" en caso de sismos, lluvias intensas o incidentes de seguridad de datos.
- Seguridad de Datos: El sistema monitorea el cumplimiento de la norma ISO 27001 para mitigar fraudes de clonación de código QR y ataques de denegación de servicio (DDoS) en las APIs gubernamentales.

Perfil del usuario actual: ${userProfile || 'General'}.
Responde de forma profesional, clara, concisa y en idioma español latinoamericano, utilizando formato Markdown elegante para resaltar datos numéricos o listas de pasos.`;

    // Format chat messages for @google/genai SDK
    // The simplified chat tool matches the schema.
    const lastUserMessage = messages[messages.length - 1]?.content || "Hola";
    
    // Check if we can build a history context or just single/multi pass
    // For simplicity and high safety, we compile a prompt that contains recent chat flow + instruction
    const compiledPrompt = `${systemPrompt}\n\nHistorial Reciente:\n${messages.map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n')}\n\nAsistente:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: compiledPrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error en Gemini API:", error);
    res.status(500).json({ error: "Error interno del asistente inteligente", details: error.message });
  }
});

// Vite middleware for development or static serving for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SGVCTD PERÚ] Servidor full-stack corriendo en http://localhost:${PORT}`);
  });
}

setupServer();
