import { useEffect, useRef, useState } from "react";

const LEVEL_STYLE = {
  ERROR: "text-alarm",
  WARN: "text-warn",
  INFO: "text-info",
};

function levelOf(line) {
  const match = line.match(/\b(ERROR|WARN|INFO)\b/);
  return match ? match[1] : "INFO";
}

export default function LogStream({ logs }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    setVisibleCount(0);
    if (!logs.length) return;
    const id = setInterval(() => {
      setVisibleCount((n) => {
        if (n >= logs.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 220);
    return () => clearInterval(id);
  }, [logs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div className="bg-ink-950 border border-ink-700 rounded-xl overflow-hidden">
      <div className="bg-ink-900 border-b border-ink-700 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-400">
        Live Logs
      </div>
      <div ref={scrollRef} className="h-72 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed">
        {logs.slice(0, visibleCount).map((line, i) => {
          const level = levelOf(line);
          return (
            <div key={i} className={`animate-log-in ${LEVEL_STYLE[level] || "text-ink-200"}`}>
              {line}
            </div>
          );
        })}
        {visibleCount < logs.length && (
          <span className="inline-block w-2 h-4 bg-ink-200 animate-cursor-blink" />
        )}
      </div>
    </div>
  );
}
