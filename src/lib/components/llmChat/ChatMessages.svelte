<script lang="ts">
    import { onMount } from "svelte";
    import { renderMessageContent } from "./renderMessage";
    import type { ChatMessage } from "./types";

    let { 
        messages, 
        isLoading, 
        showFilePanel, 
        selectedFiles,
        onToggleFilePanel 
    } = $props<{
        messages: ChatMessage[];
        isLoading: boolean;
        showFilePanel: boolean;
        selectedFiles: string[];
        onToggleFilePanel: () => void;
    }>();

    let messagesEnd = $state<HTMLElement | null>(null);

    // Scroll to bottom when messages change
    $effect(() => {
        if (messages && messagesEnd) {
            messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    });

    // Check if the last message is from assistant and is truly empty (no content received yet)
    const lastMessage = $derived(messages[messages.length - 1]);
    const isLastMessageEmptyAssistant = $derived(lastMessage && 
        (lastMessage.role === 'assistant' || lastMessage.role === 'system') && 
        (!lastMessage.content || lastMessage.content.trim() === ''));
    
    // Only show loading indicator if we're loading AND there's no empty assistant message already
    const shouldShowLoadingIndicator = $derived(isLoading && !isLastMessageEmptyAssistant);
    
    // Show loading dots inside message if it's empty and we're loading
    const shouldShowLoadingInMessage = $derived(isLoading && isLastMessageEmptyAssistant);
</script>

<div class="h-full flex flex-col">
    <!-- File panel toggle button -->
    <button
        onclick={onToggleFilePanel}
        class="fixed top-24 right-6 z-20 bg-white bg-opacity-90 rounded-full p-2 shadow-md hover:bg-gray-100 transition-all"
        aria-label={showFilePanel ? "Hide files" : "Show files"}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        {#if !showFilePanel && selectedFiles.length > 0}
            <span class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedFiles.length}
            </span>
        {/if}
    </button>

    <!-- Scrollable messages area -->
    <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="max-w-3xl mx-auto p-4 pt-10 pr-16 space-y-6">
            {#each messages as message, index (index)}
                <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                    <div class="flex space-x-3 max-w-3xl {message.role === 'user' ? 'flex-row-reverse' : ''}">
                        <!-- Avatar -->
                        <div class="flex-none w-8 h-8 rounded-full overflow-hidden flex items-center justify-center
                            {message.role === 'user'
                                ? 'bg-black text-white'
                                : message.role === 'system'
                                  ? 'bg-gray-400'
                                  : 'bg-black text-white'}">
                            {#if message.role === "user"}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <circle cx="15.5" cy="8.5" r="1.5"/>
                                    <path d="M7 13h10"/>
                                </svg>
                            {/if}
                        </div>

                        <!-- Message content -->
                        <div class="px-3 py-2 rounded-lg {message.role === 'user'
                                ? 'bg-gray-100'
                                : message.role === 'system'
                                  ? 'text-gray-600 italic'
                                  : 'bg-gray-50 border border-gray-200'}">
                            
                            {#if shouldShowLoadingInMessage && index === messages.length - 1}
                                <!-- Show loading indicator in the empty assistant message -->
                                <div class="flex items-center">
                                    <div class="flex space-x-1">
                                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                                    </div>
                                    <span class="ml-2 text-xs text-gray-500">Analyzing files...</span>
                                </div>
                            {:else}
                                <!-- Regular message content -->
                                <div class={message.role === "system" ? "text-sm italic" : "text-sm"}>
                                    {@html renderMessageContent(message.content)}
                                </div>
                                {#if message.timestamp}
                                    <div class="text-xs mt-1 text-gray-500">
                                        {message.timestamp}
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}

            <!-- Loading indicator (only shown when loading and no empty assistant message exists) -->
            {#if shouldShowLoadingIndicator}
                <div class="flex justify-start">
                    <div class="flex space-x-3 max-w-3xl">
                        <div class="flex-none w-8 h-8 rounded-full overflow-hidden bg-black text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <circle cx="15.5" cy="8.5" r="1.5"/>
                                <path d="M7 13h10"/>
                            </svg>
                        </div>
                        <div class="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center">
                            <div class="flex space-x-1">
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                            </div>
                            <span class="ml-2 text-xs text-gray-500">Analyzing files...</span>
                        </div>
                    </div>
                </div>
            {/if}

            <div bind:this={messagesEnd}></div>
        </div>
    </div>
</div>