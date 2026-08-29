import { SUPPORTED_LOCALES } from '../../../shared/contracts.ts';
const REQUIRED_CAPACITIES = [1, 2, 3, 4];
const PUZZLE_STATUSES = ['draft', 'reviewed', 'scheduled', 'published', 'retired'];
export function validateAuthoringPuzzle(value) {
    const issues = [];
    if (!isRecord(value)) {
        return result([{ path: '$', code: 'record-type', message: 'Puzzle record must be an object.' }]);
    }
    if (value.schemaVersion !== 1) {
        addIssue(issues, '$.schemaVersion', 'schema-version', 'schemaVersion must be 1.');
    }
    if (!isNonEmptyString(value.puzzleId)) {
        addIssue(issues, '$.puzzleId', 'puzzle-id', 'puzzleId must be a non-empty string.');
    }
    if (!isNonEmptyString(value.puzzleFamilyId)) {
        addIssue(issues, '$.puzzleFamilyId', 'puzzle-family-id', 'puzzleFamilyId must be a non-empty string.');
    }
    if (!isLocale(value.locale)) {
        addIssue(issues, '$.locale', 'locale', 'locale must be en, zh-Hans, or es-419.');
    }
    if (!isIsoDate(value.publishDate)) {
        addIssue(issues, '$.publishDate', 'publish-date', 'publishDate must use YYYY-MM-DD.');
    }
    if (value.timezone !== 'UTC') {
        addIssue(issues, '$.timezone', 'timezone', 'timezone must be UTC.');
    }
    if (!isNonEmptyString(value.theme)) {
        addIssue(issues, '$.theme', 'theme', 'theme must be a non-empty string.');
    }
    const itemIds = validateItems(value.items, issues);
    validateRows(value.rows, issues);
    validateSolution(value.solution, itemIds, issues);
    validateHint(value.hint, issues);
    validateText(value.explanation, '$.explanation', 'explanation', issues);
    validateSources(value.sources, issues);
    validateDifficulty(value.difficulty, issues);
    if (!isPuzzleStatus(value.status)) {
        addIssue(issues, '$.status', 'status', 'status is not a recognized puzzle status.');
    }
    return result(issues);
}
export function assertValidAuthoringPuzzle(value, sourceLabel) {
    const validation = validateAuthoringPuzzle(value);
    if (!validation.valid) {
        const details = validation.issues
            .map((issue) => `${issue.path} (${issue.code}): ${issue.message}`)
            .join('\n');
        throw new Error(`${sourceLabel} failed puzzle validation:\n${details}`);
    }
}
function validateItems(value, issues) {
    if (!Array.isArray(value) || value.length !== 10) {
        addIssue(issues, '$.items', 'item-count', 'items must contain exactly 10 records.');
        return [];
    }
    const itemIds = [];
    value.forEach((item, index) => {
        if (!isRecord(item)) {
            addIssue(issues, `$.items[${index}]`, 'item-type', 'Item must be an object.');
            return;
        }
        if (!isNonEmptyString(item.itemId)) {
            addIssue(issues, `$.items[${index}].itemId`, 'item-id', 'itemId must be a non-empty string.');
        }
        else {
            itemIds.push(item.itemId);
        }
        validateText(item.label, `$.items[${index}].label`, 'item-label', issues);
    });
    addDuplicateIssues(itemIds, '$.items', 'duplicate-item-id', 'Item IDs must be unique.', issues);
    return itemIds;
}
function validateRows(value, issues) {
    if (!Array.isArray(value) || value.length !== 4) {
        addIssue(issues, '$.rows', 'row-count', 'rows must contain exactly 4 records.');
        return;
    }
    const rowIds = [];
    const capacities = [];
    value.forEach((row, index) => {
        if (!isRecord(row)) {
            addIssue(issues, `$.rows[${index}]`, 'row-type', 'Row must be an object.');
            return;
        }
        if (!isNonEmptyString(row.rowId)) {
            addIssue(issues, `$.rows[${index}].rowId`, 'row-id', 'rowId must be a non-empty string.');
        }
        else {
            rowIds.push(row.rowId);
        }
        if (!isRowCapacity(row.capacity)) {
            addIssue(issues, `$.rows[${index}].capacity`, 'row-capacity', 'Row capacity must be 1, 2, 3, or 4.');
        }
        else {
            capacities.push(row.capacity);
        }
    });
    addDuplicateIssues(rowIds, '$.rows', 'duplicate-row-id', 'Row IDs must be unique.', issues);
    assertCapacitySet(capacities, '$.rows', 'row-capacities', 'Rows must have capacities 1 / 2 / 3 / 4.', issues);
}
function validateSolution(value, itemIds, issues) {
    if (!isRecord(value)) {
        addIssue(issues, '$.solution', 'solution-type', 'solution must be an object.');
        return;
    }
    validateText(value.hiddenDimension, '$.solution.hiddenDimension', 'hidden-dimension', issues);
    if (!Array.isArray(value.groups) || value.groups.length !== 4) {
        addIssue(issues, '$.solution.groups', 'group-count', 'solution.groups must contain exactly 4 records.');
        return;
    }
    const groupIds = [];
    const capacities = [];
    const groupedItemIds = [];
    value.groups.forEach((group, index) => {
        if (!isRecord(group)) {
            addIssue(issues, `$.solution.groups[${index}]`, 'group-type', 'Solution group must be an object.');
            return;
        }
        if (!isNonEmptyString(group.groupId)) {
            addIssue(issues, `$.solution.groups[${index}].groupId`, 'group-id', 'groupId must be a non-empty string.');
        }
        else {
            groupIds.push(group.groupId);
        }
        validateText(group.label, `$.solution.groups[${index}].label`, 'group-label', issues);
        if (!isRowCapacity(group.capacity)) {
            addIssue(issues, `$.solution.groups[${index}].capacity`, 'group-capacity', 'Group capacity must be 1, 2, 3, or 4.');
        }
        else {
            capacities.push(group.capacity);
        }
        if (!Array.isArray(group.itemIds)) {
            addIssue(issues, `$.solution.groups[${index}].itemIds`, 'group-items-type', 'group.itemIds must be an array.');
            return;
        }
        if (isRowCapacity(group.capacity) && group.itemIds.length !== group.capacity) {
            addIssue(issues, `$.solution.groups[${index}].itemIds`, 'group-size', 'Group item count must equal its capacity.');
        }
        group.itemIds.forEach((itemId, itemIndex) => {
            if (!isNonEmptyString(itemId)) {
                addIssue(issues, `$.solution.groups[${index}].itemIds[${itemIndex}]`, 'group-item-id', 'Group item IDs must be non-empty strings.');
            }
            else {
                groupedItemIds.push(itemId);
            }
        });
    });
    addDuplicateIssues(groupIds, '$.solution.groups', 'duplicate-group-id', 'Group IDs must be unique.', issues);
    assertCapacitySet(capacities, '$.solution.groups', 'group-capacities', 'Groups must have capacities 1 / 2 / 3 / 4.', issues);
    addDuplicateIssues(groupedItemIds, '$.solution.groups[*].itemIds', 'duplicate-group-item', 'Every item must belong to exactly one group.', issues);
    const expectedItems = new Set(itemIds);
    groupedItemIds.forEach((itemId) => {
        if (!expectedItems.has(itemId)) {
            addIssue(issues, '$.solution.groups[*].itemIds', 'unknown-group-item', `Solution references unknown item ${itemId}.`);
        }
    });
    if (groupedItemIds.length !== itemIds.length || groupedItemIds.some((itemId) => !expectedItems.has(itemId))) {
        addIssue(issues, '$.solution.groups[*].itemIds', 'partition', 'Solution groups must partition all ten items exactly once.');
    }
}
function validateHint(value, issues) {
    if (!isRecord(value)) {
        addIssue(issues, '$.hint', 'hint-type', 'hint must be an object.');
        return;
    }
    if (value.maxUses !== 1) {
        addIssue(issues, '$.hint.maxUses', 'hint-count', 'maxUses must be 1.');
    }
    if (value.policy !== 'random-unlocked-correct-row') {
        addIssue(issues, '$.hint.policy', 'hint-policy', 'hint policy is not supported.');
    }
}
function validateSources(value, issues) {
    if (!Array.isArray(value) || value.length < 1) {
        addIssue(issues, '$.sources', 'source-count', 'At least one source is required.');
        return;
    }
    value.forEach((source, index) => {
        if (!isRecord(source)) {
            addIssue(issues, `$.sources[${index}]`, 'source-type', 'Source must be an object.');
            return;
        }
        validateText(source.title, `$.sources[${index}].title`, 'source-title', issues);
        validateText(source.url, `$.sources[${index}].url`, 'source-url', issues);
        if (isNonEmptyString(source.url)) {
            try {
                new URL(source.url);
            }
            catch {
                addIssue(issues, `$.sources[${index}].url`, 'source-url-format', 'Source URL must be absolute.');
            }
        }
        if (!isIsoDate(source.retrievedAt)) {
            addIssue(issues, `$.sources[${index}].retrievedAt`, 'source-date', 'retrievedAt must use YYYY-MM-DD.');
        }
    });
}
function validateDifficulty(value, issues) {
    if (!isRecord(value)) {
        addIssue(issues, '$.difficulty', 'difficulty-type', 'difficulty must be an object.');
        return;
    }
    if (!['easy', 'medium', 'hard'].includes(String(value.band))) {
        addIssue(issues, '$.difficulty.band', 'difficulty-band', 'difficulty band must be easy, medium, or hard.');
    }
    if (typeof value.score !== 'number' || value.score < 0 || value.score > 1) {
        addIssue(issues, '$.difficulty.score', 'difficulty-score', 'difficulty score must be between 0 and 1.');
    }
}
function validateText(value, path, code, issues) {
    if (!isNonEmptyString(value)) {
        addIssue(issues, path, code, 'Value must be a non-empty string.');
    }
}
function assertCapacitySet(capacities, path, code, message, issues) {
    if (JSON.stringify([...capacities].sort()) !== JSON.stringify(REQUIRED_CAPACITIES)) {
        addIssue(issues, path, code, message);
    }
}
function addDuplicateIssues(values, path, code, message, issues) {
    if (new Set(values).size !== values.length) {
        addIssue(issues, path, code, message);
    }
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function isLocale(value) {
    return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
}
function isRowCapacity(value) {
    return value === 1 || value === 2 || value === 3 || value === 4;
}
function isPuzzleStatus(value) {
    return typeof value === 'string' && PUZZLE_STATUSES.includes(value);
}
function addIssue(issues, path, code, message) {
    issues.push({ path, code, message });
}
function result(issues) {
    return { valid: issues.length === 0, issues };
}
