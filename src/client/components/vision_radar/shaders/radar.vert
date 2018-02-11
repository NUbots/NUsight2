precision highp float;
precision highp int;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec2 position;
attribute vec3 colour;
attribute vec2 uv;

varying vec3 fragColour;
varying vec2 vUv;

void main() {
	vUv = uv;
  fragColour = colour;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.0, 1.0);
}

