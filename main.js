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
    }

    bindEvents() {
        this.focusModeBtn.addEventListener('click', () => this.startFocusMode());
        this.normalModeBtn.addEventListener('click', () => this.endFocusMode());
        
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
        
        this.openAdditionalWindows();
    }

    endFocusMode() {
        this.isInFocusMode = false;
        this.focusModeBtn.style.display = 'block';
        this.normalModeBtn.style.display = 'none';
        
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

    openAdditionalWindows() {
        console.log('Opening additional windows...');
        
        // まずタイマーウィンドウを開く
        if (!this.timerWindow || this.timerWindow.closed) {
            // メインディスプレイの右側に配置すると仮定
            const timerFeatures = `width=${this.displays.vertical.width},height=${this.displays.vertical.height},left=${this.displays.main.width},top=0`;
            console.log('Opening timer window with features:', timerFeatures);
            this.timerWindow = window.open('timer.html?vertical=true', 'timerWindow', timerFeatures);
            
            if (this.timerWindow) {
                console.log('Timer window opened successfully');
                // Wait for window to load then send settings
                setTimeout(() => {
                    this.updateTimerWindow();
                    this.sendMessageToWindow(this.timerWindow, 'setVerticalMode');
                }, 1000);
            } else {
                console.error('Failed to open timer window - check popup blocker');
                alert('ポップアップがブロックされています。ブラウザの設定でこのサイトのポップアップを許可してください。');
                return;
            }
        }
        
        // 少し遅延させて黒画面を開く（ポップアップブロッカー回避）
        setTimeout(() => {
            if (!this.blackWindow1 || this.blackWindow1.closed) {
                // メインディスプレイの下に配置すると仮定
                const macbookFeatures = `width=${this.displays.macbook.width},height=${this.displays.macbook.height},left=0,top=${this.displays.main.height}`;
                console.log('Opening black window 1 with features:', macbookFeatures);
                this.blackWindow1 = window.open('black.html?display=macbook', 'blackWindow1', macbookFeatures);
                
                if (this.blackWindow1) {
                    console.log('Black window 1 opened successfully');
                } else {
                    console.error('Failed to open black window 1 - check popup blocker');
                    // 黒画面が開けない場合は、手動で開くボタンを表示
                    this.showManualOpenButton();
                }
            }
        }, 500);
        
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
    
    showManualOpenButton() {
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
        btn.textContent = '🖤 黒画面を手動で開く';
        
        btn.addEventListener('click', () => {
            const macbookFeatures = `width=${this.displays.macbook.width},height=${this.displays.macbook.height},left=0,top=${this.displays.main.height}`;
            this.blackWindow1 = window.open('black.html?display=macbook', 'blackWindow1', macbookFeatures);
            
            if (this.blackWindow1) {
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