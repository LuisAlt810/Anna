const SERVER_ID = "1393260947921047723";
const API = `https://discord.com/api/guilds/${SERVER_ID}/widget.json`;

fetch(API)
  .then(res => res.json())
  .then(data => {
    document.getElementById("server-name").textContent = data.name || "Unknown Server";
    document.getElementById("total-members").textContent = data.members?.length || 0;
    document.getElementById("online-count-val").textContent = data.members?.filter(m => m.status === "online").length || 0;
    document.getElementById("idle-count").textContent = data.members?.filter(m => m.status === "idle").length || 0;
    document.getElementById("dnd-count").textContent = data.members?.filter(m => m.status === "dnd").length || 0;

    document.getElementById("online-count").textContent =
      `${data.presence_count || 0} members online`;

    document.getElementById("join-btn").href = data.instant_invite || "#";

    if (data.icon_url) {
      document.getElementById("server-icon").src = `https://cdn.discordapp.com/icons/${SERVER_ID}/${data.icon_url}.webp`;
    }

    const membersDiv = document.getElementById("members");
    membersDiv.innerHTML = ""; // Clear previous members

    data.members?.forEach(m => {
      const div = document.createElement("div");
      div.className = "member";

      div.innerHTML = `
        <img src="${m.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${m.username}">
        <span class="status ${m.status}"></span>
        <span>${m.username}</span>
      `;

      membersDiv.appendChild(div);
    });
  })
  .catch(() => {
    document.getElementById("server-name").textContent = "Widget Disabled";
  });
