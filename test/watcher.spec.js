import Vue from '../src'

describe('Watch', function () {
  it('Data', function () {
    const cb = jasmine.createSpy('cb')
    const vm = new Vue({
      data () {
        return {
          a: 2
        }
      },
      watch: {
        a (pre, val) {
          cb(pre, val)
        }
      }
    })
    vm.a = 3
    expect(cb).toHaveBeenCalledWith(2, 3)
  })

  it('Computed', function() {
    const cb = jasmine.createSpy('cb')

    const vm = new Vue({
      data () {
        return {
          a: 2,
        }
      },
      computed: {
        b () {
          return this.a + 1
        }
      },
      watch: {
        b (pre, val) {
          cb(this.b, pre, val)
        }
      },
    })
    expect(vm.b).toEqual(3)
    vm.a = 3
    expect(vm.b).toEqual(4)
    expect(cb).toHaveBeenCalledWith(4, 3, 4)
  })
})
