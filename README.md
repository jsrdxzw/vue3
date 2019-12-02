## Vue3 realization


Vue３はまだリリースされていないですが、公開された設計思想から先に内部の構造や仕組みなどを解析したいと思います。

Vue3の`data binding`方法は`Object.defineProperty`を代わりに、ES６の特性に基づき、`Proxy`を使っています。
Vue３は前のVue２バージョンアップデートよりほぼ根本的に`Typescript`で書き換えられたものです。

Vue２に比べて、Vue３は以下の特徴があります：
+ もっと早い、もっと軽量的に
+ 中身はTypeScriptで全部書き換えました
+ function-based apiなどの新機能の追加

今回は`Proxy`をベースにして、VUE３のミニ版を実現してみました。
開発は、TDD(Test Driven Development)という開発手法を使って、Vue３の簡単な機能を開発してきました。

### なぜTDD

+ 品質を保証できる、回帰テストをしやすい、開発効率を向上できます。
+ test case はもはや仕様書として扱えます。
+ トップレベルの設計後（製品設計と技術設計を含む）、ボトムからプログラミングを開始できます。

今回は`karma`をテストフレームワークとして使いました。テストケースは下記通りです。

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

```npm test```を実行すれば、テスト結果を見えます。

### Proxyとは

Proxy オブジェクトは別のオブジェクトをラップし、
プロパティやその他の読み取り/書き込みなどの操作をインターセプトします。
必要に応じてそれらを独自に処理できるようにします。
つまりこの特性を生かして、値の変更を検知できます。Vue３はこう実現しています。

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

例は`vm`の代理オブジェクト(proxy)を生成し、vm中のプロパティの変動や削除などを検知できました。

### プロパティ変動の通知(Watcher)

プロパティが定義された場合に、Vue３はハンドラーを追加してくれます。
プロパティが変わったら、Vue３はハンドリングを行ってくれます。

状態変更の自動通知と言えば、Observerパターンを使うのは一般的です。
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

`data`や`props`に定義されたプロパティのkeyとそれに関連するWatcherをdepsに保存します。

```javascript
// propsやdataの中に定義されたプロパティ（key）とそれに関連するWatcherをdepsに保存する
$watch (key, cb) {
    if (!this.deps[key]) {
      this.deps[key] = new Dep()
    }
    this.deps[key].addSub(new Watcher(this.proxy, key, cb))
  }
```

プロパティの値などが更新された場合、通知メソットもinvokeされます。

```javascript
notifyChange (key, pre, val) {
    const dep = this.deps[key]
    dep && dep.notify({ pre, val })
  }
```

### virtual dom vs shadow dom

プロパティの値などが変更された場合、Vue3はvirtual domを通じて、変更が必要となるDomだけを変更します。
本実践では、virtual domまで実現していません。なぜかといいますと、今後`shadow dom`を使う可能性が高いことです。

参考URL：

1. https://develoger.com/shadow-dom-virtual-dom-889bf78ce701

2. https://svelte.dev/blog/virtual-dom-is-pure-overhead

#### [詳細ソースコードはこちら](https://github.com/jsrdxzw/vue3)
