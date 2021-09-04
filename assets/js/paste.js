const base = document.head.querySelector('base') ? document.head.querySelector('base').href : '';

const lemurButton = document.querySelector('.paste-link-here__button');
const lemurInput = document.querySelector('.paste-link-here__input');

function getDetailedError(errorMessage) {
  if (errorMessage.startsWith('409: ') && errorMessage.split('409: ').length >= 1) {
    return errorMessage.split('409: ')[1]
  }
}
async function addLink () {
  const linkText = document.querySelector('.paste-link-here__input').value;
  let error = false;
  const response = await fetchPost('./add-link', { link: linkText })
    .catch(e => {
      const tidbit = (e.message.startsWith('409')) ? getDetailedError(e.message) : 'Unknown error';
      addMessage(`Failed to watch "${linkText}": ${tidbit}`);
      error = true;
    });
  if (!error) {
    clearMessages();
    addMessage(`Watching ${linkText}`, undefined, '../watching');
  }
  // lemurButton.disabled = true;
}

enterKey(lemurInput, lemurButton, addLink);
