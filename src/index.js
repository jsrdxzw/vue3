import VNode from './vnode'
import { Watcher, ComputedWatcher } from './watcher.js'
import Dep from './dep.js'
import { createProxy, setTarget, clearTarget } from './proxy.js'

class Vue {
  constructor (options) {
    this.$options = options
    this.initProps()
    this.proxy = createProxy(this)
    this.initWatcher()
    this.initWatch()
    return this.proxy
  }

  $watch (key, cb) {
    if (!this.deps[key]) {
      this.deps[key] = new Dep()
    }
    this.deps[key].addSub(new Watcher(this.proxy, key, cb))
  }

  $mount (root) {
    this.$el = root

    // first render
    setTarget(this)
    this.update()
    clearTarget()

    const { mounted } = this.$options
    mounted && mounted.call(this.proxy)
    return this
  }

  $emit (...options) {
    const [name, ...rest] = options
    const cb = this._events[name]
    if (cb) cb(...rest)
  }

  /**
   * 重新渲染
   */
  update () {
    const parent = (this.$el || {}).parentElement
    const vnode = this.$options.render.call(this.proxy,
      this.createElement.bind(this))
    const oldEl = this.$el
    this.$el = this.patch(null, vnode)
    if (parent) {
      parent.replaceChild(this.$el, oldEl)
    }
  }

  initWatcher () {
    this.deps = {}
  }

  notifyChange (key, pre, val) {
    const dep = this.deps[key]
    dep && dep.notify({ pre, val })
  }

  createDom (vnode) {
    if (vnode.componentOptions) {
      const componentInstance = new Vue(
        Object.assign({}, vnode.componentOptions,
          { propsData: vnode.data.props }))
      vnode.componentInstance = componentInstance
      componentInstance._events = (vnode.data || {}).on || {}
      componentInstance.$mount()
      return componentInstance.$el
    }
    const el = document.createElement(vnode.tag)
    el.__vue__ = this
    const data = vnode.data || {}
    const attributes = data.attrs || {}
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        el.setAttribute(key, attributes[key])
      }
    }
    const classname = data.class
    if (classname) {
      el.setAttribute('class', classname)
    }

    const events = data.on || {}
    for (let key in events) {
      if (events.hasOwnProperty(key)) {
        el.addEventListener(key, events[key])
      }
    }
    if (!Array.isArray(vnode.children)) {
      el.textContent = vnode.children + ''
    } else {
      vnode.children && vnode.children.forEach(child => {
        if (typeof child === 'string') {
          el.textContent = child
        } else {
          el.appendChild(this.createDom(child))
        }
      })
    }
    return el
  }

  createElement (tag, data, children) {
    const components = this.$options.components || {}
    if (tag in components) {
      return new VNode(tag, data, children, components[tag])
    }
    return new VNode(tag, data, children)
  }

  patch (oldVnode, newVnode) {
    return this.createDom(newVnode)
  }

  initProps () {
    this._props = {}
    const { props: propsOptions, propsData } = this.$options
    if (!propsOptions || !propsOptions.length) return
    propsOptions.forEach(key => {
      this._props[key] = propsData[key]
    })
  }

  initWatch () {
    const watch = this.$options.watch || {}
    const computed = this.$options.computed || {}
    const data = this.$data
    for (let key in watch) {
      if (watch.hasOwnProperty(key)) {
        const handler = watch[key]
        if (key in data) {
          this.$watch(key, handler.bind(this.proxy))
        } else if (key in computed) {
          new ComputedWatcher(this.proxy, computed[key], handler)
        } else {
          throw 'i don\'t know what you wanna do'
        }
      }
    }
  }
}

export default Vue
