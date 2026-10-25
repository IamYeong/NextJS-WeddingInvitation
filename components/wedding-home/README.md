# WeddingHome

봉투를 열면 편지지가 전체 화면으로 펼쳐지고 본문을 읽을 수 있습니다. 마지막 ‘다시 열어보기’는 봉투 상태와 스크롤 위치를 초기화합니다.

## 사진 배치

원본 JPG는 이름을 변경해 복사했고 화면에는 방향 보정·최대 1800px WebP를 사용합니다. 다른 섹션 사이에 같은 사진을 재사용하지 않습니다.

| 원본 | 파일 이름 | 배치 |
| --- | --- | --- |
| IMG_7153.JPG | hanok-rainy-stroll | 이야기 1 — 한옥 골목 |
| IMG_7154.JPG | vintage-hall-promise | 이야기 2 — 고풍스러운 홀 |
| IMG_7155.JPG | sunlit-vintage-seat | TV 1 — 햇살 속 빈티지 의자 |
| IMG_7156.JPG | flower-table-together | 이야기 3 — 꽃 테이블 |
| IMG_7157.JPG | garden-studio-portrait | 대표 사진 — 밝은 스튜디오 |
| IMG_7158.JPG | quiet-window-embrace | TV 2 — 창가의 포옹 |
| IMG_7159.JPG | hand-in-hand | 인화기 1 — 손잡은 두 사람 |
| IMG_7160.JPG | bouquet-dance | 인화기 2 — 부케와 춤 |
| IMG_7161.JPG | behind-the-scenes-sofa | TV 3 — 촬영 뒷모습 |

인화기 나머지 두 칸은 빈칸입니다. 확대 보기는 실제 배치한 두 사진만 순회합니다. 이전 데모의 sample 이미지들은 메인 화면에서 사용하지 않습니다.

## TV 영상

`node components/wedding-home/scripts/render-tv-slideshow.mjs` (FFmpeg 필요)

3장의 사진을 1초 슬라이드 전환으로 잇는 10초, 768×600 H.264 MP4입니다. 원본을 자르지 않고 여백을 넣어 인물과 드레스를 보존합니다. 화면에 보일 때만 무음 반복 재생하며, 모션 감소 설정에서는 포스터와 수동 재생 버튼을 제공합니다.

## 이름

`server/wedding/getWeddingCouple.ts`가 기존 가족정보 구글시트 저장소에서 신랑·신부 역할의 이름만 추출합니다. 부모님·계좌 정보는 홈 클라이언트에 전달하지 않습니다. 요청마다 조회하고 메타데이터와 본문은 요청 내에서 결과를 공유합니다.

- 봉투: 이름만 (`givenName`, 세 글자 성명의 첫 글자를 제외)
- 대표 화면과 페이지 제목: 성명 (`fullName`)
- 시트 조회 실패·누락: 가상의 이름을 쓰지 않고 ‘신랑’, ‘신부’로 표시

날짜와 예식 정보는 `content/wedding.ts`에 있으며 예식일은 2027년 1월 2일 토요일 오후 2시(한국 시간)입니다.
