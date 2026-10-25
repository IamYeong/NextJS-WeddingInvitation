import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

// Three TV-only photos: four seconds per image, one-second carousel slides.
const photos = ['sunlit-vintage-seat', 'quiet-window-embrace', 'behind-the-scenes-sofa'];
const filters = photos.map((_, i) => `[${i}:v]scale=768:600:force_original_aspect_ratio=decrease,pad=768:600:(ow-iw)/2:(oh-ih)/2:color=0xe4dfd5,setsar=1,fps=25,format=yuv420p,settb=AVTB[v${i}]`);
filters.push('[v0][v1]xfade=transition=slideleft:duration=1:offset=3[two]');
filters.push('[two][v2]xfade=transition=slideleft:duration=1:offset=6[out]');
mkdirSync('public/videos/wedding', { recursive: true });
execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  ...photos.flatMap(name => ['-loop', '1', '-t', '4', '-i', `public/images/wedding/${name}.webp`]),
  '-filter_complex', filters.join(';'), '-map', '[out]', '-t', '10',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', '-an', 'public/videos/wedding/our-little-channel.mp4',
], { stdio: 'inherit' });
