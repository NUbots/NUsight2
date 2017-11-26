uniform mat4 Hcw;
uniform vec2 imageSize;

vec2 imageToScreen(vec2 point, vec2 imageSize);
vec3 unprojectEquidistant(vec2 point, float focalLength);
vec2 projectEquidistant(vec3 ray, float focalLength);

void main() {
  float focusLength = 1.0 / 0.00245;
  float lineWidth = 4.0;

//  unproject_equidistant

//  gl_FragColor = vec4(1, 0, 0, 0.5);
	//vec2 screenSpace = gl_FragCoord.x - imageSize.x * 0.5, imageSize.y - (gl_FragCoord.y - imageSize.y * 0.5),
  vec2 screenPoint = imageToScreen(gl_FragCoord.xy, imageSize);
  vec3 cam = unprojectEquidistant(screenPoint, focusLength);
  vec3 normal = Hcw[2].xyz;
  float distance = dot(cam, normal);
  vec3 p = cam - normal * distance;
  vec2 nearestPixel = projectEquidistant(p, focusLength);
  float distance4Real = length(screenPoint - nearestPixel);

//  float distance = 1.0 - abs(dot(cam, Hcw[2].xyz));
//  float distance = 1.0 - abs(dot(cam, Hcw[1].xyz));
//  float distance = 1.0 - abs(dot(cam, vec3(Hcw[0].z, Hcw[1].z, Hcw[2].z)));
//  gl_FragColor = vec4(screenPoint / imageSize * 2.0, 0, 1);
//	float alpha = max(0.0, pow(distance, 100.0));
//	float alpha = max(0.0, pow(distance4Real, 100.0));
	float alpha = smoothstep(0.0, lineWidth * 0.5, -distance4Real + lineWidth * 0.5);
  gl_FragColor = vec4(0, 0, 1, alpha);
//  gl_FragColor = vec4(1, 0, 0, 0.5);
}


vec2 imageToScreen(vec2 point, vec2 imageSize) {
  return vec2(
    (imageSize.x - point.x) - imageSize.x * 0.5,
    point.y - imageSize.y * 0.5
  );
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
//
//
//    // Calculate some intermediates
//    const Scalar theta     = acos(ray.x);
//    const Scalar r         = f * theta;
//    const Scalar sin_theta = sin(theta);
//
//    // Work out our pixel coordinates as a 0 centred image with x to the left and y up (screen space)
//    const Scalar2 screen = (Scalar2)(r * ray.y / sin_theta, r * ray.z / sin_theta);
//
//    // Apply our offset to move into image space (0 at top left, x to the right, y down)
//    const Scalar2 image = (Scalar2)((Scalar)(dimensions.x - 1) * 0.5, (Scalar)(dimensions.y - 1) * 0.5) - screen;
//}
