precision lowp float;

#define M_PI 3.1415926535897932384626433832795

uniform vec2 viewSize;
uniform float focalLength;

varying vec2 vUv;
varying vec3 vAxis;
varying vec3 vStart;
varying vec3 vEnd;
varying vec4 vColour;
varying float vLineWidth;

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

/**
 * Rotate v about e by theta
 */
vec3 rotateByAxisAngle(vec3 v, vec3 e, float theta) {
  return cos(theta) * v + sin(theta) * cross(e, v) + (1.0 - cos(theta)) * (dot(e, v)) * e;
}

float angleAround(vec3 axis, vec3 start, vec3 vec) {

  // Put start and vec in the plane of axis
  vec3 aStart = normalize(cross(axis, start));
  vec3 aVec = normalize(cross(axis, vec));

  float y = dot(aStart, aVec);
  float x = dot(axis, cross(aVec, aStart));

  // Cross and dot to get our y and x and atan2 to get angle
  return atan(y, x) + M_PI;
}

void main() {

  // Get our position on the screen in pixel coordinates
  vec2 screenPoint = vec2(0.5 - vUv.x, vUv.y - 0.5) * viewSize;

  // Get the gradient of the curve we are drawing
  float gradient = dot(vAxis, vStart);

  // Project it into the world space
  vec3 cam = unprojectEquidistant(screenPoint, focalLength * viewSize.x);

  // Rotate the axis vector towards the screen point by the angle to gradient
  // This gives the closest point on the curve
  vec3 nearestPoint = rotateByAxisAngle(vAxis, normalize(cross(vAxis, cam)), acos(gradient));

  // Work out if we are in range
  float range = angleAround(vAxis, vStart, vEnd);
  float value = angleAround(vAxis, vStart, nearestPoint);

  // start == end means do the whole circle
  range = all(equal(vStart, vEnd)) ? 2.0 * M_PI : range;

  // If we are past the start or end, snap to start/end
  nearestPoint = value > range && value - range > (M_PI * 2.0 - range) * 0.5 ? vStart : nearestPoint;
  nearestPoint = value > range && value - range < (M_PI * 2.0 - range) * 0.5 ? vEnd : nearestPoint;

  // When we project this back onto the image we get the nearest pixel
  vec2 nearestPixel = projectEquidistant(nearestPoint, focalLength * viewSize.x);

  // We get the distance from us to the nearest pixel and smoothstep to make a line
  float pixelDistance = length(screenPoint - nearestPixel);
  float alpha = smoothstep(0.0, vLineWidth * 0.5, vLineWidth * 0.5 - pixelDistance);
  gl_FragColor = vec4(vColour.xyz, vColour.w * alpha);
}

