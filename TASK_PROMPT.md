请在本仓库实现一个可在浏览器中打开的 WebGL2 PBR 材质实验室（禁止 Docker），并让 `npm test` 全部通过。

硬性需求：
1) 打开根目录 `index.html`（可用 `npm start` / `python3 -m http.server`）后，页面左侧是 WebGL2 画布，右侧是可调参数面板；`#status` 在成功初始化后显示 `ready`。
2) 画布中渲染一颗可实时旋转/观察的 UV 球体（允许自动旋转或拖拽轨道相机，至少一种），使用 `src/shaders/pbr.vert.glsl` 与 `src/shaders/pbr.frag.glsl` 中的完整 Cook-Torrance PBR（GGX NDF + Smith geometry + Fresnel-Schlick），支持 albedo / metallic / roughness / directional light / exposure。
3) 片元着色器输出必须做 ACES 风格的电影级 tone mapping（或等价实现），禁止只输出线性 albedo*ndotl 的假实现。
4) 补全并修正 `src/math/pbr.js` 中的 JS 参考实现，使 `npm test`（node:test）全部通过；这些函数应与 shader 使用同一套公式口径。
5) 实现 `Renderer.init/render` 与 `bindControls`：拖动右侧滑条必须即时反映到球体材质；提供 `Capture PNG` 按钮，点击后下载当前画布截图。
6) 右下角或 `#stats` 显示当前 metallic、roughness、exposure 数值；WebGL 上下文丢失或 shader 编译失败时，`#status` 必须展示可读错误，而不是空白页。
7) 不要引入 Docker；不要改弱 `tests/pbr.test.js`；尽量保持零构建可运行（原生 ES modules + WebGL2）。

现有文件多为半成品/有意缺陷，请修复并补全。完成后请自行 `npm test`，并确保浏览器页面可交互运行。
