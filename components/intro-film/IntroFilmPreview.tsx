"use client";

import { useEffect, useState } from "react";
import IntroFilm from "./IntroFilm";
import styles from "./IntroFilmPreview.module.css";

export default function IntroFilmPreview() {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    return () => { if (src) URL.revokeObjectURL(src); };
  }, [src]);

  return (
    <section className={styles.preview}>
      <label className={styles.control}>
        인화 프레임에 넣을 사진 선택
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setSrc(URL.createObjectURL(file));
          }}
        />
        <span>선택한 사진은 서버에 업로드되지 않습니다.</span>
      </label>
      {src ? (
        <IntroFilm src={src} alt="선택한 사진의 흑백 인화 미리보기" caption="our little memories.." />
      ) : <p className={styles.empty}>사진을 선택하면 집게와 흑백 인화 프레임을 확인할 수 있어요.</p>}
    </section>
  );
}
