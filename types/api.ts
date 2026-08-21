export type LoginRequest = { phone: string; name: string };
export type StartConversationRequest = { userId: string };
export type SendMessageRequest = { conversationId: string; text: string };
export type CreateGroupRequest = { name: string; participantIds: string[] };
export type AddParticipantsRequest = { userIds: string[] };
export type PromoteRequest = { userId: string };
export type RenameGroupRequest = { name: string };

export type User = {
  id: string;
  name: string;
  phone: string;
  createdAt: string | null;
};

export type MessageStatus = "sent" | "sending" | "failed";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  text: string;
  createdAt: string;
  status: MessageStatus;
};

export type Conversation = {
  id: string;
  name: string | null;
  isGroup: boolean;
  participantIds: string[];
  participants: User[];
  adminIds: string[];
  lastMessage: Message | null;
  createdAt: string | null;
};

export type Session = {
  token: string;
  user: User;
};

export type ApiErrorBody = {
  message: string;
  code: string | null;
  details: { path: string; message: string }[];
};

export type MessagePage = {
  messages: Message[];
  nextCursor: string | null;
};
