const SERVER_ID = "1393260947921047723";
const API = `https://discord.com/api/guilds/${SERVER_ID}/widget.json`;

fetch(API)
  .then(res => {
    if (!res.ok) throw new Error("Widget disabled or server private");
    return res.json();
  })
  .then(data => {
    document.getElementById("server-name").textContent = data.name || "Unknown Server";
    document.getElementById("total-members").textContent = data.members ? data.members.length : 0;
    document.getElementById("online-count-val").textContent = data.members ? data.members.filter(m => m.status === "online").length : 0;
    document.getElementById("idle-count").textContent = data.members ? data.members.filter(m => m.status === "idle").length : 0;
    document.getElementById("dnd-count").textContent = data.members ? data.members.filter(m => m.status === "dnd").length : 0;

    document.getElementById("online-count").textContent = `${data.presence_count || 0} members online`;
    document.getElementById("join-btn").href = data.instant_invite || "#";

    // Show server icon if available
    if (data.icon_hash) {
      document.getElementById("server-icon").src =
        `https://cdn.discordapp.com/icons/${SERVER_ID}/${data.icon_hash}.webp?size=128`;
    } else {
      document.getElementById("server-icon").src = "placeholder.png"; // fallback
    }

    const membersDiv = document.getElementById("members");
    membersDiv.innerHTML = ""; // clear old content

    if (data.members) {
      data.members.forEach(m => {
        const div = document.createElement("div");
        div.className = "member";
        div.innerHTML = `
          <img src="${m.avatar_url || 'avatar_placeholder.png'}">
          <span class="status ${m.status}"></span>
          <span>${m.username}</span>
        `;
        membersDiv.appendChild(div);
      });
    }
  })
  .catch(() => {
    document.getElementById("server-name").textContent = "Widget Disabled";
    document.getElementById("server-icon").src = "placeholder.png";
  });
