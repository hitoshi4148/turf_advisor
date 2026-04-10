const express = require('express');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// チャットAPIエンドポイント
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    // デバッグ用：受信したデータをログに出力
    console.log('\n=== 受信データ ===');
    console.log('メッセージ:', message);
    console.log('前文:', context.prefix);
    console.log('後文:', context.suffix);
    console.log('==================\n');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini APIキーが設定されていません。.envファイルにGEMINI_API_KEYを設定してください。' 
      });
    }

    // 前文と後文を組み合わせてプロンプトを作成
    const fullPrompt = `${context.prefix}\n\n${message}\n\n${context.suffix}`;

    // プロンプト全文をログに表示
    console.log('\n' + '='.repeat(80));
    console.log('送信プロンプト全文:');
    console.log('='.repeat(80));
    console.log(fullPrompt);
    console.log('='.repeat(80) + '\n');

    // Geminiモデルを取得
    // モデル名を環境変数で指定可能にする（デフォルトはgemini-2.5-flash）
    // 利用可能なモデル: gemini-2.5-flash, gemini-2.5-pro, gemini-pro-latest など
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log(`Using model: ${modelName}`);

    // チャットを生成
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // より詳細なエラーメッセージを返す
    let errorMessage = 'AIからの応答を取得できませんでした。';
    let errorDetails = error.message || '不明なエラー';
    
    const statusCode =
      error?.status ||
      error?.response?.status ||
      (() => {
        const msg = String(error?.message || '');
        const bracket = msg.match(/\[(\d{3})\s+[^\]]+\]/);
        if (bracket) return Number(bracket[1]);
        const plain = msg.match(/\b(4\d{2}|5\d{2})\b/);
        if (plain) return Number(plain[1]);
        return undefined;
      })();

    // エラーの種類に応じたメッセージ
    if (error.message && error.message.includes('API_KEY')) {
      errorMessage = 'APIキーが無効です。.envファイルのGEMINI_API_KEYを確認してください。';
    } else if (statusCode === 403 || (error.message && error.message.includes('403'))) {
      errorMessage = 'APIキーにアクセス権限がありません。APIキーが有効か確認してください。';
    } else if (statusCode === 429 || (error.message && error.message.includes('429'))) {
      errorMessage = 'リクエスト制限を超えました。しばらく時間をおいてから再試行してください。';
    } else if (statusCode === 503) {
      errorMessage = 'Geminiが高負荷のため一時的に利用できません。しばらく時間をおいてから再試行してください。';
    } else if (error.message && error.message.toLowerCase().includes('model') && (error.message.includes('not found') || error.message.includes('NOT_FOUND') || statusCode === 404)) {
      errorMessage = 'モデル名が正しくありません。設定を確認してください。';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      statusCode,
      fullError: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`http://localhost:${PORT} にアクセスしてください`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('警告: GEMINI_API_KEYが設定されていません。.envファイルを確認してください。');
  }
});

