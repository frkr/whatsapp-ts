export function onlyNumbers(waid: string): string {
    return waid.replace(/[^0-9]/g, '');
}

export function defaultHeaders(apikey: string) {
    return {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
}

export function payload(apikey: string, json: object | null = null, method = "POST"): any {
    if (json === null) {
        return {
            headers: defaultHeaders(apikey),
            method: "GET"
        }
    } else {
        return {
            headers: defaultHeaders(apikey),
            method: method,
            body: JSON.stringify(json),
        }
    }
}

export function defaultUrl(accid: string): string {
    return `https://graph.facebook.com/v17.0/${accid}/messages`;
}

export async function readMessage(msgid: string, accid: string, apikey: string): Promise<void> {
// TODO
    let content = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": msgid,
    }

    await fetch(defaultUrl(accid), payload(apikey, content));
}

export async function sendMessage(message: MessageObjectRequest, accid: string, apikey: string) {
    await fetch(defaultUrl(accid), payload(apikey, message));
}

export async function sendMessageMultiPart(waid: string, texto: string, accid: string, apikey: string): Promise<void> {
    let msgFinal = []
    if (texto.length > 4096) {
        msgFinal = texto.match(/.{1,4096}/g);
    } else {
        msgFinal.push(texto)
    }

    for (let k = 0; k < msgFinal.length; k = k + 1) {
        await sendMessage({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: waid,
            type: "text",
            text: {
                body: msgFinal[k],
                preview_url: true
            }
        }, accid, apikey);
    }
}

export async function sendTemplate(namespace: string, waid: string, param: string, accid: string, apikey: string): Promise<void> {

    let msgTmpl = {
        name: namespace,
        language: {code: 'pt_BR'},
    }
    if (param) {
        msgTmpl["components"] = [
            {
                type: 'body',
                parameters: [{
                    type: 'text',
                    text: param
                }]
            }
        ]
    }

    let content = {
        messaging_product: "whatsapp",
        to: waid,
        type: "template",
        template: msgTmpl
    } as MessageObjectRequest

    await fetch(defaultUrl(accid), payload(apikey, content));
}

export function challenge(request: Request, VERIFY_TOKEN: string): Response {
    if (request.method === 'GET') {
        let query = new URL(request.url).searchParams;
        if (
            query.get('hub.mode') === "subscribe" &&
            query.get('hub.verify_token') === VERIFY_TOKEN
            //&& request.cf?.asOrganization === "Facebook" // Cloudflare
        ) {
            return new Response(query.get('hub.challenge'), {status: 200});
        }
    }
    return new Response("404 Not Found", {status: 404});
}

export async function getImageURL(imgid: string, apikey: string): Promise<MediaMessage> {
    return await (await fetch(`https://graph.facebook.com/v17.0/${imgid}/`, payload(apikey))).json();
}

export async function storeImage(buffer: Blob, accid: string, apikey: string): Promise<MediaMessage> {
    let url = `https://graph.facebook.com/v17.0/${accid}/media/`

    let form = new FormData();
    form.set('type', "image/*")
    form.set('messaging_product', "whatsapp")
    form.set('file', buffer)//, new Date().getMilliseconds() + ".webp;type=image/webp");

    let imageStore = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apikey}`
        },
        method: "POST",
        body: form
    });

    return await imageStore.json();
}

export async function getImage(url: string, apikey: string): Promise<Blob> {
    return await (await fetch(url, {
            headers: {
                Authorization: `Bearer ${apikey}`,
                //'User-Agent': "Cloudflare Workers",
                //"Accept": "image/webp;"
            },
            method: "GET",
            // cf: { // TODO Cloudflare
            //     image: {
            //         width: 512,
            //         height: 512,
            //         fit: "cover",
            //     },
            //     polish: "lossless",
            //     webp: true,
            // }
        }
    )).blob();
}
