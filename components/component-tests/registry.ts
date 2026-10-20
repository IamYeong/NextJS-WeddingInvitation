import EnvelopeDemo from "@/components/envelope/EnvelopeDemo";
import NotebookDemo from "@/components/notebook/NotebookDemo";
import AnalogTVTest from "@/components/analog-tv/AnalogTVTest";
import IntroFilmPreview from "@/components/intro-film/IntroFilmPreview";
import PhotoPrinterDemo from "@/components/photo-printer/PhotoPrinterDemo";
import Guestbook from "@/components/guestbook/Guestbook";
import type { ComponentType } from "react";
import GuestLoginPanel from "@/components/auth/GuestLoginPanel";
import GuestComments from "@/components/comments/GuestComments";
import HomeIntro from "@/components/home/HomeIntro";
import NaverWeddingMap from "@/components/map/NaverWeddingMap";

type ComponentTest = {
  slug: string;
  name: string;
  description: string;
  component: ComponentType;
};

export const componentTests: ComponentTest[] = [
  {
    slug: "envelope",
    name: "열리는 청첩장 봉투",
    description: "봉투를 열고 직사각형 초대장의 결혼 개요를 편집합니다.",
    component: EnvelopeDemo,
  },
  {
    slug: "notebook",
    name: "세로로 넘기는 노트",
    description: "스크롤과 터치로 넘기는 10페이지 노트입니다.",
    component: NotebookDemo,
  },
  {
    slug: "analog-tv",
    name: "아날로그 TV",
    description: "Figma TV에 사진·영상을 넣고 지직거림 효과를 확인합니다.",
    component: AnalogTVTest,
  },
  {
    slug: "intro-film",
    name: "인트로 필름 사진",
    description: "사진을 선택해 집게와 흑백 인화 프레임을 확인합니다.",
    component: IntroFilmPreview,
  },
  {
    slug: "photo-printer",
    name: "네컷 사진 인화기",
    description: "사진 네 장을 교체하고 출구에서 인화되는 애니메이션을 확인합니다.",
    component: PhotoPrinterDemo,
  },
  {
    slug: "guestbook",
    name: "방명록",
    description: "축하 카드 선택, 소셜 로그인 후 작성, 방명록 목록을 확인합니다.",
    component: Guestbook,
  },
  {
    slug: "home-intro",
    name: "초대 문구",
    description: "청첩장의 첫 인사말을 확인합니다.",
    component: HomeIntro,
  },
  {
    slug: "wedding-map",
    name: "오시는 길",
    description: "예식장 지도와 길찾기 버튼을 확인합니다.",
    component: NaverWeddingMap,
  },
  {
    slug: "guest-login",
    name: "하객 로그인",
    description: "소셜 로그인과 익명 로그인 화면을 확인합니다.",
    component: GuestLoginPanel,
  },
  {
    slug: "guest-comments",
    name: "방명록 (기존)",
    description: "현재 방명록의 목록과 작성 폼을 확인합니다.",
    component: GuestComments,
  },
];
