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
    this.$root = this.createDom(vnode)
    if (root) {
      root.appendChild(this.$root)
    }
    mounted && mounted.call(this.proxy)
    return this
  }

  initDataProxy () {
    const data = this.$options.data ? this.$options.data() : {}
    return new Proxy(this, {
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
        if (key in data) return data[key]
        if (key in methods) return methods[key].bind(this.proxy)
        else return this[key]
      },
    })
  }

  initWatch () {
    this.dataNotifyChain = {}
  }

  notifyDataChange (key, pre, val) {
    (this.dataNotifyChain[key] || []).forEach(cb => cb(pre, val))
  }

  createDom (vnode) {
    const el = document.createElement(vnode.tag)
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
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
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
}

export default Vue
