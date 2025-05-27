
<script lang="ts">
    import { onMount } from "svelte";
    import { listFiles } from "$lib/services/files";
    import { sendMessageSSE } from "$lib/services/chat";
    import { page } from "$app/state";
    import ChatInput from "./ChatInput.svelte";
    import ChatMessages from "./ChatMessages.svelte";
    import FilePanel from "./FilePanel.svelte";
    import EmptyState from "./EmptyState.svelte";
    import type { ChatMessage } from "./types";
    import type { FileListResponse } from "$lib/types/files";

    let session_id = page.url.searchParams.get("session_id");

    // Reactive state
    let messages = $state<ChatMessage[]>([]);
    let input = $state("");
    let isLoading = $state(false);
    let showFilePanel = $state(false);
    let filesLoading = $state(false);

    // Files state - now it's an array of FileListResponse
    let fileList = $state<FileListResponse[]>([]);
    
    let selectedFiles = $state<string[]>([]);

    // Load initial files
    async function loadInitialFiles() {
        filesLoading = true;
        try {
            fileList = await listFiles();
            // Select all files by default
            selectedFiles = fileList.map(file => file.file_id);
        } catch (error) {
            console.error("Failed to load files:", error);
        } finally {
            filesLoading = false;
        }
    }

    onMount(() => {
        loadInitialFiles();
        
        // Set header height CSS variable
        const header = document.querySelector("header");
        if (header) {
            const headerHeight = header.offsetHeight;
            document.documentElement.style.setProperty(
                "--header-height",
                `${headerHeight}px`,
            );
        } else {
            document.documentElement.style.setProperty(
                "--header-height",
                "64px",
            );
        }
    });

    // Handle form submission
    async function handleSubmit(userInput: string) {
        if (userInput.trim() === "" || isLoading) return;

        const userMessage = {
            role: "user" as const,
            content: userInput,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        messages = [...messages, userMessage];
        isLoading = true;

        try {
            // Add empty assistant message
            const initialAssistantMessage = {
                role: "assistant" as const,
                content: "",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            messages = [...messages, initialAssistantMessage];

            const sseStream = sendMessageSSE({
                message: userInput,
            });

            // Keep track of accumulated content
            let accumulatedContent = "";

            for await (const event of sseStream) {
                if (event.event === "message" && event.data.delta) {
                    // Accumulate content and create new message object
                    accumulatedContent += event.data.delta;
                    
                    messages = [
                        ...messages.slice(0, -1),
                        {
                            ...initialAssistantMessage,
                            content: accumulatedContent
                        }
                    ];
                } else if (event.event === "error") {
                    accumulatedContent += `\n\nError: ${event.data.error || "Something went wrong"}`;
                    
                    messages = [
                        ...messages.slice(0, -1),
                        {
                            ...initialAssistantMessage,
                            content: accumulatedContent
                        }
                    ];
                }
            }
        } catch (error) {
            console.error("Error in chat stream:", error);
            const errorMessage = {
                role: "assistant" as const,
                content: `Error: ${error instanceof Error ? error.message : "Failed to connect to the assistant"}`,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            messages = [...messages, errorMessage];
        } finally {
            isLoading = false;
        }
    }

    function toggleFileSelection(file: string) {
        if (selectedFiles.includes(file)) {
            selectedFiles = selectedFiles.filter(f => f !== file);
        } else {
            selectedFiles = [...selectedFiles, file];
        }
    }

    function toggleFilePanel() {
        showFilePanel = !showFilePanel;
    }
</script>

<div class="h-full flex flex-col bg-white text-black">
    {#if messages.length === 0}
        <EmptyState 
            {fileList}
            {selectedFiles}
            {filesLoading}
            {input}
            {isLoading}
            bind:inputValue={input}
            onSubmit={handleSubmit}
            onToggleFileSelection={toggleFileSelection}
        />
    {:else}
        <div class="flex-1 min-h-0 flex flex-col">
            <div class="flex-1 min-h-0">
                <ChatMessages 
                    {messages}
                    {isLoading}
                    {showFilePanel}
                    {selectedFiles}
                    onToggleFilePanel={toggleFilePanel}
                />
            </div>
            
            <FilePanel 
                {showFilePanel}
                {fileList}
                {selectedFiles}
                {filesLoading}
                onToggleFilePanel={toggleFilePanel}
                onToggleFileSelection={toggleFileSelection}
            />

            <div class="flex-shrink-0">
                <ChatInput 
                    bind:value={input}
                    {isLoading}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    {/if}
</div>