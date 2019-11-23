import Vue from '../src'

describe('Method', function () {
  it('Basic', function () {
    const vm = new Vue({
      methods: {
        hello () {
          return {
            self: this,
            msg: 'hello',
          }
        },
      },
    })
    const ret = vm.hello()
    expect(ret.self).toEqual(vm)
    expect(ret.msg).toEqual('hello')
  })
})
