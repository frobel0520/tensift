import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../content/candidates/batch-7',import.meta.url));
const LENGTH={µm:1n,mm:1000n,cm:10000n,m:1000000n,km:1000000000n};
const TIME={ms:1n,s:1000n,min:60000n,h:3600000n};
const MIME={'.svg':1,'.mp3':2,'.wav':2,'.avi':3,'.mp4':3,'.webm':3,'.txt':4,'.css':4,'.csv':4,'.html':4};
const families=(groups)=>Object.fromEntries(groups.flatMap((labels,i)=>labels.map(label=>[label,i+1])));
const ORCHESTRA=families([
 ['Triangle','三角鐵','Triángulo'],['Bassoon','Oboe','低音管','雙簧管','Fagot'],
 ['French horn','Trumpet','Trombone','法國號','小號','長號','Corno francés','Trompeta','Trombón'],
 ['Violin','Viola','Cello','Double bass','小提琴','中提琴','大提琴','低音提琴','Violín','Violonchelo','Contrabajo'],
]);
const ANIMALS=families([
 ['Guppy','孔雀魚'],['Iguana','Alligator','鬣蜥','短吻鱷','Aligátor'],
 ['Robin','Flamingo','Pelican','知更鳥','紅鶴','鵜鶘','Petirrojo','Flamenco','Pelícano'],
 ['Otter','Rabbit','Dolphin','Giraffe','水獺','兔子','海豚','長頸鹿','Nutria','Conejo','Delfín','Jirafa'],
]);

function equalsQuantity(label,units,target){
 const match=/^(\d+(?:\.\d+)?)\s+(µm|mm|cm|km|m|ms|s|min|h)$/.exec(label);
 if(!match||units[match[2]]===undefined)return false;
 const [whole,fraction='']=match[1].split('.');
 return BigInt(whole+fraction)*units[match[2]]===target*(10n**BigInt(fraction.length));
}

export function checkPuzzleFacts(puzzle){
 const family=puzzle.puzzleFamilyId,items=new Map(puzzle.items.map(item=>[item.itemId,item.label]));
 let checked=0;
 for(const group of puzzle.solution.groups){
  const size=group.capacity;
  for(const id of group.itemIds){
   const label=items.get(id);let matches=false;
   if(family==='equal-distances-002')matches=equalsQuantity(label,LENGTH,[0n,1000n,10000n,1000000n,1000000000n][size]);
   else if(family==='equal-durations-002')matches=equalsQuantity(label,TIME,[0n,1000n,60000n,3600000n,86400000n][size]);
   else if(family==='prefix-scale-002')matches=/^(?:m|c|k|M)(?:A|m|L|g|W|Hz|J|V)$/.test(label)&&({m:1,c:2,k:3,M:4})[label[0]]===size;
   else if(family==='roman-symbol-count-002')matches=/^(?=[IVXLCDM]+$)M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(label)&&label.length===size;
   else if(family==='media-type-families-002')matches=MIME[label]===size;
   else if(family==='orchestral-families-002')matches=ORCHESTRA[label]===size;
   else if(family==='vertebrate-groups-002')matches=ANIMALS[label]===size;
   else throw Error('UNKNOWN_FACT_CHECK_FAMILY');
   if(!matches)throw Error('CANDIDATE_FACT_MISMATCH');checked++;
  }
 }
 if(checked!==10)throw Error('INCOMPLETE_FACT_CHECK');
 return {items:checked,status:'author-factual-check-only'};
}

export async function checkCandidateFacts(root=ROOT){
 const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));let puzzles=0,items=0;
 for(const family of manifest.families){
  if(family.blindPlaytest.status!=='pending'||family.blindPlaytest.testers!==0)throw Error('BLIND_EVIDENCE_REQUIRED_SEPARATELY');
  for(const file of family.files){
   if(!/^(en|zh-Hant|es-419)\/[a-zA-Z0-9-]+\.json$/.test(file))throw Error('INVALID_CANDIDATE_PATH');
   const puzzle=JSON.parse(await readFile(join(root,file),'utf8'));if(puzzle.status!=='draft')throw Error('NOT_A_DRAFT');
   items+=checkPuzzleFacts(puzzle).items;puzzles++;
  }
 }
 return {families:manifest.families.length,puzzles,items,status:'author-factual-check-only',blindPlaytest:'pending'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Candidate factual review '+JSON.stringify(await checkCandidateFacts()));
