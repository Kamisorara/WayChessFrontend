import { Chessboard } from "react-chessboard";
import { Chess, Move, type Square } from "chess.js";
import { useCallback, useState } from "react";

interface MoveInput {
  from: string,
  to: string,
  promotion?: string; // 升变时候使用
}

const ChessPage: React.FC = () => {
  // 初始化棋局
  const [game, setGame] = useState<Chess>(() => new Chess());
  // 棋盘方向
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');

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

  // 反转棋盘
  const flipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }, []);


  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-gray-100">
        <div className="flex flex-col items-center gap-2 sm:gap-4 w-full max-w-4xl">
          {/* 反转棋盘按钮 */}
          <button onClick={flipBoard}
            className="px-3 py-2 sm:px-4 sm:py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 rounded-md text-sm sm:text-base"
          >
            翻转棋盘
          </button>

          {/* 响应式棋盘容器 */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl aspect-square shadow-lg rounded-lg overflow-hidden">
            <Chessboard
              id="BasicBoard"
              position={game.fen()}
              onPieceDrop={handlePieceDrop}
              autoPromoteToQueen={true}
              boardOrientation={boardOrientation}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>

          {/* 显示当前轮次 */}
          <div className="text-sm sm:text-lg font-semibold text-gray-700">
            轮到: {game.turn() === 'w' ? '白方' : '黑方'}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChessPage;