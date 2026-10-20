/* Native images support local blob previews as well as public media. */
/* eslint-disable @next/next/no-img-element */
import styles from "./AnalogTV.module.css";

export type TVMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string; label: string };

export default function AnalogTV({ media, effects = true }: { media?: TVMedia; effects?: boolean }) {
  return (
    <div className={`${styles.tv} ${effects ? styles.effects : ""}`}>
      <div className={styles.screen}>
        {media?.type === "image" && <img className={styles.media} src={media.src} alt={media.alt} />}
        {media?.type === "video" && (
          <video key={media.src} className={styles.media} src={media.src} poster={media.poster}
            aria-label={media.label} controls playsInline loop muted preload="metadata" />
        )}
        {!media && <div className={styles.testCard} role="img" aria-label="TV 컬러 테스트 화면"><span>OUR STORY<br />조금 오래된, 우리만의 채널</span></div>}
        <div className={styles.texture} aria-hidden="true" />
        <div className={styles.glass} aria-hidden="true" />
      </div>
      <img className={styles.frame} src="/images/analog-tv/frame.png" alt="빈티지 실버 스탠드 TV" width={1124} height={1399} />
    </div>
  );
}
