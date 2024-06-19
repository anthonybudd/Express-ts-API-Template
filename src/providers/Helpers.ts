const ucFirst = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
const lcFirst = (string: string) => string.charAt(0).toLowerCase() + string.slice(1);

export {
    ucFirst,
    lcFirst,
};