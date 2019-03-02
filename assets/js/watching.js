const editButtons = document.querySelectorAll('.edit');
const editModal = document.querySelector('.modal__container');
const modalBody = editModal.querySelector('.modal__body');
const editRowContainer = editModal.querySelector('.edit-row__container');
const buttonsContainer = editModal.querySelector('.buttons__container');
const saveButton = buttonsContainer.querySelector('.save');
const archiveButton = buttonsContainer.querySelector('.archive');
const loading = buttonsContainer.querySelector('.loading');


editButtons.forEach(editButton => {
  editButton.addEventListener('click', (e) => {
    editModal.classList.remove('hidden');

    const watch = JSON.parse(e.target.parentElement.dataset.json);
    refreshModal(watch);
  });
});

editModal.addEventListener('click', e => {
  if (e.target === editModal) editModal.classList.add('hidden');
});

function refreshModal(watch) {
  const fieldNameMappings = {
    watchName: {name: 'Name'},
    url: {name: 'URL'},
    // unwantedWords: {name: 'Unwanted Words'},
    // requiredWords: {name: 'Required Words'},
    creationDate: {name: 'Creation Date', readOnly: true, conversionFunc: getShortDate}
    // archived: {name: 'Archived'}
  };
  Array.from(modalBody.querySelectorAll('.edit-row')).forEach(row => row.remove());
  Object.entries(watch)
    .filter(([key]) => fieldNameMappings.hasOwnProperty(key))
    .forEach(([key, value]) => {
      const editRowDiv = document.createElement('div');
      editRowDiv.classList.add('edit-row');
      editRowDiv.classList.add('watch');
      const fieldSpan = document.createElement('span');
      fieldSpan.textContent = fieldNameMappings[key].name;
      editRowDiv.appendChild(fieldSpan);
      const valueSpan = document.createElement('span');
      const computedValue = fieldNameMappings[key].hasOwnProperty('conversionFunc') ? fieldNameMappings[key].conversionFunc(value) : value;
      let valueChild;
      if (fieldNameMappings[key].readOnly) {
        valueChild = document.createElement('span');
        valueChild.textContent = computedValue;
      } else {
        valueChild = document.createElement('input');
        valueChild.setAttribute('type', 'text');
        valueChild.value = computedValue;
      }
      valueChild.dataset.keyName = key;
      valueSpan.appendChild(valueChild);
      editRowDiv.appendChild(valueSpan);
      editRowContainer.appendChild(editRowDiv);
      modalBody.dataset.watchId = watch.id;
      modalBody.dataset.archived = watch.archived ? 'true' : '';
      archiveButton.textContent = !watch.archived ? 'Archive' : 'Unarchive';
    });
    const modalInputs = modalBody.querySelectorAll('input[type="text"]');
    enterKey(modalInputs, saveButton, updateWatch);
}

archiveButton.addEventListener('click', e => {
  updateWatch(true);
});

async function updateWatch(archive = false) {
  const watchId = modalBody.dataset.watchId;
  const nameEl = modalBody.querySelector('[data-key-name="watchName"]');
  const watchName = nameEl.nodeName === 'INPUT' ? nameEl.value : nameEl.textContent;
  const watchUrl = modalBody.querySelector('[data-key-name="url"]').value;
  const watch = {
    id: watchId,
    name: watchName,
    url: watchUrl,
    archived: archive ? !modalBody.dataset.archived : modalBody.dataset.archived
  };
  const pressedButton = archive ? archiveButton : saveButton;
  pressedButton.disabled = true;
  loading.textContent = archive ? 'Archiving...' : 'Saving...';
  loading.classList.remove('invisible');
  let error = false;
  const response = await fetchPost('/update-watch', watch)
    .catch(e => {
      console.error('Failed to update watch', e);
      loading.textContent = 'Failed to update watch';
      error = true;
    });
  if (!error) {
    loading.classList.add('invisible');
    window.location.reload();
  }
}

function getShortDate(epoch) {
  const timeParts = new Date(epoch).toLocaleTimeString('en-US').split(' ');
  const time = `${timeParts[0].substring(0, timeParts[0].lastIndexOf(':'))} ${timeParts[1]}`;
  const arr = new Date(epoch).toJSON().slice(0,10).split('-');
  const date = [arr[1], arr[2], arr[0]].join('/');
  return `${time} ${date}`;
}
