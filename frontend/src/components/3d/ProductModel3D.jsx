import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Environment, Float, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';

// 3D Product Model Component
function ProductBox({ product }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
      <Box ref={meshRef} args={[2, 2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={product.category_name === 'Electronics' ? '#3B82F6' : '#10B981'}
          roughness={0.3}
          metalness={0.1}
        />
      </Box>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.05}
        position={[0, -2, 0]}
        curveSegments={12}
      >
        {product.name.substring(0, 15)}
        <meshStandardMaterial color="#FFF" />
      </Text3D>
    </Float>
  );
}

// Phone Model
function PhoneModel({ product }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={meshRef}>
        {/* Phone body */}
        <Box args={[1, 2, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1F2937" roughness={0.1} metalness={0.8} />
        </Box>
        {/* Screen */}
        <Box args={[0.9, 1.8, 0.11]} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#000" emissive="#4F46E5" emissiveIntensity={0.2} />
        </Box>
        {/* Camera */}
        <Sphere args={[0.08]} position={[-0.3, 0.7, 0.06]}>
          <meshStandardMaterial color="#111" />
        </Sphere>
      </group>
    </Float>
  );
}

// Laptop Model
function LaptopModel({ product }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef} rotation={[0.2, 0, 0]}>
        {/* Base */}
        <Box args={[3, 0.1, 2]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#E5E7EB" roughness={0.3} metalness={0.7} />
        </Box>
        {/* Screen */}
        <Box args={[2.8, 1.8, 0.05]} position={[0, 0.9, -0.9]} rotation={[-0.3, 0, 0]}>
          <meshStandardMaterial color="#000" emissive="#3B82F6" emissiveIntensity={0.1} />
        </Box>
      </group>
    </Float>
  );
}

export default function ProductModel3D({ product, className = "" }) {
  const get3DModel = () => {
    const productName = product.name.toLowerCase();
    
    if (productName.includes('iphone') || productName.includes('phone')) {
      return <PhoneModel product={product} />;
    } else if (productName.includes('macbook') || productName.includes('laptop')) {
      return <LaptopModel product={product} />;
    } else {
      return <ProductBox product={product} />;
    }
  };

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {get3DModel()}
          
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={2}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}