---
title: '[Docker] Docker CLI 명령어 정리'
description: '이미지, 컨테이너, 네트워크, 볼륨 등 자주 쓰는 Docker CLI 명령어와 옵션을 예시와 함께 정리했습니다.'
pubDate: 2026-11-17
category: container
topic: docker
tags: [docker, container]
---

## 1) Docker
---
### 1-1) Docker 버전 확인
```bash
docker -v
docker version # 상세히 출력
```
### 1-2) 실시간 CPU/메모리 사용량 확인
```bash
docker stats [OPTIONS] [CONTAINER...]
# -a, --all: 멈춘 컨테이너까지 표시
# --no-stream: 한 번만 출력하고 끝냄
# --no-trunc: 잘린 내용(ID)을 전체 표시
# --format: 출력 형식 지정
```
### 1-3) Docker 전체 정보
```bash
docker info [OPTIONS]
# -f, --format: 출력 형식 지정
```
### 1-4) 빌드 캐시 삭제
```bash
docker builder prune [OPTIONS]
# -a, --all: 사용 중이 아닌 빌드 캐시 전부 삭제 (없으면 dangling 캐시만)
# -f, --force: 바로 삭제
# --filter: 조건 지정
# --reserved-space: 지정한 만큼의 캐시만 남기고 삭제 (EX. 10GB)
```
## 2) 이미지 관련 명령어
---
### 2-1) 이미지 목록 확인
```bash
docker image ls
docker images
```
### 2-2) 이미지 다운로드
```bash
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
# NAME: [레지스트리_주소[:포트]/][사용자명/]저장소명[:태그]
```
#### 예시
```bash
docker pull nginx # 태그가 없으면 latest
docker pull nginx:1.27
docker pull python:3.12-slim

docker pull bitnami/redis # 사용자/조직 이미지 (Docker Hub)
docker pull ghcr.io/owner/app:v1 # 다른 레지스트리 (GitHub)
docker pull registry.com:5000/team/api:2.0 # 사설 레지스트리
```
### 2-3) 이미지 삭제
```bash
docker image rm [OPTIONS] IMAGE [IMAGE...]
docker rmi [OPTIONS] IMAGE [IMAGE...]
# -f: 이미지 강제 삭제

docker image prune [OPTIONS] # 사용하지 않는 이미지 삭제
# -a, --all: 컨테이너가 쓰지 않는 이미지 전부 삭제 
# (없으면 태그 없는 dangling 이미지만 삭제)
# -f, --force: 확인 질문 없이 바로 삭제
# --filter: 조건 지정 (EX.until=24h, ...)
```
#### 예시
```bash
docker rmi nginx
docker rmi 3f8a4339aadd # ID 앞 몇 글자만 적어도 삭제 가능 (EX. 3f8a)
docker rmi nginx redis # 여러 개 한 번에 삭제
docker rmi $(docker images -q) # 모든 이미지 삭제
docker rmi $(docker images -f "dangling=true" -q) # 태그 없는 이미지만 삭제
# docker image rm 동일
```
### 2-4) 이미지 내역
```bash
docker history [OPTIONS] IMAGE
# --no-trunc: 잘린 명령어 전체 표시
# --format: 출력 형식 지정
```
### 2-5) 이미지 저장
```bash
docker save [OPTIONS] IMAGE [IMAGE...]
# -o, --output: 저장할 파일 이름 (기본값: 표준 출력)
```
#### 예시
```bash
docker save -o myapp.tar myapp:1.0
docker save -o images.tar nginx redis:7
docker save myapp:1.0 | gzip > myapp.tar.gz # 압축하여 저장
```
### 2-6) 이미지 로드
```bash
docker load [OPTIONS]
# -i: 불러올 tar 파일 지정 (기본값: 표준 입력)
```
#### 예시
```bash
docker load -i myapp.tar
docker load < myapp.tar
```
### 2-7) 기존 이미지 -> 새 이름이나 태그 지정
```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```
#### 예시
```bash
docker tag myapp:1.0 myapp:latest
docker tag myapp:1.0 user/myapp:1.0 # Docker Hub
docker tag myapp:1.0 ghcr.io/owner/myapp:1.0 # GitHub 레지스트리
```
### 2-8) 레지스트리에 이미지 올리기
```bash
docker push [OPTIONS] NAME[:TAG]
# -a, --all-tags: 저장소의 모든 태그 올리기
```
## 3) 컨테이너 관련 명령어
---
### 3-1) 컨테이너 목록 확인
```bash
docker ps [OPTIONS]
# -a, --all: 모든 컨테이너 표시
# -q: 컨테이너 ID만 출력
```
### 3-2) 컨테이너 시작
```bash
docker start [OPTIONS] CONTAINER [CONTAINER...]
# -a, --attach: 컨테이너 출력을 터미널에 연결 (출력을 보면서 실행)
# -i, --interactive: 표준 입력 연결
```
#### 예시
```bash
docker start web
docker start web db redis # 여러 개 한 번에 실행
docker start -a web # 로그 보면서 실행
docker start -ai web # 터미널에 접속하면서 실행 (bash 등 대화형 컨테이너)
docker start $(docker ps -aq -f "status=exited")
```
### 3-3) 컨테이너 생성 / 생성 + 실행
```bash
docker create/run [OPTIONS] IMAGE [COMMAND] [ARG...]
# --name: 컨테이너 이름 지정
# -p: 포트 연결
# --rm: 컨테이너가 종료되면 자동 삭제
# -v [path:path]: 볼륨/폴더 마운트 
## HOST 경로:CONTAINER경로 = Bind mount (호스트 폴더 연결)
## 볼륨 이름:CONTAINER경로 = Named Volume (Docker 관리 볼륨)
# -e [KEY=VALUE]: 환경변수 설정
# -it: 터미널을 통한 대화형으로 실행, -i: 입력 유지, -t: 터미널 할당
# --net, --network: 연결할 네트워크 지정
# --restart: 재시작 정책 (no(기본값), always, unless-stopped(직접 멈추지 않는 한 항상 재시작), on-failure(오류로 종료될 경우))

# run에만 있는 OPTIONS
# -d, --detach: 백그라운드에서 실행
```
#### 예시
```bash
docker create --name web -p 8080:80 nginx
docker run -d --name web -p 8080:80 nginx # 백그라운드에서 실행

docker create -it --name box ubuntu bash
```
### 3-4) 컨테이너 중지
```bash
docker stop [OPTIONS] CONTAINER [CONTAINER...]
# -t, --timeout: 강제 종료 전까지 기다릴 시간(초) (기본값: 10초)
```
### 3-5) 컨테이너 재시작
```bash
docker restart [OPTIONS] CONTAINER [CONTAINER...]
# -t, --timeout: 강제 종료 전까지 기다릴 시간(초) (기본값: 10초)
```
### 3-6) 컨테이너 삭제
```bash
docker rm [OPTIONS] CONTAINER [CONTAINER...]
# -f, --force: 실행 중이어도 강제로 멈추고 삭제
# -v, --volumes: 컨테이너와 연결된 익명 볼륨 함께 삭제
```
#### 예시
```bash
docker rm web
docker rm web db redis
docker rm -f web # 실행 중인 컨테이너 삭제
docker rm -v db # 익명 볼륨 함께 삭제
docker rm $(docker ps -aq -f "status=exited") # 멈춘 컨테이너 삭제
docker rm -f $(docker ps -aq) # 모든 컨테이너 삭제
```
### 3-7) 컨테이너 강제 종료
```bash
docker kill [OPTIONS] CONTAINER [CONTAINER...]
# -s, --signal: 보낼 신호 지정 (기본값: SIGKILL)
```
### 3-8) 컨테이너 로그 확인
```bash
docker logs [OPTIONS] CONTAINER
# -n, --tail: 맨뒤 n줄만 조회
# -f: 생성되는 로그를 실시간으로 조회
# -t, --timestamps: 시간 표시
# --since: 해당 시점 이후 로그만 조회
# --until: 해당 시점 이전 로그만 조회
# --details: 로그에 붙은 추가 정보(환경변수, 라벨 등) 표시
```
### 3-9) 컨테이너 내 모든 프로세스 일시 중지
```bash
docker pause CONTAINER [CONTAINER...]
docker unpause CONTAINER [CONTAINER...]
```
### 3-10) 컨테이너 상태 -> 이미지 저장
```bash
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
# -m, --message: 커밋 메시지
# -a, --author: 작성자 기록 (EX. "김이름 <namekim@example.com>")
# -c, --change: Dockerfile 명령 적용 (CMD, ENV, EXPOSE, WORKDIR 등)
# -p, --pause: 커밋하는 동안 컨테이너 일시정지 (기본값: true)
```
#### 예시
```bash
docker commit box myubuntu:curl
docker commit -m "커밋 메시지" -a "NAME" box myubuntu:curl
docker commit -c 'CMD ["bash"]' box myubuntu:curl
docker commit -c "ENV APP_ENV=prod" -c "EXPOSE 8080" web myweb:1.0
```
### 3-11) 컨테이너 내부 파일 시스템 변화
```bash
docker diff CONTAINER
# A - 추가됨(Added) / C - 변경됨(Changed) / D - 삭제됨(Deleted)
```
### 3-12) 컨테이너와 연결된 포트 매핑 정보 확인
```bash
docker port CONTAINER [PRIVATE_PORT[/PROTOCOL]]
```
#### 예시
```bash
docker port web 80 # 80번 포트 확인
docker port web 53/udp # UDP 포트 확인
```
### 3-13) 컨테이너 내부 프로세스 확인
```bash
docker top CONTAINER [ps OPTIONS]
```
### 3-14) 내 터미널에 컨테이너의 메인 프로세스 연결
```bash
docker attach [OPTIONS] CONTAINER
# exit, Ctrl C -> 컨테이너 멈춤
# Ctrl P, Ctrl Q (O)
```
## 4) 네트워크 관련 명령어
---
### 4-1) 네트워크 목록 확인
```bash
docker network ls [OPTIONS]
# -f, --filter: 조건 (EX. driver=bridge, name=my, ...)
# -q, --quiet: 네트워크 ID만 출력
# --no-trunc: ID를 잘리지 않게 전체 표시
# --format: 출력 형식 지정
```
### 4-2) 네트워크 생성
```bash
docker network create [OPTIONS] NETWORK
# -d, --driver: 네트워크 종류 (기본값: bridge)
# -----------드라이버 종류-----------
# bridge: 한 호스트 안에서 컨테이너끼리 연결
# overlay: 여러 호스트(Swarm)에 걸친 컨테이너 연결
# macvlan: 컨테이너에 실제 네트워크의 MAC/IP 줌
# ipvlan: macvlan과 비슷하지만 MAC 공유
# ---------------------------------
# --subnet: IP 대역 지정 (EX. 172.20.0.0/16)
# --gateway: Gateway IP 지정
# --ip-range: 컨테이너에 나눠줄 IP 범위
# --internal: 외부(인터넷) 접속 차단
# --attachable: 일반 컨테이너도 붙을 수 있게 함 (Overlay 네트워크용)
# --label: 라벨 붙이기
# --ipv6: IPv6 사용
```
#### 예시
```bash
docker network create mynet
docker network create -d bridge mynet
docker network create \
	--subnet 172.20.0.0/16 \
	--gateway 172.20.0.1 \
	mynet
docker network create --internal backend
```
### 4-3) 네트워크 삭제
```bash
docker network rm [OPTIONS] NETWORK [NETWORK...]
# -f, --force: 네트워크가 없어도 오류 X
docker network prune [OPTIONS]
# -f, --force: 바로 삭제
# --filter: 조건 지정 (EX. until=24h, label=env=test, ...)
```
#### 예시
```bash
docker network rm mynet
docker network rm $(docker network ls -q -f "type=custom") # 직접 만든 네트워크 전부 삭제
docker network prune
docker network prune -f
docker network prune --filter "until=24h" # 만든 지 24시간 넘으면 삭제
docker network prune --filter "label=env=test" # 라벨이 env=test라면 삭제
```
### 4-4) 네트워크 상세 정보 확인
```bash
docker network inspect [OPTIONS] NETWORK [NETWORK...]
# -f, --format: 출력 형식 지정
# -v, --verbose: 자세한 정보 표시 (overlay 네트워크용)
```
### 4-5) 네트워크 연결 및 해제
```bash
docker network connect [OPTIONS] NETWORK CONTAINER
# --ip: 고정 IPv4 지정 (--subnet을 지정해 만든 네트워크에서만 가능)
# --ip6: 고정 IPv6 지정
# --alias: 해당 네트워크에서 쓸 다른 이름 추가

docker network disconnect [OPTIONS] NETWORK CONTAINER
# -f, --force: 강제 분리
```
## 5) 볼륨
---
### 5-1) 볼륨 목록 확인
```bash
docker volume ls [OPTIONS]
# -f, --filter: 조건 지정 (EX. dangling=true(어디에도 쓰이지 않는 볼륨), driver=local(드라이버))
# -q, --quiet: 볼륨 이름만 출력
# --format: 출력 형식 지정
```
### 5-2) 볼륨 생성
```bash
docker volume create [OPTIONS] [VOLUME]
# VOLUME을 쓰지 않으면 긴 ID의 볼륨이 만들어짐
# -d, --driver: 볼륨 드라이버 지정 (기본값: local)
# -o, --opt: 드라이버 옵션 지정 (EX. NFS 연결 등)
# --label: 라벨
# --name: 볼륨 이름 지정
```
### 5-3) 볼륨 제거
```bash
docker volume rm [OPTIONS] VOLUME [VOLUME...]
# -f, --force: 볼륨이 없어도 오류 X
docker volume prune [OPTIONS]
# -a, --all: 이름 있는 볼륨까지 삭제 (없으면 익명 볼륨만)
# -f, --force: 바로 삭제
# --filter: 조건 지정
```
### 5-4) 볼륨 상세 정보 확인
```bash
docker volume inspect [OPTIONS] VOLUME [VOLUME...]
# -f, --format: 출력 형식 지정
```
## 6) 기타
---
### 6-1) 파일 복사
```bash
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH # 컨테이너 -> 호스트
docker cp [OPTIONS] SRC_PATH CONTAINER:DEST_PATH # 호스트 -> 컨테이너
# -a, --archive: 파일 소유자(UID/GID)까지 그대로 복사
# -L, --follow-link: 심볼릭 링크가 가리키는 실제 파일 복사
# -q, --quiet: 진행 표시 생략
```
### 6-2) 이미지/컨테이너/볼륨 사용 디스크 용량
```bash
docker system df [OPTIONS]
# -v, --verbose: 이미지, 컨테이너, 볼륨별 자세히 표시
# --format: 출력 형식 지정
```
### 6-3) 사용하지 않는 리소스 일괄 삭제
```bash
docker system prune [OPTIONS]
# -a, --all: 컨테이너가 쓰지 않는 이미지 전체 삭제 (태그 있는 이미지 포함)
# --volumes: 쓰지 않는 익명 볼륨 삭제
# -f, --force: 바로 삭제
# --filter: 조건 지정
```
### 6-4) 상세 정보 확인
```bash
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
# -f, --format: 출력 형식 지정
# -s, --size: 컨테이너 크기 표시
# --type: 대상 종류 지정 (EX. container, image, network, volume, ...)
```
