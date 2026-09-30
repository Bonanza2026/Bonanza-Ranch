import {
  Curve,
  Vector3,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  SRGBColorSpace,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Group,
} from "three";
import { Flow } from "three/addons/modifiers/CurveModifier.js";
import { gsap } from "gsap";

// Closing ring adapted from Sobha's carousel-webgl camera and curve geometry.
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
class GalleryCircle extends Curve<Vector3> {
  getPoint(t: number, target = new Vector3()) {
    return target.set(
      Math.cos(t * Math.PI * 2) * 15,
      0,
      Math.sin(t * Math.PI * 2) * 15,
    );
  }
}
// The reference uses a cardinal spline sampled at 25 points per segment.
function cardinal(values: number[]) {
  const points: Array<{ x: number; y: number }> = [];
  const hermite = (a: number, b: number, c: number, d: number, t: number) => {
    const t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * b +
      (-2 * t3 + 3 * t2) * c +
      (t3 - 2 * t2 + t) * 0.5 * (c - a) +
      (t3 - t2) * 0.5 * (d - b)
    );
  };
  for (let i = 0; i < values.length - 1; i++)
    for (let j = 0; j < 25; j++) {
      const t = j / 25,
        previous = Math.max(0, i - 1),
        next = Math.min(values.length - 1, i + 2);
      points.push({
        x:
          Math.fround(hermite(previous, i, i + 1, next, t)) /
          (values.length - 1),
        y: Math.fround(
          hermite(values[previous], values[i], values[i + 1], values[next], t),
        ),
      });
    }
  points.push({ x: 1, y: values.at(-1)! });
  return (p: number) => {
    p = clamp(p);
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i],
        b = points[i + 1];
      if (p >= a.x && p <= b.x) return mix(a.y, b.y, (p - a.x) / (b.x - a.x));
    }
    return values.at(-1)!;
  };
}
function stage(element: HTMLElement) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(element.clientWidth, element.clientHeight);
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  element.append(renderer.domElement);
  element.classList.add("webgl-ready");
  const textures: any[] = [];
  const flows: Flow[] = [];
  const loader = new TextureLoader();
  const curve = new GalleryCircle();
  function texture(url: string, color = true) {
    const tex = loader.load(url, () => {
      if (disposed) {
        tex.dispose();
        return;
      }
      const ratio = tex.image.width / tex.image.height,
        target = 720 / (480 * 0.85);
      if (ratio > target) {
        tex.repeat.x = target / ratio;
        tex.offset.x = (1 - tex.repeat.x) / 2;
      } else {
        tex.repeat.y = ratio / target;
        tex.offset.y =
          (1 - tex.repeat.y) * (url.includes("horse") ? 0.82 : 0.5);
      }
      tex.needsUpdate = true;
      renderer.initTexture(tex);
    });
    if (color) tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(tex);
    return tex;
  }
  function card(url: string, offset: number, transparent = false) {
    const geometry = new PlaneGeometry(5, (480 / 720) * 0.85 * 5, 10, 1);
    const material = new MeshBasicMaterial({
      map: texture(url),
      side: DoubleSide,
      transparent,
    });
    const flow = new Flow(new Mesh(geometry, material));
    material.dispose();
    flow.updateCurve(0, curve);
    flow.moveAlongCurve(offset);
    flow.object3D.frustumCulled = false;
    flows.push(flow);
    return flow;
  }
  let visible = false,
    disposed = false;
  let renderFrame: (dt: number) => void = () => {};
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { rootMargin: "200px" },
  );
  observer.observe(element);
  const resize = () => {
    const w = element.clientWidth,
      h = element.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(element);
  const tick = (_t: number, dt: number) => {
    if (!visible || document.hidden) return;
    renderFrame(Math.min(dt, 50));
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);
  return {
    scene,
    camera,
    card,
    texture,
    render: (fn: (dt: number) => void) => {
      renderFrame = fn;
      fn(16);
      // Compile/upload before the gallery is visible, avoiding a first-scroll GPU stall.
      void renderer.compileAsync(scene, camera).then(() => {
        if (!disposed) renderer.render(scene, camera);
      }).catch(() => {});
    },
    dispose: () => {
      disposed = true;
      gsap.ticker.remove(tick);
      observer.disconnect();
      resizeObserver.disconnect();
      textures.forEach((t) => t.dispose());
      flows.forEach((f) => f.splineTexture.dispose());
      scene.traverse((object: any) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      element.classList.remove("webgl-ready");
    },
  };
}
export function mountImageRing(root: HTMLElement) {
  const element = root.querySelector<HTMLElement>(".ring-webgl")!;
  const app = stage(element);
  if (!app) return () => {};
  const small = innerWidth < 768,
    rad = Math.PI / 180;
  const positions = small
    ? [
        [2.5, 0.6, -25],
        [2.5, 0.6, -25],
        [0, 0.6, -21],
        [0, -0.1, -20],
        [0, -0.1, -20],
      ]
    : [
        [2.5, 0.4, -25],
        [2.5, 2.4, -25],
        [0, 0.4, -21],
        [0, 0.25, -20],
        [0, 0.25, -20],
      ];
  const rotations = [
    [-148.52, 5.29, -29.75],
    [-148.52, 5.29, -29.75],
    [-180, 0, 13.75],
    [-180, 0, -8],
    [-180, 0, -8],
  ];
  const positionCurves = [0, 1, 2].map((axis) =>
    cardinal(positions.map((point) => point[axis])),
  );
  const rotationCurves = [0, 1, 2].map((axis) =>
    cardinal(rotations.map((point) => point[axis] * rad)),
  );
  const sources = Array.from(
    root.querySelectorAll<HTMLImageElement>(".ring-fallback img"),
  ).map((img) => img.getAttribute("src")!);
  const group = new Group();
  app.scene.add(group);
  const cards = Array.from({ length: 13 }, (_, i) =>
    app.card(sources[i % sources.length], i / 13, true),
  );
  cards.forEach((card) => group.add(card.object3D));
  let lastProgress = 0,
    mouseX = 0.5,
    mouseY = 0.5,
    smoothX = 0.5,
    smoothY = 0.5;
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      mouseX = event.clientX / innerWidth;
      mouseY = event.clientY / innerHeight;
    }
  };
  window.addEventListener("pointermove", pointer, { passive: true });
  const title = root.querySelector<HTMLElement>(".ring-title")!;
  app.render((dt) => {
    const h = element.clientHeight,
      w = element.clientWidth,
      rect = root.getBoundingClientRect(),
      v = -rect.top / h;
    const p = clamp((h - rect.top) / (rect.height + h)),
      lastX = smoothX,
      factor = 1 - Math.pow(0.99, dt / (1000 / 60));
    smoothX = mix(smoothX, mouseX, factor);
    smoothY = mix(smoothY, mouseY, factor);
    group.rotation.x = -0.05 * (smoothY - 0.5);
    const begin = clamp((v + 0.5) / 0.5),
      end = clamp((1.5 * h - rect.bottom) / (0.5 * h));
    app.camera.setViewOffset(
      w,
      h,
      0,
      (1 - begin * begin + end * end) * h * 0.25,
      w,
      h,
    );
    app.camera.position.set(
      positionCurves[0](p),
      positionCurves[1](p),
      positionCurves[2](p),
    );
    app.camera.rotation.set(
      rotationCurves[0](p),
      rotationCurves[1](p),
      rotationCurves[2](p),
    );
    cards.forEach((card) => {
      card.moveAlongCurve(
        dt * (smoothX - lastX) * 0.003 + 0.5 * (p - lastProgress),
      );
      const material = card.object3D.material as MeshBasicMaterial;
      material.opacity = mix(
        0.25,
        1,
        clamp((Math.abs(card.uniforms.pathOffset.value - 0.5) - 0.15) / 0.35),
      );
    });
    lastProgress = p;
    const enter = clamp((v - 0.35) / 0.4),
      exit = clamp((v - 1.3) / 0.4);
    title.style.opacity = String(
      (2 * enter - enter * enter) * (1 - exit * exit),
    );
    title.style.transform = `translateY(${20 * (1 - (2 * enter - enter * enter)) - 20 * exit * exit}svh)`;
  });
  return () => {
    window.removeEventListener("pointermove", pointer);
    app.dispose();
    title.removeAttribute("style");
  };
}
