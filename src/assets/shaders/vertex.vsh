precision mediump float;

uniform mat3 transform;

attribute vec2 vertPosition;
attribute vec3 vertColor;
varying   vec3 fragColor;

void main ()
{
    fragColor = vertColor;
    gl_Position = mat4(transform) * vec4(vertPosition, 0.0, 1.0);
}