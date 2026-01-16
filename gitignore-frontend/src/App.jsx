'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, X, Download, Copy, FileText, Sparkles, Zap, Code2, Check, Loader2, ArrowLeft, Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'

// Extracted components for better performance
const Background = React.memo(() => (
  <>
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30" />
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
    <div className="fixed inset-0 opacity-30" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }} />
  </>
))

const Header = React.memo(() => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8 lg:mb-12"
  >
    <div className="flex items-center justify-center gap-2 lg:gap-3 mb-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="p-2 lg:p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"
      >
        <Sparkles className="w-4 h-4 lg:w-6 lg:h-6" />
      </motion.div>
      <div className="flex items-center gap-1 lg:gap-2">
        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight py-1">
          .gitignore
        </h1>
        <span className="text-3xl lg:text-5xl font-light text-gray-300 leading-tight">generator</span>
      </div>
    </div>
    
    <p className="text-lg lg:text-xl text-gray-400 mb-4 lg:mb-6 px-4">
      Create powerful .gitignore files for your projects ⚡
    </p>
  </motion.div>
))

const Footer = React.memo(() => (
  <motion.footer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="relative z-10 pb-8 text-center text-gray-500 text-sm px-4"
  >
    <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
      <span>Built with 💜 by <span className="text-purple-400 cursor-pointer"><a href='https://satyendra.in'>@S4tyendra</a></span></span>
      <span className="hidden sm:inline">•</span>
      <span>Powered by Cloudflare Workers</span>
    </p>
  </motion.footer>
))

// Suggestion Item Component - Memoized for performance
const SuggestionItem = React.memo(({ 
  suggestion, 
  index, 
  selectedIndex, 
  onSelect 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.02 }}
    onClick={() => onSelect(suggestion.title)}
    className={`px-4 py-3 cursor-pointer border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/50 transition-all duration-200 ${
      index === selectedIndex ? 'bg-purple-600/20 border-purple-500/50' : ''
    }`}
  >
    <div className="flex items-center gap-2">
      <Code2 className="w-4 h-4 text-gray-400" />
      <span className="text-white">{suggestion.title}</span>
    </div>
  </motion.div>
))

// Template Badge Component - Stabilized animations
const TemplateBadge = React.memo(({ 
  template, 
  index, 
  onRemove 
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ 
      layout: { duration: 0.2 },
      initial: { delay: index * 0.02 }
    }}
    className="flex items-center justify-between p-3 bg-purple-600/30 text-purple-200 border border-purple-500/40 rounded-lg hover:bg-purple-600/40 transition-all duration-200 group cursor-pointer backdrop-blur-sm shadow-lg"
  >
    <span className="text-sm font-medium">{template}</span>
    <X 
      className="w-4 h-4 group-hover:text-red-400 transition-colors cursor-pointer ml-2" 
      onClick={(e) => {
        e.stopPropagation()
        onRemove(template)
      }}
    />
  </motion.div>
))

// Main Search Panel Component - Now external for stability
const SearchPanel = React.memo(({ 
  searchQuery,
  setSearchQuery,
  isSearching,
  showSuggestions,
  filteredSuggestions,
  selectedIndex,
  selectedTemplates,
  onKeyDown,
  onSelectTemplate,
  onRemoveTemplate,
  onGenerate,
  onClearAll,
  isGenerating,
  isMobile
}) => {
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  return (
    <motion.div
      layoutId="search-panel"
      className={`bg-gray-900/70 border-gray-800/50 backdrop-blur-xl shadow-2xl shadow-purple-500/10 rounded-lg p-4 lg:p-6 h-full flex flex-col ${
        !isMobile ? 'border' : ''
      }`}
    >
      <motion.div
        layoutId="header-section"
        className="mb-4 lg:mb-6"
      >
        <motion.h2 
          layoutId="main-title"
          className="text-lg lg:text-xl font-semibold text-white mb-2 flex items-center gap-2"
        >
          <Search className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
          Search Templates
        </motion.h2>
        <motion.p 
          layoutId="subtitle"
          className="text-gray-400 text-xs lg:text-sm"
        >
          Find and combine templates for your tech stack
        </motion.p>
      </motion.div>

      <motion.div
        layoutId="search-container"
        className="relative mb-4 lg:mb-6"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search templates..."
          className="pl-10 pr-10 bg-gray-800/70 border-gray-700/50 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder-gray-400 backdrop-blur-sm h-10 lg:h-12"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-purple-400" />
        )}

        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800/90 border border-gray-700/50 rounded-lg shadow-2xl backdrop-blur-xl max-h-48 lg:max-h-64 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={suggestion.title}
                  suggestion={suggestion}
                  index={index}
                  selectedIndex={selectedIndex}
                  onSelect={onSelectTemplate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 lg:mb-6 flex-1 min-h-0"
          >
            <p className="text-xs lg:text-sm text-gray-400 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              Selected Templates ({selectedTemplates.length})
            </p>
            <motion.div 
              layout
              className="space-y-2 max-h-32 lg:max-h-40 overflow-y-auto"
            >
              <AnimatePresence>
                {selectedTemplates.map((template, index) => (
                  <TemplateBadge
                    key={template}
                    template={template}
                    index={index}
                    onRemove={onRemoveTemplate}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layoutId="action-button" className="mt-auto space-y-3">
        <Button
          onClick={onGenerate}
          disabled={selectedTemplates.length === 0 || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/30 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] h-10 lg:h-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Generate .gitignore ({selectedTemplates.length > 0 && (
      <> ({selectedTemplates.length})</>
    )})
            </>
          )}
        </Button>
        
        {selectedTemplates.length > 0 && (
          <Button
            variant="outline"
            onClick={onClearAll}
            className="w-full border-gray-500/70 bg-gray-800/50 text-gray-100 hover:bg-red-600/20 hover:border-red-500/70 hover:text-red-200 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] h-10 lg:h-auto"
          >
            <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Clear All
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
})

const GitignoreGenerator = () => {
  const [currentView, setCurrentView] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editorLoading, setEditorLoading] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const debounceTimerRef = useRef(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Stable filtered suggestions - removed selectedTemplates dependency to prevent rerenders
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((t) => !selectedTemplates.some(selected => selected === t.title))
  }, [suggestions, selectedTemplates])

  // Optimized search function - removed unnecessary dependencies
  const searchTemplates = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const results = await response.json()
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Search failed:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
    setIsSearching(false)
  }, [])

  // Debounced search effect - now stable
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      searchTemplates(searchQuery)
    }, 200)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, searchTemplates])

  const generateGitignore = useCallback(async () => {
    if (selectedTemplates.length === 0) return

    setIsGenerating(true)
    setEditorLoading(true)
    setCurrentView('editor')
    setIsMobileDrawerOpen(false) // Close mobile drawer
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: selectedTemplates })
      })
      const result = await response.json()
      setGeneratedContent(result.content)
      setTimeout(() => setEditorLoading(false), 800)
    } catch (error) {
      console.error('Generation failed:', error)
      setEditorLoading(false)
    }
    setIsGenerating(false)
  }, [selectedTemplates])

  const handleBackToSearch = useCallback(() => {
    setCurrentView('search')
    setGeneratedContent('')
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          selectTemplate(filteredSuggestions[selectedIndex].title)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }, [showSuggestions, filteredSuggestions, selectedIndex])

  const selectTemplate = useCallback((template) => {
    if (!selectedTemplates.includes(template)) {
      setSelectedTemplates(prev => [...prev, template])
    }
    setSearchQuery('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }, [selectedTemplates])

  const removeTemplate = useCallback((template) => {
    setSelectedTemplates(prev => prev.filter(t => t !== template))
  }, [])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [generatedContent])

  const downloadFile = useCallback(() => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.gitignore'
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedContent])

  const clearAllTemplates = useCallback(() => {
    setSelectedTemplates([])
  }, [])

  // Mobile drawer trigger
  const MobileDrawerTrigger = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsMobileDrawerOpen(true)}
      className="border-gray-500/70 bg-gray-800/50 text-gray-100 hover:bg-purple-600/20 hover:border-purple-500/70 backdrop-blur-sm lg:hidden"
    >
      <Menu className="w-4 h-4 mr-2" />
      Templates ({selectedTemplates.length})
    </Button>
  )

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <Background />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-2xl">
            <Header />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SearchPanel
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearching={isSearching}
                showSuggestions={showSuggestions}
                filteredSuggestions={filteredSuggestions}
                selectedIndex={selectedIndex}
                selectedTemplates={selectedTemplates}
                onKeyDown={handleKeyDown}
                onSelectTemplate={selectTemplate}
                onRemoveTemplate={removeTemplate}
                onGenerate={generateGitignore}
                onClearAll={clearAllTemplates}
                isGenerating={isGenerating}
                isMobile={false}
              />
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  // Mobile layout with drawer
  if (isMobile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Background />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSearch}
                className="p-2 hover:bg-gray-700 text-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <h1 className="text-lg font-semibold text-white">Your .gitignore</h1>
                <p className="text-xs text-gray-400">Edit and download</p>
              </div>

              <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                <SheetTrigger asChild>
                  <MobileDrawerTrigger />
                </SheetTrigger>
                <SheetContent side="right" className="w-full bg-black border-l border-gray-700/50 p-0">
                  <div className="h-full flex flex-col">
                    <SheetHeader className="p-4 border-b border-gray-700/50">
                      <SheetTitle className="text-white text-left">Templates</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 p-4">
                      <SearchPanel
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isSearching={isSearching}
                        showSuggestions={showSuggestions}
                        filteredSuggestions={filteredSuggestions}
                        selectedIndex={selectedIndex}
                        selectedTemplates={selectedTemplates}
                        onKeyDown={handleKeyDown}
                        onSelectTemplate={selectTemplate}
                        onRemoveTemplate={removeTemplate}
                        onGenerate={generateGitignore}
                        onClearAll={clearAllTemplates}
                        isGenerating={isGenerating}
                        isMobile={true}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Editor */}
          <div className="flex-1 p-4">
            <Card className="bg-gray-900/70 border-gray-800/50 backdrop-blur-xl shadow-2xl shadow-purple-500/10 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <FileText className="w-4 h-4 text-blue-400" />
                    .gitignore File
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      disabled={editorLoading}
                      className="border-gray-500/70 bg-gray-800/50 text-gray-100 hover:bg-green-600/20 hover:border-green-500/70"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      onClick={downloadFile}
                      disabled={editorLoading}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <div className="border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30 relative h-full">
                  {editorLoading ? (
                    <div className="h-full flex items-center justify-center bg-gray-900/50">
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mx-auto w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                        />
                        <div className="text-gray-400">
                          <p className="text-sm">Loading editor...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Editor
                      height="75vh"
                      value={generatedContent}
                      onChange={(value) => setGeneratedContent(value || '')}
                      language="plaintext"
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineHeight: 1.6,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        wordWrap: 'on',
                        automaticLayout: true
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Desktop split layout
  return (
    <div className="min-h-screen bg-black text-white">
      <Background />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Sidebar - 30% */}
        <div className="w-[30%] bg-gray-800/50 border-r border-gray-700/50 p-4">
          <SearchPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            showSuggestions={showSuggestions}
            filteredSuggestions={filteredSuggestions}
            selectedIndex={selectedIndex}
            selectedTemplates={selectedTemplates}
            onKeyDown={handleKeyDown}
            onSelectTemplate={selectTemplate}
            onRemoveTemplate={removeTemplate}
            onGenerate={generateGitignore}
            onClearAll={clearAllTemplates}
            isGenerating={isGenerating}
            isMobile={false}
          />
        </div>

        {/* Right Content Area - 70% */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="editor"
              layoutId="editor-panel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card className="bg-gray-900/70 border-gray-800/50 backdrop-blur-xl shadow-2xl shadow-purple-500/10 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToSearch}
                        className="p-2 hover:bg-gray-700 text-gray-300"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                          <FileText className="w-5 h-5 text-blue-400" />
                          Your .gitignore File
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Edit, copy, or download your generated .gitignore
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        disabled={editorLoading}
                        className="border-gray-500/70 bg-gray-800/50 text-gray-100 hover:bg-green-600/20 hover:border-green-500/70 hover:text-green-200 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1 text-green-400 animate-bounce" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={downloadFile}
                        disabled={editorLoading}
                        className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4 mr-1 group-hover:translate-y-1 transition-transform duration-300" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <div className="border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm bg-gray-800/30 relative h-full">
                    {editorLoading ? (
                      <div className="h-full flex items-center justify-center bg-gray-900/50">
                        <div className="text-center space-y-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mx-auto w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                          />
                          <div className="text-gray-400">
                            <p className="text-sm">Loading editor...</p>
                            <p className="text-xs text-gray-500 mt-1">Preparing your .gitignore file</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Editor
                        height="100%"
                        value={generatedContent}
                        onChange={(value) => setGeneratedContent(value || '')}
                        language="plaintext"
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                          lineHeight: 1.6,
                          padding: { top: 16, bottom: 16 },
                          smoothScrolling: true,
                          cursorBlinking: 'smooth',
                          renderLineHighlight: 'gutter',
                          bracketPairColorization: { enabled: true },
                          wordWrap: 'on',
                          automaticLayout: true
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default GitignoreGenerator
