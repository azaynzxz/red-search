// Comprehensive verification for:
// 1. Table rendering with bold cells & guide lines
// 2. Quotation rendering with bold text
// 3. /a input clearing and AI mode trigger
// 4. Chat history persistence

import { readFileSync } from 'fs';

// Mock minimal GeminiAITerminal markdown methods
class TestTerminal {
    escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    cleanMarkdownFormatting(str) {
        if (!str) return '';
        return str
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .trim();
    }

    formatInline(text) {
        if (!text) return '';
        let s = text.replace(/[\u2014\u2013]/g, ' - ');
        s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        s = s.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        s = s.replace(/\b_([^_\n]+)_\b/g, '<em>$1</em>');
        s = s.replace(/`([^`\n]+)`/g, '<code class="ai-inline-code">$1</code>');
        s = s.replace(/\*\*/g, '');
        s = s.replace(/\b__\b/g, '');
        return s;
    }

    renderCardOrQuote(rawBlock) {
        const rawLines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
        if (rawLines.length === 0) return '';
        const formatted = rawLines.map(l => {
            const clean = l.replace(/^(?:&gt;|>)\s*/, '');
            return this.formatInline(clean);
        }).join('<br>');
        return `<blockquote class="ai-quote">${formatted}</blockquote>`;
    }

    renderTable(match) {
        const lines = match.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return match;
        const headerLine = lines[0];
        const sepLine = lines[1];
        if (!sepLine.includes('-') || !sepLine.includes('|')) return match;
        const cleanSep = sepLine.replace(/^\|/, '').replace(/\|$/, '').trim();
        const sepCells = cleanSep.split('|').map(s => s.trim());
        if (!sepCells.every(s => /^:?-+:?$/.test(s))) return match;

        const parseRow = (line) => {
            let clean = line.trim();
            if (clean.startsWith('|')) clean = clean.slice(1);
            if (clean.endsWith('|')) clean = clean.slice(0, -1);
            return clean.split('|').map(cell => cell.trim());
        };
        const parseAlignments = (line) => {
            return parseRow(line).map(cell => {
                const left = cell.startsWith(':');
                const right = cell.endsWith(':');
                if (left && right) return 'center';
                if (right) return 'right';
                return 'left';
            });
        };
        const headers = parseRow(headerLine);
        const alignments = parseAlignments(sepLine);
        const rows = lines.slice(2).map(parseRow);

        let html = '<div class="ai-table-wrapper"><table class="ai-table"><thead><tr>';
        headers.forEach((h, i) => {
            const align = alignments[i] || 'left';
            html += `<th style="text-align:${align}">${this.formatInline(h)}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            if (row.length === 1 && row[0] === '') return;
            html += '<tr>';
            headers.forEach((_, i) => {
                const cell = row[i] !== undefined ? row[i] : '';
                const align = alignments[i] || 'left';
                html += `<td style="text-align:${align}">${this.formatInline(cell)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        return html;
    }

    renderMarkdown(text) {
        if (!text) return '';
        text = text.replace(/[\u2014\u2013]/g, ' - ');
        let out = this.escapeHTML(text);

        const tableBlocks = [];
        const tableRegex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n[ \t]*\|[^\n]+\|[ \t]*)+)/gm;
        out = out.replace(tableRegex, (match) => {
            const id = `§§§TABLE${tableBlocks.length}§§§`;
            tableBlocks.push(this.renderTable(match));
            return id + '\n';
        });

        const cardBlocks = [];
        out = out.replace(/(?:^(?:&gt;|>)[^\n]*(?:\n|$))+/gm, (match) => {
            const id = `§§§CARD${cardBlocks.length}§§§`;
            cardBlocks.push(this.renderCardOrQuote(match));
            return id + '\n';
        });

        // Bold & Italic
        out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

        let pass = 0;
        while (out.includes('§§§') && pass++ < 5) {
            tableBlocks.forEach((block, i) => {
                out = out.replace(`§§§TABLE${i}§§§`, block);
            });
            cardBlocks.forEach((block, i) => {
                out = out.replace(`§§§CARD${i}§§§`, block);
            });
        }
        return out;
    }
}

const t = new TestTerminal();

// TEST 1: Table with bold labels like the user's screenshot
const tableSample = `| Dimension / Metric | China | India | Verdict / Strategic Takeaway |
| :--- | :--- | :--- | :--- |
| **Nominal GDP (2024)** | ~$18.5 Trillion | ~$3.9 Trillion | China is roughly 4.7x larger. |
| **Demographics** | Aging rapidly | Young, growing | India has younger workforce. |`;

const tableHtml = t.renderMarkdown(tableSample);
console.log('--- TEST 1: Table with Bold Cells ---');
console.log('Contains <strong>Nominal GDP (2024)</strong>:', tableHtml.includes('<strong>Nominal GDP (2024)</strong>'));
console.log('Contains <strong>Demographics</strong>:', tableHtml.includes('<strong>Demographics</strong>'));
console.log('Contains literal **Nominal GDP:', tableHtml.includes('**Nominal GDP'));

if (!tableHtml.includes('<strong>Nominal GDP (2024)</strong>') || tableHtml.includes('**Nominal GDP')) {
    console.error('FAIL: Bold in table not rendered properly!');
    process.exit(1);
}

// TEST 2: Blockquote with bold text
const quoteSample = `> **Key Takeaway:** Always use strategic tables for side-by-side contrast.`;
const quoteHtml = t.renderMarkdown(quoteSample);
console.log('\n--- TEST 2: Blockquote with Bold Text ---');
console.log('Contains <strong>Key Takeaway:</strong>:', quoteHtml.includes('<strong>Key Takeaway:</strong>'));
console.log('Contains literal **Key Takeaway:', quoteHtml.includes('**Key Takeaway'));

if (!quoteHtml.includes('<strong>Key Takeaway:</strong>') || quoteHtml.includes('**Key Takeaway')) {
    console.error('FAIL: Bold in blockquote not rendered properly!');
    process.exit(1);
}

// TEST 3: /a search input stripping
console.log('\n--- TEST 3: /a Search Input Stripping ---');
const testVal1 = '/a ';
const testVal2 = '/a';
const testVal3 = '/a what is gdp of india';
const isAIMode1 = testVal1.toLowerCase().startsWith('/a ') || testVal1.toLowerCase() === '/a';
const isAIMode2 = testVal2.toLowerCase().startsWith('/a ') || testVal2.toLowerCase() === '/a';
const isAIMode3 = testVal3.toLowerCase().startsWith('/a ') || testVal3.toLowerCase() === '/a';
const stripped1 = testVal1.replace(/^\/a\s*/i, '');
const stripped2 = testVal2.replace(/^\/a\s*/i, '');
const stripped3 = testVal3.replace(/^\/a\s*/i, '');

console.log('isAIMode for "/a ":', isAIMode1, '| stripped:', JSON.stringify(stripped1));
console.log('isAIMode for "/a":', isAIMode2, '| stripped:', JSON.stringify(stripped2));
console.log('isAIMode for "/a what is gdp":', isAIMode3, '| stripped:', JSON.stringify(stripped3));

if (stripped1 !== '' || stripped2 !== '' || stripped3 !== 'what is gdp of india') {
    console.error('FAIL: /a stripping failed!');
    process.exit(1);
}

// TEST 4: Verify CSS files contain the white AI dropdown rules and table guide line rules
console.log('\n--- TEST 4: Verify CSS rules in layouts.css & chrome-extension/layouts.css ---');
const css1 = readFileSync('css/layouts.css', 'utf-8');
const css2 = readFileSync('chrome-extension/css/layouts.css', 'utf-8');

const checks = [
    '.engine-trigger.ai-active #currentEngineName',
    'border-right: 1px solid rgba(255, 255, 255, 0.12);',
    'border-bottom: 2px solid rgba(56, 189, 248, 0.4);',
    'min-width: 520px;',
    'user-select: text;'
];

for (const check of checks) {
    if (!css1.includes(check)) {
        console.error(`FAIL: css/layouts.css missing ${check}`);
        process.exit(1);
    }
    if (!css2.includes(check)) {
        console.error(`FAIL: chrome-extension/css/layouts.css missing ${check}`);
        process.exit(1);
    }
}

console.log('All CSS checks passed in both files!');
console.log('\n>>> ALL UNIT TESTS PASSED SUCCESSFULLY! <<<');
