// 利用可能なモデル一覧を取得するスクリプト
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEYが設定されていません');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 利用可能なモデルをリストアップ
    // 注: SDKのバージョンによっては直接リスト取得ができない場合があります
    console.log('利用可能なモデル名をテストします...\n');
    
    // 一般的なモデル名の候補
    const modelCandidates = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro-vision',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
    ];
    
    for (const modelName of modelCandidates) {
      try {
        console.log(`テスト: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        console.log(`✓ 成功! モデル名: ${modelName}`);
        console.log(`  応答: ${text.substring(0, 30)}...\n`);
        return modelName; // 最初に成功したモデルを返す
      } catch (error) {
        // エラーは無視して次のモデルを試す
      }
    }
    
    console.log('❌ 利用可能なモデルが見つかりませんでした');
    console.log('   最新のSDKドキュメントを確認してください');
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

listModels();

