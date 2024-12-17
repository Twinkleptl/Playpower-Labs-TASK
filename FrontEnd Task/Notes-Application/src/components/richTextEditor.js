import React, { useRef, useEffect } from 'react';
import '../styles/Richtexteditor.css';

const RichTextEditor = ({ content, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleCommand = (command) => {
    document.execCommand(command, false, null);
    syncContent();
  };

  const syncContent = () => {
    if (editorRef.current) {
      const updatedContent = editorRef.current.innerHTML;
      onChange(updatedContent);
    }
  };

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={() => handleCommand('bold')}>Bold</button>
        <button onClick={() => handleCommand('italic')}>Italic</button>
        <button onClick={() => handleCommand('underline')}>Underline</button>
        <button onClick={() => handleCommand('justifyLeft')}>Left</button>
        <button onClick={() => handleCommand('justifyCenter')}>Center</button>
        <button onClick={() => handleCommand('justifyRight')}>Right</button>
      </div>
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        onInput={syncContent}
      ></div>
    </div>
  );
};

export default RichTextEditor;
