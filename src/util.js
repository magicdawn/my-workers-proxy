export async function fetchAndApply({request, targetUri, replace = {}}) {
  const region = request.headers.get('cf-ipcountry').toUpperCase()
  const ip_address = request.headers.get('cf-connecting-ip')
  const user_agent = request.headers.get('user-agent')

  let method = request.method
  let request_headers = request.headers
  let new_request_headers = new Headers(request_headers)

  new_request_headers.set('Host', targetUri.hostname())
  new_request_headers.set('Referer', targetUri.hostname())

  let original_response = await fetch(targetUri.href(), {
    method: method,
    headers: new_request_headers,
  })

  {
    const res = original_response.clone()
    const text = await res.text()
    console.log({'res.text': text, 'headers': res.headers})
  }

  let original_response_clone = original_response.clone()
  let original_text = null
  let response_headers = original_response.headers
  let new_response_headers = new Headers(response_headers)
  let status = original_response.status

  new_response_headers.set('access-control-allow-origin', '*')
  new_response_headers.set('access-control-allow-credentials', true)
  new_response_headers.delete('content-security-policy')
  new_response_headers.delete('content-security-policy-report-only')
  new_response_headers.delete('clear-site-data')

  const content_type = new_response_headers.get('content-type')
  const isUtf8 = ['utf8', 'utf-8'].some(s => content_type.toLowerCase().includes(s))
  if (content_type.includes('text/html') && isUtf8) {
    original_text = await handleReplace({
      request,
      response: original_response_clone,
      targetUri,
      replace,
    })
  } else {
    original_text = original_response_clone.body
  }

  const response = new Response(original_text, {
    status,
    headers: new_response_headers,
  })
  return response
}

export async function handleReplace({request, targetUri, response, replace}) {
  let text = await response.text()
  for (let [key, value] in Object.entries(replace)) {
    const reg = new RegExp(key, 'g')
    text = text.replace(reg, value)
  }
  return text
}

export function isMobile(user_agent_info) {
  let agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = false
  for (let v = 0; v < agents.length; v++) {
    if (user_agent_info.indexOf(agents[v]) > 0) {
      flag = true
      break
    }
  }
  return flag
}
