import {readFile} from 'node:fs/promises';
import {describe,it,expect} from 'vitest';
import {checkCandidateFacts,checkPuzzleFacts} from '../../scripts/check-candidate-facts.mjs';
const load=async (name: string)=>JSON.parse(await readFile(new URL(`../../content/candidates/batch-7/en/${name}`,import.meta.url),'utf8'));
describe('candidate factual review, separate from blind testing',()=>{
 it('checks all three locales and 210 item assignments without promotion',async()=>{
  expect(await checkCandidateFacts()).toEqual({families:7,puzzles:21,items:210,status:'author-factual-check-only',blindPlaytest:'pending'});
 });
 it.each([
  ['equal-distances-2026-11-23-en.json','1001 µm'],
  ['equal-durations-2026-11-24-en.json','1001 ms'],
  ['prefix-scale-2026-11-22-en.json','MA'],
  ['roman-symbol-count-2026-11-28-en.json','IIII'],
  ['media-type-families-2026-11-25-en.json','.txt'],
  ['vertebrate-groups-2026-11-26-en.json','Dolphin'],
  ['orchestral-families-2026-11-27-en.json','Violin'],
 ])('rejects a factual or unit error in %s',async(name,label)=>{
  const puzzle=await load(name);puzzle.items[0].label=label;expect(()=>checkPuzzleFacts(puzzle)).toThrow('CANDIDATE_FACT_MISMATCH');
 });
});
