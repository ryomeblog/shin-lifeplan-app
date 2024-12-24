const zlib = require('zlib');

/**
 * 文字列を短い表現に置換するための辞書
 */
const compressionDictionary = {
  // JSON構造の特殊文字
//   '{"': '~1',
//   '"}': '~2',
//   ',"': '~3',
//   '",': '~4',
//   ',"': '~5',
//   '":': '~6',
//   '":[': '~7',
//   '],"': '~8',
//   '[{': '~9',
//   '}]': '~0',
  'null': '^n',
  'true': '^t',
  'false': '^f',
  
  // 頻出するキー名やパターン（実際のデータに応じて調整可能）
//   '"id"': '@i',
  '"name"': '^n',
  '"type"': '^t',
  '"value"': '^v',
  '"data"': '^d',
  '"items"': '^m',
  '"timestamp"': '^s'
};

const decompressDictionary = Object.fromEntries(
  Object.entries(compressionDictionary).map(([k, v]) => [v, k])
);

/**
 * 数値を短い表現に変換
 */
function compressNumber(n) {
  if (Number.isInteger(n)) {
    if (n >= 0 && n <= 9) return n.toString();
    return `#${n.toString(36)}`;  // 36進数に変換
  }
  return n.toString();
}

/**
 * 短い表現を数値に戻す
 */
function decompressNumber(s) {
  if (s[0] === '#') {
    return parseInt(s.slice(1), 36);
  }
  return parseFloat(s);
}

/**
 * JSONデータを超圧縮してBase64文字列に変換する
 * @param {Object} data - 圧縮したいJSONデータ
 * @returns {Promise<string>} 圧縮されたBase64文字列
 */
function compressJSON(data) {
  return new Promise((resolve, reject) => {
    try {
      // データの前処理
      const processedData = JSON.stringify(data, (key, value) => {
        if (typeof value === 'number') {
          return compressNumber(value);
        }
        return value;
      });

      // 辞書による置換
      let compressedString = processedData;
      for (const [pattern, replacement] of Object.entries(compressionDictionary)) {
        compressedString = compressedString.split(pattern).join(replacement);
      }

      // Brotli圧縮オプションを設定
      const options = {
        params: {
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: compressedString.length,
          [zlib.constants.BROTLI_PARAM_LGWIN]: 24  // ウィンドウサイズを最大に
        }
      };

      // 二段階圧縮: DEFLATE → Brotli
      zlib.deflate(compressedString, { level: 9 }, (err, deflated) => {
        if (err) {
          reject(err);
          return;
        }

        zlib.brotliCompress(deflated, options, (err, buffer) => {
          if (err) {
            reject(err);
            return;
          }

          // URLセーフなBase64に変換
          const compressed = buffer.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

          resolve(compressed);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 圧縮されたBase64文字列をJSONデータに戻す
 * @param {string} compressedString - 圧縮されたBase64文字列
 * @returns {Promise<Object>} 元のJSONデータ
 */
function decompressJSON(compressedString) {
  return new Promise((resolve, reject) => {
    try {
      // URLセーフなBase64を通常のBase64に戻す
      const base64 = compressedString
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(compressedString.length + ((4 - (compressedString.length % 4)) % 4), '=');

      const buffer = Buffer.from(base64, 'base64');

      // 二段階解凍: Brotli → DEFLATE
      zlib.brotliDecompress(buffer, (err, brotliDecompressed) => {
        if (err) {
          reject(err);
          return;
        }

        zlib.inflate(brotliDecompressed, (err, decompressed) => {
          if (err) {
            reject(err);
            return;
          }

          let decompressedString = decompressed.toString();

          // 辞書による置換を元に戻す
          for (const [replacement, pattern] of Object.entries(decompressDictionary)) {
            decompressedString = decompressedString.split(replacement).join(pattern);
          }

          // JSONをパースし、数値を復元
          const jsonData = JSON.parse(decompressedString, (key, value) => {
            if (typeof value === 'string' && (value[0] === '#' || !isNaN(value))) {
              return decompressNumber(value);
            }
            return value;
          });

          resolve(jsonData);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  compressJSON,
  decompressJSON
};