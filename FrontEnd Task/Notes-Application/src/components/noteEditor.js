import React, { useState } from 'react';
import RichTextEditor from './richTextEditor';
import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import '../styles/Noteeditor.css';

const NoteEditor = ({ note, onSave }) => {
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');
  const [password, setPassword] = useState('');
  const [highlightedContent, setHighlightedContent] = useState(content);
  const [loading, setLoading] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim()) {
      alert("Content is empty. Please write something to analyze.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://twinkle2004.pythonanywhere.com/process_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const { key_terms } = await response.json();

      let updatedContent = content;

      key_terms.forEach(({ term, definition }) => {
        // Escape special characters in the term
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
        const termRegex = new RegExp(`\\b${escapedTerm}\\b(?!;|,|\\.)`, 'g'); // Creates a safe RegExp that prevents matching terms with punctuation
        updatedContent = updatedContent.replace(
          termRegex,
          `<mark class="highlighted-term" data-tooltip="${definition}">${term}</mark>`
        );
      });

      // Clean up the content to remove unwanted HTML tags and formatting
      updatedContent = DOMPurify.sanitize(updatedContent);

      setHighlightedContent(updatedContent);
    } catch (error) {
      console.error('Error fetching key terms:', error);
      alert('An error occurred while analyzing the content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (title.trim() === '' || content.trim() === '') {
      alert('Title and content cannot be empty!');
      return;
    }

    const encryptedContent = password
      ? CryptoJS.AES.encrypt(content, password).toString()
      : content;

    onSave({ ...note, title, content: encryptedContent, highlightedContent, isEncrypted: !!password });
    setTitle('');
    setContent('');
    setPassword('');
    setHighlightedContent('');
  };

  return (
    <div className="note-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
      />
      <h4 style={{ fontWeight: 'lighter', color: '#888' }}>Please write notes by putting space between punctuations and words.
      </h4>
      <RichTextEditor content={content} onChange={setContent} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Set Password (Optional)"
      />
      <button onClick={analyzeContent} disabled={loading}>
        {loading ? 'Highlighting...' : 'Highlight Content'}
      </button>
      <div className="preview">
        <h3>Preview:</h3>
        <div
          className="highlighted-content"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        ></div>
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default NoteEditor;
