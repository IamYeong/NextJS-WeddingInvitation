import { naverWeddingMapStrings } from "./strings";

// Example couple and date. Keep envelope, calendar and hero details together.
const groom = "도윤";
const bride = "서연";
const year = 2027;
const month = 5;
const day = 22;
const names = `${bride} & ${groom}`;
const date = `${year}년 ${month}월 ${day}일 토요일 오후 2시`;
const { name: venue, floors } = naverWeddingMapStrings.venue;

export const wedding = {
  groom, bride, names, date, year, month, day, venue, floors,
  dateTime: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T14:00:00+09:00`,
  overview: {
    heading: "WE ARE GETTING MARRIED", names, date,
    venue: `${venue} · ${floors}`,
    message: "우리의 새로운 시작에 함께해 주세요.",
  },
} as const;

export const weddingPhotos = [1, 2, 3, 4].map((number) => ({
  src: `/images/wedding/sample-${number}.jpg`,
  alt: `우리의 순간을 담은 예시 사진 ${number}`,
})) as [
  { src: string; alt: string }, { src: string; alt: string },
  { src: string; alt: string }, { src: string; alt: string },
];
