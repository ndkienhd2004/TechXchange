"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast } from "@/components/commons/Toast";
import { API_BASE_URL } from "@/config/api";
import {
  AssistantConversation,
  AssistantMessage,
  getAssistantConversationsService,
  getAssistantMessagesService,
  sendAssistantMessageService,
} from "@/features/chat/services/assistantApi";
import {
  ChatConversation,
  ChatMessage,
  getConversationsService,
  getMessagesService,
  openStoreConversationService,
} from "@/features/chat/services/chatApi";
import { getProductById } from "@/features/products/services/productApi";
import type { Product } from "@/features/products/types";
import { buildProductDisplayName } from "@/features/products/utils/displayName";
import { OPEN_CHAT_WITH_STORE_EVENT } from "@/features/chat/utils/openChat";
import { useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./globalChatWidgetStyles";

type OpenChatEvent = CustomEvent<{ storeId?: number }>;
type ChatMode = "assistant" | "store";
type AssistantView = "list" | "chat";
type AssistantWidgetMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sent_at: string;
  citations: Array<{ title?: string; uri?: string }>;
};

type AssistantCitation = { title?: string; uri?: string };
type ProductPreview = {
  id: number;
  uri: string;
  title: string;
  priceText: string;
  imageUrl: string;
};

function extractJsonFenceBody(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```") || !trimmed.endsWith("```")) {
    return trimmed;
  }
  const inner = trimmed.slice(3, -3).trim();
  if (inner.toLowerCase().startsWith("json")) {
    return inner.slice(4).trim();
  }
  return inner;
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    const ch = text[index];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }
  return null;
}

function normalizeAssistantContent(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const cleaned = extractJsonFenceBody(raw);
  const candidates: string[] = [cleaned];
  const objectFragment = extractFirstJsonObject(cleaned);
  if (objectFragment && objectFragment !== cleaned) {
    candidates.push(objectFragment);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { answer?: unknown };
      if (parsed && typeof parsed === "object" && typeof parsed.answer === "string") {
        const answer = parsed.answer.trim();
        if (answer) return answer;
      }
    } catch {
      // Keep trying next parse candidate.
    }
  }

  return cleaned;
}

function normalizeProductUri(uri?: string): string | null {
  const value = String(uri || "").trim();
  if (!value) return null;
  const match = value.match(/^\/products\/(\d+)(?:\/)?$/);
  return match ? `/products/${match[1]}` : null;
}

function extractProductIdFromUri(uri?: string): number | null {
  const normalized = normalizeProductUri(uri);
  if (!normalized) return null;
  const match = normalized.match(/^\/products\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function dedupeCitations(citations: AssistantCitation[]): AssistantCitation[] {
  const seen = new Set<string>();
  const rows: AssistantCitation[] = [];
  for (const citation of citations) {
    const uri = String(citation?.uri || "").trim();
    const title = String(citation?.title || "").trim();
    const key = `${uri}::${title}`;
    if (!key.trim() || seen.has(key)) continue;
    seen.add(key);
    rows.push(citation);
  }
  return rows;
}

function decorateAssistantContent(content: string, citations: AssistantCitation[]): string {
  let next = String(content || "");
  const productUris = dedupeCitations(citations)
    .map((citation) => normalizeProductUri(citation.uri))
    .filter((value): value is string => Boolean(value));

  for (const uri of productUris) {
    const escaped = uri.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    next = next.replace(new RegExp(`uri=${escaped}`, "g"), `uri=[${uri}](${uri})`);
    next = next.replace(new RegExp(`(?<!\\]\\()${escaped}`, "g"), `[${uri}](${uri})`);
  }

  return next;
}

function resolveSocketUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN");
}

function formatPriceVnd(value: string | number | undefined): string {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return "Chưa có giá";
  return `${parsed.toLocaleString("vi-VN")} VND`;
}

function normalizeSearchText(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPreviewMatchKeys(preview: ProductPreview): string[] {
  const normalizedTitle = normalizeSearchText(preview.title);
  if (!normalizedTitle) return [];

  const baseTitle = normalizedTitle.split("(")[0]?.trim() || normalizedTitle;
  const tokens = baseTitle.split(" ").filter(Boolean);
  const keys = new Set<string>([baseTitle]);

  if (tokens.length >= 2) {
    keys.add(tokens.slice(0, 2).join(" "));
  }
  if (tokens.length >= 3) {
    keys.add(tokens.slice(0, 3).join(" "));
  }

  return Array.from(keys).filter((item) => item.length >= 4);
}

function normalizeAssistantRows(rows: AssistantMessage[]): AssistantWidgetMessage[] {
  return rows.map((item) => ({
    id: Number(item.id),
    role: item.role === "assistant" ? "assistant" : "user",
    content: normalizeAssistantContent(item.content),
    sent_at: item.created_at || new Date().toISOString(),
    citations: Array.isArray(item.citations)
      ? item.citations
      : Array.isArray(item.citations_json)
        ? item.citations_json
        : [],
  }));
}

function buildAssistantConversationPreview(title?: string, updatedAt?: string): string {
  const safeTitle = String(title || "").trim();
  if (!safeTitle) return "Hội thoại mới";
  const time = formatTime(updatedAt);
  return time ? `${safeTitle} • ${time}` : safeTitle;
}

export default function GlobalChatWidget() {
  const router = useRouter();
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
  const [assistantView, setAssistantView] = useState<AssistantView>("list");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activePeerId, setActivePeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [assistantDraft, setAssistantDraft] = useState("");
  const [assistantConversationId, setAssistantConversationId] = useState<number | null>(null);
  const [assistantMessages, setAssistantMessages] = useState<AssistantWidgetMessage[]>([]);
  const [assistantConversations, setAssistantConversations] = useState<AssistantConversation[]>([]);
  const [assistantProductCache, setAssistantProductCache] = useState<Record<number, Product>>({});
  const [loadingAssistantMessages, setLoadingAssistantMessages] = useState(false);
  const [sendingAssistant, setSendingAssistant] = useState(false);
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

  const loadAssistantMessages = useCallback(async (conversationId: number) => {
    if (!token || !conversationId) return;
    try {
      setLoadingAssistantMessages(true);
      const messageRes = await getAssistantMessagesService(conversationId, 100);
      const messageRows = (messageRes?.data?.messages || []) as AssistantMessage[];
      setAssistantConversationId(conversationId);
      setAssistantMessages(normalizeAssistantRows(messageRows));
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoadingAssistantMessages(false);
    }
  }, [token]);

  const loadAssistantConversations = useCallback(async () => {
    if (!token) return;
    try {
      const conversationRes = await getAssistantConversationsService(20);
      const rows = (conversationRes?.data?.conversations || []) as AssistantConversation[];
      setAssistantConversations(rows);
    } catch (error) {
      setAssistantConversations([]);
      showErrorToast(error);
    }
  }, [token]);

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
    setAssistantView("list");
    setConversations([]);
    setAssistantConversations([]);
    setActivePeerId(null);
    setMessages([]);
    setAssistantConversationId(null);
    setAssistantMessages([]);
    setDraft("");
    setAssistantDraft("");
    setSendingAssistant(false);
    setLoadingAssistantMessages(false);
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
    if (!token || !isOpen || mode !== "assistant") return;
    void loadAssistantConversations();
  }, [token, isOpen, mode, loadAssistantConversations]);

  useEffect(() => {
    if (!token || !isOpen || mode !== "assistant" || assistantView !== "chat" || !assistantConversationId) return;
    void loadAssistantMessages(assistantConversationId);
  }, [token, isOpen, mode, assistantView, assistantConversationId, loadAssistantMessages]);

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
    if (mode === "store" || mode === "assistant") {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, assistantMessages, mode]);

  useEffect(() => {
    const productIds = Array.from(
      new Set(
        assistantMessages.flatMap((item) =>
          dedupeCitations(item.citations)
            .map((citation) => extractProductIdFromUri(citation.uri))
            .filter((value): value is number => Boolean(value)),
        ),
      ),
    ).filter((productId) => !assistantProductCache[productId]);

    if (productIds.length === 0) return;

    let cancelled = false;
    const run = async () => {
      const entries = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await getProductById(productId);
            const product = (response?.data || response?.product || response) as Product | undefined;
            if (!product) return null;
            return [productId, product] as const;
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      setAssistantProductCache((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          if (!entry) continue;
          next[entry[0]] = entry[1];
        }
        return next;
      });
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [assistantMessages, assistantProductCache]);

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

  const onSendAssistant = async () => {
    const text = assistantDraft.trim();
    if (!text || sendingAssistant) return;

    const tempUserMessageId = Date.now();
    const optimisticUserMessage: AssistantWidgetMessage = {
      id: tempUserMessageId,
      role: "user",
      content: text,
      sent_at: new Date().toISOString(),
      citations: [],
    };

    setAssistantMessages((prev) => [...prev, optimisticUserMessage]);
    setAssistantDraft("");
    setSendingAssistant(true);

    try {
      const res = await sendAssistantMessageService(
        text,
        assistantConversationId,
        "vi-VN",
      );
      const data = res?.data || {};
      const nextConversationId = Number(data?.conversation_id || 0);
      if (nextConversationId > 0) {
        setAssistantConversationId(nextConversationId);
      }

      const answer = normalizeAssistantContent(data?.answer);
      if (!answer) {
        throw new Error("Chatbot không trả về nội dung hợp lệ");
      }

      const assistantMessage: AssistantWidgetMessage = {
        id: Number(data?.message_id || Date.now() + 1),
        role: "assistant",
        content: answer,
        sent_at: new Date().toISOString(),
        citations: Array.isArray(data?.citations) ? data.citations : [],
      };

      setAssistantMessages((prev) => [...prev, assistantMessage]);
      await loadAssistantConversations();
      if (nextConversationId > 0) {
        setAssistantConversationId(nextConversationId);
      }
      setAssistantView("chat");
    } catch (error) {
      setAssistantMessages((prev) =>
        prev.filter((item) => Number(item.id) !== tempUserMessageId),
      );
      setAssistantDraft(text);
      showErrorToast(error);
    } finally {
      setSendingAssistant(false);
    }
  };

  const renderAssistantMarkdown = useCallback(
    (content: string, mine: boolean, citations: AssistantCitation[] = []) => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p style={themed(styles.markdownParagraph)}>{children}</p>,
          h1: ({ children }) => <h1 style={themed(styles.markdownHeading)}>{children}</h1>,
          h2: ({ children }) => <h2 style={themed(styles.markdownHeading)}>{children}</h2>,
          h3: ({ children }) => <h3 style={themed(styles.markdownHeading)}>{children}</h3>,
          ul: ({ children }) => <ul style={themed(styles.markdownList)}>{children}</ul>,
          ol: ({ children }) => <ol style={themed(styles.markdownList)}>{children}</ol>,
          li: ({ children }) => <li style={themed(styles.markdownListItem)}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={themed((theme) => styles.markdownBlockquote(theme, mine))}>
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre style={themed((theme) => styles.markdownCodeBlock(theme, mine))}>
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            const text = String(children ?? "");
            const isBlock = Boolean(className?.includes("language-")) || text.includes("\n");
            if (isBlock) {
              return <code>{children}</code>;
            }
            return (
              <code style={themed((theme) => styles.markdownCodeInline(theme, mine))}>
                {children}
              </code>
            );
          },
          a: ({ children, href }) => {
            const internalUri = normalizeProductUri(href);
            if (internalUri) {
              return (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(internalUri);
                  }}
                  style={themed(() => styles.markdownLink(mine))}
                >
                  {children}
                </button>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                style={themed(() => styles.markdownLink(mine))}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {decorateAssistantContent(content, citations)}
      </ReactMarkdown>
    ),
    [router, themed],
  );

  const onNavigateFromCitation = useCallback(
    (citation: AssistantCitation) => {
      const internalUri = normalizeProductUri(citation?.uri);
      if (!internalUri) return;
      setIsOpen(false);
      router.push(internalUri);
    },
    [router],
  );

  const buildCitationProductPreviews = useCallback(
    (citations: AssistantCitation[]): ProductPreview[] =>
      dedupeCitations(citations)
        .map((citation) => {
          const uri = normalizeProductUri(citation.uri);
          const productId = extractProductIdFromUri(citation.uri);
          if (!uri || !productId) return null;
          const product = assistantProductCache[productId];
          const title =
            product
              ? buildProductDisplayName(product.name, product.catalog?.specs)
              : citation.title || `Sản phẩm #${productId}`;
          return {
            id: productId,
            uri,
            title,
            priceText: product ? formatPriceVnd(product.price) : "Đang tải giá...",
            imageUrl: product?.images?.[0]?.url || product?.default_image || "",
          };
        })
        .filter((value): value is ProductPreview => Boolean(value)),
    [assistantProductCache],
  );

  const selectVisibleProductPreviews = useCallback(
    (content: string, citations: AssistantCitation[]): ProductPreview[] => {
      const previews = buildCitationProductPreviews(citations);
      if (previews.length <= 1) return previews;

      const normalizedContent = normalizeSearchText(content);
      if (!normalizedContent) return previews.slice(0, 3);

      const matched = previews.filter((preview) =>
        buildPreviewMatchKeys(preview).some((key) => normalizedContent.includes(key)),
      );

      return (matched.length > 0 ? matched : previews).slice(0, 3);
    },
    [buildCitationProductPreviews],
  );

  const onStartNewAssistantChat = useCallback(() => {
    setMode("assistant");
    setAssistantView("chat");
    setAssistantConversationId(null);
    setAssistantMessages([]);
    setAssistantDraft("");
  }, []);

  const onSelectAssistantConversation = useCallback((conversationId: number) => {
    setMode("assistant");
    setAssistantView("chat");
    setAssistantConversationId(conversationId);
  }, []);

  const onBackToAssistantList = useCallback(() => {
    setMode("assistant");
    setAssistantView("list");
    setAssistantMessages([]);
    setAssistantDraft("");
  }, []);

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
                setAssistantView("list");
                setActivePeerId(null);
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
              {mode === "assistant" && assistantView === "chat" ? (
                <button
                  type="button"
                  onClick={onBackToAssistantList}
                  style={themed(styles.headerIconBtn)}
                  aria-label="Quay lại danh sách hội thoại AI"
                >
                  <AppIcon name="left-forward" size={18} />
                </button>
              ) : null}
              <span style={themed(styles.botAvatar)}>
                <AppIcon name={mode === "assistant" ? "settings" : "bag"} size={16} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <div style={themed(styles.headerTitle)}>
                  {mode === "assistant"
                    ? assistantView === "list"
                      ? "AI Assistant"
                      : "Tư vấn Build PC"
                    : activeConversation?.peer?.username || "Tin nhắn cửa hàng"}
                </div>
                <div style={themed(styles.headerSubtitle)}>
                  {mode === "assistant"
                    ? assistantView === "list"
                      ? `${assistantConversations.length} hội thoại`
                      : `AI Assistant${assistantConversations.length ? ` • ${assistantConversations.length} hội thoại` : ""}`
                    : "Chat shop"}
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
                assistantView === "list" ? (
                  <>
                    <div style={themed(styles.sectionHeaderRow)}>
                      <div style={themed(styles.sectionLabel)}>AI hội thoại</div>
                      <button
                        type="button"
                        onClick={onStartNewAssistantChat}
                        style={themed(styles.assistantNewChatButton)}
                      >
                        Chat mới
                      </button>
                    </div>
                    <div style={themed(styles.conversationList)}>
                      {assistantConversations.length === 0 ? (
                        <div style={themed(styles.emptyState)}>Chưa có hội thoại AI.</div>
                      ) : (
                        assistantConversations.map((item) => (
                          <button
                            key={`assistant-list-${item.id}`}
                            type="button"
                            style={themed((theme) =>
                              styles.conversationItem(
                                theme,
                                assistantConversationId === Number(item.id),
                              ),
                            )}
                            onClick={() => onSelectAssistantConversation(Number(item.id))}
                          >
                            <span style={themed(styles.conversationAvatar)}>
                              <AppIcon name="settings" size={16} />
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <div style={themed(styles.conversationTitle)}>
                                {item.title || `Hội thoại #${item.id}`}
                              </div>
                              <div style={themed(styles.conversationPreview)}>
                                {buildAssistantConversationPreview(item.title, item.updated_at)}
                              </div>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : loadingAssistantMessages ? (
                  <div style={themed(styles.hintText)}>Đang tải lịch sử trợ lý...</div>
                ) : assistantMessages.length === 0 ? (
                  <div style={themed(styles.messageRow(false))}>
                    <div style={themed((theme) => styles.bubble(theme, false))}>
                      Xin chào! Tôi là trợ lý build PC. Bạn có thể hỏi ví dụ:
                      Build PC 20 triệu, chính sách bảo hành, sản phẩm bán chạy.
                    </div>
                  </div>
                ) : (
                  assistantMessages.map((item) => {
                    const mine = item.role === "user";
                    return (
                      <div key={item.id} style={themed(styles.messageRow(mine))}>
                        <div style={themed((theme) => styles.bubble(theme, mine))}>
                          <div style={themed(styles.markdownRoot)}>
                            {renderAssistantMarkdown(item.content, mine, item.citations)}
                          </div>
                          {!mine && item.citations.length > 0 && (
                            <>
                              {selectVisibleProductPreviews(item.content, item.citations).length > 0 && (
                                <div style={themed(styles.assistantProductCards)}>
                                  {selectVisibleProductPreviews(item.content, item.citations).map((product) => (
                                      <button
                                        key={`${item.id}-product-${product.id}`}
                                        type="button"
                                        onClick={() =>
                                          onNavigateFromCitation({
                                            title: product.title,
                                            uri: product.uri,
                                          })
                                        }
                                        style={themed(styles.assistantProductCard)}
                                      >
                                        {product.imageUrl ? (
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.title}
                                            width={56}
                                            height={56}
                                            style={themed(styles.assistantProductThumb)}
                                          />
                                        ) : (
                                          <div style={themed(styles.assistantProductThumbFallback)}>
                                            SP
                                          </div>
                                        )}
                                        <div style={themed(styles.assistantProductMeta)}>
                                          <div style={themed(styles.assistantProductTitle)}>
                                            {product.title}
                                          </div>
                                          <div style={themed(styles.assistantProductPrice)}>
                                            {product.priceText}
                                          </div>
                                          <div style={themed(styles.assistantProductHint)}>
                                            Xem chi tiết sản phẩm
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </>
                          )}
                          <div style={themed(styles.bubbleTime)}>
                            {formatTime(item.sent_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
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
              {mode === "assistant" && assistantView === "list" ? (
                <div style={themed(styles.hintText)}>
                  Chọn một hội thoại AI hoặc bấm `Chat mới` để bắt đầu.
                </div>
              ) : (
                <>
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
                      if (mode === "assistant") void onSendAssistant();
                      else void onSendStoreMessage();
                    }}
                    disabled={
                      mode === "assistant"
                        ? sendingAssistant || loadingAssistantMessages
                        : !activePeerId
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === "assistant") void onSendAssistant();
                      else void onSendStoreMessage();
                    }}
                    style={themed(styles.sendButton)}
                    disabled={
                      mode === "assistant"
                        ? sendingAssistant || loadingAssistantMessages
                        : !activePeerId
                    }
                  >
                    <AppIcon name="message" size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
