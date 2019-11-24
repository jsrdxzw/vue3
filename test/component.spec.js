import Vue from '../src'

describe('component', function () {
  it('render vnode with component', function () {
    const vm = new Vue({
      data () {
        return { msg1: 'hello', msg2: 'world' }
      },
      render (h) {
        return h('div', null, [
          h('my-component', { props: { msg: this.msg1 } }),
          h('my-component', { props: { msg: this.msg2 } }),
        ])
      },
      components: {
        'my-component': {
          props: ['msg'],
          render (h) {
            return h('p', null, this.msg)
          },
        },
      },
    }).$mount()

    expect(vm.$el.outerHTML).toEqual(`<div><p>hello</p><p>world</p></div>`)
  })

  it('event & action', () => {
    const cb = jasmine.createSpy('cb')

    const vm = new Vue({
      render (h) {
        return h('my-component', { on: {
            mounted: cb
          }})
      },
      components: {
        'my-component': {
          render (h) {
            return h('div', {}, 'my-component')
          },
          mounted () {
            this.$emit('mounted', {payload: "payload"})
          }
        }
      }
    }).$mount()

    expect(cb).withContext(vm)
    expect(cb).toHaveBeenCalledWith({payload: "payload"})
  })
})
