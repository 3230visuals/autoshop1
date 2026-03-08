import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, MeshDistortMaterial, Float, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const StylizedCar = () => {
    const carGroup = useRef<THREE.Group>(null);

    // Subtle floating/rotation animation
    useFrame((state) => {
        if (!carGroup.current) return;
        const t = state.clock.getElapsedTime();
        carGroup.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        carGroup.current.position.y = Math.sin(t * 1.5) * 0.05;
    });

    return (
        <group ref={carGroup}>
            {/* Main Body */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[2.5, 0.6, 1.2]} />
                <MeshDistortMaterial
                    color="#F97316"
                    speed={2}
                    distort={0.1}
                    depthWrite={false}
                    transmission={0.8}
                    thickness={0.5}
                    roughness={0.1}
                    metalness={0.9}
                />
            </mesh>

            {/* Top Cabin */}
            <mesh position={[-0.2, 0.9, 0]}>
                <boxGeometry args={[1.2, 0.5, 1.0]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    transmission={1}
                    thickness={1}
                    roughness={0}
                />
            </mesh>

            {/* Wheels */}
            {[[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} />
                </mesh>
            ))}

            {/* Lights */}
            <mesh position={[1.25, 0.45, 0.4]}>
                <boxGeometry args={[0.05, 0.2, 0.3]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
            </mesh>
            <mesh position={[1.25, 0.45, -0.4]}>
                <boxGeometry args={[0.05, 0.2, 0.3]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
            </mesh>

            {/* Tail Lights */}
            <mesh position={[-1.25, 0.45, 0.4]}>
                <boxGeometry args={[0.05, 0.2, 0.3]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-1.25, 0.45, -0.4]}>
                <boxGeometry args={[0.05, 0.2, 0.3]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
            </mesh>

            {/* Ground Shadow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[4, 2]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>
        </group>
    );
};

const Vehicle3DView: React.FC = () => {
    return (
        <div className="w-full h-full relative group">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={35} />

                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0.3, 0]}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 2]}
                >
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <StylizedCar />
                    </Float>
                </PresentationControls>

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Suspense fallback={null}>
                    <Environment preset="night" />
                </Suspense>
            </Canvas>

            {/* Overlay Info (optional) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/5 group-hover:text-white/20 transition-all">
                    Interact to Rotate
                </div>
            </div>
        </div>
    );
};

export default Vehicle3DView;
