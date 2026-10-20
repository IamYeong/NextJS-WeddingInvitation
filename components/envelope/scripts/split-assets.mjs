import sharp from 'sharp';
import fs from 'node:fs';
const dir = 'public/images/envelope';
const paths = {
 flap: 'M76 600 L73 457 Q72 450 84 445 Q160 405 168 328 Q167 300 195 300 L231 300 Q252 300 262 275 C297 157 420 80 555 80 C691 78 820 153 853 278 Q861 309 891 309 L950 311 Q968 311 969 336 Q972 419 1036 447 Q1059 459 1060 480 L1055 600 Z',
 back: 'M76 594 L1055 594 L1068 658 L1057 1298 L57 1298 L47 650 L75 645 Z',
 front: 'M47 649 L107 647 L205 847 L205 865 L974 870 L1011 658 L1068 657 L1057 1298 L57 1298 Z',
};
(async () => {
for (const [name,path] of Object.entries(paths)) {
 const mask = Buffer.from(`<svg width="1140" height="1380" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="white"/></svg>`);
 let buffer = await sharp(`${dir}/blank.png`).resize(1140,1380).ensureAlpha().composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
 if(name === 'flap') buffer = await sharp(buffer).extract({left:0,top:0,width:1140,height:600}).png().toBuffer();
 fs.writeFileSync(`${dir}/${name}.png`,buffer);
}
})();
