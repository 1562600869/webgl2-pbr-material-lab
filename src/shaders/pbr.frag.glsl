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

const float PI = 3.14159265358979323846;

float distributionGGX(float nDotH, float roughness) {
  float a = max(roughness, 1e-4);
  float a2 = a * a;
  float cos2 = clamp(nDotH, 0.0, 1.0) * clamp(nDotH, 0.0, 1.0);
  float denom = cos2 * (a2 - 1.0) + 1.0;
  return a2 / max(PI * denom * denom, 1e-7);
}

float geometrySchlickGGX(float nDotX, float roughness) {
  float r = max(roughness, 1e-4);
  float k = (r + 1.0) * (r + 1.0) / 8.0;
  float cos = max(nDotX, 0.0);
  return cos / max(cos * (1.0 - k) + k, 1e-7);
}

float geometrySmith(float nDotV, float nDotL, float roughness) {
  return geometrySchlickGGX(nDotV, roughness) * geometrySchlickGGX(nDotL, roughness);
}

vec3 fresnelSchlick(float cosTheta, vec3 f0) {
  float c = clamp(cosTheta, 0.0, 1.0);
  return f0 + (1.0 - f0) * pow(1.0 - c, 5.0);
}

vec3 tonemapACES(vec3 x) {
  vec3 v = max(x, vec3(0.0));
  return clamp((v * (2.51 * v + 0.03)) / (v * (2.43 * v + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(uCameraPos - vWorldPos);
  vec3 l = normalize(uLightDir);
  vec3 h = normalize(v + l);

  float nDotV = max(dot(n, v), 0.0);
  float nDotL = max(dot(n, l), 0.0);
  float nDotH = max(dot(n, h), 0.0);
  float hDotV = max(dot(h, v), 0.0);

  vec3 f0 = mix(vec3(0.04), uAlbedo, uMetallic);
  float d = distributionGGX(nDotH, uRoughness);
  float g = geometrySmith(nDotV, nDotL, uRoughness);
  vec3 f = fresnelSchlick(hDotV, f0);

  vec3 specular = (d * g * f) / max(4.0 * nDotV * nDotL, 1e-4);
  vec3 kD = (1.0 - f) * (1.0 - uMetallic);
  vec3 radiance = uLightColor * nDotL;
  vec3 directLight = (kD * uAlbedo / PI + specular) * radiance;

  vec3 ambient = uAlbedo * (0.03 * (1.0 - uMetallic) + 0.005);
  vec3 color = uExposure * (ambient + directLight);
  color = tonemapACES(color);
  color = pow(color, vec3(1.0 / 2.2));

  fragColor = vec4(color, 1.0);
}
