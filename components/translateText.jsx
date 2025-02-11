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
  console.log("post");
    try {
      const response = await fetch(pyApiUrl+'translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          speaker:username,
          language,
          meeting_id:meetingid,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // { original_text, detected_language, translated_text }
    } catch (error) {
      console.error('Translation failed:', error.message);
      return { error: error.message };
    }
  };

  export const endCallNotification = async (callEndedBy, meetingId) => {
    try {
      console.log("Sending call end notification...");
  
      const response = await fetch(pyApiUrl + 'call-ended', {  // Ensure endpoint is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callEndedBy,
          meeting_id: meetingId,  // Match key names with API expectations
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Call end notification sent successfully:", data);
      return data;
    } catch (error) {
      console.error('Failed to notify call end:', error.message);
      return { error: error.message };
    }
  };


  export const logMicUsage = async (micStartTime, micEndTime,username,meeting_id) => {
    try {
      console.log("Logging mic usage...");
  
      const response = await fetch(pyApiUrl + "mic-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          mic_start_time: micStartTime,
          mic_end_time: micEndTime,
          meeting_id
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Mic usage logged successfully:", data);
      return data;
    } catch (error) {
      console.error("Failed to log mic usage:", error.message);
      return { error: error.message };
    }
  };
  
  