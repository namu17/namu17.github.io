import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	// src/content/posts/ 아래의 Markdown/MDX 파일을 읽습니다.
	// 폴더 구조가 그대로 주소가 됩니다. (예: web/xss-basics.md → /posts/web/xss-basics/)
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// 큰 분류: consts.ts의 CATEGORY_LABEL 키와 같아야 합니다.
			category: z.enum(['cloud', 'web', 'network']),
			// 세부 분야: aws, k8s / xss, sqli / tcp, dns 등
			topic: z.string(),
			tags: z.array(z.string()).default([]),
			series: z.string().optional(),
			heroImage: image().optional(),
			// true면 로컬(npm run dev)에서만 보이고 배포에서는 빠집니다.
			draft: z.boolean().default(false),
		}),
});

export const collections = { posts };
