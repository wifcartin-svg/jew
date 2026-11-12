const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
require('./migrate');

const dir = path.join(__dirname, 'data');
const db = new DatabaseSync(path.join(dir, 'jemiki.sqlite'));

const items = [
 ['solstice-pendant','Solstice Pendant','necklaces',4890,'A softly sculpted pendant made for everyday light.','Demo material (placeholder)','Demo finish (placeholder)','photo-1611652022419-a9419f74343d',12],
 ['luna-chain','Luna Chain Necklace','necklaces',6290,'A fine chain with a quiet, luminous presence.','Demo material (placeholder)','Demo finish (placeholder)','photo-1599643478518-a784e5dc4c8f',8],
 ['stillwater-pearl','Stillwater Pearl Necklace','necklaces',5790,'A modern pearl accent with an easy, considered silhouette.','Demo material (placeholder)','Demo finish (placeholder)','photo-1617038220319-276d3cfab638',7],
 ['arc-studs','Arc Sculpted Studs','earrings',3290,'Sculptural curves bring a subtle statement to your edit.','Demo material (placeholder)','Demo finish (placeholder)','photo-1535632066927-ab7c9ab60908',15],
 ['halo-hoops','Halo Mini Hoops','earrings',3890,'Lightweight hoops with a softly rounded profile.','Demo material (placeholder)','Demo finish (placeholder)','photo-1617038260897-41a1f14a8ca0',10],
 ['petal-drops','Petal Drop Earrings','earrings',4590,'A fluid drop shape inspired by botanical forms.','Demo material (placeholder)','Demo finish (placeholder)','photo-1630019852942-f89202989a59',6],
 ['orbit-ring','Orbit Open Ring','rings',3690,'An open silhouette that feels effortless worn alone or stacked.','Demo material (placeholder)','Demo finish (placeholder)','photo-1605100804763-247f67b3557e',12],
 ['form-band','Form Band Ring','rings',2990,'A clean, softly rounded band for everyday wear.','Demo material (placeholder)','Demo finish (placeholder)','photo-1603561596112-0a132b757442',14],
 ['dune-ring','Dune Texture Ring','rings',4290,'Subtle organic texture gives this ring its own character.','Demo material (placeholder)','Demo finish (placeholder)','photo-1605100804763-247f67b3557e',5],
 ['sol-chain-bracelet','Sol Chain Bracelet','bracelets',3490,'A delicate chain bracelet with a refined clasp detail.','Demo material (placeholder)','Demo finish (placeholder)','photo-1611591437281-460bfbe1220a',11],
 ['sculpt-cuff','Sculpt Cuff','bracelets',5190,'A modern open cuff with a smooth, sculptural finish.','Demo material (placeholder)','Demo finish (placeholder)','photo-1611652022419-a9419f74343d',7],
 ['tide-bracelet','Tide Link Bracelet','bracelets',3990,'An elegant link profile with a little everyday presence.','Demo material (placeholder)','Demo finish (placeholder)','photo-1611591437281-460bfbe1220a',9],
 ['celeste-pendant','Celeste Pendant','necklaces',6990,'A considered pendant designed to layer beautifully.','Demo material (placeholder)','Demo finish (placeholder)','photo-1599643478518-a784e5dc4c8f',4],
 ['marin-hoops','Marin Huggie Hoops','earrings',2790,'A close-fitting hoop with a polished, minimal form.','Demo material (placeholder)','Demo finish (placeholder)','photo-1535632066927-ab7c9ab60908',16],
 ['line-ring','Line Signet Ring','rings',4890,'A contemporary signet shape with a softened face.','Demo material (placeholder)','Demo finish (placeholder)','photo-1603561596112-0a132b757442',3],
 ['muse-bracelet','Muse Beaded Bracelet','bracelets',3290,'A subtle beaded profile for a touch of texture.','Demo material (placeholder)','Demo finish (placeholder)','photo-1611591437281-460bfbe1220a',8]
];
const insert = db.prepare('INSERT OR IGNORE INTO products (slug,name,category,price,description,material,finish,image,stock) VALUES (?,?,?,?,?,?,?,?,?)');
for (const item of items) insert.run(...item);
db.close();
console.log(`Seeded ${items.length} JEMIKI sample products.`);
