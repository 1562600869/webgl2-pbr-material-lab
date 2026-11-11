export function mat4Identity() {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}
export function mat4Multiply(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c*4+r] = a[r]*b[c*4] + a[4+r]*b[c*4+1] + a[8+r]*b[c*4+2] + a[12+r]*b[c*4+3];
    }
  }
  return o;
}
export function mat4Perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy/2);
  const nf = 1 / (near - far);
  const o = new Float32Array(16);
  o[0]=f/aspect; o[5]=f; o[10]=(far+near)*nf; o[11]=-1; o[14]=2*far*near*nf;
  return o;
}
export function mat4LookAt(eye, center, up) {
  let zx=eye[0]-center[0], zy=eye[1]-center[1], zz=eye[2]-center[2];
  let len=Math.hypot(zx,zy,zz)||1; zx/=len; zy/=len; zz/=len;
  let xx=up[1]*zz-up[2]*zy, xy=up[2]*zx-up[0]*zz, xz=up[0]*zy-up[1]*zx;
  len=Math.hypot(xx,xy,xz)||1; xx/=len; xy/=len; xz/=len;
  const yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx;
  const o = mat4Identity();
  o[0]=xx; o[1]=yx; o[2]=zx;
  o[4]=xy; o[5]=yy; o[6]=zy;
  o[8]=xz; o[9]=yz; o[10]=zz;
  o[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);
  o[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);
  o[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);
  return o;
}
export function mat4InvertTranspose3(m) {
  // normal matrix from model mat4 (upper 3x3 inverse-transpose approximation via adjugate)
  const a00=m[0],a01=m[1],a02=m[2], a10=m[4],a11=m[5],a12=m[6], a20=m[8],a21=m[9],a22=m[10];
  const b01=a22*a11-a12*a21, b11=-a22*a10+a12*a20, b21=a21*a10-a11*a20;
  let det=a00*b01+a01*b11+a02*b21 || 1;
  return new Float32Array([
    b01/det, (-a22*a01+a02*a21)/det, (a12*a01-a02*a11)/det,
    b11/det, (a22*a00-a02*a20)/det, (-a12*a00+a02*a10)/det,
    b21/det, (-a21*a00+a01*a20)/det, (a11*a00-a01*a10)/det,
  ]);
}
