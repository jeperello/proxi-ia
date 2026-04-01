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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Usamos flash por velocidad

// Ruta del Proxy
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("Error en Gemini:", error);
        res.status(500).json({ error: "Error procesando la solicitud" });
    }
});

app.listen(port, () => {
    console.log(`Servidor proxy corriendo en el puerto ${port}`);
});
