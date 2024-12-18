'use client';
import { useEffect, useState, useRef } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt, useMicrophoneState } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  // For speech recognition
  
  // const [transcript, setTranscript] = useState("");
  // const [listening, setListening] = useState(false);
  // const [error, setError] = useState(null);

  // const recognitionRef = useRef(null); // Persist recognition instance

  // useEffect(() => {
  //   // Check for Speech Recognition support
  //   if (!("webkitSpeechRecognition" in window)) {
  //     setError("Speech Recognition is not supported in this browser.");
  //     return;
  //   }

  //   // Initialize Speech Recognition
  //   const recognition = new window.webkitSpeechRecognition();
  //   recognition.lang = "ml-IN"; // Malayalam (India)
  //   recognition.continuous = true; // Enable continuous transcription
  //   recognition.interimResults = true; // Show interim results

  //   // Event listeners
  //   recognition.onstart = () => {
  //     setListening(true);
  //     setError(null);
  //   };

  //   recognition.onresult = (event) => {
  //     let newTranscript = "";
  //     for (let i = event.resultIndex; i < event.results.length; i++) {
  //       newTranscript += event.results[i][0].transcript;
  //     }
  //     setTranscript((prev) => prev + " " + newTranscript.trim()); // Append new results
  //   };

  //   recognition.onerror = (event) => {
  //     setError("Error occurred: " + event.error);
  //     setListening(false);
  //   };

  //   recognition.onend = () => {
  //     setListening(false);
  //   };

  //   recognitionRef.current = recognition;

  //   return () => {
  //     recognition.abort();
  //   };
  // }, []);

  // const startListening = () => {
  //   if (recognitionRef.current) {
  //     recognitionRef.current.start();
  //   }
  // };

  // const stopListening = () => {
  //   if (recognitionRef.current) {
  //     recognitionRef.current.stop();
  //   }
  // };
 

  // Call-related logic
  const call = useCall();
  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  const { microphone, isMute } = useMicrophoneState();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const fetchDeviceState = () => {
      const camState = call.camera.state === 'enabled';
      setCameraEnabled(camState);
    };

    fetchDeviceState();
  }, [call]);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      // const destination = audioContext.destination;

      source.connect(gainNode);
      // gainNode.connect(destination);

      mediaRecorderRef.current.start(1000); // Capture audio in chunks of 1 second
    } catch (error) {
      console.error('Error capturing audio:', error);
    }
  };

  // State to track microphone status
  const [micStatus, setMicStatus] = useState(isMute);

  // Toggle mic and camera
  const toggleMic = async () => {
    try {
      if (micStatus) {
        await microphone.disable();
        setMicStatus(false);
      } else {
        await microphone.enable();
        setMicStatus(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const toggleCamera = async () => {
    try {
      if (cameraEnabled) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      setCameraEnabled(!cameraEnabled);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const handleJoinMeeting = async () => {
    try {
      if (!cameraEnabled) {
        await call.camera.disable();
      }
      if (isMute) {
        await call.microphone.disable();
      }
      await call.join();
      setIsSetupComplete(true);
      startAudioCapture(); // Start capturing audio when joining the meeting
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  };

  // Ensure microphone is disabled when the component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (call && call.microphone) {
        call.microphone.disable();
      }
    };
  }, [call]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-4">
          <Button
            className={`rounded-md px-4 py-2 ${!micStatus ? 'bg-green-500' : 'bg-red-500'}`}
            onClick={toggleMic}
          >
            {!micStatus ? 'Turn Off Mic' : 'Turn On Mic'}
          </Button>
          <Button
            className={`rounded-md px-4 py-2 ${cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}
            onClick={toggleCamera}
          >
            {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
        </div>
        <DeviceSettings />
      </div>
      <Button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2.5"
        onClick={handleJoinMeeting}
      >
        Join meeting
      </Button>
{/*
      <div>
        <h2>Malayalam Speech Recognition</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Button onClick={startListening} disabled={listening} className="mt-4 rounded-md bg-blue-500 px-4 py-2.5">
          Start Listening
        </Button>
        <Button onClick={stopListening} disabled={!listening} className="mt-4 rounded-md bg-blue-500 px-4 py-2.5">
          Stop Listening
        </Button>
        <p>
          <strong>Transcript:</strong> {transcript}
        </p>
      </div>
      */}
    </div>
  );
};

export default MeetingSetup;
