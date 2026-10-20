"use client";

import { useEffect, useState } from "react";
import AnalogTV, { type TVMedia } from "./AnalogTV";
import styles from "./AnalogTVTest.module.css";

export default function AnalogTVTest() {
  const [media, setMedia] = useState<TVMedia>();
  const [effects, setEffects] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => () => { if (media) URL.revokeObjectURL(media.src); }, [media]);

  return (
    <main className={styles.page}>
      <header><p className={styles.eyebrow}>OUR LITTLE CHANNEL</p><h1>우리의 아날로그 TV</h1><p>사진 한 장, 영상 한 편으로 채우는 우리 이야기.</p></header>
      <div className={styles.stage}><AnalogTV media={media} effects={effects} /></div>
      <div className={styles.controls}>
        <label className={styles.upload}>사진 · 영상 선택
          <input type="file" accept="image/*,video/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) { setError("사진 또는 영상 파일을 선택해주세요."); return; }
            const src = URL.createObjectURL(file);
            setMedia(file.type.startsWith("video/") ? { type: "video", src, label: file.name } : { type: "image", src, alt: file.name });
            setError(""); event.target.value = "";
          }} />
        </label>
        <label className={styles.toggle}><input type="checkbox" checked={effects} onChange={(event) => setEffects(event.target.checked)} /> 지직거림 효과</label>
        {media && <button type="button" onClick={() => setMedia(undefined)}>테스트 화면으로</button>}
      </div>
      <p className={styles.note}>선택한 파일은 이 브라우저에서만 미리 봅니다. 영상은 화면의 재생 버튼을 눌러주세요.</p>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
