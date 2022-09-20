precision mediump float;

uniform vec4 color;

uniform sampler2D sampler;
varying vec2 fragTexCoord;

void main ()
{
    gl_FragColor = texture2D(sampler, fragTexCoord) * color;
}