import "./index";
// import {ImageMessage, TextMessage} from "./WhatsApp";
export function onlyNumbers(waid) {
    return waid.replace(/[^0-9]/g, '');
}
export function defaultHeaders(apikey) {
    return {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
}
export function payload(apikey, json = null, method = "POST") {
    if (json === null) {
        return {
            headers: defaultHeaders(apikey),
            method: "GET"
        };
    }
    else {
        return {
            headers: defaultHeaders(apikey),
            method: method,
            body: JSON.stringify(json),
        };
    }
}
export function defaultUrl(accid) {
    return `https://graph.facebook.com/v16.0/${accid}/messages`;
}
export async function readMessage(msgid, accid, apikey) {
    let content = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": msgid,
    };
    await fetch(defaultUrl(accid), payload(apikey, content));
}
// TODO fazer msg de template
export async function sendMessage(waid, type, message, accid, apikey) {
    let content = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": waid,
        "type": type,
    };
    content[type] = message;
    await fetch(defaultUrl(accid), payload(apikey, content));
}
export async function sendMessageMultiPart(waid, texto, accid, apikey) {
    let msgFinal = [];
    if (texto.length > 4096) {
        msgFinal = texto.match(/.{1,4096}/g);
    }
    else {
        msgFinal.push(texto);
    }
    for (let k = 0; k < msgFinal.length; k = k + 1) {
        await sendMessage(waid, "text", { body: msgFinal[k], preview_url: true }, accid, apikey);
    }
}
export async function sendTemplate(namespace, waid, param, accid, apikey) {
    let msgTmpl = {
        name: namespace,
        language: { code: 'pt_BR' },
        components: [
            {
                type: 'body',
                parameters: [{
                        type: 'text',
                        text: param
                    }]
            }
        ]
    };
    let content = {
        "messaging_product": "whatsapp",
        "to": waid,
        "type": "template",
        "template": msgTmpl
    };
    await fetch(defaultUrl(accid), payload(apikey, content));
}
export function challenge(request, VERIFY_TOKEN) {
    if (request.method === 'GET') {
        let query = new URL(request.url).searchParams;
        if (query.get('hub.mode') === "subscribe" &&
            query.get('hub.verify_token') === VERIFY_TOKEN
        //&& request.cf?.asOrganization === "Facebook" // Cloudflare
        ) {
            return new Response(query.get('hub.challenge'), { status: 200 });
        }
    }
    return new Response("404 Not Found", { status: 404 });
}
export async function getImageURL(imgid, apikey) {
    return await (await fetch(`https://graph.facebook.com/v16.0/${imgid}/`, payload(apikey))).json();
}
export async function storeImage(buffer, accid, apikey) {
    let url = `https://graph.facebook.com/v16.0/${accid}/media/`;
    let form = new FormData();
    form.set('type', "image/*");
    form.set('messaging_product', "whatsapp");
    form.set('file', buffer); //, new Date().getMilliseconds() + ".webp;type=image/webp");
    let imageStore = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apikey}`
        },
        method: "POST",
        body: form
    });
    return await imageStore.json();
}
export async function getImage(url, apikey) {
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
    })).blob();
}
