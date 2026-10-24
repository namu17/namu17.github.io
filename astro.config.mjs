// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import shellscript from '@shikijs/langs/shellscript';
import { consoleLang } from './code-theme.mjs';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://namu17.github.io',
	integrations: [
		// expressiveCode는 mdx보다 앞에 있어야 MDX 안의 코드 블록에도 적용됩니다.
		expressiveCode({
			// VS Code 기본 다크 테마. 노션 스타일로 되돌리려면 code-theme.mjs의 codeTheme을 import해서 넣으세요.
			themes: ['dark-plus'],
			shiki: {
				// consoleLang이 셸 문법을 빌려 쓰므로 함께 등록
				langs: [...shellscript, consoleLang],
			},
			// 글자색을 자동으로 보정하지 않고 테마 색 그대로 사용
			minSyntaxHighlightingColorContrast: 0,
			plugins: [pluginLineNumbers()],
			defaultProps: {
				showLineNumbers: false,
				// bash 등 셸 코드도 맥 터미널 창 모양 대신 일반 코드 블록으로 표시
				frame: 'code',
			},
			// 색은 테마 기본값을 그대로 쓰고, 모양과 글꼴만 지정
			styleOverrides: {
				borderRadius: '10px',
				codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
				codeFontSize: '13.5px',
				codeLineHeight: '1.75',
				uiFontFamily: "'JetBrains Mono', ui-monospace, monospace",
				uiFontSize: '12px',
				frames: {
					editorActiveTabIndicatorTopColor: 'transparent',
					frameBoxShadowCssValue: 'none',
				},
			},
		}),
		mdx(),
		sitemap(),
	],
});
