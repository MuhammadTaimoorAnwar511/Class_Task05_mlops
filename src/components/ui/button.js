import React from 'react';

const Button = ({ onClick, children, className, disabled }) => (
  <button onClick={onClick} className={`button ${className}`} disabled={disabled}>
    {children}
  </button>
);

export default Button; 
