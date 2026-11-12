const PI = Math.PI;

export function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

export function saturate(x) {
  return clamp(x, 0, 1);
}

/** Fresnel-Schlick reflectance. */
export function fresnelSchlick(cosTheta, f0) {
  const c = saturate(cosTheta);
  return f0 + (1 - f0) * Math.pow(1 - c, 5);
}

/** GGX/Trowbridge-Reitz normal distribution function. */
export function distributionGGX(nDotH, roughness) {
  const a = Math.max(roughness, 1e-4);
  const a2 = a * a;
  const cos2 = saturate(nDotH) * saturate(nDotH);
  const denom = cos2 * (a2 - 1) + 1;
  return a2 / Math.max(PI * denom * denom, 1e-7);
}

/** Smith geometry term using Schlick-GGX for direct lighting. */
export function geometrySmith(nDotV, nDotL, roughness) {
  const r = Math.max(roughness, 1e-4);
  const k = (r + 1) * (r + 1) / 8;
  const geometry = (nDotX) => {
    const cos = Math.max(nDotX, 0);
    return cos / Math.max(cos * (1 - k) + k, 1e-7);
  };
  return geometry(nDotV) * geometry(nDotL);
}

/** Cook-Torrance microfacet specular BRDF. */
export function cookTorrance(nDotV, nDotL, nDotH, roughness, f0) {
  const D = distributionGGX(nDotH, roughness);
  const G = geometrySmith(nDotV, nDotL, roughness);

  // Recover H.V from the supplied cosines: H bisects L and V, so the angle
  // between H and V is half of the angle between L and V.
  const vDotL = Math.max(
    nDotV * nDotL + Math.sqrt(Math.max(1 - nDotV * nDotV, 0) * Math.max(1 - nDotL * nDotL, 0)),
    0,
  );
  const hDotV = Math.sqrt(Math.max((1 + vDotL) / 2, 0));
  const F = fresnelSchlick(hDotV, f0);
  return (D * G * F) / Math.max(4 * Math.max(nDotV, 0) * Math.max(nDotL, 0), 1e-4);
}

/** ACES filmic tonemap (Stephen Hill / Krzysztof Narkowicz approximation). */
export function tonemapACES(x) {
  const v = Math.max(x, 0);
  return saturate((v * (2.51 * v + 0.03)) / (v * (2.43 * v + 0.59) + 0.14));
}
