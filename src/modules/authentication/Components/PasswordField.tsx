import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isValid: boolean;
  errorMessage: string;
}

export default function PasswordField({ value, onChange, isValid, errorMessage }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative w-full">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Contraseña segura"
          value={value}
          onChange={onChange}
          required
          className={`w-full rounded-xl border bg-[#f3f0f7] p-3.5 pr-12 text-sm font-medium text-[#17213f] outline-none transition-all placeholder:text-[#8a94ae] focus:ring-4 ${
            value.length > 0 && !isValid
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-[#d7d3e3] focus:border-[#263BAA] focus:ring-[#263BAA]/10'
          }`}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#8a94ae] hover:text-[#263BAA] focus:outline-none"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </motion.button>
      </div>
      {value.length > 0 && !isValid && (
        <span className="px-1 text-[11px] font-medium leading-relaxed text-rose-700">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
