// Mock browser globals for Node test environment
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = { addEventListener: () => {}, getElementById: () => null, querySelector: () => null };
global.window = { addEventListener: () => {} };

const { DEFAULT_SYSTEM_PROMPT } = await import('../js/ai-chat.js');

// Test 1: Check System Prompt does not contain em dashes
console.log('--- TEST 1: System Prompt Em Dash Check ---');
const emDashCount = (DEFAULT_SYSTEM_PROMPT.match(/[\u2014\u2013]/g) || []).length;
console.log('Em dashes found in DEFAULT_SYSTEM_PROMPT:', emDashCount);
if (emDashCount === 0) {
    console.log('PASS: System prompt has 0 em dashes / en dashes.');
} else {
    console.error('FAIL: System prompt contains em dashes!');
    process.exit(1);
}

// Test 2: Markdown rendering test
console.log('\n--- TEST 2: Blockquote with Inline Code & Em Dash ---');
// Minimal mock of GeminiAITerminal markdown methods
const terminal = {
    escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
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
    },
    renderCardOrQuote(rawBlock) {
        const rawLines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
        if (rawLines.length === 0) return '';
        let cardTitle = '';
        const rows = [];
        rawLines.forEach((rawLine, idx) => {
            const line = rawLine.replace(/^(?:&gt;|>)\s*/, '').trim();
            const cleaned = this.cleanMarkdownFormatting(line);
            const kvMatch = cleaned.match(/^([^:]+?):\s*(.+)$/);
            if (kvMatch && kvMatch[1].trim().length < 35) {
                rows.push({ key: kvMatch[1].trim().toLowerCase(), label: kvMatch[1].trim(), value: kvMatch[2].trim() });
            } else {
                rows.push({ key: 'general', label: '', value: cleaned });
            }
        });
        const hasKnownKeys = rows.some(r => ['original', 'target', 'indonesian'].includes(r.key));
        if (!hasKnownKeys && (!cardTitle || rows.length < 2)) {
            return `<blockquote class="ai-quote">${rawLines.map(l => l.replace(/^(?:&gt;|>)\s*/, '')).join('<br>')}</blockquote>`;
        }
        return `<div class="ai-card-block">CARD</div>`;
    },
    renderMarkdown(text) {
        if (!text) return '';
        text = text.replace(/[\u2014\u2013]/g, ' - ');
        let out = this.escapeHTML(text);
        const codeBlocks = [];
        const cardBlocks = [];
        const inlineCodes = [];
        out = out.replace(/`([^`\n]+)`/g, (match, code) => {
            const id = `§§§INLINE${inlineCodes.length}§§§`;
            inlineCodes.push(`<code class="ai-inline-code">${code}</code>`);
            return id;
        });
        out = out.replace(/(?:^(?:&gt;|>)[^\n]*(?:\n|$))+/gm, (match) => {
            const id = `§§§CARD${cardBlocks.length}§§§`;
            cardBlocks.push(this.renderCardOrQuote(match));
            return id + '\n';
        });

        let pass = 0;
        while (out.includes('§§§') && pass++ < 5) {
            cardBlocks.forEach((block, i) => { out = out.replace(`§§§CARD${i}§§§`, block); });
            codeBlocks.forEach((block, i) => { out = out.replace(`§§§CODE${i}§§§`, block); });
            inlineCodes.forEach((code, i) => { out = out.replace(`§§§INLINE${i}§§§`, code); });
        }
        out = out.replace(/§§§[A-Z0-9]+§§§/g, '');
        return out;
    }
};

const sampleInput = `Key takeaway:
> \`habibi\` (for males) and \`habibti\` (for females) are terms of endearment. While they directly mean "my love," their usage extends beyond just romantic partners to close friends and family, indicating warmth and affection. It's a very common and versatile word. Don't be surprised if someone calls you \`habibi\` even if you're not romantically involved – it's often just a friendly gesture.`;

const rendered = terminal.renderMarkdown(sampleInput);
console.log('Rendered output:\n', rendered);

if (rendered.includes('§§§INLINE')) {
    console.error('FAIL: Leaked token §§§INLINE still present in output!');
    process.exit(1);
} else {
    console.log('PASS: No leaked §§§INLINE tokens!');
}

if (rendered.includes('–') || rendered.includes('—')) {
    console.error('FAIL: En dash or em dash found in output!');
    process.exit(1);
} else {
    console.log('PASS: En dash and em dash completely eliminated!');
}

if (rendered.includes('<code class="ai-inline-code">habibi</code>')) {
    console.log('PASS: Inline code correctly restored inside blockquote!');
} else {
    console.error('FAIL: Inline code not restored inside blockquote!');
    process.exit(1);
}

console.log('\nALL VERIFICATIONS PASSED!');
