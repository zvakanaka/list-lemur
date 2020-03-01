const editButtons = document.querySelectorAll('.edit');
const editModal = document.querySelector('.modal__container.modal__container--edit');
const editModalBody = editModal.querySelector('.modal__body');
const editRowContainer = editModal.querySelector('.edit-row__container');
const editButtonsContainer = editModal.querySelector('.buttons__container');
const saveButton = editButtonsContainer.querySelector('.save');
const archiveButton = editButtonsContainer.querySelector('.archive');
const loadingEdit = editButtonsContainer.querySelector('.loading');

const base = document.head.querySelector('base') ? document.head.querySelector('base').href : '';

editButtons.forEach(editButton => {
  editButton.addEventListener('click', (e) => {
    editModal.classList.remove('hidden');

    const watch = JSON.parse(e.target.parentElement.parentElement.dataset.json);
    refreshEditModal(watch);
  });
});

editModal.addEventListener('click', e => {
  if (e.target === editModal) editModal.classList.add('hidden');
});

function refreshEditModal(watch) {
  const fieldNameMappings = {
    watchName: {name: 'Name'},
    url: {name: 'URL'},
    // unwantedWords: {name: 'Unwanted Words'},
    // requiredWords: {name: 'Required Words'},
    creationDate: {name: 'Created', readOnly: true, conversionFunc: getShortDate}
  };
  Array.from(editModalBody.querySelectorAll('.edit-row')).forEach(row => row.remove());
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
      editModalBody.dataset.watchId = watch.id;
      editModalBody.dataset.archived = watch.archived ? 'true' : '';
      archiveButton.textContent = !watch.archived ? 'Archive' : 'Unarchive';
    });
    const modalInputs = editModalBody.querySelectorAll('input[type="text"]');
    enterKey(modalInputs, saveButton, updateWatch);
}

archiveButton.addEventListener('click', e => {
  updateWatch(true);
});

async function updateWatch(archive = false) {
  const watchId = editModalBody.dataset.watchId;
  const nameEl = editModalBody.querySelector('[data-key-name="watchName"]');
  const watchName = nameEl.nodeName === 'INPUT' ? nameEl.value : nameEl.textContent;
  const watchUrl = editModalBody.querySelector('[data-key-name="url"]').value;
  const watch = {
    id: watchId,
    name: watchName,
    url: watchUrl,
    archived: archive ? !editModalBody.dataset.archived : editModalBody.dataset.archived,
    deleted: false
  };
  const pressedButton = archive ? archiveButton : saveButton;
  pressedButton.disabled = true;
  loadingEdit.textContent = archive ? 'Archiving...' : 'Saving...';
  loadingEdit.classList.remove('invisible');
  let error = false;
  const response = await fetchPost(`./update-watch`, watch)
    .catch(e => {
      console.error('Failed to update watch', e);
      loadingEdit.textContent = 'Failed to update watch';
      error = true;
    });
  if (!error) {
    loadingEdit.classList.add('invisible');
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



async function deleteWatch(watch, rowEl) {
  let error = false;
  const body = {
    id: watch.id,
    deleted: true
  };
  const response = await fetchPost(`./update-watch`, body)
    .catch(e => {
      console.error('Failed to delete watch', e);
      alert('Failed to delete watch');
      error = true;
    });
  if (!error) {
    rowEl.remove();
  }
}
const deleteButtons = document.querySelectorAll('.delete-watch');

deleteButtons.forEach(deleteButton => {
  deleteButton.addEventListener('click', (e) => {
    deleteButton.textContent = 'Deleting...';
    const rowEl = e.target.parentElement.parentElement;
    const watch = JSON.parse(rowEl.dataset.json);
    deleteWatch(watch, rowEl);
  });
});
