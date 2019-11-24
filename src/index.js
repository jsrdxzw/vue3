import VNode from './vnode'

class Vue {
  constructor (options) {
    this.$options = options
    this.proxy = this.initDataProxy()
    this.initWatch()
    return this.proxy
  }

  $watch (key, cb) {
    this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
    this.dataNotifyChain[key].push(cb)
  }

  $mount (root) {
    const { mounted, render } = this.$options
    const vnode = render.call(this.proxy, this.createElement)
    this.$el = this.createDom(vnode)
    if (root) {
      const parent = root.parentElement
      parent.removeChild(root)
      root.appendChild(this.$el)
    }
    mounted && mounted.call(this.proxy)
    return this
  }

  update () {
    const parent = this.$el.parentElement
    if (parent) {
      parent.removeChild(this.$el)
    }
    const vnode = this.$options.render.call(this.proxy, this.createElement)
    this.$el = this.patch(null, vnode)
    if (parent) {
      parent.appendChild(this.$el)
    }
  }

  initDataProxy () {
    const data = this.$data = this.$options.data ? this.$options.data() : {}
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
        const methods = this.$options.methods || {}
        // only in data should be watched
        if (key in data) {
          return createDataProxyHandler().get(data, key)
        }
        if (key in methods) return methods[key].bind(this.proxy)
        else return this[key]
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
    const el = document.createElement(vnode.tag)
    el.__vue__ = this
    for (let key in vnode.data) {
      if (vnode.data.hasOwnProperty(key)) {
        el.setAttribute(key, vnode.data[key])
      }
    }
    const events = (vnode.data || {}).on || {}
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
    return new VNode(tag, data, children)
  }

  patch (oldVnode, newVnode) {
    return this.createDom(newVnode)
  }
}

export default Vue
