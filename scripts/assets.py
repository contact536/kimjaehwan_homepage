import pathlib,re,urllib.parse,urllib.request,json,concurrent.futures
root=pathlib.Path('public'); refs=set(); core=set()
for f in list(root.rglob('*.html'))+list(root.rglob('*.css')):
 text=f.read_text(encoding='utf-8'); base='https://www.sjhwang.com/'+f.relative_to(root).as_posix()
 for value in re.findall(r'(?:src|href)=["\']([^"\']+)["\']|url\(["\']?([^\)"\']+)',text):
  raw=value[0] or value[1]; u=urllib.parse.urlparse(urllib.parse.urljoin(base,raw))
  if u.hostname not in ['www.sjhwang.com','sjhwang.com'] or not u.path.startswith('/assets/'):continue
  p=urllib.parse.unquote(u.path);refs.add(p)
  if '/traveling/' not in f.as_posix() and f.name!='photos.html':core.add(p)
refs.add('/assets/land-110m.json');core.add('/assets/land-110m.json');refs.add('/assets/favicon.png');core.add('/assets/favicon.png')
pathlib.Path('seed').mkdir(exist_ok=True);pathlib.Path('seed/assets.json').write_text(json.dumps(sorted(refs)),encoding='utf-8')
def fetch(p):
 target=root/p.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():return {'path':p,'status':'cached','bytes':target.stat().st_size}
 try:
  with urllib.request.urlopen('https://www.sjhwang.com'+urllib.parse.quote(p,safe='/'),timeout=25) as r:data=r.read()
  target.write_bytes(data);return {'path':p,'status':'downloaded','bytes':len(data)}
 except Exception as e:return {'path':p,'status':'remote-fallback','error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(fetch,sorted(core)))
pathlib.Path('seed/asset-sync.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print('Allowed assets:',len(refs),'Core assets:',len(core),'Downloaded:',sum(x['status']!='remote-fallback' for x in results),'Bytes:',sum(x.get('bytes',0) for x in results),flush=True)
