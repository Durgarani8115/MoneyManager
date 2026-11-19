"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const noSpeech = "I didn’t hear anything. Try the microphone again.";
const recognitionErrors = {
  "not-allowed": "Allow microphone access in your browser to use voice.",
  "service-not-allowed": "Your browser blocked speech recognition.",
  "audio-capture": "No microphone was available. Check your microphone and try again.",
  "no-speech": noSpeech,
  network: "Speech recognition couldn’t connect. Try the microphone again.",
};

function getRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

const subscribeToSupport = () => () => {};
const getBrowserSupport = () => Boolean(getRecognition());
const getServerSupport = () => false;

export function useVoiceInput() {
  const isSupported = useSyncExternalStore(
    subscribeToSupport,
    getBrowserSupport,
    getServerSupport
  );
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [lastHeard, setLastHeard] = useState("");
  const activeTurn = useRef(null);
  const mounted = useRef(false);

  const cancelTurn = useCallback(() => {
    const turn = activeTurn.current;
    activeTurn.current = null;
    turn?.cancel();
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelTurn();
    };
  }, [cancelTurn]);

  const stopVoice = useCallback(() => {
    cancelTurn();
    setActivity(null);
    setError(null);
  }, [cancelTurn]);

  const startListening = useCallback((onTranscript, { onNoSpeech } = {}) => {
    if (!mounted.current || activeTurn.current) return;

    const SpeechRecognition = getRecognition();
    if (!SpeechRecognition) return;

    let turn;
    try {
      const recognition = new SpeechRecognition();
      let transcript = "";
      let recognitionError = "";
      let finishTimer;

      turn = {
        cancel() {
          clearTimeout(finishTimer);
          recognition.abort();
        },
      };
      const finish = () => {
        if (activeTurn.current !== turn) return;
        clearTimeout(finishTimer);
        activeTurn.current = null;
        setActivity(null);

        if (transcript) {
          setLastHeard(transcript);
          onTranscript(transcript);
        } else if ((!recognitionError || recognitionError === noSpeech) && onNoSpeech) {
          onNoSpeech();
        } else {
          setError(recognitionError || noSpeech);
        }
      };
      const finishIfStalled = () => {
        if (activeTurn.current !== turn || finishTimer !== undefined) return;
        // Preserve the final transcript if the browser leaves the microphone open.
        finishTimer = setTimeout(() => {
          recognition.abort();
          finish();
        }, 500);
      };

      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => {
        if (activeTurn.current === turn) setActivity("listening");
      };
      recognition.onresult = (event) => {
        if (activeTurn.current !== turn || transcript) return;
        const result = event.results[event.resultIndex ?? 0];
        if (result?.isFinal === false) return;
        transcript = result?.[0]?.transcript?.trim() ?? "";
        if (transcript) {
          finishIfStalled();
          recognition.stop();
        }
      };
      recognition.onerror = (event) => {
        recognitionError =
          recognitionErrors[event.error] ?? "Speech recognition stopped. Try the microphone again.";
        finishIfStalled();
      };
      recognition.onend = finish;

      activeTurn.current = turn;
      setError(null);
      setActivity("starting");
      recognition.start();
    } catch {
      activeTurn.current = null;
      setActivity(null);
      setError("Couldn’t start the microphone. Try again.");
    }
  }, []);

  const speak = useCallback((message, onFinished) => {
    if (!mounted.current || activeTurn.current) return;

    const synthesis = window.speechSynthesis;
    if (!synthesis || !window.SpeechSynthesisUtterance) {
      onFinished();
      return;
    }

    let utterance;
    let playbackTimer;
    const clearPlayback = () => {
      clearTimeout(playbackTimer);
      if (utterance) {
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
      }
    };
    const turn = {
      cancel() {
        clearPlayback();
        synthesis.cancel();
      },
    };
    const finish = (timedOut = false) => {
      if (activeTurn.current !== turn) return;
      activeTurn.current = null;
      if (timedOut) turn.cancel();
      else clearPlayback();
      setActivity(null);
      onFinished();
    };

    activeTurn.current = turn;
    try {
      utterance = new window.SpeechSynthesisUtterance(message);
      utterance.lang = "en-IN";
      utterance.onstart = () => {
        clearTimeout(playbackTimer);
        const playbackLimit = Math.min(20000, Math.max(4500, message.length * 100 + 2000));
        playbackTimer = setTimeout(() => finish(true), playbackLimit);
      };
      utterance.onend = () => finish();
      utterance.onerror = () => finish();
      setError(null);
      setActivity("speaking");
      playbackTimer = setTimeout(() => finish(true), 1500);
      synthesis.speak(utterance);
    } catch {
      finish();
    }
  }, []);

  return {
    isSupported,
    isStarting: activity === "starting",
    isListening: activity === "listening",
    isSpeaking: activity === "speaking",
    error,
    lastHeard,
    startListening,
    speak,
    stopVoice,
  };
}
