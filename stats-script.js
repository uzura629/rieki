function calculateStats(month) {
    const savedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
    const currentYear = new Date().getFullYear();
    
    // 指定された月のデータをフィルタリング
    const monthlyResults = savedResults.filter(result => {
        const date = new Date(result.date);
        return date.getFullYear() === currentYear && 
               date.getMonth() === (month - 1);
    });

    // 月別の統計情報を計算
    const stats = {
        totalPurchase: 0,
        totalSales: 0,
        totalProfit: 0,
        totalParts: 0,
        count: monthlyResults.length,
        highProfitCount: 0 // 20%以上の取引数
    };

    monthlyResults.forEach(result => {
        stats.totalPurchase += Number(result.purchasePrice) || 0;
        stats.totalSales += Number(result.sellingPrice) || 0;
        stats.totalProfit += Number(result.profit) || 0;
        stats.totalParts += (Number(result.partsCost1) || 0) +
                           (Number(result.partsCost2) || 0) +
                           (Number(result.partsCost3) || 0);
        
        // 利益率20%以上の取引をカウント
        const profitRate = (result.profit / result.sellingPrice * 100);
        if (profitRate >= 20) {
            stats.highProfitCount++;
        }
    });

    // 利益率の計算
    stats.profitRate = stats.totalSales > 0 
        ? (stats.totalProfit / stats.totalSales * 100).toFixed(1) 
        : 0;

    updateStatsDisplay(stats, month);
}

function updateStatsDisplay(stats, month) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stats-item">
                <h4>${month}月の総仕入れ額</h4>
                <p>${stats.totalPurchase.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総販売額</h4>
                <p>${stats.totalSales.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総利益</h4>
                <p>${stats.totalProfit.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の平均利益率</h4>
                <p>${stats.profitRate}%</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の取扱台数</h4>
                <p>${stats.count}台</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の総パーツ代</h4>
                <p>${stats.totalParts.toLocaleString()}円</p>
            </div>
            <div class="stats-item">
                <h4>${month}月の高利益率取引</h4>
                <p>${stats.highProfitCount}件</p>
                <span class="sub-text">(利益率20%以上)</span>
            </div>
        </div>
    `;
}

// 履歴表示用の関数を更新
function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    const selectedMonth = document.getElementById('historyMonth').value;
    const currentYear = new Date().getFullYear();
    let savedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
    
    // 選択された月のデータをフィルタリング
    const filteredResults = savedResults.filter(result => {
        const date = new Date(result.date);
        return date.getFullYear() === currentYear && 
               (date.getMonth() + 1) === Number(selectedMonth);
    });

    // 日付順（新しい順）にソート
    filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 履歴リストのHTML生成
    resultsList.innerHTML = `
        <div class="month-results">
            ${filteredResults.map(result => {
                const date = new Date(result.date);
                const formattedDate = `${date.getDate()}日`;
                const profitRate = (result.profit / result.sellingPrice * 100).toFixed(1);
                
                return `
                    <div class="result-item">
                        <div class="result-info">
                            <span class="result-date">${formattedDate}</span>
                            <span>${result.productName} ${result.storage}GB</span>
                            <span>仕入: ${Number(result.purchasePrice).toLocaleString()}円</span>
                            <span>販売: ${Number(result.sellingPrice).toLocaleString()}円</span>
                            <span>利益: ${Number(result.profit).toLocaleString()}円</span>
                            <span class="profit-rate">利益率: ${profitRate}%</span>
                        </div>
                        <div class="result-actions">
                            <button onclick="deleteResult('${result.id}')" class="delete-button">削除</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 結果を月別にグループ化する関数
function groupResultsByMonth(results) {
    return results.reduce((groups, result) => {
        const date = new Date(result.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(result);
        return groups;
    }, {});
}

// 月ヘッダーのフォーマット
function formatMonthHeader(monthKey) {
    const [year, month] = monthKey.split('-');
    return `${year}年${Number(month)}月`;
}

// 月ごとの結果リストを生成
function generateResultsList(results) {
    return results
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(result => {
            const profitRate = (result.profit / result.sellingPrice * 100).toFixed(1);
            const highProfitClass = profitRate >= 20 ? 'high-profit' : '';
            
            return `
                <div class="result-item ${highProfitClass}">
                    <div class="result-info">
                        <span class="result-date">${formatDate(result.date)}</span>
                        <span class="product-name">${result.productName} ${result.storage}GB</span>
                        <span class="price">仕入: ${Number(result.purchasePrice).toLocaleString()}円</span>
                        <span class="price">販売: ${Number(result.sellingPrice).toLocaleString()}円</span>
                        <span class="profit">利益: ${Number(result.profit).toLocaleString()}円</span>
                        <span class="profit-rate">利益率: ${profitRate}%</span>
                    </div>
                    <div class="result-actions">
                        <button onclick="deleteResult(${index})" class="delete-button">削除</button>
                    </div>
                </div>
            `;
        }).join('');
}

// DOMContentLoaded時に1回だけ実行
document.addEventListener('DOMContentLoaded', function() {
    updateResultsList();
});

let profitChart = null; // グラフのインスタンスをグローバルに保持

function updateMonthlyProfitChart() {
    const savedResults = JSON.parse(localStorage.getItem('savedResults')) || [];
    const currentYear = new Date().getFullYear();
    
    // 月ごとのデータを初期化
    const monthlyData = Array(12).fill(0);
    const monthlyProfitRate = Array(12).fill(0);
    const monthlyTotalSales = Array(12).fill(0);
    const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 月ごとの利益と売上を集計
    savedResults.forEach(result => {
        const date = new Date(result.date);
        if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            monthlyData[month] += Number(result.profit) || 0;
            monthlyTotalSales[month] += Number(result.sellingPrice) || 0;
        }
    });

    // 利益率を計算
    monthlyProfitRate.forEach((_, index) => {
        if (monthlyTotalSales[index] > 0) {
            monthlyProfitRate[index] = (monthlyData[index] / monthlyTotalSales[index] * 100);
        }
    });

    const ctx = document.getElementById('monthlyProfitChart').getContext('2d');
    
    if (profitChart) {
        profitChart.destroy();
    }
    
    profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: '月別利益',
                    data: monthlyData,
                    backgroundColor: 'rgba(33, 150, 243, 0.5)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(33, 150, 243, 0.7)',
                    order: 2
                },
                {
                    label: '利益率',
                    data: monthlyProfitRate,
                    type: 'line',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: false,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `${currentYear}年 月別利益・利益率推移`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === '月別利益') {
                                return `利益: ${context.raw.toLocaleString()}円`;
                            } else {
                                return `利益率: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '利益 (円)',
                        color: 'rgba(33, 150, 243, 1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + '円';
                        },
                        color: 'rgba(33, 150, 243, 1)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '利益率 (%)',
                        color: 'rgba(76, 175, 80, 1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        },
                        color: 'rgba(76, 175, 80, 1)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// 既存のupdateStats関数を修正
function updateStats() {
    const currentMonth = new Date().getMonth() + 1;
    calculateStats(currentMonth);
    updateMonthlyProfitChart(); // グラフの更新を追加
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 履歴タブ初期化時の処理
document.addEventListener('DOMContentLoaded', function() {
    const historyMonth = document.getElementById('historyMonth');
    if (historyMonth) {
        // 現在の月を設定
        const currentMonth = new Date().getMonth() + 1;
        historyMonth.value = currentMonth;
        // 初期表示
        updateResultsList();
    }
});