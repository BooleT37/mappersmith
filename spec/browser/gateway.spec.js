import { configs } from 'src/index'
import Gateway from 'src/gateway'
import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import Response from 'src/response'

describe('Gateway', () => {
  let originalConfigs, methodDescriptor, request

  beforeEach(() => {
    if (!originalConfigs) {
      originalConfigs = configs.gatewayConfigs
    }

    methodDescriptor = new MethodDescriptor({ method: 'get' })
    request = new Request(methodDescriptor, {})
  })

  afterEach(() => {
    configs.gatewayConfigs = originalConfigs
  })

  describe('#options', () => {
    it('returns gateway options', () => {
      expect(new Gateway(request, configs.gatewayConfigs).options()).toEqual(configs.gatewayConfigs)
    })
  })

  describe('#shouldEmulateHTTP', () => {
    describe('when "delete", "put" or "patch" and emulateHTTP=true', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = true
      })

      it('returns true', () => {
        methodDescriptor.method = 'delete'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(true)

        methodDescriptor.method = 'put'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(true)

        methodDescriptor.method = 'patch'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(true)
      })
    })

    describe('when "get" or "post" and emulateHTTP=true', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = true
      })

      it('returns false', () => {
        methodDescriptor.method = 'get'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)

        methodDescriptor.method = 'post'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)
      })
    })

    describe('when emulateHTTP=false', () => {
      beforeEach(() => {
        configs.gatewayConfigs.emulateHTTP = false
      })

      it('returns false', () => {
        methodDescriptor.method = 'delete'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)

        methodDescriptor.method = 'put'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)

        methodDescriptor.method = 'patch'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)

        methodDescriptor.method = 'post'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)

        methodDescriptor.method = 'get'
        expect(new Gateway(request, configs.gatewayConfigs).shouldEmulateHTTP()).toEqual(false)
      })
    })
  })

  describe('#call', () => {
    let gateway

    beforeEach(() => {
      gateway = new Gateway(request, configs.gatewayConfigs)
      gateway.get = jasmine.createSpy('GatewayGET')
    })

    it('calls the http method defined in the gateway', () => {
      gateway.call()
      expect(gateway.get).toHaveBeenCalled()
    })

    describe('when successCallback is called', () => {
      it('assigns response.timeElapsed and resolve the promise', (done) => {
        gateway.call()
          .then((response) => {
            expect(response.timeElapsed).not.toBeNull()
            done()
          })
          .catch((response) => {
            const error = response.rawData ? response.rawData() : response
            done.fail(`test failed with promise error: ${error}`)
          })

        gateway.successCallback(new Response({}))
      })
    })

    describe('when failCallback is called', () => {
      it('assigns response.timeElapsed and reject the promise', (done) => {
        gateway.call()
          .then((response) => {
            done.fail(`Expected this promise to fail: ${response}`)
          })
          .catch((response) => {
            expect(response.timeElapsed).not.toBeNull()
            done()
          })

        gateway.failCallback(new Response({}))
      })
    })
  })
})
