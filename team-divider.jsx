import { useState, useCallback } from "react";

// ── 핵심 algorithm ──────────────────────────────────────────────
// 전략: remainder를 앞 팀들에 1명씩 분산 → 팀 크기 차이 최대 1명
function divideTeams(names, numTeams) {
  if (!names.length || numTeams < 1) return [];
  const shuffled = [...names].sort(() => Math.random() - 0.5);
  const base = Math.floor(shuffled.length / numTeams);
  const extra = shuffled.length % numTeams; // 이 수만큼 팀은 +1명
  const teams = [];
  let idx = 0;
  for (let i = 0; i < numTeams; i++) {
    const size = base + (i < extra ? 1 : 0);
    teams.push({ id: i + 1, members: shuffled.slice(idx, idx + size) });
    idx += size;
  }
  return teams;
}

function divideBySize(names, teamSize) {
  if (!names.length || teamSize < 1) return [];
  const numTeams = Math.ceil(names.length / teamSize);
  return divideTeams(names, numTeams);
}

// ── 색상 팔레트 ──────────────────────────────────────────────────
const PALETTE = [
  { bg: "#E8F4FD", border: "#3B82F6", text: "#1E40AF", badge: "#3B82F6" },
  { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", badge: "#F59E0B" },
  { bg: "#D1FAE5", border: "#10B981", text: "#064E3B", badge: "#10B981" },
  { bg: "#FCE7F3", border: "#EC4899", text: "#831843", badge: "#EC4899" },
  { bg: "#EDE9FE", border: "#8B5CF6", text: "#4C1D95", badge: "#8B5CF6" },
  { bg: "#FEE2E2", border: "#EF4444", text: "#7F1D1D", badge: "#EF4444" },
  { bg: "#E0F2FE", border: "#0EA5E9", text: "#0C4A6E", badge: "#0EA5E9" },
  { bg: "#F0FDF4", border: "#22C55E", text: "#14532D", badge: "#22C55E" },
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState("byTeams"); // "byTeams" | "bySize"
  const [numTeams, setNumTeams] = useState(4);
  const [teamSize, setTeamSize] = useState(4);
  const [teams, setTeams] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const names = inputText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleGenerate = useCallback(() => {
    if (!names.length) return;
    const result =
      mode === "byTeams"
        ? divideTeams(names, numTeams)
        : divideBySize(names, teamSize);
    setTeams(result);
    setGenerated(true);
  }, [names, mode, numTeams, teamSize]);

  const handleShuffle = useCallback(() => {
    if (!names.length) return;
    const result =
      mode === "byTeams"
        ? divideTeams(names, numTeams)
        : divideBySize(names, teamSize);
    setTeams(result);
  }, [names, mode, numTeams, teamSize]);

  const handleCopy = () => {
    const text = teams
      .map((t) => `[${t.id}조] ${t.members.join(", ")}`)
      .join("\n");

    // fallback: textarea + execCommand (iframe 환경 대응)
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // clipboard API도 시도
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => alert("복사 실패: 결과를 직접 드래그하여 복사해주세요."));
    } finally {
      document.body.removeChild(el);
    }
  };

  const sizes = teams.map((t) => t.members.length);
  const minSize = sizes.length ? Math.min(...sizes) : 0;
  const maxSize = sizes.length ? Math.max(...sizes) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1E293B", padding: "24px 32px", borderBottom: "3px solid #3B82F6" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎲</span>
          <div>
            <h1 style={{ margin: 0, color: "#F1F5F9", fontSize: 22, fontWeight: 700 }}>균등 조 배정기</h1>

          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {/* Input section */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 8, fontSize: 14 }}>
            학생 이름 입력 <span style={{ color: "#94A3B8", fontWeight: 400 }}>(줄바꿈 또는 쉼표로 구분)</span>
          </label>
          <textarea
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setGenerated(false); }}
            placeholder={"홍길동\n김철수\n이영희\n박민준\n..."}
            rows={6}
            style={{
              width: "100%", boxSizing: "border-box", border: "1.5px solid #E2E8F0",
              borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#334155",
              resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.7,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
          <div style={{ color: "#64748B", fontSize: 12, marginTop: 6 }}>
            총 <strong style={{ color: "#3B82F6" }}>{names.length}</strong>명 입력됨
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { key: "byTeams", label: "📦 조 수로 나누기" },
              { key: "bySize", label: "👥 조당 인원으로 나누기" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setMode(opt.key); setGenerated(false); }}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 14, fontFamily: "inherit", transition: "all 0.2s",
                  background: mode === opt.key ? "#3B82F6" : "#F1F5F9",
                  color: mode === opt.key ? "#fff" : "#64748B",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {mode === "byTeams" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, color: "#334155", fontSize: 14, whiteSpace: "nowrap" }}>조 수</label>
              <input
                type="number" min={1} max={50} value={numTeams}
                onChange={(e) => { setNumTeams(Math.max(1, parseInt(e.target.value) || 1)); setGenerated(false); }}
                style={{ width: 80, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 15, fontFamily: "inherit", outline: "none" }}
              />
              {names.length > 0 && numTeams > 0 && (
                <span style={{ color: "#64748B", fontSize: 13 }}>
                  → 약 <strong style={{ color: "#3B82F6" }}>{Math.floor(names.length / numTeams)}~{Math.ceil(names.length / numTeams)}</strong>명/조
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, color: "#334155", fontSize: 14, whiteSpace: "nowrap" }}>조당 인원</label>
              <input
                type="number" min={1} max={50} value={teamSize}
                onChange={(e) => { setTeamSize(Math.max(1, parseInt(e.target.value) || 1)); setGenerated(false); }}
                style={{ width: 80, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 15, fontFamily: "inherit", outline: "none" }}
              />
              {names.length > 0 && teamSize > 0 && (
                <span style={{ color: "#64748B", fontSize: 13 }}>
                  → 약 <strong style={{ color: "#3B82F6" }}>{Math.ceil(names.length / teamSize)}</strong>개 조 생성
                </span>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={handleGenerate}
            disabled={!names.length}
            style={{
              padding: "13px 32px", background: names.length ? "#3B82F6" : "#CBD5E1",
              color: "#fff", border: "none", borderRadius: 12, fontWeight: 700,
              fontSize: 15, cursor: names.length ? "pointer" : "not-allowed",
              fontFamily: "inherit", boxShadow: names.length ? "0 4px 12px rgba(59,130,246,0.35)" : "none",
              transition: "all 0.2s",
            }}
          >
            🎲 조 배정하기
          </button>
          {generated && (
            <>
              <button
                onClick={handleShuffle}
                style={{
                  padding: "13px 24px", background: "#F1F5F9", color: "#475569",
                  border: "1.5px solid #E2E8F0", borderRadius: 12, fontWeight: 600,
                  fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                }}
              >
                🔀 다시 섞기
              </button>
              <button
                onClick={handleCopy}
                style={{
                  padding: "13px 24px",
                  background: copied ? "#10B981" : "#F1F5F9",
                  color: copied ? "#fff" : "#475569",
                  border: `1.5px solid ${copied ? "#10B981" : "#E2E8F0"}`,
                  borderRadius: 12, fontWeight: 600, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                }}
              >
                {copied ? "✅ 복사됨!" : "📋 결과 복사"}
              </button>
            </>
          )}
        </div>

        {/* Result */}
        {generated && teams.length > 0 && (
          <>
            {/* Summary bar */}
            <div style={{
              background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12,
              padding: "12px 18px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 13, color: "#1E40AF" }}>
                총 <strong>{names.length}명</strong>
              </span>
              <span style={{ fontSize: 13, color: "#1E40AF" }}>
                <strong>{teams.length}개</strong> 조
              </span>
              <span style={{ fontSize: 13, color: "#1E40AF" }}>
                조당 <strong>{minSize === maxSize ? minSize : `${minSize}~${maxSize}`}명</strong>
                {minSize !== maxSize && (
                  <span style={{ color: "#3B82F6", marginLeft: 6 }}>
                    (앞 {names.length % teams.length}조: {maxSize}명 / 나머지: {minSize}명)
                  </span>
                )}
              </span>
            </div>

            {/* Team cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {teams.map((team) => {
                const c = PALETTE[(team.id - 1) % PALETTE.length];
                return (
                  <div
                    key={team.id}
                    style={{
                      background: c.bg, border: `2px solid ${c.border}`,
                      borderRadius: 14, padding: "16px 18px",
                      animation: "fadeUp 0.3s ease both",
                      animationDelay: `${(team.id - 1) * 0.05}s`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: c.text, fontSize: 15 }}>{team.id}조</span>
                      <span style={{
                        background: c.badge, color: "#fff", fontSize: 11,
                        fontWeight: 700, borderRadius: 999, padding: "2px 10px",
                      }}>
                        {team.members.length}명
                      </span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {team.members.map((name, i) => (
                        <li key={i} style={{
                          padding: "5px 0", color: c.text, fontSize: 14,
                          borderBottom: i < team.members.length - 1 ? `1px solid ${c.border}33` : "none",
                        }}>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
