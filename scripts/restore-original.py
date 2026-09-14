"""Restore reviewed public source without rewriting formatting or scripts."""
import pathlib,hashlib,json,shutil
project=pathlib.Path(__file__).resolve().parents[1]
source=project.parent/'sjhwang-audit'
paths=[pathlib.Path('index.html')]+[p.relative_to(source) for p in (source/'pages').rglob('*.html')]+[p.relative_to(source) for folder in ['js','css'] for p in (source/folder).iterdir() if p.suffix in ['.js','.css']]
manifest=[]
for relative in sorted(paths):
 original=source/relative; target=project/'public'/relative
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original,target)
 digest=hashlib.sha256(original.read_bytes()).hexdigest()
 assert hashlib.sha256(target.read_bytes()).hexdigest()==digest
 manifest.append({'path':relative.as_posix(),'sha256':digest,'bytes':target.stat().st_size,'source':'https://www.sjhwang.com/'+relative.as_posix()})
(project/'seed'/'original-source.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Restored and verified {len(manifest)} original source files byte-for-byte.')
