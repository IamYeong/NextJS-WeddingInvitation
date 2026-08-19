import NaverWeddingMap from "@/components/map/NaverWeddingMap";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <p>고라니~~~</p>
      </section>

      <NaverWeddingMap />
    </main>
  );
}
