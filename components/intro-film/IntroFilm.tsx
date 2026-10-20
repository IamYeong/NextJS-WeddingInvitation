import FilmClip from "./FilmClip";
import FilmPrint, { type FilmPrintProps } from "./FilmPrint";
import styles from "./IntroFilm.module.css";

export type IntroFilmProps = FilmPrintProps & {
  caption?: string;
  className?: string;
};

export default function IntroFilm({
  caption,
  className,
  ...photo
}: IntroFilmProps) {
  return (
    <figure className={[styles.intro, className].filter(Boolean).join(" ")}>
      <div className={styles.composition}>
        <FilmPrint {...photo} />
        <div className={styles.clip}><FilmClip /></div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
