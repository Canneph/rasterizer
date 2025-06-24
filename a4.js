import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////


// triangle mesh generation


TriangleMesh.prototype.createCube = function() {

  // vertex positions
  this.positions = [
    // front face
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1, -1,  1,
     1,  1,  1,
    -1,  1,  1,

    // back face
     1, -1, -1,
    -1, -1, -1,
    -1,  1, -1,
     1, -1, -1,
    -1,  1, -1,
     1,  1, -1,

    // left face
    -1, -1, -1,
    -1, -1,  1,
    -1,  1,  1,
    -1, -1, -1,
    -1,  1,  1,
    -1,  1, -1,

    // right face
     1, -1,  1,
     1, -1, -1,
     1,  1, -1,
     1, -1,  1,
     1,  1, -1,
     1,  1,  1,

    // top face
    -1,  1,  1,
     1,  1,  1,
     1,  1, -1,
    -1,  1,  1,
     1,  1, -1,
    -1,  1, -1,

    // bottom face
    -1, -1, -1,
     1, -1, -1,
     1, -1,  1,
    -1, -1, -1,
     1, -1,  1,
    -1, -1,  1
  ];

  // normals for each face
  this.normals = [
    // front face
    0,0,1, 0,0,1, 0,0,1,
    0,0,1, 0,0,1, 0,0,1,
    
    // back face
    0,0,-1, 0,0,-1, 0,0,-1,
    0,0,-1, 0,0,-1, 0,0,-1,
    
    // left face
    -1,0,0, -1,0,0, -1,0,0,
    -1,0,0, -1,0,0, -1,0,0,
    
    // right face
    1,0,0, 1,0,0, 1,0,0,
    1,0,0, 1,0,0, 1,0,0,
    
    // top face
    0,1,0, 0,1,0, 0,1,0,
    0,1,0, 0,1,0, 0,1,0,
    
    // bottom face
    0,-1,0, 0,-1,0, 0,-1,0,
    0,-1,0, 0,-1,0, 0,-1,0
  ];

  // UV coordinates for each face

  // front face
  const frontUV = [
    0.0, 2.0/3.0,
    0.5, 2.0/3.0,
    0.5, 1.0,
    0.0, 2.0/3.0,
    0.5, 1.0,
    0.0, 1.0,
  ];

  // back face
  const backUV = [
    0.5, 1.0/3.0,
    1.0, 1.0/3.0,
    1.0, 0.0,
    0.5, 1.0/3.0,
    1.0, 0.0,
    0.5, 0.0,
  ];

  // left face
  const leftUV = [
    0.5, 1.0/3.0,
    1.0, 1.0/3.0,
    1.0, 2.0/3.0,
    0.5, 1.0/3.0,
    1.0, 2.0/3.0,
    0.5, 2.0/3.0,
  ];

  // right face
  const rightUV = [
    0.0, 1.0/3.0,
    0.5, 1.0/3.0,
    0.5, 2.0/3.0,
    0.0, 1.0/3.0,
    0.5, 2.0/3.0,
    0.0, 2.0/3.0,
  ];

  // top face
  const topUV = [
    0.0, 0.0,
    0.5, 0.0,
    0.5, 1.0/3.0,
    0.0, 0.0,
    0.5, 1.0/3.0,
    0.0, 1.0/3.0,
  ];

  // bottom face
  const bottomUV = [
    0.5, 2.0/3.0,
    1.0, 2.0/3.0,
    1.0, 1.0,
    0.5, 2.0/3.0,
    1.0, 1.0,
    0.5, 1.0,
  ];

  this.uvCoords = frontUV.concat(backUV, leftUV, rightUV, topUV, bottomUV);
};



TriangleMesh.prototype.createSphere = function(numStacks, numSectors) {
  const PI = Math.PI;
  const positions = [];
  const normals = [];
  const uvCoords = [];
  const indices = [];

  for (let i = 0; i <= numStacks; ++i) {
    const stackAngle = PI / 2 - i * PI / numStacks;
    const xy = Math.cos(stackAngle);
    const z  = Math.sin(stackAngle);

    for (let j = 0; j <= numSectors; ++j) {
      const sectorAngle = -j * 2 * PI / numSectors;

      const x = xy * Math.cos(sectorAngle);
      const y = xy * Math.sin(sectorAngle);

      positions.push(x, y, z);
      normals.push(x, y, z);
      uvCoords.push(j / numSectors, i / numStacks);
    }
  }

  for (let i = 0; i < numStacks; ++i) {
    const k1 = i * (numSectors + 1);
    const k2 = k1 + numSectors + 1;
    for (let j = 0; j < numSectors; ++j) {
      if (i !== 0) {
        indices.push(k1 + j, k2 + j, k1 + j + 1);
      }
      if (i !== numStacks - 1) {
        indices.push(k1 + j + 1, k2 + j, k2 + j + 1);
      }
    }
  }

  this.positions = positions;
  this.normals   = normals;
  this.uvCoords  = uvCoords;
  this.indices   = indices;
};


// transformations


Scene.prototype.computeTransformation = function(transformSequence) {
  let m = Mat4.create();

  for (const t of transformSequence) {
    let tMat = Mat4.create();
    const op = t[0];

    if (op === 'T') {
      const x = +t[1], y = +t[2], z = +t[3];
      Mat4.set(
        tMat,
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
      );
    }
    else if (op === 'Rz') {
      const θ = +t[1] * Math.PI / 180, c = Math.cos(θ), s = Math.sin(θ);
      Mat4.set(
        tMat,
        c,  s, 0, 0,   
       -s,  c, 0, 0,  
        0,  0, 1, 0,  
        0,  0, 0, 1    
      );
    }
    else if (op === 'Ry') {
      const θ = +t[1] * Math.PI / 180, c = Math.cos(θ), s = Math.sin(θ);
      Mat4.set(
        tMat,
        c, 0, -s, 0,   
        0, 1,  0, 0, 
        s, 0,  c, 0,  
        0, 0,  0, 1   
      );
    }
    else if (op === 'Rx') {
      const θ = +t[1] * Math.PI / 180, c = Math.cos(θ), s = Math.sin(θ);
      Mat4.set(
        tMat,
        1, 0,  0, 0,  
        0, c,  s, 0,   
        0, -s, c, 0,  
        0, 0,  0, 1    
      );
    } 
    else if (op === 'S') {
      const x = +t[1], y = +t[2], z = +t[3];
      Mat4.set(
        tMat,
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
      );
    }
    else {
      continue;
    }

    Mat4.multiply(m, tMat, m);
  }

  return m;
};


// shading


Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vLightPosition;

void main() {
  vTexCoord = uvCoord;
  vNormal = normalize(normalMatrix * normal);
  vec4 posEye = viewMatrix * modelMatrix * vec4(position, 1.0);
  vPosition = posEye.xyz;
  vec4 lightEye = viewMatrix * vec4(lightPosition, 1.0);
  vLightPosition = lightEye.xyz;
  gl_Position = projectionMatrix * posEye;
}
`;


// texturing (and shading)


Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vLightPosition;

void main() {
  vec3 N = normalize(vNormal);
  vec3 Lvec = vLightPosition - vPosition;
  float d = length(Lvec);
  vec3 L = normalize(Lvec);
  vec3 V = normalize(-vPosition);
  vec3 H = normalize(L + V);
  float att = 1.0 / (d * d);
  vec3 ambient = ka * lightIntensity;
  vec3 diffuse = kd * lightIntensity * max(dot(N, L), 0.0) * att;
  vec3 specular = ks * lightIntensity * pow(max(dot(N, H), 0.0), shininess) * att;
  vec3 color = ambient + diffuse + specular;

  if (hasTexture) {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    color *= texColor.rgb;
    gl_FragColor = vec4(color, texColor.a);
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "c,myCamera,perspective,0,0,10,0,0,0,0,1,0;", 
  "l,myLight,point,0,2,5,2,2,2;",  
  "p,unitSphere,sphere,20,20;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,head,unitSphere,globeMat;",
  "o,earL,unitSphere,globeMat;",  
  "o,earR,unitSphere,globeMat;",  
  "X,head,S,2.5,2.5,2.5;X,head,Rx,90;X,head,Ry,-90;X,head,T,0,0,0;", 
  "X,earL,S,1,1,1;X,earL,T,-2.5,2.5,0;",
  "X,earR,S,1,1,1;X,earR,T,2.5,2.5,0;",
  "uniform lightIntensity vec3 = vec3(20*4.5, 20*4.5, 20*4.5);"
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };