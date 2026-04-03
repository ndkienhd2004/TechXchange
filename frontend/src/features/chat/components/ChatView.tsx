"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import {
  ChatConversation,
  ChatMessage,
  getConversationsService,
  getMessagesService,
  openStoreConversationService,
} from "../services/chatApi";
import { API_BASE_URL } from "@/config/api";
import * as styles from "./styles";

function resolveSocketUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

function dedupeById(rows: ChatMessage[]) {
  const map = new Map<number, ChatMessage>();
  rows.forEach((item) => map.set(Number(item.id), item));
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
}

export default function ChatView() {
  const { themed } = useAppTheme();
  const auth = useAppSelector((state) => state.auth);
  const token = auth.token;
  const me = auth.user;
  const socketRef = useRef<Socket | null>(null);
  const [storeIdInput, setStoreIdInput] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activePeerId, setActivePeerId] = useState<number | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.peer_user_id === activePeerId) || null,
    [activePeerId, conversations],
  );

  const loadConversations = async () => {
    try {
      const res = await getConversationsService();
      const rows = (res?.data?.conversations || []) as ChatConversation[];
      setConversations(rows);
      if (!activePeerId && rows[0]?.peer_user_id) {
        setActivePeerId(Number(rows[0].peer_user_id));
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const loadMessages = async (peerUserId: number) => {
    try {
      setLoading(true);
      const res = await getMessagesService(peerUserId);
      setMessages((res?.data?.messages || []) as ChatMessage[]);
      socketRef.current?.emit("chat:join", { peer_user_id: peerUserId });
      socketRef.current?.emit("chat:read", { peer_user_id: peerUserId });
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const socket = io(resolveSocketUrl(), {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      showErrorToast(err.message || "Socket kết nối thất bại");
    });

    socket.on("chat:message", (payload: ChatMessage) => {
      const sender = Number(payload.sender_id);
      const receiver = Number(payload.receiver_id);
      const currentUserId = Number(me?.id || 0);
      if (sender === currentUserId) return;
      const peerId = sender === currentUserId ? receiver : sender;

      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex((item) => item.peer_user_id === peerId);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            last_message: payload.message,
            last_message_at: payload.sent_at,
            unread_count:
              receiver === currentUserId && activePeerId !== peerId
                ? (next[idx].unread_count || 0) + 1
                : next[idx].unread_count,
          };
          const [picked] = next.splice(idx, 1);
          return [picked, ...next];
        }
        return prev;
      });

      if (activePeerId === peerId) {
        setMessages((prev) => dedupeById([...prev, payload]));
        socket.emit("chat:read", { peer_user_id: peerId });
      }
    });

    socket.on("chat:read", ({ user_id }: { user_id: number }) => {
      if (activePeerId && Number(user_id) === Number(activePeerId)) {
        setMessages((prev) =>
          prev.map((item) =>
            Number(item.sender_id) === Number(activePeerId)
              ? { ...item, is_read: true }
              : item,
          ),
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, activePeerId, me?.id]);

  useEffect(() => {
    if (!token) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!activePeerId) {
      setMessages([]);
      return;
    }
    loadMessages(activePeerId);
  }, [activePeerId]);

  const onOpenStoreChat = async () => {
    const storeId = Number(storeIdInput || 0);
    if (!storeId) return;
    try {
      const res = await openStoreConversationService(storeId);
      const peerUserId = Number(res?.data?.peer_user_id || 0);
      if (!peerUserId) {
        showErrorToast("Không mở được hội thoại");
        return;
      }
      await loadConversations();
      setActivePeerId(peerUserId);
      setStoreIdInput("");
      showSuccessToast("Đã mở chat với shop");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const onSend = async () => {
    if (!activePeerId) return;
    const text = draft.trim();
    if (!text) return;

    try {
      setDraft("");
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
      setMessages((prev) => dedupeById([...prev, result]));
      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex((item) => item.peer_user_id === activePeerId);
        if (idx < 0) return prev;
        next[idx] = {
          ...next[idx],
          last_message: result.message,
          last_message_at: result.sent_at,
          unread_count: 0,
        };
        const [picked] = next.splice(idx, 1);
        return [picked, ...next];
      });
    } catch (error) {
      setDraft(text);
      showErrorToast(error);
    }
  };

  if (!token) {
    return (
      <div style={themed(styles.page)}>
        <div style={themed(styles.unauthenticated)}>
          Vui lòng đăng nhập để sử dụng chat.
        </div>
      </div>
    );
  }

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.layout)}>
      <aside style={themed(styles.panel)}>
        <h2 style={themed(styles.panelTitle)}>Hội thoại</h2>
        {me?.role !== "shop" && (
          <div style={themed(styles.openChatRow)}>
            <input
              placeholder="Nhập store_id"
              value={storeIdInput}
              onChange={(e) => setStoreIdInput(e.target.value)}
              style={{ ...themed(styles.input), flex: 1 }}
            />
            <button
              type="button"
              onClick={onOpenStoreChat}
              style={themed(styles.primaryButton)}
            >
              Mở
            </button>
          </div>
        )}

        <div style={themed(styles.conversationList)}>
          {conversations.map((item) => (
            <button
              key={item.peer_user_id}
              type="button"
              onClick={() => setActivePeerId(item.peer_user_id)}
              style={
                activePeerId === item.peer_user_id
                  ? themed(styles.conversationButtonActive)
                  : themed(styles.conversationButton)
              }
            >
              <div style={themed(styles.conversationName)}>
                {item.peer?.username || `User #${item.peer_user_id}`}
              </div>
              <div style={themed(styles.conversationPreview)}>
                {item.last_message}
              </div>
              {item.unread_count > 0 && (
                <div style={themed(styles.unreadText)}>
                  {item.unread_count} tin chưa đọc
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      <section style={themed(styles.panel)}>
        <h2 style={themed(styles.panelTitle)}>
          {activeConversation?.peer?.username ||
            (activePeerId ? `User #${activePeerId}` : "Chưa chọn hội thoại")}
        </h2>

        <div style={themed(styles.messageBox)}>
          {loading && <div style={themed(styles.loadingText)}>Đang tải...</div>}
          {!loading &&
            messages.map((msg) => {
              const mine = Number(msg.sender_id) === Number(me?.id);
              return (
                <div
                  key={msg.id}
                  style={
                    mine
                      ? themed(styles.messageRowMine)
                      : themed(styles.messageRowOther)
                  }
                >
                  <div
                    style={{
                      ...(mine
                        ? themed(styles.messageBubbleMine)
                        : themed(styles.messageBubbleOther)),
                    }}
                  >
                    <div>{msg.message}</div>
                    <div style={themed(styles.messageMeta)}>
                      {new Date(msg.sent_at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div style={themed(styles.composerRow)}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nhập tin nhắn..."
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
            style={{ ...themed(styles.input), flex: 1 }}
            disabled={!activePeerId}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!activePeerId}
            style={themed(styles.primaryButton)}
          >
            Gửi
          </button>
        </div>
      </section>
      </div>
    </div>
  );
}
