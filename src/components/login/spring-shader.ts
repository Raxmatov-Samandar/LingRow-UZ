export const SPRING_FRAGMENT = `
precision highp float;
uniform sampler2D scene;
uniform sampler2D masks;
uniform sampler2D iceMask;
uniform vec2 resolution;
uniform float time;
uniform float motion;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float cutoutAlpha(vec3 ink, vec3 sky, bool bird) {
  if(bird) return smoothstep(.14,.31,length(ink-sky)) * (1.-smoothstep(.36,.52,max(ink.r,max(ink.g,ink.b))));
  #ifdef AUTUMN
  return smoothstep(.045,.14,ink.r-ink.g) * smoothstep(.06,.19,ink.g-ink.b);
  #else
  return smoothstep(.025,.12,max(ink.r,ink.b)-ink.g) * smoothstep(.025,.14,ink.r-ink.g);
  #endif
}
// Reuse the actual source bird/leaf pixels, clearing their original silhouette
// with neighboring sky/water. Only these small cutouts move, not the landscape.
vec3 floatingObject(vec3 color, vec2 pixel, vec2 center, vec2 halfSize, vec2 drift, float angle, float flap, bool bird) {
  vec2 imageSize=vec2(1672.,941.);
  vec3 backdrop=texture2D(scene,(center-vec2(0.,halfSize.y+9.))/imageSize).rgb;
  vec2 old=pixel-center;
  if(abs(old.x)<halfSize.x && abs(old.y)<halfSize.y) {
    vec3 ink=texture2D(scene,pixel/imageSize).rgb;
    float edge=max(abs(old.x)/halfSize.x,abs(old.y)/halfSize.y);
    float alpha=1.-smoothstep(.78,1.,edge);
    vec2 gap=vec2(0.,halfSize.y*2.+4.);
    vec3 repair=(texture2D(scene,(pixel-gap)/imageSize).rgb+texture2D(scene,(pixel+gap)/imageSize).rgb)*.5;
    color=mix(color,repair,alpha*motion);
  }
  vec2 local=pixel-center-drift*motion;
  local=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*local;
  local.y/=mix(1.,flap,motion);
  if(abs(local.x)<halfSize.x && abs(local.y)<halfSize.y) {
    vec3 ink=texture2D(scene,(center+local)/imageSize).rgb;
    float alpha=cutoutAlpha(ink,backdrop,bird);
    color=mix(color,ink,alpha*motion);
  }
  return color;
}
void main() {
  vec2 screen=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y)/resolution;
  vec2 imageSize=vec2(1672.,941.);
  float scale=max(resolution.x/imageSize.x,resolution.y/imageSize.y);
  vec2 uv=(screen-.5)*resolution/(imageSize*scale)+.5;
  vec3 mask=texture2D(masks,uv).rgb;
  float water=texture2D(iceMask,uv).r;
  vec2 shift=vec2(0.);
  shift.x+=(mask.r*sin(time*.85+uv.y*8.)+mask.g*sin(time*.73+1.5+uv.y*7.))*1.7/imageSize.x;
  shift.y+=(mask.r+mask.g)*sin(time*.63)*.25/imageSize.y;
  shift.x+=mask.b*sin(time*.10)*3./imageSize.x;
  float depth=clamp((uv.y-.73)/.27,0.,1.);
  shift.x+=water*(sin(uv.y*650.-time*1.8)*1.7+sin(uv.y*260.+time*1.1))*depth/imageSize.x;
  shift.y+=water*sin(uv.y*370.+time*1.2)*.35/imageSize.y;
  vec3 color=texture2D(scene,clamp(uv+shift*motion,0.,1.)).rgb;
  color+=water*.012*(.5+.5*sin(uv.y*270.-time*1.2))*motion;
  vec2 pixel=uv*imageSize;
  #ifdef AUTUMN
  color=floatingObject(color,pixel,vec2(494.,783.),vec2(24.,17.),vec2(sin(time*.23)*48.,sin(time*.72)*3.),sin(time*.37)*.12,1.,false);
  color=floatingObject(color,pixel,vec2(389.,881.),vec2(23.,15.),vec2(sin(time*.19+1.)*37.,sin(time*.65+1.)*2.5),sin(time*.32+1.)*.14,1.,false);
  color=floatingObject(color,pixel,vec2(1185.,854.),vec2(27.,18.),vec2(sin(time*.21+2.)*54.,sin(time*.8+2.)*3.),sin(time*.34+2.)*.11,1.,false);
  color=floatingObject(color,pixel,vec2(1535.,783.),vec2(23.,14.),vec2(sin(time*.17+3.)*35.,sin(time*.7+3.)*2.),sin(time*.28+3.)*.13,1.,false);
  color=floatingObject(color,pixel,vec2(54.,775.),vec2(12.,10.),vec2(sin(time*.24+1.8)*24.,sin(time*.6)*2.),sin(time*.4)*.1,1.,false);
  #else
  color=floatingObject(color,pixel,vec2(494.,783.),vec2(22.,16.),vec2(sin(time*.23)*48.,sin(time*.72)*3.),sin(time*.37)*.12,1.,false);
  color=floatingObject(color,pixel,vec2(389.,881.),vec2(20.,14.),vec2(sin(time*.19+1.)*37.,sin(time*.65+1.)*2.5),sin(time*.32+1.)*.14,1.,false);
  color=floatingObject(color,pixel,vec2(1185.,850.),vec2(24.,18.),vec2(sin(time*.21+2.)*54.,sin(time*.8+2.)*3.),sin(time*.34+2.)*.11,1.,false);
  color=floatingObject(color,pixel,vec2(1535.,779.),vec2(28.,23.),vec2(sin(time*.17+3.)*35.,sin(time*.7+3.)*2.),sin(time*.28+3.)*.13,1.,false);
  color=floatingObject(color,pixel,vec2(54.,775.),vec2(13.,11.),vec2(sin(time*.24+1.8)*24.,sin(time*.6)*2.),sin(time*.4)*.1,1.,false);
  #endif
  color=floatingObject(color,pixel,vec2(383.,246.),vec2(22.,12.),vec2(sin(time*.16)*95.,sin(time*.6)*10.),sin(time*.4)*.05,.37+.73*(.5+.5*sin(time*5.4)),true);
  color=floatingObject(color,pixel,vec2(1187.,236.),vec2(22.,12.),vec2(sin(time*.13+1.)*75.,sin(time*.55+1.)*12.),sin(time*.35+1.)*.05,.37+.73*(.5+.5*sin(time*5.8+1.)),true);
  color=floatingObject(color,pixel,vec2(1230.,202.),vec2(20.,11.),vec2(sin(time*.14+2.)*90.,sin(time*.62+2.)*9.),sin(time*.38+2.)*.05,.37+.73*(.5+.5*sin(time*5.1+2.)),true);
  // A few wind-blown blossom petals, with different drift and tumble phases.
  float petals=0.;
  for(int layer=0;layer<2;layer++) {
    float l=float(layer);
    vec2 grid=vec2(13.+l*6.,8.+l*3.);
    vec2 p=screen*grid;
    p.x-=time*(.23+l*.12);
    p.y-=time*(.11+l*.05);
    vec2 cell=floor(p);
    float seed=hash(cell+l*43.);
    vec2 center=vec2(.2+hash(cell+5.)*.6,.2+hash(cell+17.)*.6);
    vec2 delta=(fract(p)-center)*resolution/grid;
    float angle=time*(.8+seed)+seed*6.;
    delta=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*delta;
    float size=resolution.y/900.;
    #ifdef AUTUMN
    vec2 oval=delta/vec2((3.4+l)*size,(2.5+l*.5)*size);
    float lobes=.78+.20*cos(atan(oval.y,oval.x)*5.);
    float petal=(1.-smoothstep(lobes-.25,lobes,length(oval)))*step(.86,seed);
    #else
    vec2 oval=delta/vec2((2.8+l)*size,(1.3+l*.3)*size);
    float petal=(1.-smoothstep(.45,1.,length(oval)))*step(.90,seed);
    #endif
    petals+=petal*(.45+l*.15);
  }
  #ifdef AUTUMN
  color=mix(color,vec3(1.,.38+.21*sin(screen.x*13.+time*.3),.055),min(.9,petals)*motion);
  #else
  color=mix(color,vec3(1.,.62,.78),min(.8,petals)*motion);
  #endif
  gl_FragColor=vec4(color,1.);
}
`;

export const AUTUMN_FRAGMENT = '#define AUTUMN\n' + SPRING_FRAGMENT;
