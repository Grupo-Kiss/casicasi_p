import React from 'react';
import Numpad from './Numpad';

interface PlayerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ value, onChange, onSubmit }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  const formatNumber = (num: string) => {
    // Elimina caracteres no numéricos y agrega separador de miles
    return num.replace(/\D/g, '') // Elimina caracteres no numéricos
              .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Agrega separador de miles
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formattedValue = formatNumber(newValue);
    // Limita a 10 caracteres
    if (formattedValue.length <= 12) {
      onChange(formattedValue);
    }
  };

  const handleDigit = (digit: string) => {
    if (value.replace(/,/g, '').length < 9) {
      const newValue = value.replace(/,/g, '') + digit; // Quita el separador antes de agregar
      const formattedValue = formatNumber(newValue);
      onChange(formattedValue);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div>
      <div className="input-group mb-3" style={{ justifyContent: 'center', marginBottom: '20px' }}>
        <input
          type="text" // Cambiado a texto para permitir el separador
          className="form-control fs-4 text-center"
          placeholder=""
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '300px',
            maxWidth: '200px', // Ancho máximo
            border: '3px solid #ffd500ff', // Borde color
            fontSize: '24px', // Tamaño de fuente grande
            fontFamily: 'Roboto, sans-serif', // Fuente Roboto
            fontWeight: 'bold', // Texto en negrita
            color: '#ffd500ff', // Color del texto
            backgroundColor: '#191717ef', // Fondo negro
            height: '50px', // Altura del input ajustada
            textAlign: 'center', // Centra el texto
          }} 
        />
      </div>
      <Numpad onDigit={handleDigit} onDelete={handleDelete} onSubmit={onSubmit} />
    </div>
  );
};

export default PlayerInput;