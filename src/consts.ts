// 사이트 전체에서 쓰는 정보입니다. 여기만 고치면 사이드바, 메타 태그, RSS에 모두 반영됩니다.

export const SITE_TITLE = 'namu17';
export const SITE_DESCRIPTION = '클라우드 보안과 CTF 풀이를 기록하는 블로그';

export const AUTHOR = {
	name: 'namu17',
	// 사이드바 프로필 아래 두 줄
	role: 'Cloud Security · CTF',
	bio: '[한 줄 소개를 적어주세요]',
	// public/ 폴더에 이미지를 넣고 경로를 적으면 아바타로 쓰입니다. (예: '/avatar.png')
	avatar: '',
};

// 비워두면 해당 버튼이 숨겨집니다.
export const SOCIAL = {
	github: 'https://github.com/namu17',
	linkedin: '',
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
	cloud: 'Cloud',
	ctf: 'CTF',
} as const;
