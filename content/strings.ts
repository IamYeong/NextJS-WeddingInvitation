export const naverWeddingMapStrings = {
  mapScriptId: "naver-map-script",
  naverMapKeyId: "4imwgi7lfb",
  appName: "wedding-invitation",
  venue: {
    name: "송파문정 더 컨벤션",
    address: "서울 송파구 송파대로 155",
    phone: "02-6418-5000",
    roadAddress: "서울 송파구 송파대로 155 NH송파농협",
    floors: "11~13층",
    lotAddress: "서울 송파구 문정동 651-8",
    nearby: "8호선 문정역 3번 출구에서 214m",
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
    navigationToggle: "길찾기 앱 선택",
    navigationClose: "길찾기 앱 선택 닫기",
    locationDetails: "상세 위치 및 연락처",
  },
  status: {
    loading: "지도를 불러오는 중입니다.",
    error: "지도 로드에 실패했습니다. 허용 도메인과 ncpKeyId 설정을 확인해주세요.",
  },
  buttons: {
    naver: "네이버지도",
    kakao: "카카오맵",
    tmap: "티맵",
  },
  alerts: {
    tmapMobileOnly:
      "티맵 길안내는 Android/iOS 티맵 앱에서만 사용할 수 있습니다.",
    tmapInstallConfirm:
      "티맵 앱이 설치되어 있지 않다면 앱 설치 페이지로 이동할까요?",
  },
} as const;
