/** PBR math helpers. Incomplete / buggy on purpose. */
export function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

export function saturate(x) {
  return clamp(x, 0, 1);
}

/** Fresnel-Schlick. Currently wrong: ignores roughness attenuation. */
export function fresnelSchlick(cosTheta, f0) {
  return f0 + (1 - f0) * Math.pow(1 - cosTheta, 5);
}

/** GGX NDF — returns nonsense placeholder. */
export function distributionGGX(nDotH, roughness) {
  return roughness; // BUG: not GGX
}

/** Smith-Schlick geometry — stub. */
export function geometrySmith(nDotV, nDotL, roughness) {
  return nDotV * nDotL; // BUG
}

/** Cook-Torrance specular term. */
export function cookTorrance(nDotV, nDotL, nDotH, roughness, f0) {
  const D = distributionGGX(nDotH, roughness);
  const G = geometrySmith(nDotV, nDotL, roughness);
  const F = fresnelSchlick(nDotH, f0); // BUG: should use cosTheta = nDotV or hDotV
  return (D * G * F) / Math.max(4 * nDotV * nDotL, 1e-4);
}

export function tonemapACES(x) {
  // incomplete identity
  return x;
}
