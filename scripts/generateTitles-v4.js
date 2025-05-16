/**
 * 根据给定的数据和配置生成标题列表。
 * @param {Object} data - 包含用于生成标题的数据源对象。
 * @param {Object} options - 配置选项对象。
 * @param {Object} [options.key={}] - 键配置对象，指定不同类型的键及其权重。
 * @param {Array} [options.order=[]] - 标题中各部分的排列顺序。
 * @param {number} [options.maxLength=30] - 生成标题的最大长度。
 * @param {Object} [options.insetRule] - 插入规则对象，用于在特定位置插入内容。
 * @returns {Array} - 生成的标题列表。
 */
function generateTitles(source, {
    key: keyConfig = {},
    order = [],
    maxLength = 30,
    insetRule
} = {}) {
    const data = source instanceof Map ? Object.fromEntries(source) : source;

    // 定义一个洗牌函数，用于随机打乱数组元素的顺序
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    // 定义一个去重函数，用于去除数组中的重复元素并过滤掉空值
    const unique = arr => [...new Set(arr)].filter(Boolean);

    // 解析核心配置
    // 找到主关键字，即配置中值为 'primary' 的键
    const mainKey = Object.keys(keyConfig).find(k => keyConfig[k] === 'primary');
    // 找到动态关键字，即配置中值为 'fill' 的键
    const dynamicKey = Object.keys(keyConfig).find(k => keyConfig[k] === 'fill');
    // 找到静态关键字，即配置中值为正整数的键
    const staticKeys = Object.keys(keyConfig).filter(k => 
        typeof keyConfig[k] === 'number' && keyConfig[k] > 0
    );
    
    // 构建词库映射
    // 为每个关键字创建一个唯一的词库数组
    const libraries = Object.fromEntries(
        [mainKey, dynamicKey, ...staticKeys].map(key => [
            key,
            unique(data[key] || [])
        ])
    );

    // 如果主关键字的词库为空，则返回空数组
    if (!libraries[mainKey]?.length) return [];

    // 遍历主关键字的词库，为每个主关键字生成一个标题
    return libraries[mainKey].map(mainTerm => {
        // 处理静态部分（保持数组形式）
        // 为每个静态关键字选择指定数量的元素
        const staticParts = Object.fromEntries(
            staticKeys.map(key => {
                const count = keyConfig[key];
                const available = libraries[key] || [];
                const shuffled = shuffle(available);
                // 保留为数组
                return [key, shuffled.slice(0, count)]; 
            })
        );

        // 构建基础标题（预留动态空间）
        const baseParts = {
            // 主键包装为数组
            [mainKey]: [mainTerm], 
            [dynamicKey]: [],
            ...staticParts
        };

        // 计算基础长度（拼接数组元素）
        const baseStr = order
            .map(key => 
                key === dynamicKey ? '' : (baseParts[key] || []).join('')
            )
            .join('');
        
        // 计算剩余可用长度
        let remaining = maxLength - baseStr.length;

        // 处理动态部分（保持数组形式）
        const selectedDynamic = [];
        // 如果动态关键字的词库不为空且还有剩余长度
        if (libraries[dynamicKey]?.length && remaining > 0) {
            const shuffled = shuffle([...libraries[dynamicKey]]);
            
            // 遍历打乱后的动态词库
            for (const item of shuffled) {
                // 如果剩余长度不足，则跳出循环
                if (remaining <= 0) break;

                const available = remaining >= item.length 
                    // 如果剩余长度足够，则使用完整的元素
                    ? item 
                    // 否则，截取部分元素
                    : item.substring(0, remaining);
                
                // 将选择的动态元素添加到数组中
                selectedDynamic.push(available);
                // 减少剩余长度
                remaining -= available.length;
            }
        }

        // 组合最终标题（保留数组形式）
        const finalParts = {
            [mainKey]: [mainTerm],
            [dynamicKey]: selectedDynamic,
            ...staticParts
        };

        console.log(finalParts, insetRule)


        // 如果存在插入规则，并且规则指定的关键字有多个元素
        if (insetRule && insetRule.key && finalParts[insetRule.key]?.length > 1) {
            const list = []

            // 遍历标题顺序
            order.flatMap(key => {
                if (key == dynamicKey) {
                    // 遍历动态部分的元素
                    for (let i = 0, len = finalParts[dynamicKey].length; i < len; i++) {
                        const item = finalParts[dynamicKey][i]

                        // 如果满足插入规则的条件
                        if (finalParts[insetRule.key].length > 1 && i !== 0 && i % insetRule.number == 0) {
                            // 插入规则指定的元素
                            list.push(finalParts[insetRule.key].shift() + item)
                            continue
                        }

                        list.push(item)
                    }
                } else {
                    // 添加其他部分的元素
                    list.push(...(finalParts[key] || []))
                }
            })

            // 拼接并截取最终标题
            return list.join('')
                .substring(0, maxLength)
        } else {
            // 展开所有数组并拼接成最终字符串
            return order
                .flatMap(key => finalParts[key] || [])
                .join('')
                .substring(0, maxLength);
        }
    });
}