import { supabase } from '@/utils/supabase';

const BUCKET_NAME = 'Polycomm';

export async function downloadMeetingDocument(meetingId: string, format: 'pdf' | 'doc') {
  try {
    console.log("inside download")
    // Construct the file path based on format
    const extension = format === 'doc' ? 'docx' : 'pdf';
    const filePath = `meetings/${meetingId}/documents/${meetingId}_minutes.${extension}`;
    
    // Check if the file exists first
    const { data: fileCheck, error: checkError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(`meetings/${meetingId}/documents`);
      
    if (checkError) {
      console.error('Error checking file existence:', checkError);
      throw new Error(`Error checking if file exists: ${checkError.message}`);
    }
    
    const expectedFileName = `${meetingId}_minutes.${extension}`;
    const fileExists = fileCheck.some(file => file.name === expectedFileName);
    if (!fileExists) {
      throw new Error(`${format.toUpperCase()} file not found for this meeting`);
    }
    
    // Get a signed URL for the file download (valid for 1 hour)
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour
      
    if (error) {
      console.error(`Error generating download URL:`, error);
      throw new Error(`Error generating download URL: ${error.message}`);
    }
    
    if (!data || !data.signedUrl) {
      throw new Error('Failed to generate download URL');
    }
    
    // Return the signed URL
    return data.signedUrl;
    
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}