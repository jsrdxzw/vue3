import VNode from './vnode'

class Vue {
  constructor (options) {
    this.$options = options
    this.initProps()
    this.proxy = this.initDataProxy()
    this.initWatch()
    return this.proxy
  }

  $watch (key, cb) {
    this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
    this.dataNotifyChain[key].push(cb)
  }

  $mount (root) {
    this.$el = root
    this.update()
    const { mounted } = this.$options
    mounted && mounted.call(this.proxy)
    return this
  }

  $emit (...options) {
    const [name, ...rest] = options
    const cb = this._events[name]
    if (cb) cb(...rest)
  }

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

  initDataProxy () {
    const data = this.$data = this.$options.data ? this.$options.data() : {}
    const props = this._props
    const methods = this.$options.methods || {}

    const createDataProxyHandler = path => {
      return {
        // 这里的get和set只是普通的对象
        set: (obj, key, value) => {
          // 深度监听，需要一个key来作为通知的key
          const fullPath = path ? path + '.' + key : key
          const pre = obj[key]
          obj[key] = value
          this.notifyDataChange(fullPath, pre, value)
          return true
        },
        get: (obj, key) => {
          const fullPath = path ? path + '.' + key : key
          this.collect(fullPath)
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            return new Proxy(obj[key], createDataProxyHandler(fullPath))
          } else {
            return obj[key]
          }
        },
        deleteProperty: (obj, key) => {
          if (key in obj) {
            const fullPath = path ? path + '.' + key : key
            const pre = obj[key]
            delete obj[key]
            this.notifyDataChange(fullPath, pre)
          }
          return true
        },
      }
    }

    const handler = {
      set: (_, key, value) => {
        const pre = data[key]
        if (pre !== value) {
          if (key in data) {
            data[key] = value
            this.notifyDataChange(key, pre, value)
          } else {
            this[key] = value
          }
        }
        return true
      },
      get: (_, key) => {
        // only in data should be watched
        if (key in props) {
          return createDataProxyHandler().get(props, key)
        } else if (key in data) {
          return createDataProxyHandler().get(data, key)
        } else if (key in methods) {
          return methods[key].bind(this.proxy)
        } else {
          return this[key]
        }
      },
      deleteProperty: (_, key) => {
        if (key in data) {
          return createDataProxyHandler().deleteProperty(data, key)
        }
      },
    }

    return new Proxy(this, handler)
  }

  collect (key) {
    if (!this.collected) {
      this.collected = {}
    }
    if (!this.collected[key]) {
      this.$watch(key, this.update.bind(this))
      this.collected[key] = true
    }
  }

  initWatch () {
    this.dataNotifyChain = {}
  }

  notifyDataChange (key, pre, val) {
    (this.dataNotifyChain[key] || []).forEach(cb => cb(pre, val))
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
}

export default Vue
