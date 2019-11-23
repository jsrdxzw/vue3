import VNode from './vnode'

class Vue {
  constructor (options) {
    this.$options = options
    const proxy = this.initDataProxy()
    this.initWatch()
    return proxy
  }

  $watch (key, cb) {
    this.dataNotifyChain[key] = this.dataNotifyChain[key] || []
    this.dataNotifyChain[key].push(cb)
  }

  $mount (root) {
    const vnode = this.$options.render(this.createElement)
    this.$root = this.createDom(vnode)
    if (root) {
      root.appendChild(this.$root)
    }
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
        if (key in data) return data[key]
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
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(child => {
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
