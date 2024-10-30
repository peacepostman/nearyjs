import {
  throttle,
  areEquals,
  formatTarget,
  formatDistance,
  formatProximity,
  defaultProximity,
} from "./Utils";

export type NearyTargetDistanceType = number | { x: number; y: number };
export type NearyTargetType = Element | string;
export type NearyFormatType = "boolean" | "number";
export type NearyProximityType = boolean | number;
export type NearyResponseType = NearyProximityType[];

export type NearyElementType = {
  /**
   * A node ref
   */
  target: NearyTargetType;
  /**
   * Distance in pixel around element, default is 0
   */
  distance?: NearyTargetDistanceType;
  /**
   * Callback function to call when element is in proximity
   */
  onProximity?: (data: NearyProximityType) => void;
};
export interface NearyConfigType {
  /**
   * An array of element on which we must detect proximity
   */
  elements: NearyElementType | NearyElementType[];
  /**
   * Boolean to enable listener, default is true
   */
  enabled?: boolean;
  /**
   * Determine the return type of the function
   * Default is boolean
   *
   * Boolean: return boolean value for elements. True means in proximity and false means not in proximity
   * Array: return array of numeric values between 0 and 1 for elements. Zero means not in proximity and 1 means in proximity
   */
  format?: NearyFormatType;
  /**
   * Callback function to call when movement occurs
   */
  onChange?: (values: NearyResponseType) => void;
}

function Neary(options: NearyConfigType) {
  if (typeof options.enabled === "undefined") {
    options.enabled = true;
  }
  if (typeof options.format === "undefined") {
    options.format = "boolean";
  }
  if (!Array.isArray(options.elements)) {
    options.elements = [options.elements];
  }

  const { enabled, elements, format, onChange } = options;
  let previousData: NearyResponseType = [];

  function proximity(event: MouseEvent) {
    const { pageX: mouseX, pageY: mouseY } = event;

    const newData: NearyResponseType = [];

    if (elements.length > 0) {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        const target = formatTarget(element.target);
        const distance = formatDistance(element.distance);

        if (target) {
          let isInProximity: NearyProximityType = defaultProximity(format);
          let rect = target.getBoundingClientRect();
          let { left, top, right, bottom } = {
            top: rect?.top + window.scrollY,
            right: rect?.right + window.scrollX,
            bottom: rect?.bottom + window.scrollY,
            left: rect?.left + window.scrollX,
          };

          if (
            mouseX >= left - distance.x &&
            mouseX <= right + distance.x &&
            mouseY >= top - distance.y &&
            mouseY <= bottom + distance.y
          ) {
            isInProximity = formatProximity(format, 1);
            target.setAttribute("data-neary-proximity", "true");
          } else {
            target.setAttribute("data-neary-proximity", "false");
          }

          if (element.onProximity) {
            element.onProximity(isInProximity);
          }

          newData.push(isInProximity);
        } else {
          newData.push(defaultProximity(format));
        }
      }
    }
    if (onChange) {
      /**
       * Only emit change if data is different from previous data
       */
      if (previousData.length === 0 || !areEquals(newData, previousData)) {
        onChange(newData);
        previousData = newData;
      }
    }
  }

  if (elements) {
    if (enabled) {
      const throttleProximity = throttle(proximity, 300);
      document.addEventListener("mousemove", throttleProximity);
      return () => document.removeEventListener("mousemove", throttleProximity);
    } else {
      if (onChange) {
        onChange(new Array(elements.length).fill(defaultProximity(format)));
      }
    }
  }
}

export default Neary;
