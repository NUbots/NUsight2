precision lowp float;
precision lowp int;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 viewSize;
uniform mat4 Hcw;
uniform float focalLength;
uniform vec2 centre;
uniform vec2 kP;
uniform int projection;

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

#define RECTILINEAR_PROJECTION 1
#define EQUIDISTANT_PROJECTION 2
#define EQUISOLID_PROJECTION 3

// TODO(trent) these should be moved into a separate GLSL file once there is a decent #include system

/**
 * Given an angle from the optical axis of the lens, calcululate the distance from the optical centre of the lens using
 * an equidistant projection.
 *
 * @param theta the angle between the optical axis to the point
 * @param f     the focal length of the lens
 *
 * @return the distance from the optical centre when the point is projected onto the screen
 */
float equidistantR(float theta, float f) {
  return f * theta;
}

/**
 * Given an angle from the optical axis of the lens, calcululate the distance from the optical centre of the lens using
 * an equisolid projection.
 *
 * @param theta the angle between the optical axis to the point
 * @param f     the focal length of the lens
 *
 * @return the distance from the optical centre when the point is projected onto the screen
 */
float equisolidR(float theta, float f) {
  return 2.0 * f * sin(theta * 0.5);
}


/**
 * Given an angle from the optical axis of the lens, calcululate the distance from the optical centre of the lens using
 * a rectilinear projection.
 *
 * @param theta the angle between the optical axis to the point
 * @param f     the focal length of the lens
 *
 * @return the distance from the optical centre when the point is projected onto the screen
 */
float rectilinearR(float theta, float f) {
  return f * tan(theta);
}


/**
 * Projects the camera ray measured in coordinate system where x is forward down the camera axis, y is to the
 * left and z is up. The output coordinate system is one where the origin is the centre of the image, x is to the
 * left and y is up.
 *
 * @param ray        the ray to project to pixel coordinates
 * @param f          the focal length to use in the projection
 * @param c          the offset from the centre of the image to the optical centre lens
 * @param k          the distortion coefficents for the lens model
 * @param projection the type of projection to use
 *
 * @return the position of the pixel measured as a fraction of the image width
 */
vec2 project(vec3 ray, float f, vec2 c, vec2 k, int projection) {
  float theta     = acos(ray.x);
  float rSinTheta = 1.0 / sqrt(1.0 - ray.x * ray.x);
  float r         = 0.0;
  if (projection == RECTILINEAR_PROJECTION) r = rectilinearR(theta, f);
  if (projection == EQUIDISTANT_PROJECTION) r = equidistantR(theta, f);
  if (projection == EQUISOLID_PROJECTION) r = equisolidR(theta, f);
  float r_d = r / (1.0 + k.x * r * r + k.y * r * r * r * r);
  vec2 p    = ray.x >= 1.0 ? vec2(0) : vec2(r_d * ray.y * rSinTheta, r_d * ray.z * rSinTheta);
  return p - c;
}

void main() {
  // Rotate vector into camera space and project into image space
  // Correct for OpenGL coordinate system and aspect ratio
  // Multiply by 2.0 to get a coordinate since the width of the "image (the camera planes)" is -1 to 1 (width of 2.0)
  vec2 pos = project((Hcw * vec4(position, 0)).xyz, focalLength, centre, kP, projection)
             * vec2(-1.0, viewSize.x / viewSize.y) * 2.0;

  vBall        = ball;
  vGoal        = goal;
  vFieldLine   = fieldLine;
  vField       = field;
  vEnvironment = environment;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
}
