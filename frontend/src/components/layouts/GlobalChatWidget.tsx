"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast } from "@/components/commons/Toast";
import { API_BASE_URL } from "@/config/api";
import {
  ChatConversation,
  ChatMessage,
  getConversationsService,
  getMessagesService,
  openStoreConversationService,
} from "@/features/chat/services/chatApi";
import { OPEN_CHAT_WITH_STORE_EVENT } from "@/features/chat/utils/openChat";
import { useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./globalChatWidgetStyles";

type OpenChatEvent = CustomEvent<{ storeId?: number }>;
type ChatMode = "assistant" | "store";

const BOT_PEER_ID = -1;

function resolveSocketUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN");
}

export default function GlobalChatWidget() {
  const auth = useAppSelector((state) => state.auth);
  const token = auth.token;
  const me = auth.user;
  const shouldShowWidget = Boolean(token);
  const { themed } = useAppTheme();
  const socketRef = useRef<Socket | null>(null);
  const messageBodyRef = useRef<HTMLDivElement | null>(null);
  const restoreScrollRef = useRef<{ height: number; top: number } | null>(null);
  const loadingOlderRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("assistant");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activePeerId, setActivePeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [assistantDraft, setAssistantDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageLimit, setMessageLimit] = useState(30);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, item) => sum + Number(item.unread_count || 0), 0),
    [conversations],
  );

  const activeConversation = useMemo(
    () => conversations.find((item) => item.peer_user_id === activePeerId) || null,
    [activePeerId, conversations],
  );
  const chatHistoryConversations = useMemo(() => {
    if (!me?.role) return conversations;
    if (me.role === "shop") {
      return conversations.filter((item) => !item.peer?.role || item.peer.role === "user");
    }
    return conversations.filter((item) => !item.peer?.role || item.peer.role === "shop");
  }, [conversations, me?.role]);

  const upsertConversationFromMessage = (
    prev: ChatConversation[],
    payload: ChatMessage,
    currentUserId: number,
    openedPeerId: number | null,
  ) => {
    const sender = Number(payload.sender_id);
    const receiver = Number(payload.receiver_id);
    const peerId = sender === currentUserId ? receiver : sender;
    const idx = prev.findIndex((item) => Number(item.peer_user_id) === peerId);

    if (idx < 0) return prev;

    const next = [...prev];
    const current = next[idx];
    const unread =
      receiver === currentUserId && openedPeerId !== peerId
        ? Number(current.unread_count || 0) + 1
        : Number(current.unread_count || 0);

    next[idx] = {
      ...current,
      last_message: payload.message,
      last_message_at: payload.sent_at,
      unread_count: unread,
    };

    const [picked] = next.splice(idx, 1);
    return [picked, ...next];
  };

  const dedupeMessages = (rows: ChatMessage[]) => {
    const map = new Map<number, ChatMessage>();
    rows.forEach((item) => {
      map.set(Number(item.id), item);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
    );
  };

  const loadConversations = async () => {
    if (!token) return;
    try {
      const res = await getConversationsService(100);
      const rows = (res?.data?.conversations || []) as ChatConversation[];
      setConversations(rows);
      if (!activePeerId && rows.length > 0) {
        setActivePeerId(Number(rows[0].peer_user_id));
      }
    } catch (error) {
      setConversations([]);
      setMessages([]);
      setActivePeerId(null);
      showErrorToast(error);
    }
  };

  const loadStoreMessages = useCallback(
    async (peerUserId: number, limit: number) => {
      if (!token || !peerUserId) return;
      try {
        setLoadingMessages(true);
        const res = await getMessagesService(peerUserId, limit);
        const rows = (res?.data?.messages || []) as ChatMessage[];
        setMessages(dedupeMessages(rows));
        setHasMoreMessages(rows.length >= limit);
        socketRef.current?.emit("chat:join", { peer_user_id: peerUserId });
        socketRef.current?.emit("chat:read", { peer_user_id: peerUserId });
        setConversations((prev) =>
          prev.map((item) =>
            Number(item.peer_user_id) === Number(peerUserId)
              ? { ...item, unread_count: 0 }
              : item,
          ),
        );
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoadingMessages(false);
      }
    },
    [token],
  );

  const openChatWithStore = async (storeId: number) => {
    if (!token) {
      showErrorToast("Vui lòng đăng nhập để chat");
      return;
    }
    try {
      const res = await openStoreConversationService(storeId);
      const peerUserId = Number(res?.data?.peer_user_id || 0);
      if (!peerUserId) return;
      await loadConversations();
      setMode("store");
      setIsOpen(true);
      setActivePeerId(peerUserId);
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (!token) return;
    const socket = io(resolveSocketUrl(), {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("chat:message", (payload: ChatMessage) => {
      const meId = Number(me?.id || 0);
      if (Number(payload.sender_id) === meId) {
        return;
      }
      setConversations((prev) =>
        upsertConversationFromMessage(prev, payload, meId, activePeerId),
      );

      const sender = Number(payload.sender_id);
      const receiver = Number(payload.receiver_id);
      const peerId = sender === meId ? receiver : sender;

      if (mode === "store" && activePeerId === peerId) {
        setMessages((prev) => dedupeMessages([...prev, payload]));
        socket.emit("chat:read", { peer_user_id: peerId });
      }
    });

    socket.on("chat:read", ({ user_id }: { user_id: number }) => {
      if (mode !== "store" || !activePeerId || Number(user_id) !== Number(activePeerId)) {
        return;
      }
      setMessages((prev) =>
        prev.map((item) =>
          Number(item.sender_id) === Number(activePeerId) ? { ...item, is_read: true } : item,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activePeerId, mode, me?.id, me?.role, token]);

  useEffect(() => {
    if (!token) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, me?.id, me?.role]);

  useEffect(() => {
    if (shouldShowWidget) return;
    setIsOpen(false);
    setMode("assistant");
    setConversations([]);
    setActivePeerId(null);
    setMessages([]);
    setDraft("");
    setAssistantDraft("");
    setMessageLimit(30);
    setHasMoreMessages(true);
    restoreScrollRef.current = null;
    loadingOlderRef.current = false;
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [shouldShowWidget]);

  useEffect(() => {
    if (mode !== "store" || !activePeerId) return;
    loadStoreMessages(activePeerId, messageLimit);
  }, [activePeerId, loadStoreMessages, messageLimit, mode]);

  useEffect(() => {
    const node = messageBodyRef.current;
    if (!node) return;
    if (restoreScrollRef.current) {
      const snapshot = restoreScrollRef.current;
      node.scrollTop = node.scrollHeight - snapshot.height + snapshot.top;
      restoreScrollRef.current = null;
      loadingOlderRef.current = false;
      return;
    }
    if (mode === "store") {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as OpenChatEvent;
      const storeId = Number(customEvent?.detail?.storeId || 0);
      if (!storeId) return;
      void openChatWithStore(storeId);
    };

    window.addEventListener(OPEN_CHAT_WITH_STORE_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(OPEN_CHAT_WITH_STORE_EVENT, handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSendStoreMessage = async () => {
    if (!activePeerId) return;
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      const socket = socketRef.current;
      if (!socket) {
        throw new Error("Socket chưa sẵn sàng");
      }
      const result = await new Promise<ChatMessage>((resolve, reject) => {
        socket.emit(
          "chat:send",
          { receiver_id: activePeerId, message: text },
          (ack: { ok: boolean; data?: ChatMessage; message?: string }) => {
            if (!ack?.ok || !ack?.data) {
              reject(new Error(ack?.message || "Gửi tin nhắn thất bại"));
              return;
            }
            resolve(ack.data);
          },
        );
      });
      const meId = Number(me?.id || 0);
      setMessages((prev) => dedupeMessages([...prev, result]));
      setConversations((prev) =>
        upsertConversationFromMessage(prev, result, meId, activePeerId),
      );
    } catch (error) {
      setDraft(text);
      showErrorToast(error);
    }
  };

  const onSelectConversation = (peerId: number) => {
    setMode("store");
    setActivePeerId(peerId);
    setMessageLimit(30);
    setHasMoreMessages(true);
  };

  const onMessageScroll = () => {
    if (mode !== "store" || !activePeerId || loadingMessages) return;
    if (!hasMoreMessages) return;
    const node = messageBodyRef.current;
    if (!node) return;
    if (node.scrollTop > 24 || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    restoreScrollRef.current = { height: node.scrollHeight, top: node.scrollTop };
    setMessageLimit((prev) => prev + 30);
  };

  const onSendAssistant = () => {
    const text = assistantDraft.trim();
    if (!text) return;
    setAssistantDraft("");
    showErrorToast("API chatbot chưa được kết nối");
  };

  if (!shouldShowWidget) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={themed(styles.floatingButton)}
        aria-label="Mở chat"
      >
        <AppIcon name="message" size={26} />
        {unreadCount > 0 && <span style={themed(styles.unreadBadge)}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <section style={themed(styles.modal)} aria-label="Chat widget">
          <aside style={themed(styles.sidebar)}>
            <div style={themed(styles.sidebarHeader)}>Tin nhắn</div>

            <button
              type="button"
              style={themed((theme) => styles.aiItem(theme, mode === "assistant"))}
              onClick={() => {
                setMode("assistant");
                setActivePeerId(BOT_PEER_ID);
              }}
            >
              <span style={themed(styles.botAvatar)}>
                <AppIcon name="settings" size={16} />
              </span>
              <span>
                <div style={themed(styles.aiTitle)}>AI Assistant</div>
                <div style={themed(styles.aiSubtitle)}>Tư vấn Build PC</div>
              </span>
            </button>

            <div style={themed(styles.sectionLabel)}>
              {me?.role === "shop" ? "Khách hàng" : "Cửa hàng"}
            </div>
            <div style={themed(styles.conversationList)}>
              {chatHistoryConversations.length === 0 && (
                <div style={themed(styles.emptyState)}>Chưa có hội thoại.</div>
              )}
              {chatHistoryConversations.map((item) => (
                <button
                  key={item.peer_user_id}
                  type="button"
                  style={themed((theme) => styles.conversationItem(theme, activePeerId === item.peer_user_id))}
                  onClick={() => onSelectConversation(Number(item.peer_user_id))}
                >
                  <span style={themed(styles.conversationAvatar)}>
                    <AppIcon name="bag" size={16} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <div style={themed(styles.conversationTitle)}>
                      {item.peer?.username || `Shop #${item.peer_user_id}`}
                    </div>
                    <div style={themed(styles.conversationPreview)}>
                      {item.last_message || "Bắt đầu trò chuyện"}
                    </div>
                  </span>
                  {item.unread_count > 0 && (
                    <span style={themed(styles.unreadPill)}>{item.unread_count}</span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div style={themed(styles.content)}>
            <header style={themed(styles.contentHeader)}>
              <span style={themed(styles.botAvatar)}>
                <AppIcon name={mode === "assistant" ? "settings" : "bag"} size={16} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <div style={themed(styles.headerTitle)}>
                  {mode === "assistant"
                    ? "Tư vấn Build PC"
                    : activeConversation?.peer?.username || "Tin nhắn cửa hàng"}
                </div>
                <div style={themed(styles.headerSubtitle)}>
                  {mode === "assistant" ? "AI Assistant" : "Chat shop"}
                </div>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={themed(styles.headerIconBtn)}
                aria-label="Đóng chat"
              >
                <AppIcon name="close" size={18} />
              </button>
            </header>

            <div
              ref={messageBodyRef}
              style={themed(styles.messageBody)}
              onScroll={onMessageScroll}
            >
              {mode === "assistant" ? (
                <div style={themed(styles.messageRow(false))}>
                  <div style={themed((theme) => styles.bubble(theme, false))}>
                    Xin chào! Tôi là trợ lý build PC. Bạn gửi ngân sách để tôi tư vấn cấu hình.
                  </div>
                </div>
              ) : loadingMessages ? (
                <div style={themed(styles.hintText)}>Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div style={themed(styles.hintText)}>Bắt đầu trò chuyện với shop.</div>
              ) : (
                messages.map((item) => {
                  const mine = Number(item.sender_id) === Number(me?.id || 0);
                  return (
                    <div key={item.id} style={themed(styles.messageRow(mine))}>
                      <div style={themed((theme) => styles.bubble(theme, mine))}>
                        <div>{item.message}</div>
                        <div style={themed(styles.bubbleTime)}>
                          {formatTime(item.sent_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={themed(styles.inputBar)}>
              <input
                value={mode === "assistant" ? assistantDraft : draft}
                onChange={(event) =>
                  mode === "assistant"
                    ? setAssistantDraft(event.target.value)
                    : setDraft(event.target.value)
                }
                style={themed(styles.input)}
                placeholder={
                  mode === "assistant" ? "VD: Build PC 20 triệu" : "Nhập tin nhắn..."
                }
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  if (mode === "assistant") onSendAssistant();
                  else void onSendStoreMessage();
                }}
                disabled={mode === "store" && !activePeerId}
              />
              <button
                type="button"
                onClick={() => {
                  if (mode === "assistant") onSendAssistant();
                  else void onSendStoreMessage();
                }}
                style={themed(styles.sendButton)}
                disabled={mode === "store" && !activePeerId}
              >
                <AppIcon name="message" size={16} />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
