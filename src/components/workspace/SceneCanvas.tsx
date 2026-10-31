'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArchiTechScene, SceneObject } from '../../types/scene';
import { Maximize2, RotateCcw, Grid, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface SceneCanvasProps {
  scene: ArchiTechScene | null;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  activeViewMode: 'perspective' | 'top' | 'front';
  wireframeMode: boolean;
  showGrid: boolean;
  collisionHighlights: boolean;
  onResetCamera?: () => void;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  selectedObjectId,
  onSelectObject,
  activeViewMode,
  wireframeMode,
  showGrid,
  collisionHighlights,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Mouse interaction state
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 9,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));

  // Initialize Three.js Scene, Camera, Lights, and Renderer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x0f141a);
    threeScene.fog = new THREE.FogExp2(0x0f141a, 0.04);
    sceneRef.current = threeScene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 5, 7);
    camera.lookAt(cameraTarget.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    threeScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    threeScene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0x7300e5, 0.35);
    softFillLight.position.set(-6, 4, -4);
    threeScene.add(softFillLight);

    // 5. Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0xff9900, 0x232b37);
    grid.position.y = 0.001;
    threeScene.add(grid);
    gridHelperRef.current = grid;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Window Resize listener
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera View Mode
  useEffect(() => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (activeViewMode === 'top') {
      cam.position.set(0, 11, 0.001);
      cameraSpherical.current = { radius: 11, theta: 0, phi: 0.001 };
    } else if (activeViewMode === 'front') {
      cam.position.set(0, 1.8, 8);
      cameraSpherical.current = { radius: 8, theta: 0, phi: Math.PI / 2 };
    } else {
      cam.position.set(6, 5, 7);
      cameraSpherical.current = { radius: 9, theta: Math.PI / 4, phi: Math.PI / 3 };
    }
    cam.lookAt(cameraTarget.current);
  }, [activeViewMode]);

  // Update Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Re-build Room and Object Meshes when Scene changes
  useEffect(() => {
    const threeScene = sceneRef.current;
    if (!threeScene || !scene) return;

    // Clear previous room & object meshes
    const objectsToRemove: THREE.Object3D[] = [];
    threeScene.children.forEach((child) => {
      if (child.name.startsWith('room-') || child.name.startsWith('obj-mesh-')) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => threeScene.remove(obj));
    objectMeshesRef.current.clear();

    const { width: roomW, length: roomL, height: roomH } = scene.room.dimensions;
    const wallColor = scene.room.wallColor || '#202632';
    const accentWallColor = scene.room.accentWallColor || '#1b222d';
    const floorColor = scene.room.floorColor || '#36302a';

    // 1. Room Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(floorColor),
      roughness: 0.6,
      metalness: 0.1,
      wireframe: wireframeMode,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    floorMesh.name = 'room-floor';
    threeScene.add(floorMesh);

    // 2. Room Back Wall
    const backWallGeo = new THREE.PlaneGeometry(roomW, roomH);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentWallColor),
      roughness: 0.85,
      metalness: 0.05,
      wireframe: wireframeMode,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, roomH / 2, -roomL / 2);
    backWall.receiveShadow = true;
    backWall.name = 'room-backwall';
    threeScene.add(backWall);

    // 3. Room Left Wall
    const leftWallGeo = new THREE.PlaneGeometry(roomL, roomH);
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallColor),
      roughness: 0.85,
      metalness: 0.05,
      wireframe: wireframeMode,
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-roomW / 2, roomH / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    leftWall.name = 'room-leftwall';
    threeScene.add(leftWall);

    // 4. Baseboard trim
    const trimGeo = new THREE.BoxGeometry(roomW, 0.1, 0.04);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x16191f });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 0.05, -roomL / 2 + 0.02);
    trimMesh.name = 'room-trim';
    threeScene.add(trimMesh);

    // 5. Build 3D Furniture Objects
    scene.objects.forEach((item) => {
      const group = createObjectMesh(item, wireframeMode, selectedObjectId === item.id);
      group.name = `obj-mesh-${item.id}`;
      group.userData = { id: item.id, name: item.name, type: item.type };
      threeScene.add(group);
      objectMeshesRef.current.set(item.id, group);
    });
  }, [scene, wireframeMode, selectedObjectId]);

  // Object creation helper
  function createObjectMesh(item: SceneObject, wireframe: boolean, isSelected: boolean): THREE.Group {
    const group = new THREE.Group();
    group.position.set(item.position.x, item.position.y, item.position.z);
    group.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);

    const baseColor = new THREE.Color(item.color || '#3d4452');
    const highlightColor = isSelected ? new THREE.Color(0xff9900) : baseColor;

    const mainMat = new THREE.MeshStandardMaterial({
      color: highlightColor,
      roughness: 0.5,
      metalness: 0.15,
      wireframe,
      emissive: isSelected ? new THREE.Color(0x331e00) : new THREE.Color(0x000000),
    });

    const { width: w, height: h, depth: d } = item.dimensions;

    if (item.type === 'sofa') {
      // Realistic cushioned sofa model
      const baseGeo = new THREE.BoxGeometry(w, h * 0.35, d);
      const baseMesh = new THREE.Mesh(baseGeo, mainMat);
      baseMesh.position.y = -h * 0.15;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Backrest
      const backGeo = new THREE.BoxGeometry(w, h * 0.65, d * 0.28);
      const backMesh = new THREE.Mesh(backGeo, mainMat);
      backMesh.position.set(0, h * 0.2, -d * 0.36);
      backMesh.castShadow = true;
      group.add(backMesh);

      // Armrests
      const armGeo = new THREE.BoxGeometry(w * 0.12, h * 0.5, d * 0.95);
      const leftArm = new THREE.Mesh(armGeo, mainMat);
      leftArm.position.set(-w * 0.44, h * 0.1, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, mainMat);
      rightArm.position.set(w * 0.44, h * 0.1, 0);
      rightArm.castShadow = true;
      group.add(rightArm);
    } else if (item.type === 'table') {
      // Table top + 4 legs
      const topGeo = new THREE.BoxGeometry(w, 0.05, d);
      const topMesh = new THREE.Mesh(topGeo, mainMat);
      topMesh.position.y = h / 2 - 0.025;
      topMesh.castShadow = true;
      group.add(topMesh);

      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, h - 0.05, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.4 });
      const legPositions = [
        [-w / 2 + 0.08, -d / 2 + 0.08],
        [w / 2 - 0.08, -d / 2 + 0.08],
        [-w / 2 + 0.08, d / 2 - 0.08],
        [w / 2 - 0.08, d / 2 - 0.08],
      ];
      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0, lz);
        leg.castShadow = true;
        group.add(leg);
      });
    } else if (item.type === 'lighting') {
      // Brass arc floor lamp
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, h, 16);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0;
      group.add(pole);

      const shadeGeo = new THREE.ConeGeometry(0.2, 0.25, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe6a3, emissiveIntensity: 0.8 });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(0, h / 2, 0);
      shade.rotation.x = Math.PI;
      group.add(shade);
    } else if (item.type === 'decor') {
      // Area Rug
      const rugGeo = new THREE.BoxGeometry(w, 0.015, d);
      const rugMesh = new THREE.Mesh(rugGeo, mainMat);
      rugMesh.position.y = 0;
      rugMesh.receiveShadow = true;
      group.add(rugMesh);
    } else {
      // Box volume representation with chamfered look
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mainMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    // Selection ring indicator
    if (isSelected) {
      const ringGeo = new THREE.RingGeometry(Math.max(w, d) * 0.55, Math.max(w, d) * 0.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff9900, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -h / 2 + 0.02;
      group.add(ring);
    }

    return group;
  }

  // Mouse Orbit / Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) {
      // Hover detection via raycasting
      checkRaycastHover(e);
      return;
    }

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    const sph = cameraSpherical.current;
    sph.theta -= deltaX * 0.007;
    sph.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sph.phi - deltaY * 0.007));

    updateCameraFromSpherical();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const sph = cameraSpherical.current;
    sph.radius = Math.max(3, Math.min(18, sph.radius + e.deltaY * 0.008));
    updateCameraFromSpherical();
  };

  const updateCameraFromSpherical = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTarget.current);
  };

  const checkRaycastHover = (e: React.MouseEvent) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes: THREE.Object3D[] = [];
    objectMeshesRef.current.forEach((group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) meshes.push(child);
      });
    });

    const intersects = raycaster.intersectObjects(meshes, true);
    if (intersects.length > 0) {
      let topParent: THREE.Object3D | null = intersects[0].object;
      while (topParent && !topParent.userData?.id && topParent.parent) {
        topParent = topParent.parent;
      }
      if (topParent?.userData?.id) {
        setHoveredObject(topParent.userData.name);
        return;
      }
    }
    setHoveredObject(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes: THREE.Object3D[] = [];
    objectMeshesRef.current.forEach((group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) meshes.push(child);
      });
    });

    const intersects = raycaster.intersectObjects(meshes, true);
    if (intersects.length > 0) {
      let topParent: THREE.Object3D | null = intersects[0].object;
      while (topParent && !topParent.userData?.id && topParent.parent) {
        topParent = topParent.parent;
      }
      if (topParent?.userData?.id) {
        onSelectObject(topParent.userData.id);
        return;
      }
    }
    // Deselect if clicking on empty space
    onSelectObject(null);
  };

  return (
    <div className="relative w-full h-full bg-[#0f141a] overflow-hidden select-none">
      {/* Three.js canvas container */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Viewport Status & Helpers */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
        <div className="bg-[#16191f]/90 border border-[#232b37] px-3 py-1.5 rounded-[4px] backdrop-blur-sm shadow-md flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
          <span className="text-[12px] font-mono text-white">
            {scene?.room.dimensions.width}m × {scene?.room.dimensions.length}m Reconstructed Space
          </span>
        </div>
        {hoveredObject && (
          <div className="bg-[#ff9900] text-[#16191f] px-2.5 py-1 rounded-[4px] text-[11px] font-bold shadow-md">
            Click to select: {hoveredObject}
          </div>
        )}
      </div>

      {/* Viewport Control Legend at Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-[#16191f]/80 backdrop-blur-sm border border-[#232b37] px-3 py-1.5 rounded-[4px] text-[11px] text-[#8c8c94] font-mono flex items-center gap-3">
        <span>🖱️ Drag: Orbit</span>
        <span>• Scroll: Zoom</span>
        <span>• Click: Select Object</span>
      </div>
    </div>
  );
};
