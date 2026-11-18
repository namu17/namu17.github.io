---
title: '[Docker] Dockerfile'
description: 'Dockerfile의 개념과 FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT, ENV 명령어의 문법과 동작을 정리했습니다.'
pubDate: 2026-11-18
category: container
topic: docker
tags: [docker, container, dockerfile]
---

## 1) Dockerfile이란?
---
Dockerfile은 이미지를 만들기 위한 명령어를 담은 텍스트 파일로, Docker에서 해당 파일을 읽고 자동으로 이미지를 빌드할 수 있습니다. 
### 1-1) 장점
- 누구나 Dockerfile을 통해서 쉽게 이미지 빌드가 가능합니다. (재현성)
- 명령어마다 레이어가 생기고 캐시되어, 바뀐 부분만 다시 빌드합니다.
---
## 2) Dockerfile 명령어
---
### 2-1) FROM
- 베이스 이미지를 지정하여 새로운 빌드 스테이지를 생성합니다.
```dockerfile
FROM [--platform=<platform>] <image> [AS <name>]
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```
### 2-2) WORKDIR
- 이후 명령어(`RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD`)가 실행될 작업 디렉토리를 지정합니다.
- 디렉토리가 없다면 자동으로 생성합니다.
- 상대경로가 주어진다면 앞선 `WORKDIR` 디렉토리가 기준이 됩니다.
```dockerfile
WORKDIR <directory>
```
### 2-3) COPY
- `<src>`에서 새로운 파일이나 디렉토리를 이미지의 파일시스템 경로인 `<dest>`에 복사합니다.
- `<src>`
	- 경로는 항상 빌드 컨텍스트를 기준으로 해석됩니다. `/`로 시작해도 컨텍스트 루트로 해석됩니다.
	- `../`과 같이 컨텍스트 밖으로 나가는 경로는 자동으로 제거됩니다.
	- 디렉토리를 복사하게 되면 그 디렉토리의 하위 디렉토리를 포함하여 내용물이 복사됩니다.
- `<dest>`
	- `/`로 시작하면 절대 경로, 아니면 `WORKDIR` 기준 상대 경로입니다.
	- 대상 경로 끝에 `/`가 없다면 해당 이름의 파일을 생성합니다.
	- 대상 경로가 없으면 자동으로 생성됩니다.

> **빌드 컨텍스트**
> - `docker build`를 실행할 때 도커 빌더에게 넘겨주는 파일과 디렉터리의 집합으로, 빌더는 이미지를 빌드할 때 이 파일들에만 접근할 수 있습니다.
> - `docker build [OPTIONS] PATH`의 `PATH`에 해당합니다. 예를 들어 `docker build .`이면 현재 디렉터리가 빌드 컨텍스트입니다.
> - 컨텍스트에서 제외할 파일은 `.dockerignore`에 지정합니다.

```dockerfile
COPY [OPTIONS] <src> <dest>
COPY [OPTIONS] ["<src>", ..., "<dest>"]
# [OPTIONS]
# --from: image나 build stage, named context에서 파일을 가져옴
# --chmod: 복사한 파일 권한 지정
# --chown: 복사한 파일의 소유자/그룹 지정
# --link: 파일을 독립된 레이어로 복사해서 캐시 효율을 높임
# --parents: 원본의 상위 디렉토리 구조를 유지하며 복사
# --exclude: 특정 파일/패턴을 복사에서 제외
```
### 2-4) RUN
- 빌드 시, 현재 이미지 위에서 명령을 실행하고, 그 결과로 바뀐 파일들을 새 레이어로 저장합니다.
- **Shell form**: 문자열 앞에 Linux -> `/bin/sh -c`, Windows -> `cmd /S /C`을 자동으로 붙입니다.
- **Exec form**: 첫 번째 요소가 실행 파일이고, 나머지는 인자입니다.
```dockerfile
# Shell form: 문자열로 작성
RUN [OPTIONS] <command> ...
# EX. RUN apt-get install -y curl / CMD node app.js

# Exec form: JSON 배열로 작성
RUN [OPTIONS] ["<command>", ...]
# EX. RUN ["apt-get", "install", "-y", "curl"] / CMD ["node", "app.js"]

# OPTIONS
# --mount=type=cache: 패키지 다운로드 캐시를 빌드 간에 재사용
# --mount=type=secret: 비밀번호, 토큰을 이미지에 남기지 않고 사용
# --mount=type=bind: 컨텍스트나 다른 스테이지 파일을 복사 없이 잠깐 사용 (기본값)
# --mount=type=ssh: 빌드 중 SSH 키로 private 저장소 접근
# --mount=type=tmpfs: 임시 메모리 디렉토리
# --network: 빌드 중 RUN의 네트워크 설정 (default/none-네트워크 차단/host-호스트 네트워크)
```
### 2-5) CMD
- 컨테이너 실행 시 명령을 실행합니다.
- `CMD`는 하나만 쓸 수 있으며, 여러 개가 있다면 마지막만 적용됩니다.
- `docker run` 인자로 덮어쓸 수 있습니다. (`ENTRYPOINT`는 유지되고 `CMD`만 바뀝니다.)
- `ENTRYPOINT`와 같이 쓸 때는 둘 다 `exec form`으로 작성합니다.
```dockerfile
# exec form 
CMD ["<command>", ...]
# exec form, ENTRYPOINT와 같이 사용할 경우
CMD ["param1", "param2", ...]
# shell form
CMD command param1 param2
```
### 2-6) ENTRYPOINT
- 컨테이너 실행 시 하나의 실행 파일처럼 동작하도록 설정할 수 있습니다.
- `exec form`인 경우, `docker run` 인자는 `ENTRYPOINT` 뒤에 붙습니다.
- `docker run --entrypoint`로 덮어쓰기가 가능합니다.
- `shell form`인 경우, `CMD`와 `docker run` 인자를 무시합니다.
- `shell form`인 경우, `/bin/sh -c`의 하위 명령으로 실행되므로 실행 파일이 `PID 1`이 되지 않고, 쉘이 시그널을 전달하지 않아 `docker stop <container>`의 `SIGTERM`을 받지 못합니다.
- Dockerfile 내 마지막 `ENTRYPOINT`만 적용됩니다.
```dockerfile
# exec form
ENTRYPOINT ["executable", "param1", "param2"]
# shell form
ENTRYPOINT command param1 param2
```
### 2-7) ENV
- 환경 변수를 설정합니다.
- 따옴표와 백슬래시를 사용해 공백을 포함할 수 있습니다.
- `docker run --env <key>=<value>`를 통해서 환경 변수를 설정할 수 있습니다.
- 환경 변수가 빌드 중에만 필요하다면 `RUN`이나 `ARG`을 사용합니다.
	- `RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ...`
	- `ARG DEBIAN_FRONTEND=noninteractive` / `RUN apt-get update && apt-get install -y ...`
```dockerfile
ENV <key>=<value> [<key>=<value>...]
```
