import Vue from "../src";

describe('Proxy test', function() {
    it('should proxy vm._data.a = vm.a', function() {
        const vm = new Vue({
            data() {
                return {
                    a: 2
                }
            }
        })
        expect(vm.a).toEqual(2)
    })
})
