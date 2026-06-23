import { useState, useCallback } from 'react';

export const useDictation = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const startDictation = useCallback((onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta el dictado por voz.');
      alert('Tu navegador no soporta el dictado por voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setError(`Error de micrófono: ${e.error}`);
      setIsListening(false);
      console.error('Speech recognition error', e.error);
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, []);

  return { isListening, error, startDictation };
};
