import { fetchText, linkProgram } from './glutil.js';
import { createSphere } from './mesh.js';
import {
  mat4Identity,
  mat4InvertTranspose3,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
} from './math/mat4.js';

export class Renderer {
  constructor(canvas, onError = () => {}) {
    this.canvas = canvas;
    this.onError = onError;
    this.gl = canvas.getContext('webgl2', {
      antialias: true,
      preserveDrawingBuffer: true,
    });
    if (!this.gl) {
      throw new Error('WebGL2 required');
    }

    this.program = null;
    this.mesh = null;
    this.uniforms = {};
    this.ready = false;
    this.lastTime = null;
    this.dragging = false;
    this.lastPointer = null;
    this.cameraAzimuth = 0.35;
    this.cameraElevation = 0.22;
    this.cameraRadius = 3.2;
    this.params = {
      albedo: [0.9, 0.3, 0.15],
      metallic: 0.0,
      roughness: 0.45,
      exposure: 1.0,
      lightDir: [-0.45, 0.65, 0.6],
      lightColor: [3.0, 2.8, 2.5],
    };

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.ready = false;
      this.onError('error: WebGL context lost');
    });
  }

  async init() {
    const gl = this.gl;
    const [vertexSource, fragmentSource] = await Promise.all([
      fetchText(new URL('./shaders/pbr.vert.glsl', import.meta.url)),
      fetchText(new URL('./shaders/pbr.frag.glsl', import.meta.url)),
    ]);

    this.program = linkProgram(gl, vertexSource, fragmentSource);
    this.mesh = createSphere(gl, 64);
    this.uniforms = {
      mvp: gl.getUniformLocation(this.program, 'uMVP'),
      model: gl.getUniformLocation(this.program, 'uModel'),
      normalMat: gl.getUniformLocation(this.program, 'uNormalMat'),
      cameraPos: gl.getUniformLocation(this.program, 'uCameraPos'),
      lightDir: gl.getUniformLocation(this.program, 'uLightDir'),
      lightColor: gl.getUniformLocation(this.program, 'uLightColor'),
      albedo: gl.getUniformLocation(this.program, 'uAlbedo'),
      metallic: gl.getUniformLocation(this.program, 'uMetallic'),
      roughness: gl.getUniformLocation(this.program, 'uRoughness'),
      exposure: gl.getUniformLocation(this.program, 'uExposure'),
    };

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.02, 0.03, 0.05, 1.0);
    this.bindOrbitCamera();
    this.ready = true;
  }

  bindOrbitCamera() {
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging || !this.lastPointer) return;
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.cameraAzimuth -= dx * 0.008;
      this.cameraElevation = Math.max(
        -1.45,
        Math.min(1.45, this.cameraElevation + dy * 0.008),
      );
      this.lastPointer = { x: event.clientX, y: event.clientY };
    });
    const endDrag = (event) => {
      this.dragging = false;
      this.lastPointer = null;
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);
  }

  resize() {
    if (!this.gl) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  render(t) {
    if (!this.ready) return;
    const gl = this.gl;
    const previousTime = this.lastTime ?? t;
    const deltaTime = Math.min(0.1, Math.max(0, t - previousTime));
    this.lastTime = t;
    if (!this.dragging) {
      this.cameraAzimuth += deltaTime * 0.22;
    }

    const aspect = this.canvas.width / this.canvas.height;
    const projection = mat4Perspective(Math.PI / 4, aspect, 0.1, 100);
    const horizontalRadius = this.cameraRadius * Math.cos(this.cameraElevation);
    const eye = [
      horizontalRadius * Math.sin(this.cameraAzimuth),
      this.cameraRadius * Math.sin(this.cameraElevation),
      horizontalRadius * Math.cos(this.cameraAzimuth),
    ];
    const view = mat4LookAt(eye, [0, 0, 0], [0, 1, 0]);
    const model = mat4Identity();
    const viewModel = mat4Multiply(view, model);
    const mvp = mat4Multiply(projection, viewModel);
    const normalMat = mat4InvertTranspose3(model);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.mesh.vao);

    gl.uniformMatrix4fv(this.uniforms.mvp, false, mvp);
    gl.uniformMatrix4fv(this.uniforms.model, false, model);
    gl.uniformMatrix3fv(this.uniforms.normalMat, false, normalMat);
    gl.uniform3fv(this.uniforms.cameraPos, eye);
    gl.uniform3fv(this.uniforms.lightDir, this.params.lightDir);
    gl.uniform3fv(this.uniforms.lightColor, this.params.lightColor);
    gl.uniform3fv(this.uniforms.albedo, this.params.albedo);
    gl.uniform1f(this.uniforms.metallic, this.params.metallic);
    gl.uniform1f(this.uniforms.roughness, this.params.roughness);
    gl.uniform1f(this.uniforms.exposure, this.params.exposure);

    gl.drawElements(gl.TRIANGLES, this.mesh.count, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);

    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      throw new Error(`WebGL draw error: 0x${error.toString(16)}`);
    }
  }

  capturePNG() {
    if (!this.ready) {
      throw new Error('Renderer is not ready');
    }
    this.render(performance.now() / 1000);
    return this.canvas.toDataURL('image/png');
  }
}
