"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3DCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Parent group for rotation
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // --- Main Glass Card ---
    const cardWidth = 3.6;
    const cardHeight = 2.25;
    const cardDepth = 0.08;
    const cardRadius = 0.18;

    // Custom Rounded Box Shape
    const shape = new THREE.Shape();
    const x = -cardWidth / 2;
    const y = -cardHeight / 2;
    const w = cardWidth;
    const h = cardHeight;
    const r = cardRadius;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      depth: cardDepth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Glass/Metallic Material
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0f172a"),
      metalness: 0.8,
      roughness: 0.15,
      transmission: 0.6,
      opacity: 0.95,
      transparent: true,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.5,
    });

    const cardMesh = new THREE.Mesh(geometry, cardMaterial);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardGroup.add(cardMesh);

    // --- Gold Foil Edges & Accent Stripe ---
    const stripeGeo = new THREE.PlaneGeometry(cardWidth * 0.95, 0.4);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#10b981"),
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color("#059669"),
      emissiveIntensity: 0.3,
    });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(0, 0.4, cardDepth / 2 + 0.03);
    cardGroup.add(stripeMesh);

    // --- SIM Card Chip (3D Gold Plate) ---
    const chipGeo = new THREE.BoxGeometry(0.5, 0.38, 0.04);
    const chipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f59e0b"),
      metalness: 0.95,
      roughness: 0.1,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-1.1, 0.2, cardDepth / 2 + 0.04);
    cardGroup.add(chipMesh);

    // --- Floating 3D Coins orbiting around card ---
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    const coins: THREE.Mesh[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#10b981"),
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color("#047857"),
      emissiveIntensity: 0.2,
    });

    const coinCoords = [
      { x: 2.2, y: 1.2, z: 0.5, rotX: 0.4, rotY: 0.6 },
      { x: -2.3, y: -1.1, z: 0.8, rotX: -0.5, rotY: 0.8 },
      { x: 2.0, y: -1.3, z: -0.4, rotX: 0.8, rotY: -0.3 },
    ];

    coinCoords.forEach((pos) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(pos.x, pos.y, pos.z);
      coin.rotation.set(pos.rotX, pos.rotY, 0);
      coinGroup.add(coin);
      coins.push(coin);
    });

    // --- Floating Glowing Orbs ---
    const orbGeo = new THREE.IcosahedronGeometry(0.15, 2);
    const orbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#06b6d4"),
      emissive: new THREE.Color("#0891b2"),
      emissiveIntensity: 0.8,
      wireframe: true,
    });

    const orb1 = new THREE.Mesh(orbGeo, orbMat);
    orb1.position.set(-2.0, 1.4, 0.2);
    scene.add(orb1);

    const orb2 = new THREE.Mesh(orbGeo, orbMat);
    orb2.position.set(2.4, -0.6, 0.6);
    scene.add(orb2);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 5, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const cyanSpotlight = new THREE.PointLight(0x06b6d4, 4, 10);
    cyanSpotlight.position.set(-4, -2, 3);
    scene.add(cyanSpotlight);

    const emeraldSpotlight = new THREE.PointLight(0x10b981, 4, 10);
    emeraldSpotlight.position.set(4, 3, 3);
    scene.add(emeraldSpotlight);

    // Mouse tilt interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseRef.current.targetX = x * 0.8;
      mouseRef.current.targetY = y * 0.8;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Base floating rotation
      cardGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.15 + mouseRef.current.x;
      cardGroup.rotation.x = Math.cos(elapsedTime * 0.6) * 0.1 - mouseRef.current.y;
      cardGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

      // Coins floating & rotating
      coins.forEach((coin, idx) => {
        coin.rotation.y += 0.015 * (idx % 2 === 0 ? 1 : -1);
        coin.rotation.x += 0.01;
        coin.position.y += Math.sin(elapsedTime * 1.5 + idx) * 0.002;
      });

      // Orbs pulsing
      orb1.rotation.y += 0.01;
      orb2.rotation.y -= 0.015;
      orb1.position.y += Math.sin(elapsedTime * 2) * 0.003;
      orb2.position.y += Math.cos(elapsedTime * 2) * 0.003;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      cardMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] flex items-center justify-center">
      {/* Glow background behind canvas */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-emerald-500/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
