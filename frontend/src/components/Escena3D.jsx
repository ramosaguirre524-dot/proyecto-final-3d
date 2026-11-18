import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Escena3D({ modeloActivo, configAtomo = { orbitas: 3, electrones: 2, velocidad: 1 } }) {
  const mountRef = useRef(null);
  const [parteSeleccionada, setParteSeleccionada] = useState(null);

  useEffect(() => {
    setParteSeleccionada(null);
    const contenedor = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    contenedor.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.5;
    controls.maxDistance = 11;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 0.2, 0);
    controls.enablePan = false;
    controls.enabled = modeloActivo !== 'nudo';

    const luzAmbiental = new THREE.AmbientLight(0x1e3a8a, 1.4);
    scene.add(luzAmbiental);
    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.6);
    luzPrincipal.position.set(5, 9, 6);
    scene.add(luzPrincipal);
    const luzDorada = new THREE.PointLight(0xfbbf24, 3, 18);
    luzDorada.position.set(-5, 3, 4);
    scene.add(luzDorada);
    const luzAzul = new THREE.PointLight(0x38bdf8, 3, 18);
    luzAzul.position.set(5, 1, -4);
    scene.add(luzAzul);

    const gridHelper = new THREE.GridHelper(14, 28, 0xd97706, 0x1e293b);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    const grupoPrincipal = new THREE.Group();
    scene.add(grupoPrincipal);

    let partes = {};
    const objetosInteractivos = [];

    if (modeloActivo === 'nudo') {
      const geo = new THREE.TorusKnotGeometry(1.05, 0.32, 128, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.15 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 0.2;
      grupoPrincipal.add(mesh);
      partes.mesh = mesh;
    }
    if (modeloActivo === 'carro') {
      const carro = new THREE.Group();
      carro.position.y = -0.7;

      const chasisMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
      const chasis = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.55, 1.3), chasisMat);
      chasis.position.y = -0.3;
      carro.add(chasis);

      const cabinaMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
      const cabina = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.1), cabinaMat);
      cabina.position.set(-0.15, 0.2, 0);
      carro.add(cabina);

      const aleron = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 1.3), cabinaMat);
      aleron.position.set(-1.3, 0.15, 0);
      carro.add(aleron);

      const faroMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      const faroIzq = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.3), faroMat);
      faroIzq.position.set(1.41, -0.25, 0.4);
      const faroDer = faroIzq.clone();
      faroDer.position.z = -0.4;
      carro.add(faroIzq, faroDer);

      const ruedaGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
      ruedaGeo.rotateX(Math.PI / 2);
      const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const rinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 });

      const posicionesRuedas = [[0.85, -0.55, 0.7], [0.85, -0.55, -0.7], [-0.85, -0.55, 0.7], [-0.85, -0.55, -0.7]];
      partes.ruedas = posicionesRuedas.map(([x, y, z]) => {
        const rueda = new THREE.Mesh(ruedaGeo, ruedaMat);
        const rin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.27, 12).rotateX(Math.PI / 2), rinMat);
        rueda.add(rin);
        rueda.position.set(x, y, z);
        carro.add(rueda);
        return rueda;
      });
      grupoPrincipal.add(carro);
      partes.carro = carro;
    }

    if (modeloActivo === 'humanoide') {
      const robot = new THREE.Group();
      robot.position.y = -0.35; // Pies apoyados en -1.6

      const crearMatCuerpo = () => new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.3 });
      const crearMatOro = () => new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.15 });
      const matVisor = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      // Registra la pieza con sus límites anatómicos estrictos { minX, maxX, minY, maxY, minZ, maxZ }
      const registrar = (malla, pivote, nombre, limites) => {
        pivote.rotation.order = 'YXZ'; // Orden anatómico natural
        const edgesGeo = new THREE.EdgesGeometry(malla.geometry);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const bordeAzul = new THREE.LineSegments(edgesGeo, edgesMat);
        bordeAzul.scale.set(1.04, 1.04, 1.04);
        bordeAzul.visible = false;
        malla.add(bordeAzul);

        malla.userData = { pivote, nombre, bordeAzul, limites };
        objetosInteractivos.push(malla);
      };

      // PELVIS / BASE (Fija)
      const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.32, 0.5), crearMatOro());
      pelvis.position.y = 0.05;
      robot.add(pelvis);

      // 1. CINTURA (Pivote superior del tronco)
      const cinturaPivote = new THREE.Group();
      cinturaPivote.position.set(0, 0.22, 0);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.92, 0.55), crearMatCuerpo());
      torso.position.y = 0.48;
      const pecho = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16).rotateX(Math.PI / 2), crearMatOro());
      pecho.position.set(0, 0.6, 0.04);
      cinturaPivote.add(torso, pecho);
      robot.add(cinturaPivote);
      registrar(torso, cinturaPivote, 'Cintura / Torso', {
        minX: -0.45, maxX: 0.75,   // Se inclina más adelante que atrás
        minY: -0.85, maxY: 0.85,   // Rotación lateral de cintura
        minZ: -0.35, maxZ: 0.35
      });

      // 2. CABEZA (Hija de la cintura)
      const cuelloPivote = new THREE.Group();
      cuelloPivote.position.set(0, 0.96, 0);
      const cabeza = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.54, 0.54), crearMatOro());
      cabeza.position.y = 0.3;
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.13, 0.05), matVisor);
      visor.position.set(0, 0.34, 0.28);
      cuelloPivote.add(cabeza, visor);
      cinturaPivote.add(cuelloPivote);
      registrar(cabeza, cuelloPivote, 'Cabeza', {
        minX: -0.65, maxX: 0.65,   // Mirar arriba/abajo
        minY: -1.2,  maxY: 1.2,    // Mirar izquierda/derecha
        minZ: 0,     maxZ: 0
      });

      // 3. BRAZOS (Hombro + Codo tipo bisagra humana)
      const crearBrazo = (lado, xPos, esIzquierdo) => {
        const hombro = new THREE.Group();
        hombro.position.set(xPos, 0.85, 0);
        const brazoSup = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.28), crearMatOro());
        brazoSup.position.y = -0.25;
        hombro.add(brazoSup);

        // El brazo izquierdo abre hacia -Z y el derecho hacia +Z (nunca cruza el pecho)
        registrar(brazoSup, hombro, `Hombro ${lado}`, {
          minX: -2.6, maxX: 0.85, // Levantar brazo al frente (-X) o atrás (+X)
          minY: -0.5, maxY: 0.5,
          minZ: esIzquierdo ? -1.4 : -0.1,
          maxZ: esIzquierdo ? 0.1 : 1.4
        });

        // CODO (Bisagra: solo flexiona hacia adelante, negativo en X)
        const codo = new THREE.Group();
        codo.position.set(0, -0.52, 0);
        const antebrazo = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.24), crearMatCuerpo());
        antebrazo.position.y = -0.24;
        codo.add(antebrazo);
        hombro.add(codo);
        cinturaPivote.add(hombro);

        registrar(antebrazo, codo, `Codo ${lado}`, {
          minX: -2.35, maxX: 0,    // Solo dobla hacia el frente (0° a 135°)
          minY: 0,     maxY: 0,
          minZ: 0,     maxZ: 0
        });
      };
      crearBrazo('Izquierdo', -0.72, true);
      crearBrazo('Derecho', 0.72, false);

      // 4. PIERNAS (Cadera + Rodilla tipo bisagra humana)
      const crearPierna = (lado, xPos, esIzquierda) => {
        const cadera = new THREE.Group();
        cadera.position.set(xPos, -0.1, 0);
        const muslo = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.34), crearMatCuerpo());
        muslo.position.y = -0.28;
        cadera.add(muslo);

        registrar(muslo, cadera, `Muslo ${lado}`, {
          minX: -1.8, maxX: 0.65,  // Levantar pierna al frente (-X) o atrás (+X)
          minY: -0.35, maxY: 0.35,
          minZ: esIzquierda ? -0.75 : -0.05,
          maxZ: esIzquierda ? 0.05 : 0.75
        });

        // RODILLA (Bisagra: solo flexiona hacia atrás, positivo en X)
        const rodilla = new THREE.Group();
        rodilla.position.set(0, -0.58, 0);
        const pantorrilla = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.56, 0.3), crearMatOro());
        pantorrilla.position.y = -0.28;
        rodilla.add(pantorrilla);
        cadera.add(rodilla);
        robot.add(cadera);

        registrar(pantorrilla, rodilla, `Rodilla ${lado}`, {
          minX: 0, maxX: 2.35,     // Solo dobla hacia atrás (0° a 135°)
          minY: 0, maxY: 0,
          minZ: 0, maxZ: 0
        });
      };
      crearPierna('Izquierda', -0.27, true);
      crearPierna('Derecha', 0.27, false);

      grupoPrincipal.add(robot);
    }

    if (modeloActivo === 'atomo') {
      const atomoGrupo = new THREE.Group();
      atomoGrupo.position.y = 0.25;

      const nucleoMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, metalness: 0.8, roughness: 0.2 });
      const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), nucleoMat);
      atomoGrupo.add(nucleo);

      const anilloMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.2 });
      partes.anillos = [];
      const orbitasSeguras = Number(configAtomo?.orbitas) || 3;
      const electronesSeguros = Number(configAtomo?.electrones) || 2;
      const numOrbitas = Math.min(Math.max(orbitasSeguras, 1), 5);
      const numElectrones = Math.min(Math.max(electronesSeguros, 1), 4);

      for (let i = 0; i < numOrbitas; i++) {
        const anilloGrupo = new THREE.Group();
        const radio = 1.05 + i * 0.24;
        const anillo = new THREE.Mesh(new THREE.TorusGeometry(radio, 0.032, 16, 100), anilloMat);
        anilloGrupo.add(anillo);

        for (let e = 0; e < numElectrones; e++) {
          const angulo = (e / numElectrones) * Math.PI * 2;
          const electron = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), nucleoMat);
          electron.position.set(Math.cos(angulo) * radio, Math.sin(angulo) * radio, 0);
          anilloGrupo.add(electron);
        }

        anilloGrupo.rotation.set((i * Math.PI) / numOrbitas, (i * Math.PI) / 3, 0);
        atomoGrupo.add(anilloGrupo);
        partes.anillos.push(anilloGrupo);
      }
      grupoPrincipal.add(atomoGrupo);
    }
    let mouseX = 0;
    let mouseY = 0;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let mallaActiva = null;
    let mallaResaltada = null;
    let prevMouse = { x: 0, y: 0 };

    const obtenerCoords = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const bloquearMenuContextual = (e) => e.preventDefault();

    const alPresionarRaton = (e) => {
      if (modeloActivo !== 'humanoide' || e.button !== 2) return;

      obtenerCoords(e);
      raycaster.setFromCamera(pointer, camera);
      const impactos = raycaster.intersectObjects(objetosInteractivos, false);

      if (impactos.length > 0) {
        const malla = impactos[0].object;
        mallaActiva = malla;
        setParteSeleccionada(malla.userData.nombre);

        if (mallaResaltada) {
          mallaResaltada.material.emissive.setHex(0x000000);
          mallaResaltada.userData.bordeAzul.visible = false;
        }
        mallaResaltada = malla;
        mallaResaltada.material.emissive.setHex(0x0284c7);
        mallaResaltada.userData.bordeAzul.visible = true;

        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const alMoverRaton = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (modeloActivo === 'humanoide' && mallaActiva) {
        const { pivote, limites } = mallaActiva.userData;
        const deltaX = (e.clientX - prevMouse.x) * 0.018;
        const deltaY = (e.clientY - prevMouse.y) * 0.018;

        // Flexión adelante/atrás (Eje X)
        pivote.rotation.x = Math.max(limites.minX, Math.min(limites.maxX, pivote.rotation.x + deltaY));

        // Si la articulación gira sobre su eje (Cabeza, Cintura, Hombro, Muslo) aplica Y; si abre lateralmente aplica Z
        if (limites.maxY > 0) {
          pivote.rotation.y = Math.max(limites.minY, Math.min(limites.maxY, pivote.rotation.y + deltaX));
        }
        if (limites.maxZ > 0 || limites.minZ < 0) {
          pivote.rotation.z = Math.max(limites.minZ, Math.min(limites.maxZ, pivote.rotation.z + deltaX));
        }

        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const alSoltarRaton = (e) => {
      if (e.button === 2) {
        mallaActiva = null;
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('contextmenu', bloquearMenuContextual);
    domElem.addEventListener('pointerdown', alPresionarRaton);
    window.addEventListener('pointermove', alMoverRaton);
    window.addEventListener('pointerup', alSoltarRaton);

    const alRedimensionar = () => {
      if (!contenedor) return;
      camera.aspect = contenedor.clientWidth / contenedor.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
    };
    window.addEventListener('resize', alRedimensionar);

    let animacionId;
    const animar = () => {
      animacionId = requestAnimationFrame(animar);

      if (modeloActivo === 'nudo' && partes.mesh) {
        partes.mesh.rotation.x += 0.008 + mouseY * 0.03;
        partes.mesh.rotation.y += 0.012 + mouseX * 0.03;
      }

      if (modeloActivo === 'carro' && partes.ruedas) {
        partes.ruedas.forEach((r) => { r.rotation.z -= 0.08; });
      }

      if (modeloActivo === 'atomo' && partes.anillos) {
        const vel = Number(configAtomo?.velocidad) || 1;
        partes.anillos.forEach((anillo, idx) => {
          anillo.rotation.z += 0.012 * vel * (idx + 1);
          anillo.rotation.y += 0.008 * vel;
        });
      }

      if (controls.enabled) controls.update();
      renderer.render(scene, camera);
    };
    animar();

    return () => {
      cancelAnimationFrame(animacionId);
      domElem.removeEventListener('contextmenu', bloquearMenuContextual);
      domElem.removeEventListener('pointerdown', alPresionarRaton);
      window.removeEventListener('pointermove', alMoverRaton);
      window.removeEventListener('pointerup', alSoltarRaton);
      window.removeEventListener('resize', alRedimensionar);
      controls.dispose();
      if (contenedor.contains(domElem)) contenedor.removeChild(domElem);
    };
  }, [modeloActivo, configAtomo]);

  return (
    <div className="relative w-full">
      <div
        ref={mountRef}
        className="w-full h-[400px] md:h-[470px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060b19] via-[#0a132c] to-[#040711] border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.12)] cursor-grab active:cursor-grabbing"
      />
      {modeloActivo === 'humanoide' && (
        <div className="absolute bottom-3 left-3 bg-[#050811]/90 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs text-blue-200 pointer-events-none">
          {parteSeleccionada ? (
            <span>Articulación activa: <strong className="text-cyan-400">{parteSeleccionada}</strong> (Arrastra con clic derecho)</span>
          ) : (
            <span>Clic Izquierdo: Girar cámara • <strong>Clic Derecho sobre pieza:</strong> Mover articulación</span>
          )}
        </div>
      )}
    </div>
  );
}
