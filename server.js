const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { DatabaseSync } = require('node:sqlite');
require('./seed');
const root = __dirname;
const db = new DatabaseSync(path.join(root, 'data', 'jemiki.sqlite'));
db.exec('PRAGMA foreign_keys = ON;');
const port = Number(process.env.PORT || 3000);
const categories = ['necklaces','earrings','rings','bracelets'];
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' }); res.end(JSON.stringify(data)); };
const product = p => ({ ...p, price: Number(p.price), stock: Number(p.stock) });
function body(req) { return new Promise((resolve,reject)=>{ let raw=''; req.on('data',c=>{ raw+=c; if(raw.length>20000) reject(new Error('Request too large')); }); req.on('end',()=>{ try { resolve(JSON.parse(raw||'{}')); } catch { reject(new Error('Invalid JSON')); } }); req.on('error',reject); }); }
function clean(v, max=500) { return typeof v==='string' ? v.trim().slice(0,max) : ''; }
function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length<255; }

async function api(req,res,url) {
  if(req.method==='GET' && url.pathname==='/api/config') return json(res,200,{shipping:Math.max(0,Number.parseInt(process.env.SHIPPING_CHARGE||'0',10)||0)});
  if(req.method==='GET' && url.pathname==='/api/products') {
    const q=clean(url.searchParams.get('q'),100), category=clean(url.searchParams.get('category'),30), sort=clean(url.searchParams.get('sort'),20), min=Number(url.searchParams.get('min')||0), max=Number(url.searchParams.get('max')||99999999), available=url.searchParams.get('available')==='true';
    if(!Number.isFinite(min)||!Number.isFinite(max)||min<0||max<0)return json(res,400,{error:'Enter a valid price range.'});
    if(category && !categories.includes(category)) return json(res,400,{error:'Unknown category'});
    let sql='SELECT * FROM products WHERE price BETWEEN ? AND ?', args=[Math.max(0,min),Math.max(0,max)];
    if(category){sql+=' AND category=?';args.push(category)} if(q){sql+=' AND name LIKE ?';args.push('%'+q.replace(/[\\%_]/g,'')+'%')} if(available)sql+=' AND stock>0';
    sql+=sort==='price-asc'?' ORDER BY price ASC':sort==='price-desc'?' ORDER BY price DESC':' ORDER BY id DESC';
    return json(res,200,db.prepare(sql).all(...args).map(product));
  }
  if(req.method==='GET' && url.pathname.startsWith('/api/products/')) { const p=db.prepare('SELECT * FROM products WHERE slug=?').get(decodeURIComponent(url.pathname.split('/').pop())); return p?json(res,200,product(p)):json(res,404,{error:'Product not found'}); }
  if(req.method==='POST' && url.pathname==='/api/newsletter') { const b=await body(req),email=clean(b.email,254).toLowerCase(); if(!validEmail(email))return json(res,400,{error:'Enter a valid email address.'}); try{db.prepare('INSERT INTO newsletter(email) VALUES(?)').run(email);return json(res,201,{message:'You’re on the list. Thank you.'})}catch{return json(res,200,{message:'This email is already subscribed.'})} }
  if(req.method==='POST' && url.pathname==='/api/contact') { const b=await body(req),name=clean(b.name,100),email=clean(b.email,254).toLowerCase(),subject=clean(b.subject,120),message=clean(b.message,3000); if(name.length<2||!validEmail(email)||subject.length<2||message.length<10)return json(res,400,{error:'Please complete every field with valid details.'}); db.prepare('INSERT INTO messages(name,email,subject,message) VALUES(?,?,?,?)').run(name,email,subject,message);return json(res,201,{message:'Thank you. Your message has been received.'}); }
  if(req.method==='POST' && url.pathname==='/api/orders') {
    const b=await body(req),c=b.customer||{},name=clean(c.fullName,100),email=clean(c.email,254).toLowerCase(),phone=clean(c.phone,30),address=clean(c.address,250),city=clean(c.city,100),state=clean(c.state,100),postal=clean(c.postalCode,20),country=clean(c.country,100),items=Array.isArray(b.items)?b.items:[];
    if(name.length<2||!validEmail(email)||phone.length<6||address.length<5||city.length<2||state.length<2||postal.length<3||country.length<2||!items.length||items.length>30)return json(res,400,{error:'Please check your contact and delivery details, then try again.'});
    const shipping=Math.max(0,Number.parseInt(process.env.SHIPPING_CHARGE||'0',10)||0); const insertOrder=db.prepare('INSERT INTO orders(order_number,full_name,email,phone,address,city,state,postal_code,country,subtotal,shipping,total) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)'); const getProduct=db.prepare('SELECT * FROM products WHERE id=?'); const reduce=db.prepare('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?'); const addItem=db.prepare('INSERT INTO order_items(order_id,product_id,product_name,quantity,unit_price) VALUES(?,?,?,?,?)');
    try { db.exec('BEGIN IMMEDIATE');let subtotal=0,lines=[];for(const line of items){const id=Number(line.id),qty=Number(line.quantity);if(!Number.isInteger(id)||!Number.isInteger(qty)||qty<1||qty>20)throw Error('Invalid item quantity.');const p=getProduct.get(id);if(!p)throw Error('A selected product could not be found.');if(p.stock<qty)throw Error(`${p.name} has only ${p.stock} available.`);subtotal+=p.price*qty;lines.push({p,qty});}const total=subtotal+shipping,orderNo='JM-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();const result=insertOrder.run(orderNo,name,email,phone,address,city,state,postal,country,subtotal,shipping,total);for(const {p,qty} of lines){if(Number(reduce.run(qty,p.id,qty).changes)!==1)throw Error(`${p.name} is no longer available in that quantity.`);addItem.run(result.lastInsertRowid,p.id,p.name,qty,p.price)}db.exec('COMMIT');return json(res,201,{orderNumber:orderNo,subtotal,shipping,total});}catch(e){try{db.exec('ROLLBACK')}catch{}return json(res,400,{error:e.message||'Unable to place your demo order.'});}
  }
  return json(res,404,{error:'Not found'});
}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/'))return await api(req,res,url);let target=decodeURIComponent(url.pathname);if(target==='/'||target==='/index.html')target='/index.html';const parts=target.split(/[\\/]+/).filter(Boolean);if(parts.some(x=>x.startsWith('.')||['data','node_modules'].includes(x)))return json(res,404,{error:'Not found'});let file=path.resolve(root,'.'+target);if(!file.startsWith(root+path.sep))return json(res,403,{error:'Forbidden'});if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res)}catch(e){json(res,500,{error:'Something went wrong. Please try again.'})}});
if (require.main === module) server.listen(port,'127.0.0.1',()=>console.log(`JEMIKI is ready at http://localhost:${port}`));
module.exports = { api, db, server };
