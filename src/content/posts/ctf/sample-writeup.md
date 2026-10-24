---
title: '[예시] CTF 라이트업 작성 예시'
description: '코드 블록, 터미널 출력, 주의 박스 등 라이트업에 쓰는 요소를 모아둔 예시 글입니다. 실제 글을 쓰면 지워주세요.'
pubDate: 2026-10-24
category: ctf
topic: pwn
tags: [example, heap]
ctf:
  event: '[대회명] 2026'
  difficulty: easy
---

이 글은 디자인 확인용 예시입니다. `src/content/posts/ctf/` 폴더에 Markdown 파일을 만들면 이렇게 표시됩니다.

## 문제 개요

문제 설명과 주어진 파일, 보호 기법을 적습니다. 터미널 출력은 언어를 `bash`로 두고 `frame="terminal"`을 붙이면 터미널 모양이 됩니다.

```bash frame="terminal"
$ checksec ./chall
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

## 취약점 분석

인라인 코드는 `free()`처럼 표시됩니다. 인용문(`>`)은 주의/팁 박스로 보입니다.

> glibc 버전에 따라 동작이 달라질 수 있으니, 문제에서 준 libc로 테스트하세요.

### 세부 항목

`###` 제목은 목차에서 한 단계 들여쓰기 되어 보입니다.

## 익스플로잇

코드 블록에 `title`로 파일명을 붙이고, `showLineNumbers`로 줄 번호를, `{4-5}`로 강조할 줄을 지정할 수 있습니다.

```python title="exploit.py" showLineNumbers {4-5}
from pwn import *

p = process('./chall')
alloc(0, 0x40)
free(0)
# ...
p.interactive()
```

## FLAG

```text
FLAG{example_flag}
```
