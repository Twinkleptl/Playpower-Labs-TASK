import React, { useState, useEffect } from 'react';
import Header from './components/header';
import NoteList from './components/noteList';
import NoteEditor from './components/noteEditor';
import { saveNotes, getNotes } from './services/storageService';
import './styles/App.css';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const savedNotes = getNotes();
    if (savedNotes.length > 0) {
      setNotes(savedNotes);
    }
  }, []);

  const handleSaveNote = (note) => {
    const updatedNotes = note.id
      ? notes.map((n) => (n.id === note.id ? note : n))
      : [...notes, { ...note, id: Date.now(), pinned: false }];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handlePinNote = (id) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  return (
    <div>
      <Header />
      <div className="container">
        <NoteList
          notes={notes.sort((a, b) => b.pinned - a.pinned)}
          onSelect={(id) => setSelectedNote(notes.find((note) => note.id === id))}
          onDelete={handleDeleteNote}
          onPin={handlePinNote}
        />
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
        />
      </div>
    </div>
  );
};

export default App;
