import { useEffect } from 'react';

const DATA_SYNC_EVENT = 'eventsync:data-changed';

/**
 * Dispatches a global data synchronization event to notify all active React components
 * that data has been mutated (created, updated, or deleted) on the backend.
 */
export const notifyDataChanged = () => {
  window.dispatchEvent(new CustomEvent(DATA_SYNC_EVENT));
};

/**
 * Custom React hook to subscribe to global data synchronization events.
 * Executes the provided callback whenever an event/participant CRUD operation succeeds anywhere in the app.
 */
export const useDataSyncListener = (onDataChanged) => {
  useEffect(() => {
    const handleSync = () => {
      if (typeof onDataChanged === 'function') {
        onDataChanged();
      }
    };

    window.addEventListener(DATA_SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(DATA_SYNC_EVENT, handleSync);
    };
  }, [onDataChanged]);
};
