'use client';

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateFactorioBlueprint, getQRCodeMatrix } from '../lib/factorio';

interface QRCodeGeneratorProps {
  defaultValue?: string;
}

// QRCodeCanvasの型を拡張して、RefをHTMLCanvasElementとして明示的に受け入れる
type QRCodeCanvasWithRef = typeof QRCodeCanvas & {
  ref?: React.RefObject<HTMLCanvasElement>;
};

export default function QRCodeGenerator({ defaultValue = 'https://factorio.com' }: QRCodeGeneratorProps) {
  const [input, setInput] = useState<string>(defaultValue);
  const [blueprint, setBlueprint] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [size, setSize] = useState<number>(256);
  const [blueprintScale, setBlueprintScale] = useState<number>(1.0);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  // QRコードが変更されたときにブループリントを更新
  useEffect(() => {
    const timer = setTimeout(() => {
      generateBlueprint();
    }, 500);

    return () => clearTimeout(timer);
  }, [input, size, blueprintScale]);

  // ブループリントを生成する
  const generateBlueprint = () => {
    if (!qrCodeRef.current) return;

    // QRコードのマトリックスを取得
    const matrix = getQRCodeMatrix(qrCodeRef.current);
    
    // FactorioブループリントJSONを生成
    const factorioBlueprint = generateFactorioBlueprint(matrix, blueprintScale);
    setBlueprint(factorioBlueprint);
  };

  // クリップボードにコピー
  const copyToClipboard = () => {
    if (!blueprint) return;
    
    navigator.clipboard.writeText(blueprint)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました: ', err);
      });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Factorio QRコードジェネレーター</h2>
      
      {/* 入力フォーム */}
      <div className="w-full mb-6">
        <label htmlFor="qr-input" className="block text-sm font-medium mb-2">
          URL または テキスト
        </label>
        <input
          id="qr-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="URLまたはテキストを入力してください"
        />
      </div>

      <div className="flex flex-col md:flex-row w-full gap-4 mb-6">
        {/* QRコードサイズ設定 */}
        <div className="w-full md:w-1/2">
          <label htmlFor="qr-size" className="block text-sm font-medium mb-2">
            表示QRコードサイズ: {size}px
          </label>
          <input
            id="qr-size"
            type="range"
            min="128"
            max="512"
            step="32"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            ※画面表示用のサイズです。ブループリントには影響しません
          </p>
        </div>

        {/* ブループリントスケール設定 */}
        <div className="w-full md:w-1/2">
          <label htmlFor="blueprint-scale" className="block text-sm font-medium mb-2">
            ブループリントスケール: {blueprintScale.toFixed(2)}
          </label>
          <input
            id="blueprint-scale"
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={blueprintScale}
            onChange={(e) => setBlueprintScale(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            ※ファクトリオ内のランプ間の距離を調整します
          </p>
        </div>
      </div>

      {/* QRコード表示 */}
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 p-4 bg-white shadow-md rounded-md">
          {/* QRCodeCanvasWithRef型にキャストして使用 */}
          {React.createElement(QRCodeCanvas as unknown as QRCodeCanvasWithRef, {
            value: input || ' ',
            size: size,
            level: "M",
            includeMargin: true,
            ref: qrCodeRef
          })}
        </div>
        <button
          onClick={generateBlueprint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ブループリントを生成
        </button>
      </div>

      {/* ブループリント出力 */}
      {blueprint && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="blueprint" className="block text-sm font-medium">
              Factorioブループリント
            </label>
            <button
              onClick={copyToClipboard}
              className="text-sm px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              {copied ? 'コピーしました！' : 'クリップボードにコピー'}
            </button>
          </div>
          <textarea
            id="blueprint"
            readOnly
            value={blueprint}
            className="w-full h-32 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
          <p className="text-sm text-gray-600 mt-2">
            このブループリント文字列をFactorioのブループリントライブラリにインポートしてください。
          </p>
        </div>
      )}
    </div>
  );
} 