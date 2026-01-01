/**
 * Reflection Store Hook
 *
 * Manages form state with localStorage persistence using ahooks.
 */
'use client';

import { useLocalStorageState, useMemoizedFn } from 'ahooks';
import { useCallback, useEffect, useState } from 'react';

import {
  type ImportanceSection,
  type Month,
  type MonthReflection,
  type NextLineSection,
  type PendulumSection,
  type ReflectionData,
  createEmptyReflectionData,
} from './types';

/**
 * Reflection Store Hook
 *
 * Manages form state with localStorage persistence using ahooks.
 */

const STORAGE_KEY = 'ceremonia-year-reflection-2024';

export function useReflectionStore() {
  const [data, setData] = useLocalStorageState<ReflectionData>(STORAGE_KEY, {
    defaultValue: createEmptyReflectionData(),
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update lastSaved when data changes
  useEffect(() => {
    if (data) {
      setLastSaved(new Date());
      setIsSaving(false);
    }
  }, [data]);

  const updateMonth = useMemoizedFn((month: Month, field: keyof MonthReflection, value: string) => {
    setIsSaving(true);
    setData((prev) => {
      const current = prev || createEmptyReflectionData();
      return {
        ...current,
        meta: {
          ...current.meta,
          updatedAt: new Date().toISOString(),
        },
        months: {
          ...current.months,
          [month]: {
            ...current.months[month],
            [field]: value,
          },
        },
      };
    });
  });

  const updatePendulums = useMemoizedFn((field: keyof PendulumSection, value: string) => {
    setIsSaving(true);
    setData((prev) => {
      const current = prev || createEmptyReflectionData();
      return {
        ...current,
        meta: {
          ...current.meta,
          updatedAt: new Date().toISOString(),
        },
        pendulums: {
          ...current.pendulums,
          [field]: value,
        },
      };
    });
  });

  const updateImportance = useMemoizedFn((field: keyof ImportanceSection, value: string) => {
    setIsSaving(true);
    setData((prev) => {
      const current = prev || createEmptyReflectionData();
      return {
        ...current,
        importance: {
          ...current.importance,
          [field]: value,
        },
        meta: {
          ...current.meta,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  });

  const updateNextLine = useMemoizedFn(
    (field: keyof NextLineSection, value: NextLineSection[keyof NextLineSection]) => {
      setIsSaving(true);
      setData((prev) => {
        const current = prev || createEmptyReflectionData();
        return {
          ...current,
          meta: {
            ...current.meta,
            updatedAt: new Date().toISOString(),
          },
          nextLine: {
            ...current.nextLine,
            [field]: value,
          },
        };
      });
    },
  );

  const clearData = useCallback(() => {
    setData(createEmptyReflectionData());
    setLastSaved(null);
  }, [setData]);

  const getData = useMemoizedFn(() => data || createEmptyReflectionData());

  return {
    clearData,
    data: data || createEmptyReflectionData(),
    getData,
    isSaving,
    lastSaved,
    updateImportance,
    updateMonth,
    updateNextLine,
    updatePendulums,
  };
}

export type ReflectionStore = ReturnType<typeof useReflectionStore>;
