请在本仓库实现一个可在浏览器打开的 WebGL2 PBR 材质实验室（禁止 Docker），并让 `npm test` 全部通过。

硬性需求：
1) 打开 `index.html`（`npm start` 或 `python3 -m http.server 8765 --directory .`）后，左侧 WebGL2 画布、右侧参数面板；成功时 `#status` 为 `ready`。
2) 画布渲染 UV 球体，使用 `src/shaders/pbr.vert.glsl` + `src/shaders/pbr.frag.glsl` 的完整 Cook-Torrance PBR（GGX + Smith + Fresnel-Schlick），支持 albedo/metallic/roughness/directional light/exposure；相机至少支持自动旋转或拖拽轨道其一。
3) 片元输出必须 ACES（或等价）tone mapping，禁止假实现。
4) 修正 `src/math/pbr.js`，使 `npm test` 全绿，并与 shader 公式一致。
5) 实现 `src/renderer.js` 的 init/render 与 `src/ui/controls.js` 的 bindControls；滑条即时生效；`Capture PNG` 可下载截图；`#stats` 显示 metallic/roughness/exposure；shader/上下文错误要写进 `#status`。
6) 可复用已有 `src/glutil.js`、`src/math/mat4.js`、`src/mesh.js`。不要 Docker，不要改弱 `tests/pbr.test.js`，保持原生 ESM。

重要：用多个短 shell 命令分别写入各个文件（每次只写一个文件），避免单次超长输出；写完立刻 `npm test`，失败再修，直到通过。
