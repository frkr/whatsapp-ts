
export class WAAuth {
    accid: string;
    apikey: string;
}

export class WhatsAppNotification {
    object: "whatsapp_business_account";
    entry: Array<EntryEntity>;
}

export class EntryEntity {
    id: string;
    changes: Array<ValueObject>;
}

export class ValueObject {
    value: ValueEntity;
    field: "messages";
}

export class ValueEntity {
    messaging_product: "whatsapp";
    metadata: MetadataEntity;
    contacts?: Array<ContactsEntity>;
    messages?: Array<MessageObjectEvent>;

    errors: any // TODO
    statuses: any // TODO
}

export class MetadataEntity {
    display_phone_number: string;
    phone_number_id: string;
}

export class ContactsEntity {
    profile: ProfileEntity;
    wa_id: string;
}

export class ProfileEntity {
    name: string;
}

type MessageTypesRequest =
    MediaTypes
    | "text"
    | "template"
    | "hsm"
    | "interactive"
    | "order"
    | "reaction"
    | "location"
    | "contacts"
type MessageTypes = "button" | "system" | "unknown" | MessageTypesRequest

type MediaTypes = "audio" | "document" | "image" | "sticker" | "video"

export class MessageObject {
    type: MessageTypes;

    audio?: MediaObject // TODO
    button?: any // TODO
    context?: any // TODO
    document?: any // TODO
    errors?: any // TODO

    identity?: any // TODO
    image?: MediaMessage // TODO
    interactive?: InteractiveMessage
    order?: any // TODO
    referral?: any // TODO
    system?: any // TODO
    text?: TextMessage
    video?: MediaMessage;

}
export class MessageObjectRequest extends MessageObject {
    messaging_product: "whatsapp";
    recipient_type?: "individual"
    to: string;
    type: MessageTypesRequest=null;
    //ttl?: number
    template?: any // TODO
    hsm?: any // TODO
}

export class MessageObjectEvent extends MessageObject {
    from: string;
    id: string;
    timestamp: string;
}


export class MessageEntity {
}

export class InteractiveMessage {
    type: "list";
    header?: VariableEntity;
    body?: VariableEntity;
    footer?: VariableEntity;
    action?: ActionEntity;
}

export class ActionEntity {
    button: string;
    sections: Array<SectionsEntity>;
}
export class SectionsEntity {
    title:string;
    rows: Array<RowsEntity>;
}

export class RowsEntity {
    id?: string;
    title?: string;
    description?: string;
}

export class VariableEntity {
    type?: 'text';
    text?: string;
}

export class MenuRequest {
    titulo?: string;
    msg?: string;
    rodape?: string;
    itens: string[];
}

export class TextMessage extends MessageEntity {
    preview_url?: boolean;
    body: string;
}

export class MediaMessage extends MessageEntity {
    id?: string;
    link?: string;
    filename?: string;
    provider?: string;

}

export class MediaObject {
    messaging_product: "whatsapp";
    url?: string
    mime_type?: string
    sha256?: string
    file_size?: number;
    id?: string
    caption?: string
}
