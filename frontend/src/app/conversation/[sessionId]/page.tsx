'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { sendMessage } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function parseAIMessage(content: string): {
  main: string;
  suggestions: string[];
  correction: string | null;
} {
  // Extract correction if present
  let correction: string | null = null;
  let body = content;
  const correctionMatch = body.match(/💬\s*Correction:\s*(.+?)(?=\n|💡|$)/s);
  if (correctionMatch) {
    correction = correctionMatch[1].trim();
    body = body.replace(correctionMatch[0], '').trim();
  }

  // Extract suggestions
  const parts = body.split('💡 Suggested:');
  const main = parts[0].trim();
  const suggestions =
    parts[1]
      ?.split('\n')
      .map((s) => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean) || [];

  return { main, suggestions, correction };
}

// ---------- Speech Recognition hook (inline, conversation-specific) ----------
function useConversationMic(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  const stop = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterimText('');
  }, []);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interim += t;
        }
      }
      setInterimText(finalTranscript + interim);

      // Auto-send after 1.5s of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (finalTranscript.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          const text = finalTranscript.trim();
          recognition.stop();
          setIsRecording(false);
          setInterimText('');
          if (text) onTranscript(text);
        }, 1500);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
    };

    recognition.start();
    setIsRecording(true);
    finalTranscript = '';
  }, [isSupported, onTranscript]);

  return { isRecording, interimText, isSupported, start, stop };
}

// ---------- Main Page ----------

export default function ConversationSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, speaking } = useSpeechSynthesis();

  // Load initial AI message
  useEffect(() => {
    const stored = sessionStorage.getItem(`conv_${sessionId}`);
    if (stored) {
      setMessages([{ role: 'assistant', content: stored }]);
      sessionStorage.removeItem(`conv_${sessionId}`);
      // Auto-speak the opening line
      const { main } = parseAIMessage(stored);
      setTimeout(() => speak(main), 400);
    }
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || sending) return;
      const userMsg = text.trim();
      setKeyboardInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
      setSending(true);
      try {
        const res = await sendMessage(sessionId, userMsg);
        setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);
        // Auto-speak AI response
        const { main } = parseAIMessage(res.message);
        setTimeout(() => speak(main), 200);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Lỗi kết nối. Hãy thử lại.' },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId, speak],
  );

  const { isRecording, interimText, isSupported, start, stop } = useConversationMic(handleSend);

  const handleMicClick = () => {
    if (isRecording) {
      stop();
    } else if (!sending) {
      start();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/conversation" className="text-muted-foreground hover:text-primary text-lg">
          &larr;
        </Link>
        <h1 className="text-xl font-bold flex-1">Hội thoại AI</h1>
        <button
          onClick={() => setShowKeyboard((v) => !v)}
          className={cn(
            'p-2 rounded-lg transition-colors text-sm',
            showKeyboard ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-primary',
          )}
          title="Chuyển sang gõ phím"
        >
          ⌨️
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-4xl mb-3">💬</p>
            <p>Đang tải cuộc hội thoại...</p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === 'assistant') {
            const { main, suggestions, correction } = parseAIMessage(msg.content);
            const isLast = i === messages.length - 1;
            return (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm shrink-0 mt-1">
                  AI
                </div>
                <div className="flex-1 space-y-2 max-w-sm">
                  {/* AI speech bubble */}
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm leading-relaxed">{main}</p>
                    <button
                      onClick={() => speak(main)}
                      className={cn(
                        'mt-2 text-xs flex items-center gap-1 transition-colors',
                        speaking ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                      )}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                      {speaking ? 'Đang phát...' : 'Nghe lại'}
                    </button>
                  </div>

                  {/* Grammar correction */}
                  {correction && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                      <span className="font-semibold">💬 Sửa lỗi: </span>{correction}
                    </div>
                  )}

                  {/* Suggestions — always visible for last AI message */}
                  {suggestions.length > 0 && isLast && !sending && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium">💡 Bạn có thể nói:</p>
                      {suggestions.map((s, si) => (
                        <button
                          key={si}
                          onClick={() => handleSend(s)}
                          className="block text-sm bg-white border-2 border-primary/20 rounded-xl px-3 py-2.5 hover:border-primary hover:bg-primary/5 transition-all text-left w-full font-medium shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className="flex justify-end">
              <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm">
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {/* AI thinking indicator */}
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm shrink-0">
              AI
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice input area */}
      <div className="space-y-3">
        {/* Transcript preview */}
        {(isRecording || interimText) && (
          <div className="bg-muted/60 rounded-2xl px-4 py-3 text-center min-h-[3rem] flex items-center justify-center">
            {interimText ? (
              <p className="text-sm italic text-foreground">&ldquo;{interimText}&rdquo;</p>
            ) : (
              <p className="text-sm text-muted-foreground animate-pulse">Đang nghe...</p>
            )}
          </div>
        )}

        {/* Keyboard input (optional) */}
        {showKeyboard && (
          <div className="flex gap-2">
            <input
              type="text"
              value={keyboardInput}
              onChange={(e) => setKeyboardInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(keyboardInput);
                }
              }}
              placeholder="Gõ tin nhắn tiếng Anh..."
              disabled={sending || isRecording}
              className="flex-1 border-2 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
              autoFocus
            />
            <button
              onClick={() => handleSend(keyboardInput)}
              disabled={sending || !keyboardInput.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              Gửi
            </button>
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-2">
          {!isSupported && (
            <p className="text-xs text-muted-foreground">
              Trình duyệt không hỗ trợ thu âm. Dùng ⌨️ để gõ.
            </p>
          )}

          {isSupported && (
            <>
              <button
                onClick={handleMicClick}
                disabled={sending}
                className={cn(
                  'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 scale-110'
                    : sending
                    ? 'bg-muted cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 hover:scale-105',
                )}
              >
                {/* Pulse rings when recording */}
                {isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
                    <span className="absolute inset-[-8px] rounded-full border-2 border-red-300 animate-ping opacity-30" style={{ animationDuration: '1.5s' }} />
                  </>
                )}

                {sending ? (
                  <svg className="w-8 h-8 text-muted-foreground animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
                  </svg>
                )}
              </button>

              <p className="text-xs text-muted-foreground">
                {isRecording
                  ? 'Đang ghi âm... nhấn để dừng'
                  : sending
                  ? 'AI đang trả lời...'
                  : 'Nhấn mic để nói'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
