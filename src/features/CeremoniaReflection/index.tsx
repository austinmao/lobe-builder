/**
 * CeremoniaReflection Feature
 *
 * Main container for the Year Reflection form.
 */
'use client';

import { exportFile, exportJSONFile } from '@lobechat/utils/client';
import { useCallback, useState } from 'react';

import { ClearDataModal } from './components/ClearDataModal';
import { ClosingMantra, Footer } from './components/ClosingMantra';
import { Header } from './components/Header';
import { HowToUse } from './components/HowToUse';
import { ImportanceSection } from './components/ImportanceSection';
import { MonthCard } from './components/MonthCard';
import { MonthProgress } from './components/MonthProgress';
import { NextLineSection } from './components/NextLineSection';
import { PendulumSection } from './components/PendulumSection';
import { StickyNav } from './components/StickyNav';
import { MONTHS, countCompletedMonths } from './types';
import { useReflectionStore } from './useReflectionStore';
import { generateMarkdown } from './utils/exportMarkdown';

/**
 * CeremoniaReflection Feature
 *
 * Main container for the Year Reflection form.
 */

export function CeremoniaReflection() {
  const {
    data,
    updateMonth,
    updatePendulums,
    updateImportance,
    updateNextLine,
    clearData,
    lastSaved,
    isSaving,
    getData,
  } = useReflectionStore();

  const [showClearModal, setShowClearModal] = useState(false);

  const completedMonths = countCompletedMonths(data.months);

  const handleStartClick = useCallback(() => {
    const element = document.getElementById('month-january');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    exportJSONFile(getData(), 'ceremonia-reflection-2024.json');
  }, [getData]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = generateMarkdown(getData());
    exportFile(markdown, 'ceremonia-reflection-2024.md');
  }, [getData]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyJSON = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getData(), null, 2));
      // Could add a toast notification here
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }, [getData]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <StickyNav
        completedMonths={completedMonths}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onClearData={() => setShowClearModal(true)}
        onExportJSON={handleExportJSON}
        onExportMarkdown={handleExportMarkdown}
        onPrint={handlePrint}
        totalMonths={12}
      />

      <Header
        onExportClick={handleCopyJSON}
        onPrintClick={handlePrint}
        onStartClick={handleStartClick}
      />

      <HowToUse />

      <MonthProgress completed={completedMonths} total={12} />

      {/* Month-by-Month Section */}
      <section
        style={{
          margin: '0 auto',
          maxWidth: '800px',
          padding: '0 24px 48px',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '24px',
          }}
        >
          Month-by-Month Reflections
        </h2>
        {MONTHS.map((month, index) => (
          <MonthCard
            data={data.months[month]}
            defaultOpen={index === 0}
            key={month}
            month={month}
            onUpdate={(field, value) => updateMonth(month, field, value)}
          />
        ))}
      </section>

      {/* Zoom Out Sections */}
      <section style={{ padding: '0 24px 48px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 auto 24px',
            maxWidth: '800px',
          }}
        >
          Zoom Out
        </h2>
        <PendulumSection data={data.pendulums} onUpdate={updatePendulums} />
        <ImportanceSection data={data.importance} onUpdate={updateImportance} />
        <NextLineSection data={data.nextLine} onUpdate={updateNextLine} />
      </section>

      <ClosingMantra />
      <Footer />

      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearData}
      />

      {/* Print Styles */}
      <style global jsx>{`
        @media print {
          .sticky-nav,
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          /* Expand all accordions for print */
          [aria-expanded='false'] + div,
          [aria-expanded='false'] + [id^='month-content-'],
          [id^='month-content-'] {
            display: block !important;
          }

          /* Reset page margins */
          @page {
            margin: 1in;
            size: letter;
          }

          /* Avoid page breaks inside cards */
          section,
          [id^='month-'] {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Ensure good print contrast */
          textarea,
          input {
            border: 1px solid #ccc !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
