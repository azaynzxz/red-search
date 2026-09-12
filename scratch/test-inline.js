function formatInline(text) {
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

console.log(formatInline('**Nominal GDP (2024)**'));
console.log(formatInline('**Demographics**'));
console.log(formatInline('**Quote Title:** *Something special* with `code`'));
