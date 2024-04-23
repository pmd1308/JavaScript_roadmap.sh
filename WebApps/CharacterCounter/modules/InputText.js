import React from 'react';

const InputText = ({ value, onChange }) => {
    const handleTextChange = (e) => {
        onChange(e.target.value);
    };

    return (
    <div className="InputText">
        <label htmlFor="textInput">Enter Text:</label>
        <input 
            type="text" 
            id="textInput"
            value={value} 
            onChange={handleTextChange} 
            style={{ 
            fontSize: '16px', 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
            }} 
        />
        </div>
    );
}


export default InputText;