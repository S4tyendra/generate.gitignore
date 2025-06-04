import { gitignorefiles } from './gitignorefiles.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    return handleAPI(url, request)
  }
  
//   return new Response(HTML_CONTENT, {
//     headers: { 'Content-Type': 'text/html' }
//   })
    return env.ASSETS.fetch(request);
}

async function handleAPI(url, request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  switch (url.pathname) {
    case '/api/search':
      const query = url.searchParams.get('q') || ''
      const results = gitignorefiles.filter(file => 
        file.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 50) // Limit results
      
      return new Response(JSON.stringify(results), { headers: corsHeaders })

    case '/api/generate':
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }
      
      const { templates } = await request.json()
      let combined = ''
      
      for (const templateName of templates) {
        const template = gitignorefiles.find(t => t.title === templateName)
        if (template) {
          const decoded = atob(template.contents)
          combined += `# ${templateName}\n${decoded}\n\n`
        }
      }
      
      return new Response(JSON.stringify({ content: combined }), { headers: corsHeaders })

    default:
      return new Response('Not found', { status: 404 })
  }
}
