import Vue from '../src'

describe('Mvvm', function () {
  it('Basic', function () {
    const vm = new Vue({
      data () {
        return {
          a: 0,
        }
      },
      render (h) {
        return h('div', null, this.a)
      },
    }).$mount()
    vm.a++
    expect(vm.$el.textContent).toEqual('1')
    vm.a = 999
    expect(vm.$el.textContent).toEqual('999')
  })
})
