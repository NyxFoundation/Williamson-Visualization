# TCE Governance Lab

取引コスト経済学（Transaction Cost Economics）のガバナンス構造を、パラメータを動かしながら学ぶためのWebアプリです。

不確実性、少数性、資産特殊性、取引頻度、限定合理性、機会主義を変更すると、市場・ハイブリッド・ヒエラルキーの適合度、ガバナンスの具体的な候補、因果関係の強さ、結果の説明がリアルタイムで変化します。

## 必要な環境

- Node.js 20以上
- npm 10以上
- Git

バージョンは次のコマンドで確認できます。

```bash
node --version
npm --version
git --version
```

## セットアップ

リポジトリをcloneします。

```bash
git clone https://github.com/NyxFoundation/Williamson-Visualization.git
cd Williamson-Visualization
```

SSHを設定済みの場合は、SSH URLも使用できます。

```bash
git clone git@github.com:NyxFoundation/Williamson-Visualization.git
cd Williamson-Visualization
```

`package-lock.json`に記録されたバージョンで依存パッケージをインストールします。

```bash
npm ci
```

開発サーバーを起動します。

```bash
npm run dev
```

ターミナルに表示されるURLをブラウザで開いてください。通常は次のURLです。

```text
http://localhost:5173/
```

終了するときは、開発サーバーを実行しているターミナルで `Ctrl+C` を押します。

## 操作方法

左側のスライダーで、次の6つの値を0〜100の範囲で変更できます。

- 不確実性
- 少数性
- 資産特殊性
- 取引頻度
- 限定合理性
- 機会主義

変更は次の表示へ即座に反映されます。

- 市場・ハイブリッド・ヒエラルキーの3つの適合度
- ガバナンス・スペクトラム上の現在位置
- 因果矢印の太さと透明度
- 具体的なガバナンス候補の上位3件
- 現在の結果になった理由
- 直前の状態との差分
- 各ルールのスコアへの寄与

用語の横にある `?` を押すと、その用語の短い説明を確認できます。右上の「初期状態に戻す」で、すべての値を初期値へ戻せます。

## 利用できるコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動します |
| `npm run build` | TypeScriptを検査し、本番用ファイルを `dist/` に生成します |
| `npm run preview` | 生成済みの本番用ファイルをローカルで確認します |
| `npm test` | ガバナンス計算モデルのテストを実行します |

本番用ビルドを確認する場合は、次の順番で実行します。

```bash
npm run build
npm run preview
```

## 主なファイル

```text
src/main.tsx       画面とインタラクション
src/model.ts       スコア、相互作用、候補形態の計算
src/style.css      レイアウトとデザイン
src/model.test.ts  計算モデルのテスト
```

## 教育用モデルについて

このアプリの数値と重みは、取引コスト経済学の関係を操作可能にするための教育用モデルです。理論自体が数値的な決定式を提示しているわけではありません。

