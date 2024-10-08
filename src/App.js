import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [players, setPlayers] = useState([]);
  const [answerStatus, setAnswerStatus] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const questions = useMemo(() => [
    {
      question: "What is the capital of France?",
      options: ["A. Paris", "B. London", "C. Rome", "D. Berlin"],
      answer: "A"
    },
    {
      question: "Which is the largest planet in our solar system?",
      options: ["A. Earth", "B. Mars", "C. Jupiter", "D. Saturn"],
      answer: "C"
    },
    {
      question: "What is the smallest prime number?",
      options: ["A. 0", "B. 1", "C. 2", "D. 3"],
      answer: "C"
    },
    {
      question: "Which ocean is the largest?",
      options: ["A. Atlantic Ocean", "B. Indian Ocean", "C. Arctic Ocean", "D. Pacific Ocean"],
      answer: "D"
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["A. Charles Dickens", "B. William Shakespeare", "C. Mark Twain", "D. Jane Austen"],
      answer: "B"
    }
  ], []);

  useEffect(() => {
    socket.on('player-joined', (playerName) => {
      setPlayers((prev) => [...prev, playerName]);
    });

    socket.on('answer-submitted', (data) => {
      if (data.answer === questions[questionIndex].answer) {
        setAnswerStatus(`Congratulations ${data.name}! Correct answer!`);
        setTimeout(() => {
          setAnswerStatus('');
          // Increment the question index for the next question
          setQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1)); 
        }, 2000);
      } else {
        setAnswerStatus(`${data.name}, wrong answer! Try again.`);
      }
    });

    return () => {
      socket.off('player-joined');
      socket.off('answer-submitted');
    };
  }, [questionIndex, questions]);

  const submitAnswer = () => {
    if (!selectedOption) {
      alert('Please select an option before submitting.'); // Alert if no option selected
      return;
    }

    const playerName = 'Your Player Name'; // Change to dynamically get player name if needed
    socket.emit('submit-answer', { name: playerName, answer: selectedOption });
    setSelectedOption(''); // Reset the selected option after submission
  };

  // Check if all questions have been answered
  if (questionIndex >= questions.length) {
    return <h2>Game Over! Thanks for playing!</h2>;
  }

  return (
    <div className="App">
      <h1>KBC Game</h1>
      <QRCodeCanvas value="http://localhost:3000" />
      <h2>Question: {questions[questionIndex].question}</h2>
      <ul>
        {questions[questionIndex].options.map((option, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                value={option[0]} // Extracting option letter (A, B, C, D)
                checked={selectedOption === option[0]}
                onChange={() => setSelectedOption(option[0])}
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={submitAnswer}>Submit Answer</button>

      <h3>Players:</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      <h3>{answerStatus}</h3>
    </div>
  );
}

export default App;
