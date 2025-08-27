"use client"
import { cn } from "@/lib/utils"
import React, { useRef, useEffect } from "react"
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebGLRendererParameters,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  AmbientLight,
  DirectionalLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
  InstancedBufferAttribute,
  Fog,
  ShadowMaterial,
  PCFSoftShadowMap,
  PlaneGeometry,
  Mesh,
} from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

// --------------------------- Core Three wrapper ----------------------------
interface XConfig {
  canvas?: HTMLCanvasElement
  id?: string
  rendererOptions?: Partial<WebGLRendererParameters>
  size?: "parent" | { width: number; height: number }
}

interface SizeData {
  width: number
  height: number
  wWidth: number
  wHeight: number
  ratio: number
  pixelRatio: number
}

class X {
  #config: XConfig
  #postprocessing: any
  #resizeObserver?: ResizeObserver
  #intersectionObserver?: IntersectionObserver
  #resizeTimer?: number
  #animationFrameId: number = 0
  #clock: Clock = new Clock()
  #animationState = { elapsed: 0, delta: 0 }
  #isAnimating: boolean = false
  #isVisible: boolean = false

  canvas!: HTMLCanvasElement
  camera!: PerspectiveCamera
  cameraMinAspect?: number
  cameraMaxAspect?: number
  cameraFov!: number
  maxPixelRatio?: number
  minPixelRatio?: number
  scene!: Scene
  renderer!: WebGLRenderer
  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  }

  render: () => void = this.#render.bind(this)
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {}
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => {}
  onAfterResize: (size: SizeData) => void = () => {}
  isDisposed: boolean = false

  constructor(config: XConfig) {
    this.#config = { ...config }
    this.#initCamera()
    this.#initScene()
    this.#initRenderer()
    this.resize()
    this.#initObservers()
  }

  #initCamera() {
    this.camera = new PerspectiveCamera()
    this.cameraFov = this.camera.fov
  }
  #initScene() {
    this.scene = new Scene()
  }
  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas
    } else if (this.#config.id) {
      const elem = document.getElementById(this.#config.id)
      if (elem instanceof HTMLCanvasElement) {
        this.canvas = elem
      } else {
        console.error("Three: Missing canvas or id parameter")
      }
    } else {
      console.error("Three: Missing canvas or id parameter")
    }
    this.canvas!.style.display = "block"
    const rendererOptions: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.#config.rendererOptions ?? {}),
    }
    this.renderer = new WebGLRenderer(rendererOptions)
    this.renderer.outputColorSpace = SRGBColorSpace
  }
  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener("resize", this.#onResize.bind(this))
      if (this.#config.size === "parent" && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this))
        this.#resizeObserver.observe(this.canvas.parentNode as Element)
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    })
    this.#intersectionObserver.observe(this.canvas)
    document.addEventListener("visibilitychange", this.#onVisibilityChange.bind(this))
  }
  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer)
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100)
  }

  resize() {
    let w: number, h: number
    if (this.#config.size instanceof Object) {
      w = this.#config.size.width
      h = this.#config.size.height
    } else if (this.#config.size === "parent" && this.canvas.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth
      h = (this.canvas.parentNode as HTMLElement).offsetHeight
    } else {
      w = window.innerWidth
      h = window.innerHeight
    }
    this.size.width = w
    this.size.height = h
    this.size.ratio = w / h

    this.#updateCamera()
    this.#updateRenderer()
    this.onAfterResize(this.size)
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect)
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect)
      } else {
        this.camera.fov = this.cameraFov
      }
    }
    this.camera.updateProjectionMatrix()
    this.updateWorldSize()
  }

  #adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2))
    const newTan = tanFov / (this.camera.aspect / aspect)
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan))
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length()
      this.size.wWidth = this.size.wHeight * this.camera.aspect
    } else if ((this.camera as any).isOrthographicCamera) {
      const cam = this.camera as any
      this.size.wHeight = cam.top - cam.bottom
      this.size.wWidth = cam.right - cam.left
    }
  }

  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height)
    this.#postprocessing?.setSize(this.size.width, this.size.height)
    let pr = window.devicePixelRatio
    if (this.maxPixelRatio && pr > this.maxPixelRatio) {
      pr = this.maxPixelRatio
    } else if (this.minPixelRatio && pr < this.minPixelRatio) {
      pr = this.minPixelRatio
    }
    this.renderer.setPixelRatio(pr)
    this.size.pixelRatio = pr
  }

  get postprocessing() {
    return this.#postprocessing
  }
  set postprocessing(value: any) {
    this.#postprocessing = value
    this.render = value.render.bind(value)
  }

  #onIntersection(entries: IntersectionObserverEntry[]) {
    this.#isAnimating = entries[0].isIntersecting
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation()
  }
  #onVisibilityChange() {
    if (this.#isAnimating) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation()
    }
  }

  #startAnimation() {
    if (this.#isVisible) return
    const animateFrame = () => {
      this.#animationFrameId = requestAnimationFrame(animateFrame)
      this.#animationState.delta = this.#clock.getDelta()
      this.#animationState.elapsed += this.#animationState.delta
      this.onBeforeRender(this.#animationState)
      this.render()
      this.onAfterRender(this.#animationState)
    }
    this.#isVisible = true
    this.#clock.start()
    animateFrame()
  }
  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId)
      this.#isVisible = false
      this.#clock.stop()
    }
  }
  #render() {
    this.renderer.render(this.scene, this.camera)
  }

  clear() {
    this.scene.traverse((obj) => {
      if ((obj as any).isMesh && typeof (obj as any).material === "object" && (obj as any).material !== null) {
        Object.keys((obj as any).material).forEach((key) => {
          const matProp = (obj as any).material[key]
          if (matProp && typeof matProp === "object" && typeof matProp.dispose === "function") {
            matProp.dispose()
          }
        })
        ;(obj as any).material.dispose()
        ;(obj as any).geometry.dispose()
      }
    })
    this.scene.clear()
  }

  dispose() {
    this.#onResizeCleanup()
    this.#stopAnimation()
    this.clear()
    this.#postprocessing?.dispose()
    this.renderer.dispose()
    this.isDisposed = true
  }
  #onResizeCleanup() {
    window.removeEventListener("resize", this.#onResize.bind(this))
    this.#resizeObserver?.disconnect()
    this.#intersectionObserver?.disconnect()
    document.removeEventListener("visibilitychange", this.#onVisibilityChange.bind(this))
  }
}

// ---------------- Physics (non-uniform scale + spin + spherical collisions) --
interface WConfig {
  count: number
  maxX: number
  maxY: number
  maxZ: number
  maxSize: number
  minSize: number
  size0: number
  gravity: number
  friction: number
  wallBounce: number
  maxVelocity: number
  controlSphere0?: boolean
  followCursor?: boolean
}

class W {
  config: WConfig
  positionData: Float32Array
  velocityData: Float32Array
  sizeData: Float32Array // collision proxy radius
  scale3Visual: Float32Array // per-instance non-uniform (sx, sy, sz)
  rotationData: Float32Array
  rotationVel: Float32Array
  center: Vector3 = new Vector3()

  constructor(config: WConfig) {
    this.config = config
    this.positionData = new Float32Array(3 * config.count).fill(0)
    this.velocityData = new Float32Array(3 * config.count).fill(0)
    this.sizeData = new Float32Array(config.count).fill(1)
    this.scale3Visual = new Float32Array(3 * config.count).fill(1)
    this.rotationData = new Float32Array(3 * config.count).fill(0)
    this.rotationVel = new Float32Array(3 * config.count).fill(0)

    this.#initializePositions()
    this.setSizesAndShapes()
    this.#initRotations()
  }

  #initializePositions() {
    const { config, positionData } = this
    this.center.set(0, 0, 0).toArray(positionData, 0)
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i
      positionData[idx] = MathUtils.randFloatSpread(2 * config.maxX)
      positionData[idx + 1] = MathUtils.randFloatSpread(2 * config.maxY)
      positionData[idx + 2] = MathUtils.randFloatSpread(2 * config.maxZ)
    }
  }

  setSizesAndShapes() {
    const { config, sizeData, scale3Visual } = this
    const randomChipDims = () => {
      const sx = MathUtils.randFloat(0.7, 1.35)
      const sy = MathUtils.randFloat(0.45, 0.95)
      const sz = MathUtils.randFloat(0.7, 1.35)
      return [sx, sy, sz]
    }

    sizeData[0] = config.size0
    {
      const [sx, sy, sz] = randomChipDims()
      scale3Visual.set([sx * config.size0, sy * config.size0, sz * config.size0], 0)
    }

    for (let i = 1; i < config.count; i++) {
      const base = MathUtils.randFloat(config.minSize, config.maxSize)
      const [sx, sy, sz] = randomChipDims()
      scale3Visual.set([sx * base, sy * base, sz * base], 3 * i)

      // choose a collision radius roughly matching largest half-extent
      const maxExtent = Math.max(sx, sy, sz) * base
      sizeData[i] = 0.6 * maxExtent
    }
  }

  #initRotations() {
    for (let i = 0; i < this.rotationVel.length / 3; i++) {
      const b = 3 * i
      this.rotationVel[b] = MathUtils.randFloatSpread(1.0) * 0.8
      this.rotationVel[b + 1] = MathUtils.randFloatSpread(1.0) * 0.8
      this.rotationVel[b + 2] = MathUtils.randFloatSpread(1.0) * 0.8
    }
  }

  update(deltaInfo: { delta: number }) {
    const c = this.config
    let startIdx = 0
    if (c.controlSphere0) {
      startIdx = 1
      const firstVec = new Vector3().fromArray(this.positionData, 0)
      firstVec.lerp(this.center, 0.1).toArray(this.positionData, 0)
      new Vector3(0, 0, 0).toArray(this.velocityData, 0)
    }

    for (let idx = startIdx; idx < c.count; idx++) {
      const b = 3 * idx
      const pos = new Vector3().fromArray(this.positionData, b)
      const vel = new Vector3().fromArray(this.velocityData, b)

      vel.y -= deltaInfo.delta * c.gravity * this.sizeData[idx]
      vel.multiplyScalar(c.friction)
      vel.clampLength(0, c.maxVelocity)
      pos.add(vel)

      pos.toArray(this.positionData, b)
      vel.toArray(this.velocityData, b)

      // spin
      this.rotationData[b] += this.rotationVel[b] * deltaInfo.delta
      this.rotationData[b + 1] += this.rotationVel[b + 1] * deltaInfo.delta
      this.rotationData[b + 2] += this.rotationVel[b + 2] * deltaInfo.delta
    }

    // collisions + walls
    for (let idx = startIdx; idx < c.count; idx++) {
      const b = 3 * idx
      const pos = new Vector3().fromArray(this.positionData, b)
      const vel = new Vector3().fromArray(this.velocityData, b)
      const radius = this.sizeData[idx]

      for (let jdx = idx + 1; jdx < c.count; jdx++) {
        const ob = 3 * jdx
        const opos = new Vector3().fromArray(this.positionData, ob)
        const ovel = new Vector3().fromArray(this.velocityData, ob)
        const diff = new Vector3().copy(opos).sub(pos)
        const dist = diff.length()
        const sumR = radius + this.sizeData[jdx]
        if (dist < sumR) {
          const overlap = sumR - dist
          const corr = diff.normalize().multiplyScalar(0.5 * overlap)
          const vCorr = corr.clone().multiplyScalar(Math.max(vel.length(), 1))
          pos.sub(corr)
          vel.sub(vCorr)
          pos.toArray(this.positionData, b)
          vel.toArray(this.velocityData, b)

          opos.add(corr)
          ovel.add(corr.clone().multiplyScalar(Math.max(ovel.length(), 1)))
          opos.toArray(this.positionData, ob)
          ovel.toArray(this.velocityData, ob)
        }
      }

      if (c.controlSphere0) {
        const d0 = new Vector3().copy(new Vector3().fromArray(this.positionData, 0)).sub(pos)
        const d = d0.length()
        const sumR0 = radius + this.sizeData[0]
        if (d < sumR0) {
          const corr = d0.normalize().multiplyScalar(sumR0 - d)
          const vCorr = corr.clone().multiplyScalar(Math.max(vel.length(), 2))
          pos.sub(corr)
          vel.sub(vCorr)
        }
      }

      if (Math.abs(pos.x) + radius > c.maxX) {
        pos.x = Math.sign(pos.x) * (c.maxX - radius)
        vel.x = -vel.x * c.wallBounce
      }
      if (c.gravity === 0) {
        if (Math.abs(pos.y) + radius > c.maxY) {
          pos.y = Math.sign(pos.y) * (c.maxY - radius)
          vel.y = -vel.y * c.wallBounce
        }
      } else if (pos.y - radius < -c.maxY) {
        pos.y = -c.maxY + radius
        vel.y = -vel.y * c.wallBounce
      }
      const maxBoundary = Math.max(c.maxZ, c.maxSize)
      if (Math.abs(pos.z) + radius > maxBoundary) {
        pos.z = Math.sign(pos.z) * (c.maxZ - radius)
        vel.z = -vel.z * c.wallBounce
      }

      pos.toArray(this.positionData, b)
      vel.toArray(this.velocityData, b)
    }
  }
}

// -------------------------- Material with realism --------------------------
class Y extends MeshPhysicalMaterial {
  uniforms: { [key: string]: { value: any } } = {
    thicknessDistortion: { value: 0.035 },
    thicknessAmbient: { value: 0.02 },
    thicknessAttenuation: { value: 0.06 },
    thicknessPower: { value: 2.0 },
    thicknessScale: { value: 5.0 },
  }
  constructor(params: any) {
    super(params)
    this.defines = { USE_UV: "" }
    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms)

      // Add per-instance random seeds and helpers
      shader.vertexShader =
        `
        attribute vec3 aRand;
        varying vec3 vRand;
        varying vec3 vObjPos;
        varying vec3 vObjNormal;

        // value noise + fbm
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }
        float noise3(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f*f*(3.0-2.0*f);
          float n000 = hash(i + vec3(0.0,0.0,0.0));
          float n100 = hash(i + vec3(1.0,0.0,0.0));
          float n010 = hash(i + vec3(0.0,1.0,0.0));
          float n110 = hash(i + vec3(1.0,1.0,0.0));
          float n001 = hash(i + vec3(0.0,0.0,1.0));
          float n101 = hash(i + vec3(1.0,0.0,1.0));
          float n011 = hash(i + vec3(0.0,1.0,1.0));
          float n111 = hash(i + vec3(1.0,1.0,1.0));
          float n00 = mix(n000, n100, f.x);
          float n10 = mix(n010, n110, f.x);
          float n01 = mix(n001, n101, f.x);
          float n11 = mix(n011, n111, f.x);
          float n0 = mix(n00, n10, f.y);
          float n1 = mix(n01, n11, f.y);
          return mix(n0, n1, f.z);
        }
        float fbm(vec3 x) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise3(x);
            x *= 2.0;
            a *= 0.55;
          }
          return v;
        }
        ` + shader.vertexShader

      // Subtle displacement + normal perturbation and store varyings
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        `
        #include <beginnormal_vertex>
        vRand = aRand;
        vObjPos = position;
        vObjNormal = normal;

        // approximate gradient for normal perturbation (subtle fried bumps)
        float eps = 0.02;
        float nx1 = fbm((position + vec3(eps,0.0,0.0)) * 3.0 + aRand * 10.0);
        float nx2 = fbm((position - vec3(eps,0.0,0.0)) * 3.0 + aRand * 10.0);
        float ny1 = fbm((position + vec3(0.0,eps,0.0)) * 3.0 + aRand * 10.0);
        float ny2 = fbm((position - vec3(0.0,eps,0.0)) * 3.0 + aRand * 10.0);
        float nz1 = fbm((position + vec3(0.0,0.0,eps)) * 3.0 + aRand * 10.0);
        float nz2 = fbm((position - vec3(0.0,0.0,eps)) * 3.0 + aRand * 10.0);
        vec3 grad = vec3(nx1-nx2, ny1-ny2, nz1-nz2) / (2.0*eps);
        objectNormal = normalize(objectNormal + grad * 0.75);
        vObjNormal = objectNormal;
        `
      )

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        // Fried bumps: gentle normal displacement using perturbed normal
        float n = fbm(position * 3.0 + aRand * 10.0);
        float disp = (n - 0.5) * 0.08;
        transformed += normalize(objectNormal) * disp;
        `
      )

      shader.fragmentShader =
        `
        varying vec3 vRand;
        varying vec3 vObjPos;
        varying vec3 vObjNormal;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }
        float noise3(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f*f*(3.0-2.0*f);
          float n000 = hash(i + vec3(0.0,0.0,0.0));
          float n100 = hash(i + vec3(1.0,0.0,0.0));
          float n010 = hash(i + vec3(0.0,1.0,0.0));
          float n110 = hash(i + vec3(1.0,1.0,0.0));
          float n001 = hash(i + vec3(0.0,0.0,1.0));
          float n101 = hash(i + vec3(1.0,0.0,1.0));
          float n011 = hash(i + vec3(0.0,1.0,1.0));
          float n111 = hash(i + vec3(1.0,1.0,1.0));
          float n00 = mix(n000, n100, f.x);
          float n10 = mix(n010, n110, f.x);
          float n01 = mix(n001, n101, f.x);
          float n11 = mix(n011, n111, f.x);
          float n0 = mix(n00, n10, f.y);
          float n1 = mix(n01, n11, f.y);
          return mix(n0, n1, f.z);
        }
        float fbm(vec3 x) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise3(x);
            x *= 2.0;
            a *= 0.55;
          }
          return v;
        }

        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
        ` + shader.fragmentShader

      // Insert scattering hook
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }
        void main() {
        `
      )

      // Toasting, curvature AO, sugar specks, roughness modulation
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        `
        vec4 diffuseColor = vec4( diffuse, opacity );

        // micro crumb variation and browning
        float crumb = fbm(vObjPos * 8.0 + vRand * 5.0);
        float browning = fbm(vObjPos * 1.7 + vRand * 2.9);

        // curvature-like darkening near edges of unit cube
        float maxAbs = max(abs(vObjPos.x), max(abs(vObjPos.y), abs(vObjPos.z)));
        float edge = smoothstep(0.30, 0.50, maxAbs);

        // warm up base tones and apply toast on edges
        diffuseColor.rgb *= mix(0.92, 1.08, crumb);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.82, 0.35 * browning + 0.4 * edge);

        // sparse sugar specks
        float speck = step(0.988, noise3(vObjPos * 55.0 + vRand * 113.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.00, 0.98, 0.92), 0.28 * speck);
        `
      )

      // Per-fragment roughness variation
      shader.fragmentShader = shader.fragmentShader.replace(
        "float roughnessFactor = material.roughness;",
        `
        float baseRough = material.roughness;
        float roughJit = fbm(vObjPos * 5.0 + vRand * 3.0);
        float roughnessFactor = clamp(baseRough + 0.18 * roughJit - 0.1 * edge, 0.2, 1.0);
        `
      )

      // Add our scattering into lighting loop
      const lightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      )
      shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>", lightsChunk)

      if (this.onBeforeCompile2) this.onBeforeCompile2(shader)
    }
  }
  onBeforeCompile2?: (shader: any) => void
}

// -------------------------- Visual defaults (realism) -----------------------
const DEFAULTS = {
  count: 220,
  colors: [0xd9a169, 0xb5793f, 0x7c4c26],
  ambientColor: 0xffffff,
  ambientIntensity: 0.7,
  dirLightColor: 0xfff3dd,
  dirLightIntensity: 1.25,
  materialParams: {
    metalness: 0.02,
    roughness: 0.96,
    clearcoat: 0.0,
    clearcoatRoughness: 0.2,
    sheen: 0.12,
    sheenColor: new Color(0x6b3f1f),
  },

  minSize: 0.35,
  maxSize: 0.62,
  size0: 0.62,

  gravity: 0.8,
  friction: 0.997,
  wallBounce: 0.9,
  maxVelocity: 0.24,

  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
} as const

const DUMMY = new Object3D()

// ------------------------------ Pointer utils ------------------------------
const pointerPosition = new Vector2()
interface PointerData {
  position: Vector2
  nPosition: Vector2
  hover: boolean
  onEnter: (data: PointerData) => void
  onMove: (data: PointerData) => void
  onClick: (data: PointerData) => void
  onLeave: (data: PointerData) => void
  dispose?: () => void
}
const pointerMap = new Map<HTMLElement, PointerData>()
let globalPointerActive = false

function createPointerData(options: Partial<PointerData> & { domElement: HTMLElement }): PointerData {
  const defaultData: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    onEnter: () => {},
    onMove: () => {},
    onClick: () => {},
    onLeave: () => {},
    ...options,
  }
  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, defaultData)
    if (!globalPointerActive) {
      document.body.addEventListener("pointermove", onPointerMove as EventListener)
      document.body.addEventListener("pointerleave", onPointerLeave as EventListener)
      document.body.addEventListener("click", onPointerClick as EventListener)
      globalPointerActive = true
    }
  }
  defaultData.dispose = () => {
    pointerMap.delete(options.domElement)
    if (pointerMap.size === 0) {
      document.body.removeEventListener("pointermove", onPointerMove as EventListener)
      document.body.removeEventListener("pointerleave", onPointerLeave as EventListener)
      document.body.removeEventListener("click", onPointerClick as EventListener)
      globalPointerActive = false
    }
  }
  return defaultData
}
function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY)
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect()
    if (isInside(rect)) {
      updatePointerData(data, rect)
      if (!data.hover) {
        data.hover = true
        data.onEnter(data)
      }
      data.onMove(data)
    } else if (data.hover) {
      data.hover = false
      data.onLeave(data)
    }
  }
}
function onPointerClick(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY)
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect()
    updatePointerData(data, rect)
    if (isInside(rect)) data.onClick(data)
  }
}
function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false
      data.onLeave(data)
    }
  }
}
function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(pointerPosition.x - rect.left, pointerPosition.y - rect.top)
  data.nPosition.set((data.position.x / rect.width) * 2 - 1, (-data.position.y / rect.height) * 2 + 1)
}
function isInside(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  )
}

// -------------------------- Instanced chips + lighting ----------------------
class Z extends InstancedMesh {
  config: typeof DEFAULTS
  physics: W
  ambientLight: AmbientLight | undefined
  dirLight: DirectionalLight | undefined

  constructor(renderer: WebGLRenderer, params: Partial<typeof DEFAULTS> = {}) {
    const config = { ...DEFAULTS, ...params }

    const roomEnv = new RoomEnvironment()
    const pmrem = new PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(roomEnv).texture

    const geometry = new RoundedBoxGeometry(1, 1, 1, 3, 0.085)
    geometry.computeVertexNormals()

    // Per-instance random seeds
    const count = config.count
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const b = 3 * i
      seeds[b] = Math.random() * 100.0
      seeds[b + 1] = Math.random() * 100.0
      seeds[b + 2] = Math.random() * 100.0
    }
    geometry.setAttribute("aRand", new InstancedBufferAttribute(seeds, 3, false))

    const material = new Y({ envMap: envTexture, ...config.materialParams })

    super(geometry, material, count)
    this.config = config
    this.physics = new W(config)

    this.castShadow = true
    this.receiveShadow = false
    ;(material as any).shadowSide = 2

    this.#setupLights()
    this.setColors(config.colors)
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity)
    this.add(this.ambientLight)

    this.dirLight = new DirectionalLight(this.config.dirLightColor as any, this.config.dirLightIntensity)
    this.dirLight.position.set(6, 10, 6)
    this.dirLight.castShadow = true
    this.dirLight.shadow.mapSize.set(1024, 1024)
    this.dirLight.shadow.camera.near = 1
    this.dirLight.shadow.camera.far = 50
    this.dirLight.shadow.camera.left = -12
    this.dirLight.shadow.camera.right = 12
    this.dirLight.shadow.camera.top = 12
    this.dirLight.shadow.camera.bottom = -12
    this.add(this.dirLight)
  }

  setColors(colors: number[]) {
    if (!Array.isArray(colors) || colors.length <= 1) return
    const colorUtils = (function (colorsArr: number[]) {
      let baseColors: number[] = colorsArr
      let colorObjects: Color[] = []
      baseColors.forEach((col) => colorObjects.push(new Color(col)))
      return {
        getColorAt: (ratio: number, out: Color = new Color()) => {
          const clamped = Math.max(0, Math.min(1, ratio))
          const scaled = clamped * (baseColors.length - 1)
          const idx = Math.floor(scaled)
          const start = colorObjects[idx]
          if (idx >= baseColors.length - 1) return start.clone()
          const alpha = scaled - idx
          const end = colorObjects[idx + 1]
          out.r = start.r + alpha * (end.r - start.r)
          out.g = start.g + alpha * (end.g - start.g)
          out.b = start.b + alpha * (end.b - start.b)
          return out
        },
      }
    })(colors)

    for (let idx = 0; idx < this.count; idx++) {
      this.setColorAt(idx, colorUtils.getColorAt(idx / this.count))
      if (idx === 0) {
        this.dirLight!.color.copy(colorUtils.getColorAt(idx / this.count))
      }
    }
    this.instanceColor!.needsUpdate = true
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo)

    for (let idx = 0; idx < this.count; idx++) {
      const b = 3 * idx

      // position
      DUMMY.position.fromArray(this.physics.positionData, b)

      // non-uniform scale
      DUMMY.scale.set(
        this.physics.scale3Visual[b],
        this.physics.scale3Visual[b + 1],
        this.physics.scale3Visual[b + 2]
      )

      // rotation
      DUMMY.rotation.set(
        this.physics.rotationData[b],
        this.physics.rotationData[b + 1],
        this.physics.rotationData[b + 2]
      )

      DUMMY.updateMatrix()
      this.setMatrixAt(idx, DUMMY.matrix)
    }

    this.instanceMatrix.needsUpdate = true
  }
}

// --------------------------- Factory and React ------------------------------
interface CreateBallpitReturn {
  three: X
  spheres: Z
  ground: Mesh<PlaneGeometry, ShadowMaterial>
  setCount: (count: number) => void
  togglePause: () => void
  dispose: () => void
}

function createBallpit(canvas: HTMLCanvasElement, config: any = {}): CreateBallpitReturn {
  const threeInstance = new X({
    canvas,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  })

  // renderer settings
  threeInstance.renderer.toneMapping = ACESFilmicToneMapping
  threeInstance.renderer.toneMappingExposure = 1.05
  threeInstance.renderer.shadowMap.enabled = true
  threeInstance.renderer.shadowMap.type = PCFSoftShadowMap

  // camera
  threeInstance.camera.position.set(0, 2.5, 22)
  threeInstance.camera.lookAt(0, 0, 0)
  threeInstance.cameraMaxAspect = 1.5

  // fog for depth
  threeInstance.scene.fog = new Fog(0xf7efe6, 18, 38)

  threeInstance.resize()

  let spheres: Z
  let ground: Mesh<PlaneGeometry, ShadowMaterial>

  // Ground plane for soft contact shadows
  function createGround() {
    const geo = new PlaneGeometry(200, 200)
    const mat = new ShadowMaterial({ opacity: 0.25, color: new Color(0x000000) as any })
    const plane = new Mesh(geo, mat)
    plane.receiveShadow = true
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -5
    return plane
  }

  function initialize(cfg: any) {
    if (spheres) {
      threeInstance.clear()
      threeInstance.scene.remove(spheres)
      threeInstance.scene.remove(ground)
    }
    // Ground first so it's under the chips
    ground = createGround()
    threeInstance.scene.add(ground)

    spheres = new Z(threeInstance.renderer, cfg)
    spheres.castShadow = true
    threeInstance.scene.add(spheres)
  }

  initialize(config)

  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 0, 1), 0)
  const intersectionPoint = new Vector3()
  let isPaused = false

  const pointerData = createPointerData({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointerData.nPosition, threeInstance.camera)
      threeInstance.camera.getWorldDirection(plane.normal)
      raycaster.ray.intersectPlane(plane, intersectionPoint)
      spheres.physics.center.copy(intersectionPoint)
      spheres.config.controlSphere0 = true
    },
    onLeave() {
      spheres.config.controlSphere0 = false
    },
    onClick() {
      // Nudge velocities on click
      const v = spheres.physics.velocityData
      for (let i = 0; i < v.length; i += 3) {
        v[i] += MathUtils.randFloatSpread(0.15)
        v[i + 1] += MathUtils.randFloat(0.05, 0.2)
        v[i + 2] += MathUtils.randFloatSpread(0.15)
      }
    },
  })

  threeInstance.onBeforeRender = (deltaInfo) => {
    if (!isPaused) spheres.update(deltaInfo)
  }

  threeInstance.onAfterResize = (size) => {
    spheres.config.maxX = size.wWidth / 2
    spheres.config.maxY = size.wHeight / 2
    // sit ground at bottom
    if (ground) {
      ground.position.y = -spheres.config.maxY + 0.2
      const w = Math.max(50, size.wWidth * 2)
      const h = Math.max(50, size.wWidth * 2)
      ground.scale.set(w / 200, h / 200, 1)
    }
  }

  return {
    three: threeInstance,
    get spheres() {
      return spheres
    },
    get ground() {
      return ground
    },
    setCount(count: number) {
      initialize({ ...spheres.config, count })
    },
    togglePause() {
      isPaused = !isPaused
    },
    dispose() {
      pointerData.dispose?.()
      threeInstance.dispose()
    },
  }
}

interface BallpitProps {
  className?: string
  followCursor?: boolean
  count?: number
  gravity?: number
  friction?: number
  wallBounce?: number
  maxVelocity?: number
  colors?: number[]
}

const BallpitChips: React.FC<BallpitProps> = ({ className = "", followCursor = true, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<CreateBallpitReturn | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    instanceRef.current = createBallpit(canvas, {
      followCursor,
      ...props,
    })
    return () => {
      instanceRef.current?.dispose()
    }
    // Using useRef/useEffect here is an appropriate React escape hatch for Three.js [^1][^2]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas className={cn("h-full w-full", className)} ref={canvasRef} />
}

export default BallpitChips
