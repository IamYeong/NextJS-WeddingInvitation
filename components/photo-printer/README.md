# PhotoPrinter

Preview: `/test/photo-printer`. The demo accepts exactly four local images; nothing is uploaded.

```tsx
<PhotoPrinter
  photos={[
    { src: '/photos/1.jpg', alt: 'First memory' },
    { src: '/photos/2.jpg', alt: 'Second memory', objectPosition: '50% 30%' },
    { src: '/photos/3.jpg', alt: 'Third memory' },
    { src: '/photos/4.jpg', alt: 'Fourth memory' },
  ]}
  caption="OUR FOUR MOMENTS"
/>
```

The paper prints once when it enters the viewport. Changing photos prints again; the replay button repeats the animation. Reduced motion displays the finished frame immediately. The fixed 2×2 layout follows Figma image 18 (`21:66`, file `LHHmUQPy7B6zp5P0qe1nOJ`).

## Assets

All files are under `public/images/photo-printer/`:

- `reference.png`: original Figma raster, retained unchanged. Demo portraits are cropped using CSS only.
- `outlet.png`: transparent outlet cutout; missing black interior reconstructed.
- `background.png`: clean gray metal background with the original foreground objects removed.

The separated assets were edited using the built-in ImageGen tool. They preserve the reference appearance but reconstructed regions are generated rather than pixel-identical extractions.

Final outlet prompt: “Use case: background-extraction. Extract ONLY the horizontal rounded silver photo dispenser outlet from the input image as a precise transparent PNG cutout. Keep the original metallic bezel, black interior opening, exact shape and photographic texture. Remove the printed photo sheet completely and reconstruct the black interior behind it. Remove all surrounding gray wall and the sign above. Crop tightly around the full silver rounded bezel, horizontal aspect ratio approximately 3.6:1. No shadow outside the bezel, no text, no new details. This is a layered web animation asset.”

Final background prompt: “Use case: precise-object-edit. Create the clean background plate for a layered photo dispenser web animation. From the reference preserve ONLY the neutral gray finely textured metallic wall. Remove the sign, the entire silver outlet, and the entire photo sheet. Seamlessly fill all removed areas with the same gray metal texture and subtle original lighting. Square image of uninterrupted original gray wall texture. No objects, no text, no gradients added.”

Validation: ESLint passed; preview route returned HTTP 200 and the rendered outlet, frame, and four portraits were visually inspected in Chrome. TypeScript checking is blocked by the pre-existing `typeDetailedHTMLProps` typo at `node_modules/@types/react/index.d.ts:2267`.
