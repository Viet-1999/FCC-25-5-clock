function App() {
  const Ref = React.useRef(null);
  const audioRef = React.useRef(null);

  const [breakLengthCounter, setBreakLengthCounter] = React.useState(5);
  const [sessionLengthCounter, setSessionLengthCounter] = React.useState(25);
  const [timer, setTimer] = React.useState("25:00");
  const [isSession, setIsSession] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);

  const [remainingTime, setRemainingTime] = React.useState(null);

  const breakLengthIncrementer = () => {
    if (breakLengthCounter < 60) {
      setBreakLengthCounter(breakLengthCounter + 1);
    }
  };

  const breakLengthDecrementer = () => {
    if (breakLengthCounter > 1) {
      setBreakLengthCounter(breakLengthCounter - 1);
    }
  };

  const sessionLengthIncrementer = () => {
    if (sessionLengthCounter < 60) {
      setSessionLengthCounter(sessionLengthCounter + 1);
      if (isSession && !isRunning) {
        setTimer(formatTime(sessionLengthCounter + 1, 0)); // Update timer only if session is not running
      }
    }
  };

  const sessionLengthDecrementer = () => {
    if (sessionLengthCounter > 1) {
      setSessionLengthCounter(sessionLengthCounter - 1);
      if (isSession && !isRunning) {
        setTimer(formatTime(sessionLengthCounter - 1, 0)); // Update timer only if session is not running
      }
    }
  };

  const formatTime = (minutes, seconds) => {
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const timerFunction = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return {
      total,
      minutes,
      seconds,
    };
  };

  const getDeadTime = (minutes) => {
    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + minutes);
    return deadline;
  };

  const startTimer = (deadline) => {
    const { total, minutes, seconds } = timerFunction(deadline);

    // Ensure that the timer reaches exactly "00:00"
    if (total <= 0) {
      setTimer("00:00"); // Ensure timer displays "00:00"
      clearInterval(Ref.current); // Stop the current countdown
      return; // Exit the function once 00:00 is reached
    }

    setTimer(formatTime(minutes, seconds));
    setRemainingTime(total);
  };

  const handleStartStop = () => {
    if (isRunning) {
      clearInterval(Ref.current);
      setIsRunning(false);
    } else {
      const deadline = remainingTime
        ? new Date(Date.now() + remainingTime) // Resume from where it was paused
        : isSession
        ? getDeadTime(sessionLengthCounter)
        : getDeadTime(breakLengthCounter);

      Ref.current = setInterval(() => {
        startTimer(deadline);
      }, 1000);
      setIsRunning(true);
    }
  };

  const resetButton = () => {
    if (Ref.current) clearInterval(Ref.current); // Stop any running timer
    setBreakLengthCounter(5); // Reset break length to 5
    setSessionLengthCounter(25); // Reset session length to 25
    setTimer(formatTime(25, 0)); // Reset time-left to 25:00
    setIsSession(true); // Reset to session mode
    setIsRunning(false); // Ensure the timer is stopped
    setRemainingTime(null); // Clear any remaining time

    // Reset the audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Rewind the beep sound
    }
  };

  React.useEffect(() => {
    if (timer === "00:00") {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.error("Audio playback error:", err)); // Play beep sound with error handling
      }

      clearInterval(Ref.current); // Stop the current countdown

      if (isSession) {
        // Switch to break
        setIsSession(false); // Set to break mode
        const breakDeadline = getDeadTime(breakLengthCounter);
        setTimer(formatTime(breakLengthCounter, 0)); // Reset to break time
        Ref.current = setInterval(() => {
          startTimer(breakDeadline); // Start the break timer
        }, 1000);
      } else {
        // Switch back to session
        setIsSession(true); // Set to session mode immediately
        const sessionDeadline = getDeadTime(sessionLengthCounter);
        setTimer(formatTime(sessionLengthCounter, 0)); // Reset to session time
        Ref.current = setInterval(() => {
          startTimer(sessionDeadline); // Start the session timer
        }, 1000);
      }
    }
  }, [timer]);

  return (
    <div className="25+5-clock-container">
      <div className="break-and-session-length-container">
        <h1>25 + 5 Clock</h1>
        <div className="break-length-container">
          <h2 id="break-label">Break Length</h2>
          <button id="break-increment" onClick={breakLengthIncrementer}>
            ↑
          </button>
          <h2 id="break-length">{breakLengthCounter}</h2>
          <button id="break-decrement" onClick={breakLengthDecrementer}>
            ↓
          </button>
        </div>
        <div className="session-length-container">
          <h2 id="session-label">Session Length</h2>
          <button id="session-increment" onClick={sessionLengthIncrementer}>
            ↑
          </button>
          <h2 id="session-length">{sessionLengthCounter}</h2>
          <button id="session-decrement" onClick={sessionLengthDecrementer}>
            ↓
          </button>
        </div>
      </div>
      <br></br>
      <div className="timer-and-buttons-container">
        <div className="timer-container">
          <h2 id="timer-label">{isSession ? "Session" : "Break"}</h2>
          <h2 id="time-left">{timer}</h2>
        </div>
        <br></br>
        <div className="buttons-container">
          <button id="start_stop" onClick={handleStartStop}>
            {isRunning ? "❚❚" : "▶"}
          </button>
          <button id="reset" onClick={resetButton}>
            ⟳
          </button>
        </div>
        <audio
          id="beep"
          src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
          ref={audioRef}
        ></audio>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
