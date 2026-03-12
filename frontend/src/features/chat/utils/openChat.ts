export const OPEN_CHAT_WITH_STORE_EVENT = "techx:open-chat-store";

export function openChatWithStore(storeId: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_CHAT_WITH_STORE_EVENT, {
      detail: { storeId: Number(storeId) },
    }),
  );
}
