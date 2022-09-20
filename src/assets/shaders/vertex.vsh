precision mediump float;

uniform mat3 transform;

attribute vec2 vertPosition;
attribute vec2 vertTexCoord;
varying   vec2 fragTexCoord;

void main ()
{
    fragTexCoord = vertTexCoord;
    gl_Position  = vec4(transform * vec3(vertPosition, 1.0), 1.0);
}