// Test error notification parsing logic
const sampleQuotaError = `Tone Generation Error: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit.
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.5-flash
Please retry in 49.948790048s.`;

function formatErrorMessage(msg) {
    if (typeof msg !== 'string') {
        try { msg = JSON.stringify(msg, null, 2); } catch { msg = String(msg); }
    }

    if (msg.includes('exceeded your current quota') || msg.includes('Quota exceeded') || msg.includes('429')) {
        const retryMatch = msg.match(/retry in\s+([0-9.]+)s/i);
        const retryText = retryMatch ? ` Please retry in ~${Math.ceil(parseFloat(retryMatch[1]))}s.` : '';
        return {
            title: 'Gemini API Quota Exceeded',
            badge: 'RATE LIMIT (429)',
            summary: `Free tier request limit reached for the active model.${retryText}`,
            details: msg
        };
    }

    return {
        title: 'Console Error',
        badge: 'RUNTIME ERROR',
        summary: msg.length > 220 ? msg.substring(0, 220) + '...' : msg,
        details: msg.length > 220 ? msg : null
    };
}

const parsed = formatErrorMessage(sampleQuotaError);
console.log('Parsed Quota Error:\n', JSON.stringify(parsed, null, 2));

if (parsed.title === 'Gemini API Quota Exceeded' && parsed.badge === 'RATE LIMIT (429)' && parsed.summary.includes('~50s')) {
    console.log('PASS: Gemini Quota Exceeded error correctly identified and summarized with retry timer!');
} else {
    console.error('FAIL: Error parsing did not match expected structure');
    process.exit(1);
}
