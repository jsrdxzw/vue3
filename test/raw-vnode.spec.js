import Vue from '../src';

describe('Raw vnode render',function() {
  it('basic usage', function() {
    const vm = new Vue({
      render(h) {
        return h('div', null, 'hello' /* string as children*/)
      }
    }).$mount()

    expect(vm.$el.tagName).toBe('DIV')
    expect(vm.$el.textContent).toBe('hello')
  })
})
