const base = document.head.querySelector('base') ? document.head.querySelector('base').href : '';

const resetEmailButton = document.querySelector('.button__reset-email');

enterKey(null, resetEmailButton, resetEmail);
async function resetEmail() {
  resetEmailButton.disabled = true;
  let error = false;

  const response = await fetchGet(`./reset-email`)
    .catch(e => {
      addMessage('Failed to send reset email');
      error = true;
    });
  if (!error) {
    addMessage('Your email has been reset');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
}
