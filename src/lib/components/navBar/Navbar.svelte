<!-- TopNavbar.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  
  // Get current path for active state
  $: currentPath = page.url.pathname;
</script>

<nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo/Brand -->
      <div class="flex-shrink-0">
        <h1 class="text-xl font-semibold text-gray-900">RAG Chatbot</h1>
      </div>
      
      <!-- Navigation Links -->
      <div class="flex space-x-8">
        <a 
          href="/upload" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors {currentPath === '/upload' || currentPath.startsWith('/upload') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="12" y2="12"></line>
            <line x1="15" y1="15" x2="12" y2="12"></line>
          </svg>
          Upload Files
        </a>
        
        <a 
          href="/chat" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors {currentPath === '/chat' || currentPath.startsWith('/chat') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
          </svg>
          Chat
        </a>
      </div>
    </div>
  </div>
</nav>