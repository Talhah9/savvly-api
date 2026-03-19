const successResponse = (data, message = 'OK') => ({ success: true, message, data })
const errorResponse = (message, details = null) => ({ success: false, message, ...(details && { details }) })
module.exports = { successResponse, errorResponse }
