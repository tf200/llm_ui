<script lang="ts">
  import Navbar from "$lib/components/navBar/Navbar.svelte";
  import "../app.css";
</script>

<div class="h-screen flex flex-col bg-gray-50">
  <Navbar />
  
  <main class="flex-1 min-h-0">
    <slot />
  </main>
</div>
