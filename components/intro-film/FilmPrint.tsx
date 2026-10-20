import Image, { type ImageProps } from "next/image";
import styles from "./FilmPrint.module.css";

export type FilmPrintProps = {
  src: ImageProps["src"];
  alt: string;
  objectPosition?: string;
  preload?: boolean;
};

export default function FilmPrint({
  src,
  alt,
  objectPosition = "center",
  preload = false,
}: FilmPrintProps) {
  return (
    <div className={styles.print}>
      <div className={styles.exposure}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 390px) 68vw, 264px"
          preload={preload}
          className={styles.photo}
          style={{ objectPosition }}
        />
      </div>
    </div>
  );
}
