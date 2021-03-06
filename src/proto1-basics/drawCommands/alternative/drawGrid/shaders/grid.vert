precision mediump float;
attribute vec3 position;
uniform mat4 model, view, projection;
varying vec3 fragPosition;

void main() {
 fragPosition = position;
 gl_Position = projection * view * model * vec4(position, 1);
}
