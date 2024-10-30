import {
  NearyFormatType,
  NearyResponseType,
  NearyTargetDistanceType,
  NearyTargetType,
} from "./Neary";

/**
 *
 * Compare two arrays of numbers
 *
 * @param a1 Array of numbers
 * @param a2 Array of numbers
 * @returns boolean
 */
function areEquals(a1: NearyResponseType, a2: NearyResponseType) {
  return JSON.stringify(a1) == JSON.stringify(a2);
}

function throttle(func: (args?: any) => any, timeFrame: number) {
  var lastTime: any = 0;
  return function (...args: any) {
    var now = new Date() as unknown as number;
    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}

function formatTarget(target?: NearyTargetType) {
  if (typeof target === "undefined") {
    throw new Error("NearyJS - Target is required");
  }
  if (typeof target === "string") {
    var node = document.querySelector(target);
    if (node) {
      return node;
    } else {
      throw new Error("NearyJS - Target not found");
    }
  }
  if (target instanceof Element) {
    return target;
  }
}

function formatDistance(distance?: NearyTargetDistanceType) {
  const defaultDistance = { x: 0, y: 0 };
  if (distance !== undefined) {
    if (typeof distance === "number") {
      return { x: distance, y: distance };
    }
    if (
      typeof distance === "object" &&
      distance.hasOwnProperty("x") &&
      typeof distance.x === "number" &&
      distance.hasOwnProperty("y") &&
      typeof distance.y === "number"
    ) {
      return distance;
    }
    return defaultDistance;
  }
  return defaultDistance;
}

function formatProximity(format: NearyFormatType, value?: number) {
  if (format === "boolean") {
    return true;
  }
  return value ? value : 1;
}

function defaultProximity(format: NearyFormatType) {
  if (format === "boolean") {
    return false;
  }
  return 0;
}

export {
  throttle,
  areEquals,
  formatTarget,
  formatDistance,
  formatProximity,
  defaultProximity,
};
