class FocusModeController {
    constructor() {
        this.isInFocusMode = false;
        this.timerWindow = null;
        this.blackWindow1 = null; // MacBook
        this.blackWindow2 = null; // 縦型ディスプレイ
        this.workDuration = 25;
        this.breakDuration = 5;
        
        // ディスプレイ構成
        this.displays = {
            main: { width: 1920, height: 1080 },
            macbook: { width: 1440, height: 900 }, // MacBook標準解像度
            vertical: { width: 1080, height: 1920 } // 縦型ディスプレイ
        };
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.focusModeBtn = document.getElementById('focus-mode-btn');
        this.normalModeBtn = document.getElementById('normal-mode-btn');
        this.workDurationInput = document.getElementById('work-duration');
        this.breakDurationInput = document.getElementById('break-duration');
        this.windowButtons = document.getElementById('window-buttons');
        this.openTimerBtn = document.getElementById('open-timer-btn');
        this.openBlackBtn = document.getElementById('open-black-btn');
    }

    bindEvents() {
        this.focusModeBtn.addEventListener('click', () => this.startFocusMode());
        this.normalModeBtn.addEventListener('click', () => this.endFocusMode());
        
        // 個別のウィンドウ開くボタン
        this.openTimerBtn.addEventListener('click', () => this.openTimerWindow());
        this.openBlackBtn.addEventListener('click', () => this.openBlackWindow());
        
        this.workDurationInput.addEventListener('change', (e) => {
            this.workDuration = parseInt(e.target.value);
            this.updateTimerWindow();
        });
        
        this.breakDurationInput.addEventListener('change', (e) => {
            this.breakDuration = parseInt(e.target.value);
            this.updateTimerWindow();
        });
        
        window.addEventListener('beforeunload', () => {
            if (this.timerWindow && !this.timerWindow.closed) {
                this.timerWindow.close();
            }
            if (this.blackWindow1 && !this.blackWindow1.closed) {
                this.blackWindow1.close();
            }
            if (this.blackWindow2 && !this.blackWindow2.closed) {
                this.blackWindow2.close();
            }
        });
    }

    startFocusMode() {
        this.isInFocusMode = true;
        this.focusModeBtn.style.display = 'none';
        this.normalModeBtn.style.display = 'block';
        this.windowButtons.style.display = 'block';
        
        // まずタイマーだけ開く
        this.openTimerWindow();
        
        // 黒画面を開くボタンを強調表示
        this.openBlackBtn.style.animation = 'pulse 2s infinite';
    }

    endFocusMode() {
        this.isInFocusMode = false;
        this.focusModeBtn.style.display = 'block';
        this.normalModeBtn.style.display = 'none';
        this.windowButtons.style.display = 'none';
        
        if (this.timerWindow && !this.timerWindow.closed) {
            this.timerWindow.close();
        }
        if (this.blackWindow1 && !this.blackWindow1.closed) {
            this.blackWindow1.close();
        }
        if (this.blackWindow2 && !this.blackWindow2.closed) {
            this.blackWindow2.close();
        }
    }
    
    openTimerWindow() {
        if (!this.timerWindow || this.timerWindow.closed) {
            const timerFeatures = `width=${this.displays.vertical.width},height=${this.displays.vertical.height},left=${this.displays.main.width},top=0`;
            console.log('Opening timer window...');
            this.timerWindow = window.open('timer.html?vertical=true', 'timerWindow', timerFeatures);
            
            if (this.timerWindow) {
                console.log('Timer window opened successfully');
                this.openTimerBtn.style.opacity = '0.5';
                this.openTimerBtn.disabled = true;
                setTimeout(() => {
                    this.updateTimerWindow();
                    this.sendMessageToWindow(this.timerWindow, 'setVerticalMode');
                }, 1000);
            } else {
                alert('ポップアップがブロックされています。ブラウザの設定でこのサイトのポップアップを許可してください。');
            }
        }
    }
    
    openBlackWindow() {
        if (!this.blackWindow1 || this.blackWindow1.closed) {
            const macbookFeatures = `width=${this.displays.macbook.width},height=${this.displays.macbook.height},left=0,top=${this.displays.main.height}`;
            console.log('Opening black window...');
            this.blackWindow1 = window.open('about:blank', 'blackWindow1', macbookFeatures);
            
            if (this.blackWindow1) {
                // 黒画面のHTMLを直接書き込む
                this.blackWindow1.document.write(`
                    <!DOCTYPE html>
                    <html lang="ja">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>集中モード - ブラックスクリーン</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                background: #1a1a1a;
                                min-height: 100vh;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                cursor: none;
                                overflow: hidden;
                            }
                            .message {
                                color: #333;
                                font-size: 1.5rem;
                                opacity: 0.1;
                                user-select: none;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="message">集中モード実行中</div>
                        <script>
                            document.body.addEventListener('dblclick', () => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    document.exitFullscreen();
                                }
                            });
                            let cursorTimeout;
                            function hideCursor() { document.body.style.cursor = 'none'; }
                            function showCursor() {
                                document.body.style.cursor = 'default';
                                clearTimeout(cursorTimeout);
                                cursorTimeout = setTimeout(hideCursor, 2000);
                            }
                            document.addEventListener('mousemove', showCursor);
                            cursorTimeout = setTimeout(hideCursor, 2000);
                        </script>
                    </body>
                    </html>
                `);
                this.blackWindow1.document.close();
                console.log('Black window opened successfully');
                this.openBlackBtn.style.opacity = '0.5';
                this.openBlackBtn.style.animation = 'none';
                this.openBlackBtn.disabled = true;
            }
        }
    }

    openAdditionalWindows() {
        console.log('Opening additional windows...');
        
        // 単一のHTMLページに両方の機能を含める方法を試す
        // まずタイマーウィンドウを開く
        const timerFeatures = `width=${this.displays.vertical.width},height=${this.displays.vertical.height},left=${this.displays.main.width},top=0`;
        const blackFeatures = `width=${this.displays.macbook.width},height=${this.displays.macbook.height},left=0,top=${this.displays.main.height}`;
        
        // 両方のウィンドウを一度に開く試み
        try {
            // タイマーウィンドウ
            if (!this.timerWindow || this.timerWindow.closed) {
                console.log('Opening timer window...');
                this.timerWindow = window.open('timer.html?vertical=true', 'timerWindow', timerFeatures);
                
                if (this.timerWindow) {
                    console.log('Timer window opened successfully');
                    setTimeout(() => {
                        this.updateTimerWindow();
                        this.sendMessageToWindow(this.timerWindow, 'setVerticalMode');
                    }, 1000);
                }
            }
            
            // 黒画面ウィンドウ - タイマーと同時に開く
            if (!this.blackWindow1 || this.blackWindow1.closed) {
                console.log('Opening black window...');
                // 小さなトリック: about:blankを開いてから内容を書き込む
                this.blackWindow1 = window.open('about:blank', 'blackWindow1', blackFeatures);
                
                if (this.blackWindow1) {
                    // ウィンドウに直接黒画面のHTMLを書き込む
                    this.blackWindow1.document.write(`
                        <!DOCTYPE html>
                        <html lang="ja">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>集中モード - ブラックスクリーン</title>
                            <style>
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: #1a1a1a;
                                    min-height: 100vh;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    cursor: none;
                                    overflow: hidden;
                                }
                                .message {
                                    color: #333;
                                    font-size: 1.5rem;
                                    opacity: 0.1;
                                    user-select: none;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="message">集中モード実行中</div>
                            <script>
                                // ダブルクリックでフルスクリーン
                                document.body.addEventListener('dblclick', () => {
                                    if (!document.fullscreenElement) {
                                        document.documentElement.requestFullscreen().catch(err => {
                                            console.log('Fullscreen request failed:', err);
                                        });
                                    } else {
                                        document.exitFullscreen();
                                    }
                                });
                                
                                // カーソル自動非表示
                                let cursorTimeout;
                                function hideCursor() {
                                    document.body.style.cursor = 'none';
                                }
                                function showCursor() {
                                    document.body.style.cursor = 'default';
                                    clearTimeout(cursorTimeout);
                                    cursorTimeout = setTimeout(hideCursor, 2000);
                                }
                                document.addEventListener('mousemove', showCursor);
                                cursorTimeout = setTimeout(hideCursor, 2000);
                            </script>
                        </body>
                        </html>
                    `);
                    this.blackWindow1.document.close();
                    console.log('Black window 1 created successfully');
                } else {
                    console.error('Failed to open black window - trying alternative method');
                    this.showBlackScreenButton();
                }
            }
        } catch (error) {
            console.error('Error opening windows:', error);
            this.showBlackScreenButton();
        }
        
        // 追加の黒画面（必要に応じて）- 今は開かないようにする
        // コメント化して、2つのウィンドウのみ開くようにする
        /*
        if (!this.blackWindow2 || this.blackWindow2.closed) {
            // 別の位置に配置
            const blackFeatures2 = `width=800,height=600,left=${this.displays.main.width + this.displays.vertical.width},top=0`;
            console.log('Opening black window 2 with features:', blackFeatures2);
            this.blackWindow2 = window.open('black.html?display=secondary', 'blackWindow2', blackFeatures2);
            
            if (this.blackWindow2) {
                console.log('Black window 2 opened successfully');
            } else {
                console.error('Failed to open black window 2 - check popup blocker');
            }
        }
        */
        
        // Try to make windows fullscreen (user needs to allow this)
        setTimeout(() => {
            if (this.timerWindow && !this.timerWindow.closed) {
                this.sendMessageToWindow(this.timerWindow, 'requestFullscreen');
            }
            if (this.blackWindow1 && !this.blackWindow1.closed) {
                this.sendMessageToWindow(this.blackWindow1, 'requestFullscreen');
            }
            if (this.blackWindow2 && !this.blackWindow2.closed) {
                this.sendMessageToWindow(this.blackWindow2, 'requestFullscreen');
            }
        }, 1500);
    }

    updateTimerWindow() {
        if (this.timerWindow && !this.timerWindow.closed) {
            this.sendMessageToWindow(this.timerWindow, 'updateSettings', {
                workDuration: this.workDuration,
                breakDuration: this.breakDuration
            });
        }
    }

    sendMessageToWindow(targetWindow, action, data = {}) {
        if (targetWindow && !targetWindow.closed) {
            targetWindow.postMessage({ action, data }, '*');
        }
    }
    
    showBlackScreenButton() {
        // 既存のボタンがあれば削除
        const existingBtn = document.getElementById('manual-black-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // 手動で黒画面を開くボタンを追加
        const btn = document.createElement('button');
        btn.id = 'manual-black-btn';
        btn.className = 'secondary-btn';
        btn.style.marginTop = '1rem';
        btn.style.background = '#333';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.3rem;">dark_mode</span> 黒画面を手動で開く';
        
        btn.addEventListener('click', () => {
            const macbookFeatures = `width=${this.displays.macbook.width},height=${this.displays.macbook.height},left=0,top=${this.displays.main.height}`;
            this.blackWindow1 = window.open('about:blank', 'blackWindow1', macbookFeatures);
            
            if (this.blackWindow1) {
                // 黒画面のHTMLを直接書き込む
                this.blackWindow1.document.write(`
                    <!DOCTYPE html>
                    <html lang="ja">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>集中モード - ブラックスクリーン</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 0;
                                background: #1a1a1a;
                                min-height: 100vh;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                cursor: none;
                                overflow: hidden;
                            }
                            .message {
                                color: #333;
                                font-size: 1.5rem;
                                opacity: 0.1;
                                user-select: none;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="message">集中モード実行中</div>
                        <script>
                            document.body.addEventListener('dblclick', () => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    document.exitFullscreen();
                                }
                            });
                            let cursorTimeout;
                            function hideCursor() { document.body.style.cursor = 'none'; }
                            function showCursor() {
                                document.body.style.cursor = 'default';
                                clearTimeout(cursorTimeout);
                                cursorTimeout = setTimeout(hideCursor, 2000);
                            }
                            document.addEventListener('mousemove', showCursor);
                            cursorTimeout = setTimeout(hideCursor, 2000);
                        </script>
                    </body>
                    </html>
                `);
                this.blackWindow1.document.close();
                console.log('Black window opened manually');
                btn.remove();
            }
        });
        
        // ボタンをタイマー設定の後に追加
        const timerSettings = document.querySelector('.timer-settings');
        timerSettings.appendChild(btn);
    }
}

// Initialize the controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FocusModeController();
});