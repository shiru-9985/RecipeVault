async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  fetch("http://localhost:3000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message })
});


  const data = await response.json();
  appendMessage(data.reply, "bot");
}

function appendMessage(text, sender) {
  const chatMessages = document.getElementById("chat-messages");
  const messageEl = document.createElement("p");
  messageEl.className = sender;
  messageEl.textContent = text;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
