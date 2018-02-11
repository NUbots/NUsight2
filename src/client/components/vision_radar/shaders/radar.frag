precision highp float;
precision highp int;

varying vec3 fragColour;
varying vec2 vUv;

void main() {
  gl_FragColor = vec4(fragColour, 1);
  gl_FragColor = vec4(vUv, 0, 1.0);
}
