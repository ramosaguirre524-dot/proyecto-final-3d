const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const mensajesRecibidos = [];

const CODIGO_SECRETO = '7719461301';
const DATOS_CREADOR = {
  nombre: 'Andres Felipe Ramos Aguirre',
  carrera: 'Estudiante de Multimedia',
  correo: 'andresfeliperamos@ucompensar.edu.co',
  gif: '/5f137f0df767f20cf26ec7d6312b2f10.gif'
};

app.post('/api/verificar-admin', (req, res) => {
  const { codigo } = req.body;
  if (codigo === CODIGO_SECRETO) {
    return res.status(200).json({ autorizado: true, datos: DATOS_CREADOR });
  }
  return res.status(401).json({ autorizado: false, error: 'Código incorrecto.' });
});

app.post('/api/contacto', (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  const nuevoMensaje = { nombre, email, mensaje, fecha: new Date().toLocaleString() };
  mensajesRecibidos.push(nuevoMensaje);
  console.log('Nuevo mensaje recibido:', nuevoMensaje);
  res.status(200).json({ exito: true, mensaje: `¡Gracias ${nombre}! Tu mensaje fue recibido en el servidor.` });
});

app.get('/', (req, res) => {
  const filasTabla = mensajesRecibidos.map((m, index) => `
    <tr>
      <td class="col-num">${index + 1}</td>
      <td class="col-fecha">${m.fecha}</td>
      <td class="col-nombre">${m.nombre}</td>
      <td class="col-email">${m.email}</td>
      <td class="col-mensaje">${m.mensaje}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aether3D - Panel del Servidor</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #04060d; color: #f8fafc; padding: 32px 20px; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
        .contenedor { max-width: 1100px; width: 100%; margin: 0 auto; }
        header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; background: #080d1c; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 24px 28px; margin-bottom: 24px; }
        .marca { font-size: 12px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #fbbf24; margin-bottom: 4px; }
        h1 { font-size: 24px; font-weight: 800; color: #ffffff; }
        .controles { display: flex; align-items: center; gap: 14px; }
        .temporizador { font-size: 13px; color: #93c5fd; background: #050811; border: 1px solid rgba(30, 58, 138, 0.7); padding: 8px 14px; border-radius: 10px; }
        .temporizador strong { color: #fbbf24; }
        button.btn-gold { background: linear-gradient(to right, #f59e0b, #eab308); color: #04060d; border: none; padding: 10px 18px; font-size: 13px; font-weight: 800; border-radius: 10px; cursor: pointer; }
        .tarjeta-tabla { background: #080d1c; border: 1px solid rgba(30, 58, 138, 0.6); border-radius: 16px; overflow: hidden; }
        table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        th { background: #090f20; color: #fbbf24; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 16px; text-align: left; border-bottom: 1px solid rgba(251, 191, 36, 0.25); }
        td { padding: 16px; font-size: 14px; color: #dbeafe; border-bottom: 1px solid rgba(30, 58, 138, 0.35); vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap; }
        .col-num { width: 6%; color: #fbbf24; font-weight: bold; }
        .col-fecha { width: 18%; font-size: 12px; color: #93c5fd; }
        .col-nombre { width: 18%; font-weight: 700; color: #ffffff; }
        .col-email { width: 22%; color: #38bdf8; }
        .col-mensaje { width: 36%; line-height: 1.5; }
        .vacio { padding: 48px 20px; text-align: center; color: #93c5fd; font-size: 15px; }
        footer { text-align: center; padding-top: 32px; }
        #watermark { font-size: 12px; font-family: monospace; letter-spacing: 0.15em; color: rgba(147, 197, 253, 0.25); user-select: none; cursor: default; }
        .modal-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 50; padding: 16px; }
        .modal-box { position: relative; background: #080d1c; border: 1px solid rgba(251,191,36,0.4); border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; text-align: center; }
        .cerrar { position: absolute; top: 12px; right: 12px; background: #172554; color: #bfdbfe; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; }
        input { width: 100%; padding: 12px; margin: 14px 0; background: #04060d; border: 1px solid #1e3a8a; border-radius: 8px; color: #fbbf24; text-align: center; font-family: monospace; letter-spacing: 0.2em; }
        .gif-admin { width: 140px; height: 140px; object-fit: cover; border-radius: 14px; border: 2px solid #fbbf24; margin: 12px auto; display: block; }
      </style>
    </head>
    <body>
      <div class="contenedor">
        <header>
          <div>
            <div class="marca">Aether3D • Backend Express</div>
            <h1>Mensajes Recibidos (${mensajesRecibidos.length})</h1>
          </div>
          <div class="controles">
            <span class="temporizador">Actualización en: <strong id="cuenta">10s</strong></span>
            <button class="btn-gold" onclick="location.reload()">Actualizar ahora</button>
          </div>
        </header>

        <div class="tarjeta-tabla">
          ${mensajesRecibidos.length === 0 
            ? '<p class="vacio">Aún no se han recibido mensajes desde el formulario de contacto.</p>' 
            : `<table><thead><tr><th class="col-num">#</th><th class="col-fecha">Fecha y Hora</th><th class="col-nombre">Nombre</th><th class="col-email">Correo</th><th class="col-mensaje">Mensaje</th></tr></thead><tbody>${filasTabla}</tbody></table>`
          }
        </div>
      </div>

      <footer>
        <span id="watermark">@omeganexuz</span>
      </footer>

      <div id="secretModal" class="modal-bg">
        <div class="modal-box">
          <button class="cerrar" onclick="cerrarModal()">✕</button>
          <div id="pasoCodigo">
            <div class="marca">Acceso Restringido</div>
            <h2 style="font-size:18px; margin-top:4px;">Código de Autorización</h2>
            <input type="password" id="inputCodigo" placeholder="Ingresa el código..." />
            <p id="msgError" style="color:#f87171; font-size:12px; margin-bottom:10px; display:none;">Código incorrecto.</p>
            <button class="btn-gold" style="width:100%;" onclick="verificar()">Verificar</button>
          </div>
          <div id="pasoInfo" style="display:none;"></div>
        </div>
      </div>

      <script>
        let segundos = 10;
        const contador = document.getElementById('cuenta');
        setInterval(() => {
          segundos--;
          if (segundos <= 0) location.reload();
          else contador.textContent = segundos + 's';
        }, 1000);

        document.getElementById('watermark').addEventListener('click', () => {
          document.getElementById('secretModal').style.display = 'flex';
        });

        function cerrarModal() {
          document.getElementById('secretModal').style.display = 'none';
          document.getElementById('inputCodigo').value = '';
          document.getElementById('pasoCodigo').style.display = 'block';
          document.getElementById('pasoInfo').style.display = 'none';
          document.getElementById('pasoInfo').innerHTML = '';
          document.getElementById('msgError').style.display = 'none';
        }

        async function verificar() {
          const codigo = document.getElementById('inputCodigo').value;
          const res = await fetch('/api/verificar-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo })
          });
          if (res.ok) {
            const { datos } = await res.json();
            document.getElementById('pasoCodigo').style.display = 'none';
            const info = document.getElementById('pasoInfo');
            info.innerHTML = '<div class="marca" style="color:#38bdf8;">Ficha de Creador</div>' +
              '<img src="' + datos.gif + '" class="gif-admin" alt="Admin GIF" />' +
              '<h2 style="color:#fbbf24; font-size:18px; margin-bottom:4px;">' + datos.nombre + '</h2>' +
              '<p style="font-size:14px; font-weight:600; margin-bottom:4px;">' + datos.carrera + '</p>' +
              '<p style="font-size:12px; color:#7dd3fc; font-family:monospace;">' + datos.correo + '</p>';
            info.style.display = 'block';
          } else {
            document.getElementById('msgError').style.display = 'block';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en el puerto ' + PORT);
});
 