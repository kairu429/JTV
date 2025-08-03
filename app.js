const API_URLS = {
  quake: "https://api.p2pquake.net/v2/jma/quake",
  tsunami: "https://api.p2pquake.net/v2/jma/tsunami",
  warning: "https://www.data.jma.go.jp/developer/xml/feed/regular.xml"
};

const SHINDO_COLORS = {
  "震度1": "#888888",
  "震度2": "#4169e1",
  "震度3": "#228b22",
  "震度4": "#ffd700",
  "震度5弱": "#ff8c00",
  "震度5強": "#ff7f50",
  "震度6弱": "#ff0000",
  "震度6強": "#cc0000",
  "震度7": "#800080",
  "不明": "#000000"
};

function scaleToShindo(maxScale) {
  const map = {
    10: "震度1", 20: "震度2", 30: "震度3", 40: "震度4",
    45: "震度5弱", 50: "震度5強", 55: "震度6弱",
    60: "震度6強", 70: "震度7"
  };
  return map[maxScale] || "不明";
}

function formatTime(str) {
  try {
    const d = new Date(str);
    return d.toLocaleString("ja-JP");
  } catch {
    return str;
  }
}

async function updateInfo() {
  const content = document.getElementById("content");
  content.innerHTML = "<p>読み込み中...</p>";
  const selected = document.getElementById("apiSelect").value;
  const url = API_URLS[selected];

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("取得失敗");
    if (selected === "warning") {
      const xml = await res.text();
      parseXML(xml);
    } else {
      const data = await res.json();
      if (data.length === 0) {
        content.innerHTML = "<p>情報はありません。</p>";
        return;
      }
      if (selected === "quake") displayQuake(data);
      else if (selected === "tsunami") displayTsunami(data);
    }
  } catch (err) {
    content.innerHTML = `<p>エラー: ${err.message}</p>`;
  }
}

function displayQuake(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";
  data.forEach(item => {
    const eq = item.earthquake || item;
    if (!eq) return;

    const shindo = scaleToShindo(eq.maxScale);
    const color = SHINDO_COLORS[shindo];
    const places = (item.points || []).slice(0, 3).map(p => p.addr || "不明").join(", ");

    const html = `
      <div class="card" style="border-left-color: ${color};">
        <b>発生時刻:</b> ${formatTime(eq.time)}<br>
        <b>震源地:</b> ${eq.hypocenter?.name || "不明"}<br>
        <b>マグニチュード:</b> M${eq.hypocenter?.magnitude || "不明"}<br>
        <b>深さ:</b> ${eq.hypocenter?.depth || "不明"} km<br>
        <b>最大震度:</b> <span style="color:${color}">${shindo}</span><br>
        <b>震度観測地点:</b> ${places}
      </div>`;
    content.insertAdjacentHTML("beforeend", html);
  });
}

function displayTsunami(data) {
  const content = document.getElementById("content");
  content.innerHTML = "";
  data.forEach(item => {
    const time = item.time || "不明";
    const areas = item.areas?.map(a => a.name).join(", ") || "不明";

    const html = `
      <div class="card">
        <b>発表時刻:</b> ${formatTime(time)}<br>
        <b>津波予報対象地域:</b> ${areas}
      </div>`;
    content.insertAdjacentHTML("beforeend", html);
  });
}

function parseXML(xmlText) {
  const content = document.getElementById("content");
  content.innerHTML = "";
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const entries = xml.getElementsByTagName("entry");

  if (!entries.length) {
    content.innerHTML = "<p>警報・注意報情報はありません。</p>";
    return;
  }

  for (let entry of entries) {
    const title = entry.getElementsByTagName("title")[0]?.textContent || "タイトル不明";
    const updated = entry.getElementsByTagName("updated")[0]?.textContent || "日時不明";
    const summary = entry.getElementsByTagName("summary")[0]?.textContent || "内容不明";

    const html = `
      <div class="card" style="background-color: #fff8dc; border-color: orange;">
        <b>${title}</b><br>
        <b>更新日時:</b> ${formatTime(updated)}<br>
        ${summary}
      </div>`;
    content.insertAdjacentHTML("beforeend", html);
  }
}

// 初期ロードで情報取得
window.onload = updateInfo;
