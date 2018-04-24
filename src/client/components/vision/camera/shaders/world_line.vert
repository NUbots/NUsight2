precision lowp float;

attribute vec3 position;
attribute vec2 uv;

attribute vec3 axis;
attribute vec3 start;
attribute vec3 end;
attribute float lineWidth;
attribute vec4 colour;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;
varying vec3 vAxis;
varying vec3 vStart;
varying vec3 vEnd;
varying float vLineWidth;
varying vec4 vColour;

void main() {
  vUv = uv;
  vAxis = axis;
  vStart = start;
  vEnd = end;
  vLineWidth = lineWidth;
  vColour = colour;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
