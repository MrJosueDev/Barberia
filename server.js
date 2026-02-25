const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/disponibilidad/:fecha", (req, res) => {
  const fecha = req.params.fecha;

  const horasBase = [
    "08:00","09:00","10:00",
    "11:00","12:00","13:00",
    "14:00","15:00","16:00",
    "17:00"
  ];

  let citas = [];

  if (fs.existsSync("citas.json")) {
    citas = JSON.parse(fs.readFileSync("citas.json"));
  }

  const citasDelDia = citas.filter(c => c.fecha === fecha);

  const ocupadas = citasDelDia.map(c => c.hora);

  const disponibles = horasBase.filter(h => !ocupadas.includes(h));

  // 🔥 AHORA SÍ enviamos las citas
  res.json({ disponibles, ocupadas, citas: citasDelDia });
});

app.post("/reservar", (req, res) => {
  const { fecha, hora, nombre, telefono } = req.body;

  let citas = [];

  if (fs.existsSync("citas.json")) {
    citas = JSON.parse(fs.readFileSync("citas.json"));
  }

  const existe = citas.some(c => c.fecha === fecha && c.hora === hora);

  if (existe) {
    return res.json({ error: "Hora ocupada" });
  }

  citas.push({ fecha, hora, nombre, telefono });

  fs.writeFileSync("citas.json", JSON.stringify(citas, null, 2));

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// 📋 Obtener TODAS las citas (admin)
app.get("/admin/citas", (req, res) => {
  let citas = [];

  if (fs.existsSync("citas.json")) {
    citas = JSON.parse(fs.readFileSync("citas.json"));
  }

  res.json(citas);
});


// ❌ Eliminar cita
app.delete("/admin/eliminar", (req, res) => {
  const { fecha, hora } = req.body;

  let citas = [];

  if (fs.existsSync("citas.json")) {
    citas = JSON.parse(fs.readFileSync("citas.json"));
  }

  citas = citas.filter(c => !(c.fecha === fecha && c.hora === hora));

  fs.writeFileSync("citas.json", JSON.stringify(citas, null, 2));

  res.json({ ok: true });
});