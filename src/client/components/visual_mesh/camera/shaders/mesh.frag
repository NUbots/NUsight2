precision lowp float;
precision lowp int;

uniform sampler2D image;

varying float vBall;
varying float vGoal;
varying float vFieldLine;
varying float vField;
varying float vEnvironment;

varying vec2 vUv;

void main() {
  vec4 imgColour = texture2D(image, vUv);

  // clang-format off
  vec3 classColour = vec3(1.0, 0.0, 0.0) * vBall
                   + vec3(1.0, 1.0, 0.0) * vGoal
                   + vec3(0.0, 0.0, 1.0) * vFieldLine
                   + vec3(0.0, 1.0, 0.0) * vField
                   + vec3(0.0, 0.0, 0.0) * vEnvironment;
  // clang-format on

  gl_FragColor = vec4(imgColour.xyz * 0.5 + classColour * 0.5, 1);
}
