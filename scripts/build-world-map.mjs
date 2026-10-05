// Genera design-system/map/world-dots.svg (mapa de puntos para la sección Nosotros).
// Requiere: npm i world-atlas topojson-client d3-geo (en una carpeta temporal) y copiar este archivo ahí; imprime las posiciones (%) de los pines.
import fs from 'fs';
import { feature } from 'topojson-client';
import { geoContains, geoEquirectangular } from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json','utf8'));
const land = feature(topo, topo.objects.land);
const LON0=-170, LON1=180, LAT1=78, LAT0=-58, STEP=2.6;
const W = Math.round((LON1-LON0)/STEP), H = Math.round((LAT1-LAT0)/STEP);
const cell = 8; // px por punto en el viewBox
let dots=[];
for (let j=0;j<=H;j++) for (let i=0;i<=W;i++){
  const lon=LON0+i*STEP, lat=LAT1-j*STEP;
  if (geoContains(land,[lon,lat])) dots.push([i*cell+cell/2, j*cell+cell/2]);
}
const vw=(W+1)*cell, vh=(H+1)*cell;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" aria-hidden="true">`+`<path stroke="currentColor" stroke-width="4.6" stroke-linecap="round" fill="none" d="`+dots.map(d=>`M${d[0]} ${d[1]}h0`).join('')+`"/>`+`</svg>`;
fs.mkdirSync('/home/user/wow-landing/design-system/map',{recursive:true});
fs.writeFileSync('/home/user/wow-landing/design-system/map/world-dots.svg',svg);
const pos=(lat,lon)=>({x:((lon-LON0)/STEP*cell+cell/2)/vw*100, y:((LAT1-lat)/STEP*cell+cell/2)/vh*100});
console.log('dots',dots.length,'size',svg.length,'viewBox',vw,vh,'ratio',(vw/vh).toFixed(3));
console.log('Colombia',pos(4.6,-74.1),'Costa Rica',pos(9.9,-84.1),'Australia',pos(-25.3,133.8));
