import Vue from '../src'

describe('Lifecycle', function () {
  const cb = jasmine.createSpy('cb')
  it('mounted', function () {
    new Vue({
      mounted () {
        cb()
      },
      render (h) {
        return h('div', null, 'hello')
      },
    }).$mount()
    expect(cb).toHaveBeenCalled()
  })
})
