uniform sampler2D image;
varying vec2 vUv;

varying vec4 center;
varying vec4 xCoord;
varying vec4 yCoord;

void main(void) {
	vec4 C = texture2D(image, vUv);
	gl_FragColor = C;
}
