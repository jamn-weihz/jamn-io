import { palette } from "@mui/system";
import { MOBILE_WIDTH } from "./constants";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;
const year = 365 * day;

export const getTimeString = (time: number) => {
  const dTime = Date.now() - time;
  return (
    dTime > year 
    ? (dTime / year).toFixed(0) + 'yr'
    : dTime > month
      ? (dTime / month).toFixed(0) + 'mo'
      : dTime > week 
        ? (dTime / week).toFixed(0) + 'w'
        : dTime > day 
          ? (dTime / day).toFixed(0) + 'd'
          : dTime > hour
            ? (dTime / hour).toFixed(0) + 'h'
            : dTime > minute 
              ? (dTime / minute).toFixed(0) + 'min'
              : (dTime / second).toFixed(0) + 'sec'
  )
};


export const getAppbarWidth = (width: number) => {
  return width < MOBILE_WIDTH
    ? 39
    : 55
}
export const getColWidth = (width: number) => {
  return width < MOBILE_WIDTH 
    ? width - 42
    : Math.min(350, width - 60)
}

export const getColor = (mode: 'dark' | 'light', isReverse?: boolean) => {
  return isReverse
    ? mode === 'dark'
      ? 'dimgrey'
      : 'lavender'
    : mode === 'dark'
      ? 'lavender'
      : 'dimgrey';

}