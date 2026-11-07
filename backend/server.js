require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Endpoint para el Cron Job (Mantiene vivo a Render)
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'activo', message: 'Servidor despierto 24/7' });
});

// Endpoint que procesa el formulario unificado
app.post('/api/cotizar', async (req, res) => {
    const { 
        tipo_formulario, nombre, empresa, correo, telefono, 
        servicio, origen, destino, tipo_especifico, detalles 
    } = req.body;

    let emailSubject = '';
    let emailHtml = '';

    // Construcción dinámica del correo según el tipo de solicitud
    if (tipo_formulario === 'Cotización') {
        emailSubject = `Nueva Cotización Web - ${empresa || nombre}`;
        emailHtml = `
            <h2 style="color: #06152d; font-family: sans-serif;">Nueva solicitud de cotización</h2>
            <ul style="font-family: sans-serif; line-height: 1.6; color: #334155;">
                <li><strong>Contacto:</strong> ${nombre}</li>
                <li><strong>Empresa:</strong> ${empresa || 'No especificada'}</li>
                <li><strong>Email:</strong> ${correo}</li>
                <li><strong>Teléfono:</strong> ${telefono}</li>
                <li><strong>Frecuencia:</strong> ${servicio}</li>
                <li><strong>Ruta:</strong> ${origen} a ${destino}</li>
            </ul>
            <h3 style="color: #004b93; font-family: sans-serif;">Detalles de la Carga:</h3>
            <p style="font-family: sans-serif; color: #334155;">${detalles || 'Sin detalles adicionales.'}</p>
        `;
    } 
    else if (tipo_formulario === 'Consulta') {
        emailSubject = `Consulta Web (${tipo_especifico}) - ${empresa || nombre}`;
        emailHtml = `
            <h2 style="color: #16a34a; font-family: sans-serif;">Nueva Consulta Comercial/Operativa</h2>
            <ul style="font-family: sans-serif; line-height: 1.6; color: #334155;">
                <li><strong>Área de consulta:</strong> ${tipo_especifico}</li>
                <li><strong>Contacto:</strong> ${nombre}</li>
                <li><strong>Empresa:</strong> ${empresa || 'No especificada'}</li>
                <li><strong>Email:</strong> ${correo}</li>
                <li><strong>Teléfono:</strong> ${telefono || 'No especificado'}</li>
            </ul>
            <h3 style="color: #16a34a; font-family: sans-serif;">Mensaje:</h3>
            <p style="font-family: sans-serif; color: #334155;">${detalles}</p>
        `;
    } 
    else if (tipo_formulario === 'Opinión/Comentario') {
        // Color rojo para reclamos, azul para sugerencias/felicitaciones
        const headerColor = tipo_especifico === 'Reclamo' ? '#dc2626' : '#004b93';
        emailSubject = `Nuevo/a ${tipo_especifico} Web - ${nombre}`;
        emailHtml = `
            <h2 style="color: ${headerColor}; font-family: sans-serif;">Nuevo Comentario: ${tipo_especifico}</h2>
            <ul style="font-family: sans-serif; line-height: 1.6; color: #334155;">
                <li><strong>Remitente:</strong> ${nombre}</li>
                <li><strong>Empresa:</strong> ${empresa || 'No especificada'}</li>
                <li><strong>Email:</strong> ${correo}</li>
                <li><strong>Teléfono:</strong> ${telefono || 'No especificado'}</li>
            </ul>
            <h3 style="color: ${headerColor}; font-family: sans-serif;">Comentario:</h3>
            <p style="font-family: sans-serif; color: #334155;">${detalles}</p>
        `;
    }

    try {
        const data = await resend.emails.send({
            from: 'Contacto SAE <onboarding@resend.dev>', // En producción cambiar al dominio de SAE
            to: ['tu_correo_de_prueba@gmail.com'], // Reemplazar por el correo de destino real
            subject: emailSubject,
            html: emailHtml
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error en Resend:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Micro-API SAE lista y escuchando en el puerto ${PORT}`);
});