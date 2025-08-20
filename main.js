class FocusModeController {
    constructor() {
        this.isInFocusMode = false;
        this.timerWindow = null;
        this.blackWindow = null;
        this.workDuration = 25;
        this.breakDuration = 5;
        
        this.initializeElements();
        this.bindEvents();
        this.updateScreenInfo();
    }

    initializeElements() {
        this.focusModeBtn = document.getElementById('focus-mode-btn');
        this.normalModeBtn = document.getElementById('normal-mode-btn');
        this.workDurationInput = document.getElementById('work-duration');
        this.breakDurationInput = document.getElementById('break-duration');
        this.openWindowsBtn = document.getElementById('open-windows-btn');
        this.screenList = document.getElementById('screen-list');
    }

    bindEvents() {
        this.focusModeBtn.addEventListener('click', () => this.startFocusMode());
        this.normalModeBtn.addEventListener('click', () => this.endFocusMode());
        this.openWindowsBtn.addEventListener('click', () => this.openAdditionalWindows());
        
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
            if (this.blackWindow && !this.blackWindow.closed) {
                this.blackWindow.close();
            }
        });
    }

    updateScreenInfo() {
        const screenInfo = `
            <div class="screen-item">
                メインディスプレイ: ${window.screen.width} x ${window.screen.height}
            </div>
            <div class="screen-item">
                利用可能な画面領域: ${window.screen.availWidth} x ${window.screen.availHeight}
            </div>
        `;
        this.screenList.innerHTML = screenInfo;
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
        if (this.blackWindow && !this.blackWindow.closed) {
            this.blackWindow.close();
        }
    }

    openAdditionalWindows() {
        // Open timer window
        if (!this.timerWindow || this.timerWindow.closed) {
            const timerFeatures = 'width=800,height=600,left=0,top=0';
            this.timerWindow = window.open('timer.html', 'timerWindow', timerFeatures);
            
            // Wait for window to load then send settings
            setTimeout(() => {
                this.updateTimerWindow();
            }, 1000);
        }
        
        // Open black screen window
        if (!this.blackWindow || this.blackWindow.closed) {
            const screenWidth = window.screen.availWidth;
            const blackFeatures = `width=800,height=600,left=${screenWidth - 800},top=0`;
            this.blackWindow = window.open('black.html', 'blackWindow', blackFeatures);
        }
        
        // Try to make windows fullscreen (user needs to allow this)
        setTimeout(() => {
            if (this.timerWindow && !this.timerWindow.closed) {
                this.sendMessageToWindow(this.timerWindow, 'requestFullscreen');
            }
            if (this.blackWindow && !this.blackWindow.closed) {
                this.sendMessageToWindow(this.blackWindow, 'requestFullscreen');
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
}

// Initialize the controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FocusModeController();
});