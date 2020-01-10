precision lowp float;

#define M_PI 3.1415926535897932384626433832795

// Lens/projection parameters
uniform vec2 viewSize;
uniform float focalLength;
uniform int projection;
uniform vec2 centre;

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
 * Unprojects a pixel coordinate into a unit vector.
 * This version unprojects using the equidistant model.
 *
 * @param point the pixel coordinate to
 * @param f     the focal length to use in the projection
 * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is

 * @return the unit vector that corresponds to the provided pixel
 */
vec3 unprojectEquidistant(vec2 point, float f, vec2 c) {
  vec2 p = point + c;
  float r = length(p);
  float theta = r / f;
  return vec3(cos(theta), sin(theta) * p / r);
}

/**
  * Projects the camera ray measured in coordinate system where x is forward down the camera axis, y is to the
  * left and z is up. The output coordinate system is one where the origin is the centre of the image, x is to the
  * left and y is up. This version projects using the equidistant model.
  *
  * @param ray   the ray to project to pixel coordinates
  * @param f     the focal length to use in the projection
  * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is
  *
  * @return  the position of the pixel on the screen
  */
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

/**
 * Unprojects a pixel coordinate into a unit vector.
 * This version unprojects using the equisolid model.
 *
 * @param point the pixel coordinate to
 * @param f     the focal length to use in the projection
 * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is

 * @return the unit vector that corresponds to the provided pixel
 */
vec3 unprojectEquisolid(vec2 point, float f, vec2 c) {
  vec2 p = point + c;
  float r = length(p);
  float theta = 2.0 * asin(r / (2.0 * f));
  return vec3(cos(theta), sin(theta) * p / r);
}

/**
  * Projects the camera ray measured in coordinate system where x is forward down the camera axis, y is to the
  * left and z is up. The output coordinate system is one where the origin is the centre of the image, x is to the
  * left and y is up. This version projects using the equisolid model.
  *
  * @param ray   the ray to project to pixel coordinates
  * @param f     the focal length to use in the projection
  * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is
  *
  * @return  the position of the pixel measured as a fraction of the image width
  */
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

/**
 * Unprojects a pixel coordinate into a unit vector.
 * This version unprojects using the recitlinear (webcam) model.
 *
 * @param point the pixel coordinate to
 * @param f     the focal length to use in the projection
 * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is

 * @return the unit vector that corresponds to the provided pixel
 */
vec3 unprojectRectilinear(vec2 point, float f, vec2 c) {
  return normalize(vec3(f, point + c));
}

/**
  * Projects the camera ray measured in coordinate system where x is forward down the camera axis, y is to the
  * left and z is up. The output coordinate system is one where the origin is the centre of the image, x is to the
  * left and y is up. This version projects using the rectilinear (normal webcam) model.
  *
  * @param ray   the ray to project to pixel coordinates
  * @param f     the focal length to use in the projection
  * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is
  *
  * @return  the position of the pixel measured as a fraction of the image width
  */
vec2 projectRectilinear(vec3 ray, float f, vec2 c) {
  float rx = 1.0 / ray.x;
  return vec2(f * ray.y * rx, f * ray.z * rx) - c;
}

/**
 * Unprojects a pixel coordinate into a unit vector.
 * This version works out which projection to use based on the projection parameter.
 *
 * @param point the pixel coordinate to
 * @param f     the focal length to use in the projection
 * @param c     the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is

 * @return the unit vector that corresponds to the provided pixel
 */
vec3 unproject(vec2 point, float f, vec2 c, int projection) {
  if (projection == RECTILINEAR_PROJECTION) return unprojectRectilinear(point, f, c);
  if (projection == EQUIDISTANT_PROJECTION) return unprojectEquidistant(point, f, c);
  if (projection == EQUISOLID_PROJECTION) return unprojectEquisolid(point, f, c);
  return vec3(0);
}

/**
  * Projects the camera ray measured in coordinate system where x is forward down the camera axis, y is to the
  * left and z is up. The output coordinate system is one where the origin is the centre of the image, x is to the
  * left and y is up. This version works out which projection to use based on the projection parameter.
  *
  * @param ray        the ray to project to pixel coordinates
  * @param f     the focal length to use in the projection
  * @param c          the offset from the centre of the image to the optical centre lens. i.e. the offset to where the centre of the lens projection is
  * @param projection the type of projection to use
  *
  * @return  the position of the pixel measured as a fraction of the image width
  */
vec2 project(vec3 ray, float f, vec2 c, int projection) {
  if (projection == RECTILINEAR_PROJECTION) return projectRectilinear(ray, f, c);
  if (projection == EQUIDISTANT_PROJECTION) return projectEquidistant(ray, f, c);
  if (projection == EQUISOLID_PROJECTION) return projectEquisolid(ray, f, c);
  return vec2(0);
}

/**
 * Rotate a vector v about the axis e by the angle theta
 *
 * @param v       the vector to rotate
 * @param e       the axis to rotate around
 * @param theta   the angle to rotate by
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
  vec3 aEnd = normalize(cross(axis, end));

  float x = dot(aStart, aEnd); // cos(theta)
  float y = dot(axis, cross(aStart, aEnd)); // sin(theta)

  // sin(theta)/cos(theta) = tan(theta)
  float theta = atan(y, x);

  // We want 0 -> 2pi not -pi -> pi
  theta += theta < 0.0 ? (M_PI * 2.0) : 0.0;
  return theta;
}

void main() {

  // Get our position on the screen in pixel coordinates
  vec2 screenPoint = vec2(0.5 - vUv.x, vUv.y - 0.5) * viewSize;

  // Get the gradient of the curve we are drawing
  float gradient = dot(axis, start);

  // The focal length and image centre are stored as normalised coordinates where they are divided by the width of the image
  // This allows them to survive resizing of the canvas we are drawing on as they will always be accurate so long as no cropping occurs
  // However to get actual pixel coordinates and to draw lines with pixel distance we have to  unormalise the focal length and centre coordinates
  // so that they to correspond to the pixel coordinates for our view size
  float f = focalLength * viewSize.x;
  vec2 c = centre * viewSize.x;

  // Project it into the world space
  // The focal length and image centre are normalized by
  vec3 cam = unproject(screenPoint, f, c, projection);

  // Rotate the axis vector towards the screen point by the angle to gradient
  // This gives the closest point on the curve
  vec3 nearestPoint = rotateByAxisAngle(axis, normalize(cross(axis, cam)), acos(gradient));

  // Work out if we are in range
  float range = angleAround(axis, start, end);
  float value = angleAround(axis, start, nearestPoint);

  // start == end means do the whole circle
  range = all(equal(start, end)) ? 2.0 * M_PI : range;

  // If we are past the start or end, snap to start/end
  nearestPoint = value > range && value - range > (M_PI * 2.0 - range) * 0.5 ? start : nearestPoint;
  nearestPoint = value > range && value - range < (M_PI * 2.0 - range) * 0.5 ? end : nearestPoint;

  // When we project this back onto the image we get the nearest pixel
  vec2 nearestPixel = project(nearestPoint, f, c, projection);

  // We get the distance from us to the nearest pixel and smoothstep to make a line
  float pixelDistance = length(screenPoint - nearestPixel);
  float alpha = smoothstep(0.0, lineWidth * 0.5, lineWidth * 0.5 - pixelDistance);

  gl_FragColor = vec4(colour.rgb, colour.a * alpha);
}
