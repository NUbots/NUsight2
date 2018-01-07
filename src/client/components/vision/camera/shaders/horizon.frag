precision highp float;

uniform mat4 Hcw;
uniform vec2 imageSize;

varying vec2 vUv;

vec3 unprojectEquidistant(vec2 point, float focalLength);
vec2 projectEquidistant(vec3 ray, float focalLength);

float focusLength = 1.0 / 0.0026997136600899543;
float lineWidth = 4.0;

void main() {
  vec2 screenPoint = vec2(0.5 - vUv.x, vUv.y - 0.5) * imageSize;
  vec3 cam = unprojectEquidistant(screenPoint, focusLength);
  vec3 normal = Hcw[2].xyz;
//  vec3 normal = Hcw[1].xyz;
  float distance = dot(cam, normal);
  vec3 p = cam - normal * distance;
  vec2 nearestPixel = projectEquidistant(normalize(p), focusLength);
  float distance4Real = length(screenPoint - nearestPixel);
	float alpha = smoothstep(0.0, lineWidth * 0.5, -distance4Real + lineWidth * 0.5);
  gl_FragColor = vec4(0, 0, 1, alpha);
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
