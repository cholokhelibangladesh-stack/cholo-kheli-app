import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Center, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import logoAsset from "@/assets/logo.glb.asset.json";

/**
 * Full-screen loading intro that renders the 3D Cholo Kheli logo on a
 * soft candy-blue backdrop. Auto-dismisses after ~2.6s (or when the user
 * taps the screen). Emits `onDone` when finished.
 */

// Soft candy blue — vivid enough for the logo to pop, gentle on the eye.
const CANDY_BLUE = "#7EC8FF";
const CANDY_BLUE_DEEP = "#4DA9F7";

useGLTF.preload(logoAsset.url);

function LogoModel() {
  const { scene } = useGLTF(logoAsset.url);
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number>(performance.now());

  useFrame(() => {
    if (!ref.current) return;
    const t = (performance.now() - start.current) / 1000;
    // Gentle entrance: scale up + rotate in first 0.9s, then continuous spin.
    const enter = Math.min(1, t / 0.9);
    const eased = 1 - Math.pow(1 - enter, 3);
    ref.current.scale.setScalar(eased);
    ref.current.rotation.y = eased * Math.PI * 0.5 + t * 0.6;
    ref.current.position.y = Math.sin(t * 1.4) * 0.05;
  });

  return (
    <Center>
      <group ref={ref}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

interface Props {
  onDone: () => void;
  duration?: number; // ms
}

export default function Logo3DIntro({ onDone, duration = 2600 }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const finish = () => setVisible(false);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="logo-intro"
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={finish}
          style={{
            background: `radial-gradient(120% 90% at 50% 40%, ${CANDY_BLUE} 0%, ${CANDY_BLUE_DEEP} 55%, #2E86D6 100%)`,
          }}
        >
          {/* Soft ambient blobs */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(40% 30% at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 60%), radial-gradient(35% 28% at 80% 85%, rgba(255,255,255,0.22) 0%, transparent 60%)",
            }}
          />

          <div className="relative w-full h-full">
            <Canvas
              camera={{ position: [0, 0.2, 3.4], fov: 40 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.75} />
              <directionalLight position={[3, 4, 3]} intensity={1.6} color="#ffffff" />
              <directionalLight position={[-3, -2, 2]} intensity={0.6} color="#bfe0ff" />
              <Suspense fallback={null}>
                <LogoModel />
                <Environment preset="city" />
                <ContactShadows
                  position={[0, -1.05, 0]}
                  opacity={0.35}
                  scale={5}
                  blur={2.4}
                  far={2}
                />
              </Suspense>
            </Canvas>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="pointer-events-none absolute bottom-24 left-0 right-0 flex flex-col items-center gap-2"
          >
            <div className="font-display text-white tracking-[0.22em] text-xl font-semibold drop-shadow-[0_2px_10px_rgba(0,40,80,0.35)]">
              CHOLO <span className="font-bold">KHELI</span>
            </div>
            <div className="text-[10px] tracking-[0.42em] uppercase text-white/85">
              Let's Play
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
