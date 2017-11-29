precision highp float;
precision highp int;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec2 position;
attribute vec3 colour;

varying vec3 fragColour;

void main() {
  fragColour = colour/255.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.0, 1.0);
}

