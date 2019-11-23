import Vue from '../src'

describe('Event test', function () {
  it('Basic', function () {
    const cb = jasmine.createSpy('cb')
    const vm = new Vue({
      render (h) {
        return h('button', {
          class: 'btn',
          on: {
            'click': cb,
          },
        })
      },
    }).$mount()
    document.body.appendChild(vm.$root)
    const btn = document.querySelector('.btn')
    expect(btn.tagName).toEqual('BUTTON')
    btn.click()
    expect(cb).toHaveBeenCalled()
  })
})
