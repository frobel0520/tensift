export interface SourceInventory {
 version:number;status:string;puzzleFiles:number;families:number;sourceEntries:number;validCitations:number;
 citationCompleteness:string;familiesWithGaps:number;
 rows:{familyId:string;localeCount:number;missingLocales:string[];missingSourcesLocales:string[];invalidCitationLocales:string[];sourceSetDiffers:boolean}[];
 rightsClearance:string;independentPlaytest:string;liveLinkAvailability:string;
}
export interface EditorialSourceInventory {
 curatedFamilies:number;curatedLocaleEntries:number;supplementaryReferences:number;invalidSupplementaryReferences:number;copyLocales:number;paragraphs:number;
 rows:{familyId:string;supplementaryReferences:number}[];copyRightsClearance:string;
}
export function inventoryPuzzleSources(puzzles:unknown[]):SourceInventory;
export function inventoryEditorialSources(catalogText:string,copyText:string):EditorialSourceInventory;
export function auditContentSources(root?:string):Promise<SourceInventory&{editorial:EditorialSourceInventory}>;
