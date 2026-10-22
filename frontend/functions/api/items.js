export async function onRequestGet(context) {
    return new Response(JSON.stringify([
        {
            _id: 'cf-001',
            name: 'Serveur Cloudflare Edge',
            description: 'Backend exécuté sur Cloudflare Functions',
            createdAt: new Date().toISOString()
        }
    ]), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function onRequestPost(context) {
    const data = await context.request.json().catch(() => ({}));
    return new Response(JSON.stringify({
        _id: 'cf-' + Date.now(),
        name: data.name || 'Élément Cloudflare',
        description: data.description || '',
        createdAt: new Date().toISOString()
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key'
        }
    });
}
