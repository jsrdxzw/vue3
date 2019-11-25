let _target = null

export function createProxy (vueInstance) {
  function collect (key) {
    // _target is set in Watcher's constructor
    if (_target) {
      vueInstance.$watch(key, _target.update.bind(_target))
    }
  }

  const createDataProxyHandler = path => {
    return {
      // 这里的get和set只是普通的对象
      set: (obj, key, value) => {
        // 深度监听，需要一个key来作为通知的key
        const fullPath = path ? path + '.' + key : key
        const pre = obj[key]
        obj[key] = value
        vueInstance.notifyChange(fullPath, pre, value)
        return true
      },
      get: (obj, key) => {
        const fullPath = path ? path + '.' + key : key
        collect(fullPath)
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
          vueInstance.notifyChange(fullPath, pre)
        }
        return true
      },
    }
  }

  const data = vueInstance.$data = vueInstance.$options.data ? vueInstance.$options.data() : {}
  const props = vueInstance._props
  const methods = vueInstance.$options.methods || {}
  const computed = vueInstance.$options.computed || {}

  const handler = {
    set: (_, key, value) => {
      const pre = data[key]
      if (pre !== value) {
        if (key in data) {
          data[key] = value
          vueInstance.notifyChange(key, pre, value)
        } else {
          vueInstance[key] = value
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
      } else if (key in computed) {
        return computed[key].call(vueInstance.proxy)
      } else if (key in methods) {
        return methods[key].bind(vueInstance.proxy)
      } else {
        return vueInstance[key]
      }
    },
    deleteProperty: (_, key) => {
      if (key in data) {
        return createDataProxyHandler().deleteProperty(data, key)
      }
    },
  }

  return new Proxy(vueInstance, handler)
}

export function setTarget (target) {
  _target = target
}

export function clearTarget () {
  _target = null
}
