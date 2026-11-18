import type { Locale } from '../api/contracts';

export interface UiMessages {
  readonly eyebrow: string;
  readonly tagline: string;
  readonly language: string;
  readonly theme: string;
  readonly themeOriginal: string;
  readonly themeLight: string;
  readonly themeDark: string;
  readonly topicLabel: string;
  readonly attempts: string;
  readonly instruction: string;
  readonly unsortedCards: string;
  readonly remaining: string;
  readonly reset: string;
  readonly shuffle: string;
  readonly useHint: string;
  readonly check: string;
  readonly reveal: string;
  readonly findLens: string;
  readonly rulesBody: string;
  readonly ruleTap: string;
  readonly ruleTapTouch: string;
  readonly ruleUnlimited: string;
  readonly ruleHint: string;
  readonly loadingTitle: string;
  readonly loadingBody: string;
  readonly retry: string;
  readonly unavailableTitle: string;
  readonly unavailableBody: string;
  readonly emptySlot: string;
  readonly remove: string;
  readonly locked: string;
  readonly hintUsed: string;
  readonly hintPlaced: string;
  readonly checking: string;
  readonly hintLoading: string;
  readonly revealLoading: string;
  readonly correctCount: string;
  readonly solvedKicker: string;
  readonly solvedTitle: string;
  readonly solvedBody: string;
  readonly resultKicker: string;
  readonly resultTitle: string;
  readonly resultRule: string;
  readonly close: string;
  readonly shareTitle: string;
  readonly share: string;
  readonly sharing: string;
  readonly shareShared: string;
  readonly shareCopied: string;
  readonly shareRevealed: string;
  readonly shareSolved: string;
  readonly shareHintUsed: string;
  readonly shareError: string;
  readonly sourceLabel: string;
  readonly dismiss: string;
  readonly errorTitle: string;
  readonly genericError: string;
  readonly boardIncompleteError: string;
  readonly hintUnavailableError: string;
  readonly hintAlreadyUsedError: string;
  readonly requestTimeoutError: string;
  readonly networkError: string;
  readonly invalidResponseError: string;
  readonly noPuzzleError: string;
  readonly rowLabel: string;
  readonly cardLabel: string;
  readonly selectCard: string;
  readonly dropCard: string;
  readonly emptyTray: string;
  readonly levelBadge: string;
  readonly levelsButton: string;
  readonly prevLevel: string;
  readonly nextLevel: string;
  readonly nextUnsolved: string;
  readonly randomLevel: string;
  readonly levelPickerTitle: string;
  readonly completedProgress: string;
  readonly levelSearchPlaceholder: string;
  readonly difficultyEasy: string;
  readonly difficultyMedium: string;
  readonly difficultyHard: string;
  readonly levelSolvedLabel: string;
}

const messages: Record<Locale, UiMessages> = {
  en: {
    eyebrow: '300-level sorting puzzle',
    tagline: 'Ten items. Four groups. One hidden rule.',
    language: 'Language',
    theme: 'Theme',
    themeOriginal: 'Original',
    themeLight: 'Light',
    themeDark: 'Dark',
    topicLabel: 'Level {level} of {total}',
    attempts: 'Attempts',
    instruction: 'Sort every card into the four rows. The row sizes are your only clue to the hidden rule.',
    unsortedCards: 'Unsorted cards',
    remaining: '{count} remaining',
    reset: 'Reset board',
    shuffle: 'Shuffle',
    useHint: 'Hint',
    check: 'Check arrangement',
    reveal: 'Reveal answer',
    findLens: 'Find the lens.',
    rulesBody: 'Every row uses the same kind of fact. The numbers tell you how many cards belong — not what the groups mean.',
    ruleTap: 'Tap a card, then tap a slot — or drag it.',
    ruleTapTouch: 'Tap a card, then tap a slot to place it.',
    ruleUnlimited: 'Checks are unlimited.',
    ruleHint: 'Use one hint whenever you want; it places and locks a card.',
    loadingTitle: 'Preparing puzzle',
    loadingBody: 'Loading ten cards and a hidden rule…',
    retry: 'Try again',
    unavailableTitle: 'Puzzle not found',
    unavailableBody: 'This level could not be loaded. Try selecting another level.',
    emptySlot: 'Place',
    remove: 'Remove {item}',
    locked: 'Locked',
    hintUsed: 'Hint used',
    hintPlaced: '{item} placed and locked.',
    checking: 'Checking…',
    hintLoading: 'Finding a card…',
    revealLoading: 'Revealing…',
    correctCount: '{count}/10 in the right row.',
    solvedKicker: 'Rule discovered',
    solvedTitle: 'Perfect sift.',
    solvedBody: 'You found the hidden lens in {attempts} attempts.',
    resultKicker: 'The hidden lens',
    resultTitle: 'Here’s the pattern.',
    resultRule: 'The groups are sorted by {dimension}.',
    close: 'Close',
    shareTitle: 'Tensift result',
    share: 'Share result',
    sharing: 'Preparing share…',
    shareShared: 'Shared',
    shareCopied: 'Copied',
    shareRevealed: 'Answer revealed.',
    shareSolved: 'Solved in {attempts} attempts.',
    shareHintUsed: 'Hint used.',
    shareError: 'Could not share right now. Try again.',
    sourceLabel: 'Sources',
    dismiss: 'Dismiss',
    errorTitle: 'Something went off course',
    genericError: 'The puzzle could not be updated. Please try again.',
    boardIncompleteError: 'Place every card in a full board before checking.',
    hintUnavailableError: 'There is no unused hint placement available right now.',
    hintAlreadyUsedError: 'This puzzle already has a hint saved for this session.',
    requestTimeoutError: 'The puzzle took too long to load. Try again.',
    networkError: 'The puzzle catalog could not be loaded. Try again.',
    invalidResponseError: 'The puzzle data was invalid. Try again.',
    noPuzzleError: 'No puzzle is available for this level.',
    rowLabel: 'Row with {count} slots',
    cardLabel: 'Card: {item}',
    selectCard: 'Select {item}',
    dropCard: 'Place a selected card here',
    emptyTray: 'Every card is on the board.',
    levelBadge: 'Level {level}/{total}',
    levelsButton: 'Levels ({solved}/{total})',
    prevLevel: 'Previous',
    nextLevel: 'Next',
    nextUnsolved: 'Next unsolved',
    randomLevel: 'Random',
    levelPickerTitle: 'All 300 Levels',
    completedProgress: '{solved} of {total} solved',
    levelSearchPlaceholder: 'Filter by level # or topic…',
    difficultyEasy: 'Easy',
    difficultyMedium: 'Medium',
    difficultyHard: 'Hard',
    levelSolvedLabel: 'Solved',
  },
  'zh-Hant': {
    eyebrow: '300 關分類謎題',
    tagline: '十張卡片。四個分組。一個隱藏規則。',
    language: '語言',
    theme: '主題',
    themeOriginal: '原始',
    themeLight: '淺色',
    themeDark: '深色',
    topicLabel: '第 {level} 關（共 {total} 關）',
    attempts: '嘗試次數',
    instruction: '把每張卡片放進四列。每列的格數，是你唯一看得到的線索。',
    unsortedCards: '未分類卡片',
    remaining: '剩餘 {count} 張',
    reset: '重設棋盤',
    shuffle: '打亂',
    useHint: '提示',
    check: '檢查排列',
    reveal: '顯示答案',
    findLens: '找到觀察角度。',
    rulesBody: '每一列都使用同一種事實。數字只告訴你每組有幾張卡，並不告訴你分組的含義。',
    ruleTap: '點選卡片，再點選格子；也可以拖曳。',
    ruleTapTouch: '點選卡片，再點選要放入的格子。',
    ruleUnlimited: '檢查次數不限。',
    ruleHint: '隨時使用一次提示；它會放置並鎖定一張卡。',
    loadingTitle: '正在載入關卡',
    loadingBody: '正在準備十張卡片與隱藏規則……',
    retry: '再試一次',
    unavailableTitle: '找不到關卡',
    unavailableBody: '無法載入此關卡，請試著選擇其他關卡。',
    emptySlot: '放置',
    remove: '移除 {item}',
    locked: '已鎖定',
    hintUsed: '提示已使用',
    hintPlaced: '已放置並鎖定「{item}」。',
    checking: '檢查中……',
    hintLoading: '正在尋找卡片……',
    revealLoading: '正在揭曉……',
    correctCount: '{count}/10 張在正確的列。',
    solvedKicker: '發現規則',
    solvedTitle: '完美分類。',
    solvedBody: '你用 {attempts} 次嘗試找到了隱藏角度。',
    resultKicker: '隱藏角度',
    resultTitle: '規律在這裡。',
    resultRule: '這些分組按照「{dimension}」分類。',
    close: '關閉',
    shareTitle: 'Tensift 結果',
    share: '分享結果',
    sharing: '正在準備分享……',
    shareShared: '已分享',
    shareCopied: '已複製',
    shareRevealed: '答案已揭曉。',
    shareSolved: '你用 {attempts} 次嘗試完成。',
    shareHintUsed: '使用了提示。',
    shareError: '現在無法分享，請再試一次。',
    sourceLabel: '資料來源',
    dismiss: '關閉提示',
    errorTitle: '出了點小問題',
    genericError: '謎題更新失敗，請再試一次。',
    boardIncompleteError: '請先把所有卡片放滿，再進行檢查。',
    hintUnavailableError: '現在沒有可用的提示位置。',
    hintAlreadyUsedError: '這個謎題在本次遊戲中已經使用過提示。',
    requestTimeoutError: '謎題載入時間過長，請再試一次。',
    networkError: '無法載入題庫資料，請再試一次。',
    invalidResponseError: '謎題資料格式無效，請再試一次。',
    noPuzzleError: '找不到這個關卡的謎題。',
    rowLabel: '有 {count} 個格子的列',
    cardLabel: '卡片：{item}',
    selectCard: '選擇 {item}',
    dropCard: '把選取的卡片放到這裡',
    emptyTray: '所有卡片都已放到棋盤上。',
    levelBadge: '第 {level}/{total} 關',
    levelsButton: '關卡列表（{solved}/{total}）',
    prevLevel: '上一關',
    nextLevel: '下一關',
    nextUnsolved: '下一未破關卡',
    randomLevel: '隨機一關',
    levelPickerTitle: '全部 300 關',
    completedProgress: '已完成 {solved} / {total} 關',
    levelSearchPlaceholder: '搜尋關卡編號或主題……',
    difficultyEasy: '簡單',
    difficultyMedium: '中等',
    difficultyHard: '困難',
    levelSolvedLabel: '已通關',
  },
  'es-419': {
    eyebrow: 'Rompecabezas de 300 niveles',
    tagline: 'Diez elementos. Cuatro grupos. Una regla oculta.',
    language: 'Idioma',
    theme: 'Tema',
    themeOriginal: 'Original',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    topicLabel: 'Nivel {level} de {total}',
    attempts: 'Intentos',
    instruction: 'Ordena cada tarjeta en una de las cuatro filas. El tamaño de cada fila es tu única pista.',
    unsortedCards: 'Tarjetas sin ordenar',
    remaining: '{count} restantes',
    reset: 'Reiniciar tablero',
    shuffle: 'Barajar',
    useHint: 'Pista',
    check: 'Comprobar orden',
    reveal: 'Revelar respuesta',
    findLens: 'Encuentra el enfoque.',
    rulesBody: 'Cada fila usa el mismo tipo de dato. Los números indican cuántas tarjetas van juntas, no qué significa cada grupo.',
    ruleTap: 'Toca una tarjeta y luego una casilla, o arrástrala.',
    ruleTapTouch: 'Toca una tarjeta y luego la casilla donde quieres colocarla.',
    ruleUnlimited: 'Puedes comprobar las veces que quieras.',
    ruleHint: 'Usa una pista cuando quieras; colocará y bloqueará una tarjeta.',
    loadingTitle: 'Preparando el nivel',
    loadingBody: 'Cargando diez tarjetas y una regla oculta…',
    retry: 'Intentar de nuevo',
    unavailableTitle: 'Nivel no encontrado',
    unavailableBody: 'No se pudo cargar este nivel. Prueba elegir otro.',
    emptySlot: 'Colocar',
    remove: 'Quitar {item}',
    locked: 'Bloqueada',
    hintUsed: 'Pista usada',
    hintPlaced: 'Se colocó y bloqueó {item}.',
    checking: 'Comprobando…',
    hintLoading: 'Buscando una tarjeta…',
    revealLoading: 'Revelando…',
    correctCount: '{count}/10 en la fila correcta.',
    solvedKicker: 'Regla descubierta',
    solvedTitle: 'Clasificación perfecta.',
    solvedBody: 'Encontraste el enfoque oculto en {attempts} intentos.',
    resultKicker: 'El enfoque oculto',
    resultTitle: 'Este es el patrón.',
    resultRule: 'Los grupos se ordenan por {dimension}.',
    close: 'Cerrar',
    shareTitle: 'Resultado de Tensift',
    share: 'Compartir resultado',
    sharing: 'Preparando para compartir…',
    shareShared: 'Compartido',
    shareCopied: 'Copiado',
    shareRevealed: 'Respuesta revelada.',
    shareSolved: 'Lo resolví en {attempts} intentos.',
    shareHintUsed: 'Usé una pista.',
    shareError: 'No se pudo compartir ahora. Intenta de nuevo.',
    sourceLabel: 'Fuentes',
    dismiss: 'Descartar',
    errorTitle: 'Algo se desvió',
    genericError: 'No se pudo actualizar el rompecabezas. Intenta de nuevo.',
    boardIncompleteError: 'Coloca todas las tarjetas antes de comprobar.',
    hintUnavailableError: 'No hay una colocación de pista disponible ahora.',
    hintAlreadyUsedError: 'Este rompecabezas ya tiene una pista guardada para esta sesión.',
    requestTimeoutError: 'El nivel tardó demasiado en cargar. Intenta de nuevo.',
    networkError: 'No se pudo cargar el catálogo. Intenta de nuevo.',
    invalidResponseError: 'Los datos del nivel no son válidos. Intenta de nuevo.',
    noPuzzleError: 'No hay un rompecabezas disponible para este nivel.',
    rowLabel: 'Fila con {count} casillas',
    cardLabel: 'Tarjeta: {item}',
    selectCard: 'Seleccionar {item}',
    dropCard: 'Coloca aquí la tarjeta seleccionada',
    emptyTray: 'Todas las tarjetas están en el tablero.',
    levelBadge: 'Nivel {level}/{total}',
    levelsButton: 'Niveles ({solved}/{total})',
    prevLevel: 'Anterior',
    nextLevel: 'Siguiente',
    nextUnsolved: 'Siguiente sin resolver',
    randomLevel: 'Aleatorio',
    levelPickerTitle: 'Todos los 300 niveles',
    completedProgress: '{solved} de {total} resueltos',
    levelSearchPlaceholder: 'Buscar por número o tema…',
    difficultyEasy: 'Fácil',
    difficultyMedium: 'Medio',
    difficultyHard: 'Difícil',
    levelSolvedLabel: 'Resuelto',
  },
};

export function getMessages(locale: Locale): UiMessages {
  return messages[locale];
}
