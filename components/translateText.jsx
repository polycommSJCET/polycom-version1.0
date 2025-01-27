// utils/translateAPI.js
const pyApiUrl="https://127.0.0.1:443/"
// eslint-disable-next-line camelcase
export const endcalltrigger=async(callendedby,meeting_id)=>{
  try{
    const response=await fetch(pyApiUrl+'endcall',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        callended:callendedby,
        // eslint-disable-next-line camelcase
        m_id:meeting_id
      })
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  }catch (error) {
    console.error('Translation failed:', error);
    return { error: error.message };
  }
}

export const translateText = async (text,username, language,meetingid) => {
    try {
      const response = await fetch(pyApiUrl+'translate', {
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
  