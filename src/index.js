import _ from 'lodash'
import URI from 'urijs'
import {fetchAndApply} from './util'
import routes from './routes'

addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

async function handle(request) {
  const requestUri = new URI(request.url)
  const pathname = requestUri.pathname()

  let matchedRoutes = routes.filter(route => {
    const {location} = route
    return pathname.startsWith(location)
  })
  matchedRoutes = _.orderBy(matchedRoutes, [route => route.location.length], ['desc'])

  const res404 = new Response('request can not be handled', {status: 404})
  if (!matchedRoutes.length) return res404.clone()
  const route = matchedRoutes[0]

  const {location, proxyPass, replace} = route
  const proxyPassUri = new URI(proxyPass)
  const noPathProvided = proxyPassUri.origin() === proxyPass

  const targetUri = new URI(request.url)
  if (noPathProvided) {
    // no path
    // targetUrl = proxyPass + request-path
    targetUri.origin(proxyPassUri.origin())
  } else {
    // has path
    const newpathname = requestUri
      .pathname()
      .replace(new RegExp('^' + location), proxyPassUri.pathname())
    targetUri.origin(proxyPassUri.origin()).pathname(newpathname)
  }

  const targetUrl = targetUri.toString()
  // return new Response(targetUrl, {status: 200})

  const response = await fetchAndApply({request, targetUri, replace})
  return response
}
