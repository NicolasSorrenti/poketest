'use strict';
// Neo Campus: optional independent, region-local rhythmic expansion.
// Reads normalized portrait coordinates; does not create DOM or drive time.
// The portrait deformer calls prepare once per region, then apply per pixel.
// Each region has independent inflateX/inflateY and inflatePhase values.
(function(root){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const number=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
 const smooth=(n)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
 function prepare(zone,beat,power=1){
  const x=number(zone.x,.5),y=number(zone.y,.5);
  const rx=clamp(number(zone.rx,.14),.005,.9);
  const ry=clamp(number(zone.ry,.10),.005,.9);
  // Positive factor makes the image look locally bigger, then returns to 0.
  const cycle=(1+Math.sin(2*beat+number(zone.inflatePhase,0)))*.5;
  const factor=cycle*clamp(number(power,1),0,5);
  return {
   x,y,rx,ry,
   expandX:clamp(number(zone.inflateX,0),0,.8)*factor,
   expandY:clamp(number(zone.inflateY,0),0,.8)*factor,
   phase:cycle
  };
 }
 // Writes normalized inverse-sample offsets into 'out'; no allocations per pixel.
 function apply(nx,ny,z,out){
  if(!z.expandX&&!z.expandY)return;
  const ux=(nx-z.x)/z.rx,uy=(ny-z.y)/z.ry;
  const radiusSquared=ux*ux+uy*uy;
  if(radiusSquared>=1)return;
  // The core expands naturally; the soft edge remains fixed (seam-free).
  const r=Math.sqrt(radiusSquared);
  const fade=1-smooth((r-.40)/.60);
  const w=fade*fade;
  out.dx+=(nx-z.x)*z.expandX*w;
  out.dy+=(ny-z.y)*z.expandY*w;
 }
 root.NeoRpgSpriteInflate=Object.freeze({version:1,prepare,apply});
})(window);
