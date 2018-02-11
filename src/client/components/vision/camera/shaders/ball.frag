precision highp float;

uniform vec3 axis;
uniform float gradient;
uniform vec2 imageSize;

varying vec2 vUv;

vec3 unprojectEquidistant(vec2 point, float focalLength);
vec2 projectEquidistant(vec3 ray, float focalLength);
vec3 rotateByAxisAngle(vec3 v, vec3 e, float theta);

float focusLength = 1.0 / 0.0026997136600899543;
float lineWidth = 4.0;

void main() {
  vec2 screenPoint = vec2(0.5 - vUv.x, vUv.y - 0.5) * imageSize;
  vec3 cam = unprojectEquidistant(screenPoint, focusLength);
  vec3 p = rotateByAxisAngle(axis, normalize(cross(axis, cam)), acos(gradient));
  vec2 nearestPixel = projectEquidistant(p, focusLength);
  float distance4Real = length(screenPoint - nearestPixel);
	float alpha = smoothstep(0.0, lineWidth * 0.5, -distance4Real + lineWidth * 0.5);
  gl_FragColor = vec4(1, 0.5, 0, alpha);
}

vec3 rotateByAxisAngle(vec3 v, vec3 e, float theta) {
  return cos(theta) * v + sin(theta) * cross(e, v) + (1.0 - cos(theta)) * (dot(e, v)) * e;
}

vec3 unprojectEquidistant(vec2 point, float focalLength) {
  float r = length(point);
  vec3 s = vec3(
    cos(r / focalLength),
    sin(r / focalLength) * point.x / r,
    sin(r / focalLength) * point.y / r
  );
  return normalize(s);
}

vec2 projectEquidistant(vec3 ray, float focalLength) {
  float theta = acos(ray.x);
  float r = focalLength * theta;
  float sinTheta = sin(theta);
  return vec2(
		r * ray.y / sinTheta,
		r * ray.z / sinTheta
  );
}

