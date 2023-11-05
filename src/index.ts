export interface WAAuth {
    accid: string;
    apikey: string;
}

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

export function payload(apikey: string, json: object = null, method = "POST"): any {
    if (json) {
        return {
            headers: defaultHeaders(apikey),
            method: method,
            body: JSON.stringify(json),
        }
    } else {
        return {
            headers: defaultHeaders(apikey),
            method: "GET"
        }
    }
}

export function defaultUrlMsg(accid: string): string {
    return `https://graph.facebook.com/v18.0/${accid}/messages`;
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

export async function sendMessageMultiPart(auth: WAAuth, waid: string, texto: string): Promise<void> {
    if (!texto) {
        return;
    }
    let msgFinal = []
    if (texto.length > 600) {
        msgFinal = texto.split(/.{1,600/g);
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
            query.get('hub.verify_token').startsWith(VERIFY_TOKEN)
        ) {
            return new Response(query.get('hub.challenge'), {status: 200});
        }
    }
    return new Response("404 Not Found", {status: 404});
}

export async function getMediaURL(apikey: string, id: string): Promise<MediaObject> {
    return await (await fetch(`https://graph.facebook.com/v17.0/${id}/`, payload(apikey))).json();
}

export async function postMedia(auth: WAAuth, buffer: Blob): Promise<MediaMessage> {
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

export async function getMedia(apikey: string, url: string): Promise<Blob> {
    return await (await fetch(url, {
            headers: {
                Authorization: `Bearer ${apikey}`,
                'User-Agent': "PostmanRuntime/7.26.8",
            },
            method: "GET",
        }
    )).blob();
}

export async function sendOptions(auth: WAAuth, waid: string, body: string, ...options: string[]): Promise<Response> {
    let content: MessageObjectRequest = {
        recipient_type: "individual",
        messaging_product: "whatsapp",
        to: waid,
        type: "interactive",
        interactive: {
            type: "button",
            body: {
                text: body
            },
            action: {
                buttons: options.map((item, index) => {
                    return {
                        type: 'reply',
                        reply: {
                            id: `${new Date().getTime() + index}`,
                            title: item as string,
                        } as RowsEntity
                    } as ButtonEntity;
                })
            }
        }
    };

    return defaultFetch(auth, content);
}

export async function sendMenu(auth: WAAuth, waid: string, menu: MenuRequest): Promise<Response> {
    let msgInteractive: InteractiveMessage = {
        type: 'list',
        header: null,
        body: null,
        footer: null,
        action: {
            button: 'Menu',
            sections: [{
                title: menu.titulo as string,
                rows: menu.itens.map((item, index) => {
                    return {
                        id: `${index + 1}`,
                        title: ((item.title) ? item.title : item.description) as string,
                        description: ((item.description) ? item.description : item.title) as string,
                    } as RowsEntity;
                }),
            }]
        }
    }
    if (menu.titulo) {
        msgInteractive.header = {
            type: "text",
            text: menu.titulo as string,
        }
    }
    if (menu.mensagem) {
        msgInteractive.body = {
            text: menu.mensagem as string,
        }
    }
    if (menu.rodape) {
        msgInteractive.footer = {
            text: menu.rodape as string,
        }
    }

    let content: MessageObjectRequest = {
        recipient_type: "individual",
        messaging_product: "whatsapp",
        to: waid,
        type: "interactive",
        interactive: msgInteractive
    };

    return defaultFetch(auth, content);
}
