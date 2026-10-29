import {readFile} from 'node:fs/promises';

/** Fixed, reviewed aggregate queries only. Callers never pass SQL from CLI/workflow inputs. */
export async function readOnlyD1Audit({configPath,queries,env=process.env,fetchImpl=fetch}) {
  const account=env.CLOUDFLARE_ACCOUNT_ID,token=env.CLOUDFLARE_API_TOKEN;
  if(!account||!token)throw Error('MISSING_ACTIONS_BINDINGS');
  const config=await readFile(configPath,'utf8');
  const database=config.match(/(?:database_id\s*=\s*|"database_id"\s*:\s*)"([a-f0-9-]{36})"/)?.[1];
  if(!database)throw Error('MISSING_DATABASE_CONFIGURATION');
  const report={sections:{},observer:{d1Requests:0,d1Queries:0,d1RowsRead:0}};
  for(const [name,{sql,params=[]}] of Object.entries(queries)) {
    // Reject multiple statements and all mutations, including writable CTEs.
    if(!/^SELECT\b/i.test(sql.trim())||/;|\b(?:INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|PRAGMA|ATTACH|VACUUM)\b/i.test(sql))throw Error('NON_READ_ONLY_QUERY');
    try {
      report.observer.d1Requests++;
      const response=await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${database}/query`,{
        method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},
        body:JSON.stringify({sql,params}),redirect:'error',signal:AbortSignal.timeout(30_000),
      });
      if(!response.ok){report.sections[name]={status:'unknown',reason:'HTTP_'+response.status};report.observer.d1RowsRead=null;await response.body?.cancel();continue;}
      const data=await response.json(),result=data.result?.[0];
      if(data.success!==true||data.result?.length!==1||result?.success!==true||!Array.isArray(result.results)||result.results.length>500) {
        report.sections[name]={status:'unknown',reason:'INCOMPLETE_RESULT'};report.observer.d1RowsRead=null;continue;
      }
      report.sections[name]={status:'ok',rows:result.results};
      report.observer.d1Queries++;
      const read=result.meta?.rows_read;
      if(report.observer.d1RowsRead!==null&&Number.isSafeInteger(read)&&read>=0)report.observer.d1RowsRead+=read;
      else report.observer.d1RowsRead=null;
    } catch {report.sections[name]={status:'unknown',reason:'REQUEST_UNAVAILABLE'};report.observer.d1RowsRead=null;}
  }
  return report;
}

