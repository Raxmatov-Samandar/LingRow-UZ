import { useEffect, useRef } from 'react';
import { WinterInteractions } from './WinterInteractions';
import { SPRING_FRAGMENT, AUTUMN_FRAGMENT } from './spring-shader';
import './winter-scene.css';

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;

const FRAGMENT = `
precision highp float;
uniform sampler2D scene;
uniform sampler2D masks;
uniform sampler2D iceMask;
uniform vec2 resolution;
uniform float time;
uniform float motion;
uniform vec3 snowHits[4];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main() {
  vec2 screen = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y) / resolution;
  vec2 imageSize = vec2(2560.,1440.);
  float coverScale = max(resolution.x / imageSize.x, resolution.y / imageSize.y);
  vec2 visible = resolution / (imageSize * coverScale);
  vec2 uv = (screen - .5) * visible + .5;
  vec3 mask = texture2D(masks, uv).rgb;
  float ice = texture2D(iceMask, uv).r;

  // Warp the intact source through the supplied foliage masks. The trunk/root
  // approaches zero movement; no duplicate cutout or repaired background shows.
  float height = pow(clamp((.65 - uv.y) / .27, 0., 1.), 1.3);
  vec2 offset = vec2(0.);
  offset.x += mask.r * height * (sin(time * .95) * 3.8 + sin(time * 1.7 + uv.y * 19.) * .65) / imageSize.x;
  offset.x += mask.g * height * (sin(time * .81 + 1.8) * 4.1 + sin(time * 1.5 + uv.y * 17.) * .6) / imageSize.x;
  offset.y += (mask.r + mask.g) * height * sin(time * .72) * .3 / imageSize.y;
  offset.x += mask.b * sin(time * .12) * 5. / imageSize.x;
  // This scene is frozen: restrained reflection shimmer, not summer waves.
  offset.x += ice * (sin(uv.y * 980. + time * .8) + sin(uv.y * 390. - time * .6)) * .28 / imageSize.x;
  vec3 color = texture2D(scene, clamp(uv + offset * motion, 0., 1.)).rgb;
  color += ice * .004 * (.5 + .5 * sin(uv.y * 230. - time * .7)) * motion;

  // Twinkle only the existing bright star pixels in the upper sky. Source-space
  // phases keep each star's rhythm stable through viewport changes.
  float starSeed = .5 + .5 * sin(uv.x * 83. + uv.y * 119.);
  float sky = 1. - smoothstep(.20, .245, uv.y);
  float pulse = .5 + .5 * sin(time * (1.1 + starSeed * 2.2) + starSeed * 37.);
  float shimmer = .5 + .5 * sin(time * .67 + starSeed * 19.);
  float on = smoothstep(.17, .77, pulse);
  if (sky > 0.) {
    vec2 gap = vec2(9.) / imageSize;
    vec3 background = min(min(texture2D(scene, uv + vec2(gap.x,0.)).rgb,
      texture2D(scene, uv - vec2(gap.x,0.)).rgb),
      min(texture2D(scene, uv + vec2(0.,gap.y)).rgb,
      texture2D(scene, uv - vec2(0.,gap.y)).rgb));
    vec3 starlight = max(color - background, vec3(0.));
    color = mix(color, background + starlight * (.01 + on * 1.35 + shimmer * .08), sky * motion);
  }

  // Exactly one meteor per three-second cycle, visible for its first second.
  float cycle = floor(time / 3.);
  float age = mod(time, 3.);
  float seed = hash(vec2(cycle, 73.));
  vec2 start = vec2(.12 + seed * .58, .025 + hash(vec2(cycle, 31.)) * .09);
  vec2 travel = vec2(.24, .14);
  vec2 head = start + travel * age;
  vec2 aspect = vec2(resolution.x / resolution.y, 1.);
  vec2 delta = (screen - head) * aspect;
  vec2 direction = normalize(travel * aspect);
  float along = dot(delta, direction);
  float across = abs(delta.x * direction.y - delta.y * direction.x);
  float tail = smoothstep(-.19, -.004, along) * (1. - smoothstep(0., .003, along));
  float streak = exp(-across * across / .0000015) * tail;
  float core = exp(-dot(delta, delta) / .000006);
  float meteorFade = smoothstep(0., .12, age) * (1. - smoothstep(.7, 1., age));
  color += vec3(.68, .82, 1.) * (streak * .8 + core) * meteorFade * motion;

  // A clicked snow cap sheds locally, then slowly gathers fresh snow again.
  for (int hit = 0; hit < 4; hit++) {
    vec3 event = snowHits[hit];
    if (event.z >= 0. && event.z < 13.) {
      vec2 delta = (uv - event.xy) * imageSize;
      float patch = 1. - smoothstep(12., 49., length(delta * vec2(1., 1.45)));
      float treeZone = 1. - smoothstep(.64, .67, uv.y);
      float snowColor = smoothstep(.30,.58,color.r) * smoothstep(.4,.65,color.b);
      float shed = smoothstep(0.,.4,event.z) * (1. - smoothstep(8.,13.,event.z));
      vec3 branch = vec3(.075,.17,.29) + color * .2;
      color = mix(color, branch, patch * treeZone * snowColor * shed * .88);
    }
  }

  // Sparse, slow snow in three depth planes, independent of image cropping.
  float snow = 0.;
  for (int layer = 0; layer < 3; layer++) {
    float l = float(layer);
    vec2 grid = vec2(25. + l * 12., 16. + l * 8.);
    vec2 p = screen * grid;
    p.y -= time * (.19 + l * .10);
    p.x += sin(time * .22 + l) * .21 + time * .035;
    vec2 cell = floor(p);
    float seed = hash(cell + l * 37.);
    vec2 center = vec2(.2 + hash(cell + 11. + l) * .6, .2 + hash(cell + 23. + l) * .6);
    vec2 distance = (fract(p) - center) * resolution / grid;
    float radius = (.7 + l * .35) * resolution.y / 900.;
    float flake = 1. - smoothstep(radius * .1, radius * 1.8, length(distance));
    snow += flake * step(.86, seed) * (.17 + l * .07);
  }
  color = mix(color, vec3(.9,.95,1.), min(snow, .5) * motion);
  gl_FragColor = vec4(color, 1.);
}
`;

export function WinterScene({ season = 'winter' }: { season?: 'winter' | 'spring' | 'autumn' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hits = useRef<{ x: number; y: number; at: number }[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!canvas || !host || !gl) return; // CSS retains the intact scene as fallback.
    canvas.classList.remove('is-ready');
    const shaders: WebGLShader[] = [];
    const textures: WebGLTexture[] = [];
    let disposed = false;
    let ready = false;
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    let painted = 0;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const program = gl.createProgram();
    if (!program) return;

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) throw new Error('Shader allocation failed');
      shaders.push(shader);
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Shader compilation failed');
      return shader;
    }

    let buffer: WebGLBuffer | null = null;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, season === 'autumn' ? AUTUMN_FRAGMENT : season === 'spring' ? SPRING_FRAGMENT : FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    } catch (error) {
      console.warn('Winter animation unavailable; showing the still scene.', error);
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
      return;
    }

    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    const motion = gl.getUniformLocation(program, 'motion');
    const snowHits = gl.getUniformLocation(program, 'snowHits[0]');
    const hitUniforms = new Float32Array(12);

    function paint() {
      if (!ready || disposed) return;
      gl!.uniform2f(resolution, canvas!.width, canvas!.height);
      gl!.uniform1f(time, elapsed);
      gl!.uniform1f(motion, preference.matches ? 0 : 1);
      const now = performance.now();
      for (let i = 0; i < 4; i++) {
        const hit = hits.current[i];
        hitUniforms[i * 3] = hit?.x ?? 0;
        hitUniforms[i * 3 + 1] = hit?.y ?? 0;
        hitUniforms[i * 3 + 2] = hit ? (now - hit.at) / 1000 : -1;
      }
      gl!.uniform3fv(snowHits, hitUniforms);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      canvas!.classList.add('is-ready');
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.round(host!.clientWidth * dpr));
      canvas!.height = Math.max(1, Math.round(host!.clientHeight * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      paint();
    }

    function animate(now: number) {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (document.hidden || preference.matches) { previous = now; return; }
      if (now - painted < 32) return;
      elapsed += Math.min((now - (previous || now)) / 1000, .06);
      previous = painted = now;
      paint();
    }

    const folder = season;
    const images = [`/images/${folder}/scene.webp`, `/images/${folder}/motion-masks.png`, `/images/${folder}/${season === 'winter' ? 'ice-mask' : 'water-mask'}.png`].map(url => {
      const image = new Image();
      image.src = url;
      return image;
    });
    Promise.all(images.map(image => image.decode())).then(() => {
      if (disposed) return;
      images.forEach((image, index) => {
        const texture = gl.createTexture();
        if (!texture) return;
        textures.push(texture);
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(gl.getUniformLocation(program, ['scene','masks','iceMask'][index]), index);
      });
      ready = textures.length === 3;
      resize();
      frame = requestAnimationFrame(animate);
    }).catch(error => { if (!disposed) console.warn('Winter assets unavailable; keeping the still scene.', error); });

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    preference.addEventListener('change', paint);
    const lost = (event: Event) => {
      event.preventDefault();
      canvas.classList.remove('is-ready');
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener('change', paint);
      canvas.removeEventListener('webglcontextlost', lost);
      textures.forEach(texture => gl.deleteTexture(texture));
      shaders.forEach(shader => gl.deleteShader(shader));
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [season]);

  return <>
    <canvas ref={ref} className="winter-scene" aria-hidden="true" />
    {season === 'winter' && <WinterInteractions onSnowHit={(x, y) => {
      if (hits.current.length >= 4) hits.current.shift();
      hits.current.push({ x, y, at: performance.now() });
    }} />}
  </>;
}
