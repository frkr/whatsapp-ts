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
    messages?: Array<MessageObject>;

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

type MessageTypesSend = "text" | "template" | "hsm" | "interactive" | "order" | "reaction" | "location" | "contacts"
type MessageTypes = "button" | "system" | "unknown" | MessageTypesSend | MediaTypes

type MediaTypes = "audio" | "document" | "image" | "sticker" | "video"

interface MessageObjectSend extends MessageObject {
    messaging_product: "whatsapp";
    recipient_type?: "individual"
    to: string;
    type: MessageTypesSend;
    //ttl?: number
    template?: any // TODO
    hsm?: any // TODO
}

interface MessageObject {
    type: MessageTypes;

    audio?: any // TODO
    button?: any // TODO
    context?: any // TODO
    document?: any // TODO
    errors?: any // TODO
    from: string;
    id: string;

    identity?: any // TODO
    image?: any // TODO
    interactive?: any // TODO
    order?: any // TODO
    referral?: any // TODO
    system: any // TODO
    text?: TextMessage
    timestamp: string;
    video: MessageTypes;

}

interface TextMessage {
    preview_url?: boolean;
    body: string;
    timestamp?: number
}

interface MediaMessage {
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