uniform mat4 Hcw;
uniform vec2 imageSize;

vec2 imageToScreen(vec2 point, vec2 imageSize);
vec3 unprojectEquidistant(vec2 point, float focalLength);

void main() {
  float focusLength = 1.0 / 0.00245;

//  unproject_equidistant

//  gl_FragColor = vec4(1, 0, 0, 0.5);
	//vec2 screenSpace = gl_FragCoord.x - imageSize.x * 0.5, imageSize.y - (gl_FragCoord.y - imageSize.y * 0.5),
  vec2 screenPoint = imageToScreen(gl_FragCoord.xy, imageSize);
  vec3 cam = unprojectEquidistant(screenPoint, focusLength);
  float distance = 1.0 - abs(dot(cam, Hcw[2].xyz));
//  float distance = 1.0 - abs(dot(cam, vec3(Hcw[0].z, Hcw[1].z, Hcw[2].z)));
//  gl_FragColor = vec4(screenPoint / imageSize * 2.0, 0, 1);
	float alpha = max(0.0, pow(distance, 100.0));
  gl_FragColor = vec4(1, 0, 0, alpha);
//  gl_FragColor = vec4(1, 0, 0, 0.5);
}


vec2 imageToScreen(vec2 point, vec2 imageSize) {
  return vec2(
    (imageSize.x - point.x) - imageSize.x * 0.5,
    point.y - imageSize.x * 0.5
  );
}

vec3 unprojectEquidistant(vec2 point, float focalLength) {
  float R = length(point);
  vec3 s = vec3(
    cos(R / focalLength),
    sin(R / focalLength) * point.x / R,
    sin(R / focalLength) * point.y / R
  );
  return normalize(s);
}
