function readXlsxFile() {
    return new Promise((resolve, reject) => {
        // 创建文件选择input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls';
        
        // 当用户选择文件后触发
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return reject('No file selected');
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // 获取第一个工作表
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    // 获取表头（第一行）
                    const headers = XLSX.utils.sheet_to_json(worksheet, { 
                        header: 1, 
                        range: 0 
                    })[0];
                    
                    // 转换为对象数组并保留空值
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                        header: headers,     // 明确指定表头
                        defval: '',          // 空值填充空字符串
                        range: 1             // 从第二行开始读数据
                    });
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject('Error reading file');
            reader.readAsArrayBuffer(file);
        };
        
        // 触发文件选择对话框
        input.click();
    });
}