// Gemini APIの接続テストスクリプト
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('=== Gemini API 接続テスト ===\n');
  
  // APIキーの確認
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ エラー: GEMINI_API_KEYが設定されていません');
    console.log('   .envファイルに GEMINI_API_KEY=あなたのAPIキー を設定してください');
    return;
  }
  
  console.log('✓ APIキーが設定されています');
  console.log('   APIキーの先頭:', apiKey.substring(0, 10) + '...');
  console.log('   APIキーの長さ:', apiKey.length, '文字\n');
  
  // Gemini APIの初期化
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✓ GoogleGenerativeAIが初期化されました\n');
    
    // モデル名の候補をテスト（実際に利用可能なモデル）
    const modelNames = [
      'gemini-pro-latest',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'models/gemini-pro-latest',
      'models/gemini-2.5-flash'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`テスト中: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('こんにちは');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✓ ${modelName} は正常に動作しています`);
        console.log(`  応答: ${text.substring(0, 50)}...\n`);
        break; // 最初に成功したモデルで終了
      } catch (error) {
        console.log(`✗ ${modelName} でエラー: ${error.message}\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error('   メッセージ:', error.message);
    console.error('   スタック:', error.stack);
    
    if (error.message && error.message.includes('API_KEY')) {
      console.log('\n💡 ヒント: APIキーが無効の可能性があります');
      console.log('   Google AI Studio (https://aistudio.google.com/) でAPIキーを再取得してください');
    } else if (error.message && error.message.includes('403')) {
      console.log('\n💡 ヒント: APIキーに権限がない可能性があります');
      console.log('   Google Cloud ConsoleでAPIを有効化してください');
    }
  }
}

testGeminiAPI();

