//region Types
export interface WAAuth {
    accid: string;
    apikey: string;
}

//endregion


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

export function defaultUrlMsg(accid: string): string {
    return `https://graph.facebook.com/v17.0/${accid}/messages`;
}

async function defaultFetch(auth: WAAuth, content: object): Promise<Response> {
    return fetch(defaultUrlMsg(auth.accid), payload(auth.apikey, content));
}

export async function readMessage(auth: WAAuth, msgid: string): Promise<Response> {
    let content = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": msgid,
    }
    return defaultFetch(auth, content);
}

export async function sendMessage(auth: WAAuth, message: MessageObjectRequest) {
    return defaultFetch(auth, message);
}

export async function sendMessageMultiPart(auth: WAAuth, waid: string, texto: string, limit = 4096): Promise<void> {
    let msgFinal = []
    if (texto.length > limit) {
        msgFinal = texto.match(new RegExp(`.{1,${limit}}/g`));
    } else {
        msgFinal.push(texto)
    }

    for (let k = 0; k < msgFinal.length; k = k + 1) {
        await sendMessage(auth, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: waid,
            type: "text",
            text: {
                body: msgFinal[k],
                preview_url: true
            }
        });
    }
}

export async function sendTemplate(auth: WAAuth, waid: string, namespace: string, param: string = null): Promise<Response> {

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

    return defaultFetch(auth, content);
}

export function challenge(VERIFY_TOKEN: string, request: Request): Response {
    if (request.method === 'GET') {
        let query = new URL(request.url).searchParams;
        if (
            query.get('hub.mode') === "subscribe" &&
            query.get('hub.verify_token') === VERIFY_TOKEN
        ) {
            return new Response(query.get('hub.challenge'), {status: 200});
        }
    }
    return new Response("404 Not Found", {status: 404});
}

export async function getImageURL(apikey: string, imgid: string): Promise<MediaMessage> {
    return await (await fetch(`https://graph.facebook.com/v17.0/${imgid}/`, payload(apikey))).json();
}

export async function storeImage(auth: WAAuth, buffer: Blob): Promise<MediaMessage> {
    let url = `https://graph.facebook.com/v17.0/${auth.accid}/media/`

    let form = new FormData();
    form.set('type', "image/*")
    form.set('messaging_product', "whatsapp")
    form.set('file', buffer)//, new Date().getMilliseconds() + ".webp;type=image/webp");

    let imageStore = await fetch(url, {
        headers: {
            Authorization: `Bearer ${auth.apikey}`
        },
        method: "POST",
        body: form
    });

    return await imageStore.json();
}

export async function getImage(apikey: string, url: string): Promise<Blob> {
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
