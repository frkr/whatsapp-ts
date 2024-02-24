export class MetaAuth {
    accid: string;
    apikey: string;
}

export const version = 19;
export const endpoint = "https://graph.facebook.com"
export const endpointVersion = `${endpoint}/v${version}.0`;

export function endpointMsg(accid: string): string {
    return `${endpointVersion}/${accid}/messages`;
}

//region META Classes
export class WhatsAppNotification {
    public readonly object: "whatsapp_business_account";
    public entry: Array<EntryEntity>;
}

export class EntryEntity {
    public id: string;
    public changes: Array<ValueObject>;
}

export class ValueObject {
    public value: ValueEntity;
    public field = "messages";
}

export class ValueEntity {
    public readonly messaging_product: "whatsapp";
    public metadata: MetadataEntity;
    public contacts?: Array<ContactsEntity>;
    public messages?: Array<MessageObjectEvent>;

    public errors: any // TODO
    public statuses: any // TODO
}

export class MetadataEntity {
    public display_phone_number: string;
    public phone_number_id: string;
}

export class ContactsEntity {
    public profile: ProfileEntity;
    public wa_id: string;
}

export class ProfileEntity {
    public name: string;
}

export type MessageTypesRequest =
    MediaTypes
    | "text"
    | "template"
    | "hsm"
    | "interactive"
    | "order"
    | "reaction"
    | "location"
    | "contacts"
export type MessageTypes = "button" | "system" | "unknown" | MessageTypesRequest

export type MediaTypes = "audio" | "document" | "image" | "sticker" | "video"


export class MessageObject {
    public type: MessageTypes;

    public audio?: MediaObject // TODO
    public button?: any // TODO
    public context?: any // TODO
    public document?: any // TODO
    public errors?: any // TODO
    public sticker?: any // TODO

    public identity?: any // TODO
    public image?: MediaMessage // TODO
    public interactive?: InteractiveMessage
    public location?: LocationMessage
    public order?: any // TODO
    public referral?: any // TODO
    public system?: any // TODO
    public reaction?: any // TODO
    public text?: TextMessage
    public video?: MediaMessage;

}

export class MessageObjectEvent extends MessageObject {
    public from: string;
    public id: string;
    public timestamp: string;
}

export class MessageObjectRequest extends MessageObject {
    public readonly messaging_product = "whatsapp";
    public readonly recipient_type = "individual"
    public to: string;
    public template?: any // TODO
    public hsm?: any // TODO
}


export class LocationMessage {
    public longitude?: string
    public latitude?: string
    public name?: string
    public address?: string
}

export class MessageEntity {
}

export class InteractiveMessage {
    public type: "list" | "button" = "list";
    public header?: VariableEntity;
    public body?: VariableEntity;
    public footer?: VariableEntity;
    public action?: ActionEntity;
}

export class ButtonEntity {
    public type = 'reply'
    public reply?: RowsEntity;
}

export class ActionEntity {
    public buttons?: Array<ButtonEntity>;
    public button?: string;
    public sections?: Array<SectionsEntity>;
}

export class SectionsEntity {
    public title?: string;
    public rows: Array<RowsEntity>;
}

export class RowsEntity {
    public id?: string;
    public title?: string;
    public description?: string;
}

export class VariableEntity {
    public type?: 'text';
    public text?: string;
}

export class MenuRequest {
    public title?: string;
    public botao?: string;
    public mensagem: string;
    public rodape?: string;
    public itens: Array<RowsEntity> | string[];
}

export class TextMessage extends MessageEntity {
    public preview_url?: boolean;
    public body: string;
}

export class MediaMessage extends MessageEntity {
    public id?: string;
    public link?: string;
    public filename?: string;
    public provider?: string;

}

export class MediaObject {
    public readonly messaging_product = "whatsapp"
    public url?: string
    public mime_type?: string
    public sha256?: string
    public file_size?: number

    public id?: string
    public caption?: string
}

//endregion

//region Common Functions
export function onlyNumbers(waid: string): string {
    return waid.replace(/[^0-9]/g, '');
}

export function defaultHeaders(bearer: string = null) {
    if (bearer) {
        return {
            Authorization: `Bearer ${bearer}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    } else {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }
}

export function defaultPayload(bearer: string = null, json: any = null, method = 'POST'): any {
    if (json) {
        return {
            headers: defaultHeaders(bearer),
            method: method,
            body: JSON.stringify(json),
        };
    } else {
        return {
            headers: defaultHeaders(bearer),
            method: 'GET',
        };
    }
}

async function defaultFetch(auth: MetaAuth, content: any): Promise<Response> {
    return fetch(endpointMsg(auth.accid), defaultPayload(auth.apikey, content));
}

export async function pinRegister(auth: MetaAuth, pin: string): Promise<Response> {
    return fetch(
        `${endpointVersion}/${auth.accid}/register`,
        defaultPayload(auth.apikey, {
            'messaging_product': 'whatsapp',
            'pin': pin,
        }),
    );
}

export async function readMessage(auth: MetaAuth, msgid: string): Promise<Response> {
    let content = {
        'messaging_product': 'whatsapp',
        'status': 'read',
        'message_id': msgid,
    };
    return defaultFetch(auth, content);
}

export async function sendMessage(auth: MetaAuth, message: MessageObjectRequest) {
    return defaultFetch(auth, message);
}

export async function sendMessageMultiPart(auth: MetaAuth, waid: string, texto: string): Promise<void> {
    if (!texto) {
        return;
    }
    let msgFinal = [];
    if (texto.length > 600) {
        msgFinal = texto.match(/.{1,600}/g);
    } else {
        msgFinal.push(texto);
    }

    for (let k = 0; k < msgFinal.length; k = k + 1) {
        await sendMessage(auth, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: waid,
            type: 'text',
            text: {
                body: msgFinal[k],
                preview_url: true,
            },
        });
    }
}

export async function sendTemplate(auth: MetaAuth, waid: string, namespace: string, param: string = null): Promise<Response> {

    let msgTmpl = {
        name: namespace,
        language: {code: 'pt_BR'},
    };
    if (param) {
        msgTmpl['components'] = [
            {
                type: 'body',
                parameters: [{
                    type: 'text',
                    text: param,
                }],
            },
        ];
    }

    let content = {
        messaging_product: 'whatsapp',
        to: waid,
        type: 'template',
        template: msgTmpl,
    } as MessageObjectRequest;

    return defaultFetch(auth, content);
}

export function challenge(VERIFY_TOKEN: string, request: Request): Response {
    if (request.method === 'GET') {
        let query = new URL(request.url).searchParams;
        if (
            query.get('hub.mode') === 'subscribe' &&
            query.get('hub.verify_token').startsWith(VERIFY_TOKEN)
        ) {
            return new Response(query.get('hub.challenge'), {status: 200});
        }
    }
    return new Response('404 Not Found', {status: 404});
}

export async function getMediaURL(apikey: string, id: string): Promise<MediaObject> {
    return await (await fetch(`${endpointVersion}/${id}/`, defaultPayload(apikey))).json();
}

export async function postMedia(auth: MetaAuth, buffer: Blob): Promise<MediaMessage> {
    let url = `${endpointVersion}/${auth.accid}/media/`;

    let form = new FormData();
    form.set('type', 'image/*');
    form.set('messaging_product', 'whatsapp');
    form.set('file', buffer);//, new Date().getMilliseconds() + ".webp;type=image/webp");

    let imageStore = await fetch(url, {
        headers: {
            Authorization: `Bearer ${auth.apikey}`,
        },
        method: 'POST',
        body: form,
    });

    return await imageStore.json();
}

export async function getMedia(apikey: string, url: string): Promise<Blob> {
    return await (await fetch(url, {
            headers: {
                Authorization: `Bearer ${apikey}`,
                'User-Agent': 'PostmanRuntime/7.26.8',
            },
            method: 'GET',
        },
    )).blob();
}

export async function sendOptions(auth: MetaAuth, waid: string, body: string, ...options: string[]): Promise<Response> {
    let content: MessageObjectRequest = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to: waid,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: body,
            },
            action: {
                buttons: options.map((item, index) => {
                    return {
                        type: 'reply',
                        reply: {
                            id: `${index}`,
                            title: item as string,
                        } as RowsEntity,
                    } as ButtonEntity;
                }),
            },
        },
    };

    return defaultFetch(auth, content);
}

export async function sendMenu(auth: MetaAuth, waid: string, menu: MenuRequest): Promise<Response> {
    let msgInteractive: InteractiveMessage = {
        type: 'list',
        header: null,
        body: null,
        footer: null,
        action: {
            button: (menu.botao) ? menu.botao : 'Menu',
            sections: [{
                rows: menu.itens.map((item, index) => {

                    let prod: RowsEntity = item;
                    if (typeof item === 'string') {
                        prod = {
                            description: item as string,
                        } as RowsEntity;
                    }

                    const id = (prod.id) ? prod.id : `${index + 1}`;
                    const title = (prod.title) ? prod.title : id;
                    const description = (prod.description) ? prod.description : null;

                    return {
                        id,
                        title,
                        description,
                    } as RowsEntity;
                }),
            }],
        },
    };
    if (menu.mensagem) {
        msgInteractive.body = {
            text: menu.mensagem as string,
        };
    }
    if (menu.rodape) {
        msgInteractive.footer = {
            text: menu.rodape as string,
        };
    }

    let content: MessageObjectRequest = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to: waid,
        type: 'interactive',
        interactive: msgInteractive,
    };

    return defaultFetch(auth, content);
}

export function templateGeneric(telefone: string, templ: string, namespace: string = null, ...args: string[]): MessageObjectRequest {
    const ret: MessageObjectRequest = {
        recipient_type: "individual",
        messaging_product: "whatsapp",
        to: telefone,
        type: "template",
        template: {
            namespace: namespace,
            name: templ,
            language: {code: "pt_BR"},
            components: [
                {
                    type: 'body',
                    parameters: []
                },
            ]
        }
    };
    if (!namespace) {
        delete ret.template.namespace;
    }
    if (!args || args.length === 0) {
        delete ret.template.components;
    } else {
        ret.template.components[0].parameters = args.map(item => {
            return {
                type: 'text',
                text: item,
            };
        });
    }

    return ret;
}

//endregion
