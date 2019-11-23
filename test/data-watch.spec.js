import Vue from "../src";

describe('Watch data change', function () {
    it('cb is called', function () {
        const vm = new Vue({
            data() {
                return {
                    a: 2
                }
            }
        })
        vm.$watch('a', function (pre, val) {
            expect(pre).toEqual(2)
            expect(val).toEqual(3)
        })
        vm.a = 2
    })
})
