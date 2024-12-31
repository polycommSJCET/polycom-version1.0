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
import { endcalltrigger, translateText } from './translateText';

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
  console.log(callForAudio)
  const translatedTextRef = useRef<HTMLParagraphElement>(null);
  const transcriptElementRef = useRef<HTMLParagraphElement>(null);
  const { useCallEndedBy } = useCallStateHooks();
  const callEndedBy = useCallEndedBy();

  if (user) {
    console.log("hey user")
    console.log(user.fullName)
  }
  

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

      endcalltrigger(callEndedBy,callForAudio?.id)
      // Add your desired functionality here
    }
  };

  const handleTranslate = async (transcripts: string) => {
    const response = await translateText(transcripts,user?.fullName,transcriptionLanguage,callForAudio?.id);
    if (response.error) {
      setTransError(response.error);
      if (translatedTextRef.current) {
        translatedTextRef.current.innerText = '';
      }
    } else {
      console.log(response.translated_text);
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
    if (!callForAudio) return;

    const unsubscribe = callForAudio.on("custom", (event: any) => {
      const payload = event.custom;
      console.log("Received payload:", payload.payload.text);

    

      if (payload && payload.payload.text) {
        console.log("Received transcription event:", payload.payload.text);
        if (transcriptElementRef.current) {
          transcriptElementRef.current.innerText = payload.payload.text;
        }
        handleTranslate(payload.payload.text);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [callForAudio]);


  

  const [micStatus, setMicStatus] = useState('disabled');
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(true);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState('ml-IN');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

  useEffect(() => {
    if (!callForAudio || !callForAudio.microphone?.state?.status$) {
      console.log('Waiting for microphone...');
      return;
    }

    const subscription = callForAudio.microphone.state.status$.subscribe((status) => {
      console.log('Mic status:', status);
      setMicStatus(status || 'disabled');
    });

    return () => {
      subscription.unsubscribe();
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
      sendtranscribe(transcriptRef.current);

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
              <p ref={transcriptElementRef}></p>
              <p ref={translatedTextRef}></p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MeetingRoom;