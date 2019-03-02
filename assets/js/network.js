function fetchPost(url, data) {
  return fetchHelper(url, data, {method: 'POST'});
}

function fetchGet(url, data) {
  return fetchHelper(url, data);
}

function fetchHelper(url, data, args = {}) {
  return new Promise(async function(resolve, reject) {
    const options = {
      method: args.method || 'GET',
      headers: {},
      credentials: 'include'
    };
    if (options.method.toUpperCase() === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options).then(res => {
      if (`${res.status}`[0] !== '2') reject(`${res.status}`);
      return res.json()
    });
    resolve(response);
  });
}
