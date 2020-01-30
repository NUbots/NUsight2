precision lowp float;

#define M_PI 3.1415926535897932384626433832795

// Lens/projection parameters
uniform vec2 viewSize;
uniform float focalLength;
uniform int projection;
uniform vec2 centre;
uniform vec2 kP;
uniform vec2 kU;

// Line parameters
uniform vec3 axis;
uniform vec3 start;
uniform vec3 end;

// Style
uniform vec4 colour;
uniform float lineWidth;

varying vec2 vUv;

#define RECTILINEAR_PROJECTION 1
#define EQUIDISTANT_PROJECTION 2
#define EQUISOLID_PROJECTION 3

// TODO(trent) these should be moved into a separate GLSL file once there is a decent #include system

/**
 * Given a radius from the optical centre of a projection, calculate the angle that is made from the optical axis to the
 * point using an equidistant projection.
 *
 * @param r the radius from the optical centre of the image
 * @param f the focal length of the lens
 *
 * @return the angle from the optical axis to this point
 */
float equidistantTheta(float r, float f) {
  return r / f;
}

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
 * Given a radius from the optical centre of a projection, calculate the angle that is made from the optical axis to the
 * point using an equisolid projection.
 *
 * @param r the radius from the optical centre of the image
 * @param f the focal length of the lens
 *
 * @return the angle from the optical axis to this point
 */
float equisolidTheta(float r, float f) {
  return 2.0 * asin(r / (2.0 * f));
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
 * Given a radius from the optical centre of a projection, calculate the angle that is made from the optical axis to the
 * point using a rectilinear projection.
 *
 * @param r the radius from the optical centre of the image
 * @param f the focal length of the lens
 *
 * @return the angle from the optical axis to this point
 */
float rectilinearTheta(float r, float f) {
  return atan(r / f);
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
 * Unprojects a pixel coordinate into a unit vector. The input coordinate system is one where the origin is the centre
 * of the image, x is to the left and y is up. The output unit vector is measured as a ray measured in coordinate system
 * where x is forward down the camera axis, y is to the left and z is up
 *
 * @param point      the pixel coordinate to unproject back to a unit vector
 * @param f          the focal length to use in the projection
 * @param c          the offset from the centre of the image to the optical centre lens
 * @param k          the distortion coefficents for the lens model
 * @param projection the type of projection to use

 * @return the unit vector that corresponds to the provided pixel
 */
vec3 unproject(vec2 point, float f, vec2 c, vec2 k, int projection) {
  vec2 p      = point + c;
  float r_d   = length(p);
  float r     = r_d / (1.0 + k.x * r_d * r_d + k.y * r_d * r_d * r_d * r_d);
  float theta = 0.0;
  if (projection == RECTILINEAR_PROJECTION) theta = rectilinearTheta(r, f);
  else if (projection == EQUIDISTANT_PROJECTION) theta = equidistantTheta(r, f);
  else if (projection == EQUISOLID_PROJECTION) theta = equisolidTheta(r, f);
  return vec3(cos(theta), sin(theta) * p / r_d);
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
  else if (projection == EQUIDISTANT_PROJECTION) r = equidistantR(theta, f);
  else if (projection == EQUISOLID_PROJECTION) r = equisolidR(theta, f);
  float r_d = r / (1.0 + k.x * r * r + k.y * r * r * r * r);
  vec2 p    = ray.x >= 1.0 ? vec2(0) : vec2(r_d * ray.y * rSinTheta, r_d * ray.z * rSinTheta);
  return p - c;
}

/**
 * Rotate a vector v about the axis e by the angle theta
 *
 * @param v       the vector to rotate
 * @param e       the axis to rotate around
 * @param theta   the angle to rotate by
 *
 * @return the input vector rotated around e by theta
 */
vec3 rotateByAxisAngle(vec3 v, vec3 e, float theta) {
  return cos(theta) * v + sin(theta) * cross(e, v) + (1.0 - cos(theta)) * (dot(e, v)) * e;
}

/**
 * Measures the angle that start must be rotated around axis to reach end within the 2d plane defined by axis
 *
 * @param axis    the axis that defines the plane to measure the angle in
 * @param start   the vector to measure the angle from
 * @param end     the vector to measure the angle to
 *
 * @return the angle between the two vectors from start to end
 */
float angleAround(vec3 axis, vec3 start, vec3 end) {

  // Put start and end in the plane of axis
  vec3 aStart = normalize(cross(axis, start));
  vec3 aEnd   = normalize(cross(axis, end));

  float x = dot(aStart, aEnd);               // cos(theta)
  float y = dot(axis, cross(aStart, aEnd));  // sin(theta)

  // sin(theta)/cos(theta) = tan(theta)
  float theta = atan(y, x);

  // We want 0 -> 2pi not -pi -> pi
  theta += theta < 0.0 ? (M_PI * 2.0) : 0.0;
  return theta;
}

void main() {

  // Get our position on the screen in normalised coordinates
  vec2 point = vec2(0.5 - vUv.x, vUv.y - 0.5) * vec2(1.0, viewSize.y / viewSize.x);

  // Get the gradient of the curve we are drawing
  float gradient = dot(axis, start);

  // Project it into the world space
  vec3 cam = unproject(point, focalLength, centre, kU, projection);

  // Rotate the axis vector towards the screen point by the angle to gradient
  // This gives the closest point on the curve
  vec3 nearestRay = rotateByAxisAngle(axis, normalize(cross(axis, cam)), acos(gradient));

  // Work out if we are in range
  float range = angleAround(axis, start, end);
  float value = angleAround(axis, start, nearestRay);

  // start == end means do the whole circle
  range = all(equal(start, end)) ? 2.0 * M_PI : range;

  // If we are past the start or end, snap to start/end
  nearestRay = value > range && value - range > (M_PI * 2.0 - range) * 0.5 ? start : nearestRay;
  nearestRay = value > range && value - range < (M_PI * 2.0 - range) * 0.5 ? end : nearestRay;

  // When we project this back onto the image we get the nearest pixel
  vec2 closestPoint = project(nearestRay, focalLength, centre, kP, projection);

  // We get the distance from us to the nearest pixel and smoothstep to make a line
  // For all the previous calculations we are using normalised pixel coordinates where the coordinate is divided by
  // the width of the image. This ensures that any calculation we do is independent of the resolution that we are
  // displaying the image at. However when we actually want to caculate a distance that is in pixels, we must multiply
  // the coordinates by our horizontal resolution. Once we have multiplied by this resolution we will get a value in
  // pixels relative to the resolution that we are displaying at.
  float pixelDistance = length(point - closestPoint) * viewSize.x;
  float alpha         = smoothstep(0.0, lineWidth * 0.5, lineWidth * 0.5 - pixelDistance);

  gl_FragColor = vec4(colour.rgb, colour.a * alpha);
}

