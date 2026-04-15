export type ScheduleDraft = {
  task: string;
  time: string;
  normalizedDate: string;
  normalizedTimeRange: string;
  location: string;
  people: string;
  notes: string;
};

export const emptyDraft: ScheduleDraft = {
  task: '',
  time: '',
  normalizedDate: '',
  normalizedTimeRange: '',
  location: '',
  people: '',
  notes: '',
};

const timeHintMap: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /(凌晨)/, value: '06:00-07:00' },
  { pattern: /(早上|清晨)/, value: '08:00-09:00' },
  { pattern: /(上午)/, value: '09:00-10:00' },
  { pattern: /(中午)/, value: '12:00-13:00' },
  { pattern: /(下午)/, value: '15:00-16:00' },
  { pattern: /(傍晚)/, value: '18:00-19:00' },
  { pattern: /(晚上|今晚)/, value: '20:00-21:00' },
];

function pad(num: number): string {
  return String(num).padStart(2, '0');
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function resolveWeekday(baseDate: Date, targetWeekday: number): Date {
  const current = baseDate.getDay();
  let delta = targetWeekday - current;
  if (delta <= 0) delta += 7;
  return addDays(baseDate, delta);
}

export function normalizeDateFromText(text: string, baseDate: Date = new Date()): string {
  if (/今天/.test(text)) return formatDate(baseDate);
  if (/明天/.test(text)) return formatDate(addDays(baseDate, 1));
  if (/后天/.test(text)) return formatDate(addDays(baseDate, 2));

  const weekMatch = text.match(/(?:下周|本周|这周|周)([一二三四五六日天])/);
  if (weekMatch) {
    const map: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0 };
    return formatDate(resolveWeekday(baseDate, map[weekMatch[1]]));
  }

  const fullDateMatch = text.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/);
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch;
    return `${year}-${pad(Number(month))}-${pad(Number(day))}`;
  }

  const shortDateMatch = text.match(/(\d{1,2})月(\d{1,2})[日号]?/);
  if (shortDateMatch) {
    const [, month, day] = shortDateMatch;
    const year = baseDate.getFullYear();
    return `${year}-${pad(Number(month))}-${pad(Number(day))}`;
  }

  return '';
}

export function normalizeTimeRange(text: string): string {
  const hm = text.match(/(\d{1,2})[:点时](\d{1,2})?/);
  if (hm) {
    const hour = Number(hm[1]);
    const minute = Number(hm[2] || 0);
    const start = `${pad(hour)}:${pad(minute)}`;
    const endDate = new Date();
    endDate.setHours(hour, minute);
    endDate.setHours(endDate.getHours() + 1);
    const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
    return `${start}-${end}`;
  }

  for (const hint of timeHintMap) {
    if (hint.pattern.test(text)) return hint.value;
  }
  return '';
}

function inferNotes(text: string): string {
  const notesMatch = text.match(/(注意|备注|记得|别忘了)([^，。,.；;]{2,40})/);
  return notesMatch?.[2]?.trim() || '';
}

export function extractScheduleDraft(text: string, baseDate?: Date): ScheduleDraft {
  const normalized = text.replace(/\s+/g, ' ').trim();

  const locationPatterns = [
    /(在|到|去|前往)([^，。,.；;]{2,28}(会议室|办公室|工厂|车间|医院|学校|机场|车站|酒店|园区|楼|层|路|街|号))/,
    /(地点是|地点在)([^，。,.；;]{2,28})/,
  ];

  const peoplePatterns = [
    /(和|跟|约|通知|联系)([^，。,.；;]{1,20})/,
    /(@[^\s，。,.；;]+)/,
  ];

  const pick = (patterns: RegExp[], group = 0): string => {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match) return (match[group] || match[0]).replace(/^(在|到|去|前往|和|跟|约|通知|联系)/, '').trim();
    }
    return '';
  };

  const naturalTimeSnippet = normalized.match(/(今天|明天|后天|下周[一二三四五六日天]?|周[一二三四五六日天]|本周[一二三四五六日天]?|\d{1,2}月\d{1,2}[日号]?|\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?|上午|中午|下午|晚上|凌晨|傍晚|\d{1,2}[:点时]\d{0,2}分?)/g)?.join(' ') || '';

  const task = normalized
    .replace(/(今天|明天|后天|下周[一二三四五六日天]?|周[一二三四五六日天]|本周[一二三四五六日天]?|\d{1,2}月\d{1,2}[日号]?|\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?)/g, '')
    .replace(/(上午|中午|下午|晚上|凌晨|傍晚)?\s*(\d{1,2}[:点时]\d{0,2}分?)/g, '')
    .replace(/(在|到|去|前往)[^，。,.；;]{2,28}(会议室|办公室|工厂|车间|医院|学校|机场|车站|酒店|园区|楼|层|路|街|号)/g, '')
    .replace(/(和|跟|约|通知|联系)[^，。,.；;]{1,20}/g, '')
    .replace(/(注意|备注|记得|别忘了)[^，。,.；;]{2,40}/g, '')
    .replace(/[，。,.；;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    task: task || '未识别到明确事项，可手动补充',
    time: naturalTimeSnippet,
    normalizedDate: normalizeDateFromText(normalized, baseDate),
    normalizedTimeRange: normalizeTimeRange(normalized),
    location: pick(locationPatterns, 2) || pick(locationPatterns),
    people: pick(peoplePatterns, 2) || pick(peoplePatterns),
    notes: inferNotes(normalized),
  };
}

export function buildWeatherWarning(code: number, precipitation: number): string {
  if (precipitation >= 70) return '降雨概率高，建议预留通勤缓冲并准备雨具。';
  if ([95, 96, 99].includes(code)) return '有雷暴风险，建议优先改为线上会议或提前出行。';
  if ([71, 73, 75, 77].includes(code)) return '可能出现降雪或道路湿滑，请关注交通状况。';
  if ([45, 48].includes(code)) return '有雾，能见度较低，外出注意安全。';
  return '暂无明显天气异常预警。';
}
