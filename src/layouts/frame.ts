import type { InjectionKey } from 'vue'

/** Told by the frame to what it holds (the side drawers): whether a rail sits at the left edge to leave room for. */
export const FRAME_HAS_RAIL: InjectionKey<boolean> = Symbol('frame-has-rail')
