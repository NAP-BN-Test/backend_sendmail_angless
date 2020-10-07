const Constant = require('../constants/constant');

module.exports = {
    ERROR_RESULT: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.SYS_ERROR
    },

    NO_DATA_RESULT: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.DATA_NOT_FOUND
    },

    SYS_ERROR_RESULT: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.SYS_ERROR
    },

    LOGIN_FAIL: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.LOGIN_FAIL
    },

    ACTION_SUCCESS: {
        status: Constant.STATUS.SUCCESS,
        message: Constant.MESSAGE.ACTION_SUCCESS
    },

    NO_PERMISSION: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.NO_PERMISSION
    },

    INVALID_USER: {
        status: Constant.STATUS.FAIL,
        message: Constant.MESSAGE.INVALID_USER
    },
}


