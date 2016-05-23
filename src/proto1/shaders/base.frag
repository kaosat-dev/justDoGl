precision mediump float;
uniform vec4 color;
varying vec3 vnormal;

varying vec3 fragNormal, fragPosition;

struct Light {
  vec3 color;
  vec3 position;
  float intensity;
};
#define lightsNb 4
uniform Light lights[lightsNb];

void main() {
  //gl_FragColor = color;
  //gl_FragColor = vec4(abs(vnormal), 1.0)*0.5+color*0.5;

  vec3 normal = normalize(fragNormal);
  vec3 light = vec3(0, 0, 0);
  for (int i = 0; i < lightsNb; ++i) {
     vec3 lightDir = normalize(lights[i].position - fragPosition);
     float diffuse = max(0.0, dot(lightDir, normal));
     light += diffuse * lights[i].color * lights[i].intensity;
  }
  gl_FragColor = vec4(light, 1)*0.5+color*0.5;
}