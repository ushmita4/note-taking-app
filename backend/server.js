const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'notes.json');

// Read notes from file on server start
let notes = [];
if (fs.existsSync(filePath)) {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  try {
    notes = JSON.parse(fileData);
  } catch {
    notes = [];
  }
}

// Save notes to file
const saveNotes = () => {
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/notes
  if (method === 'GET' && pathname === '/api/notes') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(notes));
  }

  // POST /api/notes
  else if (method === 'POST' && pathname === '/api/notes') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        const newNote = { id: Date.now(), title };
        notes.push(newNote);
        saveNotes(); // 💾 Save to file
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newNote));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  // PUT /api/notes/:id → edit a note
  else if (method === 'PUT' && pathname.startsWith('/api/notes/')) {
    const id = parseInt(pathname.split('/').pop());
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Note not found' }));
          return;
        }
        notes[noteIndex].title = title;
        saveNotes();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(notes[noteIndex]));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  // DELETE /api/notes/:id
  else if (method === 'DELETE' && pathname.startsWith('/api/notes/')) {
    const id = parseInt(pathname.split('/').pop());
    notes = notes.filter(note => note.id !== id);
    saveNotes(); // 💾 Save updated notes
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Note deleted' }));
  }

  // 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
