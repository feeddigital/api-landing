import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors({origin: '*'}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para enviar email de inscripción
app.post("/enviar-inscripcion", async (req, res) => {
  const { nombre, apellido, email, whatsapp, planPago } = req.body;

  if (!nombre || !apellido || !email || !planPago) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    await transporter.sendMail({
      from: `"Feed Digital Cursos" <${process.env.EMAIL_USER}>`,
      to: "feeddigitalcursos@gmail.com",
      subject: "Nueva Inscripción al Curso",
      html: `
        <h2>Nueva inscripción</h2>
        <p><b>Nombre:</b> ${nombre} ${apellido}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp || "No proporcionado"}</p>
        <p><b>Plan de pago:</b> ${planPago}</p>
      `,
    });

    res.json({ success: true, message: "Inscripción enviada correctamente" });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({ success: false, message: "Error enviando email" });
  }
});

// Ruta para enviar email de consulta
app.post("/enviar-consulta", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Falta el email" });
  }

  try {
    await transporter.sendMail({
      from: `"Feed Digital Cursos" <${process.env.EMAIL_USER}>`,
      to: "feeddigitalcursos@gmail.com",
      subject: "Consulta de curso",
      html: `
        <h2>Nueva consulta</h2>
        <p><b>Email:</b> ${email}</p>
        <p>Consulta por días y horarios disponibles.</p>
      `,
    });

    res.json({ success: true, message: "Consulta enviada correctamente" });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({ success: false, message: "Error enviando email" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

export default app;
