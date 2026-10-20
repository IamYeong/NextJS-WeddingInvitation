import styles from "./FilmClip.module.css";

/** Decorative binder clip, kept separate from the printed photograph. */
export default function FilmClip() {
  return (
    <span className={styles.clip} aria-hidden="true">
      <span className={styles.handle} />
      <span className={styles.body} />
      <span className={styles.fold} />
    </span>
  );
}
