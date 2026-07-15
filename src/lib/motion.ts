import type { Transition } from "framer-motion";

/** Small, high-frequency UI feedback: hover lifts, nav pills, button press. */
export const springUI: Transition = { type: "spring", stiffness: 500, damping: 35, mass: 0.9 };

/** Larger movements: page transitions, panels entering/leaving. */
export const springPage: Transition = { type: "spring", stiffness: 380, damping: 32, mass: 0.8 };
