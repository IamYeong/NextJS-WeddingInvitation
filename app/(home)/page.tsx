import GuestLoginPanel from "@/components/auth/GuestLoginPanel";
import GuestComments from "@/components/comments/GuestComments";
import HomeIntro from "@/components/home/HomeIntro";
import NaverWeddingMap from "@/components/map/NaverWeddingMap";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <HomeIntro />
      <NaverWeddingMap />
      <GuestLoginPanel />
      <GuestComments />
    </main>
  );
}
