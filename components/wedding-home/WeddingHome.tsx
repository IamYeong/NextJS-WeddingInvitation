"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WeddingEnvelope from "@/components/envelope/WeddingEnvelope";
import IntroFilm from "@/components/intro-film/IntroFilm";
import ScrollNotebook, { type NotebookPage } from "@/components/notebook/ScrollNotebook";
import AnalogTV from "@/components/analog-tv/AnalogTV";
import PhotoPrinter from "@/components/photo-printer/PhotoPrinter";
import NaverWeddingMap from "@/components/map/NaverWeddingMap";
import FamilyAccounts from "@/components/family-accounts/FamilyAccounts";
import Guestbook from "@/components/guestbook/Guestbook";
import { wedding, weddingPhotos } from "@/content/wedding";
import styles from "./WeddingHome.module.css";

const chapters = [
  { title: "처음, 우리", body: "우연히 마주친 하루가\n우리 이야기의 첫 장이 되었습니다." },
  { title: "함께한 계절", body: "함께 걷고, 웃고, 여행하며\n서로의 가장 편안한 일상이 되었습니다." },
  { title: "그리고, 평생", body: "이제는 같은 방향을 바라보며\n우리의 다음 페이지를 함께 써 내려갑니다." },
];
const pages: NotebookPage[] = chapters.map((chapter, i) => ({
  id: `chapter-${i}`, label: chapter.title,
  elements: [
    { id: "chapter", type: "text", text: `CHAPTER 0${i + 1}`, x: 10, y: 7, width: 80, fontSize: 15, color: "#798471" },
    { id: "title", type: "text", text: chapter.title, x: 10, y: 17, width: 80, fontSize: 34, fontFamily: "'Batang', serif" },
    { id: "photo", type: "image", ...weddingPhotos[i], x: 14, y: 35, width: 72, height: 36, rotation: i === 1 ? 3 : -3 },
    { id: "body", type: "text", text: chapter.body, x: 10, y: 77, width: 80, fontSize: 19, textAlign: "center", lineHeight: 1.8 },
  ],
}));
const firstWeekday = new Date(Date.UTC(wedding.year, wedding.month - 1, 1)).getUTCDay();
const dayCount = new Date(Date.UTC(wedding.year, wedding.month, 0)).getUTCDate();

function WeddingCalendar() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const [year, month, day] = today.split("-").map(Number);
      setDays(Math.ceil((Date.UTC(wedding.year, wedding.month - 1, wedding.day) - Date.UTC(year, month - 1, day)) / 86400000));
    };
    const timer = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); };
  }, []);
  return <section className={styles.section} aria-labelledby="date-heading">
    <p className={styles.eyebrow}>SAVE THE DATE</p>
    <h2 id="date-heading">저희의 약속이 시작되는 날</h2>
    <time dateTime={wedding.dateTime} className={styles.date}>{wedding.date}</time>
    <p className={styles.month}>2027. 05</p>
    <table className={styles.calendar} aria-label="2027년 5월 예식 달력">
      <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
      <tbody>{Array.from({ length: Math.ceil((firstWeekday + dayCount) / 7) }, (_, week) => <tr key={week}>
        {Array.from({ length: 7 }, (_, day) => {
          const date = week * 7 + day - firstWeekday + 1;
          return <td key={day}>{date > 0 && date <= dayCount && <span className={date === wedding.day ? styles.weddingDay : undefined} aria-label={date === wedding.day ? `${date}일, 결혼식` : undefined}>{date}</span>}</td>;
        })}
      </tr>)}</tbody>
    </table>
    <p className={styles.countdown} aria-live="off">{days === null ? "두 사람의 소중한 약속" : days > 0 ? <>두 사람의 결혼식이 <strong>{days}일</strong> 남았습니다.</> : days === 0 ? "오늘, 저희 결혼합니다." : "함께해 주신 소중한 마음을 간직하겠습니다."}</p>
  </section>;
}

export default function WeddingHome() {
  const [entered, setEntered] = useState(false);
  const [opening, setOpening] = useState(0);
  const entrance = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reveal = useCallback(() => setEntered(true), []);

  useEffect(() => {
    if (entered) { heading.current?.focus({ preventScroll: true }); return; }
    window.scrollTo({ top: 0, behavior: "instant" });
    entrance.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [entered]);

  return <>
    <div ref={entrance} className={styles.entrance} data-entered={entered} aria-hidden={entered} inert={entered}>
      <div className={styles.entranceCopy}><p className={styles.eyebrow}>A LETTER FOR YOU</p><p>소중한 당신께 전하는 편지</p></div>
      <WeddingEnvelope key={opening} overview={wedding.overview} introduction onOpened={reveal} />
      <p className={styles.touchHint}>봉투를 터치해 열어주세요<span aria-hidden="true">↓</span></p>
    </div>
    <div hidden={!entered} className={styles.letter}>
      <section className={`${styles.section} ${styles.hero}`} aria-labelledby="wedding-heading">
        <p className={styles.eyebrow}>THE BEGINNING OF OUR FOREVER</p>
        <h1 id="wedding-heading" ref={heading} tabIndex={-1}>우리, 결혼합니다.</h1>
        <IntroFilm src={weddingPhotos[0].src} alt={weddingPhotos[0].alt} caption="a little moment, a lifetime together" className={styles.film} />
        <p className={styles.names}>{wedding.bride}<span>&</span>{wedding.groom}</p>
        <time dateTime={wedding.dateTime}>{wedding.date}</time>
        <p className={styles.venue}>{wedding.venue} · {wedding.floors}</p>
        <a className={styles.scrollHint} href="#wedding-details">아래로 천천히 읽어주세요<span aria-hidden="true">↓</span></a>
      </section>
      <div id="wedding-details"><WeddingCalendar /></div>
      <section className={styles.section} aria-labelledby="story-heading">
        <p className={styles.eyebrow}>OUR LITTLE STORY</p><h2 id="story-heading">한 장씩, 우리의 이야기</h2>
        <p className={styles.description}>우연히 만난 우리가,<br />서로의 일상이 되기까지.</p>
        <ScrollNotebook pages={pages} />
      </section>
      <section className={styles.section} aria-labelledby="tv-heading">
        <p className={styles.eyebrow}>OUR LITTLE CHANNEL</p>
        <h2 id="tv-heading">함께한 순간을 재생합니다</h2>
        <p className={styles.description}>오래 꺼내 보고 싶은 기억들,<br />우리만의 채널에 담았습니다.</p>
        <AnalogTV media={{ type: "image", ...weddingPhotos[1] }} />
      </section>
      <section className={styles.section} aria-labelledby="gallery-heading">
        <p className={styles.eyebrow}>MOMENTS TO KEEP</p><h2 id="gallery-heading">함께라서 더 좋았던 순간들</h2>
        <p className={styles.description}>사진에 담긴 우리의 작은 행복을 꺼내봅니다.<br />사진을 누르면 크게 보실 수 있어요.</p>
        {entered && <PhotoPrinter photos={weddingPhotos} caption="OUR FOUR LITTLE MOMENTS" onPhotoClick={index => { setPhoto(index); dialog.current?.showModal(); }} />}
      </section>
      <div className={styles.embedded}>{entered && <NaverWeddingMap />}</div>
      <aside className={styles.travelNote} aria-label="예식장 이용 안내"><p>귀한 걸음, 편히 오실 수 있도록</p><p>문정역 3번 출구에서 도보로 오실 수 있습니다.<br />주차와 식사에 관한 자세한 안내는 추후 전해드리겠습니다.</p></aside>
      <div className={styles.embedded}>{entered && <FamilyAccounts />}</div>
      <div className={styles.embedded}>
        <p className={styles.guestbookIntro}>저희의 첫 페이지에 따뜻한 한마디를 남겨주세요.<br />오래도록 소중히 간직하겠습니다.</p>
        {entered && <Guestbook />}
      </div>
      <div className={styles.reopenArea}>
        <button type="button" className={styles.reopen} onClick={() => {
          setOpening(value => value + 1);
          setEntered(false);
        }}>다시 열어보기</button>
      </div>
    </div>
    <dialog ref={dialog} className={styles.lightbox} aria-label={`예시 사진 ${photo + 1} 크게 보기`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button className={styles.closePhoto} onClick={() => dialog.current?.close()} aria-label="사진 닫기">닫기 ×</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={weddingPhotos[photo].src} alt={weddingPhotos[photo].alt} />
      <div className={styles.photoNavigation}><button onClick={() => setPhoto((photo + 3) % 4)} aria-label="이전 사진">←</button><span>{photo + 1} / 4</span><button onClick={() => setPhoto((photo + 1) % 4)} aria-label="다음 사진">→</button></div>
    </dialog>
  </>;
}
