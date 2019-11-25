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
