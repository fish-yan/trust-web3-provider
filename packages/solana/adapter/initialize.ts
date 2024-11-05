import { registerWallet } from './register';
import { ONTOWallet } from './wallet';
import type { ISolanaProvider } from './window';

export function initialize(ONTO: ISolanaProvider): void {
    registerWallet(new ONTOWallet(ONTO));
}
