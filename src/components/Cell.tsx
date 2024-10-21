import React, { useRef, useEffect } from 'react';
import '../styles/Cell.css';

interface CellProps {
  value: string;
  onChange: (value: string) => void;
  onBackspace: () => void;
  onClick: () => void;
  isBlack: boolean;
  number?: number;
  isSelected: boolean;
  isHighlighted: boolean;
}

const Cell: React.FC<CellProps> = ({
  value,
  onChange,
  onBackspace,
  onClick,
  isBlack,
  number,
  isSelected,
  isHighlighted
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  if (isBlack) {
    return <div className="cell black"></div>;
  }

  const cellClassName = `cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value === '') {
        onBackspace();
      } else {
        onChange('');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(-1).toUpperCase();
    onChange(newValue);
  };

  return (
    <div className={cellClassName} onClick={onClick}>
      {number && <span className="cell-number">{number}</span>}
      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="cell-input"
      />
    </div>
  );
};

export default Cell;