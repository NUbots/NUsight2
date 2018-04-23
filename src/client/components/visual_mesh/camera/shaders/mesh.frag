precision lowp float;
precision lowp int;

uniform sampler2D image;

//varying vec3 fragColour;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(image, vUv);
  //gl_FragColor = vec4(vUv, 0, 1.0);
}
