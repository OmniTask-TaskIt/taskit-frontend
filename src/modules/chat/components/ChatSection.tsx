import { useMemo, useState } from 'react';
import { LoaderCircle, MessageCircle, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react';
import { authStore } from '../../authentication/services/authStore';
import { useChats } from '../hooks/useChats';
import { useChatSession } from '../hooks/useChatSession';
import TaskCompletionButton from '../../tasks/components/TaskCompletionButton';
import type { ChatSummary } from '../types/chat.types';

function ChatConversation({ chat, userId }: { chat: ChatSummary; userId: string }) {
  const [draft, setDraft] = useState('');
  const { messages, loading, sending, error, sendMessage } = useChatSession(chat.taskId, userId);
  const submit = () => {
    console.info('[chat][UI] submit message', { taskId: chat.taskId, content: draft });
    if (sendMessage(draft)) setDraft('');
  };
  return (
    <section className="flex min-h-[520px] flex-1 flex-col rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(47,61,110,0.12)]">
      <div className="flex items-center justify-between border-b border-[#e8ebf5] pb-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7883a3]">Tarea</p><h2 className="text-xl font-bold text-[#17213f]">{chat.taskName ?? chat.title ?? chat.taskId}</h2><p className="text-xs text-[#7883a3]">{chat.taskId}</p></div>
        <div className="flex items-start gap-2"><TaskCompletionButton taskId={chat.taskId} currentUserId={userId} compact />{chat.status && <span className="rounded-full bg-[#e8f7ef] px-3 py-1 text-xs font-semibold text-[#177245]">{chat.status}</span>}</div>
      </div>
      <div className="flex items-center gap-3 py-3 text-xs text-[#5b6685]"><span>Proveedor: {chat.sellerId ?? 'No disponible'}</span><span>Solicitante: {chat.buyerId ?? 'No disponible'}</span></div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4" aria-live="polite">
        {loading && <div className="flex items-center gap-2 text-sm text-[#5b6685]"><LoaderCircle className="animate-spin" size={16} /> Cargando historial...</div>}
        {!loading && messages.length === 0 && <p className="m-auto text-sm text-[#7883a3]">El chat aún no tiene mensajes.</p>}
        {messages.map((message, index) => <div key={message.messageId ?? `${message.createdAt ?? 'message'}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.senderId === userId ? 'self-end bg-[#263BAA] text-white' : 'self-start bg-[#f0f3fb] text-[#17213f]'}`}>{message.content}</div>)}
      </div>
      {error && <p role="alert" className="mb-3 rounded-xl bg-[#fff0f2] px-3 py-2 text-sm text-[#b64055]">{error}</p>}
      <div className="flex gap-2 border-t border-[#e8ebf5] pt-4"><input aria-label="Mensaje" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) submit(); }} placeholder="Escribe un mensaje..." className="min-w-0 flex-1 rounded-xl border border-[#d9deef] px-3 py-2 text-sm outline-none focus:border-[#263BAA]" /><button type="button" disabled={sending || !draft.trim()} onClick={submit} aria-label="Enviar mensaje" className="rounded-xl bg-[#263BAA] px-4 text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={17} /></button></div>
    </section>
  );
}

export default function ChatSection() {
  const role = authStore.getRole()?.toUpperCase();
  const userId = authStore.getUserId() ?? authStore.getEmail();
  const { chats: allChats, loading, error, reload } = useChats(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const chats = useMemo(() => (Array.isArray(allChats) ? allChats : []), [allChats]);
  console.info('[chat][UI] render chats', {
    role,
    userId,
    count: chats.length,
    chats: chats.map((chat) => ({ chatId: chat.chatId, taskId: chat.taskId, sellerId: chat.sellerId, buyerId: chat.buyerId })),
  });
  const selected = chats.find((chat) => chat.taskId === selectedId) ?? chats[0] ?? null;

  if (!userId) return <div role="alert" className="rounded-3xl bg-white p-8 text-sm text-[#b64055]">No se encontró una identidad de usuario para cargar los chats.</div>;
  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#263BAA]">Conversaciones</p><h1 className="text-3xl font-bold text-[#17213f]">Chats</h1><p className="mt-1 text-sm text-[#5b6685]">Mensajería de tareas disponibles para tu rol ({role === 'PROVIDER' ? 'prestador' : 'demandante'}).</p></div><button type="button" onClick={() => void reload()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#d9deef] bg-white px-4 py-2 text-sm font-semibold text-[#263BAA] disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Actualizando...' : 'Reintentar'}</button></header>
    {error && <div role="alert" className="rounded-2xl bg-[#fff0f2] px-4 py-3 text-sm text-[#b64055]">{error}</div>}
    <div className="flex flex-col gap-5 lg:flex-row">
      <aside className="w-full rounded-3xl border border-white/80 bg-white/85 p-3 shadow-[0_18px_50px_rgba(47,61,110,0.12)] lg:w-80"><div className="flex items-center gap-2 px-3 py-3 text-sm font-semibold text-[#17213f]"><MessageCircle size={17} className="text-[#263BAA]" /> Tus chats</div>{loading && <div className="flex items-center gap-2 px-3 py-6 text-sm text-[#7883a3]"><LoaderCircle className="animate-spin" size={16} /> Cargando...</div>}{!loading && chats.length === 0 && <p className="px-3 py-6 text-sm text-[#7883a3]">El chat aún no está disponible.</p>}{chats.map((chat) => <button key={chat.taskId} type="button" onClick={() => setSelectedId(chat.taskId)} className={`w-full rounded-2xl p-3 text-left transition ${selected?.taskId === chat.taskId ? 'bg-[#eef1ff]' : 'hover:bg-[#f4f6fc]'}`}><div className="flex items-center justify-between"><span className="truncate font-semibold text-[#17213f]">{chat.taskName ?? chat.title ?? chat.taskId}</span><Wifi size={14} className="text-[#177245]" /></div><p className="mt-1 truncate text-xs text-[#7883a3]">{role === 'PROVIDER' ? (chat.buyerId ?? 'Solicitante no disponible') : (chat.sellerId ?? 'Proveedor no disponible')}</p>{chat.status && <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7883a3]">{chat.status}</p>}</button>)}</aside>
      {selected ? <ChatConversation key={selected.taskId} chat={selected} userId={userId} /> : <div className="flex min-h-[520px] flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfd6ea] bg-white/60 text-center"><WifiOff className="mb-3 text-[#7883a3]" /><p className="font-semibold text-[#17213f]">El chat aún no está disponible</p><p className="mt-1 text-sm text-[#7883a3]">Selecciona una tarea con una conversación activa.</p></div>}
    </div>
  </div>;
}
