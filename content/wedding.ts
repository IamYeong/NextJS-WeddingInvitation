import { naverWeddingMapStrings } from "./strings";

// Confirmed ceremony date; names are loaded from Google Sheets.
const year = 2027;
const month = 1;
const day = 2;
const date = `${year}년 ${month}월 ${day}일 토요일 오후 2시`;
const { name: venue, floors } = naverWeddingMapStrings.venue;

export const wedding = {
  date, year, month, day, venue, floors,
  dateTime: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T14:00:00+09:00`,
  overview: {
    heading: "WE ARE GETTING MARRIED", date,
    venue: `${venue} · ${floors}`,
    message: "우리의 새로운 시작에 함께해 주세요.",
  },
} as const;

// Every source photo has exactly one section assignment, including TV frames.
export const weddingMedia = {
  hero: { src: "/images/wedding/garden-studio-portrait.webp", alt: "밝은 스튜디오의 초록 식물 사이에 나란히 선 두 사람" },
  story: [
    { src: "/images/wedding/hanok-rainy-stroll.webp", alt: "비에 젖은 한옥 골목에서 함께 선 두 사람" },
    { src: "/images/wedding/vintage-hall-promise.webp", alt: "고풍스러운 홀에서 부케를 들고 마주 선 두 사람" },
    { src: "/images/wedding/flower-table-together.webp", alt: "분홍 꽃이 가득한 테이블에서 함께한 두 사람" },
  ],
  television: {
    type: "video" as const,
    src: "/videos/wedding/our-little-channel.mp4",
    poster: "/images/wedding/sunlit-vintage-seat.webp",
    label: "햇살 속 의자, 창가의 포옹, 촬영 뒷모습을 담은 세 장의 사진 슬라이드쇼",
    autoPlay: true,
  },
  gallery: [
    { src: "/images/wedding/hand-in-hand.webp", alt: "노란 부케를 들고 손을 잡은 두 사람" },
    { src: "/images/wedding/bouquet-dance.webp", alt: "노란 부케를 함께 들고 춤추듯 마주한 두 사람" },
    null, null,
  ],
} satisfies {
  hero: { src: string; alt: string };
  story: { src: string; alt: string }[];
  television: { type: "video"; src: string; poster: string; label: string; autoPlay: boolean };
  gallery: [{ src: string; alt: string } | null, { src: string; alt: string } | null, { src: string; alt: string } | null, { src: string; alt: string } | null];
};
