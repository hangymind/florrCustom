// ==UserScript==
// @name         Florr.io BetterBetterflorr
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make Betterflorr Better
// @author       Tuanch
// @match        https://florr.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PETAL_COUNT = getPetalsCount();
    
    const RARITY_COUNT = 9;
    
    let Module;
    window.addEventListener('load', checkBetterFlorr);
    //require BetterFlorr
    function grapBfSettings(){
        try {
            const betterflorrUserSettings = betterflorr.api.get.settings();
            console.log('获取到BetterFlorr设置:', betterflorrUserSettings);
            
            const jsonString = JSON.stringify(betterflorrUserSettings, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `betterflorr-settings-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('有关导入设置：目前bf开发者没有提供导入功能，您可以手动导入设置');
            console.log('BetterFlorr设置已保存并下载');
            showSuccessPopup('设置已保存并下载');
        } catch (error) {
            console.error('保存BetterFlorr设置失败:', error);
            showErrorPopup('保存设置失败');
        }
    }
     function checkBetterFlorr() {
        if (location.hostname === 'betterflorr.top') return;
        
        if (typeof window.BetterFlorr === 'undefined' && typeof window.betterFlorr === 'undefined') {
            if (confirm('免责声明：任何插件都不会对您的账号安全负责，是否前往查看Florr.io账户协议')) {
                location.href = 'https://florr.io/tos.txt';
            }
        }
    }
    function readVarUint32(arr) {
        let idx = 0, res = 0;
        do res |= (arr[idx] & 0b01111111) << idx * 7;
        while (arr[idx++] & 0b10000000);
        return [idx, res];
    }

    async function fetchWasmBytes() {
        const response = await fetch(`https://static.florr.io/${window.versionHash}/client.wasm`);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }
    function getPetalsCount() {
    try {
        if (typeof betterflorr?.api?.florrio?.utils?.getPetals !== 'function') {
            console.error('getPetals 方法不存在，请检查方法路径是否正确');
            return 0;
        }

        const petalsData = betterflorr.api.florrio.utils.getPetals();

        let count = 0;
        if (Array.isArray(petalsData)) {
            count = petalsData.length;
        } else if (petalsData && typeof petalsData === 'object') {
            count = Object.keys(petalsData).length;
        } else if (petalsData === null || petalsData === undefined) {
            console.warn('getPetals 返回值为空');
        } else {
            count = 1;
        }

        console.log(`获取到花瓣种类总数${count}`);
        return count;

    } catch (error) {
        console.error('失败：', error);
        return 0;
    }
    }    
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Ubuntu-Bold';
                src: url('https://static.florr.io/0523e8560eb8053ecf0a0a2b607d8eb5e621e1e2/Ubuntu-B.ttf') format('truetype');
                font-weight: bold;
                font-style: normal;
            }
            .unlock-button {
                position: fixed;
                bottom: 10px;
                right: 10px;
                padding: 10px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 9999;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: background-color 0.3s;
                font-family: 'Ubuntu-Bold', Arial, sans-serif;
            }
            .unlock-button:hover {
                background-color: #45a049;
            }
            .success-popup {
                position: fixed;
                top: 0;
                right: -100%;
                background-color: rgba(0,0,0,0.8);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 10000;
                font-size: 16px;
                font-weight: bold;
                transition: right 1s ease;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                font-family: 'Ubuntu-Bold', Arial, sans-serif;
            }
            .success-popup.show {
                right: 0;
            }
            .overlay {
                position: fixed;
                top: 0;
                right: -100%;
                background-color: rgba(31, 107, 64, 0.3);
                z-index: 9999;
                transition: right 1s ease;
                border-radius: 8px;
                pointer-events: none;
            }
            .overlay.show {
                right: 0;
            }
            .music-control-panel {
                position: fixed;
                bottom: 70px;
                right: 10px;
                background-color: rgba(0,0,0,0.8);
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 9998;
                font-family: 'Ubuntu-Bold', Arial, sans-serif;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                min-width: 250px;
            }
            .music-control-panel.hidden {
                display: none;
            }
            .music-control-panel h3 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 16px;
                text-align: center;
            }
            .music-control-buttons {
                display: flex;
                justify-content: space-around;
                margin-bottom: 10px;
            }
            .music-control-button {
                background-color: #2ECC71;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            .music-control-button:hover {
                background-color: #27AE60;
            }
            .music-control-panel {
                cursor: move;
                user-select: none;
            }
            .music-volume-control {
                margin-top: 10px;
                display: flex;
                align-items: center;
            }
            .music-volume-control label {
                margin-right: 10px;
                font-size: 14px;
            }
            .music-volume-control input {
                flex: 1;
            }
            .music-list {
                max-height: 200px;
                overflow-y: auto;
                margin-bottom: 10px;
            }
            .music-item {
                padding: 5px;
                border-bottom: 1px solid rgba(255,255,255,0.2);
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .music-item:hover {
                background-color: rgba(255,255,255,0.1);
            }
            .music-item.active {
                background-color: rgba(76, 175, 80, 0.3);
            }
            .music-progress {
                width: 100%;
                margin-bottom: 10px;
                -webkit-appearance: none;
                appearance: none;
                height: 6px;
                border-radius: 3px;
                background: rgba(255,255,255,0.1);
                outline: none;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            }
            .music-progress::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #2ECC71;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .music-progress::-webkit-slider-thumb:hover {
                background: #27AE60;
                transform: scale(1.1);
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            }
            .music-progress::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #2ECC71;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .music-progress::-moz-range-thumb:hover {
                background: #27AE60;
                transform: scale(1.1);
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            }
            #music-volume {
                -webkit-appearance: none;
                appearance: none;
                height: 5px;
                border-radius: 3px;
                background: rgba(255,255,255,0.1);
                outline: none;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            }
            #music-volume::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #2ECC71;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            #music-volume::-webkit-slider-thumb:hover {
                background: #27AE60;
                transform: scale(1.1);
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            }
            #music-volume::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #2ECC71;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            #music-volume::-moz-range-thumb:hover {
                background: #27AE60;
                transform: scale(1.1);
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            }
            .music-list::-webkit-scrollbar {
                width: 4px;
            }
            .music-list::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 2px;
            }
            .music-list::-webkit-scrollbar-thumb {
                background: rgba(46, 204, 113, 0.4);
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            .music-list::-webkit-scrollbar-thumb:hover {
                background: rgba(46, 204, 113, 0.6);
            }
            .music-list {
                scrollbar-width: thin;
                scrollbar-color: rgba(46, 204, 113, 0.4) rgba(255,255,255,0.05);
            }
            .music-info {
                font-size: 12px;
                text-align: center;
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    function showSuccessPopup() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.textContent = 'Made By Tuanch';
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
            setTimeout(() => {
                const rect = popup.getBoundingClientRect();
                overlay.style.width = rect.width + 'px';
                overlay.style.height = rect.height + 'px';
                overlay.classList.add('show');
            }, 200);
        }, 100);

        setTimeout(() => {
            overlay.classList.remove('show');
            popup.classList.remove('show');
        }, 4000);

        setTimeout(() => {
            overlay.remove();
            popup.remove();
        }, 5000);
    }

    function showErrorPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.style.backgroundColor = 'rgba(255,0,0,0.8)';
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 1000);
        }, 4000);
    }

   

    async function unlockAllPetals() {
        
        const inventoryAddress = await getInventoryBaseAddress();

        try {
            console.log('[TuanchMod]开始解锁所有花瓣...');
            console.log('PETAL_COUNT:', PETAL_COUNT);
            console.log('RARITY_COUNT:', RARITY_COUNT);
            console.log('inventoryAddress:', inventoryAddress);
            
            for (let petal = 0; petal < PETAL_COUNT*9; petal++) {        
                    Module.HEAPU32[inventoryAddress+petal] = 1000;
            }
            console.log('[TuanchMod]DONE!');
            showSuccessPopup();
        } catch (e) {
            console.error('解锁花瓣失败:', e);
        }
    }
    async function getInventoryBaseAddress() {
        try {
            const arr = await fetchWasmBytes();
            const addrs = [];
            
            for (let i = 0; i < arr.length; i++) {
                let j = i;
                if (arr[j++] !== 0x41) continue; // i32.const
                if (arr[j++] !== 1) continue;    // 1
                if (arr[j++] !== 0x3a) continue; // i32.store8
                if (arr[j++] !== 0) continue;    // align=0
                if (arr[j++] !== 0) continue;    // offset=0
                if (arr[j++] !== 0x41) continue; // i32.const
                const [offset, addr] = readVarUint32(arr.subarray(j));
                j += offset;
                if (arr[j++] !== 0x41) continue; // i32.const
                if (arr[j++] !== 5) continue;    // 5
                if (arr[j++] !== 0x36) continue; // i32.store
                if (arr[j++] !== 2) continue;    // align=2
                if (arr[j++] !== 0) continue;    // offset=0
                addrs.push(addr >> 2);
            }
            
            if (addrs.length === 1) {
                return addrs[0];
            } else if (addrs.length === 0) {
                showErrorPopup('未找到库存地址');
            } else {
                console.warn('Multiple addresses found, using first:', addrs);
                return addrs[0];
            }
        } catch (error) {
            showErrorPopup('获取库存地址失败');
            throw error;
        }
    }
    function init() {
        if (typeof window.Module !== 'undefined') {
            Module = window.Module;
            console.log('[TuanchMod]初始化完成');
        } else {
            setTimeout(init, 1000);
        }
    }

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    
                    showSuccessPopup('通知权限已授予');
                    setupSuperPingNotification();
                } else {
                    
                    showErrorPopup('通知权限被拒绝，请在浏览器设置中允许通知');
                }
            });
        } else {
            
            showErrorPopup('浏览器不支持通知');
        }
    }

    function setupSuperPingNotification() {
        if (typeof window.betterflorr !== 'undefined') {
            betterflorr.on('superping', (data) => {
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    const title = 'Super Spawned!';
                    const options = {
                        body: `mob: ${data.mob_id}\nserver: ${data.region}\nmap: ${data.locations?.[0]?.map || '未知'}`,
                        icon: 'https://florr.io/favicon.ico',
                        badge: 'https://florr.io/favicon.ico',
                        silent: false
                    };
                    
                    try {
                        new Notification(title, options);
                        
                    } catch (error) {
                        showErrorPopup(error);
                    }
                }
            });
        }
    }

    // Music-related variables and functions
    let musicFiles = [];
    let currentMusicIndex = -1;
    let audioElement = null;
    let musicControlPanel = null;
    let autoChangeSongOnMapChange = false;

    function importLocalMusic() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                musicFiles = [...musicFiles, ...files];
                showSuccessPopup(`成功导入 ${files.length} 首音乐`);
                updateMusicList();
            }
        };
        input.click();
    }

    function toggleMusicControlPanel() {
        if (!musicControlPanel) {
            createMusicControlPanel();
        } else {
            musicControlPanel.classList.toggle('hidden');
        }
    }

    function createMusicControlPanel() {
        musicControlPanel = document.createElement('div');
        musicControlPanel.className = 'music-control-panel';
        
        musicControlPanel.innerHTML = `
            <h3>音乐控制面板</h3>
            <div class="music-info" id="music-info">未播放音乐</div>
            <input type="range" class="music-progress" id="music-progress" min="0" max="100" value="0">
            <div class="music-control-buttons">
                <button class="music-control-button" id="prev-button">上一首</button>
                <button class="music-control-button" id="play-pause-button">播放</button>
                <button class="music-control-button" id="next-button">下一首</button>
            </div>
            <div class="music-volume-control">
                <label for="music-volume">音量:</label>
                <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.7">
            </div>
            <div class="music-list" id="music-list">
                ${musicFiles.map((file, index) => `
                    <div class="music-item ${index === currentMusicIndex ? 'active' : ''}" data-index="${index}">
                        ${file.name}
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(musicControlPanel);
        
        // Add event listeners
        document.getElementById('prev-button').addEventListener('click', playPreviousMusic);
        document.getElementById('play-pause-button').addEventListener('click', togglePlayPause);
        document.getElementById('next-button').addEventListener('click', playNextMusic);
        document.getElementById('music-progress').addEventListener('input', seekMusic);
        document.getElementById('music-volume').addEventListener('input', adjustVolume);
        
        const musicList = document.getElementById('music-list');
        if (musicList) {
            musicList.addEventListener('click', (e) => {
                const musicItem = e.target.closest('.music-item');
                if (musicItem) {
                    const index = parseInt(musicItem.dataset.index);
                    playMusic(index);
                }
            });
        }
        
        // Make panel draggable
        makeDraggable(musicControlPanel);
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const header = element.querySelector('h3');
        if (header) {
            header.style.cursor = 'move';
            header.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = (element.offsetTop - pos2);
            const newLeft = (element.offsetLeft - pos1);
            
            // Keep panel within window bounds
            const maxTop = window.innerHeight - element.offsetHeight;
            const maxLeft = window.innerWidth - element.offsetWidth;
            
            element.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
            element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }
        
        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function adjustVolume() {
        if (!audioElement) return;
        
        const volumeControl = document.getElementById('music-volume');
        if (volumeControl) {
            const volume = parseFloat(volumeControl.value);
            audioElement.volume = volume;
        }
    }

    function updateMusicList() {
        if (musicControlPanel) {
            const musicList = document.getElementById('music-list');
            if (musicList) {
                musicList.innerHTML = musicFiles.map((file, index) => `
                    <div class="music-item ${index === currentMusicIndex ? 'active' : ''}" data-index="${index}">
                        ${file.name}
                    </div>
                `).join('');
            }
        }
    }

    function playMusic(index) {
        if (index < 0 || index >= musicFiles.length) return;
        
        currentMusicIndex = index;
        
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
        }
        
        audioElement = new Audio(URL.createObjectURL(musicFiles[index]));
        audioElement.play();
        
        updateMusicInfo();
        updateMusicList();
        
        audioElement.addEventListener('timeupdate', updateMusicProgress);
        audioElement.addEventListener('ended', playNextMusic);
    }

    function togglePlayPause() {
        if (!audioElement) return;
        
        if (audioElement.paused) {
            audioElement.play();
            document.getElementById('play-pause-button').textContent = '暂停';
        } else {
            audioElement.pause();
            document.getElementById('play-pause-button').textContent = '播放';
        }
    }

    function playPreviousMusic() {
        if (musicFiles.length === 0) return;
        
        currentMusicIndex = (currentMusicIndex - 1 + musicFiles.length) % musicFiles.length;
        playMusic(currentMusicIndex);
    }

    function playNextMusic() {
        if (musicFiles.length === 0) return;
        
        currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
        playMusic(currentMusicIndex);
    }

    function updateMusicInfo() {
        if (currentMusicIndex >= 0 && currentMusicIndex < musicFiles.length) {
            const musicInfo = document.getElementById('music-info');
            if (musicInfo) {
                musicInfo.textContent = `当前播放: ${musicFiles[currentMusicIndex].name}`;
            }
        }
    }

    function updateMusicProgress() {
        if (!audioElement) return;
        
        const progress = document.getElementById('music-progress');
        if (progress) {
            const value = (audioElement.currentTime / audioElement.duration) * 100;
            progress.value = value;
        }
    }

    function seekMusic() {
        if (!audioElement) return;
        
        const progress = document.getElementById('music-progress');
        if (progress) {
            const value = parseFloat(progress.value);
            audioElement.currentTime = (value / 100) * audioElement.duration;
        }
    }

    function toggleAutoChangeSongOnMapChange() {
        autoChangeSongOnMapChange = !autoChangeSongOnMapChange;
        
        if (autoChangeSongOnMapChange) {
            showSuccessPopup('地图切换自动切歌已开启');
            
            if (typeof window.betterflorr !== 'undefined') {
                betterflorr.on('mapchange', () => {
                    if (autoChangeSongOnMapChange) {
                        playNextMusic();
                    }
                });
            }
        } else {
            showSuccessPopup('地图切换自动切歌已关闭');
        }
    }

    function registerFeatureGroup() {
        if (typeof window.betterflorr !== 'undefined') {
            betterflorr.registerFeatureGroup('settings', {
                id: 'Tuanch',
                title: 'TMod',
                settings: [
                    {
                        id: 'unlockPetals',
                        name: '解锁全部花瓣',
                        type: 'button',
                        buttonText: '点我',
                        function:()=>{
                            unlockAllPetals();
                        }
                    },
                    {
                        id: 'fakeSuperPing',
                        name: '虚假super播报',
                        type: 'button',
                        buttonText: 'boolean坏了我来代替',
                        function:()=>{
                            fakesp();
                        }
                    },
                    {
                        id:'saveSettings',
                        name:'保存bf设置',
                        type:'button',
                        buttonText:'保存',
                        function:()=>{
                            grapBfSettings();
                        }
                    },
                    {
                        id:'changePageZoom',
                        name:'更改sp页面缩放(实验)',
                        type:'button',
                        buttonText:'更改缩放',
                        function:()=>{
                            changeScreen();
                        }
                    },
                    {
                        id:'superPingNotification',
                        name:'SuperPing通知模式',
                        type:'button',
                        buttonText:'boolean坏了我来代替',
                        function:()=>{
                            requestNotificationPermission();
                        }
                    },
                    {
                        id:'apiDocs',
                        name:'BetterflorrAPI文档',
                        type:'button',
                        buttonText:'访问网站',
                        function:()=>{
                            window.open('https://bfdocs.netlify.app/','_blank');
                        }
                    }
                ]
            });
            betterflorr.registerFeatureGroup('settings', {
                id: 'imusic',
                title: '音乐相关',
                settings: [
                    {
                        id: 'importMusic',
                        name: '导入本地音乐',
                        type: 'button',
                        buttonText: '导入音乐',
                        function:()=>{
                            importLocalMusic();
                        }
                    },
                    {
                        id: 'musicControl',
                        name: '音乐控制面板',
                        type: 'button',
                        buttonText: '打开面板',
                        function:()=>{
                            toggleMusicControlPanel();
                        }
                    },
                    {
                        id: 'autoChangeSongOnMapChange',
                        name: '地图切换自动切歌',
                        type: 'button',
                        buttonText: 'boolean坏了我来代替',
                        function:()=>{
                            toggleAutoChangeSongOnMapChange();
                        }
                    }
                ]
            });
            function changeScreen(){
                const zoom = prompt('请输入页面缩放百分比（例如：150 表示 150%）：');
                            if (zoom) {
                                const zoomValue = parseFloat(zoom);
                                if (!isNaN(zoomValue) && zoomValue > 0) {
                                    document.body.style.transform = `scale(${zoomValue / 100})`;
                                    document.body.style.transformOrigin = 'top left';
                                    document.body.style.width = `${100 / (zoomValue / 100)}%`;
                                    document.body.style.height = `${100 / (zoomValue / 100)}%`;
                                    showSuccessPopup(`页面已缩放到 ${zoomValue}%`);
                                } else {
                                    showErrorPopup('请输入有效的数字');
                                }
                            }
            }
            function fakesp(){
            let fakeSuperPingInterval;
            betterflorr.on('feature:Tuanch/fakeSuperPing', (data) => {
                console.log('虚假super播报设置改变:', data.value);
                if (data.value) {
                    const mobIds = ['M28', '团子', '牢大', '大蛇',"Bed"];
                    const regions = ['AS', 'NA', 'EU',"南极洲","三体星系"];
                    const maps = ['Garden', 'Desert', 'Jungle', 'Savana','Ocean',"Bedroom"];
                    const serverIds = ['何以为', '你进不去', 'M28至臻卧室', '114514'];
                    
                    function sendFakeSuperPing() {
                        if (window.betterflorr && betterflorr.api && betterflorr.api.set) {
                            const mobId = mobIds[Math.floor(Math.random() * mobIds.length)];
                            const region = regions[Math.floor(Math.random() * regions.length)];
                            const map = maps[Math.floor(Math.random() * maps.length)];
                            const serverId = serverIds[Math.floor(Math.random() * serverIds.length)];
                            
                            const fakeData = {
                                mob_id: mobId,
                                type: 'possible',
                                region: region,
                                locations: [{ map: map, serverId: serverId }]
                            };
                            betterflorr.api.set.show(fakeData);
                        }
                    }
                    
                    sendFakeSuperPing();
                    
                    fakeSuperPingInterval = setInterval(() => {
                        const randomTime = Math.floor(Math.random() * 30000) + 10000; // 10-40秒随机
                        setTimeout(sendFakeSuperPing, randomTime);
                    }, 40000);
                } else {
                    console.log('关闭虚假super播报...');
                    if (fakeSuperPingInterval) {
                        clearInterval(fakeSuperPingInterval);
                    }
                }
            });
        }
            betterflorr.on('feature:changed', (data) => {
                console.log('Feature changed:', data);
            });
            console.log('Feature group registered successfully');
        } else {
            setTimeout(registerFeatureGroup, 1000);
        }
    }

    addStyles();
    init();
    registerFeatureGroup();
})();
