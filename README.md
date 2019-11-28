## VUE 3的简易版实现

这是使用了Proxy特性的Vue3 简易版实现

This is a simple realization of Vue 3

Vue3の値変更の追跡方法は`Object.defineProperty`を代わりに、ES６の特性を基づいて`Proxy`を使っています。
Vue３は前のVue２よりほぼゼロから書き換えましたのです。

Vue２に比べて、Vue３は以下の特徴があります：
+ もっと早い、もっと軽量的に
+ 中身はTypeScriptで全部書き換えました
+ function-based apiなどの新機能の追加

今回は`Proxy`をベースにして、VUE３のミニ版を実現してみました。
開発は、TDDというプリンシプルをもとに、Vue３の基本的なファクションを開発してきました。

### なぜTDD

ソフトウェアエンジニアリングでは、私の理解では、
完全にトップダウンのデザインなので、もはや古い方法です。
TDDは上と下を結合したプログラミング実践であり、
各モジュールについては、まずテスト用例を設計し、コードを書いて実現する技術です。
TDDは以下の利点はあります：

+ 品質をコントロールし、回帰テストに便利で、開発効率を向上させます。
+ test case はもはやドキュメントと扱えます
+ トップレベルの設計後（製品設計と技術設計を含む）、ボトムアップからプログラミングを開始できます。

今回は`karma`を使いました。テストケースは下の通りに書きます：

```javascript
describe('Proxy test', function() {
    it('should proxy vm._data.a = vm.a', function() {
        const vm = new Vue({
            data() {
                return {
                    a: 2
                }
            }
        })
        expect(vm.a).toEqual(2)
    })
})
```

```npm test```を実行し、テスト結果は見えます。

### Proxyとは

オブジェクトに扱う際に、プロパティがアクセスまたは変更されたときに変更を通知したりすることを可能にするような技術は`Object Proxy`です。
例えば：
```javascript
const vm = {
  a: 1
}

const proxy = new Proxy(vm, {
  get (target, key) {
    console.log('you will get value of key : ' + key)
    return vm[key] + 1
  },
  set (target, key, value) {
    console.log('you will set value of key : ' + key)
    vm[key] = value
    return true
  }
})
// you will get value of key : a
// 2
console.log(proxy.a) 
// you will set value of key : a
proxy.a = 2
```
例は`vm`の代理オブジェクト(proxy)を生成し、vm中のプロパティの変動や削除を検測できました。

### プロパティ変動の通知(Watcher)

プロパティが変わったら、ハンドル処理は必要となっています。そうすれば、
ユーザー側がプロパティの変化にとともに、対応や処理もできるようになります。

状態変更の自動通知としたら、Observerパターンを使うのは一般的です。
まずは簡単なSubjectを定義します。
```javascript
import { remove } from './util'

export default class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  removeSub (sub) {
    remove(this.subs, sub)
  }

  notify (payload) {
    this.subs.forEach(sub => {
      sub.update(payload)
    })
  }
}
```

`data`や`props`に定義されたプロパティのkeyとそれに関連するWatcherをdepsに保存する

```javascript
// propsやdataの中に定義されたプロパティ（key）とそれに関連するWatcherをdepsに保存する
$watch (key, cb) {
    if (!this.deps[key]) {
      this.deps[key] = new Dep()
    }
    this.deps[key].addSub(new Watcher(this.proxy, key, cb))
  }
```

一旦プロパティの値などが更新する際に、通知メソットもinvokeされます。

```javascript
notifyChange (key, pre, val) {
    const dep = this.deps[key]
    dep && dep.notify({ pre, val })
  }
```

### virtual dom vs shadow dom

1. https://develoger.com/shadow-dom-virtual-dom-889bf78ce701

2. https://svelte.dev/blog/virtual-dom-is-pure-overhead

#### [詳細ソースコードはこちら](https://github.com/jsrdxzw/vue3)
