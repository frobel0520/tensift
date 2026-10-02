import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
// @ts-expect-error Harbor generates plain JavaScript without a TypeScript declaration.
import { onRequest } from '../../functions/_middleware.js';
const secret = 'local-synthetic-preview-secret-32-characters';
const config = { project:'tensift', version:1, maintenance:{enabled:true,message:'Local test',eta:null}, flags:{}, banner:null };
beforeEach(() => {
  vi.stubGlobal('caches', {default:{match:async()=>undefined,put:async()=>undefined}});
  vi.stubGlobal('fetch', vi.fn(async()=>new Response(JSON.stringify(config),{headers:{'content-type':'application/json'}})));
});
afterEach(()=>vi.unstubAllGlobals());
async function invoke(path:string, headers:Record<string,string>={}) {
  const next=vi.fn(async()=>new Response('normal',{status:200}));
  const response=await onRequest({request:new Request('https://tensift.pages.dev'+path,{headers}),env:{HARBOR_PREVIEW_SECRET:secret},next,waitUntil:()=>{}});
  return {response,next};
}
describe('generated Harbor middleware release boundaries',()=>{
 it('does not let malformed preview cookies skip maintenance',async()=>{
  const {response,next}=await invoke('/',{cookie:'harbor_preview=%'});
  expect(response.status).toBe(503);expect(next).not.toHaveBeenCalled();
 });
 it('keeps dynamic JSON APIs protected while health routes remain available',async()=>{
  expect((await invoke('/api/export.json')).response.status).toBe(503);
  expect((await invoke('/api/health')).response.status).toBe(200);
  expect((await invoke('/health')).response.status).toBe(200);
 });
 it('exchanges a valid preview token for a cookie and clean URL before serving content',async()=>{
  const payload='tensift.'+(Math.floor(Date.now()/1000)+120);
  const token=payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');
  const {response,next}=await invoke('/?other=1&harbor_preview='+token);
  expect(response.status).toBe(302);
  expect(response.headers.get('location')).toBe('https://tensift.pages.dev/?other=1');
  expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  expect(next).not.toHaveBeenCalled();
 });
 it('does not apply another project configuration and refuses config redirects',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({...config,project:'other'}))));
  expect((await invoke('/')).response.status).toBe(200);
  expect(vi.mocked(fetch).mock.calls[0][1]?.redirect).toBe('error');
 });
});
