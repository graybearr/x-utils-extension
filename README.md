# X Utils

X(Twitter)에 몇 가지 유용한 기능들을 추가해주는 확장 프로그램

## Feature

**인용 보기 버튼** - 재게시 버튼을 클릭하면 인용 보기 버튼이 메뉴에 추가됩니다.

**FixTweet 링크 복사** - 공유 버튼을 통해 [FixTweet](https://github.com/FixTweet/FxTwitter) 링크를 클립보드에 복사합니다.

**GIF 다운로드** - X에 업로드된 GIF를 동영상 또는 GIF로 변환하여 다운로드합니다.

## Install

### Chrome 웹 스토어

*(출시 예정)*

### 웨일 스토어

[웨일 스토어에서 설치](https://store.whale.naver.com/detail/jlnapblpklemhagdljlhbhkgdipegelp)

### 개발 빌드

```bash
git clone https://github.com/graybearr/x-utils-extension.git
cd x-utils-extension
npm install
npm run dev
```

1. Chrome에서 `chrome://extensions` 열기
2. 우측 상단 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램 로드** 클릭
4. `dist/` 폴더 선택

## Tech Stack

- Vite + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- TypeScript
- [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) (WASM)
- Chrome Manifest V3

## License

[GPL-3.0](LICENSE)

이 프로젝트는 [FFmpeg](https://ffmpeg.org/)를 포함하며, FFmpeg는 [GPL-2.0-or-later](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html) 라이선스 하에 배포됩니다.