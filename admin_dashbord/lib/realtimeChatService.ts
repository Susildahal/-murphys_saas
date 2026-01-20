import { 
  ref, 
  push, 
  set, 
  onValue, 
  query, 
  orderByChild,
  equalTo,
  update,
  get,
  limitToLast,
  off
} from "firebase/database";
import { realtimeDb } from "@/app/config/firebase";

export interface ChatMessage {
  id?: string;
  message: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  isAdmin: boolean;
  timestamp: number;
  read?: boolean;
}

export interface ChatConversation {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: "active" | "resolved" | "closed";
  lastMessage: string;
  lastMessageTime: number;
  createdAt: number;
  updatedAt: number;
  unreadCount?: number;
}

// Create a new chat conversation
export const createChatConversation = async (data: {
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  initialMessage: string;
}): Promise<string> => {
  try {
    const conversationsRef = ref(realtimeDb, "conversations");
    const newConversationRef = push(conversationsRef);
    const conversationId = newConversationRef.key!;

    const timestamp = Date.now();

    const conversationData: Omit<ChatConversation, "id"> = {
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      subject: data.subject,
      status: "active",
      lastMessage: data.initialMessage,
      lastMessageTime: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      unreadCount: 0,
    };

    await set(newConversationRef, conversationData);

    // Add initial message
    const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);
    
    const messageData: Omit<ChatMessage, "id"> = {
      message: data.initialMessage,
      senderId: data.userId,
      senderName: data.userName,
      senderEmail: data.userEmail,
      isAdmin: false,
      timestamp: timestamp,
      read: false,
    };

    await set(newMessageRef, messageData);

    return conversationId;
  } catch (error) {
    console.error("Error creating chat conversation:", error);
    throw error;
  }
};

// Send a message in a conversation
export const sendChatMessage = async (
  conversationId: string,
  message: {
    message: string;
    senderId: string;
    senderName: string;
    senderEmail: string;
    isAdmin: boolean;
  }
): Promise<void> => {
  try {
    const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);
    
    const timestamp = Date.now();
    
    const messageData: Omit<ChatMessage, "id"> = {
      ...message,
      timestamp,
      read: false,
    };

    await set(newMessageRef, messageData);

    // Update conversation last message
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    await update(conversationRef, {
      lastMessage: message.message,
      lastMessageTime: timestamp,
      updatedAt: timestamp,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Listen to messages in real-time
export const listenToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  console.log('[realtimeChatService] Setting up message listener for:', conversationId);
  const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
  const messagesQuery = query(messagesRef, orderByChild("timestamp"));

  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    console.log('[realtimeChatService] Messages snapshot received:', snapshot.exists(), snapshot.size);
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    console.log('[realtimeChatService] Parsed messages:', messages);
    callback(messages);
  });

  return unsubscribe;
};

// Listen to user conversations in real-time
export const listenToUserConversations = (
  userEmail: string,
  callback: (conversations: ChatConversation[]) => void
): (() => void) => {
  console.log('[realtimeChatService] Setting up conversation listener for user:', userEmail);
  const conversationsRef = ref(realtimeDb, "conversations");
  const userConversationsQuery = query(
    conversationsRef,
    orderByChild("userEmail"),
    equalTo(userEmail)
  );

  const unsubscribe = onValue(userConversationsQuery, (snapshot) => {
    console.log('[realtimeChatService] Conversations snapshot received:', snapshot.exists(), snapshot.size);
    const conversations: ChatConversation[] = [];
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    console.log('[realtimeChatService] Parsed conversations:', conversations);
    callback(conversations);
  });

  return unsubscribe;
};

// Listen to all conversations (for admin)
export const listenToAllConversations = (
  callback: (conversations: ChatConversation[]) => void,
  statusFilter?: ChatConversation["status"]
): (() => void) => {
  console.log('[realtimeChatService] Setting up admin conversation listener, filter:', statusFilter);
  const conversationsRef = ref(realtimeDb, "conversations");
  let conversationsQuery;

  if (statusFilter) {
    conversationsQuery = query(
      conversationsRef,
      orderByChild("status"),
      equalTo(statusFilter)
    );
  } else {
    conversationsQuery = conversationsRef;
  }

  const unsubscribe = onValue(conversationsQuery, (snapshot) => {
    console.log('[realtimeChatService] Admin conversations snapshot received:', snapshot.exists(), snapshot.size);
    const conversations: ChatConversation[] = [];
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });
    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    console.log('[realtimeChatService] Admin parsed conversations:', conversations);
    callback(conversations);
  });

  return unsubscribe;
};

// Update conversation status
export const updateConversationStatus = async (
  conversationId: string,
  status: ChatConversation["status"]
): Promise<void> => {
  try {
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    await update(conversationRef, {
      status,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  messageIds: string[]
): Promise<void> => {
  try {
    const updates: Record<string, any> = {};
    messageIds.forEach((messageId) => {
      updates[`messages/${conversationId}/${messageId}/read`] = true;
    });
    await update(ref(realtimeDb), updates);
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Search conversations by email
export const searchConversationsByEmail = async (
  email: string
): Promise<ChatConversation[]> => {
  try {
    const conversationsRef = ref(realtimeDb, "conversations");
    const searchQuery = query(
      conversationsRef,
      orderByChild("userEmail"),
      equalTo(email)
    );

    const snapshot = await get(searchQuery);
    const conversations: ChatConversation[] = [];
    
    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      });
    });

    conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    return conversations;
  } catch (error) {
    console.error("Error searching conversations:", error);
    throw error;
  }
};
