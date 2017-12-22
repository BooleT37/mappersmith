import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import EncodeJsonMiddleware, { CONTENT_TYPE_JSON } from 'src/middlewares/encode-json'

describe('Middleware / EncodeJson', () => {
  let methodDescriptor, request, body, middleware

  beforeEach(() => {
    body = { nice: 'object' }
    methodDescriptor = new MethodDescriptor({ method: 'post' })
    request = new Request(methodDescriptor, { body })
    middleware = EncodeJsonMiddleware()
  })

  it('exposes name', () => {
    expect(EncodeJsonMiddleware.name).toEqual('EncodeJsonMiddleware')
  })

  it('stringify the body and add "content-type" application/json', () => {
    const newRequest = middleware.request(request)
    expect(newRequest.body()).toEqual(JSON.stringify(body))
    expect(newRequest.headers()['content-type']).toEqual(CONTENT_TYPE_JSON)
  })

  describe('when the request does not have a body', () => {
    it('returns the original request', () => {
      request = new Request(new MethodDescriptor({ method: 'get' }))
      expect(request.body()).toBeUndefined()

      const newRequest = middleware.request(request)
      expect(newRequest.body()).toBeUndefined()
      expect(newRequest.headers()['content-type']).toBeUndefined()
    })
  })

  describe('when body is an invalid JSON', () => {
    beforeEach(() => {
      const data = {}
      data.attr = data
      body = data
      request = new Request(methodDescriptor, { body })
    })

    it('keeps the original request', () => {
      const newRequest = middleware.request(request)
      expect(newRequest.body()).toEqual(body)
      expect(newRequest.headers()).toEqual({})
    })
  })
})
