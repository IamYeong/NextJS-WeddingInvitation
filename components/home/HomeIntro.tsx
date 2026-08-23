import { homeIntroStrings } from "@/content/strings";
import styles from "./HomeIntro.module.css";

export default function HomeIntro() {
  return (
    <section className={styles.intro}>
      <p>{homeIntroStrings.intro}</p>
    </section>
  );
}
