// 글 속 이미지 크기 지정: ![설명|400](./사진.png) 처럼 설명 뒤에 |폭(px)을 붙입니다.
// 폭만 주면 높이는 비율에 맞춰 정해지고, Astro가 이미지 파일도 그 크기로 줄여서 만듭니다.
// (Astro 기본 마크다운 처리기인 Sätteri의 hast 플러그인)
export default {
	name: 'image-size',
	element: {
		filter: ['img'],
		visit(node, ctx) {
			const alt = node.properties?.alt;
			const m = typeof alt === 'string' && alt.match(/^(.*?)\s*\|\s*(\d+)\s*$/);
			if (!m) return;
			ctx.setProperty(node, 'alt', m[1]);
			ctx.setProperty(node, 'width', Number(m[2]));
		},
	},
};
