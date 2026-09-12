const sample = `| Metric | Mozambique | Benin | Verdict |
| :--- | :--- | :--- | :--- |
| Nominal GDP | ~$21B | ~$20B | Statistical tie |
| GDP Per Capita | ~$600 | ~$1,440 | Benin 2.4x richer |
| PPP Per Capita | ~$1,600 | ~$4,300 | Benin ~3x higher |`;

const regex = /(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n[ \t]*\|[^\n]+\|[ \t]*)+)/gm;

function renderTable(match) {
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
        html += `<th style="text-align:${align}">${h}</th>`;
    });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        if (row.length === 1 && row[0] === '') return;
        html += '<tr>';
        headers.forEach((_, i) => {
            const cell = row[i] !== undefined ? row[i] : '';
            const align = alignments[i] || 'left';
            html += `<td style="text-align:${align}">${cell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

const out = sample.replace(regex, renderTable);
console.log('OUTPUT HTML:\n', out);

if (out.includes('<table class="ai-table">') && out.includes('Mozambique') && out.includes('PPP Per Capita')) {
    console.log('\nPASS: Table rendered perfectly with all rows and headers!');
} else {
    console.error('\nFAIL: Table output missing expected content');
    process.exit(1);
}
