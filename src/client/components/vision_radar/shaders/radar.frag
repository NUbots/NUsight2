precision highp float;
precision highp int;

varying vec3 fragColour;

void main() {
  gl_FragColor = vec4(fragColour, 1);
}
