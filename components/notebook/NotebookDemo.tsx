import ScrollNotebook, { type NotebookPage } from "./ScrollNotebook";
import styles from "./NotebookDemo.module.css";

const captions = ["우리의 첫 페이지", "처음 만난 날", "함께 걷는 계절", "작은 순간들", "여름의 기억", "너와 나의 여행", "서로에게 쓰는 편지", "같은 곳을 바라보며", "앞으로의 날들", "새로운 시작"];

const pages: NotebookPage[] = captions.map((title, index) => ({
  id: `memory-${index + 1}`,
  label: title,
  elements: [
    { id: "number", type: "text", text: `CHAPTER ${String(index + 1).padStart(2, "0")}`,
      x: 6, y: 5, width: 85, fontSize: 15, color: "#87816e" },
    { id: "title", type: "text", text: title, x: 6, y: 19, width: 88,
      fontFamily: "'Nanum Pen Script', 'AppleMyungjo', 'Batang', cursive", fontSize: 36,
      rotation: -2, color: "#514c40" },
    { id: "body", type: "text", text: index === 9 ? "우리의 다음 이야기도\n함께 써 내려가요." : "평범한 하루가 특별해지는 건\n그 안에 네가 있기 때문이야.",
      x: 10, y: 45, width: 80, fontSize: 24, fontFamily: "'AppleMyungjo', 'Batang', serif", rotation: 1 },
    { id: "date", type: "text", text: `our story · ${index + 1}`, x: 62, y: 85, width: 30,
      fontFamily: "Georgia, serif", fontSize: 16, rotation: -4, color: "#82735f" },
  ],
}));

export default function NotebookDemo() {
  return <main className={styles.demo}>
    <h1 className={styles.title}>한 장씩, 우리의 이야기</h1>
    <ScrollNotebook pages={pages} />
  </main>;
}
