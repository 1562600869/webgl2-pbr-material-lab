/** WebGL2 renderer stub. */
import { createSphere } from './mesh.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { antialias: true });
    if (!this.gl) throw new Error('WebGL2 required');
    this.program = null;
    this.mesh = null;
    this.params = {
      albedo: [0.9, 0.3, 0.15],
      metallic: 0.0,
      roughness: 0.45,
      exposure: 1.0,
      lightColor: [3.0, 2.8, 2.5],
    };
  }

  async init() {
    // TODO: compile shaders from src/shaders, link program, create mesh
    throw new Error('Renderer.init not implemented');
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  render(_t) {
    const gl = this.gl;
    gl.clearColor(0.05, 0.06, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // TODO: draw PBR sphere with orbit camera
  }
}
