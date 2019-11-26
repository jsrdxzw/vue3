## VUE 3的简易版实现

这是使用了Proxy特性的Vue3 简易版实现

This is a simple realization of Vue 3

Vue3は`Object.defineProperty`を代わりに、ES６のProxyを基づく、Vue２によりほぼ
ゼロから書き換えましたものです。

Vue３はVue２に比べて、以下の特徴があります：
+ もっと早い、もっと軽量的に
+ 中身はTypeScriptで全部書き換えました
+ function-based apiのサポート

今回は`Proxy`をベースにして、VUE３のミニ版を実現してみました。
開発は、TDDというプリンシプルをもとに、Vue３の基本的な特徴ごとに、少しずつ開発してきました。

### なぜTDD

ソフトウェアエンジニアリングでは、私の理解では、
完全にトップダウンのデザインなので、
もはや古い方法です。
TDDは上と下を結合したプログラミング実践であり、
各モジュールについては、まずテスト用例を設計し、コードを書いて実現する。
以下の利点があります

+ 品質をコントロールし、回帰テストに便利で、開発効率を向上させます。
+ test case はもはやドキュメントと扱えます
+ 粗いトップレベルの設計後（製品設計と技術設計を含む）、ボトムアップからプログラミングを開始できます。

### Proxyとは

オブジェクトに扱う際、ブジェクト中のvalueの変動、削除などが検測できるのが`Object Proxy`です。
例えば：
```javascript
const vm = {
  a: 1
}

const proxy = new Proxy(vm, {
  get (target, key) {
    console.log('you will get key : ' + key)
    return vm[key] + 1
  },
  set (target, key, value) {
    console.log('you will set key : ' + key)
    vm[key] = value
    return true
  }
})
console.log(proxy.a)
proxy.a = 2
```
例はvmの`Proxy Object`を生成し、vm中のプロパティが代理られました。

### プロパティの監視

プロパティが変わったら、ハンドル処理は必要となっています。そうすれば、
ユーザー側がプロパティの変化に対して、対応もできるようになります。

```javascript
// propsやdataの中に定義されたプロパティ（key）とそれに関連するWatcherをdepsに保存する
$watch (key, cb) {
    if (!this.deps[key]) {
      this.deps[key] = new Dep()
    }
    this.deps[key].addSub(new Watcher(this.proxy, key, cb))
  }
```

一旦プロパティの値などが更新する際に、通知メソットもinvokeします。

```javascript
notifyChange (key, pre, val) {
    const dep = this.deps[key]
    dep && dep.notify({ pre, val })
  }
```

### virtual dom vs shadow dom

1. https://develoger.com/shadow-dom-virtual-dom-889bf78ce701

2. https://svelte.dev/blog/virtual-dom-is-pure-overhead

### 詳細ソースコード

[Github](https://github.com/jsrdxzw/vue3)
