import sharp from 'sharp';
import fs from 'node:fs/promises';

const dir = 'public/images/envelope';
const width = 1140;
const height = 1380;
// The fold runs through the white paper at y=590, not the bottom of the liner.
const hinge = 590;
const paths = {
  flap: `M76 ${hinge} L73 457 Q72 450 84 445 Q160 405 168 328 Q167 300 195 300 L231 300 Q252 300 262 275 C297 157 420 80 555 80 C691 78 820 153 853 278 Q861 309 891 309 L950 311 Q968 311 969 336 Q972 419 1036 447 Q1059 459 1060 480 L1055 ${hinge} Z`,
  back: `M76 ${hinge} L1055 ${hinge} L1068 658 L1057 1298 L57 1298 L47 650 L75 645 Z`,
  front: 'M47 649 L107 647 L205 847 L205 865 L916 870 L1024 658 L1068 657 L1057 1298 L57 1298 Z',
};
const source = await sharp(`${dir}/blank.png`).resize(width, height).ensureAlpha().png().toBuffer();
for (const [name, path] of Object.entries(paths)) {
  const mask = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="white"/></svg>`);
  let layer = await sharp(source).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  if (name === 'flap') {
    layer = await sharp(layer).extract({ left: 0, top: 0, width, height: hinge }).png().toBuffer();
    // Sample the actual closed lid, including the edge highlight and its
    // photographed shadow. Coordinates below are in the supplied 1141x1379
    // closed reference, cropped at its hinge (y=397). No generated texture.
    const closedOutline = 'M57 0 L1082 0 L1056 125 Q1053 137 1038 142 C994 155 977 197 961 248 Q958 270 939 273 L910 273 Q890 273 878 296 C820 416 714 487 570 487 C421 487 312 409 264 298 Q253 274 233 273 L199 273 Q179 271 176 250 C164 196 150 157 99 143 Q82 140 79 124 Z';
    const closedMask = Buffer.from(`<svg width="1141" height="560" xmlns="http://www.w3.org/2000/svg"><defs><filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter></defs><path d="${closedOutline}" fill="white" stroke="white" stroke-width="18" filter="url(#edge)"/><path d="${closedOutline}" fill="white"/></svg>`);
    const closedLid = await sharp(`${dir}/closed-reference.png`)
      .extract({ left: 0, top: 397, width: 1141, height: 560 })
      .ensureAlpha().composite([{ input: closedMask, blend: 'dest-in' }])
      .png().toBuffer();
    // Map the reference hinge endpoints x=57..1082 to x=76..1055.
    // Rear-face local coordinates already have the closed orientation;
    // CSS's two 180-degree rotations cancel when the lid is closed.
    const alignedLid = await sharp(closedLid).resize(1090, hinge, { fit: 'fill' }).png().toBuffer();
    const paper = await sharp({ create: { width, height: hinge, channels: 4, background: '#00000000' } })
      .composite([{ input: alignedLid, left: 22, top: 0 }]).png().toBuffer();
    await fs.writeFile(`${dir}/flap-outside-reference.png`, paper);
  }
  await fs.writeFile(`${dir}/${name}.png`, layer);
}
