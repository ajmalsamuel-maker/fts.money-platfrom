import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Translate text using DeepL or Google Translate API
 * Supports automated translation with quality checks
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, sourceLang, targetLang, provider = 'deepl' } = await req.json();

        if (!text || !sourceLang || !targetLang) {
            return Response.json({ 
                error: 'Missing required fields: text, sourceLang, targetLang' 
            }, { status: 400 });
        }

        let translatedText = '';

        if (provider === 'deepl') {
            // DeepL API (requires DEEPL_API_KEY secret)
            const apiKey = Deno.env.get('DEEPL_API_KEY');
            if (!apiKey) {
                return Response.json({ 
                    error: 'DeepL API key not configured',
                    fallback: true 
                }, { status: 500 });
            }

            const formData = new URLSearchParams({
                auth_key: apiKey,
                text: text,
                source_lang: sourceLang.toUpperCase(),
                target_lang: targetLang.toUpperCase()
            });

            const response = await fetch('https://api-free.deepl.com/v2/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`DeepL API error: ${response.statusText}`);
            }

            const data = await response.json();
            translatedText = data.translations[0].text;

        } else if (provider === 'google') {
            // Google Translate API (requires GOOGLE_TRANSLATE_API_KEY secret)
            const apiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
            if (!apiKey) {
                return Response.json({ 
                    error: 'Google Translate API key not configured',
                    fallback: true 
                }, { status: 500 });
            }

            const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`Google Translate API error: ${response.statusText}`);
            }

            const data = await response.json();
            translatedText = data.data.translations[0].translatedText;
        } else {
            return Response.json({ 
                error: 'Invalid provider. Use "deepl" or "google"' 
            }, { status: 400 });
        }

        // Quality check: ensure translation is not empty
        if (!translatedText || translatedText.trim() === '') {
            return Response.json({ 
                error: 'Translation returned empty result',
                needsReview: true 
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            translatedText,
            provider,
            sourceLang,
            targetLang,
            needsReview: false,
            confidence: 'high' // Would calculate based on API response
        });

    } catch (error) {
        console.error('Translation error:', error);
        return Response.json({ 
            error: error.message,
            needsReview: true 
        }, { status: 500 });
    }
});