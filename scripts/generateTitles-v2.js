/**
 * 生成标题数组，根据给定的数据和配置生成多个标题。
 * 
 * @param {Object} data - 包含各种数据的对象，键为 '植物名', '功能词', '属性词', '场景词', '促销词'。
 * @param {Object} [options] - 配置选项对象。
 * @param {string} [options.dynamicPart='function'] - 动态部分的类型，可选值为 'function', 'attribute', 'scene', 'promotion'。
 * @param {string[]} [options.order=['plant', 'function', 'attribute', 'scene', 'promotion']] - 标题各部分的组合顺序。
 * @returns {string[]} - 生成的标题数组。
 */
function generateTitles(data, {
    dynamicPart = 'function', 
    order = ['plant', 'function', 'attribute', 'scene', 'promotion']
} = {}) {
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const plants = [...new Set(data['植物名'] || [])];
    const functions = [...new Set(data['功能词'] || [])].filter(Boolean);
    const attributes = [...new Set(data['属性词'] || [])].filter(Boolean);
    const scenes = [...new Set(data['场景词'] || [])].filter(Boolean);
    const promotions = [...new Set(data['促销词'] || [])].filter(Boolean);

    const titles = [];

    for (const plant of plants) {
        // 随机选择非动态部分（每个类型选1个）
        const [scene] = scenes.length ? shuffle(scenes).slice(0, 1) : [''];
        const [promotion] = promotions.length ? shuffle(promotions).slice(0, 1) : [''];
        const [attribute] = attributes.length ? shuffle(attributes).slice(0, 1) : [''];
        const [func] = functions.length ? shuffle(functions).slice(0, 1) : [''];

        // 构建基础标题（动态部分留空）
        const baseParts = {
            plant: plant,
            function: dynamicPart === 'function' ? '' : func,
            attribute: dynamicPart === 'attribute' ? '' : attribute,
            scene: dynamicPart === 'scene' ? '' : scene,
            promotion: dynamicPart === 'promotion' ? '' : promotion
        };

        // 计算基础标题长度
        const baseStr = order.map(key => baseParts[key]).join('');
        let remaining = 30 - baseStr.length;
        const selectedDynamic = [];

        // 处理动态部分
        const dynamicPool = {
            function: functions,
            attribute: attributes,
            scene: scenes,
            promotion: promotions
        }[dynamicPart] || [];

        if (dynamicPool.length > 0 && remaining > 0) {
            const shuffled = shuffle([...dynamicPool]);
            
            for (const item of shuffled) {
                if (remaining <= 0) break;
                
                if (remaining >= item.length) {
                    selectedDynamic.push(item);
                    remaining -= item.length;
                } else {
                    const truncated = item.substring(0, remaining);
                    selectedDynamic.push(truncated);
                    remaining = 0;
                }
            }
        }

        // 构建最终标题
        const finalParts = {
            plant: plant,
            function: dynamicPart === 'function' ? selectedDynamic.join('') : func,
            attribute: dynamicPart === 'attribute' ? selectedDynamic.join('') : attribute,
            scene: dynamicPart === 'scene' ? selectedDynamic.join('') : scene,
            promotion: dynamicPart === 'promotion' ? selectedDynamic.join('') : promotion
        };

        // 按配置顺序组合
        const title = order
            .map(key => finalParts[key] || '')
            .join('')
            .substring(0, 30); // 双重保障截断

        titles.push(title);
    }
    return titles;
}