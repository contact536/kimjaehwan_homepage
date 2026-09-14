# 연구 에이전트 백엔드

## 오픈소스 선정

awesome-ai-agents의 후보를 조사하고 TypeScript로 이미 작성된 Hono 서버에 통합하기 좋은 LangGraph JS를 선택했습니다. 이는 이 프로젝트의 언어와 도구 호출 범위를 기준으로 한 구현 판단입니다.

- 후보 목록: https://github.com/brandonhimpfen/awesome-ai-agents
- LangGraph 공식 문서: https://docs.langchain.com/oss/javascript/langgraph/overview
- ChatOllama 공식 통합: https://docs.langchain.com/oss/javascript/integrations/chat/ollama
- Mastra 후보: https://github.com/mastra-ai/mastra
- CrewAI 후보: https://github.com/crewAIInc/crewAI

LangGraph는 도구 호출을 상태 그래프로 제한하기 좋고 기존 TypeScript/D1 코드를 재사용할 수 있습니다. Mastra의 추가 애플리케이션 구조나 CrewAI의 Python 서비스 분리는 현재의 소규모 연구 프로필 사이트에서는 필요하지 않아 적용하지 않았습니다. Ollama는 로컬 모델을 연결하는 런타임입니다. 설치된 npm 패키지는 @langchain/langgraph, @langchain/core, @langchain/ollama이며 정확한 버전은 package-lock.json에 고정됩니다.

## 동작

공개 `POST /api/research/search`는 question을 받아 확인된 연구자 자료를 검색합니다. 키워드/동의어 기반 검색이며 AI 추론으로 표시하지 않습니다.

관리자 `POST /api/admin/agent`는 로그인 후 LangGraph의 model → tools → model 그래프를 실행합니다. search_research는 공개 프로필과 연구를, search_catalog는 SQLite의 학회/저널을 읽습니다. 쓰기, 쉘, 임의 파일 읽기 및 임의 URL 요청 도구가 없습니다. 최대 4회 모델 호출, 회당 최대 3개 도구 호출, 전체 90초 제한을 설정했습니다. 결과에는 사용한 자료 링크와 도구 실행 trace를 반환합니다. 대화 메모리나 실행 복구용 체크포인트는 활성화하지 않았습니다.

## Ollama 설정

서버에서 Ollama를 실행하고 도구 호출을 지원하는 모델을 준비한 뒤 .env를 설정합니다.

```
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=설치한-도구호출-지원-모델명
```

서버를 재시작하고 /admin/ 에 로그인한 후 /pages/assistant.html 에서 AI 에이전트를 선택합니다. 모델 이름이 비어 있으면 503, 접속/추론/도구 호출 실패는 502로 알립니다. 모델이 없는 상태에서 성공 답변을 만들지 않습니다. 모델 파일은 용량과 장치 요구사항이 있으므로 이 작업에서 자동 다운로드하지 않았습니다.

2026-09-06 재확인 결과 로컬 Ollama와 qwen2.5:7b가 설치되어 있어 .env에 연결했습니다. 실제 모델의 search_research 도구 호출과, 관리자 인증 HTTP 요청을 통한 search_catalog 도구 호출 및 근거 반환을 검증했습니다. 테스트는 실제 LangGraph 실행에 모의 모델을 주입하여 도구 호출·자료 반환·루프 제한을 검증합니다. 배포 서버에서 Ollama를 사용하려면 서버가 접근 가능한 모델 주소가 필요하며 배포 환경의 127.0.0.1은 사용자 PC를 의미하지 않습니다.


## 프론트엔드 연결 (2026-09-06)

연구 도우미는 질문 작성과 답변·근거 영역을 나란히 보여주고 모바일에서는 한 열로 전환합니다. 예시 질문, 서버 설정 확인, 요청 취소, 근거 링크, 도구 실행 내역을 제공합니다. GET /api/research/status는 모델 설정 여부만 반환하며 서버 주소와 비밀값은 공개하지 않습니다. 취소는 브라우저의 응답 대기를 중단하며 서버 작업은 자체 90초 제한을 따릅니다.

실제 로컬 실행 모델: qwen2.5:7b. 별도 모델 다운로드나 새 프레임워크 설치 없이 기존 LangGraph JS + ChatOllama 구성을 활성화했습니다. 설정됨 표시는 접속 성공을 보장하지 않으며 실행 시 연결을 확인합니다. 배포 서버는 이번에 변경하지 않았습니다.

후보 재검토: awesome-ai-agents 목록을 출발점으로 LangGraph 공식 JavaScript 문서, Mastra 및 CrewAI 공식 저장소를 확인했습니다. 기존 Hono/TypeScript와 SQLite/D1 도구의 재사용, 호출 횟수 제한, 기존 테스트를 고려해 LangGraph를 선택했습니다. Mastra는 TypeScript 대안이고 CrewAI는 Python 중심의 별도 서비스 구성이 필요해 이번 범위에서는 도입하지 않았습니다.
