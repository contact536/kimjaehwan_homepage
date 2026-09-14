"""Read current upstream source and record correspondence without modifying it."""
import pathlib,json,urllib.request,hashlib,concurrent.futures,datetime
project=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((project/'seed/original-source.json').read_text(encoding='utf-8'))
def check(item):
 try:
  with urllib.request.urlopen(item['source'],timeout=25) as response:data=response.read()
  digest=hashlib.sha256(data).hexdigest()
  return {'path':item['path'],'matches_live_source':digest==item['sha256'],'live_sha256':digest}
 except Exception as error:return {'path':item['path'],'error':str(error)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,manifest))
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'results':results}
(project/'seed/live-source-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'files':len(results),'matches':sum(r.get('matches_live_source',False) for r in results),'changed':[r['path'] for r in results if r.get('matches_live_source') is False],'errors':[r for r in results if 'error'in r]}))
