/**
 * Factorioのブループリント関連のユーティリティ
 */

import pako from 'pako';
import * as base64 from 'base64-js';

// Factorioブループリントのバージョン
const BLUEPRINT_VERSION = 1;

// アイテムタイプ
type FactorioItemType = 'small-lamp' | 'transport-belt' | 'concrete' | 'landfill';

// アイテムのデフォルト = ランプ
const DEFAULT_ITEM_TYPE = 'small-lamp';

// エンティティの型定義
interface BlueprintEntity {
  entity_number: number;
  name: string;
  position: {
    x: number;
    y: number;
  };
  [key: string]: unknown;
}

/**
 * QRコードマトリックスからFactorioブループリントを生成する
 * @param matrix QRコードのマトリックス（二次元配列）
 * @param scale ブループリントのスケール（1.0がデフォルト）
 * @param itemType 使用するFactorioのアイテムタイプ
 * @returns Factorioブループリント文字列
 */
export function generateFactorioBlueprint(
  matrix: boolean[][], 
  scale: number = 1.0,
  itemType: FactorioItemType = DEFAULT_ITEM_TYPE
): string {
  // アイコン名を決定
  const iconName = itemType;
  
  // ブループリントの基本構造
  const blueprint = {
    blueprint: {
      icons: [
        {
          signal: {
            type: "item",
            name: iconName
          },
          index: 1
        }
      ],
      entities: [] as BlueprintEntity[],
      item: "blueprint",
      version: BLUEPRINT_VERSION
    }
  };

  // QRコードのマトリックスを走査して、エンティティを追加
  let entityIndex = 1;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) { // ドットが存在する場合
        const entity: BlueprintEntity = {
          entity_number: entityIndex,
          name: itemType,
          position: {
            x: (x * scale) + 0.5, // スケールに応じて位置を調整
            y: (y * scale) + 0.5
          }
        };

        // アイテムタイプに応じた追加プロパティ
        if (itemType === 'small-lamp') {
          entity.control_behavior = {
            circuit_condition: {
              constant: 1,
              comparator: ">",
              first_signal: {
                type: "virtual",
                name: "signal-anything"
              }
            }
          };
          entity.connections = {
            "1": {
              red: []
            }
          };
        } else if (itemType === 'transport-belt') {
          entity.direction = 2; // 北向き
        }
        
        blueprint.blueprint.entities.push(entity);
        entityIndex++;
      }
    }
  }

  // ブループリントをJSON文字列に変換
  const blueprintJson = JSON.stringify(blueprint);
  
  // zlib圧縮と Base64エンコード
  try {
    const compressed = pako.deflate(new TextEncoder().encode(blueprintJson));
    const base64Str = base64.fromByteArray(compressed);
    
    // Factorioブループリント文字列の形式は "0" + Base64エンコードされた文字列
    return "0" + base64Str;
  } catch (error) {
    console.error('Blueprint compression error:', error);
    return "";
  }
}

/**
 * QRコードのマトリックスを取得する
 * @param canvas QRコードを描画したキャンバス要素
 * @returns QRコードのマトリックス（二次元配列）
 */
export function getQRCodeMatrix(canvas: HTMLCanvasElement): boolean[][] {
  if (!canvas) return [];

  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const matrix: boolean[][] = [];

  // QRコードのサイズを推測
  const size = Math.sqrt(data.length / 4);
  const pixelSize = canvas.width / size;

  // マトリックスの初期化
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y][x] = false;
    }
  }

  // キャンバス上のQRコードを解析
  for (let y = 0; y < canvas.height; y += pixelSize) {
    for (let x = 0; x < canvas.width; x += pixelSize) {
      const pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // 暗いピクセル（QRコードの黒い部分）を検出
      const isDark = r < 128 && g < 128 && b < 128;
      
      if (isDark) {
        const matrixX = Math.floor(x / pixelSize);
        const matrixY = Math.floor(y / pixelSize);
        if (matrixX < size && matrixY < size) {
          matrix[matrixY][matrixX] = true;
        }
      }
    }
  }

  return matrix;
} 