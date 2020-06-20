function addMessage (text, duration = Infinity) {
  const messageEl = document.createElement('div');
  messageEl.textContent = text;
  const messagesContainer = document.querySelector('.messages');
  messagesContainer.insertBefore(messageEl, messagesContainer.firstChild);
  if (isFinite(duration)) {
    setTimeout(() => {
      messageEl.remove();
    }, duration);
  }
  return messageEl;
}
