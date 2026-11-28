import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from './eye-icons';

/** Password input with a show/hide toggle, styled like the other valley auth fields. */
export function PasswordField(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Parolni yashirish' : 'Parolni ko‘rsatish';
  // Not a wrapping <label>: a button inside it would be part of the input's accessible name.
  return (
    <div className="valley-field valley-password">
      <input {...props} type={visible ? 'text' : 'password'} aria-label="Parol" autoCapitalize="none" spellCheck={false} />
      <button type="button" aria-label={label} title={label} aria-pressed={visible} onClick={() => setVisible(v => !v)}>
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}
