import { Renderer } from './renderer.js';
import { bindControls } from './ui/controls.js';

const canvas = document.getElementById('gl');
const status = document.getElementById('status');
const setStatus = (value) => {
  status.textContent = value;
};

async function boot() {
  let renderer;
  try {
    renderer = new Renderer(canvas, setStatus);
    await renderer.init();
    bindControls(document.getElementById('controls'), renderer.params, renderer);
    setStatus('ready');
  } catch (error) {
    setStatus(`error: ${error.message}`);
    console.error(error);
    return;
  }

  const loop = (timeMs) => {
    try {
      renderer.resize();
      renderer.render(timeMs * 0.001);
      if (status.textContent !== 'ready') {
        setStatus('ready');
      }
      requestAnimationFrame(loop);
    } catch (error) {
      setStatus(`error: ${error.message}`);
      console.error(error);
    }
  };
  requestAnimationFrame(loop);
}

boot();
