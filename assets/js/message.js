function clearMessages () {
  Array.from(document.querySelectorAll('.messages > div'))
    .forEach(messageEl => messageEl.remove())
}

function addMessage (text, duration = Infinity, link) {
  const messageEl = document.createElement('div');
  if (link) {
    const link = document.createElement('a');
    link.setAttribute('href', link)
    link.textContent = text;
    messageEl.appendChild(link);
  } else {
    messageEl.textContent = text;
  }
  const messagesContainer = document.querySelector('.messages');
  messagesContainer.insertBefore(messageEl, messagesContainer.firstChild);
  if (isFinite(duration)) {
    setTimeout(() => {
      messageEl.remove();
    }, duration);
  }
  return messageEl;
}
