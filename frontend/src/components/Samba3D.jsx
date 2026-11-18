import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Samba3D({ abierto, onCerrar }) {
  const mountRef = useRef(null);
  const audioRef = useRef(null);
  const [silenciado, setSilenciado] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const audio = new Audio('/samba.mp3');
    audio.loop = true;
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [abierto]);

  const alternarAudio = () => {
    if (!audioRef.current) return;
    if (silenciado) {
      audioRef.current.play();
      setSilenciado(false);
    } else {
      audioRef.current.pause();
      setSilenciado(true);
    }
  };

  useEffect(() => {
    if (!abierto) return;
    const contenedor = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.35, 6.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    contenedor.appendChild(renderer.domElement);

    // Iluminación de Carnaval
    scene.add(new THREE.AmbientLight(0x1e3a8a, 1.6));
    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.4);
    luzPrincipal.position.set(3, 7, 5);
    scene.add(luzPrincipal);

    const luzDorada = new THREE.PointLight(0xfbbf24, 5, 16);
    luzDorada.position.set(3.5, 3, 3.5);
    const luzCian = new THREE.PointLight(0x38bdf8, 5, 16);
    luzCian.position.set(-3.5, 3, 3.5);
    scene.add(luzDorada, luzCian);

    const pista = new THREE.GridHelper(11, 22, 0xfbbf24, 0x1e3a8a);
    pista.position.y = -1.72;
    scene.add(pista);

    // ==========================================
    // SISTEMA DE CONFETI 3D (Dorado, Cian y Blanco)
    // ==========================================
    const confetiGrupo = new THREE.Group();
    const coloresConfeti = [0xfbbf24, 0x38bdf8, 0xffffff, 0xf59e0b, 0x06b6d4];
    const confetiGeo = new THREE.PlaneGeometry(0.11, 0.06);
    const particulasConfeti = [];

    for (let i = 0; i < 160; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: coloresConfeti[i % coloresConfeti.length],
        side: THREE.DoubleSide
      });
      const papel = new THREE.Mesh(confetiGeo, mat);
      papel.position.set(
        (Math.random() - 0.5) * 7.5,
        Math.random() * 5 + 0.5,
        (Math.random() - 0.5) * 4.5
      );
      papel.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      papel.userData = {
        velY: 0.025 + Math.random() * 0.035,
        velRotX: (Math.random() - 0.5) * 0.15,
        velRotZ: (Math.random() - 0.5) * 0.15,
        oscilacion: Math.random() * Math.PI * 2
      };
      confetiGrupo.add(papel);
      particulasConfeti.push(papel);
    }
    scene.add(confetiGrupo);

    // ==========================================
    // MODELO DETALLADO DEL BAILARÍN DE SAMBA
    // ==========================================
    const matAzul = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.25 });
    const matOro = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.15 });
    const matVisor = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const matPlumaCian = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, roughness: 0.3 });

    const bailarin = new THREE.Group();
    bailarin.position.y = -0.35;

    // 1. Pelvis + Cinturón de Carnaval con flecos
    const pelvisGrupo = new THREE.Group();
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.3, 0.48), matOro);
    const cinturon = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.54), matPlumaCian);
    cinturon.position.y = 0.08;
    pelvisGrupo.add(pelvis, cinturon);
    bailarin.add(pelvisGrupo);

    // 2. Torso + Pechera Ornamentada
    const torsoGrupo = new THREE.Group();
    torsoGrupo.position.y = 0.18;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.9, 0.5), matAzul);
    torso.position.y = 0.45;
    const estrellaPecho = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), matOro);
    estrellaPecho.position.set(0, 0.54, 0.28);
    torsoGrupo.add(torso, estrellaPecho);
    pelvisGrupo.add(torsoGrupo);

    // 3. Cabeza + Corona de 7 Plumas
    const cabezaGrupo = new THREE.Group();
    cabezaGrupo.position.y = 0.94;
    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.5, 0.5), matOro);
    cabeza.position.y = 0.28;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.05), matVisor);
    visor.position.set(0, 0.32, 0.26);
    cabezaGrupo.add(cabeza, visor);

    const corona = new THREE.Group();
    corona.position.set(0, 0.56, -0.05);
    [-0.85, -0.56, -0.28, 0, 0.28, 0.56, 0.85].forEach((ang, idx) => {
      const pluma = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.72, 8),
        idx % 2 === 0 ? matOro : matPlumaCian
      );
      pluma.position.set(Math.sin(ang) * 0.4, Math.cos(ang) * 0.36, 0);
      pluma.rotation.z = -ang;
      corona.add(pluma);
    });
    cabezaGrupo.add(corona);
    torsoGrupo.add(cabezaGrupo);
    // 4. Brazos Articulados + Hombreras + Maracas Festivas
    const crearBrazoSamba = (xPos) => {
      const hombro = new THREE.Group();
      hombro.position.set(xPos, 0.8, 0);
      const hombrera = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), matOro);
      const aroHombrera = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 20).rotateX(Math.PI / 2), matPlumaCian);
      const brazoSup = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.24), matAzul);
      brazoSup.position.y = -0.23;
      hombro.add(hombrera, aroHombrera, brazoSup);

      const codo = new THREE.Group();
      codo.position.set(0, -0.48, 0);
      const antebrazo = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.42, 0.21), matOro);
      antebrazo.position.y = -0.21;

      // Maraca en la mano
      const mangoMaraca = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), matAzul);
      mangoMaraca.position.set(0, -0.45, 0.08);
      mangoMaraca.rotation.x = Math.PI / 3;
      const esferaMaraca = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), matPlumaCian);
      esferaMaraca.position.set(0, -0.52, 0.18);

      codo.add(antebrazo, mangoMaraca, esferaMaraca);
      hombro.add(codo);
      torsoGrupo.add(hombro);
      return { hombro, codo };
    };

    const brazoIzq = crearBrazoSamba(-0.68);
    const brazoDer = crearBrazoSamba(0.68);

    // 5. Piernas Articuladas + Rodillas + Zapatos Dorados
    const crearPiernaSamba = (xPos) => {
      const cadera = new THREE.Group();
      cadera.position.set(xPos, -0.1, 0);
      const muslo = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.32), matAzul);
      muslo.position.y = -0.26;
      cadera.add(muslo);

      const rodilla = new THREE.Group();
      rodilla.position.set(0, -0.54, 0);
      const pantorrilla = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.28), matOro);
      pantorrilla.position.y = -0.25;

      // Zapato articulado
      const zapato = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.46), matPlumaCian);
      zapato.position.set(0, -0.52, 0.08);

      rodilla.add(pantorrilla, zapato);
      cadera.add(rodilla);
      pelvisGrupo.add(cadera);
      return { cadera, rodilla };
    };

    const piernaIzq = crearPiernaSamba(-0.26);
    const piernaDer = crearPiernaSamba(0.26);

    scene.add(bailarin);

    // ==========================================
    // BUCLE DE ANIMACIÓN SINCRONIZADO CON LA CANCIÓN (128 BPM)
    // ==========================================
    let animacionId;
    const relojInterno = new THREE.Clock();

    const animar = () => {
      animacionId = requestAnimationFrame(animar);

      // Usa el tiempo real del audio si está sonando para ir clavado al beat (128 BPM = 2.133 beats/seg)
      const audio = audioRef.current;
      const tiempoMusica = audio && !audio.paused ? audio.currentTime : relojInterno.getElapsedTime();
      const beat = tiempoMusica * (128 / 60) * Math.PI; // Pulso exacto de la samba

      // Intensidad según la parte de la canción:
      // 0s - 10.5s: Intro de campanas agogó (movimiento suave de calentamiento)
      // 10.5s - 45.5s: Estrofa y coro (baile medio)
      // 45.5s en adelante: Explosión de batucada (baile máximo)
      let energia = 1.0;
      if (tiempoMusica < 10.5) {
        energia = 0.45;
      } else if (tiempoMusica >= 45.5) {
        energia = 1.25;
      }

      const fasePaso = Math.sin(beat * 0.5);
      const reboteSamba = Math.abs(Math.sin(beat));

      // Movimiento general del cuerpo
      bailarin.position.x = fasePaso * 0.55 * energia;
      bailarin.position.y = -0.35 + reboteSamba * 0.16 * energia;
      bailarin.rotation.y = Math.sin(beat * 0.25) * 0.5;

      // Cadera y Torso en disociación latina
      pelvisGrupo.rotation.z = fasePaso * 0.3 * energia;
      pelvisGrupo.rotation.y = Math.cos(beat * 0.5) * 0.28 * energia;

      torsoGrupo.rotation.z = -fasePaso * 0.24 * energia;
      torsoGrupo.rotation.y = -Math.cos(beat * 0.5) * 0.32 * energia;
      torsoGrupo.rotation.x = 0.08 + reboteSamba * 0.07 * energia;

      // Cabeza y plumas al ritmo
      cabezaGrupo.rotation.z = fasePaso * 0.15;
      cabezaGrupo.rotation.y = Math.sin(beat * 0.5) * 0.22;

      // Brazos agitando las maracas al compás
      brazoIzq.hombro.rotation.z = -1.05 + Math.sin(beat) * 0.3 * energia;
      brazoIzq.hombro.rotation.x = -0.35 + Math.cos(beat * 0.5) * 0.35;
      brazoIzq.codo.rotation.x = -1.25 + Math.sin(beat * 2) * 0.25 * energia;

      brazoDer.hombro.rotation.z = 1.05 - Math.sin(beat) * 0.3 * energia;
      brazoDer.hombro.rotation.x = -0.35 - Math.cos(beat * 0.5) * 0.35;
      brazoDer.codo.rotation.x = -1.25 - Math.sin(beat * 2) * 0.25 * energia;

      // Paso cruzado Whisk de Samba
      if (fasePaso >= 0) {
        piernaDer.cadera.rotation.z = fasePaso * 0.45 * energia;
        piernaDer.cadera.rotation.x = -reboteSamba * 0.25 * energia;
        piernaDer.rodilla.rotation.x = reboteSamba * 0.55 * energia;

        piernaIzq.cadera.rotation.z = fasePaso * 0.35 * energia;
        piernaIzq.cadera.rotation.x = fasePaso * 0.35 * energia;
        piernaIzq.rodilla.rotation.x = fasePaso * 0.65 * energia;
      } else {
        const absPaso = Math.abs(fasePaso);
        piernaIzq.cadera.rotation.z = -absPaso * 0.45 * energia;
        piernaIzq.cadera.rotation.x = -reboteSamba * 0.25 * energia;
        piernaIzq.rodilla.rotation.x = reboteSamba * 0.55 * energia;

        piernaDer.cadera.rotation.z = -absPaso * 0.35 * energia;
        piernaDer.cadera.rotation.x = absPaso * 0.35 * energia;
        piernaDer.rodilla.rotation.x = absPaso * 0.65 * energia;
      }

      // Animación de caída continua del Confeti 3D
      particulasConfeti.forEach((p, idx) => {
        p.position.y -= p.userData.velY * (0.8 + energia * 0.4);
        p.position.x += Math.sin(tiempoMusica * 2 + p.userData.oscilacion) * 0.015;
        p.rotation.x += p.userData.velRotX;
        p.rotation.z += p.userData.velRotZ;

        // Cuando llega al suelo vuelve a caer desde arriba
        if (p.position.y < -1.7) {
          p.position.y = 4.2 + (idx % 10) * 0.15;
          p.position.x = (Math.random() - 0.5) * 7.5;
        }
      });

      // Luces de fiesta girando al compás
      luzDorada.position.x = Math.cos(beat * 0.35) * 4.2;
      luzCian.position.x = -Math.cos(beat * 0.35) * 4.2;

      renderer.render(scene, camera);
    };
    animar();

    return () => {
      cancelAnimationFrame(animacionId);
      if (contenedor.contains(renderer.domElement)) {
        contenedor.removeChild(renderer.domElement);
      }
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#080d1c] border border-amber-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(251,191,36,0.3)]">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-blue-200 hover:text-amber-400 bg-blue-950 w-8 h-8 rounded-full font-bold z-10"
        >
          ✕
        </button>

        <button
          onClick={alternarAudio}
          className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition z-10"
        >
          {silenciado ? '🔇 Activar Música' : '🔊 Música Activa'}
        </button>

        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Zona Secreta Desbloqueada</span>
          <h3 className="text-2xl font-extrabold text-white">Modo Carnaval: Samba 3D</h3>
        </div>
        <div ref={mountRef} className="w-full h-[390px] rounded-xl bg-[#04060d] border border-blue-900/50" />
      </div>
    </div>
  );
}
