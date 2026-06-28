import React, { useRef, useEffect } from 'react';
import { useAIChatStore } from '../stores/aiChat';

const AIChatPanel: React.FC = () => {
  const {
    messages, context, isLoading,
    apiKey, model, hasEnvApiKey,
    setApiKey, setModel,
    sendPrompt, clearMessages, loadAIStatus,
  } = useAIChatStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAIStatus();
  }, [loadAIStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputRef.current?.value.trim();
    if (!text) return;
    if (inputRef.current) inputRef.current.value = '';
    sendPrompt(text);
  };

  const hasKey = !!apiKey || hasEnvApiKey;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-sm font-semibold text-white/80">AI Assistant</span>
        <div className="flex gap-1">
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all"
            title="Clear chat"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center px-6 py-10 text-white/25 gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-300/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-xs leading-relaxed">
            Select text and press <span className="font-mono text-violet-300/70">Cmd/Ctrl + L</span> to add context, then ask a question.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length > 0 && context && (
          <div className="rounded-xl bg-violet-500/8 border border-violet-500/15 p-3">
            <p className="text-[10px] uppercase tracking-wider text-violet-300/60 mb-1.5">Context</p>
            <p className="text-xs text-white/50 line-clamp-4">{context}</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-violet-600/25 text-violet-100'
                  : m.error
                  ? 'bg-red-500/10 text-red-300/80 border border-red-500/15'
                  : 'bg-white/[0.05] text-white/80'
              }`}
            >
              {m.pending ? (
                <span className="flex items-center gap-2 text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                  Thinking…
                </span>
              ) : (
                m.content.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>)
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/[0.06] p-3 space-y-3">
        <div className="space-y-2">
          {!hasKey && (
            <>
              <input
                type="password"
                placeholder="OpenRouter API key"
                defaultValue={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs placeholder:text-white/15 focus:outline-none focus:border-violet-500/40"
              />
              <p className="text-[10px] text-white/25">
                Get a key at{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300/70 hover:text-violet-200 underline underline-offset-2"
                >
                  openrouter.ai/keys
                </a>
              </p>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model (e.g. openai/gpt-4o-mini)"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs placeholder:text-white/15 focus:outline-none focus:border-violet-500/40"
              />
            </>
          )}
          {hasKey && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-white/30 truncate">
                {hasEnvApiKey && !apiKey ? 'Using OPENROUTER_API_KEY from environment' : 'OpenRouter connected'}
                {' · '}{model}
              </p>
              {apiKey && (
                <button
                  onClick={() => setApiKey('')}
                  className="text-[10px] text-white/25 hover:text-white/50 transition-colors flex-shrink-0"
                >
                  Change key
                </button>
              )}
            </div>
          )}
          {hasKey && !apiKey && (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-xs placeholder:text-white/15 focus:outline-none focus:border-violet-500/40"
            />
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            placeholder="Ask about the selection…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 resize-none bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-sm placeholder:text-white/15 focus:outline-none focus:border-violet-500/40 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="self-end p-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-200 disabled:opacity-40 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
