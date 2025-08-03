const API_URLS = {
  quake: "https://api.p2pquake.net/v2/jma/quake",
  tsunami: "https://api.p2pquake.net/v2/jma/tsunami"
};

async function updateInfo() {
  const content = document.getElementById("content");
  content.innerHTML = "<p>読み込み中...</p>";
  const selected = document.getElementById("apiSelect").value;
  const url = API_URLS[selected];

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    if (!data || data.length === 0) {
      content.innerHTML = "<p>現在、表示できる情報はありません。</p>";
      return;
    }

    if (selected === "quake") displayQuake(data);
    else if (selected === "tsunami") displayTsunami(data);
  } catch (err) {
    content.innerHTML = `<p>エラー: ${err.message}</p>`;
  }
}

function displayQuake(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  data.forEach(event => {
    const card = document.createElement("div");
    card.className = "card";

    const time = new Date(event.time).toLocaleString();
    const place = event.earthquake.hypocenter.name || "震源不明";
    const magnitude = event.earthquake.magnitude;
    const maxScale = event.earthquake.maxScale;

    card.innerHTML = `
      <strong>地震発生時刻:</strong> ${time}<br>
      <strong>震源地:</strong> ${place}<br>
      <strong>マグニチュード:</strong> ${magnitude}<br>
      <strong>最大震度:</strong> ${scaleToText(maxScale)}
    `;
    content.appendChild(card);
  });
}

function displayTsunami(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  data.forEach(event => {
    const card = document.createElement("div");
    card.className = "card";

    const time = new Date(event.time).toLocaleString();
    const area = event.area.name || "不明";
    const category = event.category || "不明";

    card.innerHTML = `
      <strong>発表時刻:</strong> ${time}<br>
      <strong>エリア:</strong> ${area}<br>
      <strong>種別:</strong> ${category}
    `;
    content.appendChild(card);
  });
}

function scaleToText(scale) {
  const scaleMap = {
    "-1": "不明",
    0: "震度0",
    10: "震度1",
    20: "震度2",
    30: "震度3",
    40: "震度4",
    45: "震度5弱",
    46: "震度5強",
    50: "震度6弱",
    55: "震度6強",
    60: "震度7"
  };
  return scaleMap[scale] || "不明";
}
