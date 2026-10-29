import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {readOnlyD1Audit} from './read-only-d1-audit.mjs';
export const CATALOG_QUERY=`SELECT publish_date AS day,locale,status,COUNT(*) AS n FROM puzzles
  WHERE locale IN ('en','zh-Hant','es-419') AND publish_date>=?1 AND publish_date<=?2
  GROUP BY publish_date,locale,status ORDER BY publish_date,locale,status LIMIT 500`;
const LOCALES=['en','zh-Hant','es-419'];
export function compareCoverage(expected,rows) {
  const actual=new Map();
  for(const row of rows) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.day)||!LOCALES.includes(row.locale)||!Number.isSafeInteger(row.n)||row.n<0)throw Error('INVALID_CATALOG_RESULT');
    if(row.status==='scheduled'||row.status==='published')actual.set(row.day+'/'+row.locale,(actual.get(row.day+'/'+row.locale)??0)+row.n);
  }
  const missing=expected.filter(x=>actual.get(x.day+'/'+x.locale)!==1);
  return {status:missing.length?'incomplete':'matched',expectedLocaleDays:expected.length,missing};
}
if(process.argv[1]?.endsWith('/catalog-coverage-audit.mjs')) {
  try {
    const today=new Date().toISOString().slice(0,10),expected=[];
    for(const locale of LOCALES)for(const file of await readdir('content/puzzles/'+locale)) {
      if(!file.endsWith('.json'))continue;
      const puzzle=JSON.parse(await readFile('content/puzzles/'+locale+'/'+file,'utf8'));
      if(!/^\d{4}-\d{2}-\d{2}$/.test(puzzle.publishDate)||puzzle.locale!==locale)throw Error('INVALID_LOCAL_CATALOG');
      if(puzzle.publishDate>=today)expected.push({day:puzzle.publishDate,locale});
    }
    if(!expected.length||new Set(expected.map(x=>x.day+'/'+x.locale)).size!==expected.length)throw Error('INVALID_LOCAL_COVERAGE');
    const end=expected.map(x=>x.day).sort().at(-1);
    const report={observedAt:new Date().toISOString(),...await readOnlyD1Audit({configPath:'wrangler.toml',queries:{catalog:{sql:CATALOG_QUERY,params:[today,end]}}})};
    report.coverage=report.sections.catalog.status==='ok'?compareCoverage(expected,report.sections.catalog.rows):{status:'unknown'};
    await mkdir('artifacts/catalog-coverage-audit',{recursive:true});
    await writeFile('artifacts/catalog-coverage-audit/report.json',JSON.stringify(report,null,2)+'\n');
    console.log('CATALOG_COVERAGE_AUDIT '+JSON.stringify(report));
  }catch{console.error('CATALOG_COVERAGE_AUDIT_UNAVAILABLE');process.exitCode=1;}
}
