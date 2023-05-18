interface WhatsApp {
    object: string;
    entry?: (EntryEntity)[] | null;
}

interface EntryEntity {
    id: string;
    changes?: (ChangesEntity)[] | null;
}

interface ChangesEntity {
    value: Value;
    field: string;
}

interface Value {
    messaging_product: string;
    metadata: Metadata;
    contacts?: (ContactsEntity)[] | null;
    messages?: (MessagesEntity)[] | null;
}

interface Metadata {
    display_phone_number: string;
    phone_number_id: string;
}

interface ContactsEntity {
    profile: Profile;
    wa_id: string;
}

interface Profile {
    name: string;
}

interface MessagesEntity {
    from: string;
    id: string;
    timestamp: string;
    type: "text" | "image" | "sticker";
    text?: TextMessage;
    image?: ImageMessage;
    sticker?: ImageMessage;
}

interface ImageMessage {
    type?: string | "text" | "image" | "sticker"
    mime_type?: string | "image/jpeg" | "image/webp"
    sha256?: string
    id?: string
    file_size?: number
    messaging_product?: string | "whatsapp"
    url?: string
    link?: string
}

interface TextMessage {
    preview_url?: boolean;
    body: string;
}
