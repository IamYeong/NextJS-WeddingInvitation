export const homeIntroStrings = {
  intro: "고라니~~~",
} as const;

export const guestLoginPanelStrings = {
  title: "방명록 로그인",
  errors: {
    fetchCurrentGuest: "로그인 정보를 확인하지 못했습니다.",
    anonymousLogin: "비회원 로그인에 실패했습니다.",
  },
  buttons: {
    kakao: "카카오 로그인",
    naver: "네이버 로그인",
    google: "구글 로그인",
    anonymous: "비회원 로그인",
  },
  status: {
    loading: "로그인 정보를 확인하는 중입니다.",
    error: "로그인 정보를 확인하지 못했습니다.",
    idle: "아직 로그인하지 않았습니다.",
    loggedIn: (nickname: string) => `${nickname} 님으로 로그인되었습니다.`,
  },
} as const;

export const naverWeddingMapStrings = {
  mapScriptId: "naver-map-script",
  naverMapKeyId: "4imwgi7lfb",
  appName: "wedding-invitation",
  venue: {
    name: "송파문정 더 컨벤션",
    address: "서울 송파구 송파대로 155",
    lat: 37.484140411747,
    lng: 127.1228704328,
  },
  stores: {
    naverIos: "https://apps.apple.com/kr/app/id311867728",
    tmapAndroidPackage: "com.skt.tmap.ku",
    tmapAndroid:
      "https://play.google.com/store/apps/details?id=com.skt.tmap.ku",
    tmapIos: "https://apps.apple.com/kr/app/id431589174",
  },
  labels: {
    section: "오시는 길",
    actions: "지도 앱 길안내",
  },
  status: {
    loading: "지도를 불러오는 중입니다.",
    error: "지도 로드에 실패했습니다. 허용 도메인과 ncpKeyId 설정을 확인해주세요.",
  },
  buttons: {
    naver: "네이버지도 내비게이션",
    kakao: "카카오맵 길찾기",
    tmap: "티맵으로 가기",
  },
  alerts: {
    tmapMobileOnly:
      "티맵 길안내는 Android/iOS 티맵 앱에서만 사용할 수 있습니다.",
    tmapInstallConfirm:
      "티맵 앱이 설치되어 있지 않다면 앱 설치 페이지로 이동할까요?",
  },
} as const;
