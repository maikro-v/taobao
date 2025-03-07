function generateTitles(data, {
    key: keyConfig = { 
        '植物名': 'primary',
        '功能词': 'fill',
        '属性词': 2,
        '场景词': 1,
        '促销词': 0
    },
    order = ['植物名', '功能词', '属性词', '场景词'],
    maxLength = 30,
    insertStrategy = { 
        interval: 2,    
        insertKeys: ['属性词']
    }
} = {}) {
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const unique = arr => [...new Set(arr)].filter(Boolean);

    // 解析核心配置
    const mainKey = Object.keys(keyConfig).find(k => keyConfig[k] === 'primary');
    const dynamicKey = Object.keys(keyConfig).find(k => keyConfig[k] === 'fill');
    const staticKeys = Object.keys(keyConfig).filter(k => 
        typeof keyConfig[k] === 'number' && keyConfig[k] > 0
    );
    
    // 构建词库映射
    const libraries = Object.fromEntries(
        [mainKey, dynamicKey, ...staticKeys].map(key => [
            key,
            unique(data[key] || [])
        ])
    );

    if (!libraries[mainKey]?.length) return [];

    return libraries[mainKey].map(mainTerm => {
        // 处理静态部分（保存原始数组）
        const staticParts = Object.fromEntries(
            staticKeys.map(key => {
                const count = keyConfig[key];
                const available = libraries[key] || [];
                const shuffled = shuffle(available);
                return [key, shuffled.slice(0, count)]; // 保存数组而非字符串
            })
        );

        // 构建基础标题（预留动态空间）
        const baseParts = {
            [mainKey]: mainTerm,
            [dynamicKey]: '',
            ...Object.fromEntries(
                Object.entries(staticParts).map(([k, v]) => [k, v.join('')])
            )
        };

        // 计算基础长度
        const baseStr = order
            .map(key => 
                key === dynamicKey ? '' : baseParts[key] || ''
            )
            .join('');
        
        let remaining = maxLength - baseStr.length;
        const selectedDynamic = [];
        let insertIndex = 0;

        // 准备插入词队列（深拷贝避免污染原始数据）
        const insertQueue = insertStrategy.insertKeys
            .flatMap(key => [...(staticParts[key] || [])])
            .filter(Boolean);

        // 处理动态部分（含插入逻辑）
        if (libraries[dynamicKey]?.length && remaining > 0) {
            const shuffled = shuffle([...libraries[dynamicKey]]);
            
            for (const item of shuffled) {
                if (remaining <= 0) break;

                // 执行插入策略
                if (insertStrategy.interval > 0 
                    && insertQueue.length > 0
                    && selectedDynamic.length % (insertStrategy.interval + 1) === insertStrategy.interval
                ) {
                    const insertWord = insertQueue.shift();
                    if (insertWord) {
                        // 从对应静态字段中移除已插入的词
                        insertStrategy.insertKeys.some(key => {
                            const idx = staticParts[key]?.indexOf(insertWord);
                            if (idx !== -1) {
                                staticParts[key].splice(idx, 1);
                                return true;
                            }
                            return false;
                        });
                        
                        selectedDynamic.push(insertWord);
                        remaining -= insertWord.length;
                        if (remaining <= 0) break;
                    }
                }

                // 添加功能词
                const available = remaining >= item.length 
                    ? item 
                    : item.substring(0, remaining);
                selectedDynamic.push(available);
                remaining -= available.length;
            }

            // 处理剩余插入词
            while (insertQueue.length > 0 && remaining > 0) {
                const insertWord = insertQueue.shift();
                if (insertWord) {
                    insertStrategy.insertKeys.some(key => {
                        const idx = staticParts[key]?.indexOf(insertWord);
                        if (idx !== -1) {
                            staticParts[key].splice(idx, 1);
                            return true;
                        }
                        return false;
                    });
                    
                    if (insertWord.length <= remaining) {
                        selectedDynamic.push(insertWord);
                        remaining -= insertWord.length;
                    } else {
                        selectedDynamic.push(insertWord.substring(0, remaining));
                        remaining = 0;
                    }
                }
            }
        }

        // 组合最终标题（重新生成静态部分）
        const finalStaticParts = Object.fromEntries(
            Object.entries(staticParts).map(([k, v]) => [k, v.join('')])
        );

        const finalParts = {
            [mainKey]: mainTerm,
            [dynamicKey]: selectedDynamic.join(''),
            ...finalStaticParts
        };

        return order
            .map(key => finalParts[key] || '')
            .join('')
            .substring(0, maxLength);
    });
}