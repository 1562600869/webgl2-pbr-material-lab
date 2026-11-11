#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNormal;
uniform vec3 uCameraPos;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAlbedo;
uniform float uMetallic;
uniform float uRoughness;
uniform float uExposure;
out vec4 fragColor;
void main(){
  // STUB: flat shading only — must be replaced with Cook-Torrance PBR + ACES tonemap
  vec3 n = normalize(vNormal);
  float ndl = max(dot(n, normalize(-uLightDir)), 0.0);
  vec3 color = uAlbedo * (0.15 + 0.85 * ndl);
  fragColor = vec4(color, 1.0);
}
