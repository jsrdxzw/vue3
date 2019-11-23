import Vue from '../src'

describe('Demo', function () {
  it('Basic', function () {
    const vm = new Vue({
      data () {
        return {
          a: 0,
          b: 1,
        }
      },
      render (h) {
        return h('button', {
          on: {
            'click': this.handleClick,
          },
        }, this.a + this.b)
      },
      methods: {
        handleClick () {
          // this.a++
          this.b = this.b + 2
        },
      },
    }).$mount()
    document.body.append(vm.$el)
  })
})
