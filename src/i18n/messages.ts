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
  'zh-Hans': {
    eyebrow: '每日分类谜题',
    tagline: '十张卡片。四个分组。一个隐藏规则。',
    language: '语言',
    theme: '主题',
    themeOriginal: '原始',
    themeLight: '浅色',
    themeDark: '深色',
    topicLabel: '今日谜题',
    attempts: '尝试次数',
    instruction: '把每张卡片放进四行。行的格数，是你唯一能看见的线索。',
    unsortedCards: '未分类卡片',
    remaining: '剩余 {count} 张',
    reset: '重置棋盘',
    shuffle: '打乱',
    useHint: '提示',
    check: '检查排列',
    reveal: '显示答案',
    findLens: '找到观察角度。',
    rulesBody: '每一行都使用同一种事实。数字只告诉你每组有几张卡，并不告诉你分组的含义。',
    ruleTap: '点击卡片，再点击格子；也可以拖动。',
    ruleUnlimited: '检查次数不限。',
    ruleHint: '随时使用一次提示；它会放置并锁定一张卡。',
    loadingTitle: '正在准备今天的谜题',
    loadingBody: '正在寻找十张卡片和一个新的隐藏规则……',
    retry: '再试一次',
    unavailableTitle: '今天还没有谜题',
    unavailableBody: '今日谜题很快就会到来，请稍后再回来看看。',
    emptySlot: '放置',
    remove: '移除 {item}',
    locked: '已锁定',
    hintUsed: '提示已使用',
    hintPlaced: '已放置并锁定「{item}」。',
    checking: '检查中……',
    hintLoading: '正在寻找卡片……',
    revealLoading: '正在揭晓……',
    correctCount: '{count}/10 张在正确的行。',
    solvedKicker: '发现规则',
    solvedTitle: '完美分类。',
    solvedBody: '你用 {attempts} 次尝试找到了隐藏角度。',
    resultKicker: '隐藏角度',
    resultTitle: '规律在这里。',
    resultRule: '这些分组按照「{dimension}」分类。',
    close: '关闭',
    sourceLabel: '资料来源',
    dismiss: '关闭提示',
    errorTitle: '出了点小问题',
    genericError: '谜题更新失败，请再试一次。',
    boardIncompleteError: '请先把所有卡片放满，再进行检查。',
    hintUnavailableError: '现在没有可用的提示位置。',
    hintAlreadyUsedError: '这个谜题在本次游戏中已经使用过提示。',
    requestTimeoutError: '谜题服务响应时间过长，请再试一次。',
    networkError: '无法连接谜题服务，请检查网络后再试。',
    invalidResponseError: '谜题服务返回了无效内容，请再试一次。',
    noPuzzleError: '今天没有这个语言的谜题。',
    rowLabel: '有 {count} 个格子的行',
    cardLabel: '卡片：{item}',
    selectCard: '选择 {item}',
    dropCard: '把选中的卡片放到这里',
    emptyTray: '所有卡片都已放到棋盘上。',
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
