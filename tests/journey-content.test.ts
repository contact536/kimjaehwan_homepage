import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('home Journey is complete, chronological and uses specific verified descriptions', () => {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const expected = [
    'D-테스트베드 데이터 연구 참여 계약 완료',
    '보안형 회의 AI 기술자료 임치',
    '경기도 AI 멤버십 기업 선정',
    '기술유출방지시스템 구축 협약 체결',
    'IP 나래 프로그램 참여 서류 작성',
    '하이브리드 검색 기반 AI 추론 시스템 특허결정',
    '핵심기술 모니터링 지원기업 선정',
    '한국회계학회 종신회원 가입',
    '기술보호 선도기업 지정',
    '호반건설 PoC 협업 사업화 지원 협약 체결',
    'AI 추론 관련 특허 1건 추가 출원',
    '한국컴퓨터정보학회 종신회원 가입',
    '(사)AI경영학회 정회원 · 학술위원회 이사',
    'AI 추론 관련 특허 3건 출원',
    '연구개발전담부서 인정',
    '벤처기업 확인',
    '특허 출원·등록 지원 바우처 협약 체결',
    'XAIKOREA 대표이사 겸 연구원 취임',
    'aSSIST AI융합 · SDG 복수학위 박사과정 입학',
    '한국외국어대학교 경영학 석사(MBA) 취득',
  ];
  let previous = -1;
  for (const title of expected) {
    const position = html.indexOf(`<h3>${title}`);
    assert.ok(position > previous, title);
    assert.equal(html.split(`<h3>${title}`).length - 1, 1, title);
    previous = position;
  }
  assert.match(html, /학업과 연구, 경영 활동/u);
  assert.match(html, /2026-AI-245/u);
  assert.match(html, /제2026-015호/u);
  assert.match(html, /제2026151302호/u);
  assert.match(html, /제20260204030008호/u);
  assert.match(html, /AI 경영과 산학 연계 활동/u);
  assert.match(html, /한국컴퓨터정보학회 종신회원입니다/u);
  assert.match(html, /한국회계학회 종신회원입니다/u);
  assert.match(html, /company-network\.html#ksci-lifetime-member/u);
  assert.match(html, /company-network\.html#kaa-lifetime-member/u);
  assert.match(html, /설정등록 절차와 구분/u);
  assert.match(html, /대·중소기업·농어업협력재단에 임치/u);
  assert.match(html, /CLOA와 세무·회계 AI 연구개발/u);
  assert.match(html, /재학 중입니다/u);
  assert.doesNotMatch(html, /회사소개서 기재 기준/u);
  assert.doesNotMatch(html, /<h3>aSSIST · SDG 박사과정 입학<\/h3>/u);
  assert.doesNotMatch(html, /<h3>한국외국어대학교 MBA 취득<\/h3>/u);
  assert.equal((html.match(/2025\.02/gu) || []).length, 1);
});
