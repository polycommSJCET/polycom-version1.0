// utils/translateAPI.js

export const translateText = async (text,username, language,meetingid) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          speaker:username,
          language: language,
          meeting_id:meetingid,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // { original_text, detected_language, translated_text }
    } catch (error) {
      console.error('Translation failed:', error);
      return { error: error.message };
    }
  };
  