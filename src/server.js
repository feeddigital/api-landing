import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONT_DEV, process.env.FRONT_PROD],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    credentials: true,
  })
);

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", true);
  res.sendStatus(200);
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.send("server ok");
});

// Ruta para enviar email de inscripción
app.post("/enviar-inscripcion", async (req, res) => {
  const { nombre, apellido, email, whatsapp, planPago } = req.body;

  if (!nombre || !apellido || !email || !planPago) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    await transporter.sendMail({
      from: `"Digital Dev Cursos" <${process.env.EMAIL_USER}>`,
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
  const { email, message } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Falta el email" });
  }

  try {
    await transporter.sendMail({
      from: `"Digital Dev Cursos" <${process.env.EMAIL_USER}>`,
      to: "feeddigitalcursos@gmail.com",
      subject: "Consulta de curso",
      html: `
        <h2>Nueva consulta</h2>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b> ${
          message && message.trim() !== ""
            ? message
            : "Consulta por días y horarios disponibles."
        }</p>
      `,
    });

    res.json({ success: true, message: "Consulta enviada correctamente" });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({ success: false, message: "Error enviando email" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

export default app;
