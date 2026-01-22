// クッキー操作関数
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// 設定を保存
function saveSettings() {
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const locationType = document.querySelector('input[name="locationType"]:checked').value;
    const greenType = document.querySelector('input[name="greenType"]:checked').value;
    const turfType = document.querySelector('input[name="turfType"]:checked').value;
    const responseMode = document.querySelector('input[name="responseMode"]:checked').value;

    const settings = {
        latitude,
        longitude,
        locationType,
        greenType,
        turfType,
        responseMode
    };

    setCookie('turfAdvisorSettings', JSON.stringify(settings));
    
    // 保存通知
    const btn = document.getElementById('saveSettings');
    const originalText = btn.textContent;
    btn.textContent = '保存しました！';
    btn.style.background = '#28a745';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// 設定を読み込み
function loadSettings() {
    const settingsCookie = getCookie('turfAdvisorSettings');
    if (settingsCookie) {
        try {
            const settings = JSON.parse(settingsCookie);
            
            if (settings.latitude) document.getElementById('latitude').value = settings.latitude;
            if (settings.longitude) document.getElementById('longitude').value = settings.longitude;
            if (settings.locationType) {
                document.querySelector(`input[name="locationType"][value="${settings.locationType}"]`).checked = true;
            }
            if (settings.greenType) {
                document.querySelector(`input[name="greenType"][value="${settings.greenType}"]`).checked = true;
            }
            if (settings.turfType) {
                document.querySelector(`input[name="turfType"][value="${settings.turfType}"]`).checked = true;
            }
            if (settings.responseMode) {
                document.querySelector(`input[name="responseMode"][value="${settings.responseMode}"]`).checked = true;
            }
        } catch (e) {
            console.error('設定の読み込みに失敗しました:', e);
        }
    }
}

// 前文を生成
function generatePrefix() {
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    
    // 値を取得（number型のinputでも文字列として取得される）
    const latitude = latitudeInput ? latitudeInput.value.toString().trim() : '';
    const longitude = longitudeInput ? longitudeInput.value.toString().trim() : '';
    
    const locationType = document.querySelector('input[name="locationType"]:checked').value;
    const greenType = document.querySelector('input[name="greenType"]:checked').value;
    const turfType = document.querySelector('input[name="turfType"]:checked').value;

    // デバッグ用ログ（詳細版）
    console.log('=== 前文生成デバッグ ===');
    console.log('緯度入力要素:', latitudeInput);
    console.log('経度入力要素:', longitudeInput);
    console.log('緯度の値（文字列）:', latitude, '型:', typeof latitude, '長さ:', latitude.length);
    console.log('経度の値（文字列）:', longitude, '型:', typeof longitude, '長さ:', longitude.length);
    console.log('緯度が有効か:', latitude && latitude.length > 0);
    console.log('経度が有効か:', longitude && longitude.length > 0);

    let prefix = 'あなたは芝管理の専門家です。以下の情報を踏まえて回答してください。\n\n';
    
    // 位置情報（緯度または経度のどちらかが入力されていれば表示）
    if (latitude && latitude.length > 0 && longitude && longitude.length > 0) {
        prefix += `場所: 北緯${latitude}度、東経${longitude}度\n`;
        console.log('緯度経度の両方が設定されました');
    } else if (latitude && latitude.length > 0) {
        prefix += `場所: 北緯${latitude}度\n`;
        console.log('緯度のみが設定されました');
    } else if (longitude && longitude.length > 0) {
        prefix += `場所: 東経${longitude}度\n`;
        console.log('経度のみが設定されました');
    } else {
        console.log('緯度経度が設定されていません');
    }
    
    // 場所タイプ
    if (locationType !== '未指定') {
        prefix += `場所タイプ: ${locationType}\n`;
    }
    
    // グリーンタイプ
    if (greenType !== '未指定') {
        prefix += `グリーンタイプ: ${greenType}\n`;
    }
    
    // 芝タイプ
    if (turfType !== '未指定') {
        prefix += `芝タイプ: ${turfType}\n`;
    }
    
    prefix += '\n上記の情報を考慮して、以下の質問に専門的かつ具体的に回答してください。\n\n';
    
    // デバッグ用：生成された前文をログに出力
    console.log('生成された前文:', prefix);
    
    return prefix;
}

// 後文を生成
function generateSuffix() {
    const responseMode = document.querySelector('input[name="responseMode"]:checked').value;
    
    let suffix = '\n\n回答の際は、以下の点に注意してください：\n';
    suffix += '- 実用的で具体的なアドバイスを提供してください\n';
    suffix += '- 必要に応じて季節や地域の特性を考慮してください\n';
    suffix += '- 専門用語を使用する場合は簡潔に説明を加えてください\n';
    
    if (responseMode === '慎重に回答') {
        suffix += '\n特に慎重に検討し、複数の観点から回答してください。';
    }
    
    return suffix;
}

// メッセージをチャットに追加
function addMessage(content, isUser = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // ユーザーメッセージはそのまま表示、AIのレスポンスはMarkdownとしてレンダリング
    if (isUser) {
        contentDiv.textContent = content;
    } else {
        // MarkdownをHTMLに変換（XSS対策でサニタイズ）
        if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            const html = marked.parse(content);
            contentDiv.innerHTML = DOMPurify.sanitize(html);
        } else {
            // Markdownライブラリが読み込まれていない場合は通常表示
            contentDiv.textContent = content;
        }
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // スクロールを最下部に
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// AIにメッセージを送信
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // ユーザーメッセージを表示
    addMessage(message, true);
    input.value = '';
    
    // 送信ボタンを無効化
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="loading"></span> 送信中...';
    
    // 前文と後文を生成
    const prefix = generatePrefix();
    const suffix = generateSuffix();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: {
                    prefix: prefix,
                    suffix: suffix
                }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // サーバーから返された詳細なエラー情報を使用
            let errorMessage = data.error || 'エラーが発生しました';
            if (data.details) {
                errorMessage += '\n\n詳細: ' + data.details;
            }
            throw new Error(errorMessage);
        }
        
        // AIの応答を表示
        addMessage(data.response, false);
        
    } catch (error) {
        console.error('Error:', error);
        let errorMsg = '申し訳ございません。エラーが発生しました。';
        if (error.message) {
            errorMsg += '\n\nエラー詳細: ' + error.message;
        }
        addMessage(errorMsg, false);
    } finally {
        // 送信ボタンを再有効化
        sendButton.disabled = false;
        sendButton.textContent = '送信';
    }
}

// 現在地を取得
function getCurrentLocation() {
    const button = document.getElementById('getCurrentLocation');
    const statusDiv = document.getElementById('locationStatus');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    
    // ボタンを無効化
    button.disabled = true;
    button.textContent = '📍 取得中...';
    statusDiv.textContent = '位置情報を取得しています...';
    statusDiv.className = 'location-status loading';
    
    // Geolocation APIが利用可能か確認
    if (!navigator.geolocation) {
        statusDiv.textContent = 'エラー: お使いのブラウザは位置情報をサポートしていません。';
        statusDiv.className = 'location-status error';
        button.disabled = false;
        button.textContent = '📍 現在地を取得';
        return;
    }
    
    // 位置情報を取得
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // 成功時
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // 入力フィールドに値を設定
            latitudeInput.value = latitude.toFixed(6);
            longitudeInput.value = longitude.toFixed(6);
            
            statusDiv.textContent = `位置情報を取得しました（緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}）`;
            statusDiv.className = 'location-status success';
            
            button.disabled = false;
            button.textContent = '📍 現在地を取得';
            
            console.log('現在地を取得しました:', { latitude, longitude });
        },
        (error) => {
            // エラー時
            let errorMessage = '位置情報の取得に失敗しました。';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'エラー: 位置情報の使用が拒否されました。ブラウザの設定で位置情報の許可を有効にしてください。';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'エラー: 位置情報が利用できません。';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'エラー: 位置情報の取得がタイムアウトしました。';
                    break;
                default:
                    errorMessage = 'エラー: 不明なエラーが発生しました。';
                    break;
            }
            
            statusDiv.textContent = errorMessage;
            statusDiv.className = 'location-status error';
            
            button.disabled = false;
            button.textContent = '📍 現在地を取得';
            
            console.error('位置情報の取得エラー:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    // 設定を読み込み
    loadSettings();
    
    // 保存ボタン
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // 現在地取得ボタン
    document.getElementById('getCurrentLocation').addEventListener('click', getCurrentLocation);
    
    // 送信ボタン
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    
    // Enterキーで送信（Shift+Enterで改行）
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 設定変更時に自動保存（オプション）
    const settingsInputs = document.querySelectorAll('input[type="number"], input[type="radio"]');
    settingsInputs.forEach(input => {
        input.addEventListener('change', () => {
            // 自動保存は行わず、手動保存のみとする
        });
    });
});

