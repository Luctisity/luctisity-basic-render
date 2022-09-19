precision mediump float;

uniform mat3 transform;

attribute vec2 vertPosition;
attribute vec3 vertColor;
varying   vec3 fragColor;

void main ()
{
    fragColor = vertColor;
    gl_Position = vec4(transform * vec3(vertPosition, 1.0), 1.0);
}