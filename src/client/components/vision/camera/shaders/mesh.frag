precision lowp float;
precision lowp int;

uniform vec2 dimensions;

varying float vBall;
varying float vGoal;
varying float vFieldLine;
varying float vField;
varying float vEnvironment;

void main() {

  vec4 colour = vec4(0);

  // 90% rings
  colour += vec4(1.0, 0.0, 0.0, 1.0 - smoothstep(0.0, 0.01, abs(vBall - 0.90)));
  colour += vec4(1.0, 1.0, 0.0, 1.0 - smoothstep(0.0, 0.01, abs(vGoal - 0.90)));
  colour += vec4(1.0, 1.0, 1.0, 1.0 - smoothstep(0.0, 0.01, abs(vFieldLine, - 0.90)));
  colour += vec4(0.0, 1.0, 0.0, 1.0 - smoothstep(0.0, 0.01, abs(vField - 0.90)));
  colour += vec4(0.0, 0.0, 0.0, 1.0 - smoothstep(0.0, 0.01, abs(vEnvironment - 0.90)));

  // 75% rings
  colour += vec4(1.0, 0.0, 0.0, 0.66 * (1.0 - smoothstep(0.0, 0.01, abs(vBall - 0.75))));
  colour += vec4(1.0, 1.0, 0.0, 0.66 * (1.0 - smoothstep(0.0, 0.01, abs(vGoal - 0.75))));
  colour += vec4(1.0, 1.0, 1.0, 0.66 * (1.0 - smoothstep(0.0, 0.01, abs(vFieldLine, - 0.75))));
  colour += vec4(0.0, 1.0, 0.0, 0.66 * (1.0 - smoothstep(0.0, 0.01, abs(vField - 0.75))));
  colour += vec4(0.0, 0.0, 0.0, 0.66 * (1.0 - smoothstep(0.0, 0.01, abs(vEnvironment - 0.75))));

  // 50% rings
  colour += vec4(1.0, 0.0, 0.0, 0.33 * (1.0 - smoothstep(0.0, 0.01, abs(vBall - 0.50))));
  colour += vec4(1.0, 1.0, 0.0, 0.33 * (1.0 - smoothstep(0.0, 0.01, abs(vGoal - 0.50))));
  colour += vec4(1.0, 1.0, 1.0, 0.33 * (1.0 - smoothstep(0.0, 0.01, abs(vFieldLine, - 0.50))));
  colour += vec4(0.0, 1.0, 0.0, 0.33 * (1.0 - smoothstep(0.0, 0.01, abs(vField - 0.50))));
  colour += vec4(0.0, 0.0, 0.0, 0.33 * (1.0 - smoothstep(0.0, 0.01, abs(vEnvironment - 0.50))));

  gl_FragColor = colour;
}
