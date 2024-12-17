import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import '../styles/Notelist.css';

const NoteList = ({ notes, onSelect, onDelete, onPin }) => {
  const [viewedNote, setViewedNote] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState('');

  const handleView = (note) => {
    if (note.isEncrypted) {
      const password = prompt('Enter the password to view this note:');
      const decrypted = decryptNote(note.content, password);

      if (decrypted) {
        setDecryptedContent(decrypted);
        setViewedNote(note);
      } else {
        alert('Incorrect password!');
      }
    } else {
      setViewedNote(note);
      setDecryptedContent(note.highlightedContent || note.content); // Use highlighted content if available
    }
  };

  const closeView = () => {
    setViewedNote(null);
    setDecryptedContent('');
  };

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <div key={note.id} className={`note ${note.pinned ? 'pinned' : ''}`}>
          <h3 onClick={() => onSelect(note.id)}>{note.title}</h3>
          <div className="note-buttons">
            <button onClick={() => handleView(note)}>View</button>
            <button onClick={() => onPin(note.id)}>Pin</button>
            <button onClick={() => onDelete(note.id)}>Delete</button>
          </div>
        </div>
      ))}

      {viewedNote && (
        <div className="note-view-modal">
          <div className="modal-content">
            <h2>{viewedNote.title}</h2>
            <div
              className="highlighted-content"
              dangerouslySetInnerHTML={{ __html: decryptedContent || viewedNote.content }}
            ></div>
            <button onClick={closeView}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const decryptNote = (encryptedContent, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
    return bytes.toString(CryptoJS.enc.Utf8); // Decrypted content as string
  } catch {
    return null; // Invalid decryption
  }
};

export default NoteList;
