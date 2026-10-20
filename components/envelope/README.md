# WeddingEnvelope

테스트 화면: `/test/envelope` (`/test` 목록에도 등록).

```tsx
import WeddingEnvelope from '@/components/envelope/WeddingEnvelope';

<WeddingEnvelope overview={{
  heading: 'WE ARE GETTING MARRIED',
  names: '서연 & 도윤',
  date: '2027년 5월 22일 토요일 오후 2시',
  venue: '그린가든 웨딩홀 · 2층 가든홀',
  message: '우리의 새로운 시작에 함께해 주세요.',
}} />
```

`defaultOpen`으로 초기 상태를, `open`과 `onOpenChange`로 외부 제어 상태를 지정할 수 있습니다. 초대장은 재단되지 않은 직사각형 HTML 카드이며 모든 문구는 props로 전달합니다. 테스트 편집기는 화면 내 상태만 수정하며 저장하지 않습니다. 키보드 버튼 조작, 펼침 상태 안내, 모션 감소 설정을 지원합니다.

## 이미지

원본: https://www.figma.com/design/LHHmUQPy7B6zp5P0qe1nOJ/ranio?node-id=25-119

`public/images/envelope/reference.png`: Figma 원본.
`blank.png`: built-in imagegen으로 원본 문구를 제거한 소스.
`flap.png`: 경첩을 기준으로 회전하는 독립 덮개 이미지.
`back.png`: 녹색 안감이 있는 뒷면.
`front.png`: 초대장을 가리는 흰색 앞면과 양옆 접힘.

원본은 한 장의 사진이므로 문구 제거본은 AI 편집본이며 원본과 픽셀이 동일하지 않습니다. 덮개 바깥면은 분리 이미지의 알파 마스크와 종이색 그라디언트로 구성합니다.

이미지 편집 프롬프트 (built-in imagegen):

> Use case: precise-object-edit. Edit this exact reference photograph as a source asset for an animated wedding envelope. Remove ALL lettering everywhere (black calligraphy on green flap, small black letters on green center, black text at bottom white pocket). Inpaint with identical natural paper/linen textures. Keep EXACT same composition, silhouette, crease location, green lining, ivory border, white front pocket, camera angle and background. No new elements. Preserve all envelope geometry and color, change only text removal. Output clean blank envelope in same portrait aspect ratio.

레이어 재추출: 프로젝트 루트에서 `node components/envelope/scripts/split-assets.mjs`.

## 화면 확인

Playwright로 열기·문구 편집·초기화·닫기와 모바일 가로 넘침을 확인했습니다.

![열린 청첩장 봉투와 편집 화면](../../docs/screenshots/wedding-envelope.png)
