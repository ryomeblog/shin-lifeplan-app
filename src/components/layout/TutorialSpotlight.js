// 1. React関連
import React, { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';

// チュートリアルスポットライトUI
const TutorialSpotlight = ({ steps, step, onNext, onClose, children, visible }) => {
  const [targetRect, setTargetRect] = useState(null);
  const [cloneNode, setCloneNode] = useState(null);
  const [panelPos, setPanelPos] = useState({
    top: window.innerHeight / 2 - 70,
    left: window.innerWidth / 2 - 160,
  });
  const [panelDims, setPanelDims] = useState({ width: 320, height: 140 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanelMoved, setIsPanelMoved] = useState(false);
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  // ステップ切り替え時に該当要素までスクロール
  useEffect(() => {
    if (!visible) return;
    const target = steps[step]?.targetRef?.current;
    if (target) {
      // スクロール位置調整
      const rect = target.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      // 画面中央に来るように
      const targetTop = rect.top + scrollY - window.innerHeight / 2 + rect.height / 2;
      const targetLeft = rect.left + scrollX - window.innerWidth / 2 + rect.width / 2;
      window.scrollTo({
        top: Math.max(targetTop, 0),
        left: Math.max(targetLeft, 0),
        behavior: 'smooth',
      });
    }
  }, [step, steps, visible]);

  // 各ステップのtargetRefを取得し、クローン作成
  useEffect(() => {
    if (!visible) return;
    const target = steps[step]?.targetRef?.current;
    if (target) {
      if (target.hasAttribute('data-spotlight-no-clone')) {
        setTargetRect(target.getBoundingClientRect());
        setCloneNode(null);
      } else {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        // クローン作成
        const clone = target.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = 10001; // 背景(10000)より上
        clone.style.pointerEvents = 'none';
        clone.style.boxShadow = '0 0 0 4px #2563eb80, 0 8px 32px #0002';
        clone.style.background = '#fff';
        clone.style.boxShadow = '0 0 0 4px #2563eb80, 0 8px 32px #0002';
        clone.style.borderRadius = '12px';
        setCloneNode(clone);

        // 元要素をクリック不可
        target.style.pointerEvents = 'none';
      }
    } else {
      setTargetRect(null);
    }
    // クリーンアップでpointer-events戻す
    return () => {
      const target = steps[step]?.targetRef?.current;
      if (target) target.style.pointerEvents = '';
      setCloneNode(null);
    };
  }, [step, steps, visible]);

  // ステップ切り替え時にパネル位置をリセット
  useEffect(() => {
    setDragging(false);
    setIsPanelMoved(false); // ここでリセット
  }, [step]);

  // パネル位置・大きさ計算（panelInitialPos優先→targetRect近く→中央）
  useEffect(() => {
    const panelWidth = steps[step]?.panelWidth || 320;
    const panelHeight = steps[step]?.panelHeight || 140;
    const side = steps[step]?.panelSide; // 'right'|'left'|'top'|'bottom'|undefined
    const panelInitialPos = steps[step]?.panelInitialPos;

    if (!isPanelMoved) {
      let top, left;
      if (
        panelInitialPos &&
        typeof panelInitialPos.top === 'number' &&
        typeof panelInitialPos.left === 'number'
      ) {
        top = panelInitialPos.top;
        left = panelInitialPos.left;
      } else if (targetRect) {
        if (side === 'right') {
          top = targetRect.top;
          left = targetRect.left + targetRect.width + 16;
        } else if (side === 'left') {
          top = targetRect.top;
          left = targetRect.left - panelWidth - 16;
        } else if (side === 'top') {
          top = targetRect.top - panelHeight - 16;
          left = targetRect.left + targetRect.width / 2 - panelWidth / 2;
        } else if (side === 'bottom') {
          top = targetRect.top + targetRect.height + 16;
          left = targetRect.left + targetRect.width / 2 - panelWidth / 2;
        } else {
          // 自動調整: 右→左→下→上の順で置ける場所を探す
          if (targetRect.left + targetRect.width + panelWidth + 16 < window.innerWidth) {
            // 右
            top = targetRect.top;
            left = targetRect.left + targetRect.width + 16;
          } else if (targetRect.left - panelWidth - 16 > 0) {
            // 左
            top = targetRect.top;
            left = targetRect.left - panelWidth - 16;
          } else if (targetRect.top + targetRect.height + panelHeight + 16 < window.innerHeight) {
            // 下
            top = targetRect.top + targetRect.height + 16;
            left = targetRect.left + targetRect.width / 2 - panelWidth / 2;
          } else {
            // 上
            top = targetRect.top - panelHeight - 16;
            left = targetRect.left + targetRect.width / 2 - panelWidth / 2;
          }
        }
        // はみ出し防止
        if (left + panelWidth > window.innerWidth) left = window.innerWidth - panelWidth - 16;
        if (left < 16) left = 16;
        if (top + panelHeight > window.innerHeight) top = window.innerHeight - panelHeight - 16;
        if (top < 16) top = 16;
      } else {
        // targetRectもpanelInitialPosも取得できていない場合は中央
        top = window.innerHeight / 2 - panelHeight / 2;
        left = window.innerWidth / 2 - panelWidth / 2;
      }
      setPanelPos({ top, left });
      setPanelDims({ width: panelWidth, height: panelHeight });
    }
    // isPanelMoved=trueならドラッグ位置維持
    // panelDimsはドラッグ時も更新
    if (isPanelMoved) {
      setPanelDims({ width: panelWidth, height: panelHeight });
    }
  }, [targetRect, step, steps, isPanelMoved]);

  // ドラッグ操作
  const handleMouseDown = (e) => {
    setDragging(true);
    setIsPanelMoved(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.preventDefault();
  };
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => {
      let newLeft = e.clientX - dragOffset.x;
      let newTop = e.clientY - dragOffset.y;
      // はみ出し防止
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + panelDims.width > window.innerWidth)
        newLeft = window.innerWidth - panelDims.width;
      if (newTop + panelDims.height > window.innerHeight)
        newTop = window.innerHeight - panelDims.height;
      setPanelPos({ left: newLeft, top: newTop });
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, panelDims]);

  // クローンをbody直下に配置
  useEffect(() => {
    if (!visible || !cloneNode) return;
    document.body.appendChild(cloneNode);
    return () => {
      if (cloneNode && cloneNode.parentNode) cloneNode.parentNode.removeChild(cloneNode);
    };
  }, [cloneNode, visible]);

  if (!visible) return children;

  // チュートリアル用ダミーグラフ
  const DummyGraph = steps[step]?.dummyGraphComponent;

  return (
    <>
      {/* 暗い背景 */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />
      {/* パネル */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: panelPos.top,
          left: panelPos.left,
          width: panelDims.width,
          height: panelDims.height,
          zIndex: dragging ? 10003 : 10002,
          transition: 'all 0.2s',
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-4 border border-blue-200 relative h-full">
          <div
            className="font-bold text-blue-700 mb-1 cursor-move"
            style={{ userSelect: 'none' }}
            onMouseDown={handleMouseDown}
          >
            {steps[step].label}
          </div>
          <div className="text-gray-700 text-sm mb-3">{steps[step].desc}</div>
          {/* チュートリアル用ダミーグラフを表示 */}
          {DummyGraph && (
            <div className="mb-2">
              <DummyGraph />
            </div>
          )}
          <div className="flex justify-between">
            <Button onClick={onNext} className="w-full">
              {step === steps.length - 1 ? '完了' : '次へ'}
            </Button>
          </div>
          <div className="flex justify-center gap-1 mt-2">
            {steps.map((s, idx) => (
              <span
                key={s.key}
                className={`w-2 h-2 rounded-full ${idx === step ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <button
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label="チュートリアルを閉じる"
            style={{ background: 'none', border: 'none', fontSize: 18 }}
          >
            ×
          </button>
        </div>
      </div>
      {/* childrenはz-index:0で下に */}
      <div style={{ zIndex: 0, position: 'relative' }}>{children}</div>
    </>
  );
};

export default TutorialSpotlight;
