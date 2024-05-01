// File: CharacterCounter.js

import React, { useState } from 'react';

const App = () => {
 // State to store the entered text and history of character counts
 const [text, setText] = useState('');
 const [history, setHistory] = useState([]);

 // Function to update the state when text changes
 const handleTextChange = (event) => {
  setText(event.target.value);
 };

 // Function to calculate the character count
 const getCharacterCount = () => {
  return text.length;
 };

 // Function to calculate the word count
 const getWordCount = () => {
  return text.trim().split(/\s+/).filter(word => word !== '').length;
 };

 // Function to calculate the phrase count
 const getPhraseCount = () => {
  return text.trim().split(/[.!?]+/).filter(phrase => phrase !== '').length;
 };

 // Function to calculate the character count without spaces
 const getCharacterCountWithoutSpaces = () => {
  return text.replace(/\s+/g, '').length;
 };

 // Function to handle copying the character count to the clipboard
 const copyCharacterCount = () => {
  navigator.clipboard.writeText(getCharacterCount().toString())
   .then(() => alert('Character count copied to clipboard'))
   .catch(error => console.error('Error copying to clipboard:', error));
 };

 // Function to handle exporting the character count
 const exportCharacterCount = () => {
  const data = `Character count: ${getCharacterCount()}\nWord count: ${getWordCount()}\nPhrase count: ${getPhraseCount()}\nCharacter count without spaces: ${getCharacterCountWithoutSpaces()}`;
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'character_count.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
 };

 // Function to handle saving the current character count to history
 const saveToHistory = () => {
  const currentCount = {
   characterCount: getCharacterCount(),
   wordCount: getWordCount(),
   phraseCount: getPhraseCount(),
   characterCountWithoutSpaces: getCharacterCountWithoutSpaces()
  };
  setHistory([...history, currentCount]);
 };

 return (
  <div className="App">
   <h1>Character Counter</h1>

   <label htmlFor="textInput">Enter Text:</label>
   <input 
    type="text" 
    id="textInput"
    value={text} 
    onChange={handleTextChange} 
    style={{ 
     fontSize: '16px', 
     padding: '8px', 
     borderRadius: '4px', 
     border: '1px solid #ccc' 
    }} 
   />

   <p style={{ fontSize: '18px', marginTop: '10px' }}>
    Character count: {getCharacterCount()}<br />
    Word count: {getWordCount()}<br />
    Phrase count: {getPhraseCount()}<br />
    Character count without spaces: {getCharacterCountWithoutSpaces()}
   </p>

   <button onClick={copyCharacterCount}>Copy Character Count</button>
   <button onClick={exportCharacterCount}>Export Character Count</button>
   <button onClick={saveToHistory}>Save to History</button>

   <h2>History</h2>
   <ul>
    {history.map((entry, index) => (
     <li key={index}>
      Character count: {entry.characterCount}, Word count: {entry.wordCount}, 
      Phrase count: {entry.phraseCount}, Character count without spaces: {entry.characterCountWithoutSpaces}
     </li>
    ))}
   </ul>
  </div>
 );
};

export default App;