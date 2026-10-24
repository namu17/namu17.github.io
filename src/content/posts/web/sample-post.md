---
title: '[예시] 웹 보안 글 작성 예시'
description: '코드 블록, 터미널 출력, 주의 박스 등 글에 쓰는 요소를 모아둔 예시 글입니다. 실제 글을 쓰면 지워주세요.'
pubDate: 2026-10-24
category: web
topic: xss
tags: [example, xss]
---

이 글은 디자인 확인용 예시입니다. `src/content/posts/web/` 폴더에 Markdown 파일을 만들면 이렇게 표시됩니다.

## 개요

다룰 취약점과 실습 환경을 적습니다. 터미널 명령과 출력은 언어를 `console`로 두고 명령 줄 앞에 `$`를 붙이면, 명령 줄만 색이 칠해지고 출력은 그대로 보입니다.

```console
$ curl -i "http://localhost:3000/search?q=test"
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<p>검색 결과: test</p>
```

## 취약점 분석

인라인 코드는 `innerHTML`처럼 표시됩니다. 인용문(`>`)은 주의/팁 박스로 보입니다.

> 실습은 직접 띄운 로컬 환경이나 허가된 대상에서만 진행하세요.

### 세부 항목

`###` 제목은 목차에서 한 단계 들여쓰기 되어 보입니다.

## 재현 코드

코드 블록에 `title`로 파일명을 붙이고, `showLineNumbers`로 줄 번호를, `{4-5}`로 강조할 줄을 지정할 수 있습니다.

```js title="server.js" showLineNumbers {4-5}
const express = require('express');
const app = express();

app.get('/search', (req, res) => {
	res.send(`<p>검색 결과: ${req.query.q}</p>`);
});

app.listen(3000);
```

## 대응 방안

```js title="server.js"
const escape = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
res.send(`<p>검색 결과: ${escape(req.query.q)}</p>`);
```
