import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Fetch notes on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/notes')
      .then(res => setNotes(res.data));
  }, []);

  // Add a note
  const addNote = () => {
    if (!note.trim()) return;

    axios.post('http://localhost:5000/api/notes', { title: note })
      .then(res => {
        setNotes([...notes, res.data]);
        setNote('');
      });
  };

  // Delete a note
  const deleteNote = (id) => {
    axios.delete(`http://localhost:5000/api/notes/${id}`)
      .then(() => {
        setNotes(notes.filter(n => n.id !== id));
      });
  };

  // Start editing
  const startEditing = (id, title) => {
    setEditingId(id);
    setEditingText(title);
  };

  // Save edited note
  const saveEdit = (id) => {
    if (!editingText.trim()) return;

    axios.put(`http://localhost:5000/api/notes/${id}`, { title: editingText })
      .then(res => {
        setNotes(notes.map(n => (n.id === id ? res.data : n)));
        setEditingId(null);
        setEditingText('');
      });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>📝 Note Keeper</h2>

      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Enter a note"
        style={{ padding: '0.5rem', width: '300px' }}
      />

      <button onClick={addNote} style={{
        marginLeft: '1rem',
        padding: '0.5rem',
        backgroundColor: 'green',
        color: 'white',
        border: 'none',
        borderRadius: '4px'
      }}>
        Add Note
      </button>

      <ul style={{ marginTop: '2rem' }}>
        {notes.map(n => (
          <li key={n.id} style={{ marginBottom: '10px' }}>
            {editingId === n.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  style={{ padding: '0.3rem' }}
                />
                <button
                  onClick={() => saveEdit(n.id)}
                  style={{
                    marginLeft: '0.5rem',
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                {n.title}
                <button
                  onClick={() => startEditing(n.id, n.title)}
                  style={{
                    marginLeft: '1rem',
                    backgroundColor: 'orange',
                    color: 'white',
                    border: 'none',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              </>
            )}

            <button
              onClick={() => deleteNote(n.id)}
              style={{
                marginLeft: '0.5rem',
                backgroundColor: 'crimson',
                color: 'white',
                border: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
