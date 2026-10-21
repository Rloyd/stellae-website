precision highp float;

uniform vec2 resolution;
uniform float time;
const float PI = 3.14159265;
const float FORM_SWEEP_SECONDS = 2.800;
float hash(float n) { return fract(sin(n * 127.1 + 43.7) * 43758.5453); }
vec2 rotate(vec2 p, float a) {
  return vec2(cos(a)*p.x - sin(a)*p.y, sin(a)*p.x + cos(a)*p.y);
}
float flow(vec2 p, float t) {
  return sin(p.x*.061 + t*.61)*cos(p.y*.053 - t*.47)
    + .45*sin(p.x*.127 - p.y*.087 - t*.73);
}
float starDistance(vec2 p, vec2 radius) {
  vec2 q = abs(p) / radius;
  return (pow(q.x,.62) + pow(q.y,.62) - 1.) * min(radius.x,radius.y);
}
float light(float d, float radius) { return exp(-abs(d)/radius); }
vec4 launchShade(vec2 xy) {
  vec2 p = (xy / resolution - .5) * vec2(280.,220.);
  float t = time;
  float appear = smoothstep(.08,1.8,t);
  float breathe = .91 + .09*sin(t*.83 + .7);
  vec2 drift = vec2(flow(p,t),flow(p.yx + 31.,t+2.)) * 1.6;
  float orbitTilt = .4415 + .10 * (1.-smoothstep(.25,3.4,t));
  vec2 orbitCenter = vec2(.25,-3.775);
  vec2 q = rotate(p-orbitCenter, orbitTilt);
  vec2 e = q / vec2(99.825,23.55);
  float ringD = (length(e)-1.) / max(length(e / vec2(99.825,23.55)),.001);
  float angle = atan(e.y,e.x);
  float progress = fract((angle+PI)/(2.*PI)+.13);
  float drawProgress = smoothstep(.12,2.85,t);
  float draw = 1.-smoothstep(drawProgress,drawProgress+.028,progress);
  float front = smoothstep(-.12,.12,e.y);
  // Reference: a broad upper-right turn, a smaller lower-left turn, hairline long arcs.
  float rightCrest = pow(max(0.,cos(angle-.20)),3.5);
  float leftCrest = pow(max(0.,-cos(angle)),8.);
  float depth = .70 + .30*max(rightCrest,leftCrest);
  float sweep = pow(max(0.,cos(angle - t*1.12)),32.);
  float strokeWidth = .12 + 2.30*rightCrest + 1.25*leftCrest;
  float stroke = 1.-smoothstep(strokeWidth-.12,strokeWidth+.26,abs(ringD));
  float glow = light(ringD,1.6)*.26 + light(ringD,4.5)*.08;
  vec3 ringColor = mix(vec3(.77,.73,.93),vec3(.97,.985,1.),smoothstep(.5,2.9,t));
  vec3 ring = ringColor * (stroke + glow) * depth * draw * appear * (breathe + sweep*.8);
  // Separate, soft violet and blue light fields; no shared color ramp or hard disk edge.
  vec2 violetCenter = vec2(-23.,10.) + vec2(sin(t*.41),cos(t*.37))*1.8;
  vec2 blueCenter = vec2(21.,-7.) + vec2(cos(t*.29+1.4),sin(t*.33+2.))*1.5;
  vec2 violetP = rotate(p-violetCenter+drift*.55,-.16)/vec2(30.,51.);
  vec2 blueP = rotate(p-blueCenter-drift*.45,.13)/vec2(35.,54.);
  float violetFog = exp(-dot(violetP,violetP)*.8);
  float blueFog = exp(-dot(blueP,blueP)*.8);
  float violetCloud = .93 + .045*flow(p+drift,t*.34);
  float blueCloud = .94 + .04*flow(p.yx+23.,t*.27+3.);
  float violetPulse = .90 + .10*sin(t*.79+.2);
  float bluePulse = .91 + .09*sin(t*.61+2.1);
  vec3 violetLight = vec3(.31,.20,.43)*violetFog*violetCloud*violetPulse*smoothstep(.12,1.1,t);
  vec3 blueLight = vec3(.27,.39,.55)*blueFog*blueCloud*bluePulse*smoothstep(.42,1.5,t);
  vec3 color = ring + violetLight + blueLight;

  // FORM-like particles travel through the same elliptical map, with turbulent offsets.
  for (int i=0; i<24; i++) {
    float seed = float(i);
    float a = hash(seed)*PI*2. + t*(.07 + .045*hash(seed+9.));
    float spread = mix(1.55,1.,smoothstep(0.,1.5,t));
    vec2 pos = orbitCenter + rotate(vec2(cos(a)*99.825,sin(a)*23.55)*spread,-orbitTilt);
    pos += vec2(sin(a*3.+t*.43),cos(a*4.-t*.36))*(3.+hash(seed+7.)*7.);
    float d = length(p + drift - pos);
    float twinkle = .25+.75*pow(.5+.5*sin(t*(.8+hash(seed))+seed*2.4),3.);
    float radius = .38 + .36*hash(seed+3.);
    float spark = light(d,radius) + light(d,2.)*.08;
    color += mix(vec3(.9,.32,.77),vec3(.44,.85,1.),hash(seed+12.))*spark*twinkle*appear*.55;
  }

  // A fixed silhouette contains a fine FORM-style lattice, not four moving quadrants.
  // Each fragment evaluates only its own cell; no additional particle draw calls.
  float d = starDistance(p,vec2(55.,63.));
  float mask = 1.-smoothstep(-.55,.65,d);
  float cellSize = 3.2;
  vec2 cell = floor(p/cellSize);
  vec2 cellCenter = (cell+.5)*cellSize;
  float seed = hash(cell.x*37. + cell.y*131.);
  float arrival = .35 + (dot(cellCenter,vec2(.72,.69))+48.)/96.*FORM_SWEEP_SECONDS + seed*.22;
  float age = t-arrival;
  float birth = smoothstep(-.10,.25,age);
  float join = smoothstep(.20,.92,age);
  vec2 flutter = vec2(sin(t*2.1+seed*17.),cos(t*1.7+seed*23.))*.32*(1.-join);
  vec2 local = p-cellCenter-flutter;
  float particleD = length(local);
  float particle = 1.-smoothstep(.32,.82,particleD);
  float particleGlow = light(particleD,1.05)*.25;
  float twinkle = .84+.16*sin(t*(2.4+seed)+seed*29.);
  float fillIn = birth*mix(clamp((particle+particleGlow)*twinkle,0.,1.),1.,join);
  float gradient = .5+.5*sin(p.y*.031 + p.x*.016 - t*.55 + flow(p,t)*.35);
  vec3 tint = mix(vec3(.95,.38,.72),vec3(.55,.89,1.),gradient);
  float settle = smoothstep(.55,1.42,age);
  vec3 starColor = mix(tint,vec3(.97,.98,1.),settle);
  float scanPosition = mix(-48.,48.,clamp((t-.35)/FORM_SWEEP_SECONDS,0.,1.));
  float scan = light(dot(p,vec2(.72,.69))-scanPosition,5.)
    *smoothstep(.12,.4,t)*(1.-smoothstep(FORM_SWEEP_SECONDS+.45,FORM_SWEEP_SECONDS+1.05,t));
  vec2 gridEdge = cellSize*.5-abs(p-cellCenter);
  float lattice = 1.-smoothstep(.05,.23,min(gridEdge.x,gridEdge.y));
  float halo = light(max(d,0.),5.)*.19 + light(max(d,0.),12.)*.065;
  color += tint*halo*appear*breathe;
  color = mix(color,starColor*(.92+scan*.24),mask*fillIn);
  color += mix(tint,vec3(.8,.96,1.),.65)*mask*scan*(lattice*.24+particle*.20);
  // The rear arc passes behind the star; the near arc catches a fine specular light.
  color += ring*mask*front*.32;

  float pinkIn = smoothstep(.64,1.68,t);
  float cyanIn = smoothstep(1.42,2.63,t);
  vec2 pinkPos = vec2(-39.,-54.) + vec2(-8.,7.)*(1.-pinkIn);
  vec2 cyanPos = vec2(53.,39.) + vec2(6.,9.)*(1.-cyanIn);
  float pinkD = starDistance((p-pinkPos)/mix(.55,1.,pinkIn),vec2(13.,15.));
  float cyanD = starDistance((p-cyanPos)/mix(.6,1.,cyanIn),vec2(12.,13.));
  color += vec3(1.,.24,.66)*(1.-smoothstep(-.3,.6,pinkD)+light(max(pinkD,0.),3.)*.2)*pinkIn*(.86+.14*sin(t*1.23));
  color += vec3(.24,.89,1.)*(1.-smoothstep(-.3,.6,cyanD)+light(max(cyanD,0.),3.)*.2)*cyanIn*(.84+.16*sin(t*.87+2.));
  float edge = 1.-smoothstep(.83,1.,max(abs(p.x)/140.,abs(p.y)/110.));
  return vec4(clamp(color*edge,0.,1.),1.);
}

void main(){gl_FragColor=launchShade(vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y));}
