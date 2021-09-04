let Parser = require('rss-parser');
let parser = new Parser();

async function rssToHtml(rssString) {
  let feed = await parser.parseString(rssString);
  // https://github.com/rbren/rss-parser#output

  return `<ul>
    ${feed.items.map(({link, title, description}) => {
     return `<li class="listing">
      <a class="link" href="${link}">
        <span class="title">${title}</span>
        ${description ? `<span class="description">${description}</span>` : ''}
      </a>
    </li>`
    }).join('\n')}
  </ul>`
}

module.exports = rssToHtml;