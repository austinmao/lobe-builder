/**
 * Types for Ceremonia Year Reflection Form
 */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type Month = (typeof MONTHS)[number];

export interface MonthReflection {
  chapterTitle: string;
  emotions: string;
  innerState: string;
  stoodOut: string;
}

export interface PendulumSection {
  cost: string;
  primary: string;
  showedUp: string;
}

export interface ImportanceSection {
  meanTooMuch: string;
  reactedBy: string;
  reframe: string;
  withoutIt: string;
}

export const NEXT_LINE_STATES = [
  'Ease',
  'Trust',
  'Presence',
  'Clarity',
  'Grounded Confidence',
  'Openness',
  'Devotion',
] as const;

export type NextLineState = (typeof NEXT_LINE_STATES)[number];

export interface NextLineSection {
  action: string;
  feelsLike: string;
  sentences: string;
  state: NextLineState | '';
}

export interface ReflectionData {
  importance: ImportanceSection;
  meta: {
    updatedAt: string;
    version: number;
  };
  months: Record<Month, MonthReflection>;
  nextLine: NextLineSection;
  pendulums: PendulumSection;
}

export const createEmptyMonthReflection = (): MonthReflection => ({
  chapterTitle: '',
  emotions: '',
  innerState: '',
  stoodOut: '',
});

export const createEmptyReflectionData = (): ReflectionData => ({
  importance: {
    meanTooMuch: '',
    reactedBy: '',
    reframe: '',
    withoutIt: '',
  },
  meta: {
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  months: {
    April: createEmptyMonthReflection(),
    August: createEmptyMonthReflection(),
    December: createEmptyMonthReflection(),
    February: createEmptyMonthReflection(),
    January: createEmptyMonthReflection(),
    July: createEmptyMonthReflection(),
    June: createEmptyMonthReflection(),
    March: createEmptyMonthReflection(),
    May: createEmptyMonthReflection(),
    November: createEmptyMonthReflection(),
    October: createEmptyMonthReflection(),
    September: createEmptyMonthReflection(),
  },
  nextLine: {
    action: '',
    feelsLike: '',
    sentences: '',
    state: '',
  },
  pendulums: {
    cost: '',
    primary: '',
    showedUp: '',
  },
});

export const isMonthComplete = (month: MonthReflection): boolean => {
  return (
    month.stoodOut.trim() !== '' &&
    month.emotions.trim() !== '' &&
    month.innerState.trim() !== '' &&
    month.chapterTitle.trim() !== ''
  );
};

export const countCompletedMonths = (months: Record<Month, MonthReflection>): number => {
  return MONTHS.filter((m) => isMonthComplete(months[m])).length;
};
