function updateStats(root, params) {
  const stats = root.querySelector('#stats');
  if (!stats) return;
  stats.textContent = [
    `metallic: ${params.metallic.toFixed(2)}`,
    `roughness: ${params.roughness.toFixed(2)}`,
    `exposure: ${params.exposure.toFixed(2)}`,
  ].join('\n');
}

function downloadPNG(dataUrl) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `pbr-material-${Date.now()}.png`;
  document.body.append(link);
  link.click();
  link.remove();
}

export function bindControls(root, params, onChange) {
  const notify = (...args) => {
    if (typeof onChange === 'function') onChange(...args);
  };
  const inputs = new Map(
    Array.from(root.querySelectorAll('input[type="range"][data-key]')).map((input) => [
      input.dataset.key,
      input,
    ]),
  );

  const albedoInputs = [
    inputs.get('albedo0'),
    inputs.get('albedo1'),
    inputs.get('albedo2'),
  ].filter(Boolean);
  albedoInputs.forEach((input, index) => {
    input.value = String(params.albedo[index]);
  });

  const scalarKeys = ['metallic', 'roughness', 'exposure'];
  scalarKeys.forEach((key) => {
    const input = inputs.get(key);
    if (input) input.value = String(params[key]);
  });

  root.addEventListener('input', (event) => {
    const input = event.target.closest?.('input[type="range"][data-key]');
    if (!input || !root.contains(input)) return;

    const key = input.dataset.key;
    const value = Number(input.value);
    if (key.startsWith('albedo')) {
      const channel = Number(key.slice(-1));
      params.albedo[channel] = value;
    } else if (scalarKeys.includes(key)) {
      params[key] = value;
    }

    updateStats(root, params);
    notify(params);
  });

  const captureButton = root.querySelector('#btn-capture');
  captureButton?.addEventListener('click', () => {
    const capture = typeof onChange === 'function'
      ? null
      : onChange?.capturePNG;
    const reportError = typeof onChange === 'function'
      ? null
      : onChange?.onError;
    try {
      if (typeof capture !== 'function') {
        throw new Error('Capture PNG is unavailable');
      }
      downloadPNG(capture.call(onChange));
    } catch (error) {
      reportError?.(`error: ${error.message}`);
    }
  });

  updateStats(root, params);
}
