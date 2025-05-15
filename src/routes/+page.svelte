<script>
  import Chat from "$lib/components/llmChat/Chat.svelte";
  import { goto } from "$app/navigation";

  function navigateToUpload() {
    goto("/upload");
  }
</script>

<div class="flex flex-col">
  <div class="p-4">
    <button
      onclick={navigateToUpload}
      class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
    >
      Go to Upload
    </button>
  </div>
  <Chat />
</div>
