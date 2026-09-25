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
}

const messages: Record<Locale, UiMessages> = {
  en: {
    eyebrow: 'Daily sorting puzzle',
    tagline: 'Ten items. Four groups. One hidden rule.',
    language: 'Language',
    theme: 'Theme',
    themeOriginal: 'Original',
    themeLight: 'Light',
    themeDark: 'Dark',
    topicLabel: 'Today’s puzzle',
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
    ruleUnlimited: 'Checks are unlimited.',
    ruleHint: 'Use one hint whenever you want; it places and locks a card.',
    loadingTitle: 'Preparing today’s puzzle',
    loadingBody: 'Finding ten cards and a fresh hidden rule…',
    retry: 'Try again',
    unavailableTitle: 'No puzzle here yet',
    unavailableBody: 'Today’s puzzle is taking a little longer to arrive. Check back soon.',
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
    requestTimeoutError: 'The puzzle service took too long to respond. Try again.',
    networkError: 'The puzzle service could not be reached. Check your connection and try again.',
    invalidResponseError: 'The puzzle service returned an invalid response. Try again.',
    noPuzzleError: 'No puzzle is available for this language today.',
    rowLabel: 'Row with {count} slots',
    cardLabel: 'Card: {item}',
    selectCard: 'Select {item}',
    dropCard: 'Place a selected card here',
    emptyTray: 'Every card is on the board.',
  },
  'zh-Hant': {
    eyebrow: '每日分類謎題',
    tagline: '十張卡片。四個分組。一個隱藏規則。',
    language: '語言',
    theme: '主題',
    themeOriginal: '原始',
    themeLight: '淺色',
    themeDark: '深色',
    topicLabel: '今日謎題',
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
    ruleUnlimited: '檢查次數不限。',
    ruleHint: '隨時使用一次提示；它會放置並鎖定一張卡。',
    loadingTitle: '正在準備今天的謎題',
    loadingBody: '正在尋找十張卡片和一個新的隱藏規則……',
    retry: '再試一次',
    unavailableTitle: '今天還沒有謎題',
    unavailableBody: '今日謎題很快就會到來，請稍後再回來看看。',
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
    requestTimeoutError: '謎題服務回應時間過長，請再試一次。',
    networkError: '無法連線謎題服務，請檢查網路後再試。',
    invalidResponseError: '謎題服務回傳了無效內容，請再試一次。',
    noPuzzleError: '今天沒有這個語言的謎題。',
    rowLabel: '有 {count} 個格子的列',
    cardLabel: '卡片：{item}',
    selectCard: '選擇 {item}',
    dropCard: '把選取的卡片放到這裡',
    emptyTray: '所有卡片都已放到棋盤上。',
  },
  'es-419': {
    eyebrow: 'Rompecabezas diario de clasificación',
    tagline: 'Diez elementos. Cuatro grupos. Una regla oculta.',
    language: 'Idioma',
    theme: 'Tema',
    themeOriginal: 'Original',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    topicLabel: 'Rompecabezas de hoy',
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
    ruleUnlimited: 'Puedes comprobar las veces que quieras.',
    ruleHint: 'Usa una pista cuando quieras; colocará y bloqueará una tarjeta.',
    loadingTitle: 'Preparando el rompecabezas de hoy',
    loadingBody: 'Buscando diez tarjetas y una nueva regla oculta…',
    retry: 'Intentar de nuevo',
    unavailableTitle: 'Aún no hay rompecabezas',
    unavailableBody: 'El rompecabezas de hoy llegará pronto. Vuelve a intentarlo en un momento.',
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
    requestTimeoutError: 'El servicio tardó demasiado en responder. Intenta de nuevo.',
    networkError: 'No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.',
    invalidResponseError: 'El servicio devolvió una respuesta no válida. Intenta de nuevo.',
    noPuzzleError: 'Hoy no hay un rompecabezas disponible en este idioma.',
    rowLabel: 'Fila con {count} casillas',
    cardLabel: 'Tarjeta: {item}',
    selectCard: 'Seleccionar {item}',
    dropCard: 'Coloca aquí la tarjeta seleccionada',
    emptyTray: 'Todas las tarjetas están en el tablero.',
  },
};

export function getMessages(locale: Locale): UiMessages {
  return messages[locale];
}
