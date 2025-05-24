import { Chessboard } from "react-chessboard";
import { Chess, Move, type Square } from "chess.js";
import { useCallback, useState } from "react";

interface MoveInput {
  from: string,
  to: string,
  promotion?: string; // 升变时候使用
}

const ChessPage: React.FC = () => {
  const [game, setGame] = useState<Chess>(() => new Chess());

  // 检查棋子移动合法性
  const makeAMove = useCallback((moveInput: MoveInput): Move | null => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(moveInput);
    if (result) {
      setGame(gameCopy);
    }
    return result;
  }, [game]);

  // 拖拽棋子
  const handlePieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // 默认升变Queen
    });

    return move !== null;
  }, [makeAMove]);

  return (
    <>
      <div className="h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="w-full max-w-md aspect-square shadow-lg overflow-hidden">
          <Chessboard
            id="BasicBoard"
            position={game.fen()}
            onPieceDrop={handlePieceDrop}
            autoPromoteToQueen={true}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      </div>
    </>
  );
}

export default ChessPage;