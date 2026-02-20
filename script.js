const SERVER_ID = "1393260947921047723";
const API = `https://discord.com/api/guilds/${SERVER_ID}/widget.json`;

// your invite (used as fallback or to force if you prefer)
const FALLBACK_INVITE = "https://discord.gg/BDENZVRstJ?utm_source=luis_github_pages_widget";

fetch(API)
  .then(res => res.json())
  .then(data => {
    document.getElementById("server-name").textContent = data.name || "Unnamed server";
    document.getElementById("total-members").textContent = (data.members && data.members.length) || 0;
    document.getElementById("online-count-val").textContent = (data.members && data.members.filter(m => m.status === "online").length) || 0;
    document.getElementById("idle-count").textContent = (data.members && data.members.filter(m => m.status === "idle").length) || 0;
    document.getElementById("dnd-count").textContent = (data.members && data.members.filter(m => m.status === "dnd").length) || 0;

    document.getElementById("online-count").textContent =
      `${data.presence_count || 0} members online`;

    // prefer widget's instant_invite, otherwise use the provided invite
    const inviteUrl = data.instant_invite || FALLBACK_INVITE;
    const joinBtn = document.getElementById("join-btn");
    if (joinBtn) {
      joinBtn.href = inviteUrl;
      joinBtn.target = "_blank";
      joinBtn.rel = "noopener noreferrer";
    }

    if (data.icon_url) {
      const icon = document.getElementById("server-icon");
      if (icon) icon.src = data.icon_url;
    }

    const membersDiv = document.getElementById("members");
    if (Array.isArray(data.members) && membersDiv) {
      data.members.forEach(m => {
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
