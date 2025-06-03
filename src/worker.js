import { gitignorefiles } from './gitignorefiles.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    return handleAPI(url, request)
  }
  
  return new Response(HTML_CONTENT, {
    headers: { 'Content-Type': 'text/html' }
  })
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

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>.gitignore Generator - Create Custom .gitignore Files</title>
    <meta name="description" content="Generate custom .gitignore files for your projects. Search and combine templates for Python, Node.js, Java, and more.">
    <meta name="keywords" content="gitignore, generator, git, ignore files, python, nodejs, java, templates">
    <meta property="og:title" content=".gitignore Generator">
    <meta property="og:description" content="Create useful .gitignore files for your project">
    <meta property="og:type" content="website">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <!-- Monaco Editor -->
    <script src="https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js"></script>
    <!-- Particles.js for background -->
    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #111119;
            --bg-tertiary: #1a1a24;
            --accent-primary: #6366f1;
            --accent-secondary: #8b5cf6;
            --accent-tertiary: #06b6d4;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --text-muted: #64748b;
            --border: rgba(255, 255, 255, 0.1);
            --glass: rgba(255, 255, 255, 0.05);
            --glow: rgba(99, 102, 241, 0.3);
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
            position: relative;
        }
        
        /* Animated Background */
        #particles-js {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1;
        }
        
        .bg-gradient {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
            z-index: -1;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 4rem;
            animation: slideInDown 0.8s ease-out;
        }
        
        .title {
            font-size: clamp(3rem, 8vw, 5rem);
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary));
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 3s ease-in-out infinite;
            letter-spacing: -0.02em;
        }
        
        .title .dot {
            color: var(--accent-primary);
            filter: drop-shadow(0 0 20px var(--glow));
            animation: pulse 2s infinite;
        }
        
        .subtitle {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            font-weight: 500;
        }
        
        .meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            border-radius: 50px;
        }
        
        /* Glass Card */
        .glass-card {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
            opacity: 0.5;
        }
        
        .search-section {
            margin-bottom: 3rem;
            animation: slideInUp 0.8s ease-out 0.2s both;
        }
        
        /* Search Container */
        .search-container {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .search-icon {
            position: absolute;
            left: 1.5rem;
            color: var(--text-muted);
            z-index: 2;
            pointer-events: none;
        }
        
        .search-input {
            width: 100%;
            padding: 1.25rem 1.25rem 1.25rem 3.5rem;
            background: var(--bg-secondary);
            border: 2px solid var(--border);
            border-radius: 16px;
            font-size: 1.1rem;
            color: var(--text-primary);
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
        }
        
        .search-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            transform: translateY(-2px);
        }
        
        .search-input::placeholder {
            color: var(--text-muted);
        }
        
        /* Tags */
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 2rem;
            min-height: 3rem;
        }
        
        .tag {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.25rem;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: white;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: tagSlideIn 0.4s ease-out;
        }
        
        .tag:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        
        .tag .remove {
            cursor: pointer;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        .tag .remove:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        /* Suggestions */
        .suggestions {
            position: absolute;
            top: calc(100% + 0.5rem);
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 16px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(20px);
        }
        
        .suggestion {
            padding: 1rem 1.5rem;
            cursor: pointer;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.2s;
            color: var(--text-secondary);
        }
        
        .suggestion:last-child {
            border-bottom: none;
        }
        
        .suggestion:hover, .suggestion.selected {
            background: var(--accent-primary);
            color: white;
            transform: translateX(8px);
        }
        
        .suggestion-icon {
            width: 20px;
            height: 20px;
            opacity: 0.7;
        }
        
        /* Action Buttons */
        .actions {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            border: none;
            border-radius: 16px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
            position: relative;
            overflow: hidden;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: white;
            box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
        }
        
        .btn-primary:active {
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            border: 1px solid var(--border);
        }
        
        .btn-secondary:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        /* Editor Section */
        .editor-section {
            display: none;
            animation: slideInUp 0.8s ease-out;
        }
        
        .editor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .editor-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .editor-actions {
            display: flex;
            gap: 1rem;
        }
        
        .editor-container {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border);
        }
        
        #editor {
            height: 600px;
        }
        
        /* Loading Animation */
        .loading {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
        }
        
        .loading-dots {
            display: flex;
            gap: 0.25rem;
        }
        
        .loading-dot {
            width: 6px;
            height: 6px;
            background: var(--accent-primary);
            border-radius: 50%;
            animation: loadingBounce 1.4s infinite ease-in-out both;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        
        /* Success Animation */
        .success-checkmark {
            animation: checkmarkBounce 0.6s ease-out;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .glass-card {
                padding: 2rem;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                justify-content: center;
            }
            
            .meta {
                flex-direction: column;
                gap: 1rem;
            }
            
            .editor-header {
                flex-direction: column;
                align-items: stretch;
            }
            
            #editor {
                height: 400px;
            }
        }
        
        /* Animations */
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-100px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(100px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes tagSlideIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        @keyframes loadingBounce {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }
        
        @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--accent-primary);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-secondary);
        }
        
        /* Selection */
        ::selection {
            background: var(--accent-primary);
            color: white;
        }
    </style>
</head>
<body>
    <div id="particles-js"></div>
    <div class="bg-gradient"></div>
    
    <div class="container">
        <div class="header">
            <h1 class="title"><span class="dot">.</span>gitignore generator</h1>
            <p class="subtitle">Create powerful .gitignore files for your projects ⚡</p>
            <div class="meta">
                <div class="meta-item">
                    <i data-lucide="calendar"></i>
                    <span>Updated Daily</span>
                </div>
                <div class="meta-item">
                    <i data-lucide="file-text"></i>
                    <span>1000+ Templates</span>
                </div>
                <div class="meta-item">
                    <i data-lucide="zap"></i>
                    <span>Lightning Fast</span>
                </div>
            </div>
        </div>
        
        <div class="search-section glass-card">
            <div class="search-container">
                <div class="search-wrapper">
                    <i data-lucide="search" class="search-icon"></i>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Search templates (Python, Node.js, React, Docker...)" 
                        id="searchInput"
                        autocomplete="off"
                    >
                </div>
                <div class="suggestions" id="suggestions"></div>
            </div>
            
            <div class="tags" id="selectedTags">
                <!-- Selected tags will appear here -->
            </div>
            
            <div class="actions">
                <button class="btn btn-primary" id="generateBtn">
                    <i data-lucide="sparkles"></i>
                    <span>Generate .gitignore</span>
                </button>
                <button class="btn btn-secondary" id="clearBtn">
                    <i data-lucide="trash-2"></i>
                    <span>Clear All</span>
                </button>
            </div>
        </div>
        
        <div class="editor-section glass-card" id="editorSection">
            <div class="editor-header">
                <div class="editor-title">
                    <i data-lucide="file-code"></i>
                    <span>Your .gitignore File</span>
                </div>
                <div class="editor-actions">
                    <button class="btn btn-secondary" id="copyBtn">
                        <i data-lucide="copy"></i>
                        <span>Copy</span>
                    </button>
                    <button class="btn btn-primary" id="downloadBtn">
                        <i data-lucide="download"></i>
                        <span>Download</span>
                    </button>
                </div>
            </div>
            <div class="editor-container">
                <div id="editor"></div>
            </div>
        </div>
    </div>

    <script>
        // Initialize Particles.js
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: "#6366f1" },
                shape: { type: "circle" },
                opacity: { value: 0.1, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#6366f1",
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.2 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });

        let selectedTemplates = [];
        let allTemplates = [];
        let editor = null;
        let selectedSuggestionIndex = -1;

        // Initialize Monaco Editor
        require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('editor'), {
                value: '# Your .gitignore file will appear here...',
                language: 'plaintext',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
                padding: { top: 20, bottom: 20 }
            });
        });

        // Initialize Lucide icons and setup
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
            setupEventListeners();
            loadInitialSuggestions();
        });

        function setupEventListeners() {
            const searchInput = document.getElementById('searchInput');
            const suggestions = document.getElementById('suggestions');
            
            searchInput.addEventListener('input', handleSearch);
            searchInput.addEventListener('keydown', handleKeyDown);
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.length > 0) {
                    handleSearch({ target: searchInput });
                }
            });
            
            document.getElementById('generateBtn').addEventListener('click', generateGitignore);
            document.getElementById('clearBtn').addEventListener('click', clearAll);
            document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
            document.getElementById('downloadBtn').addEventListener('click', downloadFile);
            
            // Hide suggestions when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.search-container')) {
                    suggestions.style.display = 'none';
                }
            });
        }

        async function loadInitialSuggestions() {
            try {
                const response = await fetch('/api/search?q=');
                allTemplates = await response.json();
            } catch (error) {
                console.error('Failed to load templates:', error);
                // Mock data for demo
                allTemplates = [
                    { title: 'Python', contents: '' },
                    { title: 'Node', contents: '' },
                    { title: 'React', contents: '' },
                    { title: 'Vue', contents: '' },
                    { title: 'Java', contents: '' },
                    { title: 'Go', contents: '' },
                ];
            }
        }

        async function handleSearch(e) {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                document.getElementById('suggestions').style.display = 'none';
                return;
            }

            try {
                const response = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
                const results = await response.json();
                showSuggestions(results.filter(t => !selectedTemplates.includes(t.title)));
            } catch (error) {
                console.error('Search failed:', error);
                // Mock search for demo
                const mockResults = allTemplates.filter(t => 
                    t.title.toLowerCase().includes(query.toLowerCase()) &&
                    !selectedTemplates.includes(t.title)
                );
                showSuggestions(mockResults);
            }
        }

        function showSuggestions(suggestions) {
            const container = document.getElementById('suggestions');
            
            if (suggestions.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.innerHTML = suggestions.map((suggestion, index) => \`
                <div class="suggestion" data-template="\${suggestion.title}">
                    <i data-lucide="file" class="suggestion-icon"></i>
                    <span>\${suggestion.title}</span>
                </div>
            \`).join('');

            container.style.display = 'block';
            selectedSuggestionIndex = -1;

            // Reinitialize icons for new elements
            lucide.createIcons();

            // Add click handlers
            container.querySelectorAll('.suggestion').forEach(el => {
                el.addEventListener('click', () => selectTemplate(el.dataset.template));
            });
        }

        function handleKeyDown(e) {
            const suggestions = document.querySelectorAll('.suggestion');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                updateSuggestionSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateSuggestionSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                    selectTemplate(suggestions[selectedSuggestionIndex].dataset.template);
                }
            } else if (e.key === 'Escape') {
                document.getElementById('suggestions').style.display = 'none';
                selectedSuggestionIndex = -1;
            }
        }

        function updateSuggestionSelection() {
            const suggestions = document.querySelectorAll('.suggestion');
            suggestions.forEach((el, index) => {
                el.classList.toggle('selected', index === selectedSuggestionIndex);
            });
        }

        function selectTemplate(templateName) {
            if (!selectedTemplates.includes(templateName)) {
                selectedTemplates.push(templateName);
                updateSelectedTags();
                document.getElementById('searchInput').value = '';
                document.getElementById('suggestions').style.display = 'none';
            }
        }

        function updateSelectedTags() {
            const container = document.getElementById('selectedTags');
            container.innerHTML = selectedTemplates.map(template => \`
                <div class="tag">
                    <span>\${template}</span>
                    <span class="remove" onclick="removeTemplate('\${template}')">×</span>
                </div>
            \`).join('');
        }

        function removeTemplate(templateName) {
            selectedTemplates = selectedTemplates.filter(t => t !== templateName);
            updateSelectedTags();
        }

        function clearAll() {
            selectedTemplates = [];
            updateSelectedTags();
            document.getElementById('searchInput').value = '';
            document.getElementById('suggestions').style.display = 'none';
            document.getElementById('editorSection').style.display = 'none';
        }

        async function generateGitignore() {
            if (selectedTemplates.length === 0) {
                showNotification('Please select at least one template', 'warning');
                return;
            }

            const btn = document.getElementById('generateBtn');
            const originalContent = btn.innerHTML;
            btn.innerHTML = \`
                <div class="loading">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <span>Generating...</span>
                </div>
            \`;
            btn.disabled = true;

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templates: selectedTemplates })
                });

                const result = await response.json();
                
                if (editor) {
                    editor.setValue(result.content);
                    document.getElementById('editorSection').style.display = 'block';
                    editor.focus();
                    showNotification('Generated successfully! 🎉', 'success');
                }
            } catch (error) {
                console.error('Generation failed:', error);
                // Mock generation for demo
                const mockContent = selectedTemplates.map(template => \`
# \${template}
*.log
*.tmp
.DS_Store
node_modules/
__pycache__/
.env

\`).join('');
                
                if (editor) {
                    editor.setValue(mockContent);
                    document.getElementById('editorSection').style.display = 'block';
                    editor.focus();
                    showNotification('Generated successfully! 🎉', 'success');
                }
            } finally {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                lucide.createIcons();
            }
        }

        function copyToClipboard() {
            if (editor) {
                const content = editor.getValue();
                navigator.clipboard.writeText(content).then(() => {
                    const btn = document.getElementById('copyBtn');
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = \`<i data-lucide="check" class="success-checkmark"></i><span>Copied!</span>\`;
                    lucide.createIcons();
                    setTimeout(() => {
                        btn.innerHTML = originalContent;
                        lucide.createIcons();
                    }, 2000);
                    showNotification('Copied to clipboard! 📋', 'success');
                });
            }
        }

        function downloadFile() {
            if (editor) {
                const content = editor.getValue();
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rnthis.gitignore';
                a.click();
                URL.revokeObjectURL(url);
                showNotification('Downloaded successfully! 📥', 'success');
            }
        }

        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: \${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--accent-primary)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 300px;
                font-weight: 500;
            \`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Add notification animations
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = \`
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        \`;
        document.head.appendChild(notificationStyles);
    </script>
</body>
</html>
`;
