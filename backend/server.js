require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middlewares
app.use(cors()); // Permite peticiones desde tu index.html local y luego desde el dominio de Google
app.use(express.json());

// 1. Endpoint para el Cron Job (Mantiene vivo a Render)
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'activo', message: 'Servidor despierto 24/7' });
});

// 2. Endpoint que procesa el formulario
app.post('/api/cotizar', async (req, res) => {
    const { nombre, empresa, correo, telefono, servicio, origen, destino, detalles } = req.body;

    try {
        const data = await resend.emails.send({
            from: 'Cotizaciones SAE <onboarding@resend.dev>', // En producción cambiarás al dominio de SAE verificado
            to: ['carlosiriarte432@hotmail.com'], // Pon tu correo aquí para probar
            subject: `Nueva Cotización Web - ${empresa}`,
            html: `
                <h2 style="color: #06152d; font-family: sans-serif;">Nueva solicitud de cotización</h2>
                <ul style="font-family: sans-serif; line-height: 1.6;">
                    <li><strong>Contacto:</strong> ${nombre} (${empresa})</li>
                    <li><strong>Email:</strong> ${correo}</li>
                    <li><strong>Teléfono:</strong> ${telefono}</li>
                    <li><strong>Tipo de Servicio:</strong> ${servicio}</li>
                    <li><strong>Ruta:</strong> ${origen} a ${destino}</li>
                </ul>
                <h3 style="color: #004b93; font-family: sans-serif;">Detalles de la Carga:</h3>
                <p style="font-family: sans-serif;">${detalles || 'Sin detalles adicionales.'}</p>
            `
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error en Resend:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Micro-API SAE lista y escuchando en http://localhost:${PORT}`);
});