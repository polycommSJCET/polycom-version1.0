/* eslint-disable no-unused-vars */
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';

import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { useUser } from "@clerk/nextjs";
import { endCallNotification, endcalltrigger, logMicUsage, translateText, logCameraUsage } from './translateText';
import { logPresenceToServer } from "./detailed_analytics/Analytics_Data"

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';



const MeetingRoom = () => {
  
  const { isSignedIn, user } = useUser();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [transError, setTransError] = useState('');
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callForAudio = useCall();
  const { useMicrophoneState } = useCallStateHooks();
  const { isSpeakingWhileMuted } = useMicrophoneState();
  console.log(callForAudio)
  const translatedTextRef = useRef<HTMLParagraphElement>(null);
  const transcriptElementRef = useRef<HTMLParagraphElement>(null);
  const { useCallEndedBy } = useCallStateHooks();
  const callEndedBy = useCallEndedBy();
  const callStartTimeRef = useRef<string | null>(null);

  // if (user) {
  //   console.log("hey user")
  //   console.log(user.fullName)
  // }


  

  const sendtranscribe = async (transcription: any) => {
    console.log("sending", transcription);
    await callForAudio?.sendCustomEvent({
      type: "tra",
      payload: {
        text: transcription
      },
    });
  };

  

  const handleCallEnd = () => {
    if (callEndedBy) {
      const callEndTime = new Date().toISOString();
      const callStartTime = callStartTimeRef.current;
      const callDetails = {
        ...callEndedBy,
        callStartTime,
        callEndTime,
      };
      endcalltrigger(callDetails, callForAudio?.id);
    }
  };

  const handleTranslate = async (transcripts: string) => {
    console.log('sending..');
    const response = await translateText(transcripts,user?.fullName,transcriptionLanguage,callForAudio?.id);
    if (response.error) {
      setTransError(response.error);
      if (translatedTextRef.current) {
        translatedTextRef.current.innerText = '';
      }
    } else {
      console.log(response.translated_text);
      sendtranscribe(response.translated_text);
      if (translatedTextRef.current) {
        translatedTextRef.current.innerText = response.translated_text;
      }
      setTransError('');
    }
  };

  useEffect(() => {
    handleCallEnd();
  }, [callEndedBy]);

  useEffect(() => {
    if (callForAudio) {
      callStartTimeRef.current = new Date().toISOString();
    }
  }, [callForAudio]);

  useEffect(() => {
    if (!callForAudio) return;
    

    const unsubscribe = callForAudio.on("custom", (event: any) => {
      const payload = event.custom;
      console.log("Received payload:", payload.payload.text);

    

      if (payload && payload.payload.text) {
        console.log("Received transcription event:", payload.payload.text);
        if (transcriptElementRef.current) {
          transcriptElementRef.current.innerText = payload.payload.text;
        }
        // handleTranslate(payload.payload.text);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [callForAudio]);


  

  const [micStatus, setMicStatus] = useState('disabled');
  const [cameraStatus, setCameraStatus] = useState('disabled');
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('ml-IN');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  useEffect(() => {
    if (!callForAudio || !callForAudio.microphone?.state?.status$) {
      console.log('Waiting for microphone...');
      return;
    }

    console.log(callEndedBy)

    if (callEndedBy) {
      endCallNotification('123','123')
    }




    const subscription = callForAudio.microphone.state.status$.subscribe((status) => {
      console.log('Mic status:', status);
    
      if (status === 'enabled') {
        // Store eventTime in sessionStorage
        sessionStorage.setItem(`eventTime+${callForAudio.cid}`, new Date().toISOString());
      } else if (status === 'disabled') {
        // Retrieve eventTime from sessionStorage
        const previousEventTime = sessionStorage.getItem(`eventTime+${callForAudio.cid}`);
        if (previousEventTime) {
          const previousTime = new Date(previousEventTime);
          const currentTime = new Date();
          const timeTaken = (currentTime - previousTime) / 1000;
          
          logMicUsage(previousTime,currentTime,user?.fullName,callForAudio?.id)// Time in seconds



    
          console.log(`Time taken: ${timeTaken} seconds`); 
          
          // Retrieve totalMicEnable from localStorage
          const totalMicEnable = localStorage.getItem(`totalMicEnable+${callForAudio.cid}`) || 0;
          const updatedTotal = parseFloat(totalMicEnable) + timeTaken;
    
          console.log(`${totalMicEnable} + ${timeTaken} = ${updatedTotal}`);
          console.log(callForAudio.cid)
          // Update totalMicEnable in localStorage
          localStorage.setItem(`totalMicEnable+${callForAudio.cid}`, updatedTotal.toString());
    
          console.log(`Total mic enable time: ${updatedTotal} seconds`);
        }
      }
    
      // Update the mic status in the state (optional)
      setMicStatus(status || 'disabled');
    });


    const cameraSubscription = callForAudio.camera.state.status$.subscribe((status) => {
      console.log('Camera status:', status);
    
      if (status === 'enabled') {
        sessionStorage.setItem(`cameraEventTime+${callForAudio.cid}`, new Date().toISOString());
      } else if (status === 'disabled') {
        const previousEventTime = sessionStorage.getItem(`cameraEventTime+${callForAudio.cid}`);
       // console.log(previousEventTime)
        if (previousEventTime) {
          const previousTime = new Date(previousEventTime);
          const currentTime = new Date();
          const timeTaken = (currentTime - previousTime) / 1000;

          logCameraUsage(previousTime,currentTime,user?.fullName,callForAudio?.id)
    
          const totalCameraEnable = localStorage.getItem(`totalCameraEnable+${callForAudio.cid}`) || 0;
          const updatedTotal = parseFloat(totalCameraEnable) + timeTaken;
    
          localStorage.setItem(`totalCameraEnable+${callForAudio.cid}`, updatedTotal.toString());

          console.log(`Total cam enable time: ${updatedTotal} seconds`);
        }
      }
    
      setCameraStatus(status || 'disabled');
    });

    
    
    

    return () => {
      subscription.unsubscribe();
      cameraSubscription.unsubscribe();
    };
  }, [callForAudio]);

  useEffect(() => {
    if (micStatus === 'enabled') {
      startListening();
    } else {
      stopListening();
    }
  }, [micStatus]);

  const callingState = useCallCallingState();
  console.log("calling state",callingState)

  // eslint-disable-next-line no-empty
  if (callingState==='left') {
    
  }

  // Log presence data 
const joinStateRef = useRef(false);
const [previousCallingState, setPreviousCallingState] = useState<string | null>(null);

useEffect(() => {
  if (!callForAudio || !user || callingState === previousCallingState) return;

  const logPresenceStatus = (status: 'joined' | 'left') => {
    const timestamp = new Date().toISOString();
    logPresenceToServer({
      userName: user.fullName || 'Unknown User',
      callId: callForAudio.id,
      eventType: status,
      eventTime: timestamp
    });
  };

  if (callingState === CallingState.JOINED && !joinStateRef.current) {
    logPresenceStatus('joined');
    joinStateRef.current = true;
  }

  if (callingState === CallingState.LEFT && joinStateRef.current) {
    logPresenceStatus('left');
    joinStateRef.current = false;
  }

  setPreviousCallingState(callingState);
}, [callingState, callForAudio, user, previousCallingState]);

  // Speech Recognition Logic
  const recognitionRef = useRef<null | any>(null);
  const transcriptRef = useRef("");
  const timeoutRef = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setError("Language not available now");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = transcriptionLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let newTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        newTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = newTranscript.trim();

      console.log("step 1 current" + transcriptRef.current);
      handleTranslate(transcriptRef.current);

      if (transcriptElementRef.current) {
        transcriptElementRef.current.innerText = transcriptRef.current;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        transcriptRef.current = "";
        if (transcriptElementRef.current) {
          transcriptElementRef.current.innerText = "";
        }
      }, 2500);
    };

    recognition.onerror = () => {
      setError("Language not available now");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    if (isTranscriptionEnabled && micStatus === 'enabled') {
      recognition.start();
    }

    return () => {
      recognition.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [transcriptionLanguage, isTranscriptionEnabled, micStatus]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (callingState !== CallingState.JOINED) {
    return <Loader />;
  }

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => { router.push('/'); window.location.reload(); }} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-gray-800 bg-gray-800 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-800" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              Select Language
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-gray-800 bg-gray-800 text-white">
            {[
              { label: 'English', value: 'en-US' },
              { label: 'Hindi', value: 'hi-IN' },
              { label: 'Malayalam', value: 'ml-IN' },
            ].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem onClick={() => setTranscriptionLanguage(item.value)}>
                  {item.label}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-800" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => setIsTranscriptVisible((prev) => !prev)}>
          {isTranscriptVisible ? 'Hide Transcription' : 'Show Transcription'}
        </Button>

        {isTranscriptVisible && (
          <div style={{ position: "fixed", bottom: "100px", left: "0", right: "0", textAlign: "center" }}>
            <div>
              <p className='text-blue-700' ref={transcriptElementRef}></p>
              <p className='text-blue-700' ref={translatedTextRef}></p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MeetingRoom;