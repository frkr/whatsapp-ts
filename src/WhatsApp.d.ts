interface WhatsAppNotification {
    object: "whatsapp_business_account";
    entry: Array<EntryEntity>;
}

interface EntryEntity {
    id: string;
    changes: Array<ValueObject>;
}

interface ValueObject {
    value: ValueEntity;
    field: "messages";
}

interface ValueEntity {
    messaging_product: "whatsapp";
    metadata: MetadataEntity;
    contacts?: Array<ContactsEntity>;
    messages?: Array<MessageObjectEvent>;

    errors: any // TODO
    statuses: any // TODO
}

interface MetadataEntity {
    display_phone_number: string;
    phone_number_id: string;
}

interface ContactsEntity {
    profile: ProfileEntity;
    wa_id: string;
}

interface ProfileEntity {
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

interface MessageObjectRequest extends MessageObject {
    messaging_product: "whatsapp";
    recipient_type?: "individual"
    to: string;
    type: MessageTypesRequest;
    //ttl?: number
    template?: any // TODO
    hsm?: any // TODO
}

interface MessageObjectEvent extends MessageObject {
    from: string;
    id: string;
    timestamp: string;
}

interface MessageObject {
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

interface MessageEntity {
}

interface InteractiveMessage {
    type: "list";
    header?: VariableEntity;
    body?: VariableEntity;
    footer?: VariableEntity;
    action?: ActionEntity;
}

interface ActionEntity {
    button: string;
    sections: Array<SectionsEntity>;
}
interface SectionsEntity {
    title:string;
    rows: Array<RowsEntity>;
}

interface RowsEntity {
    id?: string;
    title: string;
    description?: string;
}

interface VariableEntity {
    type?: 'text';
    text?: string;
}

interface MenuRequest {
    titulo?: string;
    msg?: string;
    rodape?: string;
    itens: string[];
}

interface TextMessage extends MessageEntity {
    preview_url?: boolean;
    body: string;
}

interface MediaMessage extends MessageEntity {
    id?: string;
    link?: string;
    filename?: string;
    provider?: string;

}

interface MediaObject {
    messaging_product: "whatsapp",
    url?: string
    mime_type?: string
    sha256?: string
    file_size?: number,
    id?: string
    caption?: string
}
