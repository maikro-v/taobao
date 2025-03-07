function generateTitles(data, {
    key: keyConfig = {  // 所有字段配置
        '植物名': 'primary',  // 主词标记
        '功能词': 'fill',     // 动态截断标记
        '属性词': 2,          // 选2个
        '场景词': 1,          // 选1个
        '促销词': 0           // 禁用
    },
    order = [], // 标题顺序
    maxLength = 30        // 最大字符数
} = {}) {
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const unique = arr => [...new Set(arr)].filter(Boolean);

    // 解析配置
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

    // 主词数据必须存在
    if (!libraries[mainKey]?.length) return [];

    return libraries[mainKey].map(mainTerm => {
        // 处理静态部分
        const staticParts = Object.fromEntries(
            staticKeys.map(key => {
                const count = keyConfig[key];
                const available = libraries[key] || [];
                const shuffled = shuffle(available);
                return [key, shuffled.slice(0, count).join('')];
            })
        );

        // 构建基础标题（预留动态空间）
        const baseParts = {
            [mainKey]: mainTerm,
            [dynamicKey]: '',
            ...staticParts
        };

        // 计算基础长度（按配置顺序）
        const baseStr = order
            .map(key => {
                if (key === dynamicKey) return '';
                return baseParts[key] || '';
            })
            .join('');
        
        let remaining = maxLength - baseStr.length;
        const selectedDynamic = [];

        // 处理动态部分
        if (libraries[dynamicKey]?.length && remaining > 0) {
            const shuffled = shuffle([...libraries[dynamicKey]]);
            
            for (const item of shuffled) {
                if (remaining <= 0) break;
                const available = remaining >= item.length 
                    ? item 
                    : item.substring(0, remaining);
                selectedDynamic.push(available);
                remaining -= available.length;
            }
        }

        // 组合最终标题
        const finalParts = {
            [mainKey]: mainTerm,
            [dynamicKey]: selectedDynamic.join(''),
            ...staticParts
        };

        return order
            .map(key => {
                if (key === dynamicKey) return finalParts[dynamicKey];
                return finalParts[key] || '';
            })
            .join('')
            .substring(0, maxLength);
    });
}