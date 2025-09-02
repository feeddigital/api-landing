import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(express.static("public"));
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

app.post("/clase-intro", async (req, res) => {
  const { nombre, apellido, email, whatsapp } = req.body;

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // 1️⃣ Notificación al administrador
    await transporter.sendMail({
      from: `"Digital Dev Cursos" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Nuevo Registro (Clase Intro)",
      html: `
        <h2>Nuevo registro para la clase introductoria</h2>
        <p><b>Nombre:</b> ${nombre} ${apellido}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp || "No proporcionado"}</p>
      `,
    });

    // 2️⃣ Mail de bienvenida al alumno
    await transporter.sendMail({
      from: `"Digital Dev Cursos" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "¡Bienvenido/a a Digital Dev!",
      html: `
       <div style="background-color:#000000; color:#ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding:40px; text-align:center;">
  <img src="https://api-landing-seven.vercel.app/LOGO_CUADRADO_2.jpg" alt="Digital Dev Logo" style="max-width:150px; margin-bottom:20px;" />
  <h1 style="font-weight:600;">Hola ${nombre}, ¡Bienvenido/a a <span style="color:#00ffcc;">Digital Dev</span>!</h1>
  <p style="font-size:16px; line-height:1.5; margin:20px 0;">
    Te compartimos el link para que puedas ver la <b>primer clase del curso de Desarrollo Web FullStack</b>.
  </p>

  <p style="margin:30px 0;">
    <a href="https://youtu.be/gDI4ovmR9L8" 
       target="_blank" 
       style="background-color:#00ffcc; color:#000; padding:12px 20px; text-decoration:none; font-weight:bold; border-radius:6px; display:inline-block;">
       👉 Ver Clase Introductoria
    </a>
  </p>

  <p style="font-size:18px; line-height:1.5; margin:20px 0;">
    Esta clase introductoria no tiene costo 🚀.  
    Si deseas continuar con las demás clases, te invitamos a inscribirte desde el formulario en nuestra web 👉
    <a href="https://digitaldevcursos.com" target="_blank" style="color:#00ffcc; text-decoration:none;">digitaldevcursos.com</a>
  </p>
  <hr style="border: 0; border-top: 1px solid #444; margin: 30px 0;" />
  <p style="font-size:14px; color:#aaaaaa;">
    ¡Gracias por confiar en nosotros!<br />
    <b>Por cualquier consulta o problema para abrir el link, no dudes en contactarnos. Respondé este mensaje.</b><br />
    <b>Team Digital Dev</b>
  </p>
</div>
      `,
    });

    res.json({
      success: true,
      message: "Correo de bienvenida enviado correctamente",
    });
  } catch (error) {
    console.error("Error enviando correo de bienvenida:", error);
    res.status(500).json({ success: false, message: "Error enviando correos" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

export default app;
