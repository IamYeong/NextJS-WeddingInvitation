# Analog TV

Preview: `/test/analog-tv` (also listed under `/test`). Select a local photo or video; files stay in the browser. Videos use native playback controls and start muted. Toggle the analog texture with the checkbox. Animated textures stop for `prefers-reduced-motion`.

```tsx
<AnalogTV media={{ type: "image", src: "/photos/us.jpg", alt: "우리 사진" }} />
<AnalogTV media={{ type: "video", src: "/videos/us.mp4", label: "우리 영상" }} effects />
```

Assets: `public/images/analog-tv/source.png` is the downloaded Figma image 33 (`26:123`, file `LHHmUQPy7B6zp5P0qe1nOJ`). `frame.png` is a transparent derivative made with the built-in imagegen tool. Image generation changed the framing slightly; the component's aperture coordinates match the derivative, not the original image. CSS clips remaining outer extraction artifacts.

Edit prompt: “Preserve the TV enclosure, bezel, buttons, pedestal and feet; remove the room/wall/floor and all interior display pixels to true transparency, leaving a transparent screen aperture.” Cleanup prompt: “Remove only stray detached speckles and background halo; keep the TV and transparent aperture unchanged.”
