# 📸 Exam: Build a Mini-Instagram API with Express + Sequelize

**Course:** Node.js & Express.js (MySQL / Sequelize)
**Duration:** 4 hours
**Total Points:** 100

---

## Overview

Build a **photo-sharing API** (a tiny Instagram) using **Express.js**, **Sequelize**, and **MySQL**, following the **MVC pattern** (Models, Controllers, Routes) with middlewares — the same architecture as the `express-app` project.

Users can **register** (with **email activation**), **log in** with a **JWT token**, **upload image posts** with a caption, browse a **public feed** of everyone's posts, **like** and **comment** on posts, and **direct-message** the person who posted a photo in **real time** over **Socket.io**.

All data lives in **MySQL** via **Sequelize models**. All HTTP responses are **JSON** (except EJS views). Uploaded images are served as static files from `public/media`.

Stack you must use (identical to class): ES modules, Sequelize with `sync({ alter: true })` migrations, `md5` password hashing, `jsonwebtoken`, `joi` validation via a reusable middleware, `http-errors`, `multer` uploads, `nodemailer` + EJS email templates, and `socket.io`.

---

## 🧠 Key Concepts You Must Demonstrate

### 1. Image Uploads → Posts
`POST /posts` uses `multer.single('image')`. You save the uploaded file to `public/media/`, then create a `Post` row storing the generated filename (or its public URL `/media/<file>`), the caption, and `userId: req.userId`.

### 2. Associations (mix of relationships)
- **One-to-many:** a user has many posts. `Users.hasMany(Posts)` / `Posts.belongsTo(Users, { as: 'author' })`.
- **One-to-many:** a post has many comments. `Posts.hasMany(Comments)` / `Comments.belongsTo(Posts)`.
- **Many-to-many:** users like posts **through** a `Likes` join model.
  ```js
  Users.belongsToMany(Posts, { through: Likes, as: 'likedPosts' });
  Posts.belongsToMany(Users, { through: Likes, as: 'likedBy' });
  ```
Load related rows in the feed with `include`.

### 3. JWT Auth + Email Activation
Sign `jwt.sign({ userId }, TOKEN_SECRET, { expiresIn: '24h' })` on login. The `authorization` middleware verifies the token and sets `req.userId`. Registration emails an activation link; login is blocked until `status === 'active'`.

### 4. Real-time DM to the poster (Socket.io)
A `Socket` service authenticates the handshake token and joins each user to a private room `user_<id>`. When someone sends a DM about a post, you persist a `Messages` row and emit it to the poster's room so they receive it instantly.

---

## Project Structure

```
mini-instagram/
├── app.js
├── migrate.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── clients/
│   └── db.sequelize.js
├── models/
│   ├── index.js
│   ├── Users.js
│   ├── Posts.js
│   ├── Comments.js
│   ├── Likes.js
│   └── Messages.js
├── controllers/
│   ├── users.js
│   ├── posts.js
│   └── chat.js
├── routes/
│   ├── index.js
│   ├── users.js
│   ├── posts.js
│   └── chat.js
├── middlewares/
│   ├── authorization.js
│   ├── validation.js
│   ├── errorHandler.js
│   ├── upload.js
│   └── schemas/
│       ├── users.schema.js
│       └── posts.schema.js
├── services/
│   ├── Socket.js
│   └── email.js
├── views/
│   ├── email/
│   │   └── register.ejs
│   └── feed.ejs
└── public/
    └── media/
```

---

## Step 1: Project Setup (8 points)

### 1.1 Initialize
- `package.json` with `"type": "module"`.
- `"dev"` script: `nodemon -r dotenv/config app.js dotenv_config_path=./.env`.
- `"build"` script: `node ./migrate.js`.

### 1.2 Dependencies

| Package        | Purpose                        |
|----------------|--------------------------------|
| `express`      | Web framework                  |
| `sequelize`    | ORM                            |
| `mysql2`       | MySQL driver                   |
| `dotenv`       | Env variables                  |
| `morgan`       | Request logger                 |
| `md5`          | Password hashing               |
| `jsonwebtoken` | JWT sign / verify              |
| `joi`          | Validation                     |
| `http-errors`  | HTTP error objects             |
| `lodash`       | Utilities                      |
| `uuid`         | Activation tokens & filenames  |
| `multer`       | Image uploads                  |
| `mime`         | Extension from mimetype        |
| `nodemailer`   | Email                          |
| `ejs`          | Email & page templates         |
| `socket.io`    | Real-time DMs                  |
| `nodemon`      | Dev server (devDependency)     |

### 1.3 `.env` (and `.env.example`)
```
PORT=3001
TOKEN_SECRET=your_token_secret_here
BACKEND_HOST=http://localhost:3001

MY_SQL_HOST=127.0.0.1
MY_SQL_PORT=3306
MY_SQL_USER=root
MY_SQL_PASSWORD=
MY_SQL_DATABASE=instagram
```

### 1.4 `.gitignore`
```
node_modules
.env
public/media/*
```

---

## Step 2: Database Client — `clients/db.sequelize.js` (5 points)
1. Read the five `MY_SQL_*` vars from `process.env`.
2. `new Sequelize(database, user, password, { host, port, dialect: 'mysql', logging: false, pool: {...} })`.
3. `await sequelize.authenticate()` in `try/catch`, log result.
4. Default-export the instance.

---

## Step 3: Models (24 points)

> Every model imports the shared `db`, extends `Model`, uses `BIGINT` auto-increment PKs, `timestamps: true`.

### 3.1 `models/Users.js` (6 points)

| Field             | Type    | Notes                        |
|-------------------|---------|------------------------------|
| `id`              | BIGINT  | PK, auto-increment           |
| `username`        | STRING  | unique handle                |
| `name`            | STRING  |                              |
| `email`           | STRING  |                              |
| `password`        | STRING  | hashed                       |
| `avatar`          | STRING  | uploaded image filename/url  |
| `status`          | STRING  | `'pending'` until activated  |
| `activationToken` | STRING  | UUID, cleared on activation  |

Static `hashPassword(password)` → `md5(md5(password) + 'some_secret')`.

### 3.2 `models/Posts.js` (6 points)

| Field     | Type    | Notes                          |
|-----------|---------|--------------------------------|
| `id`      | BIGINT  | PK                             |
| `image`   | STRING  | filename / public URL (required)|
| `caption` | STRING  |                                |
| `userId`  | BIGINT  | FK → author                    |

Associations (here or in `index.js`):
```js
Users.hasMany(Posts, { foreignKey: 'userId', as: 'posts' });
Posts.belongsTo(Users, { foreignKey: 'userId', as: 'author' });
```

### 3.3 `models/Comments.js` (4 points)
Fields: `id` (PK), `text` (STRING), `userId` (BIGINT), `postId` (BIGINT).
```js
Posts.hasMany(Comments, { foreignKey: 'postId', as: 'comments' });
Comments.belongsTo(Posts, { foreignKey: 'postId' });
Comments.belongsTo(Users, { foreignKey: 'userId', as: 'author' });
```

### 3.4 `models/Likes.js` (6 points)
Join model (only an `id` PK), table `likes`. Define the **many-to-many**:
```js
Users.belongsToMany(Posts, { through: Likes, as: 'likedPosts', foreignKey: 'userId' });
Posts.belongsToMany(Users, { through: Likes, as: 'likedBy', foreignKey: 'postId' });
```

### 3.5 `models/Messages.js` (1 point)
Fields: `id` (PK), `message` (STRING), `from` (BIGINT), `to` (BIGINT), `postId` (BIGINT, nullable — which post the DM is about).

### 3.6 `models/index.js` (1 point)
Re-export every model: `Users`, `Posts`, `Comments`, `Likes`, `Messages`.

---

## Step 4: Migration — `migrate.js` (5 points)
Import all models, loop and `await model.sync({ alter: true })` in `try/catch`, call optional `createDefaults?.()`, log progress. Run with `npm run build`.

---

## Step 5: Middlewares (20 points)

### 5.1 `errorHandler.js` (4 points)
`notFound` → `next(new HttpErrors(404))`. `errors(err,req,res,next)` → status `err.status || 500`, JSON `{ message, errors: err.errors || {} }`.

### 5.2 `validation.js` (5 points)
Higher-order `validator(schema, path='body')`: validate `req[path]` with `{ abortEarly: false }`; on error build `errors` via `lodash.set(errors, detail.path, cleanMessage)` (strip quoted field name); throw `422` with `{ message: 'Validation error', errors }`; else `next()`.

### 5.3 `authorization.js` (6 points)
Strip `Bearer` from `req.headers.authorization`; no token → `401`; `jwt.verify` in `try/catch`; invalid / no `userId` → `401`; `Users.findByPk(userId)`, missing → `401`; set `req.userId`; `next()`.

### 5.4 `upload.js` (5 points)
`multer.diskStorage`: destination `./public/media/`; filename `uuid.v7() + '.' + mime.getExtension(file.mimetype)`; `limits.fileSize` 20 MB; `fileFilter` accepts only `image/*`.

### 5.5 Schemas
`users.schema.js`:
```
register: { username: alphanum required, name: string required,
            email: email required, password: string 4–32 required }
login:    { email: email required, password: string 4–32 required }
```
`posts.schema.js`:
```
create:  { caption: string max 2000 allow '' }   // image comes from multer, not the body
comment: { text: string min 1 max 1000 required }
message: { to: number required, message: string min 1 max 2000 required, postId: number optional }
```

---

## Step 6: Services (12 points)

### 6.1 `email.js` (6 points)
Async `({ to, subject, template, data, attachments })`: render `views/email/<template>.ejs` with `ejs.renderFile`; send via `nodemailer` transporter (Ethereal test account ok); add `attachments` only when not empty; log message id / preview URL; `try/catch`.

### 6.2 `Socket.js` (6 points)
`Socket` class, static methods:
- `init(server)` → `socket.io` `Server` with permissive CORS, register `connection`.
- `handleConnect(client)` → read token from handshake (`headers.authorization` / `query.token` / `auth.token`), verify; valid → `client.join('user_' + id)`; else emit `error`.
- `tokenChecker(token)` → verify JWT, return `{ valid, id }`.
- `emit(room, message, type = 'new_message')` → `io.to(room).emit(type, message)`.

---

## Step 7: Controllers (18 points)

### 7.1 `controllers/users.js` (7 points)
- **`register`** — extract `username, name, email, password`; reject duplicate email/username with `422`; `activationToken = uuidv4()`; create user with hashed password and `status: 'pending'`; send activation email with link `${BACKEND_HOST}/users/activate/${activationToken}`; respond "please activate".
- **`login`** — find by email; bad credentials → `401`; `status !== 'active'` → `401`; sign JWT; respond `{ token, user }` (no password).
- **`activateAccount`** — find by `activationToken`; set `status: 'active'`, `activationToken: null`; else `401`.
- **`profile`** — return `Users.findByPk(req.userId)` including their `posts`.

### 7.2 `controllers/posts.js` (8 points)
- **`create`** — require `req.file` (the uploaded image) → store `image: '/media/' + req.file.filename`; create post with `caption` and `userId: req.userId`; respond with the post.
- **`feed`** — return all posts ordered by `createdAt DESC`, **including** the `author` (only `id, username, avatar`), the `comments`, and a likes count (`include` the `likedBy` association or use a count). Support optional `?page=&limit=` pagination.
- **`like`** — `POST /posts/:id/like`: find the post, then `post.addLikedBy(req.userId)` (toggle off with `removeLikedBy` if already liked); respond with the new like count.
- **`comment`** — `POST /posts/:id/comment`: validate `{ text }`, create a `Comment` with `userId: req.userId` and `postId`; respond with the comment.

> All methods use `try/catch` + `next(e)`.

### 7.3 `controllers/chat.js` (3 points)
- **`sendMessage`** — validate `{ to, message, postId? }`; create a `Messages` row `{ from: req.userId, to, message, postId }`; `Socket.emit('user_' + to, messageData)`; respond `{ status: 'ok' }`.
- **`getMessages`** — return the conversation between `req.userId` and `:fromId` using `Op.or`, ordered by `createdAt DESC`.

---

## Step 8: Routes (8 points)

### 8.1 `routes/index.js` (2 points)
`GET /` renders `feed.ejs` (or a welcome JSON); mount `usersRouter` at `/users`, `postsRouter` at `/posts`, `chatRouter` at `/api/chat`.

### 8.2 `routes/users.js` (2 points)

| Method | Path                         | Middleware                                   | Controller        |
|--------|------------------------------|----------------------------------------------|-------------------|
| POST   | `/register`                  | `validation(schema.register)`                | `register`        |
| POST   | `/login`                     | `validation(schema.login)`                   | `login`           |
| GET    | `/activate/:activationToken` | —                                            | `activateAccount` |
| GET    | `/profile`                   | `authorization`                              | `profile`         |
| POST   | `/avatar`                    | `authorization`, `upload.single('image')`    | inline handler    |

### 8.3 `routes/posts.js` (2.5 points)

| Method | Path             | Middleware                                                | Controller |
|--------|------------------|----------------------------------------------------------|------------|
| GET    | `/`              | `authorization`                                          | `feed`     |
| POST   | `/`              | `authorization`, `upload.single('image')`, `validation(schema.create)` | `create`   |
| POST   | `/:id/like`      | `authorization`                                          | `like`     |
| POST   | `/:id/comment`   | `authorization`, `validation(schema.comment)`            | `comment`  |

### 8.4 `routes/chat.js` (1.5 points)
`POST /send/message` (auth, `validation(schema.message)`) → `sendMessage`; `POST /messages/:fromId` (auth) → `getMessages`.

---

## Step 9: `app.js` — Wiring (counted above)
1. `import 'dotenv/config'` first; create app; set EJS view engine + `views/`.
2. Middlewares in order: `morgan('dev')`, `express.json()`, `express.urlencoded({ extended: false })`, `express.static('public')`.
3. Mount main router, then `errorHandler.notFound` + `errorHandler.errors`.
4. `createServer(app)` → `Socket.init(server)` → `server.listen(PORT)`.

---

## API Endpoints Summary

| Method | Endpoint                          | Auth? | Description                          |
|--------|-----------------------------------|-------|--------------------------------------|
| POST   | `/users/register`                 | ❌    | Register + send activation email     |
| GET    | `/users/activate/:activationToken`| ❌    | Activate account                     |
| POST   | `/users/login`                    | ❌    | Login, returns JWT                   |
| GET    | `/users/profile`                  | ✅    | Profile + own posts                  |
| POST   | `/users/avatar`                   | ✅    | Upload avatar image                  |
| POST   | `/posts`                          | ✅    | Create image post (multipart)        |
| GET    | `/posts`                          | ✅    | Public feed (author + likes + comments) |
| POST   | `/posts/:id/like`                 | ✅    | Like / unlike a post                 |
| POST   | `/posts/:id/comment`              | ✅    | Comment on a post                    |
| POST   | `/api/chat/send/message`          | ✅    | DM a poster (saved + emitted)        |
| POST   | `/api/chat/messages/:fromId`      | ✅    | Conversation history                 |

---

## Grading Criteria

| Section                                              | Points |
|------------------------------------------------------|--------|
| Project setup, dependencies, `.env`, `app.js` wiring | 8      |
| Sequelize client                                     | 5      |
| Models (one-to-many + many-to-many likes)            | 24     |
| Migration script                                     | 5      |
| Middlewares (error, validation, auth, upload, schema)| 20     |
| Services (email + socket)                            | 12     |
| Controllers (users, posts, chat)                     | 18     |
| Routes                                               | 8      |
| **Total**                                            | **100**|

---

## Requirements Checklist

- [ ] ES modules (`import`/`export`) and `"type": "module"`
- [ ] MVC layout with separate route files
- [ ] Sequelize connects to MySQL via a shared client
- [ ] `migrate.js` builds tables with `sync({ alter: true })`
- [ ] Users **post images** via `multer` (image-only, ≤ 20 MB), served from `/media`
- [ ] Feed shows **everyone's** posts with author, comments, and like count
- [ ] One-to-many (user→posts, post→comments) **and** many-to-many likes work, queried with `include`
- [ ] Like endpoint toggles (add/remove) correctly
- [ ] Passwords hashed; JWT signed on login and verified by `authorization`
- [ ] Registration emails an activation link; login blocked until `status === 'active'`
- [ ] Joi validation returns `422` with a clean `errors` object
- [ ] Error handler returns `404` and JSON for all errors
- [ ] Socket.io authenticates the handshake and joins `user_<id>`
- [ ] DMing a poster **persists** the message **and** emits it in real time
- [ ] All async code uses `async/await` with `try/catch` + `next(e)`

---

## How to Test

1. Create the MySQL DB, fill `.env`, run `npm run build`, then `npm run dev`.
2. Suggested flow (Postman / Thunder Client):

```
1. POST /users/register  { username, name, email, password }   → "please activate"
2. GET  /users/activate/<token from email>                      → activated
3. POST /users/login     { email, password }                    → { token, user }
4. POST /posts           form-data: image=<file>, caption=...    → created post
5. GET  /posts           Authorization: Bearer <token>          → feed with authors/likes/comments
6. POST /posts/:id/like                                          → like count changes
7. POST /posts/:id/comment { text }                              → comment added
8. POST /api/chat/send/message { to, message, postId }           → saved + emitted to poster
```

3. Log in as two users in two tabs; comment/like from one and **DM the poster** — confirm the message arrives live via Socket.io.

---

## Submission

Submit the entire `mini-instagram/` folder (without `node_modules`) with every file from the project structure.

Good luck! 📷
