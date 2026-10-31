import translations from '../public/locales/en.json' with {type:'json'};
import overview from '../seed/research-overview.json' with {type:'json'};
import financialPlan from '../seed/d-testbed-research-plan.json' with {type:'json'};
import researcher from '../seed/researcher.json' with {type:'json'};
import submissions from '../seed/journal-manuscripts.json' with {type:'json'};
import sdg from '../seed/sdg-manuscripts.json' with {type:'json'};
import kortax from '../seed/kortax-manuscript.json' with {type:'json'};
import vision from '../seed/vision-manuscript.json' with {type:'json'};
import manufacturing from '../seed/manufacturing-agent-manuscript.json' with {type:'json'};
import services from '../seed/company-services.json' with {type:'json'};

const dictionary:Record<string,string> = translations;
const t = (text:string) => dictionary[text.replace(/\s+/g,' ').trim()] || text;
const join = (...parts:string[]) => parts.map(t).join(' ');
// Use the same curated translations and source data as the public pages.
export const englishDocuments = [
  {title:'Jaehwan Kim’s research areas',url:'/pages/research.html#research-overview',text:join(overview.intro,overview.practice,...overview.areas.flatMap(a=>[a.title,a.summary]))},
  ...overview.areas.map(a=>({title:t(a.title),url:'/pages/research.html#'+a.links[0].anchor,text:join(a.label,a.summary)})),
  {title:'Jaehwan Kim · Profile',url:'/pages/about.html',text:join(researcher.role,researcher.intro)},
  ...researcher.education.map(r=>({title:'Education · '+t(r.title),url:'/pages/experience.html#cv-education',text:join(r.date,r.description)})),
  ...researcher.career.map(r=>({title:'Career · '+t(r.title),url:'/pages/experience.html#cv-career',text:join(r.date,r.description)})),
  {title:'D-Testbed · Planned financial AI research',url:'/pages/research.html#'+financialPlan.id,text:join(financialPlan.statusLabel,financialPlan.summary,financialPlan.scopeNote)},
  ...financialPlan.papers.map(p=>({title:t(p.title),url:'/pages/research.html#'+p.id,text:join(financialPlan.statusLabel,'Tentative target venue: '+t(p.venue),p.question,p.approach)})),
  ...submissions.manuscripts.map(m=>({title:m.titleEn,url:'/pages/publications.html#'+m.id,text:join(m.journal,m.statusLabel,'Status as of '+m.statusAsOf,m.summary,m.resultsSummary)})),
  ...[kortax,vision,manufacturing].map(m=>({title:m.title,url:'/pages/publications.html#'+m.id,text:join(m.statusLabel,m.summary,m.approach,'Only the first manuscript page is publicly available.')})),
  {title:'SDG manuscripts in progress',url:'/pages/publications.html#sdg-manuscripts',text:join(sdg.statusLabel,...sdg.manuscripts.map(m=>m.shortTitle),'Seven research topics; eight first-page previews including two KIS versions.')},
  ...sdg.manuscripts.map(m=>({title:t(m.title),url:'/pages/publications.html#'+m.id,text:join(sdg.statusLabel,m.summary,m.approach)})),
  ...researcher.internalTools.map(r=>({title:r.name,url:'/pages/projects.html#internal-tool-'+r.id,text:join(r.category,r.status,r.summary)})),
  ...services.services.map(s=>({title:t(s.name),url:'/pages/projects.html#service-'+s.id,text:join(s.status,s.description,...s.features,s.access)})),
  {title:'Contact · Research collaboration',url:'/pages/contact.html',text:'Email: '+researcher.email+' '+t(overview.collaboration)}
];

export function searchEnglishResearch(question:string) {
  const stopwords = new Set(['the','and','for','are','what','which','how','can','kim','jaehwan','his','does','please','tell','about','current','introduce','research']);
  const terms = question.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>1&&!stopwords.has(t));
  const overviewQuery = /research\s+(areas|scope|topics)|fields?\s+of\s+research/i.test(question);
  const scored = englishDocuments.map(d=>({d,score:(overviewQuery&&d.url.endsWith('#research-overview')?30:0)+terms.reduce((n,t)=>n+(d.title.toLowerCase().includes(t)?3:d.text.toLowerCase().includes(t)?1:0),0)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  const sources=scored.map(r=>r.d);
  return {mode:'retrieval',answer:sources.length?sources.map(d=>d.title+'\n'+d.text).join('\n\n'):'No matching material was found. Try SDG, Vision, KorTaxArena, manufacturing AI, meeting intelligence, education, or contact.',sources:sources.map(({title,url})=>({title,url}))};
}
