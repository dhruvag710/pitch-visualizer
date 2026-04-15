import { useState, useEffect, useRef } from "react";

const STYLES = [
  { id: "cinematic", label: "Cinematic", desc: "Film noir, dramatic lighting, photorealistic" },
  { id: "concept_art", label: "Concept Art", desc: "Painterly, vibrant, detailed illustration" },
  { id: "minimalist", label: "Minimalist", desc: "Clean lines, flat design, bold geometry" },
  { id: "editorial", label: "Editorial", desc: "Magazine-quality, high contrast, stylized" },
  { id: "futuristic", label: "Futuristic", desc: "Sci-fi, neon, tech-forward aesthetic" },
];

const PALETTE = {
  cinematic: { bg: "#0a0a0f", card: "#13131a", accent: "#c9a84c", text: "#e8e0d0", sub: "#8a7e6e" },
  concept_art: { bg: "#0d0a14", card: "#160f1e", accent: "#a855f7", text: "#ede8f5", sub: "#7c6a8e" },
  minimalist: { bg: "#f5f5f0", card: "#ffffff", accent: "#1a1a1a", text: "#1a1a1a", sub: "#666660" },
  editorial: { bg: "#0f0f0f", card: "#1a1a1a", accent: "#e63946", text: "#f0f0f0", sub: "#888888" },
  futuristic: { bg: "#020b18", card: "#071526", accent: "#00d4ff", text: "#cce8f4", sub: "#4a7a99" },
};

const SCENE_ICONS = ["◈", "◉", "◎", "◍", "◌"];

function ProgressBar({ progress, accent }) {
  return (
    <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginTop: "8px" }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        background: accent,
        borderRadius: "2px",
        transition: "width 0.4s ease",
        boxShadow: `0 0 8px ${accent}88`
      }} />
    </div>
  );
}

function SceneCard({ scene, index, palette, visible }) {
  const gradients = {
    cinematic: `linear-gradient(135deg, #1a1408 0%, #0d0c10 100%)`,
    concept_art: `linear-gradient(135deg, #1a0d2e 0%, #0d0820 100%)`,
    minimalist: `linear-gradient(135deg, #f8f8f5 0%, #eeeeeb 100%)`,
    editorial: `linear-gradient(135deg, #1f0508 0%, #0f0f0f 100%)`,
    futuristic: `linear-gradient(135deg, #001a2e 0%, #020b18 100%)`,
  };

  const isLight = palette === "minimalist";

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`,
      background: gradients[palette] || gradients.cinematic,
      border: `1px solid ${PALETTE[palette].accent}33`,
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Visual panel */}
      <div style={{
        height: "200px",
        background: scene.visualBg || `linear-gradient(135deg, ${PALETTE[palette].accent}22 0%, transparent 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${PALETTE[palette].accent}22`,
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle at 30% 50%, ${PALETTE[palette].accent}18 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${PALETTE[palette].accent}10 0%, transparent 50%)`,
        }} />
        <div style={{
          position: "absolute", top: "12px", left: "16px",
          background: `${PALETTE[palette].accent}22`,
          border: `1px solid ${PALETTE[palette].accent}44`,
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "10px",
          letterSpacing: "2px",
          color: PALETTE[palette].accent,
          fontFamily: "monospace",
          textTransform: "uppercase",
        }}>
          SCENE {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{
          fontSize: "48px",
          opacity: 0.15,
          position: "absolute",
          right: "20px",
          bottom: "10px",
        }}>{SCENE_ICONS[index % SCENE_ICONS.length]}</div>
        {/* Central scene visual text */}
        <div style={{
          padding: "16px 24px",
          textAlign: "center",
          zIndex: 1,
          maxWidth: "85%",
        }}>
          <div style={{
            fontSize: "13px",
            color: PALETTE[palette].accent,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
            lineHeight: 1.6,
            textShadow: `0 0 20px ${PALETTE[palette].accent}44`,
          }}>
            "{scene.visualDescription}"
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px", flex: 1 }}>
        {/* Original text */}
        <div style={{
          fontSize: "13px",
          color: PALETTE[palette].text,
          lineHeight: 1.65,
          marginBottom: "14px",
          opacity: 0.9,
        }}>
          {scene.original}
        </div>

        {/* Engineered prompt */}
        <div style={{
          background: `${PALETTE[palette].accent}0f`,
          border: `1px solid ${PALETTE[palette].accent}22`,
          borderRadius: "6px",
          padding: "10px 12px",
        }}>
          <div style={{
            fontSize: "9px",
            letterSpacing: "2px",
            color: PALETTE[palette].accent,
            textTransform: "uppercase",
            fontFamily: "monospace",
            marginBottom: "6px",
            opacity: 0.8,
          }}>ENGINEERED PROMPT</div>
          <div style={{
            fontSize: "11px",
            color: PALETTE[palette].sub,
            lineHeight: 1.6,
            fontFamily: "monospace",
          }}>
            {scene.engineeredPrompt}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PitchVisualizer() {
  const [inputText, setInputText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [scenes, setScenes] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [title, setTitle] = useState("");
  const [cardsVisible, setCardsVisible] = useState(false);
  const abortRef = useRef(null);
  const pal = PALETTE[selectedStyle];
  const isLight = selectedStyle === "minimalist";

  const SAMPLE = `When Acme Corp struggled with disconnected data silos, their sales cycles stretched to nine months and deals fell through. They implemented our unified platform and integrated all their tools within two weeks. In the first quarter, deal velocity improved by 60% and the sales team closed 40% more revenue. Today, Acme is expanding to three new markets, powered by real-time insights that were simply impossible before.`;

  async function generate() {
    if (!inputText.trim()) return;
    setStatus("loading");
    setScenes([]);
    setCardsVisible(false);
    setProgress(10);
    setStatusMsg("Segmenting narrative...");

    const styleObj = STYLES.find(s => s.id === selectedStyle);

    const systemPrompt = `You are a visual storyboard director and creative prompt engineer. Given a narrative text, you will:
1. Segment it into 3-5 key scenes (logical story beats)
2. For each scene, write a vivid one-sentence visual description (as if describing what a viewer would SEE in an illustration)
3. For each scene, engineer a detailed image generation prompt in the style: ${styleObj.label} (${styleObj.desc})
4. Give the storyboard a short cinematic title (4-7 words)

Respond ONLY with valid JSON in this exact format, no markdown fences:
{
  "title": "Short Cinematic Title Here",
  "scenes": [
    {
      "original": "The original sentence or clause from the text",
      "visualDescription": "A vivid one-sentence visual description of what would be seen",
      "engineeredPrompt": "Full detailed image generation prompt with style keywords, lighting, composition, mood"
    }
  ]
}

Rules for engineered prompts:
- Add specific lighting descriptors (golden hour, dramatic rim lighting, soft diffused, neon glow, etc.)
- Include composition notes (wide establishing shot, close-up, bird's eye view, etc.)
- Embed the visual style consistently: ${styleObj.desc}
- Add mood and atmosphere words
- Be specific about subjects, setting, colors
- Each prompt should be 40-70 words`;

    try {
      setProgress(30);
      setStatusMsg("Engineering visual prompts...");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: `Narrative text:\n\n${inputText.trim()}` }],
        }),
      });

      setProgress(70);
      setStatusMsg("Composing storyboard...");

      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setProgress(90);
      setStatusMsg("Rendering panels...");

      await new Promise(r => setTimeout(r, 300));

      setTitle(parsed.title || "Visual Storyboard");
      setScenes(parsed.scenes || []);
      setProgress(100);
      setStatus("done");
      setTimeout(() => setCardsVisible(true), 100);
    } catch (e) {
      console.error(e);
      setStatus("error");
      setStatusMsg("Something went wrong. Please try again.");
    }
  }

  const bgStyle = {
    minHeight: "100vh",
    background: pal.bg,
    color: pal.text,
    fontFamily: isLight ? "'Palatino Linotype', Georgia, serif" : "'Georgia', 'Times New Roman', serif",
    padding: "0",
    boxSizing: "border-box",
  };

  return (
    <div style={bgStyle}>
      {/* Noise texture overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{
            fontSize: "10px", letterSpacing: "5px", color: pal.accent,
            textTransform: "uppercase", fontFamily: "monospace", marginBottom: "16px", opacity: 0.9,
          }}>
            ◈ PITCH VISUALIZER ◈
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: "normal",
            margin: "0 0 12px",
            color: pal.text,
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}>
            From Words to Storyboard
          </h1>
          <p style={{ color: pal.sub, fontSize: "15px", margin: 0, lineHeight: 1.6 }}>
            Paste a narrative. Watch it transform into a visual sequence.
          </p>
        </div>

        {/* Input Section */}
        <div style={{
          background: pal.card,
          border: `1px solid ${pal.accent}2a`,
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "28px",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
              color: pal.accent, fontFamily: "monospace", marginBottom: "10px",
            }}>NARRATIVE INPUT</div>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste your customer success story, pitch narrative, or any 3–5 sentence story here…"
              style={{
                width: "100%", minHeight: "120px", background: `${pal.accent}08`,
                border: `1px solid ${pal.accent}22`, borderRadius: "8px",
                padding: "14px 16px", color: pal.text, fontSize: "14px",
                lineHeight: 1.7, resize: "vertical", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = `${pal.accent}66`}
              onBlur={e => e.target.style.borderColor = `${pal.accent}22`}
            />
            <button
              onClick={() => setInputText(SAMPLE)}
              style={{
                marginTop: "6px", background: "none", border: "none",
                color: pal.sub, fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", fontFamily: "monospace", padding: "2px 0",
                textDecoration: "underline", opacity: 0.7,
              }}
            >
              USE SAMPLE TEXT
            </button>
          </div>

          {/* Style Selector */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase",
              color: pal.accent, fontFamily: "monospace", marginBottom: "12px",
            }}>VISUAL STYLE</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  style={{
                    padding: "8px 16px",
                    background: selectedStyle === s.id ? `${PALETTE[s.id].accent}22` : "transparent",
                    border: `1px solid ${selectedStyle === s.id ? PALETTE[s.id].accent : pal.sub + "44"}`,
                    borderRadius: "6px",
                    color: selectedStyle === s.id ? PALETTE[s.id].accent : pal.sub,
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    transition: "all 0.2s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {selectedStyle && (
              <div style={{ fontSize: "11px", color: pal.sub, marginTop: "8px", fontStyle: "italic", opacity: 0.7 }}>
                {STYLES.find(s => s.id === selectedStyle)?.desc}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={status === "loading" || !inputText.trim()}
            style={{
              width: "100%", padding: "14px",
              background: status === "loading" ? `${pal.accent}22` : pal.accent,
              border: "none", borderRadius: "8px",
              color: isLight ? "#fff" : pal.bg,
              fontSize: "13px", fontWeight: "bold", letterSpacing: "3px",
              textTransform: "uppercase", cursor: status === "loading" ? "not-allowed" : "pointer",
              fontFamily: "monospace", transition: "all 0.2s",
              opacity: status === "loading" || !inputText.trim() ? 0.6 : 1,
            }}
          >
            {status === "loading" ? "GENERATING…" : "GENERATE STORYBOARD"}
          </button>

          {status === "loading" && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "11px", color: pal.sub, fontFamily: "monospace", marginBottom: "4px" }}>
                {statusMsg}
              </div>
              <ProgressBar progress={progress} accent={pal.accent} />
            </div>
          )}

          {status === "error" && (
            <div style={{
              marginTop: "12px", padding: "10px 14px",
              background: "#ff000018", border: "1px solid #ff000033",
              borderRadius: "6px", fontSize: "12px", color: "#ff6b6b",
            }}>
              {statusMsg}
            </div>
          )}
        </div>

        {/* Storyboard Output */}
        {status === "done" && scenes.length > 0 && (
          <div style={{
            opacity: cardsVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}>
            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div style={{
                fontSize: "10px", letterSpacing: "5px", color: pal.accent,
                fontFamily: "monospace", textTransform: "uppercase", marginBottom: "10px", opacity: 0.8,
              }}>
                STORYBOARD
              </div>
              <h2 style={{
                fontSize: "clamp(20px, 3vw, 32px)", fontWeight: "normal",
                color: pal.text, margin: 0, letterSpacing: "-0.5px",
              }}>
                {title}
              </h2>
              <div style={{
                marginTop: "10px", fontSize: "12px", color: pal.sub, fontFamily: "monospace",
              }}>
                {scenes.length} scenes · {STYLES.find(s => s.id === selectedStyle)?.label} style
              </div>
            </div>

            {/* Scene Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: scenes.length === 3 ? "repeat(3, 1fr)" : scenes.length === 4 ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}>
              {scenes.map((scene, i) => (
                <SceneCard
                  key={i}
                  scene={scene}
                  index={i}
                  palette={selectedStyle}
                  visible={cardsVisible}
                />
              ))}
            </div>

            {/* Footer note */}
            <div style={{
              textAlign: "center", padding: "20px",
              background: `${pal.accent}08`,
              border: `1px solid ${pal.accent}18`,
              borderRadius: "8px",
              fontSize: "12px", color: pal.sub, lineHeight: 1.6,
            }}>
              <span style={{ color: pal.accent, fontFamily: "monospace" }}>◈</span> Each panel shows the engineered image-generation prompt below the original text.
              These prompts are ready to feed into DALL·E 3, Midjourney, or Stable Diffusion.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
