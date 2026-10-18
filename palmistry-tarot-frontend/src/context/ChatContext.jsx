import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  increment,
  writeBatch,
  getDocs
} from "firebase/firestore";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userChats, setUserChats] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // 1. Real-Time Listener for User's Chats & Total Unread Count
  useEffect(() => {
    if (!user?.uid) {
      setUserChats([]);
      setTotalUnreadCount(0);
      setActiveChat(null);
      setIsOpen(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let unreadTotal = 0;
        const chatsList = snapshot.docs.map((docSnap) => {
          const chat = { id: docSnap.id, ...docSnap.data() };
          const isUserRole = user.uid === chat.userId;
          const chatUnread = isUserRole
            ? (chat.unreadCountUser || 0)
            : (chat.unreadCountExpert || 0);
          unreadTotal += chatUnread;
          return chat;
        });

        // Sort chats by most recent message or update
        chatsList.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

        setUserChats(chatsList);
        setTotalUnreadCount(unreadTotal);
      },
      (err) => {
        console.error("Error listening to user chats:", err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Open or Initialize a Chat for a Session
  const openChat = async (sessionOrChat) => {
    if (!user?.uid || !sessionOrChat) return;

    try {
      const sessionId = sessionOrChat.sessionId || sessionOrChat.id;
      const chatId = sessionOrChat.chatId || `session_${sessionId}`;

      const userId = sessionOrChat.userId || user.uid;
      const userName = sessionOrChat.userName || sessionOrChat.Client?.name || "Client";
      const expertId = sessionOrChat.readerId || sessionOrChat.expertId || sessionOrChat.consultantId || user.uid;
      const expertName = sessionOrChat.readerName || sessionOrChat.expertName || "Expert";

      const participants = Array.from(new Set([userId, expertId])).filter(Boolean);

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      const chatData = {
        id: chatId,
        sessionId: String(sessionId),
        userId,
        userName,
        expertId,
        expertName,
        participants,
        updatedAt: new Date().toISOString(),
      };

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          ...chatData,
          lastMessage: "",
          unreadCountUser: 0,
          unreadCountExpert: 0,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      setActiveChat(chatData);
      setIsOpen(true);
      setIsMinimized(false);
    } catch (err) {
      console.error("Failed to open or initialize chat:", err);
    }
  };

  // 3. Close & Minimize Window Controls
  const closeChat = () => {
    setIsOpen(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleChat = () => {
    if (isOpen) {
      if (isMinimized) {
        setIsMinimized(false);
      } else {
        setIsOpen(false);
      }
    } else {
      if (activeChat) {
        setIsOpen(true);
        setIsMinimized(false);
      } else if (userChats.length > 0) {
        setActiveChat(userChats[0]);
        setIsOpen(true);
        setIsMinimized(false);
      } else {
        setIsOpen(true);
        setIsMinimized(false);
      }
    }
  };

  // 4. Send Message to Dedicated Firestore Subcollection
  const sendMessage = async (text) => {
    if (!text?.trim() || !activeChat?.id || !user?.uid) return;

    const isClient = user.uid === activeChat.userId;
    const senderRole = isClient ? "user" : "expert";
    const senderName = user.name || user.displayName || user.email || (isClient ? "Client" : "Expert");

    const messageData = {
      chatId: activeChat.id,
      sessionId: activeChat.sessionId || "",
      senderId: user.uid,
      senderName,
      senderRole,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      unread: true,
    };

    try {
      // Add message into chats/{chatId}/messages
      await addDoc(collection(db, "chats", activeChat.id, "messages"), messageData);

      // Update parent chat document with preview and increment recipient's unread counter
      const chatRef = doc(db, "chats", activeChat.id);
      await setDoc(
        chatRef,
        {
          lastMessage: text.trim(),
          lastMessageSenderId: user.uid,
          updatedAt: new Date().toISOString(),
          [isClient ? "unreadCountExpert" : "unreadCountUser"]: increment(1),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  };

  // 5. Mark Active Chat Messages as Read
  const markMessagesAsRead = async () => {
    if (!activeChat?.id || !user?.uid) return;

    try {
      const messagesRef = collection(db, "chats", activeChat.id, "messages");
      const unreadQuery = query(
        messagesRef,
        where("unread", "==", true)
      );
      const snapshot = await getDocs(unreadQuery);

      const batch = writeBatch(db);
      let needsCommit = false;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.senderId !== user.uid) {
          batch.update(docSnap.ref, { unread: false });
          needsCommit = true;
        }
      });

      if (needsCommit) {
        const isClient = user.uid === activeChat.userId;
        const chatRef = doc(db, "chats", activeChat.id);
        batch.update(chatRef, {
          [isClient ? "unreadCountUser" : "unreadCountExpert"]: 0
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const value = {
    activeChat,
    setActiveChat,
    isOpen,
    isMinimized,
    userChats,
    totalUnreadCount,
    openChat,
    closeChat,
    minimizeChat,
    toggleMinimize,
    toggleChat,
    sendMessage,
    markMessagesAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
