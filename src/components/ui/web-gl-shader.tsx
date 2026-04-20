"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type WebGLShaderProps = {
  className?: string;
};

export function WebGLShader({ className = "absolute inset-0 block h-full w-full" }: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.OrthographicCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh<THREE.BufferGeometry, THREE.RawShaderMaterial> | null;
    uniforms: Record<string, THREE.IUniform> | null;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null
  });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const { current: refs } = sceneRef;

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    const getSize = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect();
      return {
        width: Math.max(1, Math.floor(bounds?.width || window.innerWidth)),
        height: Math.max(1, Math.floor(bounds?.height || window.innerHeight))
      };
    };

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) {
        return;
      }

      const { width, height } = getSize();
      refs.renderer.setSize(width, height, false);
      refs.uniforms.resolution.value.set(width, height);
    };

    const initScene = () => {
      refs.scene = new THREE.Scene();
      refs.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.setClearColor(new THREE.Color(0x000000), 0);

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

      refs.uniforms = {
        resolution: { value: new THREE.Vector2(1, 1) },
        time: { value: 0.0 },
        xScale: { value: 1.35 },
        yScale: { value: 0.44 },
        distortion: { value: 0.075 }
      };

      const position = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0
      ];

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", positions);

      const material = new THREE.RawShaderMaterial({
        fragmentShader,
        side: THREE.DoubleSide,
        uniforms: refs.uniforms,
        vertexShader
      });

      refs.mesh = new THREE.Mesh(geometry, material);
      refs.scene.add(refs.mesh);

      handleResize();
    };

    const animate = () => {
      if (refs.uniforms) {
        refs.uniforms.time.value += 0.01;
      }

      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera);
      }

      refs.animationId = requestAnimationFrame(animate);
    };

    initScene();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

      window.removeEventListener("resize", handleResize);

      if (refs.mesh) {
        refs.scene?.remove(refs.mesh);
        refs.mesh.geometry.dispose();
        refs.mesh.material.dispose();
      }

      refs.renderer?.dispose();
    };
  }, []);

  return <canvas className={className} ref={canvasRef} />;
}
