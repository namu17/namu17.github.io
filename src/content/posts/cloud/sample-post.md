---
title: '[예시] 클라우드 보안 글 작성 예시'
description: 'Cloud 카테고리 글이 어떻게 보이는지 확인하기 위한 예시 글입니다. 실제 글을 쓰면 지워주세요.'
pubDate: 2026-10-20
category: cloud
topic: aws
tags: [example, iam]
---

`src/content/posts/cloud/` 폴더에 글을 쓰면 Cloud 카테고리로 분류됩니다.

## 정책 예시

IAM 정책 같은 JSON도 하이라이트됩니다.

```json title="policy.json"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "*"
    }
  ]
}
```

## 명령어 예시

```bash frame="terminal"
$ aws sts get-caller-identity
```

| 항목 | 설명 |
| --- | --- |
| 표 | Markdown 표도 이렇게 표시됩니다 |
