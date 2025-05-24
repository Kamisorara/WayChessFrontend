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
  // 选中方格
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  // 可移动的位置
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  // 拖拽时的可移动位置
  const [dragPossibleMoves, setDragPossibleMoves] = useState<Square[]>([]);
  // 上一步移动
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // 检查棋子移动合法性
  const makeAMove = useCallback((moveInput: MoveInput): Move | null => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(moveInput);
    if (result) {
      setGame(gameCopy);
      // 保存上一步移动
      setLastMove({ from: result.from as Square, to: result.to as Square });
    }
    return result;
  }, [game]);

  // 拖拽开始
  const handlePieceDragBegin = useCallback((piece: string, sourceSquare: Square) => {
    // 获取拖拽棋子的可移动位置
    const moves = game.moves({ square: sourceSquare, verbose: true });
    setDragPossibleMoves(moves.map(move => move.to as Square));
  }, [game]);

  // 拖拽结束
  const handlePieceDragEnd = useCallback(() => {
    // 清除拖拽时的可移动位置
    setDragPossibleMoves([]);
  }, []);

  // 拖拽棋子
  const handlePieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // 默认升变Queen
    });

    // 清除选中状态和可移动位置
    setSelectedSquare(null);
    setPossibleMoves([]);
    setDragPossibleMoves([]);

    return move !== null;
  }, [makeAMove]);

  // 点击方格
  const handleSquareClick = useCallback((square: Square) => {
    // 如果点击的是已选中的方格，取消选中
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // 获取点击方格的棋子信息
    const clickedPiece = game.get(square);

    // 如果已经选中了一个方格
    if (selectedSquare) {
      // 检查点击的方格是否有当前玩家的棋子
      if (clickedPiece && clickedPiece.color === game.turn()) {
        // 直接切换到新选中的棋子
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map(move => move.to as Square));
        return;
      }

      // 否则尝试移动到点击的方格
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });

      if (move) {
        // 移动成功，清除选中状态
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        // 移动失败，清除选中状态
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      // 没有选中任何方格，检查点击的方格是否有当前玩家的棋子
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelectedSquare(square);
        // 获取该棋子的所有可移动位置
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map(move => move.to as Square));
      }
    }
  }, [selectedSquare, game, makeAMove]);

  // 反转棋盘
  const flipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setDragPossibleMoves([]);
  }, []);

  // 自定义方格样式
  const customSquareStyles = () => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // 高亮上一步移动
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
    }

    // 高亮选中的方格
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.8)',
        border: '2px solid #f39c12'
      };
    }

    // 显示点击选中时的可移动位置
    possibleMoves.forEach(square => {
      if (!styles[square]) {
        styles[square] = {};
      }

      // 检查该位置是否有对方棋子（可以吃掉）
      const pieceOnSquare = game.get(square);
      const isCapture = pieceOnSquare && pieceOnSquare.color !== game.turn();

      if (isCapture) {
        // 可以吃掉对方棋子 - 显示攻击圆圈
        styles[square] = {
          ...styles[square],
          background: styles[square].background
            ? `${styles[square].background}, radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.4) 80%, transparent 80%)`
            : 'radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.4) 80%, transparent 80%)'
        };
      } else {
        // 普通移动位置 - 显示小圆点
        styles[square] = {
          ...styles[square],
          background: styles[square].background
            ? `${styles[square].background}, radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)`
            : 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)'
        };
      }
    });

    // 显示拖拽时的可移动位置
    dragPossibleMoves.forEach(square => {
      if (!styles[square]) {
        styles[square] = {};
      }

      // 检查该位置是否有对方棋子（可以吃掉）
      const pieceOnSquare = game.get(square);
      const isCapture = pieceOnSquare && pieceOnSquare.color !== game.turn();

      if (isCapture) {
        // 可以吃掉对方棋子 - 显示攻击圆圈（和点击一样的效果）
        styles[square] = {
          ...styles[square],
          background: styles[square].background
            ? `${styles[square].background}, radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.4) 80%, transparent 80%)`
            : 'radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.4) 80%, transparent 80%)'
        };
      } else {
        // 普通移动位置 - 显示小圆点（和点击一样的效果）
        styles[square] = {
          ...styles[square],
          background: styles[square].background
            ? `${styles[square].background}, radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)`
            : 'radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 25%)'
        };
      }
    });

    return styles;
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-[#302e2b]">
        <div className="flex flex-col items-center gap-2 sm:gap-4 w-full max-w-4xl">
          {/* 反转棋盘按钮 */}
          <button onClick={flipBoard}
            className="px-3 py-2 sm:px-4 sm:py-3 bg-[#81b64c] text-white hover:bg-[#9ac570] transition-colors duration-200 rounded-md text-sm sm:text-base"
          >
            翻转棋盘
          </button>

          {/* 响应式棋盘容器 */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl aspect-square shadow-lg rounded-md overflow-hidden">
            <Chessboard
              id="BasicBoard"
              position={game.fen()}
              onPieceDrop={handlePieceDrop}
              onPieceDragBegin={handlePieceDragBegin}
              onPieceDragEnd={handlePieceDragEnd}
              onSquareClick={handleSquareClick}
              autoPromoteToQueen={true}
              boardOrientation={boardOrientation}
              customSquareStyles={customSquareStyles()}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>

          {/* 显示当前轮次 */}
          <div className="text-sm sm:text-lg font-semibold text-white">
            轮到: {game.turn() === 'w' ? '白方' : '黑方'}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChessPage;