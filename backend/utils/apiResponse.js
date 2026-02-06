// backend/utils/apiResponse.js

exports.successResponse = (data, meta = {}) => {
  return {
    success: true,
    data,
    meta: {
      generatedAt: new Date().toISOString(),
      version: "v1",
      ...meta
    }
  };
};
