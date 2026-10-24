// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://namu17.github.io',
	integrations: [
		// expressiveCode는 mdx보다 앞에 있어야 MDX 안의 코드 블록에도 적용됩니다.
		expressiveCode({
			themes: ['github-dark'],
			plugins: [pluginLineNumbers()],
			defaultProps: {
				showLineNumbers: false,
			},
			styleOverrides: {
				borderRadius: '10px',
				borderColor: '#1f2937',
				codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
				codeFontSize: '13.5px',
				codeLineHeight: '1.75',
				uiFontFamily: "'JetBrains Mono', ui-monospace, monospace",
				uiFontSize: '12px',
				codeBackground: '#111827',
				frames: {
					editorTabBarBackground: '#1a2233',
					editorActiveTabBackground: '#1a2233',
					editorActiveTabIndicatorTopColor: 'transparent',
					editorActiveTabIndicatorBottomColor: '#60a5fa',
					terminalTitlebarBackground: '#1a2233',
					terminalBackground: '#111827',
					frameBoxShadowCssValue: 'none',
				},
			},
		}),
		mdx(),
		sitemap(),
	],
});
