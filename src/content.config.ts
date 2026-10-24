import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	// src/content/posts/ 아래의 Markdown/MDX 파일을 읽습니다.
	// 폴더 구조가 그대로 주소가 됩니다. (예: ctf/baby-heap.md → /posts/ctf/baby-heap/)
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// 큰 분류: cloud 또는 ctf
			category: z.enum(['cloud', 'ctf']),
			// 세부 분야: aws, k8s, gcp / pwn, web, rev, crypto, forensics 등
			topic: z.string(),
			tags: z.array(z.string()).default([]),
			// CTF 글일 때만
			ctf: z
				.object({
					event: z.string(),
					difficulty: z.string().optional(),
				})
				.optional(),
			series: z.string().optional(),
			heroImage: image().optional(),
			// true면 로컬(npm run dev)에서만 보이고 배포에서는 빠집니다.
			draft: z.boolean().default(false),
		}),
});

export const collections = { posts };
