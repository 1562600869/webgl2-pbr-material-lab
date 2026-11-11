import { Renderer } from './renderer.js';
import { bindControls } from './ui/controls.js';

const canvas = document.getElementById('gl');
const status = document.getElementById('status');

async function boot() {
  const renderer = new Renderer(canvas);
  try {
    await renderer.init();
    bindControls(document.getElementById('controls'), renderer.params, () => {});
    status.textContent = 'ready';
  } catch (e) {
    status.textContent = 'error: ' + e.message;
    console.error(e);
  }

  const loop = (t) => {
    renderer.resize();
    renderer.render(t * 0.001);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

boot();
