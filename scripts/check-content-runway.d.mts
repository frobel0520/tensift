export function collectCoverage(root?: string): Promise<Map<string, Set<string>>>;
export function measureRunway(coverage: Map<string, Set<string>>, startDate: string): { days: number; lastCoveredDate: string | null; gapDate: string | null };
export function main(argv?: string[]): Promise<void>;
