// 生成标题函数（新增属性词处理）
function generateTitles(data) {
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const plants = [...new Set(data['植物名'])];
    const functions = [...new Set(data['功能词'])].filter(Boolean);
    const attributes = [...new Set(data['属性词'] || [])].filter(Boolean); // 新增属性词处理
    const scenes = [...new Set(data['场景词'])].filter(Boolean);
    const promotions = [...new Set(data['促销词'])].filter(Boolean);
    
    const titles = [];

    for (const plant of plants) {
        // 随机选择非必须元素
        const [scene] = scenes.length ? shuffle(scenes).slice(0,1) : [''];
        const [promotion] = promotions.length ? shuffle(promotions).slice(0,1) : [''];
        const [attribute] = attributes.length ? shuffle(attributes).slice(0,1) : ['']; // 随机选择属性词
        
        // 构建基础标题（新增属性词）
        let base = plant + (attribute || '') + (scene || '') + (promotion || '');
        let remaining = 30 - base.length;
        
        // 动态选择功能词（支持截断）
        const shuffledFunc = shuffle([...functions]);
        const selectedFuncs = [];
        
        for (const func of shuffledFunc) {
            if (remaining <= 0) break;
            if (selectedFuncs.includes(func)) continue;
            
            if (remaining >= func.length) {
                selectedFuncs.push(func);
                remaining -= func.length;
            } else {
                const truncated = func.substring(0, remaining);
                selectedFuncs.push(truncated);
                remaining = 0;
            }
        }
        
        // 生成最终标题（结构：植物名+功能词+属性词+场景词+促销词）
        const title = plant 
            + selectedFuncs.join('')
            + (attribute || '')
            + (scene || '')
            + (promotion || '');
        
        titles.push(title);
    }
    return titles;
}