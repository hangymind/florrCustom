const PETAL_COUNT = getPetalsCount();
    
    const RARITY_COUNT = 9;
    let WasmVars = {};
    let Module;
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

    function u32(address, offset = 0) {
        return Module.HEAPU32[(address + offset) >> 2];
    }

    function unlockAllPetals() {
        
        console.log('当前 WasmVars:', WasmVars);
        console.log('当前 Module:', typeof Module !== 'undefined');
        
        if (!WasmVars.inventoryAddress) {
            console.log('未找到库存地址');
            showErrorPopup('未找到库存地址，请重试。');
            return;
        }

        try {
            console.log('[TuanchMod]开始解锁所有花瓣...');
            console.log('PETAL_COUNT:', PETAL_COUNT);
            console.log('RARITY_COUNT:', RARITY_COUNT);
            console.log('inventoryAddress:', WasmVars.inventoryAddress);
            
            for (let petal = 1; petal <= PETAL_COUNT; petal++) {
                for (let rarity = 0; rarity < RARITY_COUNT; rarity++) {
                    const offset = (petal * RARITY_COUNT + rarity) << 2;
                    Module.HEAPU32[(WasmVars.inventoryAddress + offset) >> 2] = 1000;
                }
            }
            console.log('[TuanchMod]DONE!');
            showSuccessPopup();
        } catch (e) {
            console.error('解锁花瓣失败:', e);
        }
    }

    function toRegex(x) {
        return new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/<PARAM>/g, '(.+)').replace(/<ANY>/g, '.+'));
    }

    function find(wat, x, keys) {
        console.log('使用模式搜索:', x);
        const regex = toRegex(x);
        console.log('生成的正则表达式:', regex);
        
        const matches = regex.exec(wat);
        if (!matches) {
            console.log('未找到模式');
            return false;
        }

        console.log('找到键:', keys);
        console.log('匹配:', matches[0]);
        console.log('组:', matches);

        for (let i = 1; i < matches.length; i++) {
            const key = keys[i - 1];
            let value = matches[i];
            const n = parseFloat(value);
            if (!isNaN(n)) value = n;
            WasmVars[key] = value;
            console.log('设置', key, '为', value);
        }
        return true;
    }

    async function editWasm(buffer) {
        console.log('开始编辑WASM...');
        
        await new Promise(resolve => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/wabt@1.0.37/index.min.js';
            script.onload = resolve;
            document.body.appendChild(script);
        });

        console.log('WABT加载完成，解析WASM...');
        const wabt = await WabtModule();
        const wasm = wabt.readWasm(buffer, {});
        wasm.generateNames();
        wasm.applyNames();

        console.log('将WASM转换为WAT...');
        const wat = wasm.toText({});
        console.log('WAT length:', wat.length);
        
        console.log('搜索库存地址...');
        const pattern = `i32.const 8\n      i32.shr_u\n      i32.add\n      i32.const 2\n      i32.shl\n      i32.const <PARAM>`;
        const found = find(wat, pattern, ['inventoryAddress']);
        
        if (!found) {
            console.log('尝试替代模式...');
            const altPatterns = [
                `i32.const 8\r\ni32.shr_u\r\ni32.add\r\ni32.const 2\r\ni32.shl\r\ni32.const <PARAM>`,
                `i32.const 8[\s\S]*?i32.shr_u[\s\S]*?i32.add[\s\S]*?i32.const 2[\s\S]*?i32.shl[\s\S]*?i32.const <PARAM>`,
                `i32\.const 8[\s\S]*?i32\.shr_u[\s\S]*?i32\.add[\s\S]*?i32\.const 2[\s\S]*?i32\.shl[\s\S]*?i32\.const (\d+)`
            ];
            
            for (const altPattern of altPatterns) {
                if (find(wat, altPattern, ['inventoryAddress'])) {
                    console.log('使用替代模式找到');
                    break;
                }
            }
        }

        if (!WasmVars.inventoryAddress) {
            const simpleMatch = wat.match(/i32\.const (\d+)/g);
            if (simpleMatch) {
                console.log('找到i32.const模式:', simpleMatch.slice(0, 5));
                for (let i = 0; i < Math.min(5, simpleMatch.length); i++) {
                    const value = parseInt(simpleMatch[i].match(/i32\.const (\d+)/)[1]);
                    if (value > 0) {
                        WasmVars.inventoryAddress = value;
                        console.log('使用备用库存地址:', value);
                        break;
                    }
                }
            }
        }

        console.log('获取到背包基址', WasmVars.inventoryAddress);
        
        
        return wabt.parseWat('x', wat).toBinary({}).buffer;
    }

    const _instantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function (response, imports) {
        try {
            const buffer = await response.clone().arrayBuffer();
            
            await editWasm(buffer);
            console.log('WASM处理成功');
        } catch (error) {
            console.error('WASM编辑失败:', error);
        }
        return _instantiateStreaming(response, imports);
    };

    const _instantiate = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(buffer, imports) {
        try {
            console.log('处理WASM...');
            await editWasm(buffer);
            console.log('WASM处理成功');
        } catch (error) {
            console.error('WASM编辑失败:', error);
        }
        return _instantiate(buffer, imports);
    };

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
                    }
                ]
            });

            

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
