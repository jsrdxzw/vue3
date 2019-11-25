import Vue from '../src/index.js'

describe('Next Tick', () => {
  it('Basic', done => {
    const vm = new Vue()

    const cb1 = jasmine.createSpy('cb1')
    const cb2 = jasmine.createSpy('cb2')

    vm.$nextTick(_ => {
      cb1()
      expect(cb2).toHaveBeenCalledBefore(cb1)
      expect(cb1).toHaveBeenCalledTimes(1)
      done()
    })
    cb2()
  })
})
