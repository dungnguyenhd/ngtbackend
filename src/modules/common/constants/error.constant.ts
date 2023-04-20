//Validate
export const WRONG_PASSWORD = {
  code: 1003,
  messageCode: 'Email or password are incorrect',
};
export const WRONG_USER_NAME = {
  code: 1004,
  messageCode: 'Email or password are incorrect',
};
export const EMAIL_NOT_FOUND = {
  code: 1005,
  messageCode: 'This email is not registered',
};
export const LINK_EXPIRED = { code: 1006, messageCode: 'Link expired' };
export const USER_BLOCKED = {
  code: 1007,
  messageCode: 'Your account locked by the administrator',
};
export const DUPLICATE_EMAIL = {
  code: 1008,
  messageCode: 'This email already exists',
};
export const USER_NOT_FOUND = { code: 1009, messageCode: 'User not found' };
export const USER_NOT_VERIFIED = {
  code: 1010,
  messageCode: 'This email is not verified',
};

// Not found
export const CHAMPION_NOT_FOUND = { code: 1050, message: 'Champion not found' };

// Is crawl
export const NOT_CRAWL_ALL = { code: 1101, message: "Hasn't crawl all yet" };
export const NEED_TO_CRAWL_ALL_NEW_PATCH = {
  code: 1102,
  message:
    'New items, spells, runes is missing. Need to crawl all to get new patch',
};

// provider
export const PROVIDER_NOT_FOUND = { code: 1201, message: 'Provider not found' };

// product
export const PRODUCT_NOT_FOUND = { code: 1301, message: 'Product not found' };
export const PRODUCT_DUPLICATE = {
  code: 1302,
  message: 'Product name already exist',
};

// order
export const ORDER_NOT_FOUND = { code: 1401, message: 'Order not found' };
