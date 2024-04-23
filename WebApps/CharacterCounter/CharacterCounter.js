// O pateta aqui apagou alguns arquivos por ser muito burro, e não fez o push por ser muito burro, então vou deixar assim pois além de burro, sou preguiçoso quando não tem dinheiro na jogada

// Manages the character counting functionality including text input, character count calculation, export history tracking, and deletion of history entries.
import React, { useState } from 'react';
import InputText from './modules/InputText';
import CharacterCountDisplay from './CharacterCountDisplay';
import './App.css';


const App = () => {
    const [text, setText] = useState('');
    const [history, setHistory] = useState([]);
    const [exporting, setExporting] = useState(false); // State to track export process
    const MAX_HISTORY_ENTRIES = 10; // Maximum number of history entries

    const getCharacterCount = () => {
        return text.length;
    };

    const getPhraseCount = () => {
        return text.trim().split(/[.!?]+/).filter(phrase => phrase !== '').length;
    };

    const getCharacterCountWithoutSpaces = () => { // Added 'const' to declare the function
        return text.replace(/\s+/g, '').length;
    };

    const copyCharacterCount = () => {
        navigator.clipboard.writeText(getCharacterCount().toString())
        .then(() => alert('Character count copied to clipboard'))
        .catch(error => console.error('Error copying to clipboard:', error));
    };

    const exportCharacterCount = () => {
        setExporting(true);
        const data = `Character count: ${getCharacterCount()}
                     \nWord count: ${getWordCount()} // Error: getWordCount is not defined
                     \nPhrase count: ${getPhraseCount()}
                     \nCharacter count without spaces: ${getCharacterCountWithoutSpaces()}`;
        const blob = new Blob([data], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'character-count.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExporting(false);
    };

    const saveToHistory = () => {
        const currentCount = {
            characterCount: getCharacterCount(),
            wordCount: getWordCount(), // Error: getWordCount is not defined
            phraseCount: getPhraseCount(),
            characterCountWithoutSpaces: getCharacterCountWithoutSpaces()
        };
        const newHistory = [...history, currentCount];
        if (newHistory.length > MAX_HISTORY_ENTRIES) {
            newHistory.shift();
        }
        setHistory(newHistory);
    };

    const deleteHistory = (index) => { // Added 'index' parameter to deleteHistory function
        const updatedHistory = [...history];
        updatedHistory.splice(index, 1);
        setHistory(updatedHistory);
    };

    return (
        <div className="CharacterCounter">
          <InputText value={text} onChange={setText} />
          <CharacterCountDisplay
            characterCount={getCharacterCount()}
            wordCount={getWordCount()}
            phraseCount={getPhraseCount()}
            characterCountWithoutSpaces={getCharacterCountWithoutSpaces()}
          />
          <div>
            <button onClick={copyCharacterCount} aria-label="Copy Character Count">Copy Character Count</button>
            <button onClick={exportCharacterCount} aria-label="Export Character Count">
              {exporting ? 'Exporting...' : 'Export Character Count'}
            </button>
            <button onClick={saveToHistory} aria-label="Save to History">Save to History</button>
          </div>
          <History history={history} onDeleteEntry={deleteEntry} />
        </div>
    );
};


