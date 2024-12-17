export const saveNotes = (notes) => {
    localStorage.setItem('notes', JSON.stringify(notes));
  };
  
  export const getNotes = () => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  };
  