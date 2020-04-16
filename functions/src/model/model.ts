export class User {
    userId: string;
    displayName: string;
    email: string;
    creationTime: number;
    settings: Settings;
    isActive: boolean;
    isDeleted: boolean;
    avatar: Avatar;
    bio: string;
    deletedTime?: number;
    constructor(userId: string, displayName: string,email: string, creationTime: number, settings: Settings, isActive: boolean, isDeleted: boolean, avatar: Avatar, bio: string,deletedTime?: number) {
        this.userId = userId;
        this.displayName = displayName;
        this.email = email;
        this.creationTime = creationTime;
        this.settings = settings;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.avatar = avatar;
        this.bio = bio;
        this.deletedTime = deletedTime;
    }
}

export class Device {
    key: string;
    token: string;
    constructor(key: string, token: string) {
        this.key = key;
        this.token = token;
    }
}

export class Settings {
    darkTheme: boolean;
    notify: boolean;
    isPrivate: boolean
    constructor(darkTheme: boolean, notify: boolean, isPrivate: boolean) {
        this.darkTheme = darkTheme;
        this.notify = notify;
        this.isPrivate = isPrivate;
    }
}

export class Avatar {
    avatarName: string;
    contentType: string;
    size: number;
    isActive: boolean;
    isDeleted: boolean;
    deletedTime?: number;
    downloadURL?: string;
    constructor(avatarName: string, contentType: string, size: number, isActive: boolean, isDeleted: boolean, deletedTime?: number, downloadURL?: string) {
        this.avatarName = avatarName
        this.contentType = contentType;
        this.size = size
        this.isActive = isActive;
        this.isDeleted = isDeleted
        this.deletedTime = deletedTime;
        this.downloadURL = downloadURL;
    }
}

export class Conversation {
    conversationId: string;
    createdTime: number;
    owner: User;
    isActive: boolean;
    isDeleted: boolean;
    title?: string;
    deletedTime?: number;
    constructor(conversationId: string, createdTime: number, owner: User, isActive: boolean, isDeleted: boolean, title?: string, deletedTime?: number) {
        this.conversationId = conversationId;
        this.createdTime = createdTime;
        this.owner = owner;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.title = title;
        this.deletedTime = deletedTime;
    }
}

export class Participant {
    participantId: string;
    conversationId: string;
    type: number;
    creationTime: number;
    user: User;
    constructor(participantId: string, conversationId: string, type: number, creationTime: number, user: User) {
        this.participantId = participantId;
        this.conversationId = conversationId;
        this.type = type;
        this.creationTime = creationTime;
        this.user = user;
    }
}

export class Message {
    messageId: string;
    messageType: number;
    messageContent: string;
    owner: User;
    conversationId: string;
    createdTime: number;
    isActive: boolean;
    isDeleted: boolean;
    isRead: boolean;
    isSended: boolean;
    attachmentUrl?: string;
    attachmentThumbUrl?: string;
    deletedTime?: number;
    constructor(messageId: string, messageType: number, messageContent: string, owner: User, conversationId: string,  createdTime: number, isActive: boolean, isDeleted: boolean, isRead: boolean, isSended: boolean,attachmentUrl?: string, attachmentThumbUrl?: string, deletedTime?: number) {
        this.messageId = messageId;
        this.messageType = messageType;
        this.messageContent = messageContent;
        this.owner = owner;
        this.conversationId = conversationId;
        this.createdTime = createdTime;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.isRead = isRead;
        this.isSended = isSended;
        this.attachmentUrl = attachmentUrl;
        this.attachmentThumbUrl = attachmentThumbUrl;
        this.deletedTime = deletedTime;
    }
}