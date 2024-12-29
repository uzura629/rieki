const CONDITIONS = {
    screen: {
        SS: '当方で画面パネルを新品と交換済み、非常に綺麗。',
        S: '傷なし、非常に綺麗。',
        A: '右下端に小さな傷があり（ガラスフィルムで見えなくなる）。',
        B: '光反射で見える程度の薄い小さな傷が一部にあり。',
        C: '所々に小さな傷があり、光反射で全体的に見える（ガラスフィルムで隠せる）。'
    },
    side: {
        S: '傷なし、非常に綺麗。',
        A: '細かい傷が一部にあり、ほぼ目立たない。',
        B: '小さな傷や極小の傷が全体的にある。',
        C: '4つ角に小さな傷があり、他にも小さな傷が所々にある。'
    },
    back: {
        S: '傷なし、非常に綺麗。',
        A: '凝視しないと見えない薄い傷が一部にあり、透明なケースを装着すると目立たない。',
        B: '光反射で見える小さな傷が一部にあり、透明なケースを装着すると見えなくなる。',
        C: '使用に伴う傷が複数箇所あり。'
    },
    bottom: {
        S: '傷なし、非常に綺麗。',
        A: '微細な傷がわずかにあるが目立たない。',
        B: '光反射で見える細かい傷が一部にある。',
        C: '所々に小さな傷あり、使用感が見られる。'
    },
    top: {
        S: '傷なし、非常に綺麗。',
        A: '一部に微細な傷があり、ほぼ目立たない。',
        B: '光反射で見える程度の傷が一部にある。',
        C: '小さな傷が所々にあり、使用感が見られる。'
    }
};

const RANK_DESCRIPTIONS = {
    S: '無傷。',
    A: '傷はあるが、中古にしては綺麗な状態。',
    B: '所々細かい傷や汚れがある。',
    C: '比較的傷が多い状態。',
    J: 'ジャンク品。'
};

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', function() {
    const generateButton = document.getElementById('generateContent');
    if (generateButton) {
        generateButton.addEventListener('click', function(e) {
            e.preventDefault();
            generateListingContent();
        });
    }
});

// タイトルと商品説明を生成する関数
function generateListingContent() {
    try {
        // 基本情報の取得
        const productName = document.getElementById('listingProductName').value;
        const storage = document.getElementById('listingStorage').value;
        const color = document.getElementById('color').value;
        const imei = document.getElementById('imei').value;
        const rank = document.getElementById('rank').value;

        // 状態の取得
        const screenRank = document.getElementById('screenCondition').value;
        const backRank = document.getElementById('backCondition').value;
        const sideRank = document.getElementById('sideCondition').value;
        const topRank = document.getElementById('topCondition').value;
        const bottomRank = document.getElementById('bottomCondition').value;

        // ランクに応じたタイトルプレフィックスを設定
        const rankPrefix = {
            'SS': '【極美品】',
            'S': '【極美品】',
            'A': '【上美品】',
            'B': '【美品】',
            'C': '【美品】'
        }[rank];

        // タイトルの生成（40文字制限付き）
        let title = `${rankPrefix}${productName} 本体 ${storage}GB`;
        
        // 色を追加（40文字以内の場合のみ）
        if (color && (title + ` ${color} SIMフリー`).length <= 40) {
            title += ` ${color} SIMフリー`;
        } else if ((title + ' SIMフリー').length <= 40) {
            title += ' SIMフリー';
        }

        // 40文字を超える場合は切り詰める
        if (title.length > 40) {
            title = title.substring(0, 37) + '...';
        }

        // 商品説明の生成（ランクあり）
        const description = `■商品情報

【商品名】${productName}
【色】 ${color}
【キャリア】 simフリー
【本体容量】${storage}GB
【バッテリー容量】100%
【IMEI】${imei}
【ネットワーク利用制限】◯
【アクティベーションロック】解除済み

■付属品
1.9H強化ガラス（貼り付け済み）
2.純正品質ライトニングケーブル(新品のため動作未確認)
3.simピン

■商品状態
画面→ ${screenRank}: ${CONDITIONS.screen[screenRank]}
背面→ ${backRank}: ${CONDITIONS.back[backRank]}
側面→ ${sideRank}: ${CONDITIONS.side[sideRank]}
底面→ ${bottomRank}: ${CONDITIONS.bottom[bottomRank]}
上面→ ${topRank}: ${CONDITIONS.top[topRank]}

総合評価: ${rank}

■状態ランク
【S】→${RANK_DESCRIPTIONS.S}
【A】→${RANK_DESCRIPTIONS.A}
【B】→${RANK_DESCRIPTIONS.B}
【C】→${RANK_DESCRIPTIONS.C}
【J】→${RANK_DESCRIPTIONS.J}

■発送について
基本的に、購入頂いてから翌日までの発送を心がけています！

■注意事項
キズなどの状態を全て伝えるよう努力しておりますが、お伝えしきれない細かなところもありますのでご了承下さいm(_ _)m

また、説明欄には無い異常な症状、動作不良などあれば返品対応お受けいたします！

いつでもご連絡下さいませ(^^)`;

        // プレビューの更新
        document.getElementById('titlePreview').textContent = title;
        document.getElementById('descriptionPreview').textContent = description;

        console.log('生成完了:', { title, description });
    } catch (error) {
        console.error('生成中にエラーが発生しました:', error);
    }
}