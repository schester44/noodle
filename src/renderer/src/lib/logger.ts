function createLogger({ enabled = true }: { enabled: boolean }) {
  return {
    log: enabled ? console.log : () => {},
    error: enabled ? console.error : () => {}
  };
}

export const logger = createLogger({ enabled: import.meta.env.DEV });
