// 사이트 전체에서 쓰는 정보입니다. 여기만 고치면 사이드바, 메타 태그, RSS에 모두 반영됩니다.

export const SITE_TITLE = 'Namu17\'s Blog';
export const SITE_DESCRIPTION = '공부 기록 블로그';

export const AUTHOR = {
	name: 'Namu17',
	// 사이드바 프로필 아래 두 줄
	role: 'Computer Engineering Student',
	bio: '웹 & 클라우드 보안 공부하고 있습니다.',
	// public/ 폴더에 이미지를 넣고 경로를 적으면 아바타로 쓰입니다. (예: '/avatar.png')
	avatar: '/profile.webp',
};

// 비워두면 해당 버튼이 숨겨집니다.
export const SOCIAL = {
	github: 'https://github.com/namu17',
	linkedin: 'https://www.linkedin.com/in/namu17/',
	email: 'rlxo247677@gmail.com',
};

export const NAV = [
	{ label: 'HOME', href: '/', icon: 'home' },
	{ label: 'CATEGORIES', href: '/categories/', icon: 'folder' },
	{ label: 'TAGS', href: '/tags/', icon: 'tag' },
	{ label: 'ARCHIVES', href: '/archives/', icon: 'archive' },
	{ label: 'ABOUT', href: '/about/', icon: 'user' },
] as const;

export const CATEGORY_LABEL = {
	cloud: 'cloud',
	web: 'web',
	network: 'network',
} as const;
