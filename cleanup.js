const db = require('./db.json')

console.log(`marking ${db.watches.length} watches as archived`)
db.watches.forEach(w => w.archived = true)
console.log(`deleting ${db.items.length}  items`)
delete db.items
db.items = []
console.log(`writing file`)
const fs = require('fs')
fs.writeFileSync('db.json', JSON.stringify(db, null, 2))
console.log('done')
