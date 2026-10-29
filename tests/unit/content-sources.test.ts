import {describe,expect,it} from 'vitest';
import {inventoryPuzzleSources,inventoryEditorialSources} from '../../scripts/audit-content-sources.mjs';
const puzzle=(locale='en')=>({puzzleId:'synthetic-'+locale.toLowerCase(),puzzleFamilyId:'synthetic-001',locale,sources:[{title:'Synthetic reference',url:'https://example.com/reference',retrievedAt:'2026-10-29'}]});
const complete=()=>['en','zh-Hant','es-419'].map(puzzle);
const catalog=`export const archiveCatalog = {demo:{en:puzzle,'zh-Hant':puzzle,'es-419':puzzle}};
export const editorialReferences={demo:[{title:'Synthetic',url:'https://example.com/ref'}]};`;
const copy=`export const editorialCopy={en:{about:[{paragraphs:['Synthetic prose']}]},'zh-Hant':{},'es-419':{}};`;
describe('source inventory is evidence preparation, never clearance',()=>{
 it('counts multilingual references without printing prose or URLs',()=>{
  const result=inventoryPuzzleSources(complete());expect(result).toMatchObject({puzzleFiles:3,families:1,sourceEntries:3,validCitations:3,citationCompleteness:'complete',rightsClearance:'not_assessed',liveLinkAvailability:'not_checked'});
  expect(JSON.stringify(result)).not.toContain('example.com');expect(JSON.stringify(result)).not.toContain('Synthetic reference');
 });
 it('separately reports absent locales, missing sources and citation metadata',()=>{
  const result=inventoryPuzzleSources([{...puzzle(),sources:[]},{...puzzle('zh-Hant'),sources:[{title:'Synthetic',url:'http://example.com'}]}]);
  expect(result.rows[0]).toMatchObject({missingLocales:['es-419'],missingSourcesLocales:['en'],invalidCitationLocales:['zh-Hant']});expect(result.citationCompleteness).toBe('gaps');
 });
 it('detects cross-locale reference drift without leaking source addresses',()=>{
  const rows=complete();rows[2]!.sources[0]!.url='https://example.com/different';
  expect(inventoryPuzzleSources(rows).rows[0]?.sourceSetDiffers).toBe(true);
 });
 it.each(['https://user:synthetic@example.com/ref','https://127.0.0.1/ref','https://example.local/ref','javascript:synthetic'])('flags unsupported citation transport without printing it',url=>{
  const result=inventoryPuzzleSources([{...puzzle(),sources:[{title:'Synthetic',url,retrievedAt:'2026-10-29'}]}]);expect(result.validCitations).toBe(0);expect(JSON.stringify(result)).not.toContain(url);
 });
 it('does not accept impossible retrieval dates or duplicate family locales',()=>{
  const row=puzzle();row.sources[0]!.retrievedAt='2026-02-30';expect(inventoryPuzzleSources([row]).validCitations).toBe(0);
  expect(()=>inventoryPuzzleSources([puzzle(),puzzle()])).toThrow('DUPLICATE_FAMILY_LOCALE');
 });
 it('refuses arbitrary identifiers and empty input instead of exposing them',()=>{
  expect(()=>inventoryPuzzleSources([{...puzzle(),puzzleFamilyId:'synthetic/private'}])).toThrow('INVALID_CATALOG_METADATA');expect(()=>inventoryPuzzleSources([])).toThrow('INVALID_CATALOG');
 });
 it('statically inventories editorial selection and paragraphs without executing code',()=>{
  const result=inventoryEditorialSources(catalog,copy);expect(result).toMatchObject({curatedFamilies:1,curatedLocaleEntries:3,supplementaryReferences:1,invalidSupplementaryReferences:0,copyLocales:3,paragraphs:1,copyRightsClearance:'not_assessed'});
  expect(JSON.stringify(result)).not.toContain('Synthetic prose');
  expect(()=>inventoryEditorialSources(catalog.replace('en:puzzle,',''),copy)).toThrow('INCOMPLETE_EDITORIAL_LOCALES');
 });
 it('fails closed when editorial structures change',()=>{
  expect(()=>inventoryEditorialSources('export const archiveCatalog = compute();',copy)).toThrow();
  expect(()=>inventoryEditorialSources(catalog,copy.replace("['Synthetic prose']",'[compute()]'))).toThrow('UNSUPPORTED_EDITORIAL_PARAGRAPHS');
 });
});
