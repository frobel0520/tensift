import {describe,it,expect} from 'vitest';
import {compareCoverage} from '../../scripts/catalog-coverage-audit.mjs';
const expected=[{day:'2026-11-01',locale:'en'},{day:'2026-11-01',locale:'zh-Hant'}];
describe('read-only catalog coverage',()=>{
 it('requires one playable row per expected locale/date, rejecting draft as coverage',()=>{
  expect(compareCoverage(expected,[{day:'2026-11-01',locale:'en',status:'published',n:1},{day:'2026-11-01',locale:'zh-Hant',status:'draft',n:1}])).toMatchObject({status:'incomplete',missing:[expected[1]]});
 });
 it('accepts scheduled rows and rejects ambiguous duplicate coverage',()=>{
  const rows=expected.map(x=>({...x,status:'scheduled',n:1}));
  expect(compareCoverage(expected,rows).status).toBe('matched');
  expect(compareCoverage(expected,[...rows,rows[0]]).status).toBe('incomplete');
 });
 it('rejects malformed aggregate results instead of claiming a match',()=>{
  expect(()=>compareCoverage(expected,[{day:'not-a-date',locale:'en',status:'published',n:1}])).toThrow();
 });
});
