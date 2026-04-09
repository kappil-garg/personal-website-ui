import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

/**
 * Starts a countdown timer that decrements the provided signal once per second.
 * The countdown runs for exactly `seconds` ticks and cleans up automatically when the hosting component is destroyed.
 *
 * @param seconds        Total number of seconds to count down from
 * @param countdownSignal Writable signal that will be updated each tick and reset to 0 on completion
 * @param destroyRef     Component DestroyRef used to cancel the interval on component destruction
 */
export function startRateLimitCountdown(
  seconds: number,
  countdownSignal: WritableSignal<number>,
  destroyRef: DestroyRef
): void {
  if (seconds <= 0) {
    return;
  }
  countdownSignal.set(seconds);
  interval(1000).pipe(
    take(seconds),
    takeUntilDestroyed(destroyRef)
  ).subscribe({
    next: () => countdownSignal.update(v => Math.max(0, v - 1)),
    complete: () => countdownSignal.set(0)
  });
}
