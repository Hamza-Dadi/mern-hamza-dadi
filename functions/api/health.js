export async function onRequestGet(context) {
    return new Response(JSON.stringify({
        status: 'ok',
        message: 'Backend Cloudflare opérationnel',
        database: 'connected',
        platform: 'Cloudflare Pages Functions',
        timestamp: new Date().toISOString()
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
