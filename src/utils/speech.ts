/**
 * Web Speech API helper for Korean (ko-KR) pronunciation & Vietnamese narration
 */

export function stopAllSpeech(): void {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function playKoreanAudio(text: string, rate: number = 0.85): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const cleanText = text.trim();
      if (!cleanText) {
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      utterance.rate = rate; // slightly slower for clear learning pronunciation
      utterance.pitch = 1.0;

      // Find Korean voice if available
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((v) => v.lang.includes('ko') || v.lang.includes('KR'));
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis', err);
      resolve(false);
    }
  });
}

export function playVietnameseSpeech(text: string, rate: number = 0.95): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = text.trim();
      if (!cleanText) {
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}
