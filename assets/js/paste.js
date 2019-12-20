const base = document.head.querySelector('base') ? document.head.querySelector('base').href : '';

const lemurButton = document.querySelector('.paste-link-here__button');
const lemurInput = document.querySelector('.paste-link-here__input');
async function addLink() {
  const linkText = document.querySelector('.paste-link-here__input').value;
  let error = false;
  const response = await fetchPost(`${base}/add-link`, {link: linkText})
    .catch(e => {
      const tidbit = (e === '409') ? 'site not supported' : 'unknown error'
      addMessage(`Failed to watch "${linkText}": ${tidbit}`);
      error = true;
    });
  if (!error) addMessage(`Watching ${linkText}`);
  // lemurButton.disabled = true;
}

enterKey(lemurInput, lemurButton, addLink);
