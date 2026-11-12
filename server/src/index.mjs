import 'dotenv/config'
import http from 'node:http'
import { MongoClient } from 'mongodb'
import { avatars, resolveSigning, syntheticDemo } from './catalog.mjs'

const port = Number(process.env.API_PORT ?? 8787)
const mongoUrl = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017'
const databaseName = process.env.MONGODB_DB ?? 'sigler'
const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 5000 })
const send = (response, status, payload) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': process.env.CORS_ORIGIN ?? 'http://127.0.0.1:5173' }); response.end(JSON.stringify(payload)) }
const body = async (request) => new Promise((resolve, reject) => { let raw = ''; request.on('data', (chunk) => { raw += chunk; if (raw.length > 32_000) reject(new Error('Payload too large')) }); request.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch { reject(new Error('Invalid JSON')) } }) })

try {
  await client.connect()
  const db = client.db(databaseName)
  await db.command({ ping: 1 })
  await db.collection('avatars').createIndex({ id: 1 }, { unique: true })
  await db.collection('sign_assets').createIndex({ signId: 1 }, { unique: true })
  await db.collection('avatars').bulkWrite(avatars.map((avatar) => ({ updateOne: { filter: { id: avatar.id }, update: { $set: avatar }, upsert: true } })))
  await db.collection('sign_assets').updateOne({ signId: syntheticDemo.signId }, { $set: syntheticDemo }, { upsert: true })
  const server = http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') return send(response, 204, {})
    if (request.method === 'GET' && request.url === '/api/health') return send(response, 200, { ok: true, database: 'connected', databaseName })
    if (request.method === 'GET' && request.url === '/api/avatars') return send(response, 200, { avatars: await db.collection('avatars').find({}, { projection: { _id: 0 } }).toArray() })
    if (request.method === 'POST' && request.url === '/api/signing/resolve') { try { const payload = await body(request); const result = resolveSigning(payload.input, payload.avatarId); if (result.ok) await db.collection('signing_requests').insertOne({ ...payload, signId: result.asset.signId, validationStatus: result.asset.validationStatus, createdAt: new Date() }); return send(response, result.ok ? 200 : 422, result) } catch (error) { return send(response, 400, { ok: false, code: 'INVALID_REQUEST', message: error.message }) } }
    return send(response, 404, { ok: false, code: 'NOT_FOUND' })
  })
  server.listen(port, () => console.log(`Sigler API listening on http://127.0.0.1:${port}`))
  process.on('SIGINT', async () => { await client.close(); server.close(() => process.exit(0)) })
} catch (error) { console.error('MongoDB connection failed; API did not start.', error.message); await client.close(); process.exit(1) }
