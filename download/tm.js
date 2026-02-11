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

    function registerFeatureGroup() {
        if (typeof window.betterflorr !== 'undefined') {
            betterflorr.registerFeatureGroup('settings', {
                id: 'Tuanch',
                title: 'Tuanch',
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
                    }
                ]
            });
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
