export class User {
    userId: string;
    firstname: string;
    lastname: string;
    email : string;
    creationTime: number;
    settings : Settings;
    isActive: boolean;
    isDeleted: boolean;
    deletedTime: number;
    avatar : Avatar;
    bio : string
    constructor(userId: string, firstname: string, lastname: string,email : string, creationTime: number,settings : Settings, isActive: boolean, isDeleted: boolean, deletedTime: number,avatar : Avatar,bio : string) {
        this.userId = userId;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.creationTime = creationTime;
        this.settings = settings;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.deletedTime = deletedTime;
        this.avatar = avatar;
        this.bio = bio;
    }
}

export class Device{
    key : string;
    token : string;
    constructor(key : string,token : string){
        this.key = key;
        this.token = token;
    }
}

export class Settings{
    darkTheme : boolean;
    notify : boolean;
    isPrivate : boolean
    constructor(darkTheme : boolean,notify : boolean,isPrivate : boolean){
        this.darkTheme = darkTheme;
        this.notify = notify;
        this.isPrivate = isPrivate;
    }
}

export class Avatar{
    avatarName : string;
    contentType : string;
    size : number;
    isActive : boolean;
    isDeleted : boolean;
    deletedTime : number;
    downloadURL ?: string;
    constructor(avatarName : string,contentType : string,size : number,isActive : boolean,isDeleted : boolean,deletedTime : number,downloadURL ?: string){
        this.avatarName = avatarName
        this.contentType = contentType;
        this.size = size
        this.isActive = isActive;
        this.isDeleted = isDeleted
        this.deletedTime = deletedTime;
        this.downloadURL = downloadURL;
    }
}

export class Following{
    followingId : string;
    followee : User;
    ownerId : string;
    requestTime : number;
    canFollow : boolean;
    acceptTime : number;
    isActive : boolean;
}

export class Follower{
    followerId : string;
    follower : User;
    ownerId : string;
    requestTime : number;
    canFollow : boolean;
    acceptTime : number;
    isActive : boolean;
}

export class Block{
    blockId : string;
    blockedUser : User;
    ownerId : string;
    blockedTime : number;
    isActive : boolean;
    liftTime : number;
}

export class Conversation {
    conversationId: string;
    createdTime: number;
    owner: User;
    deletedTime: number;
    isActive: boolean;
    isDeleted: boolean;
    title: string;
    constructor(conversationId: string, createdTime: number, owner: User, deletedTime: number, isActive: boolean, isDeleted: boolean, title: string) {
        this.conversationId = conversationId;
        this.createdTime = createdTime;
        this.owner = owner;
        this.deletedTime = deletedTime;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.title = title;
    }
}

export class Participant {
    participantId: string;
    conversationId: string;
    isOnline: boolean;
    type: number;
    creationTime: number;
    user: User;
    constructor(participantId: string, conversationId: string, isOnline: boolean, type: number, creationTime: number, user: User) {
        this.participantId = participantId;
        this.conversationId = conversationId;
        this.isOnline = isOnline;
        this.type = type;
        this.creationTime = creationTime;
        this.user = user;
    }
}

export class Message {
    messageId: string;
    messageType: number;
    messageContent: string;
    sender: User;
    conversationId: string;
    attachmentUrl: string;
    attachmentThumbUrl: string;
    createdTime: number;
    deletedTime: number;
    isActive: boolean;
    isDeleted: boolean;
    isRead: boolean;
    isSended: boolean;
    constructor(messageId: string, messageType: number, messageContent: string, sender: User, conversationId: string, attachmentUrl: string, attachmentThumbUrl: string, createdTime: number, deletedTime: number, isActive: boolean, isDeleted: boolean, isRead: boolean, isSended: boolean) {
        this.messageId = messageId;
        this.messageType = messageType;
        this.messageContent = messageContent;
        this.sender = sender;
        this.conversationId = conversationId;
        this.attachmentUrl = attachmentUrl;
        this.attachmentThumbUrl = attachmentThumbUrl;
        this.createdTime = createdTime;
        this.deletedTime = deletedTime;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.isRead = isRead;
        this.isSended = isSended;
    }
}

export class ConversationModel {
    conversation: Conversation;
    participants: Participant[];
    messages: Message[]
    constructor(conversation: Conversation, participants: Participant[], messages: Message[]) {
        this.conversation = conversation;
        this.participants = participants;
        this.messages = messages;
    }
}

export class UserModel {
    user: User;
    conversations: ConversationModel[];
    follower: User[];
    following: User[];
    constructor(user : User, conversations : ConversationModel[]) {
        this.user = user;
        this.conversations = conversations;
    }
}

export class Update {
    key : string;
    value : any;
    constructor(key : string, value : any) {
      this.key = key;
      this.value = value;
    }
  }