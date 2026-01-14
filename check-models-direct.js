// 直接APIを呼び出して利用可能なモデルを確認
require('dotenv').config();

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEYが設定されていません');
    return;
  }

  try {
    // Google AI Studio APIで利用可能なモデルを直接確認
    const fetch = (await import('node-fetch')).default;
    
    // モデル一覧を取得
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('利用可能なモデル:');
      data.models.forEach(model => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`  ✓ ${model.name} - ${model.displayName || ''}`);
          console.log(`    生成メソッド: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('モデル一覧の取得に失敗しました');
      console.log('レスポンス:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('エラー:', error.message);
    
    // 別の方法を試す: よく使われるモデル名を直接テスト
    console.log('\nよく使われるモデル名を直接テストします...');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 最新のモデル名の候補
    const modelsToTest = [
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'gemini-pro-latest',
      'gemini-1.5-pro-002',
      'gemini-1.5-flash-002',
    ];
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        console.log(`✓ 成功: ${modelName}`);
        console.log(`  応答: ${text.substring(0, 50)}...`);
        return modelName;
      } catch (err) {
        // エラーは無視
      }
    }
    
    console.log('利用可能なモデルが見つかりませんでした');
  }
}

checkModels();

