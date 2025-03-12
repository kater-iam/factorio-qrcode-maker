'use client';

import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateFactorioBlueprint, getQRCodeMatrix } from '../lib/factorio';

interface QRCodeGeneratorProps {
  defaultValue?: string;
}

// QRCodeCanvasの型を拡張して、RefをHTMLCanvasElementとして明示的に受け入れる
type QRCodeCanvasWithRef = typeof QRCodeCanvas & {
  ref?: React.RefObject<HTMLCanvasElement>;
};

// アイテムの種類
type FactorioItemType = 'small-lamp' | 'transport-belt' | 'concrete' | 'landfill';

// アイテム表示用の設定
const itemImages: Record<FactorioItemType, { src: string, alt: string }> = {
  'small-lamp': { src: '/images/factorio/items/small-lamp.png', alt: 'ランプ' },
  'transport-belt': { src: '/images/factorio/items/transport-belt.png', alt: '黄色ベルト' },
  'concrete': { src: '/images/factorio/items/concrete.png', alt: 'コンクリート' },
  'landfill': { src: '/images/factorio/items/landfill.png', alt: '埋立地' }
};

// 背景用の土地テクスチャ
const TERRAIN_TEXTURE = '/images/factorio/terrain/grass.png';

export default function QRCodeGenerator({ defaultValue = 'https://factorio.com' }: QRCodeGeneratorProps) {
  const [input, setInput] = useState<string>(defaultValue);
  const [blueprint, setBlueprint] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [blueprintScale, setBlueprintScale] = useState<number>(1.0);
  const [selectedItem, setSelectedItem] = useState<FactorioItemType>('small-lamp');
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  // QRコードの表示サイズ（固定）
  const size = 256;
  const cellSize = 8; // QRコードのセルサイズ

  // QRコードとブループリントを生成する
  const handleGenerateQRCode = useCallback(() => {
    setIsGenerating(true);
    
    // 少し遅延させて処理を実行（UIのブロックを防ぐため）
    setTimeout(() => {
      try {
        if (qrCodeRef.current) {
          // QRコードのマトリックスを取得
          const matrix = getQRCodeMatrix(qrCodeRef.current);
          setQrMatrix(matrix);
          
          // FactorioブループリントJSONを生成
          const factorioBlueprint = generateFactorioBlueprint(matrix, blueprintScale, selectedItem);
          setBlueprint(factorioBlueprint);
        }
      } catch (error) {
        console.error('QRコード生成エラー:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 10);
  }, [blueprintScale, selectedItem, input]);

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

  // 選択されたアイテムの表示名
  const getItemDisplayName = (itemType: FactorioItemType): string => {
    switch (itemType) {
      case 'small-lamp': return 'ランプ';
      case 'transport-belt': return '黄色ベルト';
      case 'concrete': return 'コンクリート';
      case 'landfill': return '埋立地';
      default: return 'ランプ';
    }
  };

  // QRコードプレビューをメモ化
  const renderQRPreview = useCallback(() => {
    if (qrMatrix.length === 0) return null;
    
    return (
      <div className="absolute inset-0 grid" style={{ 
        gridTemplateColumns: `repeat(${qrMatrix[0].length}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${qrMatrix.length}, ${cellSize}px)`
      }}>
        {qrMatrix.flatMap((row, y) => 
          row.map((cell, x) => (
            <div key={`${x}-${y}`} className="relative" style={{ width: cellSize, height: cellSize }}>
              {cell && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundColor: selectedItem === 'concrete' || selectedItem === 'landfill' ? 'rgba(0,0,0,0.7)' : 'transparent',
                      backgroundImage: `url(${itemImages[selectedItem].src})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }, [qrMatrix, selectedItem, cellSize]);

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
        {/* アイテム選択ラジオボタン */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">
            Factorioアイテム選択
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="factorio-item"
                value="small-lamp"
                checked={selectedItem === 'small-lamp'}
                onChange={() => setSelectedItem('small-lamp')}
                className="text-blue-600"
              />
              <span>ランプ</span>
            </label>
            <label className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="factorio-item"
                value="transport-belt"
                checked={selectedItem === 'transport-belt'}
                onChange={() => setSelectedItem('transport-belt')}
                className="text-blue-600"
              />
              <span>黄色ベルト</span>
            </label>
            <label className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="factorio-item"
                value="concrete"
                checked={selectedItem === 'concrete'}
                onChange={() => setSelectedItem('concrete')}
                className="text-blue-600"
              />
              <span>コンクリート</span>
            </label>
            <label className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="factorio-item"
                value="landfill"
                checked={selectedItem === 'landfill'}
                onChange={() => setSelectedItem('landfill')}
                className="text-blue-600"
              />
              <span>埋立地</span>
            </label>
          </div>
        </div>
      </div>

      {/* ブループリントスケール設定 */}
      <div className="w-full mb-6">
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
          ※ファクトリオ内のアイテム間の距離を調整します
        </p>
      </div>

      {/* QRコード表示 */}
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 relative">
          {/* 非表示のQRCodeCanvas（マトリックスデータ取得用） */}
          <div className="hidden">
            {React.createElement(QRCodeCanvas as unknown as QRCodeCanvasWithRef, {
              value: input || ' ',
              size: size,
              level: "M",
              includeMargin: true,
              ref: qrCodeRef
            })}
          </div>

          {/* Factorioスタイルのプレビュー（土地の上にアイテム）*/}
          <div 
            className="relative w-[256px] h-[256px] overflow-hidden border-2 border-gray-800 rounded-md"
            style={{ 
              backgroundColor: '#8b7355',
              backgroundImage: `url(${TERRAIN_TEXTURE})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'repeat'
            }}
          >
            {qrMatrix.length > 0 && renderQRPreview()}
          </div>
          <p className="text-xs text-center mt-2">
            選択アイテム: {getItemDisplayName(selectedItem)}
          </p>
        </div>
        <button
          onClick={handleGenerateQRCode}
          disabled={isGenerating}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${
            isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isGenerating ? '生成中...' : 'QRコード・ブループリントを生成'}
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