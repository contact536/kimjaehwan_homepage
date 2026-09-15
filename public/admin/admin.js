(() => {
  const $ = (id) => document.getElementById(id);
  let kind = "conferences",
    selected = null,
    page = 1,
    query = "",
    timer,
    request;
  let dirty = false, saving = false;
  function setDirty(value) {
    dirty = value;
    $('save').disabled = saving || !dirty;
    $('discard').disabled = saving || !dirty;
    $('editor-state').textContent = saving ? '처리 중입니다…' : dirty ? '저장하지 않은 변경사항이 있습니다.' : '저장된 내용과 동일합니다.';
  }
  function canLeave() { return !saving && (!dirty || confirm('저장하지 않은 변경사항을 버리고 이동할까요?')); }
  function setBusy(value) {
    saving = value;
    $('fields').querySelectorAll('input,textarea').forEach(input => input.disabled = value);
    $('delete').disabled = value;
    setDirty(dirty);
  }
  addEventListener('beforeunload', event => {
    if (dirty || saving) { event.preventDefault(); event.returnValue = ''; }
  });
  $('editor').addEventListener('input', () => { setDirty(true); updatePreview(); });
  $('discard').onclick = () => {
    if (saving || !selected) return;
    if (selected.id) edit(selected);
    else { selected = null; setDirty(false); $('editor').hidden = true; $('editor-title').textContent = '편집할 항목을 선택하세요'; }
  };
  function updatePreview() {
    if (!selected) return;
    const card = $('preview-card'); card.replaceChildren();
    const value = key => $('field-' + key)?.value.trim() || '';
    const add = (tag, text, className) => {
      if (!text) return;
      const element = document.createElement(tag); element.textContent = text;
      if (className) element.className = className;
      card.append(element);
    };
    if (kind === 'news') add('p', value('date') || '날짜 미입력', 'preview-meta');
    add('h3', value('name') || '제목 또는 이름을 입력하세요');
    if (kind === 'research') {
      add('p',value('subtitle'),'preview-meta'); add('p',value('summary')); add('p',value('body'));
    } else if (kind === 'profile') {
      add('p', value('tagline'), 'preview-meta'); add('p', value('identity')); add('p', value('email'));
    } else if (kind === 'news') {
      const url = value('url');
      if (/^https?:\/\//i.test(url)) {
        const link = document.createElement('a'); link.href = url; link.textContent = '관련 자료 확인 ↗';
        link.target = '_blank'; link.rel = 'noopener noreferrer'; card.append(link);
      }
    } else {
      add('p', [value('fields'),value('tiers')].filter(Boolean).join(' / '), 'preview-meta');
      if (kind === 'conferences') add('p', [value('acceptance'),value('format')].filter(Boolean).join(' · '));
      else { add('p', [value('publisher'),value('host'),value('if')].filter(Boolean).join(' · ')); add('p',value('strength')); }
    }
  }
  const collections = {
    research: ['연구 본문','기존 세 연구의 제목·요약·본문을 관리합니다.','/pages/research.html','저장하면 홈·프로젝트 목록·연구 상세와 연구 도우미에 반영됩니다. 분야 태그와 출처 표기는 별도 자료로 관리합니다.'],
    conferences: ['학회', '학회 이름, 연구 분야와 등급을 관리합니다.', '/pages/conference-tier.html', '저장하면 해당 학회 탐색 페이지에 반영됩니다.'],
    journals: ['저널', '출판사, 연구 분야와 저널 정보를 관리합니다.', '/pages/journal.html', '저장하면 저널 탐색 페이지에 반영됩니다.'],
    news: ['연구 소식', '홈의 Journey에 표시되는 소식과 날짜를 관리합니다.', '/', '저장하면 홈의 Journey에 반영됩니다. CV는 별도 프로필 자료에서 생성됩니다.'],
    profile: ['프로필', '홈에 표시되는 이름, 직함과 연락처를 관리합니다.', '/', '이름·직함·연구 소개·이메일은 홈에 반영됩니다. 하위 페이지 프로필은 별도 자료에서 생성되며 수치 필드는 현재 화면에 표시되지 않습니다.'],
  };
  const definitions = {
    research: [['name','연구 이름'],['subtitle','부제'],['summary','목록 요약'],['body','연구 본문']],
    conferences: [
      ["name", "학회 이름"],
      ["acceptance", "채택률"],
      ["fields", "분야 (쉼표로 구분)"],
      ["tiers", "등급 (쉼표로 구분)"],
      ["format", "개최 방식"],
    ],
    journals: [
      ["name", "저널 이름"],
      ["abbr", "약어"],
      ["publisher", "출판사"],
      ["host", "주관 기관"],
      ["fields", "분야 (쉼표로 구분)"],
      ["tiers", "등급 (쉼표로 구분)"],
      ["if", "Impact Factor"],
      ["strength", "주요 분야"],
    ],
    news: [
      ["name", "소식 내용"],
      ["date", "날짜 (예: September 2026)"],
      ["url", "논문 또는 관련 링크"],
    ],
    profile: [
      ["name", "이름"],
      ["tagline", "직함"],
      ["identity", "연구 소개"],
      ["email", "연락 이메일"],
      ["publications", "논문 수"],
      ["projects", "프로젝트 수"],
      ["presentations", "발표 수"],
      ["awards", "수상 수"],
    ],
  };
  const numbers = new Set([
    "publications",
    "projects",
    "presentations",
    "awards",
  ]);
  function message(text) {
    $("message").textContent = text;
  }
  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) showLogin();
      throw new Error(data.error || "요청을 처리하지 못했습니다.");
    }
    return data;
  }
  function showLogin() {
    request?.abort();
    $("workspace").hidden = true;
    $("login-panel").hidden = false;
  }
  function showWorkspace() {
    $("workspace").hidden = false;
    $("login-panel").hidden = true;
    load();
    loadAnalytics();
  }
  function analyticsRows(id, rows, labelKey, formatter = value => value, metric = 'views', unit = '회') {
    const host = $(id);
    host.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.textContent = '아직 집계된 방문이 없습니다.';
      empty.className = 'analytics-empty';
      host.append(empty);
      return;
    }
    rows.forEach(row => {
      const line = document.createElement('div');
      line.className = 'analytics-row';
      const label = document.createElement('span');
      label.textContent = formatter(row[labelKey], row);
      const value = document.createElement('strong');
      value.textContent = `${Number(row[metric] || 0).toLocaleString('ko-KR')}${unit}`;
      line.append(label, value);
      host.append(line);
    });
  }
  async function loadAnalytics() {
    $('analytics-status').textContent = '방문 데이터를 불러오는 중입니다.';
    const selected = $('analytics-range').value;
    const days = ['7', '30', '90', 'all'].includes(selected) ? selected : '30';
    try {
      const data = await api(`/api/admin/analytics?days=${days}`);
      const daily = data.daily || [];
      const entire = days === 'all';
      $('analytics-daily-title').textContent = entire ? '월별 방문' : '일별 방문';
      $('analytics-active-label').textContent = entire ? '방문이 있었던 달' : '방문이 있었던 날';
      $('analytics-views').textContent = Number(data.views || 0).toLocaleString('ko-KR');
      $('analytics-visitors').textContent = Number(data.visitors || 0).toLocaleString('ko-KR');
      $('analytics-active-days').textContent = String(daily.length);
      const chart = $('analytics-daily');
      chart.replaceChildren();
      const max = Math.max(1, ...daily.map(row => Number(row.views || 0)));
      daily.forEach(row => {
        const item = document.createElement('div');
        item.className = 'analytics-day';
        const date = document.createElement('span');
        date.textContent = row.day;
        const bar = document.createElement('span');
        bar.className = 'analytics-bar';
        bar.setAttribute('style', `width:${Math.max(2, Number(row.views || 0) / max * 100)}%`);
        const count = document.createElement('strong');
        count.textContent = `${row.views}회 · ${row.visitors}명`;
        item.append(date, bar, count);
        chart.append(item);
      });
      if (!daily.length) chart.textContent = '아직 집계된 방문이 없습니다.';
      analyticsRows('analytics-pages', data.pages || [], 'path');
      analyticsRows('analytics-referrers', data.referrers || [], 'referrer', value => value, 'visitors', '명');
      const names = new Intl.DisplayNames(['ko'], { type: 'region' });
      const countryName = value => value === '??' ? '알 수 없음' : (names.of(value) || value);
      analyticsRows('analytics-countries', data.countries || [], 'country', countryName, 'visitors', '명');
      analyticsRows('analytics-regions', data.regions || [], 'region', (value, row) =>
        `${countryName(row.country)} · ${value || '지역 알 수 없음'}`, 'visitors', '명');
      $('analytics-status').textContent = `${data.from || ''} ~ ${data.to || ''} · 페이지 조회와 하루 단위 방문자 합계를 ${entire ? '월별로' : '일별로'} 표시합니다.`;
    } catch (error) {
      $('analytics-status').textContent = `방문 현황을 불러오지 못했습니다: ${error.message}`;
    }
  }
  $('analytics-range').onchange = loadAnalytics;
  $('analytics-refresh').onclick = loadAnalytics;
  $("login").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password: $("password").value }),
      });
      $("password").value = "";
      message("");
      showWorkspace();
    } catch (error) {
      message(error.message);
    }
  };
  $('password-change').onsubmit=async event=>{
    event.preventDefault();if (!canLeave()) return;const button=event.submitter;const status=$('password-message');
    const data={currentPassword:$('current-password').value,newPassword:$('new-password').value,confirmPassword:$('confirm-password').value};
    if(data.newPassword!==data.confirmPassword){status.textContent='새 비밀번호 확인이 일치하지 않습니다.';return;}
    setBusy(true);button.disabled=true;status.textContent='변경 중…';
    try{await api('/api/admin/password',{method:'POST',body:JSON.stringify(data)});['current-password','new-password','confirm-password'].forEach(id=>$(id).value='');status.textContent='';selected=null;setDirty(false);showLogin();message('비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요.');}
    catch(error){status.textContent=error.message;}
    finally{button.disabled=false;setBusy(false);}
  };
  $("logout").onclick = async () => {
    if (!canLeave()) return;
    try {
      await api("/api/auth/logout", { method: "POST" });
      selected=null;setDirty(false);showLogin();
      message("로그아웃했습니다.");
    } catch (error) {
      message(error.message);
    }
  };
  $("collections").onclick = (e) => {
    const button = e.target.closest("[data-kind]");
    if (!button || !canLeave()) return;
    kind = button.dataset.kind;
    clearTimeout(timer);
    query = '';
    $('search').value = '';
    const [title, description, href, hint] = collections[kind];
    $('collection-title').textContent = title;
    $('collection-description').textContent = description;
    $('collection-preview').href = href;
    $('save-hint').textContent = hint;
    page = 1;
    selected = null;
    setDirty(false);
    $("editor").hidden = true;
    $("editor-title").textContent = "편집할 항목을 선택하세요";
    $("collections")
      .querySelectorAll("button")
      .forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
    $("new").hidden = ["profile","research"].includes(kind);
    load();
  };
  async function load() {
    request?.abort();
    request = new AbortController();
    const currentRequest = request;
    $('records').replaceChildren();
    $('records').setAttribute('aria-busy', 'true');
    $('count').textContent = '항목을 불러오는 중…';
    $('previous').disabled = $('next').disabled = true;
    try {
      const data = await api(
        `/api/records/${kind}?${new URLSearchParams({ q: query, page, limit: 30 })}`,
        { signal: request.signal },
      );
      if (currentRequest !== request || currentRequest.signal.aborted) return;
      const lastPage = Math.max(1, Math.ceil(data.total / 30));
      if (page > lastPage) { page = lastPage; return load(); }
      $("records").replaceChildren();
      $("count").textContent = `${data.total}개 항목`;
      $("page").textContent =
        `${page} / ${Math.max(1, Math.ceil(data.total / 30))}`;
      $("previous").disabled = page <= 1;
      $("next").disabled = page * 30 >= data.total;
      if (!data.items.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-records';
        empty.textContent = query ? '검색 결과가 없습니다. 다른 검색어를 입력해 주세요.' : '등록된 항목이 없습니다.';
        $('records').append(empty);
      }
      for (const row of data.items) {
        const button = document.createElement("button");
        button.className =
          "record" + (selected?.id === row.id ? " selected" : "");
        button.textContent = row.data.name;
        button.dataset.recordId = row.id;
        button.setAttribute('aria-pressed', String(selected?.id === row.id));
        const detail = document.createElement("small");
        detail.textContent =
          row.data.fields?.join(" · ") ||
          row.data.date ||
          row.data.tagline ||
          "";
        button.append(detail);
        button.onclick = () => { if (canLeave()) edit(row); };
        $("records").append(button);
      }
      if (kind === "profile" && !selected && data.items[0]) edit(data.items[0]);
    } catch (error) {
      if (error.name !== "AbortError") {
        $('count').textContent = '목록을 불러오지 못했습니다.';
        const retry = document.createElement('button');
        retry.textContent = '다시 시도'; retry.onclick = load;
        $('records').replaceChildren(retry);
        message(error.message);
      }
    } finally {
      if (request === currentRequest) $('records').setAttribute('aria-busy', 'false');
    }
  }
  function edit(row) {
    selected = row;
    setDirty(!row.id);
    $('records').querySelectorAll('.record').forEach(button => {
      const active = button.dataset.recordId === row.id;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $("editor").hidden = false;
    $("editor-title").textContent = row.id ? row.data.name : '새 ' + collections[kind][0];
    $("delete").hidden = !row.id || ["profile","research"].includes(kind);
    $("fields").replaceChildren();
    for (const [key, label] of definitions[kind]) {
      const wrap = document.createElement("div"),
        l = document.createElement("label"),
        input = document.createElement(
          ["summary","body"].includes(key) || key === "strength" || (key === "name" && kind === "news")
            ? "textarea"
            : "input",
        );
      l.textContent = label;
      l.htmlFor = "field-" + key;
      input.id = l.htmlFor;
      input.name = key;
      input.value = Array.isArray(row.data[key])
        ? row.data[key].join(", ")
        : (row.data[key] ?? "");
      input.required = !["url", "abbr", "host"].includes(key);
      if (numbers.has(key)) {
        input.type = "number";
        input.min = 0;
        input.max = 100000;
      }
      if (key === "email") input.type = "email";
      if (key === "url") input.type = "url";
      wrap.append(l, input);
      $("fields").append(wrap);
    }
    updatePreview();
  }
  $("new").onclick = () => { if (canLeave()) edit({ data: {} }); };
  $("editor").onsubmit = async (e) => {
    e.preventDefault();
    if (!selected || saving) return;
    const data = {};
    for (const [key] of definitions[kind]) {
      const value = $("field-" + key).value.trim();
      data[key] = numbers.has(key)
        ? Number(value)
        : ["fields", "tiers"].includes(key)
          ? [
              ...new Set(
                value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              ),
            ]
          : value;
    }
    if (data.fields) data.field = data.fields.join("/");
    if (data.tiers) data.tier = data.tiers.join("/");
    const button = e.submitter;
    setBusy(true);
    try {
      const update = Boolean(selected.id),
        url = `/api/admin/records/${kind}${update ? "/" + encodeURIComponent(selected.id) : ""}`;
      const result = await api(url, {
        method: update ? "PUT" : "POST",
        body: JSON.stringify({
          data,
          ...(update ? { revision: selected.revision } : {}),
        }),
      });
      selected = {
        id: selected.id || result.id,
        revision: result.revision,
        data,
      };
      edit(selected);
      message("저장했습니다.");
      load();
    } catch (error) {
      message(error.message);
    } finally {
      setBusy(false);
    }
  };
  $("delete").onclick = async () => {
    if (saving || !selected?.id || !confirm(`“${selected.data.name}” 항목을 삭제할까요?`))
      return;
    setBusy(true);
    try {
      await api(
        `/api/admin/records/${kind}/${encodeURIComponent(selected.id)}?revision=${selected.revision}`,
        { method: "DELETE" },
      );
      selected = null;
      setDirty(false);
      $("editor").hidden = true;
      message("삭제했습니다.");
      load();
    } catch (error) {
      message(error.message);
    } finally { setBusy(false); }
  };
  $("search").oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = $("search").value;
      page = 1;
      load();
    }, 180);
  };
  $("previous").onclick = () => {
    page--;
    load();
  };
  $("next").onclick = () => {
    page++;
    load();
  };
  api("/api/admin/session").then(showWorkspace).catch(showLogin);
})();
