export const filterListOut = (arr, removedValues) => {
  let filteredArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (!removedValues.includes(arr[i])) {
      filteredArr.push(arr[i]);
    }
  }
  return filteredArr;
};
