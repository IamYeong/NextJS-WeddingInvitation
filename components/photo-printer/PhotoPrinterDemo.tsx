"use client";

import { useEffect, useRef, useState } from "react";
import PhotoPrinter, { type PrinterPhoto } from "./PhotoPrinter";
import styles from "./PhotoPrinterDemo.module.css";

type FourPhotos = [PrinterPhoto, PrinterPhoto, PrinterPhoto, PrinterPhoto];
const samples: FourPhotos = [0, 1, 2, 3].map((index) => ({
  src: "/images/photo-printer/reference.png",
  alt: `Figma 원본의 ${index + 1}번째 인물 사진`,
})) as FourPhotos;

export default function PhotoPrinterDemo() {
  const [photos, setPhotos] = useState<FourPhotos>(samples);
  const [error, setError] = useState("");
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <span>FOUR MOMENTS, ONE MEMORY</span>
        <h1>우리의 네 순간</h1>
        <p>사진 한 장씩, 소중한 순간을 꺼내보세요.</p>
      </header>
      <div className={photos === samples ? styles.samples : undefined}>
        <PhotoPrinter key={photos.map((photo) => photo.src).join()} photos={photos} />
      </div>
      <div className={styles.editor}>
        <label htmlFor="printer-photos">네 장의 사진 선택</label>
        <input id="printer-photos" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (!files.length) return;
          if (files.length !== 4 || files.some((file) => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type))) {
            setError("JPG, PNG, WebP, AVIF 사진을 정확히 네 장 선택해주세요.");
            event.target.value = "";
            return;
          }
          urls.current.forEach(URL.revokeObjectURL);
          urls.current = files.map((file) => URL.createObjectURL(file));
          setPhotos(files.map((file, index) => ({ src: urls.current[index], alt: file.name })) as FourPhotos);
          setError("");
          event.target.value = "";
        }} aria-describedby="printer-help" />
        <p id="printer-help">선택 순서대로 왼쪽 위부터 배치됩니다. 사진은 서버로 전송되지 않습니다.</p>
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={() => {
          setPhotos(samples);
          urls.current.forEach(URL.revokeObjectURL);
          urls.current = [];
          setError("");
        }}>원본 사진으로 보기</button>
      </div>
    </section>
  );
}
