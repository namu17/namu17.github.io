import { type CollectionEntry, getCollection } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 날짜 최신순 글 목록. 배포 빌드에서는 draft 글을 뺍니다. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('posts', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (post: Post) => `/posts/${post.id}/`;

export const tagSlug = (tag: string) => tag.toLowerCase().replace(/\s+/g, '-');

export function formatDate(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}.${m}.${d}`;
}

/** [{ key, count }] 형태로 개수를 세서 많은 순으로 돌려줍니다. */
export function countBy(items: string[]) {
	const map = new Map<string, number>();
	for (const item of items) map.set(item, (map.get(item) ?? 0) + 1);
	return [...map.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}
