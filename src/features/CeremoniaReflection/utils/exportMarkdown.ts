/**
 * Export Reflection Data to Markdown
 */
/* eslint-disable unicorn/no-array-push-push */
import { MONTHS, type ReflectionData } from '../types';

export function generateMarkdown(data: ReflectionData): string {
  const sections: string[] = [];

  // Header
  sections.push(
    [
      '# Ceremonia Alumni Year Reflection — Transcend Together',
      '',
      `_Generated on ${new Date().toLocaleDateString()}_`,
      '',
      '---',
      '',
    ].join('\n'),
  );

  // Month-by-Month
  sections.push(['## Month-by-Month Reflections', ''].join('\n'));

  for (const month of MONTHS) {
    const m = data.months[month];
    const monthLines = [`### ${month}`, ''];

    if (m.stoodOut) {
      monthLines.push('**What stood out this month:**', m.stoodOut, '');
    }

    if (m.emotions) {
      monthLines.push('**Dominant emotions or tone:**', m.emotions, '');
    }

    if (m.innerState) {
      monthLines.push('**What this reveals about my inner state:**', m.innerState, '');
    }

    if (m.chapterTitle) {
      monthLines.push(`**Chapter title:** _"${m.chapterTitle}"_`, '');
    }

    monthLines.push('---', '');
    sections.push(monthLines.join('\n'));
  }

  // Pendulums
  const pendulumLines = ['## Zoom Out: Pendulums', ''];
  if (data.pendulums.primary) {
    pendulumLines.push(`**My primary pendulum this year was:** ${data.pendulums.primary}`, '');
  }
  if (data.pendulums.showedUp) {
    pendulumLines.push('**How it showed up across the year:**', data.pendulums.showedUp, '');
  }
  if (data.pendulums.cost) {
    pendulumLines.push('**What it cost me:**', data.pendulums.cost, '');
  }
  pendulumLines.push('---', '');
  sections.push(pendulumLines.join('\n'));

  // Importance
  const importanceLines = ['## Zoom Out: Importance', ''];
  if (data.importance.meanTooMuch) {
    importanceLines.push('**I made this mean too much:**', data.importance.meanTooMuch, '');
  }
  if (data.importance.withoutIt) {
    importanceLines.push(
      "**I believed I wouldn't be okay without it:**",
      data.importance.withoutIt,
      '',
    );
  }
  if (data.importance.reactedBy) {
    importanceLines.push(
      '**When it felt threatened, I reacted by:**',
      data.importance.reactedBy,
      '',
    );
  }
  if (data.importance.reframe) {
    importanceLines.push('**Gentler reframe (with trust):**', data.importance.reframe, '');
  }
  importanceLines.push('---', '');
  sections.push(importanceLines.join('\n'));

  // Next Line
  const nextLineLines = ['## Zoom Out: Choosing Your Next Line', ''];
  if (data.nextLine.state) {
    nextLineLines.push(`**Chosen state:** ${data.nextLine.state}`, '');
  }
  if (data.nextLine.feelsLike) {
    nextLineLines.push(`**My next line feels like:** ${data.nextLine.feelsLike}`, '');
  }
  if (data.nextLine.sentences) {
    nextLineLines.push('**Three present-tense sentences:**', data.nextLine.sentences, '');
  }
  if (data.nextLine.action) {
    nextLineLines.push(`**One small alignment action:** ${data.nextLine.action}`, '');
  }
  nextLineLines.push('---', '');
  sections.push(nextLineLines.join('\n'));

  // Closing
  sections.push(
    [
      '## Closing Mantra',
      '',
      "_I don't need to force the future._",
      "_I see how I've been choosing._",
      '_And I choose again — together._',
      '',
      '---',
      '',
      '_Ceremonia · Transcend Together_',
    ].join('\n'),
  );

  return sections.join('');
}
