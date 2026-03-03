const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const GRAY = "\x1b[90m";
const RESET = "\x1b[0m";

export const log = {
  info(message: string, ...args: unknown[]): void {
    process.stdout.write(`${CYAN}[INFO]${RESET} ${message}\n`);
    if (args.length > 0) {
      process.stdout.write(args.map(String).join(" ") + "\n");
    }
  },

  error(message: string, ...args: unknown[]): void {
    process.stderr.write(`${RED}[ERROR]${RESET} ${message}\n`);
    if (args.length > 0) {
      process.stderr.write(args.map(String).join(" ") + "\n");
    }
  },

  debug(message: string, ...args: unknown[]): void {
    if (!process.env.DEBUG) return;
    process.stdout.write(`${GRAY}[DEBUG]${RESET} ${message}\n`);
    if (args.length > 0) {
      process.stdout.write(args.map(String).join(" ") + "\n");
    }
  },
};
