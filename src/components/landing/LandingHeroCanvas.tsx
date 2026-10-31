'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LandingHeroCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(4.5, 3.5, 5.5);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffb347, 1.4);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7300e5, 0.6);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Rotating Room Group
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Room Floor Platter
    const floorGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.1, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1b222d,
      roughness: 0.5,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x3d4452, roughness: 0.7 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.7), sofaMat);
    sofaBase.position.set(0, 0.2, -0.6);
    sofaBase.castShadow = true;
    roomGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.2), sofaMat);
    sofaBack.position.set(0, 0.55, -0.85);
    sofaBack.castShadow = true;
    roomGroup.add(sofaBack);

    // Coffee table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xb58b57, roughness: 0.3 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.5), tableMat);
    table.position.set(0, 0.15, 0.2);
    table.castShadow = true;
    roomGroup.add(table);

    // Modern Armchair
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x7300e5, roughness: 0.4 });
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.65), chairMat);
    chair.position.set(1.1, 0.3, -0.2);
    chair.rotation.y = -0.6;
    chair.castShadow = true;
    roomGroup.add(chair);

    // Floating Accent Ring / Spatial Indicator
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    roomGroup.add(ring);

    // Subtle continuous rotation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      roomGroup.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
