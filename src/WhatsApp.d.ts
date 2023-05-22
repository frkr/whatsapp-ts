export interface WhatsApp {
    object: string;
    entry?: (EntryEntity)[] | null;
}

export interface EntryEntity {
    id: string;
    changes?: (ChangesEntity)[] | null;
}

export interface ChangesEntity {
    value: Value;
    field: string;
}

export interface Value {
    messaging_product: string;
    metadata: Metadata;
    contacts?: (ContactsEntity)[] | null;
    messages?: (MessagesEntity)[] | null;
}

export interface Metadata {
    display_phone_number: string;
    phone_number_id: string;
}

export interface ContactsEntity {
    profile: Profile;
    wa_id: string;
}

export interface Profile {
    name: string;
}

export interface MessagesEntity {
    from: string;
    id: string;
    timestamp: string;
    type: "text" | "image" | "sticker";
    text?: TextMessage;
    image?: ImageMessage;
    sticker?: ImageMessage;
}

export interface ImageMessage {
    type?: string | "text" | "image" | "sticker"
    mime_type?: string | "image/jpeg" | "image/webp"
    sha256?: string
    id?: string
    file_size?: number
    messaging_product?: string | "whatsapp"
    url?: string
    link?: string
}

export interface TextMessage {
    preview_url?: boolean;
    body: string;
}
