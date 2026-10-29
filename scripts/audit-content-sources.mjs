import {readFile,readdir,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const LOCALES=['en','zh-Hant','es-419'];
const safeId=value=>typeof value==='string'&&/^[a-z0-9][a-z0-9-]{0,119}$/.test(value);
const date=value=>typeof value==='string'&&/^\d{4}-\d\d-\d\d$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
function citation(source,requireDate=true){
 if(!source||typeof source!=='object'||Array.isArray(source)||typeof source.title!=='string'||!source.title.trim())return false;
 if(requireDate&&!date(source.retrievedAt))return false;
 try{
  const url=new URL(source.url);
  return typeof source.url==='string'&&url.protocol==='https:'&&!url.username&&!url.password&&url.hostname.includes('.')&&!/^(?:\d|\[)/.test(url.hostname)&&!/(?:^|\.)(?:localhost|local|internal|invalid|test)$/.test(url.hostname);
 }catch{return false;}
}
/** No prose, URLs, author names, paths, credentials or source hashes are returned. */
export function inventoryPuzzleSources(puzzles){
 if(!Array.isArray(puzzles)||puzzles.length===0||puzzles.length>5000)throw Error('INVALID_CATALOG');
 const families=new Map();let sourceEntries=0,validCitations=0;
 for(const puzzle of puzzles){
  if(!puzzle||!safeId(puzzle.puzzleId)||!safeId(puzzle.puzzleFamilyId)||!LOCALES.includes(puzzle.locale))throw Error('INVALID_CATALOG_METADATA');
  const family=families.get(puzzle.puzzleFamilyId)||new Map();
  if(family.has(puzzle.locale))throw Error('DUPLICATE_FAMILY_LOCALE');
  const sources=Array.isArray(puzzle.sources)?puzzle.sources:[];
  const valid=sources.filter(source=>citation(source));sourceEntries+=sources.length;validCitations+=valid.length;
  // Canonical URLs are compared only in memory; no URLs/hashes leave the audit.
  family.set(puzzle.locale,{missing:sources.length===0,invalid:valid.length!==sources.length,
   urls:JSON.stringify([...new Set(valid.map(source=>new URL(source.url).href))].sort())});
  families.set(puzzle.puzzleFamilyId,family);
 }
 const rows=[...families].sort(([a],[b])=>a.localeCompare(b)).map(([familyId,locales])=>({familyId,
  localeCount:locales.size,missingLocales:LOCALES.filter(locale=>!locales.has(locale)),
  missingSourcesLocales:LOCALES.filter(locale=>locales.get(locale)?.missing),
  invalidCitationLocales:LOCALES.filter(locale=>locales.get(locale)?.invalid),
  sourceSetDiffers:new Set([...locales.values()].map(item=>item.urls)).size>1}));
 const gaps=rows.filter(row=>row.missingLocales.length||row.missingSourcesLocales.length||row.invalidCitationLocales.length||row.sourceSetDiffers);
 return {version:1,status:'inventory_only',puzzleFiles:puzzles.length,families:families.size,sourceEntries,validCitations,
  citationCompleteness:gaps.length?'gaps':'complete',familiesWithGaps:gaps.length,rows,
  rightsClearance:'not_assessed',independentPlaytest:'not_assessed',liveLinkAvailability:'not_checked'};
}
function object(node){
 while(node&&(ts.isAsExpression(node)||ts.isSatisfiesExpression(node)||ts.isParenthesizedExpression(node)))node=node.expression;
 if(!node||!ts.isObjectLiteralExpression(node))throw Error('UNSUPPORTED_EDITORIAL_STRUCTURE');return node;
}
const propertyName=node=>ts.isIdentifier(node)||ts.isStringLiteral(node)?node.text:null;
function variable(file,name){
 for(const statement of file.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)
  if(ts.isIdentifier(declaration.name)&&declaration.name.text===name)return object(declaration.initializer);
 throw Error('MISSING_EDITORIAL_DECLARATION');
}
/** TypeScript AST inspection only: never evaluate repository modules or prose. */
export function inventoryEditorialSources(catalogText,copyText){
 const catalog=ts.createSourceFile('catalog.ts',catalogText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const copy=ts.createSourceFile('copy.ts',copyText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 if(catalog.parseDiagnostics.length||copy.parseDiagnostics.length)throw Error('INVALID_EDITORIAL_SYNTAX');
 const selection=variable(catalog,'archiveCatalog'),references=variable(catalog,'editorialReferences'),content=variable(copy,'editorialCopy');
 const selected=new Map();let referencesCount=0,invalidReferences=0;
 for(const item of selection.properties){
  if(!ts.isPropertyAssignment(item)||!safeId(propertyName(item.name)))throw Error('UNSUPPORTED_EDITORIAL_SELECTION');
  const locales=object(item.initializer).properties.map(property=>{
   if(!ts.isPropertyAssignment(property))throw Error('UNSUPPORTED_EDITORIAL_SELECTION');return propertyName(property.name);
  });
  if(locales.length!==3||!LOCALES.every(locale=>locales.includes(locale)))throw Error('INCOMPLETE_EDITORIAL_LOCALES');
  selected.set(propertyName(item.name),locales.length);
 }
 const extras=new Map();
 for(const item of references.properties){
  if(!ts.isPropertyAssignment(item)||!selected.has(propertyName(item.name))||!ts.isArrayLiteralExpression(item.initializer))throw Error('UNSUPPORTED_EDITORIAL_REFERENCES');
  let count=0;
  for(const source of item.initializer.elements){
   const fields={};for(const field of object(source).properties){
    if(!ts.isPropertyAssignment(field)||!ts.isStringLiteral(field.initializer))throw Error('UNSUPPORTED_EDITORIAL_REFERENCE');fields[propertyName(field.name)]=field.initializer.text;
   }
   count++;referencesCount++;if(!citation(fields,false))invalidReferences++;
  }
  extras.set(propertyName(item.name),count);
 }
 const copyLocales=content.properties.map(item=>ts.isPropertyAssignment(item)?propertyName(item.name):null);
 if(copyLocales.length!==3||!LOCALES.every(locale=>copyLocales.includes(locale)))throw Error('INCOMPLETE_EDITORIAL_COPY');
 let paragraphs=0;
 const visit=node=>{
  if(ts.isPropertyAssignment(node)&&propertyName(node.name)==='paragraphs'){
   if(!ts.isArrayLiteralExpression(node.initializer)||!node.initializer.elements.every(ts.isStringLiteral))throw Error('UNSUPPORTED_EDITORIAL_PARAGRAPHS');
   paragraphs+=node.initializer.elements.length;
  }
  ts.forEachChild(node,visit);
 };visit(content);
 return {curatedFamilies:selected.size,curatedLocaleEntries:[...selected.values()].reduce((a,b)=>a+b,0),supplementaryReferences:referencesCount,
  invalidSupplementaryReferences:invalidReferences,copyLocales:copyLocales.length,paragraphs,
  rows:[...selected.keys()].sort().map(familyId=>({familyId,supplementaryReferences:extras.get(familyId)??0})),
  copyRightsClearance:'not_assessed'};
}
async function readBounded(file){const meta=await lstat(file);if(!meta.isFile()||meta.size>512*1024)throw Error('INVALID_AUDIT_INPUT');return readFile(file,'utf8');}
export async function auditContentSources(root=resolve('.')){
 const puzzles=[];
 for(const locale of LOCALES){
  const directory=join(root,'content','puzzles',locale);
  for(const file of (await readdir(directory)).filter(file=>file.endsWith('.json')).sort()){
   if(puzzles.length>=5000)throw Error('CATALOG_LIMIT');const puzzle=JSON.parse(await readBounded(join(directory,file)));
   if(puzzle.locale!==locale)throw Error('CATALOG_LOCALE_MISMATCH');puzzles.push(puzzle);
  }
 }
 const [catalog,copy]=await Promise.all([readBounded(join(root,'server/editorial/catalog.ts')),readBounded(join(root,'server/editorial/copy.ts'))]);
 return {...inventoryPuzzleSources(puzzles),editorial:inventoryEditorialSources(catalog,copy)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(await auditContentSources()));}catch{console.error('CONTENT_SOURCE_AUDIT_UNAVAILABLE');process.exitCode=1;}
}
