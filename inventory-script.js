// グローバル変数の初期化を確実に行う
let inventoryData = {
    items: []
};

// LocalStorageからデータを読み込む
function loadInventoryData() {
    console.log('Loading inventory data...');
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
        try {
            inventoryData.items = JSON.parse(savedData);
            console.log('Loaded data:', inventoryData.items);
        } catch (e) {
            console.error('Error parsing saved data:', e);
            inventoryData.items = [];
        }
    } else {
        console.log('No saved data found');
        inventoryData.items = [];
    }
    renderInventoryTable();
}

// 在庫テーブルのレンダリング関数を修正
function renderInventoryTable() {
    const selectedMonth = document.querySelector('#inventoryMonthSelect')?.value;
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    // テーブルをクリア
    tableBody.innerHTML = '';

    // 選択された月のデータをフィルタリング
    const filteredItems = inventoryData.items.filter(item => {
        if (!selectedMonth) return true;
        const itemDate = new Date(item.date);
        const [year, month] = selectedMonth.split('-');
        return itemDate.getFullYear() === parseInt(year) && 
               itemDate.getMonth() === parseInt(month) - 1;
    });

    // フィルタリングされたデータでテーブルを作成
    filteredItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const partsTotal = calculatePartsTotal(item.parts);
        
        row.innerHTML = `
            <td>${item.device}</td>
            <td>${item.storage}GB</td>
            <td>${item.purchasePrice.toLocaleString()}円</td>
            <td>${renderPartsStatus(item.parts)}</td>
            <td>${partsTotal.toLocaleString()}円</td>
            <td>${renderOrderStatus(item.parts)}</td>
            <td>${item.sellingPrice ? item.sellingPrice.toLocaleString() + '円' : '-'}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button onclick="editInventoryItem(${index})" class="edit-button">編集</button>
                <button onclick="deleteInventoryItem(${index})" class="delete-button">削除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// データを月ごとにグループ化する関数
function groupDataByMonth(items) {
    const grouped = {};
    
    items.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(item);
    });
    
    return grouped;
}

// アイテムのインデックスを取得する関数
function getItemIndex(item) {
    return inventoryData.items.findIndex(i => i.id === item.id);
}

// パーツ状態の表示
function renderPartsStatus(parts) {
    if (!parts) return '';
    
    return Object.entries(parts)
        .filter(([_, status]) => status.needed)
        .map(([part, status]) => {
            let partName = getPartName(part);
            let statusClass = status.ordered ? 'ordered' : 'needed';
            return `
                <span class="part-tag ${statusClass}">
                    ${partName}${status.ordered ? '(発注済)' : ''}
                </span>
            `;
        }).join('');
}

// パーツ名を日本語に変換
function getPartName(part) {
    const partNames = {
        'lcd': 'LCD',
        'battery': 'バッテリー',
        'housing': 'ハウジング',
        'camera': 'カメラ'
    };
    return partNames[part] || part;
}

// パーツ合計金額の計算
function calculatePartsTotal(parts) {
    if (!parts) return 0;
    
    const partsCostMap = {
        'lcd': 3000,
        'battery': 1500,
        'housing': 2000,
        'camera': 2500
    };
    
    return Object.entries(parts)
        .reduce((total, [part, status]) => {
            if (status.needed) {
                return total + (partsCostMap[part] || 0);
            }
            return total;
        }, 0);
}

// 発注状況の表を修正
function renderOrderStatus(parts) {
    if (!parts) return '-';
    
    return Object.entries(parts)
        .filter(([_, status]) => status.needed)
        .map(([part, status]) => {
            const partName = getPartName(part);
            return `${partName}: ${status.ordered ? '○' : '×'}`;
        }).join('<br>');
}

// モーダルのHTML要素を修正
function createInventoryModal() {
    const modalHTML = `
        <div id="inventoryModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>在庫アイテム追加</h2>
                <form id="inventoryForm">
                    <div class="form-group">
                        <label for="modalDevice">機種:</label>
                        <select id="modalDevice" required>
                            <option value="">機種を選択</option>
                            <option value="iPhone6s">iPhone6s</option>
                            <option value="iPhone6sPlus">iPhone6sPlus</option>
                            <option value="iPhone7">iPhone7</option>
                            <option value="iPhone7Plus">iPhone7Plus</option>
                            <option value="iPhone8">iPhone8</option>
                            <option value="iPhone8Plus">iPhone8Plus</option>
                            <option value="iPhoneX">iPhoneX</option>
                            <option value="iPhoneXS">iPhoneXS</option>
                            <option value="iPhoneXSMax">iPhoneXSMax</option>
                            <option value="iPhoneXR">iPhoneXR</option>
                            <option value="iPhone11">iPhone11</option>
                            <option value="iPhone11Pro">iPhone11Pro</option>
                            <option value="iPhone11ProMax">iPhone11ProMax</option>
                            <option value="iPhone12">iPhone12</option>
                            <option value="iPhone12Mini">iPhone12Mini</option>
                            <option value="iPhone12Pro">iPhone12Pro</option>
                            <option value="iPhone12ProMax">iPhone12ProMax</option>
                            <option value="iPhoneSE2">iPhoneSE2</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="modalStorage">容量:</label>
                        <select id="modalStorage" required>
                            <option value="">容量を選択</option>
                            <option value="16">16GB</option>
                            <option value="32">32GB</option>
                            <option value="64">64GB</option>
                            <option value="128">128GB</option>
                            <option value="256">256GB</option>
                            <option value="512">512GB</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="modalPurchasePrice">仕入れ値:</label>
                        <input type="number" id="modalPurchasePrice" required>
                    </div>
                    
                    <div class="form-group">
                        <label>必要なパーツ:</label>
                        <div class="parts-list">
                            <div class="part-row">
                                <select id="modalPartsLcd" class="part-select">
                                    <option value="none">LCD 不要</option>
                                    <option value="needed">LCD 必要</option>
                                </select>
                                <select id="modalOrderLcd" class="order-select">
                                    <option value="no">×</option>
                                    <option value="yes">○</option>
                                </select>
                            </div>
                            <div class="part-row">
                                <select id="modalPartsBattery" class="part-select">
                                    <option value="none">バッテリー 不要</option>
                                    <option value="needed">バッテリー 必要</option>
                                </select>
                                <select id="modalOrderBattery" class="order-select">
                                    <option value="no">×</option>
                                    <option value="yes">○</option>
                                </select>
                            </div>
                            <div class="part-row">
                                <select id="modalPartsHousing" class="part-select">
                                    <option value="none">ハウジング 不要</option>
                                    <option value="needed">ハウジング 必要</option>
                                </select>
                                <select id="modalOrderHousing" class="order-select">
                                    <option value="no">×</option>
                                    <option value="yes">○</option>
                                </select>
                            </div>
                            <div class="part-row">
                                <select id="modalPartsCamera" class="part-select">
                                    <option value="none">カメラ 不要</option>
                                    <option value="needed">カメラ 必要</option>
                                </select>
                                <select id="modalOrderCamera" class="order-select">
                                    <option value="no">×</option>
                                    <option value="yes">○</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="modalNotes">備考:</label>
                        <textarea id="modalNotes"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="save-button">保存</button>
                        <button type="button" class="cancel-button">キャンセル</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// モーダルの表示・非表示を制御
function showInventoryModal(editIndex = null) {
    console.log('showInventoryModal called', editIndex);
    const modal = document.getElementById('inventoryModal');
    if (!modal) {
        console.log('Creating new modal');
        createInventoryModal();
    }
    
    const currentModal = document.getElementById('inventoryModal');
    if (currentModal) {
        console.log('Showing modal');
        currentModal.style.display = 'block';
        
        if (editIndex !== null) {
            console.log('Filling form with existing data');
            const item = inventoryData.items[editIndex];
            fillModalForm(item);
        }
        
        setupModalEventListeners(editIndex);
    } else {
        console.error('Modal element not found');
    }
}

// モォームデータの取得を修正
function getFormData() {
    const formData = {
        device: document.getElementById('modalDevice').value,
        storage: document.getElementById('modalStorage').value,
        purchasePrice: Number(document.getElementById('modalPurchasePrice').value),
        notes: document.getElementById('modalNotes').value,
        parts: {}
    };

    // パーツの状態を取得
    const parts = ['lcd', 'battery', 'housing', 'camera'];
    parts.forEach(part => {
        const partSelect = document.getElementById(`modalParts${part.charAt(0).toUpperCase() + part.slice(1)}`);
        const orderSelect = document.getElementById(`modalOrder${part.charAt(0).toUpperCase() + part.slice(1)}`);
        
        formData.parts[part] = {
            needed: partSelect.value === 'needed',
            ordered: orderSelect.value === 'yes'
        };
    });

    return formData;
}

// フォームにデータを設定
function fillModalForm(item) {
    // 機種と容量は読み取り専用で表示
    const deviceSelect = document.getElementById('modalDevice');
    const storageSelect = document.getElementById('modalStorage');
    
    deviceSelect.value = item.device;
    deviceSelect.disabled = true;
    storageSelect.value = item.storage;
    storageSelect.disabled = true;

    // その他のフィールドを設定
    document.getElementById('modalPurchasePrice').value = item.purchasePrice;
    document.getElementById('modalNotes').value = item.notes || '';

    // パーツの状態を設定
    Object.entries(item.parts).forEach(([part, status]) => {
        const partSelect = document.getElementById(`modalParts${part.charAt(0).toUpperCase() + part.slice(1)}`);
        const orderSelect = document.getElementById(`modalOrder${part.charAt(0).toUpperCase() + part.slice(1)}`);
        
        if (partSelect && orderSelect) {
            partSelect.value = status.needed ? 'needed' : 'none';
            orderSelect.value = status.ordered ? 'yes' : 'no';
        }
    });
}

// モーダルのイベントリスナー設定を修正
function setupModalEventListeners(editIndex) {
    const modal = document.getElementById('inventoryModal');
    const form = document.getElementById('inventoryForm');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-button');
    
    // すべてのイベントリスナーを削除して再設定
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const closeModal = () => {
        modal.style.display = 'none';
        // モーダルを閉じる時に無効化を解除
        const deviceSelect = document.getElementById('modalDevice');
        const storageSelect = document.getElementById('modalStorage');
        if (deviceSelect) deviceSelect.disabled = false;
        if (storageSelect) storageSelect.disabled = false;
    };

    // キャンセルボタンのイベントリスナー
    const newCancelBtn = newForm.querySelector('.cancel-button');
    if (newCancelBtn) {
        newCancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }
    
    // 閉じるボタンのイベントリスナー
    closeBtn.addEventListener('click', closeModal);
    
    // モーダル外クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // フォーム送信
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (saveInventoryItem(editIndex)) {
            closeModal();
            showInventoryTab();
        }
    });
}

// 在庫アイテムの削除
function deleteInventoryItem(index) {
    if (confirm('この在庫アイテムを削除してもよろしいですか？')) {
        console.log('Deleting item at index:', index);
        inventoryData.items.splice(index, 1);
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData.items));
        renderInventoryTable();
    }
}

// 在庫管理タブを表示する関数
function showInventoryTab() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const inventoryTab = document.querySelector('.tab-button[data-tab="inventoryTab"]');
    const inventoryContent = document.getElementById('inventoryTab');
    
    if (inventoryTab && inventoryContent) {
        inventoryTab.classList.add('active');
        inventoryContent.classList.add('active');
    }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // 月選択機能の初期化
    createMonthSelector();
    
    // モーダルのHTML要素を追加
    createInventoryModal();
    
    // 在庫データの読み込みと表示
    loadInventoryData();
    
    // データ転送ボタンの追加
    const inventoryTab = document.getElementById('inventoryTab');
    if (inventoryTab) {
        // 既存のデータ転送ボタンコンテナを確認
        let dataTransferButtons = inventoryTab.querySelector('.data-transfer-buttons');
        
        // コンテナが存在しない場合は新規作成
        if (!dataTransferButtons) {
            dataTransferButtons = document.createElement('div');
            dataTransferButtons.className = 'data-transfer-buttons';
            
            // エクスポートボタンを作成
            const exportButton = document.createElement('button');
            exportButton.className = 'export-button';
            exportButton.textContent = 'データエクスポート';
            exportButton.onclick = exportData;
            
            // インポートボタンを作成
            const importButton = document.createElement('button');
            importButton.className = 'import-button';
            importButton.textContent = 'データインポート';
            importButton.onclick = () => document.getElementById('importFile').click();
            
            // ファイル入力要素を作成
            const importFile = document.createElement('input');
            importFile.type = 'file';
            importFile.id = 'importFile';
            importFile.accept = '.json';
            importFile.style.display = 'none';
            importFile.onchange = (e) => importData(e.target.files[0]);
            
            // ボタンをコンテナに追加
            dataTransferButtons.appendChild(exportButton);
            dataTransferButtons.appendChild(importButton);
            dataTransferButtons.appendChild(importFile);
            
            // コンテナを在庫管理タブに追加（テーブルの前に配置）
            const inventoryTable = inventoryTab.querySelector('.inventory-table-container');
            if (inventoryTable) {
                inventoryTab.insertBefore(dataTransferButtons, inventoryTable);
            } else {
                inventoryTab.appendChild(dataTransferButtons);
            }
        }
    }
    
    // 新規追加ボタンのイベントリスナーを設定
    const addButton = document.querySelector('.add-button');
    if (addButton) {
        addButton.addEventListener('click', function() {
            showInventoryModal();
        });
    }
});

// 在庫アイテムの編集を修正
function editInventoryItem(index) {
    console.log('Editing item at index:', index);
    const item = inventoryData.items[index];
    
    if (!item) {
        console.error('Item not found at index:', index);
        return;
    }

    const modal = document.getElementById('inventoryModal');
    if (!modal) {
        console.error('Modal not found');
        return;
    }

    // モーダルのタイトルを変更
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = '在庫アイテム編集';
    }

    try {
        fillModalForm(item);
        modal.style.display = 'block';
        setupModalEventListeners(index); // インデックスを渡す
    } catch (error) {
        console.error('Error setting up edit form:', error);
        alert('編集フォームの設定中にエラーが発生しました。');
    }
}

// 保存処理を修正
function saveInventoryItem(editIndex) {
    console.log('Saving inventory item...', editIndex);
    
    const formData = {
        date: editIndex !== null ? inventoryData.items[editIndex].date : new Date().toISOString(),
        device: document.getElementById('modalDevice').value,
        storage: document.getElementById('modalStorage').value,
        purchasePrice: Number(document.getElementById('modalPurchasePrice').value),
        notes: document.getElementById('modalNotes').value,
        parts: {}
    };

    // 編集時は機種名と容量を既存のデータから取得
    if (editIndex !== null) {
        formData.device = inventoryData.items[editIndex].device;
        formData.storage = inventoryData.items[editIndex].storage;
    }

    // パーツの状態を取得
    const parts = ['lcd', 'battery', 'housing', 'camera'];
    parts.forEach(part => {
        const partSelect = document.getElementById(`modalParts${part.charAt(0).toUpperCase() + part.slice(1)}`);
        const orderSelect = document.getElementById(`modalOrder${part.charAt(0).toUpperCase() + part.slice(1)}`);
        
        formData.parts[part] = {
            needed: partSelect.value === 'needed',
            ordered: orderSelect.value === 'yes'
        };
    });

    if (editIndex !== null) {
        // 編集時は既存のアイテムを更新
        inventoryData.items[editIndex] = {
            ...inventoryData.items[editIndex], // 既存のデータを保持
            ...formData, // 新しいデータで上書き
            device: inventoryData.items[editIndex].device, // 機種名を確実に保持
            storage: inventoryData.items[editIndex].storage, // 容量を確実に保持
            date: inventoryData.items[editIndex].date // 日付を保持
        };
    } else {
        // 新規追加
        inventoryData.items.push(formData);
    }

    try {
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData.items));
        console.log('Data saved successfully');
        renderInventoryTable();
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// 月選択機能の初期化を修正
function createMonthSelector() {
    const monthSelector = document.createElement('div');
    monthSelector.className = 'month-selector';
    monthSelector.innerHTML = `
        <select id="inventoryMonthSelect">
            ${generateMonthOptions()}
        </select>
    `;
    
    // 在庫管理タブの先頭に追加
    const inventoryTab = document.getElementById('inventoryTab');
    if (inventoryTab) {
        const existingSelector = inventoryTab.querySelector('.month-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
        inventoryTab.insertBefore(monthSelector, inventoryTab.firstChild);
    }
    
    // 月選択イベントリスナー
    const select = monthSelector.querySelector('select');
    if (select) {
        select.addEventListener('change', function() {
            console.log('月が選択されました:', this.value);
            renderInventoryTable();
        });
        
        // 現在の月を選択
        const currentDate = new Date();
        select.value = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        renderInventoryTable(); // 初期表示
    }
}

function generateMonthOptions() {
    const months = [];
    for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        months.push(`<option value="${monthStr}">${month}月</option>`);
    }
    return months.join('');
}

// データエクスポート機能
function exportData() {
    try {
        // 在庫データを取得
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            inventory: inventoryData.items
        };
        
        // JSONファイルとしてエクスポート
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // ダウンロードリンクの作成と実行
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.download = `iphone-inventory-${date}.json`;
        a.href = url;
        a.click();
        
        // URLを解放
        URL.revokeObjectURL(url);
        
        // 成功メッセージ
        alert('データのエクスポートが完了しました');
    } catch (error) {
        console.error('エクスポートエラー:', error);
        alert('エクスポートに失敗しました');
    }
}

// データインポート機能
function importData(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // データの検証
            if (!Array.isArray(importedData.inventory)) {
                throw new Error('Invalid data format');
            }
            
            // 既存のデータと結合するか確認
            if (confirm('既存のデータに追加しますか？\nキャンセルを選択すると既存のデータは上書きされます。')) {
                inventoryData.items = [...inventoryData.items, ...importedData.inventory];
            } else {
                inventoryData.items = importedData.inventory;
            }
            
            // データを保存して画面を更新
            localStorage.setItem('inventoryData', JSON.stringify(inventoryData.items));
            renderInventoryTable();
            alert('データのインポートが完了しました');
        } catch (error) {
            console.error('インポートエラー:', error);
            alert('インポートに失敗しました');
        }
    };
    reader.readAsText(file);
}
 
