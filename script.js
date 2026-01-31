const SERVER_ID = "1393260947921047723";
const API = `https://discord.com/api/guilds/${SERVER_ID}/widget.json`;

fetch(API)
  .then(res => res.json())
  .then(data => {
    document.getElementById("server-name").textContent = data.name;
    document.getElementById("total-members").textContent = data.members.length;
    document.getElementById("online-count-val").textContent = data.members.filter(m => m.status === "online").length;
    document.getElementById("idle-count").textContent = data.members.filter(m => m.status === "idle").length;
    document.getElementById("dnd-count").textContent = data.members.filter(m => m.status === "dnd").length;

    document.getElementById("online-count").textContent =
      `${data.presence_count} members online`;

    document.getElementById("join-btn").href = data.instant_invite;

    if (data.icon_url) {
      document.getElementById("server-icon").src = data.icon_url;
    }

    const membersDiv = document.getElementById("members");

    data.members.forEach(m => {
      const div = document.createElement("div");
      div.className = "member";

      div.innerHTML = `
        <img src="${m.avatar_url}">
        <span class="status ${m.status}"></span>
        <span>${m.username}</span>
      `;

      membersDiv.appendChild(div);
    });
  })
  .catch(() => {
    document.getElementById("server-name").textContent = "Widget Disabled";
  });
