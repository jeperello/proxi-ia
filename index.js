// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

// Middleware
app.use(cors()); // Permite peticiones desde tu app Angular
app.use(express.json()); // Permite leer cuerpos JSON en las peticiones

// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `Eres el asistente virtual del portfolio de un Desarrollador Fullstack.
        Tu misión es explicar los proyectos del autor de forma técnica pero accesible.

        Información clave de los proyectos:
        1. API Reactiva con Spring WebFlux: Desarrollada con Java 21 y Spring Boot 3. Utiliza programación funcional y no bloqueante. La demo en el portfolio usa Server-Sent Events (SSE) para transmitir en tiempo real métricas de memoria del servidor, tecnologías y ventajas. Usa Spring Data R2DBC para persistencia reactiva.
        2. Java 21 Virtual Threads vs Hilos Tradicionales: Es un motor de ingesta de logs de alta concurrencia. Compara el rendimiento de Virtual Threads (Project Loom) contra hilos de plataforma tradicionales usando el patrón Productor-Consumidor.

        Habilidades del autor: Java 21, Spring Boot, Angular, Docker, Microservicios y arquitecturas reactivas.
        Responde de forma concisa y profesional.`,
});

// index.js (Backend)
app.post('/api/chat', async (req, res) => {
    try {
        const { userPrompt, conversationHistory } = req.body;

        // 1. Mapeamos los roles
        let mappedHistory = conversationHistory.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        // 2. REGLA DE ORO: El historial debe empezar con 'user'.
        // Buscamos el índice del primer mensaje de usuario.
        const firstUserIndex = mappedHistory.findIndex(m => m.role === 'user');
        
        // Si no hay mensajes de usuario o el primero no es user, recortamos el historial
        if (firstUserIndex !== -1) {
            mappedHistory = mappedHistory.slice(firstUserIndex);
        } else {
            mappedHistory = []; // Si no hay historial válido, empezamos de cero
        }

        const chat = model.startChat({
            history: mappedHistory,
        });

        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        res.json({ assistantReply: response.text() });

    } catch (error) {
        console.error("Error en Gemini:", error);
        res.status(500).json({ error: "Error en el servidor de IA" });
    }
});


app.listen(port, () => {
    console.log(`Servidor proxy corriendo en el puerto ${port}`);
});
