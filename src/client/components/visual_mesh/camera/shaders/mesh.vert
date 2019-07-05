precision lowp float;
precision lowp int;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 dimensions;
uniform mat4 Hcw;
uniform float focalLength;
uniform vec2 centre;
uniform int projection;
uniform float k;
uniform float r;
uniform float h;

attribute vec3 position;
attribute float ball;
attribute float goal;
attribute float field;
attribute float fieldLine;
attribute float environment;

varying float vBall;
varying float vGoal;
varying float vFieldLine;
varying float vField;
varying float vEnvironment;
varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

#define RECTILINEAR_PROJECTION 1
#define EQUIDISTANT_PROJECTION 2
#define EQUISOLID_PROJECTION 3

// TODO(trent) these should be moved into a separate GLSL file once there is a decent #include system
vec2 projectEquidistant(vec3 ray, float f, vec2 c) {
  // Calculate some intermediates
  float theta     = acos(ray.x);
  float r         = f * theta;
  float rSinTheta = 1.0 / sqrt(1.0 - ray.x * ray.x);

  // Work out our pixel coordinates as a 0 centred image with x to the left and y up (screen space)
  vec2 screen = ray.x >= 1.0 ? vec2(0) : vec2(r * ray.y * rSinTheta, r * ray.z * rSinTheta);

  // Then apply the offset to the centre of our lens
  return screen - c;
}

vec2 projectEquisolid(vec3 ray, float f, vec2 c) {
  // Calculate some intermediates
  float theta     = acos(ray.x);
  float r         = 2.0 * f * sin(theta * 0.5);
  float rSinTheta = 1.0 / sqrt(1.0 - ray.x * ray.x);

  // Work out our pixel coordinates as a 0 centred image with x to the left and y up (screen space)
  vec2 screen = ray.x >= 1.0 ? vec2(0) : vec2(r * ray.y * rSinTheta, r * ray.z * rSinTheta);

  // Then apply the offset to the centre of our lens
  return screen - c;
}

vec2 projectRectilinear(vec3 ray, float f, vec2 c) {
  float rx = 1.0 / ray.x;
  return vec2(f * ray.y * rx, f * ray.z * rx) - c;
}

vec2 project(vec3 ray, float f, vec2 c, int projection) {
  if (projection == RECTILINEAR_PROJECTION) return projectRectilinear(ray, f, c);
  if (projection == EQUIDISTANT_PROJECTION) return projectEquidistant(ray, f, c);
  if (projection == EQUISOLID_PROJECTION) return projectEquisolid(ray, f, c);
  return vec2(0);
}

void main() {
  // Rotate vector into camera space and project into image space
  // Correct for OpenGL coordinate system and aspect ratio
  vec2 uv = project((Hcw * vec4(position, 0)).xyz, focalLength * viewSize.x, centre, projection)
            * vec2(-1.0, viewSize.x / viewSize.y);

  // Forward our varyings
  vUv = (uv + 1.0) * 0.5;

  // Classifications
  vBall        = ball;
  vGoal        = goal;
  vFieldLine   = fieldLine;
  vField       = field;
  vEnvironment = environment;

  // Calculate our position in the mesh
  float theta = atan2(position.y, position.x);
  float phi   = acos(position.z);
  float n     = k * (ln(abs(tan((M_PI - 2.0 * phi) * 0.25))) / ln(1.0 - 2.0 * r / h));
  vec2 pos    = vec2(cos(theta), sin(theta)) * n;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
}
