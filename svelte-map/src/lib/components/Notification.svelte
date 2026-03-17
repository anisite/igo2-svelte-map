<script>
  import { notification } from '../stores/map.js';
</script>

{#if $notification}
  <div class="notification {$notification.type}" role="alert" aria-live="assertive">
    <span class="notif-icon" aria-hidden="true">
      {#if $notification.type === 'success'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      {:else if $notification.type === 'error'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {/if}
    </span>
    {$notification.message}
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    z-index: 10000;
    pointer-events: none;
    animation: slideUp 0.25s ease-out;
    max-width: calc(100vw - 32px);
    box-shadow: 0 4px 16px rgba(34, 54, 84, 0.25);
  }

  .notif-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  /* Couleurs fonctionnelles design.quebec.ca */
  .info {
    background: var(--qc-blue);
  }

  .success {
    background: var(--qc-green);
  }

  .error {
    background: var(--qc-red);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  /* Sur mobile, la notification remonte au-dessus du bottom sheet */
  @media (max-width: 768px) {
    .notification {
      bottom: 80px;
      font-size: 13px;
      padding: 10px 16px;
    }
  }
</style>
