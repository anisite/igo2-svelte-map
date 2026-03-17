<script>
  import { notification } from '../stores/map.js';
</script>

{#if $notification}
  <div class="notification {$notification.type}">
    {$notification.message}
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    color: white;
    z-index: 10000;
    pointer-events: none;
    animation: slideUp 0.3s ease-out;
    max-width: 400px;
    text-align: center;
  }

  .info {
    background: rgba(0, 161, 222, 0.9);
  }

  .success {
    background: rgba(46, 204, 113, 0.9);
  }

  .error {
    background: rgba(231, 76, 60, 0.9);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
