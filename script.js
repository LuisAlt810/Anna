const SERVER_ID = "1393260947921047723";
const API = `https://discord.com/api/guilds/${SERVER_ID}/widget.json`;

// Clean invite (no tracking params)
const FALLBACK_INVITE = "https://discord.gg/BDENZVRstJ";

fetch(API)
  .then(res => res.json())
  .then(data => {
    document.getElementById("server-name").textContent = data.name || "Unnamed server";

    const members = Array.isArray(data.members) ? data.members : [];

    document.getElementById("total-members").textContent = members.length;
    document.getElementById("online-count-val").textContent =
      members.filter(m => m.status === "online").length;
    document.getElementById("idle-count").textContent =
      members.filter(m => m.status === "idle").length;
    document.getElementById("dnd-count").textContent =
      members.filter(m => m.status === "dnd").length;

    document.getElementById("online-count").textContent =
      `${data.presence_count || 0} members online`;

    // ✅ Use widget invite if enabled, otherwise fallback
    const inviteUrl = data.instant_invite || FALLBACK_INVITE;

    const joinBtn = document.getElementById("join-btn");
    if (joinBtn) {
      joinBtn.href = inviteUrl;
      joinBtn.target = "_blank";
      joinBtn.rel = "noopener noreferrer";
    }

    // Server icon
    if (data.icon_url) {
      const icon = document.getElementById("server-icon");
      if (icon) icon.src = data.icon_url;
    }

    // Members list
    const membersDiv = document.getElementById("members");
    if (membersDiv) {
      membersDiv.innerHTML = ""; // prevent duplicates on reload

      members.forEach(m => {
        const div = document.createElement("div");
        div.className = "member";

        div.innerHTML = `
          <img src="${m.avatar_url || ''}" alt="${m.username || 'member'}">
          <span class="status ${m.status || 'offline'}"></span>
          <span>${m.username || 'Unknown'}</span>
        `;

        membersDiv.appendChild(div);
      });
    }
  })
  .catch(() => {
    document.getElementById("server-name").textContent = "Widget Disabled";

    const joinBtn = document.getElementById("join-btn");
    if (joinBtn) {
      joinBtn.href = FALLBACK_INVITE;
      joinBtn.target = "_blank";
      joinBtn.rel = "noopener noreferrer";
    }
  });
