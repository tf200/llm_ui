<script lang="ts">
    let { value = $bindable(), isLoading, onSubmit } = $props<{
        value: string;
        isLoading: boolean;
        onSubmit: (input: string) => void;
    }>();

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (value.trim() === "" || isLoading) return;
        
        const userInput = value;
        value = "";
        onSubmit(userInput);
    }
</script>

<div class="flex-none p-4 border-t border-gray-300 bg-white">
    <div class="max-w-3xl mx-auto">
        <form onsubmit={handleSubmit} class="relative">
            <div class="relative rounded-full bg-gray-100 border border-gray-300 flex items-center">
                <input
                    bind:value
                    type="text"
                    class="w-full rounded-full bg-transparent p-4 pr-12 text-black focus:outline-none"
                    placeholder="Ask about your files..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    aria-label="Send message"
                    class="absolute right-3 rounded-full p-2 {value.trim() && !isLoading
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500'}"
                    disabled={!value.trim() || isLoading}
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
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </form>
    </div>
</div>
