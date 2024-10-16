import React, { useState, useEffect } from 'react';
import Button from './components/ui/button'; 
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { X, Circle } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(25).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [coinResult, setCoinResult] = useState(null);
  const [playerMoves, setPlayerMoves] = useState(0);
  const [aiMoves, setAiMoves] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);

  const checkWinner = (squares) => {
    const lines = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c, d, e] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && 
          squares[a] === squares[d] && squares[a] === squares[e]) {
        return squares[a];
      }
    }

    return null;
  };

  const getMovementOptions = (index) => {
    const moves = [];
    const row = Math.floor(index / 5);
    const col = index % 5;

    // Define possible movements (8 directions)
    const directions = [
      { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 }, 
      { r: 0, c: -1 }, { r: 0, c: 1 }, 
      { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
    ];

    for (const { r, c } of directions) {
      const newRow = row + r;
      const newCol = col + c;
      const newIndex = newRow * 5 + newCol;

      // Check if the new index is within bounds and empty
      if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5 && board[newIndex] === null) {
        moves.push(newIndex);
      }
    }

    return moves;
  };

  const handleClick = (i) => {
    if (winner || !gameStarted) return;

    if (playerMoves < 5) {
      // Handle placement of pieces
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);
        setPlayerMoves(playerMoves + 1);
        setHighlightedMoves([]);

        const newWinner = checkWinner(newBoard);
        if (newWinner) {
          setWinner(newWinner);
        } else if (playerMoves + 1 === 5 && aiMoves === 5) {
          if (!newBoard.includes(null)) {
            setWinner('draw');
          } else {
            setIsAITurn(true);
          }
        } else {
          setIsAITurn(true);
        }
      }
    } else {
      // Handle movement logic after 5 pieces are placed
      if (board[i] === 'X') {
        setSelectedPiece(i);
        setHighlightedMoves(getMovementOptions(i));
      } else if (selectedPiece !== null && highlightedMoves.includes(i)) {
        const newBoard = [...board];
        newBoard[i] = 'X'; // Move 'X' to new position
        newBoard[selectedPiece] = null; // Clear old position
        setBoard(newBoard);
        setSelectedPiece(null);
        setHighlightedMoves([]);
        setIsAITurn(true); // Switch to AI turn
      }
    }
  };

  const aiMove = () => {
    if (aiMoves >= 5 || winner) return; // AI can't make more than 5 moves and should not move if there's a winner

    const newBoard = [...board];
    let moveFound = false;

    // AI will attempt to move an 'O' to an empty space only after all pieces are placed
    if (playerMoves === 5) {
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === 'O') { // Check for existing 'O'
          const movementOptions = getMovementOptions(i);
          for (const move of movementOptions) {
            if (newBoard[move] === null) {
              newBoard[move] = 'O'; // Move 'O' to the empty space
              newBoard[i] = null; // Clear old position
              moveFound = true;
              break;
            }
          }
        }
        if (moveFound) break; // Exit if a move has been made
      }
    }

    if (!moveFound) {
      // If no move was made, place an 'O' in the first available spot
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = 'O'; // Place 'O' in the first available spot
          moveFound = true;
          break;
        }
      }
    }

    if (moveFound) {
      setBoard(newBoard);
      setAiMoves(aiMoves + 1);
      const newWinner = checkWinner(newBoard);
      
      if (newWinner) {
        setWinner(newWinner);
      } else if (playerMoves === 5 && aiMoves + 1 === 5) {
        if (!newBoard.includes(null)) {
          setWinner('draw'); // Declare a draw if the board is full
        } else {
          setIsAITurn(false);
        }
      } else {
        setIsAITurn(false);
      }
    }
  };

  useEffect(() => {
    if (isAITurn && !winner) {
      const timer = setTimeout(aiMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isAITurn, winner, board]);

  const flipCoin = () => {
    const result = Math.random() < 0.5;
    setCoinResult(result ? 'Heads' : 'Tails');
    setIsXNext(result);
    setIsAITurn(!result);
    setGameStarted(true);
    setPlayerMoves(0);
    setAiMoves(0);
    setWinner(null);
    setBoard(Array(25).fill(null));
  };

  const resetGame = () => {
    setBoard(Array(25).fill(null));
    setWinner(null);
    setGameStarted(false);
    setIsAITurn(false);
    setCoinResult(null);
    setPlayerMoves(0);
    setAiMoves(0);
    setSelectedPiece(null);
    setHighlightedMoves([]);
  };

  const renderSquare = (i) => (
    <Button
      className={`w-16 h-16 text-3xl font-bold transition-transform duration-300 transform 
                  ${board[i] ? 'bg-gray-300 cursor-not-allowed' : (highlightedMoves.includes(i) ? 'bg-yellow-200' : 'bg-white hover:bg-gray-100')}
                  border-2 border-gray-400 rounded-md flex items-center justify-center`}
      onClick={() => handleClick(i)}
      disabled={!!winner || !gameStarted}
    >
      {board[i] === 'X' && <X className="w-10 h-10 text-blue-600" />}
      {board[i] === 'O' && <Circle className="w-10 h-10 text-red-600" />}
    </Button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-blue-200 p-8">
      <h1 className="text-6xl font-bold mb-8 text-purple-800 text-center">5x5 Tic Tac Toe</h1>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full">
        {!gameStarted ? (
          <div className="text-center">
            <p className="mb-4 text-lg text-gray-700">Flip a coin to decide who goes first!</p>
            <Button onClick={flipCoin} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
              Flip Coin
            </Button>
            {coinResult && (
              <div className="mt-4">
                <Alert variant="info">
                  <AlertTitle>Result</AlertTitle>
                  <AlertDescription>{`You got ${coinResult}!`} {isXNext ? "X goes first." : "O goes first."}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-1 mb-4">
              {board.map((_, i) => renderSquare(i))}
            </div>
            {winner && (
              <Alert variant="success" className="mt-4">
                <AlertTitle>{winner === 'draw' ? "It's a Draw!" : `Winner: ${winner}`}</AlertTitle>
              </Alert>
            )}
            <Button onClick={resetGame} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Restart Game
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;
