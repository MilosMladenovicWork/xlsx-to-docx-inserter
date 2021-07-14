import { ElectronPreloadFunctions } from "./preload";
export {};

declare global {
  interface Window {
    electron: ElectronPreloadFunctions;
  }
}
