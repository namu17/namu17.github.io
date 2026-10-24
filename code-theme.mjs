// 코드 블록 색 테마 (노션 코드 블록 / Prism 기본 색 기반)
// 색을 바꾸려면 아래 hex 값만 고치면 됩니다. 바꾼 뒤에는 `npx astro dev --force`로 다시 켜세요.

const c = {
	bg: '#f7f6f3',
	text: '#37352f',
	comment: '#708090',
	punctuation: '#999999',
	keyword: '#0077aa', // if, const, return, import ...
	func: '#dd4a68', // 함수 이름, 셸 명령어 (curl 등)
	string: '#669900', // 문자열, 속성 이름
	number: '#990055', // 숫자, true/false, 태그 이름
	operator: '#9a6e3a', // =, =>, + ...
	variable: '#ee9900', // 셸 변수, 정규식
};

export const codeTheme = {
	name: 'notion-light',
	type: 'light',
	colors: {
		'editor.background': c.bg,
		'editor.foreground': c.text,
		'editor.selectionBackground': '#b3d4fc',
		'editorLineNumber.foreground': '#b5b3ad',
		'editorGroupHeader.tabsBackground': '#efeee9',
		'tab.activeBackground': c.bg,
		'tab.activeForeground': c.text,
		'tab.inactiveForeground': c.comment,
		'tab.border': '#00000000',
		'editorGroupHeader.tabsBorder': '#00000000',
		focusBorder: '#00000000',
	},
	tokenColors: [
		{ settings: { foreground: c.text } },
		{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
		{ scope: ['punctuation', 'meta.brace'], settings: { foreground: c.punctuation } },
		{
			scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'variable.language', 'support.type.property-name.json'],
			settings: { foreground: c.keyword },
		},
		{ scope: ['keyword.operator', 'keyword.operator.assignment', 'entity.other.attribute-name.pseudo-class', 'markup.underline.link'], settings: { foreground: c.operator } },
		{
			scope: ['entity.name.function', 'support.function', 'entity.name.command', 'entity.name.class', 'entity.name.type', 'support.class', 'meta.function-call'],
			settings: { foreground: c.func },
		},
		{ scope: ['string', 'string.quoted', 'string.template', 'entity.other.attribute-name', 'support.constant.property-value', 'markup.inline.raw'], settings: { foreground: c.string } },
		{ scope: ['punctuation.definition.string', 'punctuation.definition.template-expression'], settings: { foreground: c.string } },
		{ scope: ['constant.numeric', 'constant.language', 'constant.character', 'entity.name.tag', 'support.constant', 'constant.other.symbol'], settings: { foreground: c.number } },
		{ scope: ['variable.other.normal.shell', 'variable.other.special.shell', 'punctuation.definition.variable.shell', 'string.regexp'], settings: { foreground: c.variable } },
		{
			scope: ['variable', 'variable.other', 'variable.parameter', 'meta.output', 'constant.other.option', 'string.unquoted.argument', 'punctuation.separator.prompt'],
			settings: { foreground: c.text },
		},
		{ scope: ['markup.heading', 'markup.bold'], settings: { fontStyle: 'bold' } },
		{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
		{ scope: ['markup.inserted'], settings: { foreground: c.string } },
		{ scope: ['markup.deleted'], settings: { foreground: c.func } },
	],
};

// ```console 블록: `$ curl ...`, `> aws ...`, `user@host:~$ ls`처럼 프롬프트가 있는 줄은 셸 문법으로 칠하고,
// `# ...`로 시작하는 줄은 주석, 나머지 줄(출력)은 기본색으로 둡니다.
// 기본 제공 console 언어는 `$` 바로 뒤 명령어(curl 등)를 구분하지 못해서 직접 정의합니다.
export const consoleLang = {
	name: 'console',
	aliases: ['shellsession', 'shell-session'],
	scopeName: 'text.shell-session.blog',
	embeddedLangs: ['shellscript'],
	patterns: [
		{ match: '^\\s*#(\\s.*)?$', name: 'comment.line.number-sign.shell-session' },
		{
			begin: '^(\\s*)((?:[\\w.-]+@[\\w.-]+:[^\\s$]*)?[$%>❯])(?=\\s)',
			beginCaptures: { 2: { name: 'punctuation.separator.prompt.shell-session' } },
			end: '$',
			patterns: [{ include: 'source.shell#command_statement' }, { include: 'source.shell' }],
		},
		{ match: '^.*$', name: 'meta.output.shell-session' },
	],
};
