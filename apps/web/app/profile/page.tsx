"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    research_area: "",
    interests: [] as string[],
    daily_hours: 4,
    theory_ratio: 0.7,
  });
  const [interestInput, setInterestInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/profile`)
      .then((r) => r.json())
      .then((data) => setProfile(data));
  }, []);

  const handleSave = async () => {
    await fetch(`${API_BASE}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addInterest = () => {
    if (interestInput && !profile.interests.includes(interestInput)) {
      setProfile({ ...profile, interests: [...profile.interests, interestInput] });
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>用户资料</h1>
      <Link href="/" style={{ color: "#0070f3", marginBottom: 20, display: "inline-block" }}>
        ← 返回首页
      </Link>

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>姓名</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ddd",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>研究领域</label>
        <input
          type="text"
          value={profile.research_area}
          onChange={(e) => setProfile({ ...profile, research_area: e.target.value })}
          placeholder="例如：代数几何、偏微分方程"
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ddd",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>研究兴趣</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addInterest()}
            placeholder="添加关键词"
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={addInterest}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#0070f3",
              color: "white",
              cursor: "pointer",
            }}
          >
            添加
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {profile.interests.map((interest) => (
            <span
              key={interest}
              style={{
                padding: "4px 12px",
                borderRadius: 16,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {interest}
              <span
                onClick={() => removeInterest(interest)}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          每日工作时间（小时）
        </label>
        <input
          type="number"
          value={profile.daily_hours}
          onChange={(e) => setProfile({ ...profile, daily_hours: Number(e.target.value) })}
          min="1"
          max="12"
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ddd",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          理论研究比例：{Math.round(profile.theory_ratio * 100)}%
        </label>
        <input
          type="range"
          value={profile.theory_ratio}
          onChange={(e) => setProfile({ ...profile, theory_ratio: Number(e.target.value) })}
          min="0"
          max="1"
          step="0.1"
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.7 }}>
          <span>更多实验</span>
          <span>更多理论</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: 24,
          padding: "12px 24px",
          borderRadius: 4,
          border: "none",
          backgroundColor: "#0070f3",
          color: "white",
          fontSize: 16,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {saved ? "✓ 已保存" : "保存"}
      </button>
    </div>
  );
}
